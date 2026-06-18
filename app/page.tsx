"use client";

import { motion, useInView } from "framer-motion";
import { useState, useRef, useEffect, useCallback } from "react";

// ── Cherry Blossom Canvas ────────────────────────────────────────────
function CherryBlossoms() {
  const petalRef = useRef<HTMLCanvasElement>(null);
  const branchRef = useRef<HTMLCanvasElement>(null);

  // ── Branch drawing ──────────────────────────────────────────────
  useEffect(() => {
    const canvas = branchRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    type Seg = {
      x1: number; y1: number; cpx: number; cpy: number; x2: number; y2: number;
      w: number; isTip: boolean;
    };

    const draw = () => {
      canvas.width  = canvas.offsetWidth  || canvas.parentElement?.clientWidth  || 800;
      canvas.height = canvas.offsetHeight || canvas.parentElement?.clientHeight || 600;
      const W = canvas.width, H = canvas.height;
      const segs: Seg[] = [];
      const blossoms: { x: number; y: number; r: number; alpha: number }[] = [];

      const rnd = (a: number, b: number) => a + Math.random() * (b - a);

      function branch(x: number, y: number, angle: number, len: number, w: number, depth: number) {
        if (w < 0.35 || depth > 13) return;

        const wobble = (Math.random() - 0.5) * (w > 15 ? 0.25 : 0.45);
        const a2 = angle + wobble;
        const ex = x + Math.cos(a2) * len;
        const ey = y + Math.sin(a2) * len;

        // sweeping bezier — more curl on mid-thickness branches
        const curlAmt = w > 20 ? 0.6 : w > 8 ? 1.2 : 0.8;
        const cp = (Math.random() - 0.5) * len * curlAmt;
        const pa = a2 + Math.PI / 2;
        const cpx = (x + ex) / 2 + Math.cos(pa) * cp;
        const cpy = (y + ey) / 2 + Math.sin(pa) * cp;

        const isTip = w < 1.5;
        segs.push({ x1: x, y1: y, cpx, cpy, x2: ex, y2: ey, w, isTip });

        // dense blossom clusters on thin ends
        if (isTip && Math.random() < 0.7) {
          const count = Math.floor(rnd(3, 10));
          for (let i = 0; i < count; i++) {
            blossoms.push({ x: ex + rnd(-14,14), y: ey + rnd(-14,14), r: rnd(2.5,7), alpha: rnd(0.5,0.9) });
          }
        }

        const kids = w > 12 ? (Math.random() < 0.4 ? 3 : 2) : Math.random() < 0.25 ? 3 : 2;
        for (let i = 0; i < kids; i++) {
          const side = i === 0 ? -1 : i === 1 ? 1 : (Math.random() < 0.5 ? -1 : 1);
          const spread = rnd(0.18, 0.48) * side;
          branch(ex, ey, a2 + spread, len * rnd(0.55, 0.72), w * rnd(0.56, 0.68), depth + 1);
        }
      }

      // ── LEFT — massive trunk from bottom-left, sweeping up and inward ──
      branch(-20,      H + 20,   rnd(-1.25,-0.95),  rnd(280,340), rnd(44,54), 0);
      branch(-10,      H * 0.82, rnd(-0.55,-0.2),   rnd(200,260), rnd(28,36), 0);
      branch(0,        H * 0.6,  rnd(-0.3, 0.05),   rnd(160,210), rnd(18,24), 0);
      branch(0,        H * 0.38, rnd(-0.15,0.2),    rnd(120,160), rnd(11,16), 0);
      branch(0,        H * 0.18, rnd(-0.05,0.3),    rnd(90, 130), rnd(7,11),  0);

      // ── RIGHT — mirrored massive trunk ──
      branch(W + 20,   H + 20,   Math.PI + rnd(0.95,1.25), rnd(280,340), rnd(44,54), 0);
      branch(W + 10,   H * 0.82, Math.PI + rnd(0.2,0.55),  rnd(200,260), rnd(28,36), 0);
      branch(W,        H * 0.6,  Math.PI + rnd(-0.05,0.3), rnd(160,210), rnd(18,24), 0);
      branch(W,        H * 0.38, Math.PI + rnd(-0.2,0.15), rnd(120,160), rnd(11,16), 0);
      branch(W,        H * 0.18, Math.PI + rnd(-0.3,0.05), rnd(90, 130), rnd(7,11),  0);

      // ── TOP — branches dripping down from top edge ──
      branch(W * 0.46, -10,      Math.PI*0.5,               rnd(180,230), rnd(16,22), 0);
      branch(W * 0.54, -10,      Math.PI*0.5+rnd(-0.2,0.2), rnd(140,180), rnd(12,16), 0);
      branch(0,        0,        rnd(0.25,0.55),             rnd(160,200), rnd(16,20), 0);
      branch(W,        0,        Math.PI-rnd(0.25,0.55),     rnd(160,200), rnd(16,20), 0);

      ctx.clearRect(0, 0, W, H);
      ctx.lineCap  = "round";
      ctx.lineJoin = "round";

      // atmospheric side glow — warm fog behind the trunks
      const leftGlow = ctx.createRadialGradient(W*0.08, H*0.6, 0, W*0.08, H*0.6, W*0.38);
      leftGlow.addColorStop(0,   "rgba(60,30,15,0.18)");
      leftGlow.addColorStop(1,   "rgba(0,0,0,0)");
      ctx.fillStyle = leftGlow; ctx.fillRect(0,0,W,H);
      const rightGlow = ctx.createRadialGradient(W*0.92, H*0.6, 0, W*0.92, H*0.6, W*0.38);
      rightGlow.addColorStop(0,  "rgba(60,30,15,0.18)");
      rightGlow.addColorStop(1,  "rgba(0,0,0,0)");
      ctx.fillStyle = rightGlow; ctx.fillRect(0,0,W,H);

      // sort thick first so thinner branches draw on top
      segs.sort((a, b) => b.w - a.w);

      for (const s of segs) {
        const t = Math.min(1, s.w / 50);
        // thick trunk: dark warm grey-brown → thin tips: pale bone
        const rC = Math.floor(85  + t * 70);
        const gC = Math.floor(65  + t * 60);
        const bC = Math.floor(50  + t * 45);
        const al = Math.min(0.95, s.w * 0.022 + 0.48);
        ctx.beginPath();
        ctx.moveTo(s.x1, s.y1);
        ctx.quadraticCurveTo(s.cpx, s.cpy, s.x2, s.y2);
        ctx.lineWidth   = s.w;
        ctx.strokeStyle = `rgba(${rC},${gC},${bC},${al})`;
        ctx.stroke();
      }

      // blossoms on top of branches
      for (const bl of blossoms) {
        ctx.beginPath();
        ctx.arc(bl.x, bl.y, bl.r, 0, Math.PI * 2);
        const rB = Math.floor(rnd(205,248)), gB = Math.floor(rnd(105,165)), bB = Math.floor(rnd(140,195));
        ctx.fillStyle = `rgba(${rB},${gB},${bB},${bl.alpha})`;
        ctx.fill();
      }
    };

    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, []);

  // ── Petal animation ─────────────────────────────────────────────
  useEffect(() => {
    const canvas = petalRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    let spawnDir = -1;
    let windTimer = 0;
    const WIND_INTERVAL = 900; // frames — slow interval (~15s at 60fps)

    const makePetal = (spreadY = true) => ({
      x: Math.random() * canvas.width,
      y: spreadY ? Math.random() * canvas.height : -20,
      size: Math.random() * 14 + 7,
      speedY: Math.random() * 0.6 + 0.3,
      speedX: Math.random() * 0.8 + 0.3,
      dir: spawnDir,   // locked at birth — never changes
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.04,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: Math.random() * 0.018 + 0.008,
      opacity: Math.random() * 0.45 + 0.25,
      r: Math.floor(Math.random() * 30 + 220),
      g: Math.floor(Math.random() * 40 + 140),
      b: Math.floor(Math.random() * 40 + 160),
    });

    const petals = Array.from({ length: 28 }, () => makePetal(true));
    let id: number;

    const drawPetal = (p: ReturnType<typeof makePetal>) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.opacity;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size * 0.45, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgb(${p.r},${p.g},${p.b})`;
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(p.size * 0.1, -p.size * 0.05, p.size * 0.4, p.size * 0.2, -0.3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,0.25)`;
      ctx.fill();
      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      windTimer++;
      if (windTimer >= WIND_INTERVAL + Math.floor(Math.random() * 300)) {
        spawnDir *= -1;
        windTimer = 0;
      }

      for (const p of petals) {
        p.sway += p.swaySpeed;
        p.x += p.speedX * p.dir + Math.sin(p.sway) * 0.5;
        p.y += p.speedY;
        p.rot += p.rotSpeed;

        if (p.y > canvas.height + 20) {
          const fresh = makePetal(false);
          Object.assign(p, fresh);
        }
        if (p.x < -30) p.x = canvas.width + 30;
        if (p.x > canvas.width + 30) p.x = -30;
        drawPetal(p);
      }
      id = requestAnimationFrame(animate);
    };
    animate();

    return () => { cancelAnimationFrame(id); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none">
      <canvas ref={branchRef} className="absolute inset-0 w-full h-full" style={{ opacity: 1 }} />
      <canvas ref={petalRef} className="absolute inset-0 w-full h-full" style={{ opacity: 0.7 }} />
    </div>
  );
}

// ── Data ─────────────────────────────────────────────────────────────
const skills = [
  {
    front: { icon: "⚔", title: "Combat Animation", desc: "Hand-keyed — frame perfect" },
    back: "Combat combos · Hit reactions · Takedowns · Death animations · Creature attacks · Weighty impactful motion",
    color: "from-cyan-900 to-slate-950", accent: "#00e5ff",
  },
  {
    front: { icon: "⚙", title: "Technical Animation", desc: "Systems & implementation" },
    back: "State machines · Blend trees · AnimGraph · EventGraph · Blueprint · Unity Animator · Runtime logic",
    color: "from-indigo-900 to-slate-950", accent: "#818cf8",
  },
  {
    front: { icon: "☰", title: "Rigging & Pipeline", desc: "Characters & creatures" },
    back: "Biped & quadruped rigs · mGear · Custom control setups · MEL & Python tools · Pipeline automation",
    color: "from-amber-900 to-slate-950", accent: "#fbbf24",
  },
];

const projects = [
  {
    title: "Morbid Metal",
    studio: "Screen Juice Interactive",
    years: "2023 – 2026",
    engine: "Unity",
    role: "Gameplay & Technical Animator",
    desc: "Hack 'n' Slash Action Rogue-lite. Full character ownership of Ekku, Vekta and Flux — hand-keyed combat, locomotion, and complete rig pipeline for all player characters and creatures.",
    tags: ["Hand-keyed", "Combat", "Rigging", "Unity"],
    link: "https://store.steampowered.com/app/1866130/Morbid_Metal/",
    videoId: "m204nKVlBGs",
    accent: "#00e5ff",
    label: "SHIPPED",
  },
  {
    title: "The Cycle: Frontier",
    studio: "YAGER Development",
    years: "2020 – 2021",
    engine: "Unreal Engine 4",
    role: "Junior 3D Animator → 3D Animator",
    desc: "PvP Extraction Shooter. Owned the quadruped Rattler creature, FPP sniper/pistol locomotion rework, NPC vendors on Prospect Station, and camera systems for in-game vanity UI.",
    tags: ["Creature", "FPP", "NPCs", "UE4"],
    link: "https://store.steampowered.com/app/868270",
    videoId: "4w-Z9Yu1sWE",
    accent: "#fb923c",
    label: "SHIPPED",
  },
  {
    title: "Kinstrife",
    studio: "Finitude",
    years: "2026 – Present",
    engine: "Unreal Engine 5",
    role: "Gameplay & Technical Animator",
    desc: "Currently in active development. Implementing animation systems in-engine, combat gameplay animations, rigging support for characters and creatures, facial animation, lipsync, and pipeline tooling.",
    tags: ["In Development", "Combat", "Pipeline", "UE5"],
    link: null,
    videoId: "c_mI0VHowsc",
    accent: "#c084fc",
    label: "IN DEV",
  },
];

const experience = [
  { years: "2026 – Now", role: "Gameplay & Technical Animator", studio: "Finitude", detail: "Remote · Berlin" },
  { years: "2023 – 2026", role: "Gameplay & Technical Animator", studio: "Screen Juice Interactive GmbH", detail: "Remote · Berlin" },
  { years: "2021", role: "3D Animator — Student", studio: "iAnimate.net", detail: "Game Workshop 1 & 2 · Combat & Body Mechanics" },
  { years: "2020 – 2021", role: "Junior → 3D Animator", studio: "YAGER Development", detail: "Remote · Berlin" },
  { years: "2020", role: "Intern 3D Animator", studio: "YAGER Development", detail: "Berlin" },
  { years: "2017 – 2019", role: "Student — Digital Art & Animation", studio: "Games Academy Berlin", detail: "Focus: 3D Animation & Rigging" },
];

const techStack = [
  { cat: "DCC", items: ["Maya", "3ds Max"] },
  { cat: "Engines", items: ["Unreal Engine 4/5", "Unity 3D"] },
  { cat: "Rigging", items: ["mGear", "Advanced Skeleton 5"] },
  { cat: "Pipeline", items: ["MEL", "Python", "PySide2"] },
  { cat: "Production", items: ["Git", "Perforce", "Jira", "Plastic SCM"] },
];

// ── Flip Card ────────────────────────────────────────────────────────
function FlipCard({ skill, index, flipped, onClick }: {
  skill: typeof skills[0]; index: number; flipped: boolean; onClick: () => void;
}) {
  return (
    <motion.div
      className="cursor-pointer bracket-corner"
      style={{ perspective: 1000, height: 210 }}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15, duration: 0.6 }}
      onClick={onClick}
    >
      <motion.div
        style={{ width: "100%", height: "100%", position: "relative", transformStyle: "preserve-3d" }}
        animate={{ rotateY: flipped ? 180 : 0, rotateX: flipped ? [0, -8, 0] : [0, 8, 0] }}
        transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
      >
        <div style={{ backfaceVisibility: "hidden", background: "rgba(1,15,20,0.9)" } as React.CSSProperties}
          className="absolute inset-0 neon-border p-6 flex flex-col justify-between transition-all duration-300">
          <div className="text-2xl" style={{ color: skill.accent }}>{skill.front.icon}</div>
          <div>
            <h3 className="text-white font-bold text-lg mb-1 tracking-wider uppercase">{skill.front.title}</h3>
            <p className="text-sm font-mono" style={{ color: "rgba(0,229,255,0.5)" }}>{skill.front.desc}</p>
          </div>
          <p className="text-xs font-mono" style={{ color: "rgba(0,229,255,0.3)" }}>[ CLICK TO ACCESS ]</p>
        </div>
        <div style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", borderColor: skill.accent + "40" } as React.CSSProperties}
          className={`absolute inset-0 bg-gradient-to-br ${skill.color} p-6 flex flex-col justify-between border`}>
          <div className="text-xs uppercase tracking-widest font-mono" style={{ color: skill.accent }}>{skill.front.title}</div>
          <p className="text-white/80 text-sm leading-relaxed font-mono">{skill.back}</p>
          <p className="text-xs font-mono" style={{ color: skill.accent + "60" }}>[ CLICK TO CLOSE ]</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Project Card with hover-to-play ──────────────────────────────────
function ProjectCard({ project, index }: { project: typeof projects[0]; index: number }) {
  const [hovered, setHovered] = useState(false);
  const [iframeReady, setIframeReady] = useState(false);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  const onEnter = useCallback(() => {
    hoverTimer.current = setTimeout(() => { setHovered(true); setIframeReady(true); }, 400);
  }, []);

  const onLeave = useCallback(() => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setHovered(false);
    setTimeout(() => setIframeReady(false), 500);
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.1 }}
      className="bracket-corner neon-border flex flex-col"
      style={{ background: "rgba(1,10,14,0.95)" }}
    >
      {/* Video / Thumbnail area */}
      <div
        className="relative w-full overflow-hidden"
        style={{ paddingTop: "56.25%", background: "#000", cursor: "pointer" }}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
      >
        {/* Static title overlay — hidden when video playing */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 transition-opacity duration-300"
          style={{
            background: `radial-gradient(ellipse at center, ${project.accent}15 0%, #000 70%)`,
            opacity: hovered ? 0 : 1,
            pointerEvents: "none",
          }}
        >
          <p className="text-xs uppercase tracking-widest font-mono" style={{ color: project.accent }}>
            {project.studio} · {project.years}
          </p>
          <h3 className="text-white text-2xl font-bold tracking-widest uppercase text-center px-4">{project.title}</h3>
          <p className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>{project.engine}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs font-mono px-3 py-1 border" style={{ color: project.accent, borderColor: project.accent + "40", background: project.accent + "15" }}>
              ▶ HOVER TO PLAY
            </span>
            <span className="cyber-tag flicker" style={{ color: project.accent, borderColor: project.accent + "40", background: project.accent + "15" }}>
              {project.label}
            </span>
          </div>
        </div>

        {/* iframe — only mounted when hovered */}
        {iframeReady && (
          <iframe
            className="absolute inset-0 w-full h-full transition-opacity duration-300"
            style={{ opacity: hovered ? 1 : 0 }}
            src={`https://www.youtube.com/embed/${project.videoId}?autoplay=1&mute=1&controls=1&modestbranding=1&rel=0`}
            allow="autoplay; fullscreen"
            allowFullScreen
          />
        )}
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex flex-wrap gap-2 mb-3">
          {project.tags.map(tag => (
            <span key={tag} className="cyber-tag">{tag}</span>
          ))}
        </div>
        <p className="text-xs font-mono mb-2" style={{ color: project.accent }}>{project.role}</p>
        <p className="text-sm leading-relaxed mb-4 flex-1" style={{ color: "rgba(255,255,255,0.55)" }}>{project.desc}</p>
        {project.link && (
          <a href={project.link} target="_blank" rel="noopener noreferrer"
            className="text-xs font-mono hover:text-white transition-colors"
            style={{ color: "rgba(0,229,255,0.35)" }}>
            VIEW ON STEAM →
          </a>
        )}
      </div>
    </motion.div>
  );
}

// ── Timeline ─────────────────────────────────────────────────────────
function TimelineItem({ item, index }: { item: typeof experience[0]; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, x: -30 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="flex gap-6 group"
    >
      <div className="flex flex-col items-center">
        <div className="w-2 h-2 mt-2 border transition-colors duration-300 group-hover:bg-cyan-400"
          style={{ borderColor: "rgba(0,229,255,0.5)" }} />
        <div className="w-px flex-1 mt-2" style={{ background: "rgba(0,229,255,0.1)" }} />
      </div>
      <div className="pb-8">
        <p className="text-xs font-mono mb-1" style={{ color: "rgba(0,229,255,0.6)" }}>{item.years}</p>
        <p className="text-white font-bold tracking-wide">{item.role}</p>
        <p className="text-sm" style={{ color: "rgba(0,229,255,0.7)" }}>{item.studio}</p>
        <p className="text-xs font-mono mt-0.5" style={{ color: "rgba(255,255,255,0.25)" }}>{item.detail}</p>
      </div>
    </motion.div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────
export default function Home() {
  const [activeSkill, setActiveSkill] = useState<number | null>(null);

  return (
    <div className="text-white min-h-screen" style={{ background: "#010a0e" }}>

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 border-b"
        style={{ background: "rgba(1,10,14,0.9)", borderColor: "rgba(0,229,255,0.1)", backdropFilter: "blur(12px)" }}>
        <span className="font-bold tracking-[0.3em] text-sm uppercase neon-cyan flicker">MR//PORTFOLIO</span>
        <div className="flex items-center gap-6 text-xs font-mono uppercase tracking-widest" style={{ color: "rgba(0,229,255,0.6)" }}>
          <a href="#work" className="hover:text-white transition-colors">Work</a>
          <a href="#skills" className="hover:text-white transition-colors">Skills</a>
          <a href="#experience" className="hover:text-white transition-colors">Timeline</a>
          <a href="https://www.artstation.com/markorudjic/profile" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">ArtStation</a>
          <a href="mailto:Marko.Rudjic@gmx.ch"
            className="px-4 py-1.5 border font-mono text-xs transition-all hover:bg-cyan-400/10"
            style={{ borderColor: "rgba(0,229,255,0.4)", color: "#00e5ff" }}>
            CONTACT
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen grid-bg flex flex-col items-center justify-center px-6 pt-24 pb-16 text-center relative overflow-hidden">
        {/* Petals */}
        <CherryBlossoms />

        {/* Glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 60%, rgba(0,229,255,0.06) 0%, transparent 65%)" }} />
        {/* Atmospheric depth — dark vignette + side fog to frame the trees */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(0,4,8,0.55) 100%)"
        }} />
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "linear-gradient(to right, rgba(3,10,8,0.45) 0%, transparent 28%, transparent 72%, rgba(3,10,8,0.45) 100%)"
        }} />
        <div className="absolute top-1/2 left-0 right-0 h-px pointer-events-none"
          style={{ background: "linear-gradient(90deg, transparent, rgba(0,229,255,0.15), transparent)" }} />

        <motion.p className="text-xs uppercase tracking-[0.4em] font-mono mb-8 relative z-10"
          style={{ color: "rgba(0,229,255,0.5)" }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
          Berlin, Germany · Remote & Hybrid · Open to opportunities
        </motion.p>

        <motion.div className="mb-4 relative z-10 flex items-center justify-center"
          style={{ gap: "clamp(2rem, 8vw, 7rem)" }}
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}>
          <h1 className="text-7xl md:text-9xl font-bold leading-none uppercase glitch"
            data-text="MARKO" style={{ color: "#fff", letterSpacing: "0.08em" }}>
            MARKO
          </h1>
          <h1 className="text-7xl md:text-9xl font-bold leading-none uppercase neon-cyan"
            style={{ letterSpacing: "0.08em" }}>
            RUDJIC
          </h1>
        </motion.div>

        <motion.div className="flex items-center gap-4 mb-4 relative z-10"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.4 }}>
          <div className="h-px w-16" style={{ background: "rgba(0,229,255,0.4)" }} />
          <p className="text-sm uppercase tracking-[0.4em] font-mono" style={{ color: "rgba(0,229,255,0.8)" }}>
            Gameplay & Technical Animator
          </p>
          <div className="h-px w-16" style={{ background: "rgba(0,229,255,0.4)" }} />
        </motion.div>

        <motion.p className="max-w-xl leading-relaxed mb-10 text-sm font-mono relative z-10"
          style={{ color: "rgba(255,255,255,0.4)" }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.5 }}>
          Combat · Locomotion · Character Systems · Real-time Games<br />
          5+ years in Unreal & Unity — from hand-keyed animation to<br />
          state machine architecture and rigging pipeline supervision.
        </motion.p>

        <motion.div className="flex flex-wrap gap-3 justify-center mb-16 relative z-10"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.5 }}>
          {/* Dimmed down — no full bright cyan fill */}
          <a href="#work"
            className="px-6 py-3 font-mono text-xs uppercase tracking-widest border transition-all hover:bg-cyan-400/10"
            style={{ borderColor: "rgba(0,229,255,0.5)", color: "#00e5ff" }}>
            VIEW WORK
          </a>
          <a href="https://www.linkedin.com/in/marko-rudjic/" target="_blank" rel="noopener noreferrer"
            className="px-6 py-3 font-mono text-xs uppercase tracking-widest border transition-all hover:bg-cyan-400/10"
            style={{ borderColor: "rgba(0,229,255,0.4)", color: "#00e5ff" }}>
            LINKEDIN
          </a>
          <a href="https://www.artstation.com/markorudjic/profile" target="_blank" rel="noopener noreferrer"
            className="px-6 py-3 font-mono text-xs uppercase tracking-widest border transition-all hover:bg-cyan-400/10"
            style={{ borderColor: "rgba(0,229,255,0.4)", color: "#00e5ff" }}>
            ARTSTATION
          </a>
        </motion.div>

        {/* Demo reel */}
        <motion.div className="w-full max-w-4xl mx-auto bracket-corner relative z-10"
          style={{ boxShadow: "0 0 60px rgba(0,229,255,0.1)" }}
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.8 }}>
          <div className="flex items-center justify-between px-4 py-2 border-b font-mono text-xs"
            style={{ background: "rgba(0,229,255,0.05)", borderColor: "rgba(0,229,255,0.15)", color: "rgba(0,229,255,0.6)" }}>
            <span>▶ DEMO_REEL_2026.mp4</span>
            <a href="https://www.youtube.com/watch?v=nffNFElOPWY" target="_blank" rel="noopener noreferrer"
              className="hover:text-white transition-colors">OPEN IN YOUTUBE ↗</a>
          </div>
          <div style={{ position: "relative", paddingTop: "56.25%" }}>
            <iframe
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
              src="https://www.youtube.com/embed/nffNFElOPWY"
              title="Marko Rudjic — Demo Reel 2026"
              allow="fullscreen"
              allowFullScreen
            />
          </div>
        </motion.div>
      </section>

      {/* Projects */}
      <section id="work" className="max-w-6xl mx-auto px-6 py-24">
        <motion.p className="text-xs font-mono uppercase tracking-[0.3em] mb-1"
          style={{ color: "rgba(0,229,255,0.5)" }}
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          // FEATURED WORK
        </motion.p>
        <motion.h2 className="text-4xl font-bold uppercase tracking-widest mb-12"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          Shipped Titles &amp; Current Project
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <ProjectCard key={project.title} project={project} index={i} />
          ))}
        </div>
      </section>

      {/* Skills */}
      <section id="skills" className="max-w-6xl mx-auto px-6 py-24">
        <motion.p className="text-xs font-mono uppercase tracking-[0.3em] mb-1"
          style={{ color: "rgba(0,229,255,0.5)" }}
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          // SPECIALISATIONS
        </motion.p>
        <motion.h2 className="text-4xl font-bold uppercase tracking-widest mb-12"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          What I Bring
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {skills.map((skill, i) => (
            <FlipCard key={skill.front.title} skill={skill} index={i}
              flipped={activeSkill === i}
              onClick={() => setActiveSkill(activeSkill === i ? null : i)} />
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {techStack.map(({ cat, items }) => (
            <div key={cat} className="neon-border p-4" style={{ background: "rgba(1,10,14,0.8)" }}>
              <p className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: "rgba(0,229,255,0.5)" }}>[{cat}]</p>
              {items.map(item => (
                <p key={item} className="text-sm mb-1" style={{ color: "rgba(255,255,255,0.6)" }}>{item}</p>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Experience */}
      <section id="experience" className="max-w-6xl mx-auto px-6 py-24">
        <motion.p className="text-xs font-mono uppercase tracking-[0.3em] mb-1"
          style={{ color: "rgba(0,229,255,0.5)" }}
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          // CAREER TIMELINE
        </motion.p>
        <motion.h2 className="text-4xl font-bold uppercase tracking-widest mb-12"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          Experience
        </motion.h2>
        <div className="max-w-xl">
          {experience.map((item, i) => <TimelineItem key={i} item={item} index={i} />)}
        </div>
      </section>

      {/* Contact */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center relative">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(0,229,255,0.04) 0%, transparent 70%)" }} />
        <motion.p className="text-xs font-mono uppercase tracking-[0.3em] mb-4"
          style={{ color: "rgba(0,229,255,0.5)" }}
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          // INITIATE CONTACT
        </motion.p>
        <motion.h2 className="text-5xl md:text-7xl font-bold uppercase tracking-widest mb-4"
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          Let's Build<br />
          <span className="neon-cyan">Together.</span>
        </motion.h2>
        <motion.p className="text-sm font-mono mb-10 max-w-md mx-auto"
          style={{ color: "rgba(255,255,255,0.3)" }}
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          Open to new opportunities — Berlin, remote or hybrid.
        </motion.p>
        <motion.div className="flex flex-wrap gap-4 justify-center"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <a href="mailto:Marko.Rudjic@gmx.ch"
            className="px-8 py-3 font-mono text-xs uppercase tracking-widest font-bold transition-all hover:scale-105"
            style={{ background: "#00e5ff", color: "#000" }}>
            SEND MESSAGE
          </a>
          <a href="https://www.linkedin.com/in/marko-rudjic/" target="_blank" rel="noopener noreferrer"
            className="px-8 py-3 font-mono text-xs uppercase tracking-widest border transition-all hover:bg-cyan-400/10"
            style={{ borderColor: "rgba(0,229,255,0.4)", color: "#00e5ff" }}>
            LINKEDIN
          </a>
          <a href="https://www.artstation.com/markorudjic/profile" target="_blank" rel="noopener noreferrer"
            className="px-8 py-3 font-mono text-xs uppercase tracking-widest border transition-all hover:bg-cyan-400/10"
            style={{ borderColor: "rgba(0,229,255,0.4)", color: "#00e5ff" }}>
            ARTSTATION
          </a>
        </motion.div>
      </section>

      <footer className="border-t py-8 text-center font-mono text-xs"
        style={{ borderColor: "rgba(0,229,255,0.1)", color: "rgba(0,229,255,0.2)" }}>
        © 2026 MARKO RUDJIC · GAMEPLAY &amp; TECHNICAL ANIMATOR · BERLIN · MR//SYSTEMS
      </footer>

    </div>
  );
}
