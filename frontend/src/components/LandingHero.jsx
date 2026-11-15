import { Compass, BookOpen, Rocket, Award, Sparkles, Globe, Moon, ChevronRight } from "lucide-react";

export default function LandingHero({ onNavigate, onOpenQuiz, onOpenPassport, onOpenReferences }) {
  return (
    <section className="relative z-10 flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-12 text-center max-w-5xl mx-auto">
      {/* Hackathon Badge */}
      <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-950/40 px-4 py-1.5 text-xs font-bold text-sky-300 shadow-sm backdrop-blur-md mb-6">
        <Sparkles className="h-3.5 w-3.5 text-sky-400" />
        <span>NASA Space Apps Challenge 2026</span>
        <span className="rounded bg-sky-400/20 px-1.5 py-0.2 text-[10px] text-sky-200">Official Project</span>
      </div>

      {/* Main Title */}
      <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl md:text-7xl leading-tight">
        Abandoned, <br className="hidden sm:inline" />
        <span className="bg-gradient-to-r from-sky-400 via-amber-300 to-purple-400 bg-clip-text text-transparent">
          Not Forgotten
        </span>
      </h1>

      {/* Inspiring Subtitle connecting hardware to discoveries (Page 56 of Challenge Brief) */}
      <p className="mx-auto mt-5 max-w-2xl text-base font-medium leading-relaxed text-neutral-300 sm:text-lg">
        Meet the heroic spacecraft, rovers, and landers NASA left behind on the Moon and Mars.
        Every explorer is the main character of its own adventure—discover who they were, what they uncovered, and why their mission mattered to humanity.
      </p>

      {/* Core Hackathon Highlight Quote */}
      <div className="mt-6 max-w-xl rounded-2xl border border-neutral-800/80 bg-neutral-950/70 p-4 text-xs text-neutral-300 backdrop-blur-sm italic">
        "The most important part of the journey is connecting the hardware to the discoveries it made possible."
      </div>

      {/* 4 Suggested Navigation Gateway Cards (Page 55) */}
      <div className="mt-10 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 text-left">
        {/* Card 1: Explore the Forgotten Explorers */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onNavigate("map")}
          className="group cursor-pointer rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5 backdrop-blur-md transition-all hover:border-sky-400/60 hover:bg-neutral-900/90 hover:scale-[1.02] shadow-lg flex flex-col justify-between"
        >
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-sky-500/30 bg-sky-950/40 text-sky-400 mb-3">
              <Compass className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
              Interactive 3D
            </span>
            <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors">
              Explore the Planets
            </h3>
            <p className="mt-1 text-xs text-neutral-400 leading-relaxed">
              Orbit the Moon & Mars in WebGL. Pinpoint landing coordinates and radar beacons.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-sky-400">
            <span>Launch Explorer</span>
            <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 2: SubTabs & Storyboard */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onNavigate("subtabs")}
          className="group cursor-pointer rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5 backdrop-blur-md transition-all hover:border-amber-400/60 hover:bg-neutral-900/90 hover:scale-[1.02] shadow-lg flex flex-col justify-between"
        >
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-950/40 text-amber-400 mb-3">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
              Sample Format
            </span>
            <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
              SubTabs & Stories
            </h3>
            <p className="mt-1 text-xs text-neutral-400 leading-relaxed">
              Read first-person stories, sleeping avatar cards, what we learned, and mission mini-quizzes.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-amber-400">
            <span>Open SubTabs</span>
            <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 3: Mission Games & Quizzes */}
        <div
          role="button"
          tabIndex={0}
          onClick={onOpenQuiz}
          className="group cursor-pointer rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5 backdrop-blur-md transition-all hover:border-rose-400/60 hover:bg-neutral-900/90 hover:scale-[1.02] shadow-lg flex flex-col justify-between"
        >
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-500/30 bg-rose-950/40 text-rose-400 mb-3">
              <Rocket className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
              Interactive Games
            </span>
            <h3 className="text-base font-bold text-white group-hover:text-rose-300 transition-colors">
              Mission Games
            </h3>
            <p className="mt-1 text-xs text-neutral-400 leading-relaxed">
              29 challenge questions from real missions. Earn astronaut ranks and test your skills.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-rose-400">
            <span>Play Challenge</span>
            <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 4: Space Discovery Collection */}
        <div
          role="button"
          tabIndex={0}
          onClick={onOpenPassport}
          className="group cursor-pointer rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5 backdrop-blur-md transition-all hover:border-emerald-400/60 hover:bg-neutral-900/90 hover:scale-[1.02] shadow-lg flex flex-col justify-between"
        >
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-950/40 text-emerald-400 mb-3">
              <Award className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Passport Tracker
            </span>
            <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
              Discovery Collection
            </h3>
            <p className="mt-1 text-xs text-neutral-400 leading-relaxed">
              Collect official badges (Lunar Pioneer, Martian Trailblazer) and unlock secret archival facts.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-emerald-400">
            <span>View Passport</span>
            <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Fast Action Row */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => onNavigate("subtabs")}
          className="flex items-center gap-2 rounded-2xl bg-sky-400 px-7 py-3 text-sm font-bold text-slate-950 transition-all hover:bg-sky-300 shadow-lg shadow-sky-500/20"
        >
          <span>Explore SubTab Stories</span>
          <ChevronRight className="h-4 w-4" />
        </button>

        <button
          onClick={() => onNavigate("map")}
          className="flex items-center gap-2 rounded-2xl border border-neutral-700 bg-neutral-900/80 px-7 py-3 text-sm font-bold text-neutral-200 transition-all hover:border-neutral-500 hover:text-white backdrop-blur-sm"
        >
          <span>3D Planetary Map</span>
        </button>

        <button
          onClick={onOpenReferences}
          className="flex items-center gap-2 rounded-2xl border border-neutral-800 bg-neutral-950 px-5 py-3 text-sm font-bold text-neutral-400 transition-all hover:border-neutral-600 hover:text-white"
        >
          <BookOpen className="h-4 w-4 text-purple-400" />
          <span>NASA References (Pages 57-58)</span>
        </button>
      </div>
    </section>
  );
}
