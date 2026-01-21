export const CODE_TO_ICON: Record<string, string> = {
  // Core
  LIKE: "👍",
  HEART: "❤️",
  HAHA: "😂",
  WOW: "😮",
  SAD: "😢",
  ANGRY: "😡",

  // Fun / Meme
  SHIT: "💩",
  PARTY: "🎉",
  FIRE: "🔥",
  EYES: "👀",
  ROFL: "🤣",
  SKULL: "💀",
  SUS: "🧐",
  SIDE_EYE: "🙄",
  FACEPALM: "🤦",

  // Thinking / Reaction
  THINKING: "🤔",
  CHECK: "✅",
  QUESTION: "❓",
  EXCLAMATION: "❗",
  MIND_BLOWN: "🤯",
  SCREAM: "😱",
  CRY_LOUD: "😭",

  // Nerd / Smart / Study
  NERD: "🤓",
  BRAIN: "🧠",
  IDEA: "💡",
  BOOK: "📚",
  LAPTOP: "💻",
  NOTE: "📝",

  // Cool / Confident
  COOL: "😎",
  OK_HAND: "👌",
  CLAP: "👏",
  MUSCLE: "💪",
  THUMBS_DOWN: "👎",
  HANDSHAKE: "🤝",

  // Love / Care
  HEART_EYES: "😍",
  KISS: "😘",
  HUG: "🤗",
  STAR: "⭐",
  SPARKLES: "✨",

  // Mood / Emotion
  SLEEPY: "😴",
  CONFUSED: "😕",
  NEUTRAL: "😐",
  SMIRK: "😏",
  ROLLING_EYES: "🙃",

  // Chaos / Extra
  WARNING: "⚠️",
  BOMB: "💣",
  POOP_FUNNY: "🤡",
  EYES_WIDE: "😳",
};

export const ICON_TO_CODE: Record<string, string> = Object.entries(
  CODE_TO_ICON,
).reduce(
  (acc, [code, icon]) => {
    acc[icon] = code;
    return acc;
  },
  {} as Record<string, string>,
);

export const DISPLAY_ICONS = Object.keys(ICON_TO_CODE);
