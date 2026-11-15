import { useState } from "react";
import { X, ExternalLink, BookOpen, Search, Globe, Moon, Compass, Sparkles } from "lucide-react";
import referencesData from "../data/references.json";

export default function ReferencesModal({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  if (!isOpen) return null;

  const categories = ["all", "Moon", "Mars"];

  const filteredReferences = referencesData.filter((ref) => {
    const matchesCategory =
      selectedCategory === "all" || ref.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      ref.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ref.mission.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ref.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ref.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Dimmed backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
      />

      {/* Modal Container */}
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-500/30 bg-sky-950/40 text-sky-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400">
                  NASA Space Apps Challenge 2026
                </span>
              </div>
              <h3 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                NASA Mission Sources & References
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-800 text-neutral-400 transition-colors hover:border-neutral-600 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="border-b border-neutral-800/80 bg-neutral-900/40 px-6 py-3.5 sm:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold capitalize transition-all ${
                    selectedCategory === cat
                      ? "bg-white text-black shadow-sm"
                      : "border border-neutral-800 bg-neutral-900/80 text-neutral-300 hover:border-neutral-700 hover:text-white"
                  }`}
                >
                  {cat === "all" ? "All Sources" : cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search missions, records, LROC..."
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900/80 py-1.5 pl-8 pr-3 text-xs text-white placeholder-neutral-500 focus:border-sky-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Scrollable Reference List */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-4">
          <div className="mb-2 rounded-2xl border border-neutral-800/80 bg-neutral-900/30 p-4 text-xs text-neutral-300 leading-relaxed">
            <span className="font-bold text-white">Official NASA Bibliography:</span> All data, landing coordinates,
            scientific instruments, and achievements in this web app are compiled from verified NASA Science mission archives,
            the National Space Science Data Center (NSSDC), the NASA Technical Reports Server (NTRS), and Lunar Reconnaissance
            Orbiter Camera (LROC) temporal traverse galleries.
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {filteredReferences.map((ref, idx) => {
              return (
                <div
                  key={idx}
                  className="group flex flex-col justify-between rounded-2xl border border-neutral-800/80 bg-neutral-900/50 p-4 transition-all hover:border-neutral-700 hover:bg-neutral-900/80"
                >
                  <div>
                    <div className="flex items-center justify-end gap-2 mb-2">
                      <span className="text-[11px] font-mono text-neutral-400">
                        {ref.type}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                      {ref.title}
                    </h4>
                    <p className="mt-1 text-xs text-neutral-400 font-medium">
                      Mission: <span className="text-neutral-300">{ref.mission}</span>
                    </p>
                    <p className="mt-1.5 text-xs text-neutral-300 leading-relaxed">
                      {ref.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-neutral-800/60 flex items-center justify-between">
                    <span className="truncate max-w-[200px] text-[11px] font-mono text-neutral-500">
                      {ref.url.replace("https://", "")}
                    </span>
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-xl bg-sky-500/10 px-2.5 py-1 text-xs font-semibold text-sky-400 transition-colors hover:bg-sky-500/20 hover:text-sky-300"
                    >
                      <span>Visit Archive</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredReferences.length === 0 && (
            <div className="py-12 text-center text-sm text-neutral-400">
              No references found matching your search. Try adjusting keywords.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-neutral-800 px-6 py-3 sm:px-8 bg-neutral-950 flex items-center justify-between text-xs text-neutral-400">
          <span>{filteredReferences.length} verified NASA references documented</span>
          <button
            onClick={onClose}
            className="rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-1 font-semibold text-neutral-200 hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
