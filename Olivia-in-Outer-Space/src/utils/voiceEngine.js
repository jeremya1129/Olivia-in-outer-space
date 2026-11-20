/**
 * Pure voice selection and pitch/rate calibration helpers for Web Speech API.
 * Handles cross-platform differences across Windows, macOS, iOS, and Linux
 * (both Chrome remote Google voices and speech-dispatcher/eSpeak NG voices).
 */

const UNUSABLE_VOICE_RE =
  /\b(whisper|demonic|croak|fast_test|anxiousandy|grandpa|grandma|half[-_]?life)\b|half-lifeannouncementsystem/i;

const NATIVE_ROBOT_RE =
  /\b(universalrobot|anikarobot|robosoft\d*|zarvox|trinoids|cellos|klatt\d*|fred|boing|albert|robot)\b/i;

const NATIVE_ROBOT_VARIANT_RE =
  /\+(universalrobot|anikarobot|robosoft\d*|klatt\d*)/i;

const NATIVE_CHILD_RE =
  /\b(ana|child|kid|junior|young|ivy|justin|kevin)\b/i;

const FEMALE_WORD_RE = /(^|[^a-z])female/i;
const FEMALE_NAME_RE =
  /\b(samantha|zira|jenny|aria|victoria|karen|siri|ava|nicky|allison|susan|tessa|moira|kate|hazel|serena|sara|emma|amy|joanna|salli|kendra|kimberly|steph\d*|annie|alicia|linda|belinda|anika)\b/i;

const HIGH_QUALITY_FEMALE_RE =
  /\b(samantha|zira|jenny|aria|victoria|karen|siri|ava|nicky)\b/i;

const MALE_WORD_RE = /(^|[^a-z])male/i;
const MALE_NAME_RE =
  /\b(david|mark|guy|alex|reed|eddy|daniel|george|adam|mike\d*|john|edward\d*|iven\d*|rob|robert|paul|max|michael)\b/i;

const BRITISH_VOICE_RE =
  /\b(uk|british|great britain|received pronunciation|scotland|george|daniel|arthur|oliver|serena|kate|hazel|martha)\b/i;

/**
 * Returns true for desktop Linux browsers (excluding Android).
 */
export function detectLinuxPlatform(
  userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : ''
) {
  const ua = String(userAgent || '');
  return /linux/i.test(ua) && !/android/i.test(ua);
}

export function isUnusableVoice(voice) {
  if (!voice) return true;
  const lang = String(voice.lang || '');
  const name = String(voice.name || '');
  if (/^en[-_]shaw/i.test(lang)) return true;
  return UNUSABLE_VOICE_RE.test(name);
}

export function isNativeRobotVoice(voice) {
  if (!voice) return false;
  const name = String(voice.name || '');
  return NATIVE_ROBOT_RE.test(name) || NATIVE_ROBOT_VARIANT_RE.test(name);
}

export function isNativeChildVoice(voice) {
  if (!voice) return false;
  const name = String(voice.name || '');
  return NATIVE_CHILD_RE.test(name);
}

export function isFemaleVoice(voice) {
  if (!voice) return false;
  const name = String(voice.name || '');
  return (
    FEMALE_WORD_RE.test(name) ||
    FEMALE_NAME_RE.test(name) ||
    /google us english/i.test(name)
  );
}

export function isMaleVoice(voice) {
  if (!voice) return false;
  const name = String(voice.name || '');
  return MALE_WORD_RE.test(name) || MALE_NAME_RE.test(name);
}

export function isBritishVoice(voice) {
  if (!voice) return false;
  const lang = String(voice.lang || '');
  const name = String(voice.name || '');
  return /^en[-_]gb/i.test(lang) || BRITISH_VOICE_RE.test(name);
}

export function isGoogleCloudVoice(voice) {
  if (!voice) return false;
  const name = String(voice.name || '');
  return /^google\s/i.test(name) && voice.localService === false;
}

