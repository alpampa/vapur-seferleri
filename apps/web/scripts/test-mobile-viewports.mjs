import { spawn } from 'child_process';
import http from 'http';
import WebSocket from 'ws';
import path from 'path';
import os from 'os';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const VIEWPORTS = [
  { name: 'Ultra-Narrow Mobile', width: 320, height: 568 },
  { name: 'Small Android', width: 360, height: 640 },
  { name: 'Standard iPhone SE/8', width: 375, height: 667 },
  { name: 'Modern iPhone 12/13/14', width: 390, height: 844 },
  { name: 'Large Phone (Pro Max)', width: 430, height: 932 },
  { name: 'Tablet (iPad Mini)', width: 768, height: 1024 },
  { name: 'Desktop / Laptop', width: 1024, height: 768 }
];

const TARGET_URL = 'http://localhost:3100';
const PORT = 9225;
const tempUserDataDir = path.join(os.tmpdir(), `chrome-test-${Date.now()}`);

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function runTest() {
  console.log('🚀 Başlatılıyor: Headless Chrome Viewport Test Suite...');
  fs.mkdirSync(tempUserDataDir, { recursive: true });

  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${tempUserDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    '--disable-background-networking',
    TARGET_URL
  ]);

  chromeProc.on('error', (err) => {
    console.error('Chrome spawn error:', err);
  });

  // Chrome'un portu açmasını bekle
  let targetWsUrl = null;
  for (let i = 0; i < 20; i++) {
    await wait(400);
    try {
      const list = await fetchJson(`http://127.0.0.1:${PORT}/json/list`);
      if (Array.isArray(list) && list.length > 0) {
        const pageTarget = list.find(t => t.type === 'page') || list[0];
        targetWsUrl = pageTarget.webSocketDebuggerUrl;
        break;
      }
    } catch {}
  }

  if (!targetWsUrl) {
    console.error('❌ Chrome CDP WebSocket bağlantısı kurulamadı.');
    chromeProc.kill();
    process.exit(1);
  }

  console.log(`🔌 Chrome bağlandı: ${targetWsUrl}`);
  const ws = new WebSocket(targetWsUrl);

  let idCounter = 1;
  const pendingRequests = new Map();

  function sendCommand(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = idCounter++;
      pendingRequests.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data);
      if (msg.id && pendingRequests.has(msg.id)) {
        const { resolve, reject } = pendingRequests.get(msg.id);
        pendingRequests.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    } catch (e) {}
  });

  await new Promise((resolve) => ws.on('open', resolve));

  // Sayfayı etkinleştir
  await sendCommand('Page.enable');
  await sendCommand('Runtime.enable');
  await sendCommand('Page.navigate', { url: TARGET_URL });
  await wait(2000); // Hidrasyon ve SSR için bekleme

  console.log('\n📊 SIFIR YATAY TAŞMA DOĞRULAMA RAPORU:');
  console.log('='.repeat(70));

  let totalFailed = 0;

  for (const vp of VIEWPORTS) {
    // Viewport override
    await sendCommand('Emulation.setDeviceMetricsOverride', {
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: 1,
      mobile: vp.width < 768,
      dontSetVisibleSize: false
    });

    if (vp.width < 768) {
      await sendCommand('Emulation.setTouchEmulationEnabled', {
        enabled: true,
        configuration: 'mobile'
      });
      await sendCommand('Emulation.setUserAgentOverride', {
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
      });
    } else {
      await sendCommand('Emulation.setTouchEmulationEnabled', {
        enabled: false
      });
      await sendCommand('Emulation.setUserAgentOverride', {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      });
    }

    await sendCommand('Page.reload');
    await wait(1200); // Wait for hydration and full layout rendering

    const evalResult = await sendCommand('Runtime.evaluate', {
      expression: `
        (() => {
          const winW = window.innerWidth;
          const docW = document.documentElement.clientWidth;
          const scrollW = document.documentElement.scrollWidth;
          const bodyScrollW = document.body.scrollWidth;
          
          const elements = Array.from(document.querySelectorAll('*'));
          const overflows = [];
          
          function isInsideClippedContainer(el) {
            let parent = el.parentElement;
            while (parent && parent !== document.body && parent !== document.documentElement) {
              const style = window.getComputedStyle(parent);
              const ox = style.overflowX;
              if (ox === 'auto' || ox === 'scroll' || ox === 'hidden') {
                return true;
              }
              parent = parent.parentElement;
            }
            return false;
          }

          const effectiveW = docW;
          for (const el of elements) {
            const r = el.getBoundingClientRect();
            // Ekran sağ kenarından taşan ve kırpılmamış (uncontained) elemanlar
            if (r.right > effectiveW + 1 && r.width > 0 && r.height > 0 && !isInsideClippedContainer(el)) {
              overflows.push({
                tag: el.tagName.toLowerCase(),
                id: el.id || '',
                classes: String(el.className || '').slice(0, 60),
                right: Math.round(r.right),
                width: Math.round(r.width),
                overflowPx: Math.round(r.right - effectiveW)
              });
            }
          }
          
          return {
            winW,
            docW,
            scrollW,
            bodyScrollW,
            hasHorizontalScroll: scrollW > effectiveW + 1,
            overflowCount: overflows.length,
            overflows: overflows.slice(0, 5)
          };
        })()
      `,
      returnByValue: true
    });

    const res = evalResult.result.value;
    const isPassing = !res.hasHorizontalScroll && res.overflowCount === 0;

    if (isPassing) {
      console.log(`✅ [${vp.width}px] ${vp.name.padEnd(25)} | clientWidth: ${res.docW}px | scrollWidth: ${res.scrollW}px | TAŞMA: SIFIR`);
    } else {
      totalFailed++;
      console.log(`❌ [${vp.width}px] ${vp.name.padEnd(25)} | clientWidth: ${res.docW}px | scrollWidth: ${res.scrollW}px | TAŞMA: ${res.scrollW - res.docW}px (${res.overflowCount} eleman)`);
      if (res.overflows && res.overflows.length > 0) {
        console.log('   Offenders:', JSON.stringify(res.overflows, null, 2));
      }
    }
  }

  console.log('='.repeat(70));
  if (totalFailed === 0) {
    console.log('🎉 TEBRİKLER! Tüm ekran boyutlarında (320px - 1024px) SIFIR YATAY TAŞMA başarıyla doğrulandı.\n');
  } else {
    console.log(`⚠️ ${totalFailed} ekranda taşma tespit edildi.\n`);
  }

  // Temizle ve çık
  ws.close();
  chromeProc.kill();
  try {
    fs.rmSync(tempUserDataDir, { recursive: true, force: true });
  } catch {}

  process.exit(totalFailed === 0 ? 0 : 1);
}

runTest().catch((e) => {
  console.error('Fatal test error:', e);
  process.exit(1);
});
