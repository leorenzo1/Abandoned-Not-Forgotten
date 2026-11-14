// Native Web Speech API utility for fluent space storytelling

let currentUtterance = null;
let cachedVoices = [];

export function isSpeechSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function loadVoices() {
  if (!isSpeechSupported()) return [];
  const list = window.speechSynthesis.getVoices();
  if (list && list.length > 0) {
    cachedVoices = list;
  }
  return cachedVoices;
}

// Preload voices immediately on module evaluation and listen for changes
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  loadVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => {
      loadVoices();
    };
  }
}

function scoreFluentVoice(voice) {
  const name = voice.name.toLowerCase();
  const lang = voice.lang.toLowerCase().replace("_", "-");

  // Filter out legacy robotic desktop synthesizers (SAPI5 "Microsoft David", "Mark", "Zira", etc.)
  if (name.includes("desktop") || name.includes("david") || name.includes("mark") || name.includes("zira")) {
    return -100;
  }

  // Must be English
  if (!lang.startsWith("en")) return -200;

  let score = 0;

  // Fluent British accent is prime choice for rich astronomy & space documentary storytelling
  if (lang === "en-gb" || lang.startsWith("en-gb")) score += 60;
  else if (lang === "en-au" || lang.startsWith("en-au")) score += 35;
  else if (lang === "en-us" || lang.startsWith("en-us")) score += 25;
  else score += 15;

  // Modern Neural / Natural online voices have smooth intonation and prosody
  if (name.includes("natural") || name.includes("online")) score += 45;
  if (name.includes("neural")) score += 45;
  if (name.includes("enhanced")) score += 35;

  // High-articulation fluent documentary voices
  if (name.includes("google uk english female")) score += 75;
  else if (name.includes("google uk english male")) score += 70;
  else if (name.includes("libby") || name.includes("sonia") || name.includes("ryan") || name.includes("maisie")) score += 40;
  else if (name.includes("george") || name.includes("hazel") || name.includes("oliver") || name.includes("daniel")) score += 30;
  else if (name.includes("google us english")) score += 30;
  else if (name.includes("aria") || name.includes("jenny") || name.includes("guy")) score += 25;

  return score;
}

export function findFluentVoice() {
  const voices = cachedVoices.length > 0 ? cachedVoices : loadVoices();
  if (!voices || voices.length === 0) return null;

  const englishVoices = voices.filter((v) => v.lang.toLowerCase().startsWith("en"));
  if (englishVoices.length === 0) return voices[0];

  const ranked = [...englishVoices].sort((a, b) => {
    return scoreFluentVoice(b) - scoreFluentVoice(a);
  });

  return ranked[0] || englishVoices[0];
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

  // Resume synthesis if browser paused it
  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }

  const cleanText = text.replace(/[\u{1F300}-\u{1F9FF}]/gu, "");
  const utterance = new SpeechSynthesisUtterance(cleanText);

  // Fluent documentary cadence: articulate pace and natural pitch
  utterance.rate = 0.96;
  utterance.pitch = 1.0;

  const voice = findFluentVoice();
  if (voice) {
    utterance.voice = voice;
  }

  utterance.onstart = () => {
    onStart?.();
  };

  utterance.onend = () => {
    if (currentUtterance) {
      currentUtterance = null;
    }
    onEnd?.();
  };

  utterance.onerror = (e) => {
    if (currentUtterance) {
      currentUtterance = null;
    }
    if (e.error !== "canceled" && e.error !== "interrupted") {
      onError?.(e);
    }
    onEnd?.();
  };

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}
