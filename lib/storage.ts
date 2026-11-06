import 'server-only';

import { createHash } from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { get, list, put } from '@vercel/blob';

/**
 * Almacenamiento servidor para pedidos, stock y tokens.
 *
 * En producción usa una Blob store privada de Vercel. En desarrollo, si no hay
 * credenciales de Blob, usa la carpeta .data/ para poder probar todo en local.
 * Nunca escribe en el sistema de ficheros de producción: si falta la Blob store,
 * falla de forma explícita para no perder pedidos.
 */

const DATA_DIR = path.join(process.cwd(), '.data');

export class PreconditionFailedError extends Error {
  constructor(message = 'El documento ha cambiado desde que se leyó.') {
    super(message);
    this.name = 'PreconditionFailedError';
  }
}

export class AlreadyExistsError extends Error {
  constructor(message = 'El documento ya existe.') {
    super(message);
    this.name = 'AlreadyExistsError';
  }
}

export interface StoredDocument<T> {
  data: T;
  etag: string;
}

export interface WriteOptions {
  etag?: string;
  createOnly?: boolean;
}

export interface ListedDocument<T> {
  pathname: string;
  data: T;
}

function useBlobStorage(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

function assertStorageAvailable(): void {
  if (!useBlobStorage() && process.env.NODE_ENV === 'production') {
    throw new Error(
      'Falta la Blob store de Vercel. Configura BLOB_READ_WRITE_TOKEN o BLOB_STORE_ID antes de vender.'
    );
  }
}

function safePath(pathname: string): string {
  const normalized = pathname.replace(/\\/g, '/').replace(/^\/+/, '');
  const absolute = path.resolve(DATA_DIR, normalized);
  const root = path.resolve(DATA_DIR);
  if (!absolute.startsWith(root + path.sep) && absolute !== root) {
    throw new Error('Ruta de almacenamiento no permitida.');
  }
  return absolute;
}

function hashContent(content: string): string {
  return '"' + createHash('sha1').update(content).digest('hex') + '"';
}

function isPreconditionError(error: unknown): boolean {
  const name = (error as { name?: string })?.name ?? '';
  const message = (error as { message?: string })?.message ?? '';
  return (
    name === 'BlobPreconditionFailedError' ||
    /precondition|if-match|etag/i.test(message)
  );
}

function isAlreadyExistsError(error: unknown): boolean {
  const message = (error as { message?: string })?.message ?? '';
  return /already exists|blob already|overwrite/i.test(message);
}

async function readLocal<T>(pathname: string): Promise<StoredDocument<T> | null> {
  assertStorageAvailable();
  try {
    const content = await fs.readFile(safePath(pathname), 'utf8');
    return { data: JSON.parse(content) as T, etag: hashContent(content) };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw error;
  }
}

async function writeLocal<T>(
  pathname: string,
  data: T,
  options: WriteOptions = {}
): Promise<string> {
  assertStorageAvailable();
  const file = safePath(pathname);
  const content = JSON.stringify(data);
  const current = await readLocal<T>(pathname);

  if (options.createOnly && current) throw new AlreadyExistsError();
  if (options.etag && current?.etag !== options.etag) throw new PreconditionFailedError();

  await fs.mkdir(path.dirname(file), { recursive: true });
  const temp = `${file}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(temp, content, 'utf8');
  await fs.rm(file, { force: true });
  await fs.rename(temp, file);
  return hashContent(content);
}

async function readBlob<T>(pathname: string): Promise<StoredDocument<T> | null> {
  assertStorageAvailable();
  try {
    const result = await get(pathname, { access: 'private', useCache: false });
    if (!result || result.statusCode !== 200 || !result.stream) return null;
    const content = await new Response(result.stream).text();
    return { data: JSON.parse(content) as T, etag: result.blob.etag };
  } catch (error) {
    if ((error as { name?: string })?.name === 'BlobNotFoundError') return null;
    throw error;
  }
}

async function writeBlob<T>(
  pathname: string,
  data: T,
  options: WriteOptions = {}
): Promise<string> {
  assertStorageAvailable();
  try {
    const result = await put(pathname, JSON.stringify(data), {
      access: 'private',
      addRandomSuffix: false,
      allowOverwrite: !options.createOnly,
      contentType: 'application/json',
      cacheControlMaxAge: 60,
      ...(options.etag ? { ifMatch: options.etag } : {}),
    });
    return result.etag;
  } catch (error) {
    if (isPreconditionError(error)) throw new PreconditionFailedError();
    if (options.createOnly && isAlreadyExistsError(error)) throw new AlreadyExistsError();
    throw error;
  }
}

export async function readJson<T>(pathname: string): Promise<StoredDocument<T> | null> {
  return useBlobStorage() ? readBlob<T>(pathname) : readLocal<T>(pathname);
}

export async function writeJson<T>(
  pathname: string,
  data: T,
  options: WriteOptions = {}
): Promise<string> {
  return useBlobStorage()
    ? writeBlob<T>(pathname, data, options)
    : writeLocal<T>(pathname, data, options);
}

/**
 * Actualiza un documento con reintentos si otro proceso lo ha modificado.
 * `mutator` debe ser puro: recibe una copia y devuelve la nueva versión.
 */
export async function updateJson<T>(
  pathname: string,
  fallback: T,
  mutator: (current: T) => T,
  attempts = 12
): Promise<T> {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const stored = await readJson<T>(pathname);
    const current = stored?.data ?? fallback;
    const next = mutator(structuredClone(current));
    try {
      await writeJson(pathname, next, stored ? { etag: stored.etag } : { createOnly: true });
      return next;
    } catch (error) {
      if (error instanceof PreconditionFailedError) continue;
      if (error instanceof AlreadyExistsError) continue;
      throw error;
    }
  }
  throw new PreconditionFailedError(
    'No se ha podido actualizar el documento por concurrencia. Inténtalo de nuevo.'
  );
}

async function listLocal<T>(prefix: string): Promise<ListedDocument<T>[]> {
  assertStorageAvailable();
  const root = safePath(prefix);
  const results: ListedDocument<T>[] = [];

  async function walk(directory: string): Promise<void> {
    let entries;
    try {
      entries = await fs.readdir(directory, { withFileTypes: true });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return;
      throw error;
    }
    for (const entry of entries) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        await walk(absolute);
      } else if (entry.isFile() && entry.name.endsWith('.json')) {
        const content = await fs.readFile(absolute, 'utf8');
        results.push({
          pathname: path.relative(DATA_DIR, absolute).replace(/\\/g, '/'),
          data: JSON.parse(content) as T,
        });
      }
    }
  }

  await walk(root);
  return results;
}

async function listBlob<T>(prefix: string): Promise<ListedDocument<T>[]> {
  assertStorageAvailable();
  const blobs: Array<{ pathname: string }> = [];
  let cursor: string | undefined;
  let hasMore = true;

  while (hasMore) {
    const page = await list({ prefix, limit: 1000, cursor });
    blobs.push(...page.blobs.map((blob) => ({ pathname: blob.pathname })));
    hasMore = page.hasMore;
    cursor = page.cursor;
  }

  const results: ListedDocument<T>[] = [];
  const chunkSize = 20;
  for (let index = 0; index < blobs.length; index += chunkSize) {
    const chunk = blobs.slice(index, index + chunkSize);
    const documents = await Promise.all(
      chunk.map(async (blob) => {
        const stored = await readBlob<T>(blob.pathname);
        return stored ? { pathname: blob.pathname, data: stored.data } : null;
      })
    );
    documents.forEach((document) => {
      if (document) results.push(document);
    });
  }
  return results;
}

export async function listJson<T>(prefix: string): Promise<ListedDocument<T>[]> {
  return useBlobStorage() ? listBlob<T>(prefix) : listLocal<T>(prefix);
}

export async function deleteJson(pathname: string): Promise<void> {
  assertStorageAvailable();
  if (useBlobStorage()) {
    const { del } = await import('@vercel/blob');
    await del(pathname);
    return;
  }
  await fs.rm(safePath(pathname), { force: true });
}
