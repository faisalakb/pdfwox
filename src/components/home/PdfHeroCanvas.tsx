"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const DUST_COUNT = 220;

/** Word-wraps a tool name to at most `maxLines` lines that fit `maxWidth`. */
function wrapLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (ctx.measureText(next).width <= maxWidth || !line) {
      line = next;
    } else {
      lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, maxLines);
}

function makePageTexture(label: string, accent: boolean): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 704;
  const ctx = c.getContext("2d")!;

  ctx.fillStyle = "#F7F2E8";
  ctx.fillRect(0, 0, c.width, c.height);

  const grad = ctx.createLinearGradient(0, 0, c.width, c.height);
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(1, "rgba(0,0,0,0.05)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, c.width, c.height);

  // brand chip — echoes the header logo mark
  ctx.fillStyle = "#E2553D";
  ctx.fillRect(56, 56, 36, 36);
  ctx.fillStyle = "#FFF7EE";
  ctx.font = "700 24px Georgia, serif";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillText("W", 74, 76);

  // tool name — the document's title
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.font = "500 58px Georgia, 'Times New Roman', serif";
  ctx.fillStyle = accent ? "#E2553D" : "#1A1C26";
  const lines = wrapLabel(ctx, label, c.width - 112, 2);
  let y = 168;
  for (const ln of lines) {
    ctx.fillText(ln, 56, y);
    y += 66;
  }

  // gold rule under the title — same gold as the hero eyebrow
  ctx.fillStyle = "#C9B87F";
  ctx.fillRect(56, y - 38, 88, 5);

  // faded body lines
  ctx.fillStyle = "#B9B2A4";
  y += 18;
  while (y < c.height - 72) {
    const w = 400 - Math.random() * 160;
    ctx.fillRect(56, y, w, 11);
    y += 30;
    if (Math.random() < 0.18) y += 20;
  }

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 8;
  return tex;
}

interface PageUserData {
  angle: number;
  radius: number;
  ySpread: number;
  speed: number;
  wobble: number;
  spin: number;
}

/**
 * The three.js layer of the homepage hero: floating paper documents —
 * one per tool, each labeled with the tool's name — drifting in a slow
 * orbit, plus gold dust and pointer parallax. Renders nothing but an
 * absolutely-positioned canvas mount; all hero copy lives in PdfHero3D
 * so it stays server-rendered.
 */
export default function PdfHeroCanvas({ labels }: { labels: string[] }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      // No WebGL — the gradient backdrop in PdfHero3D stands on its own.
      return;
    }

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x10152a, 0.045);

    const camera = new THREE.PerspectiveCamera(
      50,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100,
    );
    camera.position.set(0, 0.4, 11);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0x8890b8, 0.55));
    const key = new THREE.DirectionalLight(0xffe2b8, 1.1);
    key.position.set(4, 6, 6);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x5566ff, 0.35);
    rim.position.set(-6, -2, -4);
    scene.add(rim);

    const pages: THREE.Mesh[] = [];
    const pageGeo = new THREE.PlaneGeometry(1.4, 1.92);
    const pageCount = labels.length;

    for (let i = 0; i < pageCount; i++) {
      const accent = i % 5 === 0;
      const mat = new THREE.MeshStandardMaterial({
        map: makePageTexture(labels[i], accent),
        side: THREE.DoubleSide,
        roughness: 0.85,
        metalness: 0.0,
      });
      const mesh = new THREE.Mesh(pageGeo, mat);
      const t = i / pageCount;
      mesh.userData = {
        angle: t * Math.PI * 2,
        radius: 4.6 + Math.random() * 2.2,
        ySpread: (Math.random() - 0.5) * 5.5,
        speed: 0.06 + Math.random() * 0.05,
        wobble: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.25,
      } satisfies PageUserData;
      scene.add(mesh);
      pages.push(mesh);
    }

    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(DUST_COUNT * 3);
    for (let i = 0; i < DUST_COUNT; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * 26;
      dustPos[i * 3 + 1] = (Math.random() - 0.5) * 14;
      dustPos[i * 3 + 2] = (Math.random() - 0.5) * 16;
    }
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
    const dust = new THREE.Points(
      dustGeo,
      new THREE.PointsMaterial({
        color: 0xc9b87f,
        size: 0.035,
        transparent: true,
        opacity: 0.5,
      }),
    );
    scene.add(dust);

    const pointer = { x: 0, y: 0 };
    const onMove = (e: PointerEvent) => {
      const r = mount.getBoundingClientRect();
      pointer.x = ((e.clientX - r.left) / r.width - 0.5) * 1.4;
      pointer.y = ((e.clientY - r.top) / r.height - 0.5) * 0.9;
    };
    mount.addEventListener("pointermove", onMove);

    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", onResize);

    // Pause rendering while the hero is off-screen or the tab is hidden.
    let visible = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0 },
    );
    io.observe(mount);

    let raf: number;
    const clock = new THREE.Clock();

    const animate = () => {
      raf = requestAnimationFrame(animate);
      if (!visible || document.hidden) return;

      const t = clock.getElapsedTime();
      const drift = prefersReducedMotion ? 0 : 1;

      pages.forEach((p, i) => {
        const u = p.userData as PageUserData;
        const a = u.angle + t * u.speed * drift;
        p.position.set(
          Math.cos(a) * u.radius,
          u.ySpread + Math.sin(t * 0.4 * drift + u.wobble) * 0.35,
          Math.sin(a) * u.radius - 1.5,
        );
        p.rotation.y = a + Math.PI / 2 + Math.sin(t * 0.3 + i) * 0.15 * drift;
        p.rotation.x = Math.sin(t * 0.25 * drift + u.wobble) * 0.18;
        p.rotation.z = u.spin * Math.sin(t * 0.2 * drift + i);
      });

      dust.rotation.y = t * 0.015 * drift;

      camera.position.x += (pointer.x - camera.position.x) * 0.04;
      camera.position.y += (0.4 - pointer.y - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      mount.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", onResize);
      pages.forEach((p) => {
        (p.material as THREE.MeshStandardMaterial).map?.dispose();
        (p.material as THREE.MeshStandardMaterial).dispose();
      });
      pageGeo.dispose();
      dustGeo.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [labels]);

  return <div ref={mountRef} className="absolute inset-0" aria-hidden="true" />;
}
