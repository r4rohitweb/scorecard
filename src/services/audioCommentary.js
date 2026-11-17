// Audio Commentary & Sound Effects Engine for Pitch Cricket

let Platform = { OS: typeof window !== 'undefined' ? 'web' : 'node' };
try {
  const RN = require('react-native');
  if (RN && RN.Platform) Platform = RN.Platform;
} catch (e) {
  // Running in pure node or test environment
}

let AsyncStorage = null;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage');
  if (AsyncStorage && AsyncStorage.default) AsyncStorage = AsyncStorage.default;
} catch (e) {}

let SpeechModule = null;
try {
  SpeechModule = require('expo-speech');
} catch (e) {
  // Graceful fallback if expo-speech is not loaded natively
}

const STORAGE_KEY = 'pitch_commentary_settings_v1';

export const CommentarySettings = {
  voiceEnabled: true,
  soundEffectsEnabled: true,
  language: 'hi', // 'hi' (Hindi/Hinglish) or 'en' (English)
  pitch: 1.05,
  rate: 0.98,
};

// Load saved settings
export async function loadCommentarySettings() {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      Object.assign(CommentarySettings, parsed);
    }
  } catch (e) {
    // Ignore storage errors
  }
  return { ...CommentarySettings };
}

// Save updated settings
export async function saveCommentarySettings(newSettings) {
  try {
    Object.assign(CommentarySettings, newSettings);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(CommentarySettings));
  } catch (e) {
    // Ignore
  }
  return { ...CommentarySettings };
}

// -------------------------------------------------------------
// Web Audio API Synthesizer (Zero-download, Zero-latency SFX)
// -------------------------------------------------------------
let audioCtx = null;
function getAudioContext() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playSound(type) {
  if (!CommentarySettings.soundEffectsEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    if (type === 'batHit' || type === 'four') {
      // Crisp wooden bat crack
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.08);
      gain.gain.setValueAtTime(0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);

      if (type === 'four') {
        // Add quick short cheer for boundary
        playNoiseCheer(ctx, now + 0.06, 0.45, 0.25);
      }
    } else if (type === 'six') {
      // Big booming bat sweet-spot crack + crowd cheer
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(950, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.15);
      gain.gain.setValueAtTime(0.85, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.16);

      // Slower, bigger crowd cheer swell
      playNoiseCheer(ctx, now + 0.1, 0.9, 0.35);
    } else if (type === 'wicket') {
      // Dramatic descending umpire tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.35);
      gain.gain.setValueAtTime(0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.36);
    } else if (type === 'whistle' || type === 'wide' || type === 'noBall') {
      // Dual-frequency referee/umpire whistle warble
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2600, now);
      osc.frequency.setValueAtTime(2850, now + 0.06);
      osc.frequency.setValueAtTime(2600, now + 0.12);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.23);
    } else if (type === 'fanfare' || type === 'victory') {
      // Victory 3-tone arpeggio fanfare
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = now + idx * 0.11;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.26);
      });
      playNoiseCheer(ctx, now + 0.35, 1.2, 0.4);
    }
  } catch (err) {
    // Audio context play error handled silently
  }
}

function playNoiseCheer(ctx, startTime, duration, volume) {
  try {
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Filter noise to sound like crowd murmur/roar
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 900;
    filter.Q.value = 1.2;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + duration * 0.25);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(startTime);
    noise.stop(startTime + duration);
  } catch (e) {
    // Ignore
  }
}

