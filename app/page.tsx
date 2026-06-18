"use client";

import { motion, useInView } from "framer-motion";
import { useState, useRef, useEffect, useCallback } from "react";

// ── Cherry Blossom Canvas (petals only — bg image handles the tree) ──
function CherryBlossoms() {
  const petalRef = useRef<HTMLCanvasElement>(null);

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
      const W = canvas.width, H = canvas.height;

      // Horizontal: fade toward center — edges bright, middle transparent
      const xNorm = Math.abs(p.x / W - 0.5) * 2;          // 0 at center, 1 at edges
      const xFade = Math.pow(xNorm, 0.6);                   // ease — not too sharp

      // Vertical: bottom petals glow up toward the image middle (H*0.5),
      // then gently fade again above that.
      const yNorm = p.y / H;                                // 0=top, 1=bottom
      const yFade = yNorm < 0.5
        ? yNorm * 2                                          // bottom→mid: 0 → 1
        : 1 - (yNorm - 0.5) * 0.8;                          // mid→top: gentle fade

      const posFactor = xFade * 0.65 + yFade * 0.35;
      const finalAlpha = p.opacity * Math.max(0.05, posFactor);

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = finalAlpha;
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

  return <canvas ref={petalRef} className="pointer-events-none" style={{
    position: "fixed", inset: 0, width: "100%", height: "100%",
    zIndex: 2, opacity: 0.75,
  }} />;
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
    link: "https://store.steampowered.com/app/1256270/Kinstrife/",
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
    <div className="text-white min-h-screen" style={{
      background: "#010a0e",
      backgroundImage: "url('/hero-bg.png')",
      backgroundAttachment: "fixed",
      backgroundSize: "cover",
      backgroundPosition: "center 20%",
      backgroundRepeat: "no-repeat",
    }}>

      {/* Fixed vignette — sits over bg image, under content, never scrolls */}
      <div className="pointer-events-none" style={{
        position: "fixed", inset: 0, zIndex: 1,
        background: "linear-gradient(to bottom, rgba(1,10,14,0.45) 0%, rgba(1,10,14,0.0) 30%, rgba(1,10,14,0.0) 65%, rgba(1,10,14,0.7) 100%)",
      }} />
      {/* Vertical center band — second highest layer, above petals, below content */}
      <div className="pointer-events-none" style={{
        position: "fixed", inset: 0, zIndex: 3,
        background: "linear-gradient(to right, transparent 0%, rgba(1,10,14,0.72) 22%, rgba(1,10,14,0.72) 78%, transparent 100%)",
      }} />
      <div className="pointer-events-none" style={{
        position: "fixed", inset: 0, zIndex: 1,
        background: "radial-gradient(ellipse at 50% 30%, rgba(0,229,255,0.06) 0%, transparent 55%)",
      }} />

      {/* Petals — fixed layer 2 */}
      <CherryBlossoms />

      {/* All scrollable content — z-10 lifts entire block above fixed layers */}
      <div className="relative" style={{ zIndex: 10 }}>

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
      <section className="relative overflow-hidden flex flex-col items-center px-6 text-center"
        style={{ paddingTop: "7rem", paddingBottom: "5rem" }}>

        <div className="relative z-10 w-full flex flex-col items-center px-6 py-10 mb-6">

        <motion.p className="text-xs uppercase tracking-[0.4em] font-mono mb-8"
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
        </div>{/* end dark band */}

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
      <section id="work" className="max-w-6xl mx-auto px-6 py-24 relative" style={{ zIndex: 10 }}>
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
      <section id="skills" className="px-6 py-24 relative" style={{ zIndex: 10, background: "rgba(1,10,14,0.78)", backdropFilter: "blur(4px)" }}>
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
      <section id="experience" className="px-6 py-24 relative" style={{ zIndex: 10, background: "rgba(1,10,14,0.78)", backdropFilter: "blur(4px)" }}>
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
      <section className="px-6 py-24 text-center relative" style={{ zIndex: 10, background: "rgba(1,10,14,0.78)", backdropFilter: "blur(4px)" }}>
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

      </div>{/* end content wrapper */}
    </div>
  );
}
