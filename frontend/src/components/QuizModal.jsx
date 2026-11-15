import { useState, useEffect } from "react";
import { X, Award, CheckCircle2, XCircle, Sparkles, RefreshCw, Trophy, HelpCircle, Rocket } from "lucide-react";
import quizData from "../data/quiz.json";

export default function QuizModal({ isOpen, onClose }) {
  const [filterMission, setFilterMission] = useState("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const missions = ["all", "Apollo 11", "Apollo 12", "Apollo 15", "Surveyor 3", "Spirit Rover", "Opportunity Rover", "Viking 1", "Viking 2", "Ingenuity Helicopter", "Mars Pathfinder", "InSight Lander", "Voyager 1"];

  const activeQuestions = filterMission === "all"
    ? quizData
    : quizData.filter((q) => q.mission?.toLowerCase().includes(filterMission.toLowerCase()));

  const currentQ = activeQuestions[currentIndex] || activeQuestions[0];
  const isCorrect = selectedOption === currentQ?.correctIndex;

  const handleSelectOption = (index) => {
    if (hasAnswered) return;
    setSelectedOption(index);
    setHasAnswered(true);
    if (index === currentQ.correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < activeQuestions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setHasAnswered(false);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setHasAnswered(false);
    setScore(0);
    setIsFinished(false);
  };

  const handleMissionFilterChange = (m) => {
    setFilterMission(m);
    setCurrentIndex(0);
    setSelectedOption(null);
    setHasAnswered(false);
    setScore(0);
    setIsFinished(false);
  };

  const getRank = (finalScore, total) => {
    const ratio = total > 0 ? finalScore / total : 0;
    if (ratio === 1) return { title: "Chief Cosmologist", desc: "Flawless mission! You know every machine on the Moon, Mars, and Deep Space like the back of your hand!" };
    if (ratio >= 0.75) return { title: "Rover Flight Commander", desc: "Outstanding work! NASA Mission Control wants you on the exploration flight line!" };
    if (ratio >= 0.5) return { title: "Planetary Scout", desc: "Great job! You're well on your way to becoming a veteran space explorer!" };
    return { title: "Cadet Explorer", desc: "A great start! Revisit the explorer subtabs and take on the challenge again!" };
  };

  const rank = getRank(score, activeQuestions.length);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
      />

      {/* Quiz Card */}
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4 sm:px-8 bg-neutral-950">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-950/30 text-amber-400">
              <Rocket className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  Mission Games & Trivia
                </span>
                <span className="rounded-md border border-neutral-800 bg-neutral-900 px-1.5 py-0.2 font-mono text-[10px] text-neutral-400">
                  36 Questions
                </span>
              </div>
              <h3 className="text-lg font-bold tracking-tight text-white sm:text-xl">
                NASA Junior Space Challenge
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-neutral-800 text-neutral-400 transition-colors hover:border-neutral-600 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="border-b border-neutral-800/80 bg-neutral-900/40 px-6 py-2.5 sm:px-8 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-bold uppercase text-neutral-400 shrink-0 mr-1">
            Topic:
          </span>
          {["all", "Apollo 11", "Apollo 12", "Apollo 15", "Surveyor 3", "Spirit Rover", "Opportunity Rover", "Viking 1", "Viking 2", "Ingenuity Helicopter", "Mars Pathfinder", "Voyager 1"].map((m) => (
            <button
              key={m}
              onClick={() => handleMissionFilterChange(m)}
              className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                filterMission === m
                  ? "bg-amber-400 text-slate-950 font-bold"
                  : "bg-neutral-900 text-neutral-400 hover:text-white"
              }`}
            >
              {m === "all" ? "All Missions" : m}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          {!isFinished ? (
            <div className="space-y-6">
              {/* Question progress and Score */}
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span className="font-semibold uppercase tracking-wider text-amber-300">
                  Question {currentIndex + 1} of {activeQuestions.length}
                </span>
                <span className="font-mono font-bold text-white bg-neutral-900 px-2 py-0.5 rounded-lg border border-neutral-800">
                  Score: {score}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-sky-400 transition-all duration-300 ease-out"
                  style={{
                    width: `${((currentIndex + 1) / activeQuestions.length) * 100}%`,
                  }}
                />
              </div>

              {/* Question Title & Mission Pill */}
              <div className="space-y-2">
                {currentQ?.mission && (
                  <span className="inline-block rounded-md border border-neutral-800 bg-neutral-900 px-2.5 py-0.5 text-[11px] font-semibold text-neutral-400">
                    Mission Focus: {currentQ.mission}
                  </span>
                )}
                <h4 className="text-lg font-bold text-white sm:text-xl leading-snug">
                  {currentQ?.question}
                </h4>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQ?.options.map((option, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  const isThisSelected = selectedOption === idx;
                  const isThisCorrect = idx === currentQ.correctIndex;

                  let buttonStyle = "border-neutral-800 bg-neutral-900/60 text-neutral-200 hover:border-neutral-700 hover:bg-neutral-900";

                  if (hasAnswered) {
                    if (isThisCorrect) {
                      buttonStyle = "border-emerald-500/80 bg-emerald-950/40 text-emerald-200 font-semibold";
                    } else if (isThisSelected && !isThisCorrect) {
                      buttonStyle = "border-rose-500/80 bg-rose-950/40 text-rose-200";
                    } else {
                      buttonStyle = "border-neutral-900 bg-neutral-950 text-neutral-600";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={hasAnswered}
                      onClick={() => handleSelectOption(idx)}
                      className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left text-sm transition-all ${buttonStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg border border-neutral-700 bg-neutral-800 font-mono text-xs font-bold text-white">
                          {letter}
                        </span>
                        <span>{option}</span>
                      </div>

                      {hasAnswered && isThisCorrect && (
                        <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                      )}
                      {hasAnswered && isThisSelected && !isThisCorrect && (
                        <XCircle className="h-5 w-5 text-rose-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Feedback Explanation Card */}
              {hasAnswered && (
                <div
                  className={`rounded-2xl border p-4.5 text-xs sm:text-sm leading-relaxed ${
                    isCorrect
                      ? "border-emerald-500/30 bg-emerald-950/20 text-emerald-200"
                      : "border-rose-500/30 bg-rose-950/20 text-rose-200"
                  }`}
                >
                  <p className="font-bold mb-1">
                    {isCorrect ? "Spot on, Space Explorer!" : `Not quite! The correct answer is (${currentQ.answerKey || String.fromCharCode(65 + currentQ.correctIndex)}).`}
                  </p>
                  <p className="text-neutral-300 font-medium">{currentQ.funFact}</p>
                </div>
              )}

              {/* Next button */}
              {hasAnswered && (
                <div className="pt-2">
                  <button
                    onClick={handleNext}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-bold text-black transition-all hover:bg-neutral-200 shadow-md"
                  >
                    <span>
                      {currentIndex + 1 < activeQuestions.length
                        ? "Next Question"
                        : "Finish Mission Challenge"}
                    </span>
                    <span>→</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Finished Score Screen */
            <div className="flex flex-col items-center py-6 text-center space-y-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-amber-500/30 bg-amber-500/10 shadow-xl">
                <Trophy className="h-10 w-10 text-amber-400 animate-bounce" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                  Mission Complete
                </span>
                <h4 className="mt-1 text-2xl font-black text-white sm:text-3xl">
                  {rank.title}
                </h4>
                <p className="mx-auto mt-2 max-w-md text-xs sm:text-sm text-neutral-300">
                  {rank.desc}
                </p>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 px-8 py-5">
                <span className="text-xs uppercase tracking-wider text-neutral-400 font-semibold">
                  Final Score
                </span>
                <div className="mt-1 text-4xl font-black text-white">
                  {score}{" "}
                  <span className="text-lg font-medium text-neutral-400">
                    / {activeQuestions.length}
                  </span>
                </div>
                <div className="text-xs text-neutral-400 mt-1 font-mono">
                  {Math.round((score / activeQuestions.length) * 100)}% accuracy
                </div>
              </div>

              <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  onClick={handleRestart}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3 text-xs sm:text-sm font-bold text-black transition-all hover:bg-neutral-200"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Try Again</span>
                </button>
                <button
                  onClick={onClose}
                  className="rounded-2xl border border-neutral-800 bg-neutral-900 px-6 py-3 text-xs sm:text-sm font-bold text-neutral-300 hover:text-white"
                >
                  Close Quiz
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
