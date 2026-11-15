import { useState, useEffect } from "react";
import { Volume2, Square, ExternalLink, CheckCircle2, XCircle, Sparkles, HelpCircle, ChevronDown, ChevronUp, MapPin, Calendar, Clock, Compass } from "lucide-react";
import { speakText, stopSpeech, isSpeechSupported } from "../utils/speech";

export default function SubTabStoryView({
  objects,
  onInspectObject,
  onDiscoverObject,
}) {
  // Group objects strictly 4 Moon and 4 Mars explorers (from NASA Challenge PDF)
  const groups = [
    {
      id: "moon-group",
      title: "The Apollo Landers and the Moon Buggy",
      period: "MOON · 1967 TO 1971",
      body: "moon",
      objectIds: ["apollo-11", "apollo-12", "apollo-15", "surveyor-3"],
    },
    {
      id: "mars-group",
      title: "The Martian Explorers and Rovers",
      period: "MARS · 1997 TO 2024",
      body: "mars",
      objectIds: [
        "mars-pathfinder",
        "spirit-rover",
        "opportunity-rover",
        "ingenuity-helicopter",
      ],
    },
  ];

  const [activeGroupId, setActiveGroupId] = useState("moon-group");
  const activeGroup = groups.find((g) => g.id === activeGroupId) || groups[0];

  const groupObjects = objects.filter((o) => activeGroup.objectIds.includes(o.id));
  const [selectedObjectId, setSelectedObjectId] = useState(groupObjects[0]?.id || "apollo-11");

  // Switch selected object when group changes if needed
  useEffect(() => {
    if (!activeGroup.objectIds.includes(selectedObjectId)) {
      setSelectedObjectId(activeGroup.objectIds[0]);
    }
  }, [activeGroupId]);

  const currentObj = objects.find((o) => o.id === selectedObjectId) || groupObjects[0] || objects[0];

  // Auto-discover in passport
  useEffect(() => {
    if (currentObj && onDiscoverObject) {
      onDiscoverObject(currentObj);
    }
  }, [currentObj?.id]);

  // Speech narration
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechOk = isSpeechSupported();

  useEffect(() => {
    stopSpeech();
    setIsSpeaking(false);
    return () => {
      stopSpeech();
      setIsSpeaking(false);
    };
  }, [selectedObjectId]);

  const handleToggleSpeech = () => {
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
    } else {
      const narration = `${currentObj.storyboard || currentObj.story} What we learned: ${(currentObj.whatWeLearned || []).join(". ")}`;
      speakText(narration, {
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  };

  // Mini quiz state for current object
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showExplanation, setShowExplanation] = useState({});
  const [showTechnicalDossier, setShowTechnicalDossier] = useState(false);

  const handleAnswerQuiz = (qIndex, optionIndex) => {
    if (quizAnswers[qIndex] !== undefined) return;
    setQuizAnswers((prev) => ({ ...prev, [qIndex]: optionIndex }));
    setShowExplanation((prev) => ({ ...prev, [qIndex]: true }));
  };

  const handleResetQuiz = () => {
    setQuizAnswers({});
    setShowExplanation({});
  };

  // Color theme
  const isMoon = currentObj.body === "moon";
  const isMars = currentObj.body === "mars";
  const accentText = isMoon ? "text-sky-400" : isMars ? "text-amber-400" : "text-purple-400";
  const accentBorder = isMoon ? "border-sky-500/40" : isMars ? "border-amber-500/40" : "border-purple-500/40";
  const accentBgLight = isMoon ? "bg-sky-500/10" : isMars ? "bg-amber-500/10" : "bg-purple-500/10";

  return (
    <div className="relative z-10 mx-auto w-full max-w-5xl px-3 py-6 sm:px-6 sm:py-8">
      {/* Top Group Switcher (Moon, Mars, Deep Space) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400">
              NASA Space Apps 2026 SubTab Experience
            </span>
            <span className="rounded-md border border-neutral-800 bg-neutral-900 px-2 py-0.5 text-[10px] font-bold text-neutral-400">
              SAMPLE FORMAT
            </span>
          </div>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            {activeGroup.title}
          </h2>
        </div>

        {/* Major Category Tabs */}
        <div className="flex items-center gap-1.5 rounded-2xl border border-neutral-800 bg-neutral-950/80 p-1">
          {groups.map((group) => {
            const isActive = group.id === activeGroupId;
            return (
              <button
                key={group.id}
                onClick={() => {
                  setActiveGroupId(group.id);
                  setQuizAnswers({});
                  setShowExplanation({});
                }}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                  isActive
                    ? "bg-white text-black shadow-sm"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {group.body === "moon" ? "Moon Landers" : group.body === "mars" ? "Mars Explorers" : "Deep Space"}
              </button>
            );
          })}
        </div>
      </div>

      {/* Explorer SubTabs Bar (As shown on PDF Page 32 sample: Eagle | Intrepid | The Moon Buggy ...) */}
      <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <span className="shrink-0 text-xs font-bold uppercase tracking-wider text-neutral-400 mr-1">
          SubTab:
        </span>
        {groupObjects.map((obj) => {
          const isSelected = obj.id === currentObj.id;
          return (
            <button
              key={obj.id}
              onClick={() => {
                setSelectedObjectId(obj.id);
                setQuizAnswers({});
                setShowExplanation({});
              }}
              className={`flex shrink-0 items-center gap-2 rounded-2xl border px-4 py-2 text-xs font-bold transition-all ${
                isSelected
                  ? "border-sky-400 bg-sky-400 text-slate-950 shadow-md scale-[1.02]"
                  : "border-neutral-800 bg-neutral-900/70 text-neutral-300 hover:border-neutral-600 hover:text-white"
              }`}
            >
              <span>{obj.subTabLabel || obj.name.split(" ")[0]}</span>
              {obj.year && (
                <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-mono ${
                  isSelected ? "bg-slate-900/20 text-slate-950 font-bold" : "bg-neutral-800 text-neutral-400"
                }`}>
                  {obj.year}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main SubTab Card (Direct realization of Page 32 Sample Card Layout) */}
      <div className="mt-6 overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950/90 shadow-2xl backdrop-blur-md">
        {/* Banner with Era and Group Title */}
        <div className="border-b border-neutral-800 bg-neutral-900/60 px-6 py-4 sm:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              {currentObj.subTabPeriod || activeGroup.period}
            </span>
            <h3 className="text-xl font-black text-white sm:text-2xl">
              {currentObj.subTabHeading || activeGroup.title}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className={`rounded-lg border px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${accentBorder} ${accentBgLight} ${accentText}`}>
              {currentObj.body}
            </span>
            {speechOk && (
              <button
                onClick={handleToggleSpeech}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
                  isSpeaking
                    ? "border-amber-400 bg-amber-400/20 text-amber-300 animate-pulse shadow-sm"
                    : "border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-600 hover:text-white"
                }`}
              >
                {isSpeaking ? <Square className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                <span>{isSpeaking ? "Stop Voice" : "Read Story"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Card Content Grid */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* Top Row: Illustrated Sleepy Robot Avatar + Quick Info Table */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
            {/* Cute Illustrated Robot Character Box (like sample on Page 32) */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center rounded-3xl border border-neutral-800 bg-gradient-to-b from-neutral-900/70 to-neutral-950 p-6 text-center shadow-inner relative overflow-hidden">
              {/* Subtle background glow */}
              <div className={`absolute h-40 w-40 rounded-full blur-2xl opacity-20 ${
                isMoon ? "bg-sky-400" : isMars ? "bg-amber-500" : "bg-purple-500"
              }`} />

              {/* Character Illustration SVG */}
              <div className="relative mb-3 flex items-center justify-center">
                <svg
                  viewBox="0 0 200 160"
                  className="h-32 w-40 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] transition-transform hover:scale-105 duration-300"
                >
                  {/* Stalk Antenna */}
                  <line x1="100" y1="20" x2="100" y2="45" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
                  <circle cx="100" cy="18" r="7" fill={isMoon ? "#38bdf8" : isMars ? "#fbbf24" : "#c084fc"} />
                  {/* Solar Wing / Ears */}
                  <rect x="20" y="55" width="28" height="12" rx="4" fill="#3b82f6" opacity="0.85" />
                  <rect x="152" y="55" width="28" height="12" rx="4" fill="#3b82f6" opacity="0.85" />
                  {/* Robot Main Body */}
                  <rect
                    x="48"
                    y="45"
                    width="104"
                    height="75"
                    rx="22"
                    fill={isMoon ? "#e2e8f0" : isMars ? "#fef3c7" : "#f3e8ff"}
                    stroke="#1e293b"
                    strokeWidth="4"
                  />
                  {/* Sleeping Eyelids (Zzz expression as in sample) */}
                  <path
                    d="M 68 78 Q 78 88 88 78"
                    fill="none"
                    stroke="#0f172a"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 112 78 Q 122 88 132 78"
                    fill="none"
                    stroke="#0f172a"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  {/* Cute rosy cheeks */}
                  <circle cx="66" cy="92" r="5" fill="#f43f5e" opacity="0.6" />
                  <circle cx="134" cy="92" r="5" fill="#f43f5e" opacity="0.6" />
                  {/* Sweet sleepy smile */}
                  <path
                    d="M 94 94 Q 100 100 106 94"
                    fill="none"
                    stroke="#334155"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  {/* Cute little legs or wheels */}
                  <rect x="62" y="120" width="12" height="16" rx="6" fill="#64748b" />
                  <rect x="126" y="120" width="12" height="16" rx="6" fill="#64748b" />
                  <rect x="52" y="132" width="32" height="10" rx="5" fill="#334155" />
                  <rect x="116" y="132" width="32" height="10" rx="5" fill="#334155" />
                  {/* Snooze bubble Zzz */}
                  <g className="animate-pulse">
                    <text x="145" y="32" fill="#38bdf8" fontSize="18" fontWeight="bold" fontFamily="sans-serif">
                      Z
                    </text>
                    <text x="157" y="24" fill="#38bdf8" fontSize="13" fontWeight="bold" fontFamily="sans-serif">
                      z
                    </text>
                    <text x="166" y="18" fill="#38bdf8" fontSize="10" fontWeight="bold" fontFamily="sans-serif">
                      z
                    </text>
                  </g>
                </svg>
              </div>

              {/* Resting Status Badge */}
              <div className="inline-flex items-center gap-1.5 rounded-full border border-neutral-700 bg-neutral-900 px-4 py-1.5 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-bold text-neutral-200">
                  {currentObj.restingStatus || "Zzz, resting peacefully"}
                </span>
              </div>

              {/* Real Archival Photo Preview Thumbnail */}
              {currentObj.image && (
                <div className="mt-4 w-full overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
                  <img
                    src={currentObj.image}
                    alt={currentObj.name}
                    className="h-28 w-full object-cover transition-transform duration-500 hover:scale-105"
                    loading="lazy"
                  />
                  {currentObj.imageCredit && (
                    <div className="bg-neutral-950 px-3 py-1 text-right text-[10px] text-neutral-400">
                      Photo: {currentObj.imageCredit}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Details Table (Where, When, Left Behind, Coordinates) */}
            <div className="lg:col-span-7 flex flex-col justify-between rounded-3xl border border-neutral-800 bg-neutral-900/40 p-6 sm:p-7">
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold uppercase tracking-wider ${accentText}`}>
                    Explorer Quick Specs
                  </span>
                  <span className="text-xs font-mono text-neutral-400">
                    Mission: {currentObj.mission}
                  </span>
                </div>
                <h4 className="mt-1 text-2xl font-extrabold text-white">
                  {currentObj.name}
                </h4>
                {currentObj.nickname && (
                  <p className="text-sm font-semibold italic text-neutral-300">
                    "{currentObj.nickname}"
                  </p>
                )}
              </div>

              {/* Table Rows matching Page 32 sample format */}
              <div className="mt-4 space-y-3 divide-y divide-neutral-800/80 text-sm">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between pt-2">
                  <span className="font-bold text-neutral-400 min-w-[120px]">Where:</span>
                  <span className="font-semibold text-white">{currentObj.where}</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between pt-2">
                  <span className="font-bold text-neutral-400 min-w-[120px]">When:</span>
                  <span className="font-semibold text-white">{currentObj.when}</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between pt-2">
                  <span className="font-bold text-neutral-400 min-w-[120px]">Left behind:</span>
                  <span className="font-medium text-neutral-200">{currentObj.leftBehind}</span>
                </div>

                {currentObj.distance && (
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between pt-2">
                    <span className="font-bold text-neutral-400 min-w-[120px]">Distance / Stats:</span>
                    <span className="font-medium text-neutral-200">{currentObj.distance}</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between pt-2">
                  <span className="font-bold text-neutral-400 min-w-[120px]">Coordinates:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-sky-300 font-semibold">
                      {currentObj.coordinatesText || `${currentObj.lat}°N, ${currentObj.lng}°E`}
                    </span>
                    {currentObj.coordinatesLink && (
                      <a
                        href={currentObj.coordinatesLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-md bg-sky-500/10 px-2 py-0.5 text-[11px] font-bold text-sky-400 hover:bg-sky-500/20"
                        title="View Official NASA / LROC Temporal Traverse"
                      >
                        <span>Traverse</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Action row */}
              <div className="mt-5 pt-3 border-t border-neutral-800 flex items-center justify-between">
                <button
                  onClick={() => onInspectObject(currentObj)}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-bold text-black transition-all hover:bg-neutral-200 shadow-md"
                >
                  <span>Open Full Dossier</span>
                  <span>→</span>
                </button>

                <button
                  onClick={() => setShowTechnicalDossier((prev) => !prev)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
                >
                  <span>{showTechnicalDossier ? "Hide Deep Specs" : "View Deep Specs"}</span>
                  {showTechnicalDossier ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* First-Person Storyboard (Kid-Friendly Voice from Document) */}
          <div className="rounded-3xl border border-neutral-800/90 bg-neutral-900/30 p-6 sm:p-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <h4 className="text-base font-extrabold uppercase tracking-wide text-white">
                  Storyboard Adventure
                </h4>
              </div>
              <span className="text-xs font-bold text-neutral-400">
                In the Explorer's Own Words
              </span>
            </div>

            <div className="space-y-4 text-base leading-relaxed text-neutral-200 sm:text-lg">
              {(currentObj.storyboard || currentObj.story)
                .split("\n\n")
                .map((paragraph, pIdx) => (
                  <p key={pIdx}>{paragraph}</p>
                ))}
            </div>
          </div>

          {/* What We Learned (From Document Pages 31-51) */}
          {currentObj.whatWeLearned && currentObj.whatWeLearned.length > 0 && (
            <div className="rounded-3xl border border-sky-500/20 bg-sky-950/10 p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-400 text-xs font-black text-slate-950">
                  ✓
                </span>
                <h4 className="text-lg font-bold text-white">
                  What We Learned
                </h4>
              </div>

              <div className="space-y-3">
                {currentObj.whatWeLearned.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-sky-400 shrink-0" />
                    <p className="text-sm sm:text-base font-medium text-neutral-200 leading-relaxed">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SubTab Specific Short Quiz (Pages 31-51) */}
          {currentObj.shortQuiz && currentObj.shortQuiz.length > 0 && (
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/40 p-6 sm:p-8">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-amber-400" />
                  <h4 className="text-lg font-extrabold text-white">
                    Short Quiz: Test Your Mission Knowledge!
                  </h4>
                </div>
                {Object.keys(quizAnswers).length > 0 && (
                  <button
                    onClick={handleResetQuiz}
                    className="rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-1 text-xs font-bold text-neutral-400 hover:text-white"
                  >
                    Reset Quiz
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {currentObj.shortQuiz.map((q, qIdx) => {
                  const userAnswer = quizAnswers[qIdx];
                  const hasAnswered = userAnswer !== undefined;
                  const isCorrect = userAnswer === q.correctIndex;

                  return (
                    <div
                      key={qIdx}
                      className="rounded-2xl border border-neutral-800/80 bg-neutral-950/50 p-5 space-y-3"
                    >
                      <h5 className="text-sm sm:text-base font-bold text-white">
                        {qIdx + 1}. {q.question}
                      </h5>

                      {/* Options */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {q.options.map((opt, optIdx) => {
                          const optionLetter = String.fromCharCode(65 + optIdx);
                          const isThisSelected = userAnswer === optIdx;
                          const isThisCorrect = optIdx === q.correctIndex;

                          let btnStyle = "border-neutral-800 bg-neutral-900/80 text-neutral-300 hover:border-neutral-600 hover:text-white";
                          if (hasAnswered) {
                            if (isThisCorrect) {
                              btnStyle = "border-emerald-500 bg-emerald-950/40 text-emerald-200 font-bold";
                            } else if (isThisSelected) {
                              btnStyle = "border-rose-500 bg-rose-950/40 text-rose-200";
                            } else {
                              btnStyle = "border-neutral-800/50 bg-neutral-950/40 text-neutral-600";
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              disabled={hasAnswered}
                              onClick={() => handleAnswerQuiz(qIdx, optIdx)}
                              className={`flex items-center gap-2.5 rounded-xl border p-3 text-left text-xs sm:text-sm transition-all ${btnStyle}`}
                            >
                              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-neutral-700 bg-neutral-800 font-mono text-[11px] font-bold">
                                {optionLetter}
                              </span>
                              <span className="flex-1">{opt}</span>
                              {hasAnswered && isThisCorrect && (
                                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                              )}
                              {hasAnswered && isThisSelected && !isThisCorrect && (
                                <XCircle className="h-4 w-4 text-rose-400 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Feedback & Explanation */}
                      {hasAnswered && (
                        <div className={`mt-2 rounded-xl p-3 text-xs leading-relaxed ${
                          isCorrect ? "bg-emerald-950/20 text-emerald-300 border border-emerald-500/20" : "bg-rose-950/20 text-rose-300 border border-rose-500/20"
                        }`}>
                          <span className="font-bold block mb-0.5">
                            {isCorrect ? "Correct! Well done!" : `Not quite! The correct answer is (${q.answerKey || String.fromCharCode(65 + q.correctIndex)}).`}
                          </span>
                          <span>{q.explanation}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Deep Technical Profile Expandable Accordion (Pages 2-18 Data) */}
          {showTechnicalDossier && (
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/30 p-6 sm:p-8 space-y-6 animate-fadeIn">
              <div className="border-b border-neutral-800 pb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400">
                  Comprehensive Mission Archives
                </span>
                <h4 className="text-xl font-extrabold text-white">
                  Technical Profile: {currentObj.name}
                </h4>
              </div>

              {/* Creators & People Involved */}
              {currentObj.people && currentObj.people.length > 0 && (
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                    People Involved & Mission Creators
                  </h5>
                  <ul className="space-y-1.5 text-sm text-neutral-200">
                    {currentObj.people.map((person, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2">
                        <span className="text-sky-400 font-bold">•</span>
                        <span>{person}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Main Purpose */}
              {currentObj.mainPurpose && currentObj.mainPurpose.length > 0 && (
                <div className="border-t border-neutral-800/80 pt-4">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                    Main Mission Purpose
                  </h5>
                  <ol className="space-y-1.5 text-sm text-neutral-200 list-decimal list-inside">
                    {currentObj.mainPurpose.map((goal, gIdx) => (
                      <li key={gIdx} className="leading-relaxed">
                        <span className="ml-1">{goal}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Experiments */}
              {currentObj.experiments && currentObj.experiments.length > 0 && (
                <div className="border-t border-neutral-800/80 pt-4">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                    Scientific Experiments & Payload
                  </h5>
                  <ul className="space-y-2 text-sm text-neutral-200">
                    {currentObj.experiments.map((exp, eIdx) => (
                      <li key={eIdx} className="rounded-xl border border-neutral-800/70 bg-neutral-950/40 p-3 leading-relaxed">
                        {exp}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Key Achievements */}
              {currentObj.achievements && currentObj.achievements.length > 0 && (
                <div className="border-t border-neutral-800/80 pt-4">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                    Key Achievements & Historic Milestones
                  </h5>
                  <ol className="space-y-1.5 text-sm text-neutral-200 list-decimal list-inside">
                    {currentObj.achievements.map((ach, aIdx) => (
                      <li key={aIdx} className="leading-relaxed">
                        <span className="ml-1">{ach}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Where Is It Now? */}
              {currentObj.whereIsItNow && (
                <div className="border-t border-neutral-800/80 pt-4">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Where Is It Now?
                  </h5>
                  <p className="text-sm text-neutral-300 leading-relaxed">
                    {currentObj.whereIsItNow}
                  </p>
                </div>
              )}

              {/* Overall Summary */}
              {currentObj.overallSummary && (
                <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                    NASA Mission Overview Summary
                  </span>
                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed italic">
                    "{currentObj.overallSummary}"
                  </p>
                </div>
              )}

              {/* Official Sources */}
              {currentObj.sourceUrl && (
                <div className="border-t border-neutral-800/80 pt-3 flex items-center justify-between">
                  <span className="text-xs text-neutral-400 font-mono">
                    NASA Mission Record Link:
                  </span>
                  <a
                    href={currentObj.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 hover:text-sky-300"
                  >
                    <span>Visit Official NASA Archive</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
