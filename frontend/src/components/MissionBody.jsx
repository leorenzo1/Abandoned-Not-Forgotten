import { useEffect, useState } from "react";
import { Volume2, Square } from "lucide-react";
import Drop from "./Drop";
import { speakText, stopSpeech, isSpeechSupported } from "../utils/speech";
import { playSfx } from "../utils/sfx";

// The kid-friendly story, the mission facts, the secret fact and the next-up teaser.
// Give it key={object.id} so the secret and the voice reset for each machine.
export default function MissionBody({ object, say }) {
  const [secret, setSecret] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const speechOk = isSpeechSupported();

  useEffect(() => () => stopSpeech(), []);

  const toggleVoice = () => {
    if (speaking) {
      stopSpeech();
      setSpeaking(false);
      return;
    }
    speakText(`${object.name}. ${object.nickname}. ${object.story}`, {
      onStart: () => setSpeaking(true),
      onEnd: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  };

  const revealSecret = () => {
    setSecret(true);
    playSfx("right");
    say?.("Ooh, a secret fact! Good scientists always dig for the little details.");
  };

  return (
    <div className="space-y-4">
      {speechOk && (
        <button className={`toon-btn sky text-sm ${speaking ? "animate-pulse" : ""}`} onClick={toggleVoice}>
          {speaking ? <Square className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          <span>{speaking ? "Stop voice" : "Read me the story"}</span>
        </button>
      )}

      <p className="text-lg leading-relaxed text-white sm:text-xl">{object.story || "Story coming soon."}</p>

      {object.facts?.length > 0 && (
        <div>
          <h4 className="mb-2 text-lg font-bold text-[#4cc9f0]">Mission facts</h4>
          <ul className="space-y-1.5">
            {object.facts.map((f) => (
              <li key={f.label + f.value} className="toon-fact">
                {f.label && <b>{f.label}: </b>}
                {f.value}
              </li>
            ))}
          </ul>
        </div>
      )}

      {object.secret && (
        <div>
          {!secret && (
            <button className="toon-btn" onClick={revealSecret}>
              💡 Secret fact!
            </button>
          )}
          {secret && <div className="toon-secret">💡 {object.secret}</div>}
        </div>
      )}

      {object.drop && <Drop say={say} />}

      {object.next && (
        <p className="toon-soft px-3 py-2 text-base text-violet-100">
          <b className="text-[#ffd23f]">Next up: </b>
          {object.next}
        </p>
      )}
    </div>
  );
}
