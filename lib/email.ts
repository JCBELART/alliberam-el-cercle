import 'server-only';

import fs from 'fs';
import path from 'path';
import { Resend } from 'resend';
import { generateDiplomaBuffer } from './generateDiploma';
import { generateInvoicePDF } from './generateInvoice';
import { formatEuros } from './pricing';
import type { Order } from './types';

function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://www.alliberamelcercle.digital'
  ).replace(/\/$/, '');
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function loadLogoBase64(): string {
  try {
    const logoPath = path.join(process.cwd(), 'public', 'LOGO_NEGRE.png');
    return `data:image/png;base64,${fs.readFileSync(logoPath).toString('base64')}`;
  } catch {
    return '';
  }
}

export async function buildOrderPdfs(order: Order): Promise<{
  certificate: Buffer;
  invoice: Buffer | null;
}> {
  const firstToken = order.items[0]?.token;
  const verifyUrl = firstToken
    ? `${siteUrl()}/experiencia?token=${encodeURIComponent(firstToken)}`
    : `${siteUrl()}/experiencia`;

  const certificate = await generateDiplomaBuffer({
    buyerName: order.personalizedName || order.customer.name,
    orderNumber: order.id,
    dateStr: formatDate(order.paidAt || order.createdAt),
    bottles: order.items.map((item) => ({
      label: item.labelName,
      wineType: item.wineType,
      serial: item.serial,
      batch: item.batch,
      token: item.token,
    })),
    verifyUrl,
    batchSize: 500,
  });

  let invoice: Buffer | null = null;
  if (order.invoice) {
    invoice = Buffer.from(
      await generateInvoicePDF({
        orderId: order.id,
        customerName: order.invoice.name,
        customerEmail: order.customer.email,
        companyName: order.invoice.name,
        companyNif: order.invoice.taxId,
        companyAddress: `${order.invoice.address}, ${order.invoice.postalCode} ${order.invoice.city}`,
        amount: order.total / 100,
        date: formatDate(order.paidAt || order.createdAt),
      })
    );
  }

  return { certificate, invoice };
}

