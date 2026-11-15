import { useEffect, useState } from "react";
import { speakText, stopSpeech, isSpeechSupported } from "../utils/speech";

// Commander Nova: a drawn astronaut teacher who talks to the kids on every screen.
// `msg` is what she says, and `talk` changes each time she speaks so she hops.
export default function Nova({ msg, talk }) {
  const [hidden, setHidden] = useState(false);
  const [voice, setVoice] = useState(false);
  const canSpeak = isSpeechSupported();
  const line = { stroke: "#2a1a55", strokeWidth: 4 };

  // Read her messages out loud (only after the child turns the voice on)
  useEffect(() => {
    if (voice && msg) speakText(msg);
  }, [voice, msg, talk]);

  const toggleVoice = () => {
    if (voice) stopSpeech();
    setVoice((v) => !v);
  };

  return (
    <aside className="nova" aria-live="polite">
      <button
        className="nova-astro"
        aria-label={hidden ? "Show Commander Nova's message" : "Hide Commander Nova's message"}
        onClick={() => setHidden((h) => !h)}
      >
        <span key={talk} className="nova-talk">
          <svg viewBox="0 0 100 120" width="84" height="100" aria-hidden="true">
            <path d="M78 72 L97 38" stroke="#c98a3b" strokeWidth="5" strokeLinecap="round" />
            <rect x="12" y="52" width="30" height="50" rx="12" fill="#c9c9dc" {...line} />
            <rect x="26" y="56" width="50" height="56" rx="16" fill="#fff" {...line} />
            <circle cx="51" cy="84" r="8" fill="#ff6b9d" stroke="#2a1a55" strokeWidth="3" />
            <circle cx="50" cy="38" r="30" fill="#fff" {...line} />
            <ellipse cx="50" cy="40" rx="22" ry="18" fill="#2a4bd8" stroke="#2a1a55" strokeWidth="3" />
            <ellipse cx="40" cy="31" rx="6" ry="3" fill="#fff" opacity=".55" />
            <circle cx="42" cy="40" r="6" fill="none" stroke="#ffd23f" strokeWidth="2" />
            <circle cx="58" cy="40" r="6" fill="none" stroke="#ffd23f" strokeWidth="2" />
            <path d="M48 40h4" stroke="#ffd23f" strokeWidth="2" />
            <path d="M43 50q7 6 14 0" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" />
          </svg>
        </span>
      </button>

      {!hidden && (
        <div className="nova-board">
          <div className="flex items-center justify-between gap-2">
            <b>Commander Nova, your space teacher</b>
            {canSpeak && (
              <button
                onClick={toggleVoice}
                aria-pressed={voice}
                aria-label={voice ? "Turn Nova's voice off" : "Turn Nova's voice on"}
                className="rounded-full border-2 border-[#9a6a33] px-2 text-sm"
              >
                {voice ? "🔊" : "🔇"}
              </button>
            )}
          </div>
          <p>{msg}</p>
        </div>
      )}
    </aside>
  );
}
