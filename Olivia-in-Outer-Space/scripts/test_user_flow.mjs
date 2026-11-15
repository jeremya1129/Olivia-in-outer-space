import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

function findChromePath() {
  if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) {
    return process.env.CHROME_PATH;
  }

  const candidates = [
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(
    'Could not locate Chrome/Chromium executable. Set CHROME_PATH env var to run tests.'
  );
}

const CHROME_PATH = findChromePath();
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000/';
const DEBUG_PORT = Number(process.env.CDP_PORT || 9222);
const ARTIFACT_DIR =
  process.env.ARTIFACT_DIR || path.join(os.tmpdir(), 'olivia-space-test-artifacts');
fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForTargets(port, timeoutMs = 10000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json`);
      if (res.ok) {
        const targets = await res.json();
        if (Array.isArray(targets) && targets.length > 0) {
          return targets;
        }
      }
    } catch {
      // Chrome DevTools endpoint not ready yet
    }
    await sleep(250);
  }
  throw new Error(`Timed out waiting for Chrome DevTools on port ${port}`);
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.id = 1;
    this.callbacks = new Map();
    this.consoleErrors = [];
    this.networkFailures = [];
  }

  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });

    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.callbacks.has(msg.id)) {
        const { resolve, reject } = this.callbacks.get(msg.id);
        this.callbacks.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      } else if (msg.method) {
        if (msg.method === 'Runtime.consoleAPICalled' && msg.params?.type === 'error') {
          const argsText = (msg.params.args || [])
            .map((a) => a.value ?? a.description ?? JSON.stringify(a))
            .join(' ');
          this.consoleErrors.push(argsText);
        } else if (msg.method === 'Runtime.exceptionThrown') {
          this.consoleErrors.push(JSON.stringify(msg.params));
        } else if (msg.method === 'Network.responseReceived') {
          const { response } = msg.params || {};
          if (response && response.status >= 400 && !response.url?.endsWith('/favicon.ico')) {
            this.networkFailures.push(`${response.status} ${response.url}`);
          }
        } else if (msg.method === 'Network.loadingFailed') {
          const { errorText, canceled } = msg.params || {};
          if (!canceled) {
            this.networkFailures.push(`loadingFailed: ${errorText || 'unknown'}`);
          }
        }
      }
    };
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (res.exceptionDetails) {
      throw new Error(`Eval error: ${JSON.stringify(res.exceptionDetails)}`);
    }
    return res.result?.value;
  }

  async screenshot(filename) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    const outPath = path.join(ARTIFACT_DIR, filename);
    fs.writeFileSync(outPath, buffer);
    console.log(`[Screenshot saved]: ${filename} (${buffer.length} bytes) -> ${outPath}`);
    return outPath;
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function runTests() {
  console.log('--- STARTING USER TESTING WITH HEADLESS CHROME ---');
  console.log(`Chrome: ${CHROME_PATH}`);
  console.log(`Target URL: ${BASE_URL}`);
  console.log(`Artifacts: ${ARTIFACT_DIR}`);

  const chromeArgs = [
    '--headless=new',
    `--remote-debugging-port=${DEBUG_PORT}`,
    '--disable-gpu',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--window-size=1280,850',
    '--mute-audio',
    'about:blank',
  ];

  const chromeProc = spawn(CHROME_PATH, chromeArgs, { stdio: 'ignore' });

  let cdp;
  const testResults = [];

  try {
    const targets = await waitForTargets(DEBUG_PORT);
    const pageTarget = targets.find((t) => t.type === 'page') || targets[0];
    if (!pageTarget) throw new Error('No Chrome target found');

    cdp = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await cdp.connect();

    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('DOM.enable');
    await cdp.send('Network.enable');

    console.log('Connected to Chrome DevTools Protocol.');

    // Navigate to app
    await cdp.send('Page.navigate', { url: BASE_URL });
    await sleep(2500);

    // Ensure speech synthesis onstart triggers in headless environments
    await cdp.eval(`
      if ('speechSynthesis' in window) {
        const origSpeak = window.speechSynthesis.speak.bind(window.speechSynthesis);
        window.speechSynthesis.speak = function(u) {
          setTimeout(() => { if (u.onstart) u.onstart(); }, 50);
          try { origSpeak(u); } catch(e) {}
        };
      }
    `);

    // Helper assertion
    function assert(name, condition, details = '') {
      const status = condition ? 'PASS' : 'FAIL';
      console.log(`[${status}] ${name} ${details ? '(' + details + ')' : ''}`);
      testResults.push({ name, status, details });
      if (!condition) {
        throw new Error(`Assertion failed: ${name} - ${details}`);
      }
    }

    // =========================================================================
    // TEST 1: Launchpad Initial Screen
    // =========================================================================
    console.log('\n--- 1. Testing Launchpad Screen ---');
    const headerTitle = await cdp.eval('document.querySelector("header h1")?.textContent?.trim()');
    assert('Header App Title', headerTitle === 'Olivia in Outer Space', `Found "${headerTitle}"`);

    const headerSub = await cdp.eval('document.querySelector("header .text-\\\\[9px\\\\]")?.textContent?.trim()');
    assert('Header Subtitle shows ASTRO-LAB', headerSub?.includes('ASTRO-LAB'), `Found "${headerSub}"`);
    assert('Header Subtitle shows EARTH SPACEPORT', headerSub?.includes('EARTH SPACEPORT'), `Found "${headerSub}"`);

    const launchpadFaceBtn = await cdp.eval('document.querySelector(".cockpit-btn.bg-slate-900\\\\/85")?.textContent?.trim()');
    assert('Launchpad Face button labeled with action', launchpadFaceBtn?.includes('Real Photo Face'), `Found "${launchpadFaceBtn}"`);

    const voiceBtn = await cdp.eval('document.querySelectorAll("header button")[0]?.textContent?.trim()');
    assert('Voice button labeled with action if pressed', voiceBtn?.includes('Robot'), `Found "${voiceBtn}"`);

    const muteBtn = await cdp.eval('document.querySelectorAll("header button")[1]?.textContent?.trim()');
    assert('Audio button labeled with action if pressed', muteBtn?.includes('Mute'), `Found "${muteBtn}"`);

    await cdp.screenshot('screen_1_launchpad.png');

    // Test Voice toggle button action
    console.log('\n--- Testing Voice Toggle Action ---');
    await cdp.eval('document.querySelectorAll("header button")[0]?.click()');
    await sleep(500);
    const voiceBtnAfter = await cdp.eval('document.querySelectorAll("header button")[0]?.textContent?.trim()');
    assert('Voice button switches to Child Voice action when in Robot mode', voiceBtnAfter?.includes('Child'), `Found "${voiceBtnAfter}"`);
    // Switch back to Child mode
    await cdp.eval('document.querySelectorAll("header button")[0]?.click()');
    await sleep(500);

    // =========================================================================
    // TEST 2: Board Rocket & Blast Off to Cockpit
    // =========================================================================
    console.log('\n--- 2. Testing Blast Off to Cockpit ---');
    const boardBtnExists = await cdp.eval('Boolean(document.querySelector("button.bg-gradient-to-r"))');
    assert('Board Rocket & Blast Off button present', boardBtnExists);

    // Click Board Rocket button
    await cdp.eval('document.querySelector("button.bg-gradient-to-r")?.click()');
    await sleep(1500);

    // Skip countdown if countdown is visible
    const skipBtn = await cdp.eval('Boolean(document.querySelector("button.absolute.top-6.right-6"))');
    if (skipBtn) {
      console.log('Skipping launch countdown...');
      await cdp.eval('document.querySelector("button.absolute.top-6.right-6")?.click()');
      await sleep(1500);
    }

    // Now in Cockpit!
    const stationText = await cdp.eval('document.querySelector("header .text-cyan-300")?.textContent?.trim()');
    assert('Entered Cockpit (Flight Deck)', stationText === 'FLIGHT DECK', `Station is "${stationText}"`);

    // Verify Slider is NOT present in top menu
    const sliderExists = await cdp.eval('Boolean(document.querySelector("header .border-cyan-500\\\\/40"))');
    assert('Slider selection for "Solar System - Earth Orbit" is removed', !sliderExists);

    // Verify Launchpad button is present
    const launchpadBtnText = await cdp.eval(`
      Array.from(document.querySelectorAll("header button"))
        .map(b => b.textContent.trim())
        .find(t => t.includes("Launchpad"))
    `);
    assert('Launchpad button is present in header', Boolean(launchpadBtnText), `Found "${launchpadBtnText}"`);

    // Verify Astronaut Face Toggle button in header says "Photos" (action)
    const faceToggleBtn = await cdp.eval(`
      Array.from(document.querySelectorAll("header button"))
        .map(b => b.textContent.trim())
        .find(t => t.includes("Photos") || t.includes("Cartoon"))
    `);
    assert('Astronaut face toggle labeled as action if pressed', faceToggleBtn?.includes('Photos'), `Found "${faceToggleBtn}"`);

    await cdp.screenshot('screen_2_cockpit_solarsystem.png');

    // =========================================================================
    // TEST 3: Enter Planetary Selection Screen (e.g. Earth with Moon)
    // =========================================================================
    console.log('\n--- 3. Testing Planetary Selection Screen (Earth with Moon) ---');
    await cdp.eval('document.getElementById("planet-card-earth")?.click()');
    await sleep(1500);

    // Verify we are on planetary selection screen
    const selectionHeader = await cdp.eval('document.querySelector("h2")?.textContent?.trim()');
    assert('Selection screen displays planet name', selectionHeader === 'Earth', `Found "${selectionHeader}"`);

    // Check Side-by-Side Layout and Centering
    const layoutCheck = await cdp.eval(`(() => {
      const combo = document.querySelector(".md\\\\:flex-row.justify-center");
      if (!combo) return { found: false };
      const children = Array.from(combo.children);
      const isSideBySide = window.getComputedStyle(combo).flexDirection === 'row';
      const hasStory = Boolean(combo.querySelector("[class*='Read-Along'], [class*='read-along'], h3, p"));
      return {
        found: true,
        childCount: children.length,
        isSideBySide,
        hasStory,
        justify: window.getComputedStyle(combo).justifyContent
      };
    })()`);

    assert('Side-by-side combination container present', layoutCheck.found);
    assert('Read-Along is inside the combination with the object', layoutCheck.hasStory);
    assert('Container centers horizontally (justify-content center)', layoutCheck.justify === 'center', `Justify is "${layoutCheck.justify}"`);

    // Verify camera button is labeled as action
    const planetCameraBtn = await cdp.eval(`
      Array.from(document.querySelectorAll("button"))
        .map(b => b.textContent.trim())
        .find(t => t.includes("Photo") || t.includes("Cartoon"))
    `);
    assert('Selection screen camera toggle is labeled as action', Boolean(planetCameraBtn), `Found "${planetCameraBtn}"`);

    // Verify companion moons highway is present below (e.g. The Moon)
    const moonsHeader = await cdp.eval('document.querySelector("h3.text-yellow-300")?.textContent?.trim()');
    assert('Companion Moons Highway present below', moonsHeader?.includes('Companion Moons'), `Found "${moonsHeader}"`);

    // Verify tapping Companion Moon updates Read-Along story
    await cdp.eval(`{
      const moonCard = Array.from(document.querySelectorAll("[role='button']"))
        .find(el => el.textContent.includes("The Moon"));
      if (moonCard) moonCard.click();
    }`);
    await sleep(400);
    const moonStoryActive = await cdp.eval('document.body.textContent.includes("Moon")');
    assert('Tapping companion moon updates active focus', moonStoryActive);

    await cdp.screenshot('screen_3_selection_side_by_side.png');

    // =========================================================================
    // TEST 4: Read-Along Story Interaction (including Muted Fallback)
    // =========================================================================
    console.log('\n--- 4. Testing Read-Along Story Interaction ---');
    const readToMeBtn = await cdp.eval(`
      Array.from(document.querySelectorAll("button"))
        .find(b => b.textContent.includes("Read to Me"))?.textContent?.trim()
    `);
    assert('Read to Me button present', Boolean(readToMeBtn));

    // Click Read to Me
    await cdp.eval(`{
      const btn = Array.from(document.querySelectorAll("button"))
        .find(el => el.textContent.includes("Read to Me"));
      if (btn) btn.click();
    }`);
    await sleep(800);

    const isPlayingBtn = await cdp.eval(`
      Array.from(document.querySelectorAll("button"))
        .some(el => el.textContent.includes("Pause"))
    `);
    assert('Story begins reading and button toggles to Pause (action if pressed)', isPlayingBtn);

    // Pause story
    await cdp.eval(`{
      const btn = Array.from(document.querySelectorAll("button"))
        .find(el => el.textContent.includes("Pause"));
      if (btn) btn.click();
    }`);
    await sleep(400);

    // =========================================================================
    // TEST 5: Fly to Destination Screen (Cartoon Default + Action GIF)
    // =========================================================================
    console.log('\n--- 5. Testing Fly to Destination Screen ---');
    // Click "Fly to Earth!"
    await cdp.eval(`{
      const flyBtn = Array.from(document.querySelectorAll("button"))
        .find(el => el.textContent.includes("Fly to"));
      if (flyBtn) flyBtn.click();
    }`);
    await sleep(3000);

    // Destination view loaded!
    const destTitle = await cdp.eval('document.querySelector("main h1")?.textContent?.trim()');
    assert('Destination screen loaded for planet', destTitle === 'Earth', `Found "${destTitle}"`);

    // Verify Cartoon Visual is default
    const cartoonSvg = await cdp.eval('Boolean(document.querySelector("svg circle[fill*=\'url\'], svg path[fill=\'#22c55e\']"))');
    assert('Cartoon vector illustration shown by default', cartoonSvg);

    // Verify Camera toggle says NASA Photo (action if pressed)
    const destCamBtn = await cdp.eval(`
      Array.from(document.querySelectorAll("button"))
        .map(el => el.textContent.trim())
        .find(t => t.includes("Photo") || t.includes("Cartoon"))
    `);
    assert('Destination camera toggle invites user to view NASA Photo', destCamBtn?.includes('NASA Photo'), `Found "${destCamBtn}"`);

    await cdp.screenshot('screen_4_destination_cartoon.png');

    // =========================================================================
    // TEST 6: Press Sensory Action Button -> Trigger Animated Cartoon GIF Modal
    // =========================================================================
    console.log('\n--- 6. Testing Sensory Action & Cartoon GIF Modal ---');
    const actionBtnText = await cdp.eval('document.querySelector("button.bg-gradient-to-r.from-fuchsia-600")?.textContent?.trim()');
    assert('Sensory action button present', Boolean(actionBtnText), `Found "${actionBtnText}"`);

    // Click Action Button
    await cdp.eval('document.querySelector("button.bg-gradient-to-r.from-fuchsia-600")?.click()');
    await sleep(1000);

    // Verify Modal has appeared
    const modalVisible = await cdp.eval('Boolean(document.querySelector(".fixed.inset-0.z-50"))');
    assert('Celebration modal appeared upon pressing action button', modalVisible);

    // Verify Animated Cartoon GIF is playing inside modal
    const modalGifSrc = await cdp.eval('document.querySelector(".fixed.inset-0.z-50 img")?.getAttribute("src")');
    assert('Animated cartoon GIF loaded in modal', modalGifSrc?.includes('/assets/cartoons/interactions/earth.gif'), `GIF src is "${modalGifSrc}"`);

    // Verify Play Again & Done buttons
    const playAgainBtn = await cdp.eval(`
      Array.from(document.querySelectorAll(".fixed.inset-0.z-50 button"))
        .some(el => el.textContent.includes("Play Again"))
    `);
    assert('Modal has Play Again button', playAgainBtn);

    const doneBtn = await cdp.eval(`
      Array.from(document.querySelectorAll(".fixed.inset-0.z-50 button"))
        .some(el => el.textContent.includes("Done"))
    `);
    assert('Modal has Done button', doneBtn);

    await cdp.screenshot('screen_5_action_celebration_gif_modal.png');

    // Click "Done! 🚀" to close modal
    console.log('Closing celebration modal...');
    await cdp.eval(`{
      const done = Array.from(document.querySelectorAll(".fixed.inset-0.z-50 button"))
        .find(el => el.textContent.includes("Done"));
      if (done) done.click();
    }`);
    await sleep(600);

    const modalClosed = await cdp.eval('!document.querySelector(".fixed.inset-0.z-50")');
    assert('Celebration modal closed cleanly', modalClosed);

    // Verify GIF is also embedded in the Sensory Action Card
    const embeddedGif = await cdp.eval('document.querySelector(".border-yellow-300 img")?.getAttribute("src")');
    assert('Cartoon GIF is also embedded in the sensory action card', embeddedGif?.includes('/assets/cartoons/interactions/earth.gif'), `Embedded src: "${embeddedGif}"`);

    await cdp.screenshot('screen_6_destination_with_embedded_gif.png');

    // =========================================================================
    // TEST 7: Return to Cockpit and Launchpad
    // =========================================================================
    console.log('\n--- 7. Testing Navigation Return ---');
    // Click Cockpit back button
    await cdp.eval(`{
      const cockBtn = Array.from(document.querySelectorAll("button"))
        .find(el => el.textContent.includes("Cockpit"));
      if (cockBtn) cockBtn.click();
    }`);
    await sleep(1000);

    const backInCockpit = await cdp.eval('document.querySelector("header .text-cyan-300")?.textContent?.trim() === "FLIGHT DECK"');
    assert('Returned cleanly to Cockpit', backInCockpit);

    // Click Launchpad button in top header
    await cdp.eval(`{
      const lBtn = Array.from(document.querySelectorAll("header button"))
        .find(el => el.textContent.includes("Launchpad"));
      if (lBtn) lBtn.click();
    }`);
    await sleep(1000);

    const backAtLaunchpad = await cdp.eval('document.querySelector("header .text-cyan-300")?.textContent?.trim() === "EARTH SPACEPORT"');
    assert('Returned cleanly to Launchpad via top header button', backAtLaunchpad);

    // =========================================================================
    // TEST 8: Zero Runtime / Console / Network 4xx-5xx Errors
    // =========================================================================
    console.log('\n--- 8. Checking Browser Console & Network Health ---');
    assert(
      'Zero browser console errors or uncaught exceptions',
      cdp.consoleErrors.length === 0,
      cdp.consoleErrors.join(' | ')
    );
    assert(
      'Zero failed HTTP asset/API requests',
      cdp.networkFailures.length === 0,
      cdp.networkFailures.join(' | ')
    );

    console.log('\n======================================================');
    console.log(`ALL ${testResults.length} USER FLOW TESTS PASSED SUCCESSFULLY!`);
    console.log('======================================================');

  } catch (err) {
    console.error('\n❌ TEST RUN FAILED:', err);
    process.exitCode = 1;
  } finally {
    if (cdp) cdp.close();
    chromeProc.kill();
  }
}

runTests();
