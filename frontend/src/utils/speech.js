// Native Web Speech API utility for narrating space stories

let currentUtterance = null;

export function isSpeechSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function stopSpeech() {
  if (isSpeechSupported()) {
    window.speechSynthesis.cancel();
    if (currentUtterance) {
      currentUtterance = null;
    }
  }
}

export function speakText(text, { onStart, onEnd, onError } = {}) {
  if (!isSpeechSupported() || !text) {
    onEnd?.();
    return;
  }

  stopSpeech();

  const cleanText = text.replace(/[\u{1F300}-\u{1F9FF}]/gu, ""); // Strip emojis for natural voice reading
  const utterance = new SpeechSynthesisUtterance(cleanText);

  // Kid-friendly storytelling cadence: slightly slower for comprehension, warm pitch
  utterance.rate = 0.95;
  utterance.pitch = 1.05;

  // Prefer an English voice if available
  const voices = window.speechSynthesis.getVoices();
  const naturalVoice = voices.find(
    (v) => v.lang.startsWith("en") && (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Samantha"))
  ) || voices.find((v) => v.lang.startsWith("en"));

  if (naturalVoice) {
    utterance.voice = naturalVoice;
  }

  utterance.onstart = () => {
    onStart?.();
  };

  utterance.onend = () => {
    currentUtterance = null;
    onEnd?.();
  };

  utterance.onerror = (e) => {
    currentUtterance = null;
    if (e.error !== "canceled" && e.error !== "interrupted") {
      onError?.(e);
    }
    onEnd?.();
  };

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}
