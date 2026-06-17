"use client";

import { motion, useInView } from "framer-motion";
import { useState, useRef } from "react";

const skills = [
  {
    front: { icon: "⚔️", title: "Combat Animation", desc: "Hand-keyed, frame perfect" },
    back: "Combat combos · Hit reactions · Takedowns · Death animations · Creature attacks · Weighty impactful motion",
    color: "from-purple-700 to-purple-950",
  },
  {
    front: { icon: "⚙️", title: "Technical Animation", desc: "Systems & implementation" },
    back: "State machines · Blend trees · AnimGraph · EventGraph · Blueprint · Unity Animator · Runtime logic",
    color: "from-indigo-700 to-indigo-950",
  },
  {
    front: { icon: "🦴", title: "Rigging & Pipeline", desc: "Characters & creatures" },
    back: "Biped & quadruped rigs · mGear · Custom control setups · MEL & Python tools · Pipeline automation",
    color: "from-pink-700 to-pink-950",
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
    videoId: "cMBqSQQhwRY",
    accentColor: "#22d3ee",
    bgFrom: "#0a2a30",
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
    videoId: "boCUKRDFxJY",
    accentColor: "#fb923c",
    bgFrom: "#2a1500",
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
    videoId: null,
    accentColor: "#c084fc",
    bgFrom: "#1a0a2a",
  },
];

