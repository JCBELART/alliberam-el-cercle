'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { WineType } from '../lib/types';

interface ARExperienceProps {
  labelImage: string;
  labelName: string;
  serial: number;
  wineType: WineType;
}

const FALLBACK_MESSAGES = [
  'El teu navegador no pot obrir la càmera en realitat augmentada.',
  'Pots veure l_ampolla en 3D aquí mateix o obrir aquesta pàgina amb Chrome a Android.',
];

/**
 * Visor 3D + Realitat Augmentada amb WebXR.
 *
 * - En mòbils compatibles (Chrome Android) obre la càmera i col·loca l'ampolla
 *   sobre una superfície real mitjançant hit-test.
 * - En navegadors sense WebXR mostra una previsualització 3D interactiva.
 */
export default function ARExperience({ labelImage, labelName, serial, wineType }: ARExperienceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<'loading' | 'ready' | 'ar' | 'error'>('loading');
  const [arSupported, setArSupported] = useState(false);
  const [message, setMessage] = useState<string>('Preparant l_experiència...');

  const startArRef = useRef<(() => Promise<void>) | null>(null);

  useEffect(() => {
    let disposed = false;
    let renderer: any = null;
    let scene: any = null;
    let camera: any = null;
    let bottleGroup: any = null;
    let particles: any = null;
    let reticle: any = null;
    let session: any = null;
    let hitTestSource: any = null;
    let localSpace: any = null;
    let placed = false;
    let clock: any = null;

    async function init() {
      try {
        const THREE = await import('three');
        if (disposed || !containerRef.current) return;

        const container = containerRef.current;
        const width = container.clientWidth || 600;
        const height = container.clientHeight || 520;

        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(38, width / height, 0.01, 100);
        camera.position.set(0, 1.25, 4.4);
        camera.lookAt(0, 1.05, 0);

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(width, height);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.05;
        renderer.xr.enabled = true;
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
        renderer.domElement.style.display = 'block';
        renderer.domElement.style.borderRadius = '24px';
        container.appendChild(renderer.domElement);

        // --- Il·luminació ---
        scene.add(new THREE.HemisphereLight(0xffffff, 0x201408, 1.15));
        const key = new THREE.DirectionalLight(0xfff4d6, 2.2);
        key.position.set(3, 6, 4);
        scene.add(key);
        const rim = new THREE.PointLight(0xd4af37, 14, 12, 2);
        rim.position.set(-2.2, 2.4, -2);
        scene.add(rim);
        const fill = new THREE.PointLight(0x8fd0ff, 6, 10, 2);
        fill.position.set(2.4, 1.2, -1.6);
        scene.add(fill);

        // --- Ampolla ---
        bottleGroup = new THREE.Group();

        const profile: Array<[number, number]> = [
          [0.0, 0.0],
          [0.27, 0.0],
          [0.33, 0.05],
          [0.35, 0.32],
          [0.36, 0.62],
          [0.36, 1.16],
          [0.33, 1.34],
          [0.22, 1.5],
          [0.15, 1.62],
          [0.145, 1.92],
          [0.145, 2.06],
          [0.17, 2.12],
          [0.17, 2.16],
          [0.0, 2.16],
        ];
        const lathePoints = profile.map(([x, y]) => new THREE.Vector2(x, y));
        const glassColor = wineType === 'NEGRE' ? 0x2a0d14 : 0x14361f;
        const glass = new THREE.Mesh(
          new THREE.LatheGeometry(lathePoints, 64),
          new THREE.MeshPhysicalMaterial({
            color: glassColor,
            roughness: 0.08,
            metalness: 0.15,
            clearcoat: 1,
            clearcoatRoughness: 0.05,
            transmission: 0.18,
            transparent: true,
            opacity: 0.97,
          })
        );
        bottleGroup.add(glass);

        // Aigua/alcohol interior
        const liquid = new THREE.Mesh(
          new THREE.LatheGeometry(profile.map(([x, y]) => new THREE.Vector2(x * 0.93, y)).slice(0, 6), 48),
          new THREE.MeshPhysicalMaterial({
            color: wineType === 'NEGRE' ? 0x5b1020 : 0xd8c26a,
            transmission: 0.55,
            roughness: 0.25,
            transparent: true,
            opacity: 0.85,
          })
        );
        bottleGroup.add(liquid);

        // Càpsula daurada
        const capsule = new THREE.Mesh(
          new THREE.CylinderGeometry(0.155, 0.155, 0.28, 32),
          new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.22 })
        );
        capsule.position.y = 2.02;
        bottleGroup.add(capsule);

        // Suro
        const cork = new THREE.Mesh(
          new THREE.CylinderGeometry(0.15, 0.15, 0.1, 24),
          new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.9 })
        );
        cork.position.y = 2.2;
        bottleGroup.add(cork);

        // Etiqueta
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(
          labelImage,
          (texture: any) => {
            if (disposed) return;
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.anisotropy = 4;
            const label = new THREE.Mesh(
              new THREE.CylinderGeometry(0.363, 0.363, 0.72, 64, 1, true),
              new THREE.MeshStandardMaterial({
                map: texture,
                roughness: 0.55,
                metalness: 0.05,
                side: THREE.DoubleSide,
              })
            );
            label.position.y = 0.92;
            label.rotation.y = Math.PI;
            bottleGroup.add(label);
          },
          undefined,
          () => {
            // si la imatge no carrega, no passa res
          }
        );

        // Anella daurada a la base
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(0.31, 0.012, 12, 80),
          new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 1, roughness: 0.15, emissive: 0x5a4200 })
        );
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 0.06;
        bottleGroup.add(ring);

        bottleGroup.position.y = 0;
        bottleGroup.visible = false;
        scene.add(bottleGroup);

        // --- Partícules daurades ---
        const particleCount = 220;
        const positions = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i += 1) {
          const radius = 0.8 + Math.random() * 1.8;
          const angle = Math.random() * Math.PI * 2;
          positions[i * 3] = Math.cos(angle) * radius;
          positions[i * 3 + 1] = Math.random() * 2.6;
          positions[i * 3 + 2] = Math.sin(angle) * radius;
        }
        const particleGeometry = new THREE.BufferGeometry();
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particles = new THREE.Points(
          particleGeometry,
          new THREE.PointsMaterial({
            color: 0xd4af37,
            size: 0.028,
            transparent: true,
            opacity: 0.8,
            depthWrite: false,
            sizeAttenuation: true,
          })
        );
        scene.add(particles);

        // --- Reticle per a AR ---
        reticle = new THREE.Mesh(
          new THREE.RingGeometry(0.07, 0.095, 32).rotateX(-Math.PI / 2),
          new THREE.MeshBasicMaterial({ color: 0xd4af37, transparent: true, opacity: 0.9 })
        );
        reticle.matrixAutoUpdate = false;
        reticle.visible = false;
        scene.add(reticle);

        clock = new THREE.Clock();

        // Previsualització 3D
        const previewLoop = () => {
          if (disposed) return;
          const delta = clock.getDelta();
          if (!session) {
            if (bottleGroup) {
              bottleGroup.visible = true;
              bottleGroup.rotation.y += delta * 0.45;
              const t = clock.elapsedTime;
              bottleGroup.position.y = Math.sin(t * 0.9) * 0.03;
            }
            if (particles) particles.rotation.y += delta * 0.12;
          }
          renderer.render(scene, camera);
        };
        renderer.setAnimationLoop(previewLoop);

        setPhase('ready');
        setMessage('');

        // --- Detecció de WebXR ---
        const xr = (navigator as any).xr;
        if (xr?.isSessionSupported) {
          try {
            const supported = await xr.isSessionSupported('immersive-ar');
            if (!disposed) setArSupported(Boolean(supported));
          } catch {
            if (!disposed) setArSupported(false);
          }
        }

        startArRef.current = async () => {
          if (!xr) {
            setMessage(FALLBACK_MESSAGES[0]);
            return;
          }
          try {
            setMessage('Obrint la càmera...');
            session = await xr.requestSession('immersive-ar', {
              requiredFeatures: ['hit-test'],
              optionalFeatures: ['dom-overlay', 'local-floor'],
              domOverlay: { root: container },
            });

            renderer.xr.enabled = true;
            await renderer.xr.setSession(session);

            const viewerSpace = await session.requestReferenceSpace('viewer');
            hitTestSource = await session.requestHitTestSource({ space: viewerSpace });
            localSpace = await session.requestReferenceSpace('local');

            if (bottleGroup) bottleGroup.visible = false;
            if (reticle) reticle.visible = true;
            setPhase('ar');
            setMessage('Mou el mòbil per detectar una superfície i toca per col·locar l_ampolla.');

            const onSelect = () => {
              let placedPose: any = null;
              if (reticle && reticle.visible) {
                placedPose = {
                  position: new THREE.Vector3().setFromMatrixPosition(reticle.matrix),
                  quaternion: new THREE.Quaternion().setFromRotationMatrix(reticle.matrix),
                };
              }

              if (!placedPose) {
                const camera3d = renderer.xr.getCamera(camera);
                const direction = new THREE.Vector3();
                camera3d.getWorldDirection(direction);
                placedPose = {
                  position: camera3d.position.clone().add(direction.multiplyScalar(1.4)).setY(Math.max(0.02, camera3d.position.y - 0.5)),
                  quaternion: new THREE.Quaternion(),
                };
              }

              if (bottleGroup) {
                bottleGroup.position.copy(placedPose.position);
                bottleGroup.quaternion.copy(placedPose.quaternion);
                bottleGroup.visible = true;
                placed = true;
              }
              if (reticle) reticle.visible = false;
              setMessage('Ampolla col·locada. Mou-te al seu voltant per veure-la.');
            };

            session.addEventListener('select', onSelect);
            session.addEventListener('end', () => {
              session = null;
              hitTestSource = null;
              placed = false;
              if (reticle) reticle.visible = false;
              if (bottleGroup) {
                bottleGroup.visible = true;
                bottleGroup.rotation.set(0, 0, 0);
                bottleGroup.position.set(0, 0, 0);
              }
              setPhase('ready');
              setMessage('Has sortit de la realitat augmentada.');
              renderer.setAnimationLoop(previewLoop);
            });

            renderer.setAnimationLoop((_time: number, frame: any) => {
              if (!frame || !session) return;
              if (hitTestSource && localSpace && !placed) {
                const results = frame.getHitTestResults(hitTestSource);
                if (results.length > 0) {
                  const pose = results[0].getPose(localSpace);
                  if (pose && reticle) {
                    reticle.visible = true;
                    reticle.matrix.fromArray(pose.transform.matrix);
                  }
                }
              }
              if (bottleGroup && placed) bottleGroup.rotation.y += 0.004;
              renderer.render(scene, camera);
            });
          } catch (error) {
            console.error('No se ha podido iniciar AR:', error);
            setMessage('No hem pogut obrir la càmera. Comprova els permisos o prova amb Chrome a Android.');
          }
        };
      } catch (error) {
        console.error('Error al inicializar la experiencia:', error);
        if (!disposed) {
          setPhase('error');
          setMessage('No s_ha pogut carregar la vista 3D.');
        }
      }
    }

    init();

    function onResize() {
      if (!containerRef.current || !renderer || !camera) return;
      const width = containerRef.current.clientWidth || 600;
      const height = containerRef.current.clientHeight || 520;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
    window.addEventListener('resize', onResize);

    return () => {
      disposed = true;
      window.removeEventListener('resize', onResize);
      try {
        if (session) session.end();
      } catch {
        // ignora
      }
      try {
        if (renderer) {
          renderer.setAnimationLoop(null);
          renderer.dispose();
          if (renderer.domElement?.parentNode) {
            renderer.domElement.parentNode.removeChild(renderer.domElement);
          }
        }
      } catch {
        // ignora
      }
    };
  }, [labelImage, wineType]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: '100%',
          height: 'min(560px, 68vh)',
          minHeight: '380px',
          borderRadius: '24px',
          overflow: 'hidden',
          background: 'radial-gradient(circle at 50% 30%, #1d1a10 0%, #0a0a0a 62%, #000000 100%)',
          border: '1px solid #2a2a2a',
        }}
      >
        {phase === 'loading' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#d4af37',
              fontSize: '14px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}
          >
            Carregant ampolla {String(serial).padStart(3, '0')}...
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        {arSupported ? (
          <button
            onClick={() => startArRef.current?.()}
            style={{
              padding: '14px 26px',
              borderRadius: '999px',
              border: '1px solid #d4af37',
              background: 'linear-gradient(135deg, #d4af37, #b8860b)',
              color: '#111111',
              fontWeight: 800,
              fontSize: '14px',
              letterSpacing: '1px',
              cursor: 'pointer',
              textTransform: 'uppercase',
            }}
          >
            Veure en realitat augmentada
          </button>
        ) : (
          <span style={{ fontSize: '13px', color: '#8a8a8a', lineHeight: 1.5 }}>
            {FALLBACK_MESSAGES[0]} {FALLBACK_MESSAGES[1]}
          </span>
        )}
        <span style={{ fontSize: '12px', color: '#6f6f6f' }}>
          {labelName} · {wineType === 'NEGRE' ? 'Vi negre' : 'Vi blanc'} · Núm. {String(serial).padStart(3, '0')}
        </span>
      </div>

      {message ? (
        <p style={{ margin: 0, fontSize: '13px', color: phase === 'error' ? '#f87171' : '#b9a35a', lineHeight: 1.5 }}>
          {message}
        </p>
      ) : null}
    </div>
  );
}
