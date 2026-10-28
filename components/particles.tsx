"use client";
import { useEffect, useState } from "react";
import Particles, { ParticlesProvider } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
export default function ParticleField() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (
      matchMedia("(prefers-reduced-motion: reduce), (max-width: 767px)")
        .matches ||
      (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4)
    )
      return;
    const frame = requestAnimationFrame(() => setReady(true));
    return () => {
      cancelAnimationFrame(frame);
    };
  }, []);
  if (!ready) return null;
  return (
    <ParticlesProvider init={loadSlim}>
      <Particles
        id="hero-particles"
        options={{
          fullScreen: { enable: false },
          fpsLimit: 30,
          pauseOnBlur: true,
          pauseOnOutsideViewport: true,
          detectRetina: false,
          particles: {
            number: { value: 28 },
            color: { value: "#7298ed" },
            opacity: { value: 0.35 },
            size: { value: { min: 1, max: 2 } },
            links: {
              enable: true,
              distance: 125,
              color: "#5879ba",
              opacity: 0.12,
            },
            move: { enable: true, speed: 0.3 },
          },
          interactivity: {
            events: { onHover: { enable: true, mode: "grab" } },
            modes: { grab: { distance: 130, links: { opacity: 0.25 } } },
          },
        }}
      />
    </ParticlesProvider>
  );
}
