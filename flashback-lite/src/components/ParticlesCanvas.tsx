"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

interface Particle {
  x: number;
  y: number;
  size: number;
  baseSize: number;
  speedX: number;
  speedY: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  shape: "circle" | "square" | "triangle" | "star" | "house";
  color: string;
  scale: number;
  scaleSpeed: number;
  life: number;
  maxLife: number;
}

const COLORS = [
  "rgba(255, 255, 255, 0.8)",
  "rgba(255, 255, 255, 0.6)",
  "rgba(255, 255, 255, 0.4)",
  "rgba(255, 200, 200, 0.5)",
  "rgba(255, 220, 220, 0.6)",
  "rgba(46, 104, 122, 0.4)", // primary color
];

export default function ParticlesCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Create particles
    const createParticle = (fromBottom = false): Particle => {
      const shapes: Particle["shape"][] = ["circle", "square", "triangle", "star", "house"];
      const baseSize = Math.random() * 15 + 5;
      return {
        x: Math.random() * canvas.width,
        y: fromBottom ? canvas.height + 50 : Math.random() * canvas.height,
        size: baseSize,
        baseSize: baseSize,
        speedX: (Math.random() - 0.5) * 1,
        speedY: -(Math.random() * 1.5 + 0.5), // Yukarı doğru hareket
        opacity: Math.random() * 0.4 + 0.1,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.03,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        scale: 0.3,
        scaleSpeed: Math.random() * 0.008 + 0.002,
        life: 0,
        maxLife: Math.random() * 300 + 200,
      };
    };

    // Initialize particles
    const particleCount = Math.min(60, Math.floor((canvas.width * canvas.height) / 15000));
    particlesRef.current = Array.from({ length: particleCount }, () => createParticle(false));

    // Randomize initial life for staggered effect
    particlesRef.current.forEach((p) => {
      p.life = Math.random() * p.maxLife;
      p.y = Math.random() * canvas.height;
    });

    // Draw shapes
    const drawCircle = (ctx: CanvasRenderingContext2D, p: Particle) => {
      ctx.beginPath();
      ctx.arc(0, 0, p.size * p.scale / 2, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawSquare = (ctx: CanvasRenderingContext2D, p: Particle) => {
      const s = p.size * p.scale;
      ctx.fillRect(-s / 2, -s / 2, s, s);
    };

    const drawTriangle = (ctx: CanvasRenderingContext2D, p: Particle) => {
      const s = p.size * p.scale;
      ctx.beginPath();
      ctx.moveTo(0, -s / 2);
      ctx.lineTo(s / 2, s / 2);
      ctx.lineTo(-s / 2, s / 2);
      ctx.closePath();
      ctx.fill();
    };

    const drawStar = (ctx: CanvasRenderingContext2D, p: Particle) => {
      const s = p.size * p.scale;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const x = Math.cos(angle) * s / 2;
        const y = Math.sin(angle) * s / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
    };

    const drawHouse = (ctx: CanvasRenderingContext2D, p: Particle) => {
      const s = p.size * p.scale / 2;
      ctx.beginPath();
      // Roof
      ctx.moveTo(0, -s);
      ctx.lineTo(s, 0);
      ctx.lineTo(-s, 0);
      ctx.closePath();
      ctx.fill();
      // Body
      ctx.fillRect(-s * 0.7, 0, s * 1.4, s);
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((p, index) => {
        // Update life
        p.life++;

        // Scale grows over time
        p.scale = Math.min(p.scale + p.scaleSpeed, 2.5);

        // Update position - float upward
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;

        // Slight wave motion
        p.x += Math.sin(p.life * 0.02) * 0.3;

        // Fade out as it reaches max life or top
        const lifeRatio = p.life / p.maxLife;
        const fadeOut = lifeRatio > 0.7 ? 1 - (lifeRatio - 0.7) / 0.3 : 1;
        const currentOpacity = p.opacity * fadeOut;

        // Reset particle if it goes off screen or dies
        if (p.y < -50 || p.life >= p.maxLife) {
          particlesRef.current[index] = createParticle(true);
        }

        // Wrap horizontal
        if (p.x < -50) p.x = canvas.width + 50;
        if (p.x > canvas.width + 50) p.x = -50;

        // Draw particle
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = currentOpacity;

        switch (p.shape) {
          case "circle":
            drawCircle(ctx, p);
            break;
          case "square":
            drawSquare(ctx, p);
            break;
          case "triangle":
            drawTriangle(ctx, p);
            break;
          case "star":
            drawStar(ctx, p);
            break;
          case "house":
            drawHouse(ctx, p);
            break;
        }

        ctx.restore();
      });

      ctx.globalAlpha = 1;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 pointer-events-none"
      style={{ mixBlendMode: "overlay" }}
    />
  );
}
