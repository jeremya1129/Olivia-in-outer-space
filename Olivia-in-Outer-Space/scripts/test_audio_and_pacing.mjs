import assert from 'node:assert/strict';
import {
  detectLinuxPlatform,
  selectBestVoice,
  getSpeechProfile,
  isNativeChildVoice,
  isFemaleVoice,
  isMaleVoice,
  isBritishVoice,
  isUnusableVoice,
} from '../src/utils/voiceEngine.js';
import {
  tokenizeWords,
  parseStoryIntoSentences,
  countSyllables,
  estimateWordDurations,
  computeSentenceExpectedMs,
  clampSpeedScale,
  findWordIndexByChar,
  findSentenceIndexByWord,
} from '../src/utils/readAlongTiming.js';
import { PLANET_STORIES, getStoryForBody } from '../src/data/planetStories.js';

function runTests() {
  let passed = 0;
  const check = (name, fn) => {
    fn();
    passed += 1;
    console.log(`[PASS] ${name}`);
  };

  // 1. Platform detection
  check('detectLinuxPlatform distinguishes desktop Linux from Android/macOS/Windows', () => {
    assert.equal(detectLinuxPlatform('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'), true);
    assert.equal(detectLinuxPlatform('Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36'), false);
    assert.equal(detectLinuxPlatform('Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0)'), false);
    assert.equal(detectLinuxPlatform('Mozilla/5.0 (Windows NT 10.0; Win64; x64)'), false);
  });

  // 2. Linux Chrome voices (avoid English butler in robot mode & overly high child pitch)
  check('Linux Chrome selects Google US English for robot & child with calibrated pitches', () => {
    const linuxChromeVoices = [
      { name: 'Google US English', lang: 'en-US', localService: false },
      { name: 'Google UK English Female', lang: 'en-GB', localService: false },
      { name: 'Google UK English Male', lang: 'en-GB', localService: false },
    ];

    const robotVoice = selectBestVoice(linuxChromeVoices, 'robot', 'en-US');
    assert.equal(robotVoice.name, 'Google US English');
    const robotProfile = getSpeechProfile('robot', robotVoice, 'speak', true);
    assert.ok(robotProfile.pitch <= 0.6, `Expected robot pitch <= 0.6, got ${robotProfile.pitch}`);

    const childVoice = selectBestVoice(linuxChromeVoices, 'child', 'en-US');
    assert.equal(childVoice.name, 'Google US English');
    const childProfile = getSpeechProfile('child', childVoice, 'speak', true);
    assert.ok(
      childProfile.pitch >= 1.05 && childProfile.pitch <= 1.18,
      `Expected calibrated child pitch in [1.05, 1.18], got ${childProfile.pitch}`
    );
  });

  // 3. Linux speech-dispatcher / eSpeak voices
  check('Linux speech-dispatcher selects en-US UniversalRobot and en-US female without Caribbean/Shavian/novelty', () => {
    const linuxDispatcherVoices = [
      { name: 'English (Caribbean)', lang: 'en-029', localService: true },
      { name: 'English (Caribbean)+UniversalRobot', lang: 'en-029', localService: true },
      { name: 'English (Great Britain)+UniversalRobot', lang: 'en-GB', localService: true },
      { name: 'English (Shavian alphabet)', lang: 'en-SHAW', localService: true },
      { name: 'English (America)+Demonic', lang: 'en-US', localService: true },
      { name: 'English (America)+Half-LifeAnnouncementSystem', lang: 'en-US', localService: true },
      { name: 'English (America)+David', lang: 'en-US', localService: true },
      { name: 'English (America)+Annie', lang: 'en-US', localService: true },
      { name: 'English (America)+female2', lang: 'en-US', localService: true },
      { name: 'English (America)+UniversalRobot', lang: 'en-US', localService: true },
    ];

    assert.equal(isUnusableVoice(linuxDispatcherVoices[3]), true);
    assert.equal(isUnusableVoice(linuxDispatcherVoices[4]), true);
    assert.equal(isUnusableVoice(linuxDispatcherVoices[5]), true);

    const robotVoice = selectBestVoice(linuxDispatcherVoices, 'robot', 'en-US');
    assert.equal(robotVoice.name, 'English (America)+UniversalRobot');
    assert.equal(robotVoice.lang, 'en-US');

    const childVoice = selectBestVoice(linuxDispatcherVoices, 'child', 'en-US');
    assert.equal(childVoice.lang, 'en-US');
    assert.ok(isFemaleVoice(childVoice), `Expected female voice, got ${childVoice.name}`);
    const childProfile = getSpeechProfile('child', childVoice, 'story', true);
    assert.ok(childProfile.pitch <= 1.1, `Expected espeak child pitch <= 1.10, got ${childProfile.pitch}`);
  });

  // 4. Windows voices
  check('Windows selects Microsoft David for robot and Microsoft Ana/Zira for child', () => {
    const winVoices = [
      { name: 'Microsoft George - English (United Kingdom)', lang: 'en-GB', localService: true },
      { name: 'Microsoft David - English (United States)', lang: 'en-US', localService: true },
      { name: 'Microsoft Zira - English (United States)', lang: 'en-US', localService: true },
      { name: 'Microsoft Ana Online (Natural) - English (United States)', lang: 'en-US', localService: false },
    ];

    const robotVoice = selectBestVoice(winVoices, 'robot', 'en-US');
    assert.ok(robotVoice.name.includes('David'));

    const childVoice = selectBestVoice(winVoices, 'child', 'en-US');
    assert.ok(childVoice.name.includes('Ana'));
    const anaProfile = getSpeechProfile('child', childVoice, 'speak', false);
    assert.ok(anaProfile.pitch <= 1.1, `Expected native child pitch <= 1.1, got ${anaProfile.pitch}`);

    const noAna = winVoices.filter((v) => !v.name.includes('Ana'));
    const ziraVoice = selectBestVoice(noAna, 'child', 'en-US');
    assert.ok(ziraVoice.name.includes('Zira'));
    const ziraProfile = getSpeechProfile('child', ziraVoice, 'speak', false);
    assert.ok(ziraProfile.pitch <= 1.2, `Expected Zira pitch <= 1.20, got ${ziraProfile.pitch}`);
  });

  // 5. macOS voices & regex edge cases
  check('macOS avoids false "ana" match on Canadian and false "male" match on Female', () => {
    const macVoices = [
      { name: 'Canadian English', lang: 'en-CA', localService: true },
      { name: 'Daniel', lang: 'en-GB', localService: true },
      { name: 'Samantha', lang: 'en-US', localService: true },
      { name: 'Zarvox', lang: 'en-US', localService: true },
    ];

    assert.equal(isNativeChildVoice(macVoices[0]), false);
    assert.equal(isMaleVoice({ name: 'Google UK English Female', lang: 'en-GB' }), false);
    assert.equal(isFemaleVoice({ name: 'Google UK English Female', lang: 'en-GB' }), true);
    assert.equal(isBritishVoice(macVoices[1]), true);

    const robotVoice = selectBestVoice(macVoices, 'robot', 'en-US');
    assert.equal(robotVoice.name, 'Zarvox');

    const childVoice = selectBestVoice(macVoices, 'child', 'en-US');
    assert.equal(childVoice.name, 'Samantha');
    const samProfile = getSpeechProfile('child', childVoice, 'word', false);
    assert.ok(samProfile.pitch <= 1.2, `Expected Samantha word pitch <= 1.20, got ${samProfile.pitch}`);
  });

  // 6. Explicit en-GB locale preference respected
  check('Explicit en-GB user locale allows British voices without penalty', () => {
    const voices = [
      { name: 'Google US English', lang: 'en-US', localService: false },
      { name: 'Google UK English Male', lang: 'en-GB', localService: false },
    ];
    const ukRobot = selectBestVoice(voices, 'robot', 'en-GB');
    assert.equal(ukRobot.name, 'Google UK English Male');
  });

  // 7. Read-along tokenization, sentence splitting & offset round-tripping across all 20 stories
  check('All 20 planet stories split into contiguous sentences with exact word/char offsets', () => {
    const entries = Object.entries(PLANET_STORIES);
    assert.equal(entries.length, 20);

    for (const [id, story] of entries) {
      const words = tokenizeWords(story.text);
      const sentences = parseStoryIntoSentences(story.text);
      assert.ok(words.length > 5, `${id} should have >5 words`);
      assert.ok(sentences.length >= 2, `${id} should have >=2 sentences`);
      assert.equal(sentences[0].startWordIndex, 0, `${id} first sentence starts at word 0`);
      assert.equal(
        sentences[sentences.length - 1].endWordIndex,
        words.length - 1,
        `${id} last sentence ends at final word`
      );

      for (let i = 0; i < sentences.length; i++) {
        const s = sentences[i];
        assert.equal(s.text, story.text.slice(s.startCharOffset, s.endCharOffset));
        if (i > 0) {
          assert.equal(s.startWordIndex, sentences[i - 1].endWordIndex + 1);
        }
        for (let wIdx = s.startWordIndex; wIdx <= s.endWordIndex; wIdx++) {
          const w = words[wIdx];
          const localOffset = w.start - s.startCharOffset;
          assert.equal(findWordIndexByChar(words, s.startCharOffset + localOffset), wIdx);
          assert.equal(findSentenceIndexByWord(sentences, wIdx), i);
        }
      }
    }

    const fallback = getStoryForBody('unknown_moon', 'Mystery');
    assert.ok(parseStoryIntoSentences(fallback.text).length >= 1);
  });

  // 8. Syllable estimation & duration weighting
  check('Syllable-weighted duration estimation reflects word length and punctuation pauses', () => {
    assert.equal(countSyllables('a'), 1);
    assert.equal(countSyllables('little'), 2);
    assert.ok(countSyllables('Navigator') >= 4);

    const sampleWords = tokenizeWords('See a Navigator sunshine! Wait, go.');
    const durations = estimateWordDurations(sampleWords, 0.92);
    assert.ok(durations[1] < durations[2], `"a" (${durations[1]}ms) < "Navigator" (${durations[2]}ms)`);

    const plainEnd = tokenizeWords('sunshine')[0];
    const punctEnd = tokenizeWords('sunshine!')[0];
    const [dPlain] = estimateWordDurations([plainEnd], 0.92);
    const [dPunct] = estimateWordDurations([punctEnd], 0.92);
    assert.ok(dPunct > dPlain, `Sentence-ending punctuation adds pause (${dPunct}ms > ${dPlain}ms)`);

    const sentences = parseStoryIntoSentences('See a Navigator sunshine! Wait, go.');
    const expectedSum = computeSentenceExpectedMs(
      durations,
      sentences[0].startWordIndex,
      sentences[0].endWordIndex
    );
    assert.equal(expectedSum, durations[0] + durations[1] + durations[2] + durations[3]);

    assert.equal(clampSpeedScale(0.2), 0.6);
    assert.equal(clampSpeedScale(3.5), 1.75);
    assert.equal(clampSpeedScale(1.15), 1.15);
  });

  console.log(`\nALL ${passed} AUDIO & PACING UNIT TESTS PASSED!`);
}

runTests();