const experience = [
  { years: "2026 – Now", role: "Gameplay & Technical Animator", studio: "Finitude", detail: "Remote · Berlin" },
  { years: "2023 – 2026", role: "Gameplay & Technical Animator", studio: "Screen Juice Interactive GmbH", detail: "Remote · Berlin" },
  { years: "2021", role: "3D Animator (Student)", studio: "iAnimate.net", detail: "Game Workshop 1 & 2 — Combat & Body Mechanics" },
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

function FlipCard({ skill, index, flipped, onClick }: {
  skill: typeof skills[0]; index: number; flipped: boolean; onClick: () => void;
}) {
  return (
    <motion.div
      className="cursor-pointer"
      style={{ perspective: 1000, height: 200 }}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15, duration: 0.6, ease: "easeOut" }}
      onClick={onClick}
    >
      <motion.div
        style={{ width: "100%", height: "100%", position: "relative", transformStyle: "preserve-3d" }}
        animate={{ rotateY: flipped ? 180 : 0, rotateX: flipped ? [0, -8, 0] : [0, 8, 0] }}
        transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
      >
        <div style={{ backfaceVisibility: "hidden" }}
          className="absolute inset-0 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between hover:border-purple-500 transition-colors duration-300">
          <div className="text-3xl">{skill.front.icon}</div>
          <div>
            <h3 className="text-white font-semibold text-lg mb-1">{skill.front.title}</h3>
            <p className="text-neutral-500 text-sm">{skill.front.desc}</p>
          </div>
          <p className="text-neutral-600 text-xs">click to flip</p>
        </div>
        <div style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          className={`absolute inset-0 bg-gradient-to-br ${skill.color} rounded-2xl p-6 flex flex-col justify-between`}>
          <div className="text-white text-xs uppercase tracking-widest opacity-60">{skill.front.title}</div>
          <p className="text-white text-sm leading-relaxed">{skill.back}</p>
          <p className="text-white/40 text-xs">click to flip back</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ProjectCard({ project, index }: { project: typeof projects[0]; index: number }) {
  const [videoOpen, setVideoOpen] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.1 }}
      className="bg-neutral-950 border border-neutral-800 rounded-3xl overflow-hidden"
    >
      {/* Video window */}
      <div
        className="relative w-full overflow-hidden"
        style={{ paddingTop: "56.25%", background: `linear-gradient(135deg, ${project.bgFrom}, #000)` }}
      >
        {videoOpen && project.videoId ? (
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube.com/embed/${project.videoId}?autoplay=1`}
            allow="autoplay; fullscreen"
            allowFullScreen
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div className="text-center px-8">
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: project.accentColor }}>
                {project.studio} · {project.years}
              </p>
              <h3 className="text-white text-3xl font-bold mb-1">{project.title}</h3>
              <p className="text-neutral-400 text-sm">{project.engine}</p>
            </div>
            {project.videoId && (
              <button
                onClick={() => setVideoOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-black transition-all hover:scale-105"
                style={{ background: project.accentColor }}
              >
                ▶ Watch Trailer
              </button>
            )}
            {!project.videoId && (
              <span className="px-4 py-1.5 rounded-full text-xs font-medium border"
                style={{ color: project.accentColor, borderColor: project.accentColor }}>
                In Development
              </span>
            )}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {project.tags.map(tag => (
            <span key={tag} className="text-xs px-3 py-1 rounded-full bg-neutral-800 text-neutral-400">{tag}</span>
          ))}
        </div>
        <p className="text-sm font-medium mb-2" style={{ color: project.accentColor }}>{project.role}</p>
        <p className="text-neutral-300 text-sm leading-relaxed mb-4">{project.desc}</p>
        {project.link && (
          <a href={project.link} target="_blank" rel="noopener noreferrer"
            className="text-xs text-neutral-500 hover:text-white transition-colors underline underline-offset-4">
            View on Steam →
          </a>
        )}
      </div>
    </motion.div>
  );
}

function TimelineItem({ item, index }: { item: typeof experience[0]; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -30 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="flex gap-6 group"
    >
      <div className="flex flex-col items-center">
        <div className="w-3 h-3 rounded-full border-2 border-purple-500 bg-black mt-1 group-hover:bg-purple-500 transition-colors" />
        <div className="w-px flex-1 bg-neutral-800 mt-2" />
      </div>
      <div className="pb-8">
        <p className="text-xs text-purple-400 mb-1 font-mono">{item.years}</p>
        <p className="text-white font-medium">{item.role}</p>
        <p className="text-neutral-400 text-sm">{item.studio}</p>
        <p className="text-neutral-600 text-xs mt-0.5">{item.detail}</p>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const [activeSkill, setActiveSkill] = useState<number | null>(null);

  return (
    <div className="bg-black text-white min-h-screen">

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-black/80 backdrop-blur-md border-b border-neutral-900">
        <span className="font-bold tracking-tight">Marko Rudjic</span>
        <div className="flex items-center gap-6 text-sm text-neutral-400">
          <a href="#work" className="hover:text-white transition-colors">Work</a>
          <a href="#skills" className="hover:text-white transition-colors">Skills</a>
          <a href="#experience" className="hover:text-white transition-colors">Experience</a>
          <a href="https://www.artstation.com/markorudjic/profile" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">ArtStation</a>
          <a href="mailto:Marko.Rudjic@gmx.ch"
            className="px-4 py-1.5 rounded-full border border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white transition-all text-xs">
            Get in touch
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 text-center">
        <motion.p
          className="text-xs uppercase tracking-widest text-purple-400 mb-6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}
        >
          Berlin, Germany · Available for Remote & Hybrid
        </motion.p>

        <motion.h1
          className="text-6xl md:text-8xl font-bold leading-none mb-6"
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
        >
          Marko
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">
            Rudjic
          </span>
        </motion.h1>

        <motion.p
          className="text-xl text-neutral-400 mb-4 font-light"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
        >
          Gameplay & Technical Animator
        </motion.p>

        <motion.p
          className="text-neutral-500 max-w-xl leading-relaxed mb-10 text-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.5 }}
        >
          Specialising in combat, locomotion and character systems for real-time games.
          5+ years building responsive, weighty animation systems in Unreal and Unity —
          from hand-keyed combat to state machine architecture and rigging pipeline supervision.
        </motion.p>

        <motion.div
          className="flex flex-wrap gap-3 justify-center mb-16"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.5 }}
        >
          <a href="#work"
            className="bg-white text-black font-medium px-6 py-3 rounded-full hover:bg-neutral-200 transition-colors text-sm">
            See my work
          </a>
          <a href="https://www.linkedin.com/in/marko-rudjic/" target="_blank" rel="noopener noreferrer"
            className="border border-neutral-700 text-white px-6 py-3 rounded-full hover:border-purple-500 transition-colors text-sm">
            LinkedIn
          </a>
          <a href="https://www.artstation.com/markorudjic/profile" target="_blank" rel="noopener noreferrer"
            className="border border-neutral-700 text-white px-6 py-3 rounded-full hover:border-purple-500 transition-colors text-sm">
            ArtStation
          </a>
        </motion.div>

        {/* Demo reel embed */}
        <motion.div
          className="w-full max-w-4xl mx-auto rounded-2xl overflow-hidden border border-neutral-800"
          style={{ boxShadow: "0 0 80px rgba(168,85,247,0.15)" }}
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.8 }}
        >
          <div style={{ position: "relative", paddingTop: "56.25%" }}>
            <iframe
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
              src="https://www.youtube.com/embed/nffNFElOPWY"
              title="Marko Rudjic — Demo Reel"
              allow="fullscreen"
              allowFullScreen
            />
          </div>
          <div className="bg-neutral-950 px-6 py-3 flex items-center justify-between">
            <span className="text-neutral-400 text-sm">Demo Reel 2026</span>
            <a href="https://www.youtube.com/watch?v=nffNFElOPWY" target="_blank" rel="noopener noreferrer"
              className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
              Watch on YouTube →
            </a>
          </div>
        </motion.div>
      </section>

      {/* Projects */}
      <section id="work" className="max-w-5xl mx-auto px-6 py-24">
        <motion.h2
          className="text-sm uppercase tracking-widest text-purple-400 mb-2"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        >
          Featured Work
        </motion.h2>
        <motion.p
          className="text-3xl font-bold mb-12"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        >
          Shipped titles & current project
        </motion.p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <ProjectCard key={project.title} project={project} index={i} />
          ))}
        </div>
      </section>

      {/* Skills flip cards */}
      <section id="skills" className="max-w-5xl mx-auto px-6 py-24">
        <motion.h2
          className="text-sm uppercase tracking-widest text-purple-400 mb-2"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        >
          Specialisations
        </motion.h2>
        <motion.p
          className="text-3xl font-bold mb-12"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        >
          What I bring to the team
        </motion.p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
          {skills.map((skill, i) => (
            <FlipCard
              key={skill.front.title}
              skill={skill}
              index={i}
              flipped={activeSkill === i}
              onClick={() => setActiveSkill(activeSkill === i ? null : i)}
            />
          ))}
        </div>

        {/* Tech stack */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {techStack.map(({ cat, items }) => (
            <div key={cat} className="bg-neutral-950 border border-neutral-800 rounded-xl p-4">
              <p className="text-xs text-purple-400 uppercase tracking-widest mb-3">{cat}</p>
              {items.map(item => (
                <p key={item} className="text-neutral-300 text-sm mb-1">{item}</p>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Experience */}
      <section id="experience" className="max-w-5xl mx-auto px-6 py-24">
        <motion.h2
          className="text-sm uppercase tracking-widest text-purple-400 mb-2"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        >
          Experience
        </motion.h2>
        <motion.p
          className="text-3xl font-bold mb-12"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        >
          Career timeline
        </motion.p>
        <div className="max-w-xl">
          {experience.map((item, i) => (
            <TimelineItem key={i} item={item} index={i} />
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <motion.h2
          className="text-4xl md:text-6xl font-bold mb-6"
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        >
          Let's work
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">together.</span>
        </motion.h2>
        <motion.p
          className="text-neutral-500 mb-10 max-w-md mx-auto"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        >
          Open to new opportunities in Berlin, remote or hybrid.
        </motion.p>
        <motion.div
          className="flex flex-wrap gap-4 justify-center"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        >
          <a href="mailto:Marko.Rudjic@gmx.ch"
            className="bg-white text-black font-medium px-8 py-3 rounded-full hover:bg-neutral-200 transition-colors">
            Send an email
          </a>
          <a href="https://www.linkedin.com/in/marko-rudjic/" target="_blank" rel="noopener noreferrer"
            className="border border-neutral-700 text-white px-8 py-3 rounded-full hover:border-purple-500 transition-colors">
            LinkedIn
          </a>
          <a href="https://www.artstation.com/markorudjic/profile" target="_blank" rel="noopener noreferrer"
            className="border border-neutral-700 text-white px-8 py-3 rounded-full hover:border-purple-500 transition-colors">
            ArtStation
          </a>
        </motion.div>
      </section>

      <footer className="border-t border-neutral-900 py-8 text-center text-neutral-600 text-xs">
        © 2026 Marko Rudjic · Gameplay & Technical Animator · Berlin
      </footer>

    </div>
  );
}
