"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const PAGE_COUNT = 14;
const DUST_COUNT = 220;

function makePageTexture(accent: boolean): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 352;
  const ctx = c.getContext("2d")!;

  ctx.fillStyle = "#F7F2E8";
  ctx.fillRect(0, 0, c.width, c.height);

  const grad = ctx.createLinearGradient(0, 0, c.width, c.height);
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(1, "rgba(0,0,0,0.05)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, c.width, c.height);

  ctx.fillStyle = accent ? "#E2553D" : "#2B2E3B";
  ctx.fillRect(28, 30, accent ? 90 : 130, 14);

  ctx.fillStyle = "#B9B2A4";
  let y = 68;
  while (y < c.height - 40) {
    const w = 200 - Math.random() * 80;
    ctx.fillRect(28, y, w, 6);
    y += 16;
    if (Math.random() < 0.18) y += 10;
  }

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
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

export function PdfHero3D({ onBrowseTools }: { onBrowseTools?: () => void }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webglFailed, setWebglFailed] = useState(false);

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
      setWebglFailed(true);
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

    for (let i = 0; i < PAGE_COUNT; i++) {
      const accent = i % 5 === 0;
      const mat = new THREE.MeshStandardMaterial({
        map: makePageTexture(accent),
        side: THREE.DoubleSide,
        roughness: 0.85,
        metalness: 0.0,
      });
      const mesh = new THREE.Mesh(pageGeo, mat);
      const t = i / PAGE_COUNT;
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

    let raf: number;
    const clock = new THREE.Clock();

    const animate = () => {
      raf = requestAnimationFrame(animate);
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
        p.rotation.y =
          a + Math.PI / 2 + Math.sin(t * 0.3 + i) * 0.15 * drift;
        p.rotation.x = Math.sin(t * 0.25 * drift + u.wobble) * 0.18;
        p.rotation.z = u.spin * Math.sin(t * 0.2 * drift + i);
      });

      dust.rotation.y = t * 0.015 * drift;

      camera.position.x += (pointer.x - camera.position.x) * 0.04;
      camera.position.y +=
        (0.4 - pointer.y - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
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
  }, []);

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        minHeight: "92vh",
        background:
          "radial-gradient(ellipse at 50% 30%, #1A2140 0%, #10152A 55%, #0B0F1F 100%)",
      }}
    >
      {/* 3D canvas */}
      <div
        ref={mountRef}
        className="absolute inset-0"
        aria-hidden="true"
      />

      {/* centre vignette so text stays readable over the pages */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 55%, rgba(11,15,31,0.82) 0%, rgba(11,15,31,0.28) 45%, rgba(11,15,31,0) 70%)",
        }}
      />

      {/* hero copy */}
      <div
        className="relative z-10 flex flex-col items-center justify-center text-center px-6"
        style={{ minHeight: "92vh" }}
      >
        <p
          className="text-xs tracking-widest uppercase mb-5 font-medium"
          style={{ color: "#C9B87F", letterSpacing: "0.3em" }}
        >
          Every PDF tool, one place
        </p>

        <h1
          className="font-serif leading-tight mb-6"
          style={{
            color: "#F7F2E8",
            fontSize: "clamp(2.4rem, 5vw + 1rem, 4.2rem)",
            fontWeight: 400,
            letterSpacing: "-0.02em",
            lineHeight: 1.08,
          }}
        >
          Your documents,
          <br />
          <span style={{ color: "#E2553D" }}>finally under control.</span>
        </h1>

        <p
          className="max-w-xl text-base md:text-lg mb-10 leading-relaxed"
          style={{ color: "#9AA3C4" }}
        >
          Merge, split, compress, sign, and extract — fast, private, and free.
          No installs, no watermarks, no nonsense.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={onBrowseTools}
            className="px-8 py-4 rounded-full text-base font-semibold transition-all hover:scale-105 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E2553D]"
            style={{ background: "#E2553D", color: "#FFF7EE" }}
          >
            Browse all tools
          </button>
          <a
            href="/why-browser-based"
            className="px-8 py-4 rounded-full text-base font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{
              borderColor: "#3A4368",
              color: "#D8DCEE",
              background: "rgba(255,255,255,0.03)",
            }}
          >
            Why browser-based? →
          </a>
        </div>

        {webglFailed && (
          <p className="mt-8 text-sm" style={{ color: "#5A6388" }}>
            3D view unavailable on this device.
          </p>
        )}
      </div>

      {/* scroll cue */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40"
        aria-hidden="true"
      >
        <span className="text-[10px] tracking-widest uppercase" style={{ color: "#C9B87F" }}>
          Scroll
        </span>
        <div className="w-px h-8 bg-gradient-to-b from-[#C9B87F] to-transparent" />
      </div>
    </section>
  );
}