// -------------------------------------------------------------
// Commentary Phrase Generator (Hindi / Hinglish & English)
// -------------------------------------------------------------
export function generateCommentaryPhrase({
  type, // 'run' | 'wicket' | 'wide' | 'noBall' | 'retire' | 'overEnd' | 'milestone' | 'victory'
  runs = 0,
  shotDirection,
  strikerName = 'Batter',
  bowlerName = 'Bowler',
  howOut = 'dismissed',
  batterScore = 0,
  milestone = null, // 50 | 100
  score = 0,
  wickets = 0,
  overs = '0.0',
  target = null,
  winningTeam = null,
  margin = null,
  language = CommentarySettings.language || 'hi',
}) {
  const isHindi = language === 'hi';

  if (type === 'victory') {
    if (isHindi) {
      return `${winningTeam || 'Team'} ne ye match jeet liya hai! ${margin ? `Jeet ${margin} se mili!` : ''} Shaandaar pradarshan!`;
    }
    return `${winningTeam || 'The team'} has won the match! ${margin ? `Won by ${margin}!` : ''} Fantastic victory!`;
  }

  if (type === 'milestone') {
    if (milestone === 100) {
      if (isHindi) {
        return `Shatak! ${strikerName} ne kamaal kar diya! Shandar 100 run poore kiye!`;
      }
      return `Century! A masterclass hundred for ${strikerName}! Take a bow!`;
    }
    if (milestone === 50) {
      if (isHindi) {
        return `Pachas run poore! ${strikerName} ka shaandar half-century! Zabardast ballebaazi!`;
      }
      return `Fifty up! Magnificent half-century for ${strikerName}! Brilliant knock!`;
    }
  }

  if (type === 'overEnd') {
    if (isHindi) {
      return `Over poora hua! ${overs} over ke baad score hai ${score} run, ${wickets} wicket par.`;
    }
    return `Over complete. Score is ${score} for ${wickets} after ${overs} overs.`;
  }

  if (type === 'wide') {
    if (isHindi) {
      return `Wide ball! Umpire ka ishara, gend line se baahar. Ek extra run mila.`;
    }
    return `Wide ball signaled by the umpire. An extra run added to the total.`;
  }

  if (type === 'noBall') {
    if (isHindi) {
      return `No ball! Umpire ne no ball di hai. Ballebaaz ko mila free mauka!`;
    }
    return `No ball called! Extra delivery coming up for the batting side.`;
  }

  if (type === 'retire') {
    if (isHindi) {
      return `${strikerName} retired hokar pavilion laut rahe hain.`;
    }
    return `${strikerName} is retiring from the crease.`;
  }

  if (type === 'wicket') {
    const dir = howOut ? `(${howOut})` : '';
    if (isHindi) {
      const phrases = [
        `Wicket gira! ${strikerName} out ho gaye ${dir}! ${bowlerName} ne badi safalta dilayi!`,
        `Out! Bada jhatka! ${strikerName} pavilion laut te hue! ${bowlerName} ne kiya kamaal!`,
        `Aur ye Wicket! ${strikerName} apna wicket gawa baithe! Shandar bowling by ${bowlerName}!`,
      ];
      return phrases[Math.floor(Math.random() * phrases.length)];
    }
    const phrases = [
      `Wicket! ${strikerName} is out ${dir}! ${bowlerName} gets the big breakthrough!`,
      `Gone! That is out! ${strikerName} departs, a crucial wicket for ${bowlerName}!`,
      `Out! Clean dismissal! ${strikerName} has to walk back!`,
    ];
    return phrases[Math.floor(Math.random() * phrases.length)];
  }

  // Runs
  if (type === 'run') {
    const dirTextHi = shotDirection ? `${shotDirection} ki taraf` : '';
    const dirTextEn = shotDirection ? `towards ${shotDirection}` : '';

    if (runs === 6) {
      if (isHindi) {
        const sixPhrases = [
          `Chakka! Gend hava me aur stadium ke paar! ${strikerName} ka zabardast six ${dirTextHi}!`,
          `Shaandaar six! ${strikerName} ne ball ko boundary ke bahar bhej diya!`,
          `Chhakka! Gazab ka shot ${strikerName} dwara! Maximum runs!`,
        ];
        return sixPhrases[Math.floor(Math.random() * sixPhrases.length)];
      }
      const sixPhrases = [
        `Six! Up, up and away! Huge maximum from ${strikerName} ${dirTextEn}!`,
        `It is out of the ground! Colossal hit for six by ${strikerName}!`,
        `Maximum! What a powerful strike from ${strikerName}!`,
      ];
      return sixPhrases[Math.floor(Math.random() * sixPhrases.length)];
    }

    if (runs === 4) {
      if (isHindi) {
        const fourPhrases = [
          `Chauka! Khoobsurat timing ${strikerName} ki, gend boundary ke paar ${dirTextHi}!`,
          `Char run! Zabardast chauka lagaya ${strikerName} ne!`,
          `Boundary! Balle ke beech se nikla shot, seedha chauka!`,
        ];
        return fourPhrases[Math.floor(Math.random() * fourPhrases.length)];
      }
      const fourPhrases = [
        `Four! Pure class from ${strikerName} ${dirTextEn}! Finds the boundary!`,
        `Four runs! Driven crisply through the gap by ${strikerName}!`,
        `Boundary! Beautifully timed shot by ${strikerName}!`,
      ];
      return fourPhrases[Math.floor(Math.random() * fourPhrases.length)];
    }

    if (runs === 3) {
      if (isHindi) return `Teen run! Acchi running aur boundary par shaandar bachaav.`;
      return `Three runs taken. Excellent running between the wickets.`;
    }

    if (runs === 2) {
      if (isHindi) return `Do run! ${strikerName} ne tezi se do run poore kiye.`;
      return `Two runs. Well judged double by ${strikerName}.`;
    }

    if (runs === 1) {
      if (isHindi) return `Single liya. ${strikerName} ne ek run lekar strike badli.`;
      return `Single taken by ${strikerName}. Strike rotated.`;
    }

    // Dot ball
    if (isHindi) {
      const dotPhrases = [
        `Dot ball. Koi run nahi mila.`,
        `Acchi gend ${bowlerName} ki. Ballebaaz be-asar.`,
        `Dot delivery. ${bowlerName} ne dabaav banaye rakha hai.`,
      ];
      return dotPhrases[Math.floor(Math.random() * dotPhrases.length)];
    }
    const dotPhrases = [
      `Dot ball. No run scored.`,
      `Good tight delivery from ${bowlerName}.`,
      `Defended cleanly, no run on that ball.`,
    ];
    return dotPhrases[Math.floor(Math.random() * dotPhrases.length)];
  }

  return '';
}

