import { useState, useEffect } from "react";
import { X, Award } from "lucide-react";
import quizData from "../data/quiz.json";

export default function QuizModal({ isOpen, onClose }) {
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

  const currentQ = quizData[currentIndex];
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
    if (currentIndex + 1 < quizData.length) {
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

  const getRank = (finalScore, total) => {
    const ratio = finalScore / total;
    if (ratio === 1) return { title: "Chief Cosmologist", desc: "Flawless mission! You know the Moon & Mars like the back of your hand!" };
    if (ratio >= 0.75) return { title: "Rover Flight Commander", desc: "Outstanding work! NASA Mission Control wants you on the team!" };
    if (ratio >= 0.5) return { title: "Planetary Scout", desc: "Great job! You're well on your way to becoming a veteran space explorer!" };
    return { title: "Cadet Explorer", desc: "A great start! Revisit the solar monuments and test your skills again!" };
  };

  const rank = getRank(score, quizData.length);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
      />

      {/* Quiz Card */}
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4 sm:px-8">
          <div>
            <h3 className="text-lg font-bold tracking-tight text-white sm:text-xl">
              Junior Space Quiz
            </h3>
            <p className="text-xs text-neutral-400">
              Test your knowledge of NASA's historic machines
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-neutral-800 text-neutral-400 transition-colors hover:border-neutral-600 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          {!isFinished ? (
            <div className="space-y-6">
              {/* Question progress */}
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span className="font-semibold uppercase tracking-wider">
                  Question {currentIndex + 1} of {quizData.length}
                </span>
                <span className="font-mono font-medium text-sky-400">
                  Score: {score}
                </span>
              </div>

              {/* Question statement */}
              <h4 className="text-lg font-bold text-white sm:text-xl leading-snug">
                {currentQ.question}
              </h4>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQ.options.map((opt, idx) => {
                  let btnStyle = "border-neutral-800 bg-neutral-900/60 text-neutral-200 hover:border-neutral-600 hover:bg-neutral-800/80";

                  if (hasAnswered) {
                    if (idx === currentQ.correctIndex) {
                      btnStyle = "border-emerald-500 bg-emerald-950/40 text-emerald-200 shadow-sm";
                    } else if (idx === selectedOption) {
                      btnStyle = "border-rose-500 bg-rose-950/40 text-rose-200";
                    } else {
                      btnStyle = "border-neutral-900 bg-neutral-950/40 text-neutral-500 opacity-40";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={hasAnswered}
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full rounded-2xl border p-3.5 text-left text-sm font-semibold transition-all flex items-center justify-between ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {hasAnswered && idx === currentQ.correctIndex && (
                        <span className="text-emerald-400 font-bold">✓</span>
                      )}
                      {hasAnswered && idx === selectedOption && idx !== currentQ.correctIndex && (
                        <span className="text-rose-400 font-bold">✗</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Fun explanation reveal */}
              {hasAnswered && (
                <div
                  className={`rounded-2xl border p-4 text-sm transition-all ${
                    isCorrect
                      ? "border-emerald-500/40 bg-emerald-950/20 text-emerald-200"
                      : "border-sky-500/40 bg-sky-950/20 text-sky-200"
                  }`}
                >
                  <div className="font-bold mb-1">
                    {isCorrect ? "Great job!" : "Did you know?"}
                  </div>
                  <p className="text-xs text-neutral-200 leading-relaxed font-medium">
                    {currentQ.funFact}
                  </p>
                </div>
              )}

              {/* Next button */}
              {hasAnswered && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleNext}
                    className="rounded-2xl bg-white px-6 py-2.5 text-sm font-bold text-black shadow-md transition-all hover:bg-neutral-200"
                  >
                    {currentIndex + 1 < quizData.length ? "Next Question →" : "See Final Score"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Results Screen */
            <div className="space-y-6 text-center py-4">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-sky-500/40 bg-sky-950/30 text-sky-400 shadow-lg">
                <Award className="h-10 w-10 text-sky-400" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                  Mission Report
                </span>
                <h4 className="text-2xl font-extrabold text-white sm:text-3xl mt-1">
                  {rank.title}
                </h4>
                <p className="text-sm text-neutral-300 mt-2 max-w-sm mx-auto">
                  {rank.desc}
                </p>
              </div>

              <div className="inline-block rounded-2xl border border-neutral-800 bg-neutral-900/60 px-6 py-3">
                <span className="text-xs text-neutral-400 block uppercase font-medium">
                  Final Score
                </span>
                <span className="text-3xl font-extrabold text-white font-mono">
                  {score} / {quizData.length}
                </span>
              </div>

              <div className="flex items-center justify-center gap-3 pt-4">
                <button
                  onClick={handleRestart}
                  className="rounded-xl border border-neutral-700 bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-neutral-800"
                >
                  Play Again
                </button>
                <button
                  onClick={onClose}
                  className="rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-black transition-all hover:bg-neutral-200"
                >
                  Back to Map
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}