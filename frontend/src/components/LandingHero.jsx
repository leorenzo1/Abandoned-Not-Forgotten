import { Compass, BookOpen, Rocket, Award, Globe, ChevronRight, Database } from "lucide-react";

export default function LandingHero({ onNavigate, onOpenQuiz, onOpenPassport, onOpenReferences }) {
  return (
    <section className="relative z-10 flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center px-4 py-6 text-center max-w-5xl mx-auto">
      {/* Main Title - Single clean focal point */}
      <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl md:text-6xl leading-tight">
        Abandoned, Not Forgotten
      </h1>

      {/* Inspiring Subtitle connecting hardware to discoveries for kids & casual space lovers */}
      <p className="mx-auto mt-3 max-w-2xl text-sm font-medium leading-relaxed text-neutral-300 sm:text-base">
        Meet the heroic spacecraft, rovers, and landers NASA left behind on the Moon and Mars.
        Every explorer is the hero of its own adventure—discover who they were, what they found, and why they matter to humanity!
      </p>

      {/* 4 Interactive Gateway Cards */}
      <div className="mt-8 grid w-full grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4 text-left">
        {/* Card 1: Explore 3D Planets */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onNavigate("map")}
          className="group cursor-pointer rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 backdrop-blur-md transition-all hover:border-sky-400/60 hover:bg-neutral-900/90 hover:scale-[1.02] shadow-lg flex flex-col justify-between"
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
              Orbit the Moon & Mars in 3D. Pinpoint real landing coordinates and surface sites.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-sky-400">
            <span>Launch 3D Explorer</span>
            <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 2: Mission Stories & Timeline */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onNavigate("story")}
          className="group cursor-pointer rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 backdrop-blur-md transition-all hover:border-amber-400/60 hover:bg-neutral-900/90 hover:scale-[1.02] shadow-lg flex flex-col justify-between"
        >
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-950/40 text-amber-400 mb-3">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
              Storybook Journey
            </span>
            <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
              Mission Stories
            </h3>
            <p className="mt-1 text-xs text-neutral-400 leading-relaxed">
              Step through history from 1967 to 2024. Read first-person stories with voice narration.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-amber-400">
            <span>Read Stories</span>
            <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 3: Junior Space Quiz */}
        <div
          role="button"
          tabIndex={0}
          onClick={onOpenQuiz}
          className="group cursor-pointer rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 backdrop-blur-md transition-all hover:border-rose-400/60 hover:bg-neutral-900/90 hover:scale-[1.02] shadow-lg flex flex-col justify-between"
        >
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-500/30 bg-rose-950/40 text-rose-400 mb-3">
              <Rocket className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
              Interactive Trivia
            </span>
            <h3 className="text-base font-bold text-white group-hover:text-rose-300 transition-colors">
              Junior Space Quiz
            </h3>
            <p className="mt-1 text-xs text-neutral-400 leading-relaxed">
              Fun trivia questions from real missions. Earn astronaut ranks and test your space knowledge!
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-rose-400">
            <span>Play Quiz</span>
            <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 4: Discovery Passport */}
        <div
          role="button"
          tabIndex={0}
          onClick={onOpenPassport}
          className="group cursor-pointer rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 backdrop-blur-md transition-all hover:border-emerald-400/60 hover:bg-neutral-900/90 hover:scale-[1.02] shadow-lg flex flex-col justify-between"
        >
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-950/40 text-emerald-400 mb-3">
              <Award className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Collect Stamps
            </span>
            <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
              Explorer Passport
            </h3>
            <p className="mt-1 text-xs text-neutral-400 leading-relaxed">
              Collect badges as you meet each lunar lander and Martian rover across the solar system.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-emerald-400">
            <span>View Passport</span>
            <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Subtle, non-redundant NASA Open Data footer citation */}
      <div className="mt-8 flex flex-col items-center justify-center gap-2">
        <button
          onClick={onOpenReferences}
          className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
        >
          <Database className="h-3.5 w-3.5 text-purple-400" />
          <span>Official NASA Mission Data & Science Sources</span>
        </button>

        {/* NASA Space Apps Challenge 2026 styled cleanly without outline */}
        <div className="inline-flex items-center gap-1.5 text-xs text-neutral-400">
          <Globe className="h-3.5 w-3.5 text-sky-400" />
          <span>NASA Space Apps Challenge 2026</span>
        </div>
      </div>
    </section>
  );
}
