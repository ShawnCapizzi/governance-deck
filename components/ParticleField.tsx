"use client";

import { useEffect, useRef } from "react";

/**
 * ParticleField — atmospheric particle network ("constellation").
 *
 * v1.4 tuning — mobile-aware, dimmed:
 *
 *   Desktop (≥768px):
 *     - 41 particles
 *     - MAX_OPACITY 0.27 (was 0.42, knocked down another 35%)
 *     - SCROLL_PARALLAX 0.35
 *
 *   Mobile (<768px):
 *     - 18 particles (less real estate, less density needed)
 *     - MAX_OPACITY 0.25 (OLED phone screens render white very vividly
 *       against pure black — need further dimming)
 *     - SCROLL_PARALLAX 0 (iOS momentum scrolling already provides motion;
 *       adding parallax on top creates a double-motion sensation)
 *
 * Configuration recalculates on viewport resize, so a phone rotating
 * landscape <-> portrait gets the right config for its current width.
 *
 * Respects prefers-reduced-motion by skipping all motion updates.
 */

type Hue = "white" | "moon";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hue: Hue;
}

const MAX_LINK_DISTANCE = 150;
const MOBILE_QUERY = "(max-width: 768px)";

const HUE_COLORS: Record<Hue, string> = {
  white: "245, 245, 244",
  moon: "248, 243, 232",
};

function pickHue(): Hue {
  return Math.random() < 0.5 ? "white" : "moon";
}

interface ViewportConfig {
  particleCount: number;
  maxOpacity: number;
  scrollParallax: number;
}

function readConfig(): ViewportConfig {
  const isMobile = window.matchMedia(MOBILE_QUERY).matches;
  return isMobile
    ? { particleCount: 18, maxOpacity: 0.25, scrollParallax: 0 }
    : { particleCount: 41, maxOpacity: 0.27, scrollParallax: 0.35 };
}

export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let config = readConfig();
    let particles: Particle[] = [];
    let animationFrame = 0;
    let width = 0;
    let height = 0;
    let lastScrollY = window.scrollY;
    let pendingScrollDelta = 0;

    function resize() {
      if (!canvas || !ctx) return;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    }

    function initParticles() {
      particles = Array.from({ length: config.particleCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 1.2 + 0.8,
        hue: pickHue(),
      }));
    }

    function onScroll() {
      const currentY = window.scrollY;
      pendingScrollDelta += currentY - lastScrollY;
      lastScrollY = currentY;
    }

    function draw() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, width, height);

      // Scroll-induced offset (opposite direction; clamped)
      const rawOffset = -pendingScrollDelta * config.scrollParallax;
      const scrollOffset = Math.max(-40, Math.min(40, rawOffset));
      pendingScrollDelta = 0;

      // Update positions
      if (!prefersReduced) {
        for (const p of particles) {
          p.x += p.vx;
          p.y += p.vy + scrollOffset;

          // Wrap around viewport edges
          if (p.x < -10) p.x = width + 10;
          if (p.x > width + 10) p.x = -10;
          if (p.y < -10) p.y = height + 10;
          if (p.y > height + 10) p.y = -10;
        }
      }

      // Connecting lines (linework opacity scales with brightness)
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distSquared = dx * dx + dy * dy;

          if (distSquared < MAX_LINK_DISTANCE * MAX_LINK_DISTANCE) {
            const dist = Math.sqrt(distSquared);
            // Line opacity tracks particle opacity at ~22%
            const opacity =
              (1 - dist / MAX_LINK_DISTANCE) * (config.maxOpacity * 0.22);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(167, 152, 255, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Particles
      for (const p of particles) {
        const color = HUE_COLORS[p.hue];

        // Soft halo
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, ${config.maxOpacity * 0.09})`;
        ctx.fill();

        // Bright core
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, ${config.maxOpacity})`;
        ctx.fill();
      }

      if (!prefersReduced) {
        animationFrame = requestAnimationFrame(draw);
      }
    }

    function handleVisibility() {
      if (document.hidden) {
        if (animationFrame) cancelAnimationFrame(animationFrame);
      } else if (!prefersReduced) {
        animationFrame = requestAnimationFrame(draw);
      }
    }

    function handleResize() {
      // Re-read config in case viewport crossed the mobile breakpoint
      const newConfig = readConfig();
      const configChanged =
        newConfig.particleCount !== config.particleCount ||
        newConfig.maxOpacity !== config.maxOpacity ||
        newConfig.scrollParallax !== config.scrollParallax;
      config = newConfig;
      resize();
      if (configChanged) initParticles();
    }

    resize();
    initParticles();
    draw();

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
