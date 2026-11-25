import React, { useEffect, useRef } from 'react';

interface AmbientCanvasProps {
  intensity?: number;
  interactive?: boolean;
}

export const AmbientCanvas: React.FC<AmbientCanvasProps> = ({
  intensity = 1,
  interactive = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle nodes for financial neural constellation
    const particleCount = Math.floor(Math.min(width, 1400) / 16);
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2.2 + 0.9,
      vx: (Math.random() - 0.5) * 0.45,
      vy: -Math.random() * 0.5 - 0.15,
      alpha: Math.random() * 0.5 + 0.3,
      maxAlpha: Math.random() * 0.6 + 0.4,
      pulseSpeed: Math.random() * 0.02 + 0.008,
      hue: Math.random() > 0.45 ? 180 : 220, // Cyan (180) or Electric Indigo (220)
    }));

    // Ripple wave pulses
    const ripples: Array<{ x: number; y: number; r: number; alpha: number }> = [];

    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };

    const handleClick = (e: MouseEvent) => {
      if (!interactive) return;
      ripples.push({
        x: e.clientX,
        y: e.clientY,
        r: 10,
        alpha: 0.8,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    let tick = 0;

    const render = () => {
      tick += 0.01;
      mouseX += (targetMouseX - mouseX) * 0.06;
      mouseY += (targetMouseY - mouseY) * 0.06;

      // Deep dark futuristic cosmic backdrop
      const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
      bgGradient.addColorStop(0, '#020611');
      bgGradient.addColorStop(0.5, '#051326');
      bgGradient.addColorStop(1, '#01050e');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // Ambient light caustics
      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      // Cyan / Teal luminous orb
      const orb1X = width * 0.25 + Math.sin(tick * 0.7) * 140;
      const orb1Y = height * 0.3 + Math.cos(tick * 0.5) * 90;
      const grad1 = ctx.createRadialGradient(orb1X, orb1Y, 10, orb1X, orb1Y, width * 0.5);
      grad1.addColorStop(0, `rgba(6, 182, 212, ${0.16 * intensity})`);
      grad1.addColorStop(0.5, `rgba(16, 185, 129, ${0.08 * intensity})`);
      grad1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      // Indigo / Purple luminous orb
      const orb2X = width * 0.8 + Math.cos(tick * 0.6) * 160;
      const orb2Y = height * 0.7 + Math.sin(tick * 0.4) * 110;
      const grad2 = ctx.createRadialGradient(orb2X, orb2Y, 10, orb2X, orb2Y, width * 0.55);
      grad2.addColorStop(0, `rgba(99, 102, 241, ${0.18 * intensity})`);
      grad2.addColorStop(0.6, `rgba(59, 130, 246, ${0.07 * intensity})`);
      grad2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      // Interactive mouse follow flare
      if (interactive) {
        const mouseGrad = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 280);
        mouseGrad.addColorStop(0, `rgba(45, 212, 191, ${0.14 * intensity})`);
        mouseGrad.addColorStop(0.6, `rgba(14, 165, 233, ${0.03 * intensity})`);
        mouseGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = mouseGrad;
        ctx.fillRect(0, 0, width, height);
      }

      ctx.restore();

      // Render & update ripple wave rings
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rip = ripples[i];
        rip.r += 3.5;
        rip.alpha -= 0.015;
        if (rip.alpha <= 0) {
          ripples.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(6, 182, 212, ${rip.alpha * 0.7})`;
        ctx.lineWidth = 1.8;
        ctx.stroke();
        ctx.restore();
      }

      // Constellation Links between nearby nodes
      ctx.save();
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 95) {
            const linkAlpha = (1 - dist / 95) * 0.22 * intensity;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(56, 189, 248, ${linkAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
      ctx.restore();

      // Render floating bioluminescent particles
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha += Math.sin(tick * 5 + p.x) * p.pulseSpeed;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const currentAlpha = Math.max(0.12, Math.min(p.maxAlpha, Math.abs(p.alpha))) * intensity;

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 90%, 70%, ${currentAlpha})`;
        ctx.shadowColor = `hsla(${p.hue}, 95%, 75%, ${currentAlpha * 0.9})`;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, [intensity, interactive]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
};