export async function sendOrderEmail(order: Order): Promise<{ id?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('Falta RESEND_API_KEY.');

  const resend = new Resend(apiKey);
  const { certificate, invoice } = await buildOrderPdfs(order);
  const logoBase64 = loadLogoBase64();
  const firstName = order.customer.name.split(' ')[0] || order.customer.name;
  const experienceToken = order.items[0]?.token;
  const experienceUrl = experienceToken
    ? `${siteUrl()}/experiencia?token=${encodeURIComponent(experienceToken)}`
    : `${siteUrl()}`;
  const bottleRows = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding: 7px 0; border-bottom: 1px solid #2b2b2b; color: #d4af37; font-weight: bold; text-align: left;">
            Nº ${String(item.serial).padStart(3, '0')}
          </td>
          <td style="padding: 7px 0; border-bottom: 1px solid #2b2b2b; color: #eeeeee; text-align: left;">
            ${escapeHtml(item.labelName)}
          </td>
          <td style="padding: 7px 0; border-bottom: 1px solid #2b2b2b; color: #bbbbbb; text-align: right;">
            ${item.wineType === 'NEGRE' ? 'VI NEGRE' : 'VI BLANC'}
          </td>
        </tr>`
    )
    .join('');

  const html = `
    <div style="background-color: #111111; padding: 40px 20px; font-family: 'Helvetica Neue', Arial, sans-serif; color: #f5f5f5; text-align: center;">
      <div style="max-width: 620px; margin: 0 auto; background-color: #1c1c1c; border: 1px solid #333333; border-radius: 10px; overflow: hidden; padding: 40px 32px; text-align: center;">
        <div style="margin-bottom: 28px; text-align: center;">
          ${logoBase64 ? `<img src="${logoBase64}" alt="El Cercle" style="width: 130px; height: auto; display: block; margin: 0 auto 15px auto;" />` : ''}
          <h1 style="color: #d4af37; font-size: 22px; letter-spacing: 3px; margin: 0; font-weight: 300;">EL CERCLE</h1>
          <p style="color: #888888; font-size: 11px; letter-spacing: 2px; margin-top: 5px; text-transform: uppercase;">EDICIÓ COMMEMORATIVA I LIMITADA 2026</p>
        </div>

        <div style="font-size: 15px; line-height: 1.65; color: #cccccc; text-align: center;">
          <p style="margin-bottom: 18px;">Benvolgut/da <strong style="color: #ffffff;">${escapeHtml(order.customer.name)}</strong>,</p>
          <p style="margin-bottom: 18px;">
            Gràcies per formar part d’aquesta edició limitada. Cada ampolla duu el teu nom, un número de col·lecció únic i un codi QR que t’obre una experiència personal.
          </p>

          <div style="background-color: #262626; border: 1px solid #333333; padding: 16px 20px; margin: 24px auto; border-radius: 6px; text-align: center; width: 90%;">
            <p style="margin: 0; color: #ffffff; font-size: 14px;"><strong>Referència de comanda:</strong> ${escapeHtml(order.id)}</p>
            <p style="margin: 8px 0 0 0; color: #d4af37; font-size: 13px;">Adjunt trobaràs el teu Certificat Oficial de Propietat${invoice ? ' i la factura' : ''} en format PDF.</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin: 22px 0 8px 0; font-size: 13px;">
            <thead>
              <tr>
                <th style="padding: 0 0 8px 0; color: #888888; font-size: 10px; text-align: left; letter-spacing: 1px;">Nº</th>
                <th style="padding: 0 0 8px 0; color: #888888; font-size: 10px; text-align: left; letter-spacing: 1px;">ETIQUETA</th>
                <th style="padding: 0 0 8px 0; color: #888888; font-size: 10px; text-align: right; letter-spacing: 1px;">VI</th>
              </tr>
            </thead>
            <tbody>${bottleRows}</tbody>
          </table>

          <p style="margin: 18px 0 0 0; color: #aaaaaa; font-size: 13px;">
            Total pagat: <strong style="color: #ffffff;">${formatEuros(order.total)}</strong>
          </p>

          <a href="${experienceUrl}" style="display: inline-block; margin: 26px 0 10px 0; padding: 15px 28px; background-color: #d4af37; color: #111111; text-decoration: none; border-radius: 100px; font-weight: bold; font-size: 13px; letter-spacing: 1px; text-transform: uppercase;">
            Obri la teva experiència El Cercle
          </a>

          <p style="margin: 18px 0 30px 0; color: #999999; font-size: 12px; line-height: 1.5;">
            També pots escanejar el QR de la teva ampolla quan la rebis.<br>
            Si necessites res, respon a aquest correu o truca’ns al 640 543 624.
          </p>
        </div>

        <div style="border-top: 1px solid #333333; padding-top: 20px; margin-top: 10px; text-align: center;">
          <p style="margin: 0; font-size: 13px; color: #888888;">Cordialment,</p>
          <p style="margin: 5px 0 5px 0; font-size: 14px; color: #d4af37; font-weight: bold;">L’equip d’Allibera’m</p>
          <p style="margin: 15px 0 5px 0; font-size: 14px; color: #ffffff; font-weight: bold;">JOAN CARLES BELTRÁN ARTOLA</p>
          <p style="margin: 0; font-size: 13px; color: #aaaaaa;">Tel: 640 543 624</p>
        </div>

        <div style="border-top: 1px solid #222222; padding-top: 18px; margin-top: 24px; text-align: center;">
          <p style="margin: 0; font-size: 10px; color: #666666; line-height: 1.5;">
            Aquest correu electrònic i els seus fitxers adjunts són confidencials i dirigits exclusivament al seu destinatari. Si l’heu rebut per error, notifiqueu-ho immediatament al remitent i elimineu-lo del vostre sistema.<br>
            Compliment de la normativa de protecció de dades (RGPD). Podeu exercir els vostres drets d’accés, rectificació i supressió contactant amb nosaltres.<br>
            Consum responsable. Venda exclusiva a persones majors de 18 anys.<br>
            &copy; 2026 ALLIBERA’M - EL CERCLE. Tots els drets reservats.
          </p>
        </div>
      </div>
    </div>
  `;

  const attachments: Array<{ filename: string; content: Buffer }> = [
    {
      filename: `Certificat_El_Cercle_${order.id}.pdf`,
      content: certificate,
    },
  ];
  if (invoice) {
    attachments.push({
      filename: `Factura_El_Cercle_${order.id}.pdf`,
      content: invoice,
    });
  }

  const result = await resend.emails.send({
    from: process.env.RESEND_FROM || 'El Cercle <onboarding@resend.dev>',
    to: [order.customer.email],
    ...(process.env.RESEND_BCC ? { bcc: [process.env.RESEND_BCC] } : {}),
    replyTo: process.env.RESEND_REPLY_TO || 'hola@alliberamelcercle.digital',
    subject: `El Cercle · ${firstName}, la teva ampolla numerada ja és teva`,
    html,
    attachments,
  });

  if (result.error) {
    throw new Error(result.error.message || 'Resend ha rebutjat l’enviament.');
  }

  return { id: result.data?.id };
}