export function isEspeakVoice(voice) {
  if (!voice) return false;
  const name = String(voice.name || '');
  return /espeak|speech-dispatcher|\+|mbrola|english\s*\(/i.test(name);
}

function normalizeLang(lang) {
  return String(lang || '').replace(/_/g, '-').toLowerCase();
}

/**
 * Selects the best voice from available Web Speech API voices for the given mode.
 * Avoids Linux "English butler" accents for Robot mode unless the user explicitly prefers en-GB,
 * and skips novelty/unusable eSpeak voices.
 */
export function selectBestVoice(voices, mode = 'child', userLang = 'en-US') {
  if (!Array.isArray(voices) || voices.length === 0) return null;

  const englishUsable = voices.filter(
    (v) => v && /^en\b/i.test(String(v.lang || '')) && !isUnusableVoice(v)
  );
  const allUsable = voices.filter((v) => v && !isUnusableVoice(v));
  const pool =
    englishUsable.length > 0
      ? englishUsable
      : allUsable.length > 0
      ? allUsable
      : voices;

  const normUserLang = normalizeLang(userLang || 'en-US');
  const userPrefersGB = normUserLang.startsWith('en-gb');
  const targetExactLang =
    normUserLang === 'en' || !normUserLang ? 'en-us' : normUserLang;

  let bestVoice = pool[0] || null;
  let bestScore = -Infinity;

  for (const voice of pool) {
    let score = 0;
    const vLang = normalizeLang(voice.lang);
    const vName = String(voice.name || '');
    const vNameLower = vName.toLowerCase();

    // 1. Locale preference score
    if (vLang === targetExactLang) {
      score += 45;
    } else if (!userPrefersGB && vLang === 'en-us') {
      score += 35;
    } else if (vLang === 'en-ca' || vLang === 'en-au' || vLang === 'en-nz') {
      score += 15;
    } else if (
      vLang === 'en-029' ||
      vLang.startsWith('en-gb-x-') ||
      vLang === 'en-gb-scotland'
    ) {
      score -= 45;
    }

    // 2. Mode-specific voice quality & character scoring
    if (mode === 'robot') {
      if (isNativeRobotVoice(voice)) {
        score += 120;
        if (/\b(universalrobot|zarvox|trinoids|robosoft\d*|klatt\d*)\b/i.test(vName) || /\+(universalrobot|robosoft\d*|klatt\d*)/i.test(vName)) {
          score += 10;
        }
      } else {
        if (isMaleVoice(voice) && (!isBritishVoice(voice) || userPrefersGB)) {
          score += 45;
        }
        if (/google us english/i.test(vName)) {
          score += 20;
        }
      }

      if (isBritishVoice(voice) && !userPrefersGB) {
        score -= 45;
      }
    } else {
      // Child mode
      if (isNativeRobotVoice(voice)) {
        score -= 100;
      }
      if (isNativeChildVoice(voice)) {
        score += 100;
      } else if (
        (vNameLower.includes('natural') && isFemaleVoice(voice)) ||
        HIGH_QUALITY_FEMALE_RE.test(vName)
      ) {
        score += 70;
      } else if (/google us english/i.test(vName)) {
        score += 60;
      } else if (isFemaleVoice(voice)) {
        score += 50;
      } else if (isMaleVoice(voice) && !isFemaleVoice(voice)) {
        score -= 40;
      }

      if (isBritishVoice(voice) && !userPrefersGB) {
        score -= 15;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestVoice = voice;
    }
  }

  return bestVoice;
}

/**
 * Returns calibrated { pitch, rate } settings tailored to voice type and platform.
 */
export function getSpeechProfile(
  mode = 'child',
  voice = null,
  context = 'speak',
  isLinux = false
) {
  if (mode === 'robot') {
    const rate = context === 'story' ? 0.88 : context === 'word' ? 0.85 : 0.94;
    let pitch = 0.58;
    if (isNativeRobotVoice(voice)) {
      pitch = 0.94;
    } else if (isGoogleCloudVoice(voice)) {
      pitch = 0.52;
    } else if (isMaleVoice(voice)) {
      pitch = 0.65;
    }
    return { pitch, rate };
  }

  // Child mode
  const rate = context === 'story' ? 0.92 : context === 'word' ? 0.88 : 1.0;
  let pitch = 1.26;
  if (isNativeChildVoice(voice)) {
    pitch = 1.02;
  } else if (isEspeakVoice(voice)) {
    pitch = isFemaleVoice(voice) ? 1.04 : 1.14;
  } else if (isGoogleCloudVoice(voice) || isLinux) {
    pitch = 1.12;
  } else if (isFemaleVoice(voice)) {
    pitch = 1.18;
  }
  return { pitch, rate };
}