// -------------------------------------------------------------
// Voice Speech Dispatcher (expo-speech + Web SpeechSynthesis)
// -------------------------------------------------------------
export async function speakCommentary(text, options = {}) {
  if (!text || !CommentarySettings.voiceEnabled) return;

  const langCode = options.language || CommentarySettings.language === 'hi' ? 'hi-IN' : 'en-IN';
  const rate = options.rate || CommentarySettings.rate || 0.98;
  const pitch = options.pitch || CommentarySettings.pitch || 1.05;

  // 1. Try expo-speech on mobile or web
  if (SpeechModule && typeof SpeechModule.speak === 'function') {
    try {
      SpeechModule.stop();
      SpeechModule.speak(text, {
        language: langCode,
        pitch,
        rate,
        onError: () => {},
      });
      return;
    } catch (e) {
      // Fallback to web SpeechSynthesis if expo-speech failed
    }
  }

  // 2. Direct Web SpeechSynthesis fallback
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode;
      utterance.pitch = pitch;
      utterance.rate = rate;

      // Select Hindi or Indian English voice if available
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const voice =
          voices.find((v) => v.lang.startsWith(langCode.slice(0, 2))) ||
          voices.find((v) => v.lang.includes('IN') || v.lang.includes('hi'));
        if (voice) utterance.voice = voice;
      }
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      // Audio speech synthesis failed silently
    }
  }
}

export function stopSpeaking() {
  if (SpeechModule && typeof SpeechModule.stop === 'function') {
    try {
      SpeechModule.stop();
    } catch (e) {}
  }
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CommentarySettings,
    loadCommentarySettings,
    saveCommentarySettings,
    playSound,
    generateCommentaryPhrase,
    speakCommentary,
    stopSpeaking,
  };
}

