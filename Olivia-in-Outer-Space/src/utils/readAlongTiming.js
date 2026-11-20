/**
 * Pure read-along text tokenization, sentence splitting, syllable-weighted
 * word duration estimation, and character-offset lookup utilities.
 */

/**
 * Splits story text into word tokens while preserving exact character offsets.
 */
export function tokenizeWords(text) {
  if (!text || typeof text !== 'string') return [];
  const list = [];
  const regex = /\S+/g;
  let match;
  let idx = 0;
  while ((match = regex.exec(text)) !== null) {
    list.push({
      id: `word-${idx++}`,
      word: match[0],
      cleanWord: match[0].replace(/[^\w]/g, ''),
      start: match.index,
      end: match.index + match[0].length,
    });
  }
  return list;
}

/**
 * Splits story text into contiguous sentence descriptors with exact word and
 * character spans, preserving offsets into the original text.
 */
export function parseStoryIntoSentences(text) {
  const words = tokenizeWords(text);
  if (words.length === 0) return [];

  const sentences = [];
  let startWordIndex = 0;

  for (let i = 0; i < words.length; i++) {
    const isSentenceEnd =
      /[.!?]+["”']?$/.test(words[i].word) || i === words.length - 1;
    if (isSentenceEnd) {
      const startCharOffset = words[startWordIndex].start;
      const endCharOffset = words[i].end;
      sentences.push({
        index: sentences.length,
        text: text.slice(startCharOffset, endCharOffset),
        startCharOffset,
        endCharOffset,
        startWordIndex,
        endWordIndex: i,
      });
      startWordIndex = i + 1;
    }
  }

  return sentences;
}

/**
 * Lightweight English syllable estimator for speech duration weighting.
 */
export function countSyllables(cleanWord) {
  const letters = String(cleanWord || '')
    .toLowerCase()
    .replace(/[^a-z]/g, '');
  if (!letters) return 1;
  if (letters.length <= 3) return 1;

  // Keep consonant + "le" endings (e.g. "little", "bubble") as a syllable
  let normalized = letters.replace(/^y/, '');
  if (!/[^aeiouy]le$/.test(normalized)) {
    normalized = normalized.replace(/(?:[^laeiouy]es|[^dt]ed|e)$/, '');
  }

  const groups = normalized.match(/[aeiouy]{1,2}/g);
  return Math.max(1, groups ? groups.length : 1);
}

/**
 * Computes estimated speaking durations (ms) per word weighted by syllable count,
 * character length, trailing punctuation pauses, and speech rate.
 */
export function estimateWordDurations(words, rate = 0.92) {
  if (!Array.isArray(words) || words.length === 0) return [];
  const safeRate = Math.max(Number(rate) || 0.92, 0.5);

  return words.map((token) => {
    const clean = token.cleanWord || '';
    const raw = token.word || '';
    const base = 65;
    const syllableMs = countSyllables(clean) * 95;
    const charMs = Math.min(clean.length, 14) * 18;

    let pauseMs = 0;
    if (/[.!?]["”']?$/.test(raw)) {
      pauseMs = 300;
    } else if (/[,;:—–]$/.test(raw)) {
      pauseMs = 165;
    }

    return Math.round((base + syllableMs + charMs + pauseMs) / safeRate);
  });
}

/**
 * Sums estimated durations across a sentence's word span.
 */
export function computeSentenceExpectedMs(
  wordDurations,
  startWordIndex,
  endWordIndex
) {
  if (!Array.isArray(wordDurations) || wordDurations.length === 0) return 0;
  const start = Math.max(0, startWordIndex);
  const end = Math.min(wordDurations.length - 1, endWordIndex);
  let total = 0;
  for (let i = start; i <= end; i++) {
    total += wordDurations[i] || 0;
  }
  return total;
}

/**
 * Clamps adaptive speed-scale multiplier to a safe range around 1.0.
 */
export function clampSpeedScale(ratio) {
  if (!Number.isFinite(ratio) || ratio <= 0) return 1.0;
  return Math.min(1.75, Math.max(0.6, ratio));
}

/**
 * Finds the word index covering a given global character index.
 */
export function findWordIndexByChar(words, charIndex) {
  if (!Array.isArray(words) || words.length === 0) return -1;
  if (charIndex < words[0].start) return 0;

  let lo = 0;
  let hi = words.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const w = words[mid];
    if (charIndex >= w.start && charIndex < w.end) {
      return mid;
    }
    if (charIndex < w.start) {
      hi = mid - 1;
    } else {
      if (mid === words.length - 1 || charIndex < words[mid + 1].start) {
        return mid;
      }
      lo = mid + 1;
    }
  }
  return words.length - 1;
}

/**
 * Finds the sentence index containing a given word index.
 */
export function findSentenceIndexByWord(sentences, wordIndex) {
  if (!Array.isArray(sentences) || sentences.length === 0) return 0;
  if (wordIndex <= 0) return 0;
  for (let i = 0; i < sentences.length; i++) {
    if (
      wordIndex >= sentences[i].startWordIndex &&
      wordIndex <= sentences[i].endWordIndex
    ) {
      return i;
    }
  }
  return 0;
}
