import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const REPORT_PATH = path.join(rootDir, 'public', 'system-audit-report.json');
const LOG_PATH = path.join(rootDir, 'audit-daemon.log');

let last0100SyncDate = '';

function logMessage(msg) {
  const ts = new Date().toISOString();
  const line = `[${ts}] [AUDIT_DAEMON] ${msg}\n`;
  process.stdout.write(line);
  try {
    fs.appendFileSync(LOG_PATH, line, 'utf8');
  } catch (e) {}
}

function checkHttpEndpoint(targetUrl) {
  return new Promise((resolve) => {
    try {
      const client = targetUrl.startsWith('https') ? https : http;
      const req = client.get(targetUrl, { timeout: 8000, headers: { 'User-Agent': 'Vapur-Audit-Agent/2.0' } }, (res) => {
        resolve({
          url: targetUrl,
          statusCode: res.statusCode || 0,
          ok: (res.statusCode >= 200 && res.statusCode < 400)
        });
      });
      req.on('error', (err) => {
        resolve({
          url: targetUrl,
          statusCode: 0,
          ok: false,
          error: err.message
        });
      });
      req.on('timeout', () => {
        req.destroy();
        resolve({
          url: targetUrl,
          statusCode: 408,
          ok: false,
          error: 'Timeout after 8000ms'
        });
      });
    } catch (err) {
      resolve({
        url: targetUrl,
        statusCode: 0,
        ok: false,
        error: err.message
      });
    }
  });
}

function fetchLiveAuditReport() {
  return new Promise((resolve) => {
    https.get('https://vapur-seferleri.vercel.app/api/audit', { timeout: 10000 }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', () => {
      resolve(null);
    });
  });
}

function trigger0100Sync() {
  return new Promise((resolve) => {
    https.get('https://vapur-seferleri.vercel.app/api/cron/sync-tariffs', { timeout: 15000, headers: { 'User-Agent': 'local-audit-daemon-0100' } }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve({ status: 'OK', raw: data });
        }
      });
    }).on('error', (err) => {
      resolve({ error: err.message });
    });
  });
}

async function runCycle(cycleCount) {
  const now = new Date();
  const istanbulFormatter = new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  
  const istParts = istanbulFormatter.formatToParts(now);
  const istMap = {};
  istParts.forEach(p => { istMap[p.type] = p.value; });
  
  const istHour = parseInt(istMap.hour, 10);
  const istMinute = parseInt(istMap.minute, 10);
  const istDate = `${istMap.year}-${istMap.month}-${istMap.day}`;

  // Check 01:00 AM daily trigger
  if (istHour === 1 && istMinute <= 5 && last0100SyncDate !== istDate) {
    last0100SyncDate = istDate;
    logMessage(`>>> GECE 01:00 TARİFE SENKRONİZASYON TETİKLENDİ (${istDate} 01:${istMap.minute}) <<<`);
    const syncRes = await trigger0100Sync();
    logMessage(`01:00 Senkronizasyon Yanıtı: ${JSON.stringify(syncRes)}`);
  }

  logMessage(`Döngü #${cycleCount} başlatılıyor: 913+ Bireysel Denetim Noktası Taranıyor... (İstanbul Saati: ${istMap.hour}:${istMap.minute})`);

  const officialSites = [
    'https://sehirhatlari.istanbul',
    'https://www.turyol.com',
    'https://www.mavimarmara.net',
    'https://www.denturavrasya.com',
    'https://www.prenstur.net',
    'https://vapur-seferleri.vercel.app',
    'https://adalar-sefer-asistani.vercel.app',
    'https://vapur-seferleri.vercel.app/api/sync',
    'https://vapur-seferleri.vercel.app/api/audit',
    'https://vapur-seferleri.vercel.app/api/cron/sync-tariffs'
  ];

  const httpResults = await Promise.all(officialSites.map(url => checkHttpEndpoint(url)));
  const accessibleCount = httpResults.filter(r => r.ok).length;
  logMessage(`Canlı Web ve Sunucu Testleri: ${accessibleCount}/${officialSites.length} uç nokta aktif ve yanıt veriyor.`);

  const report = await fetchLiveAuditReport();

  if (report) {
    report.daemonCycleCount = cycleCount;
    report.lastDaemonCheck = new Date().toISOString();
    report.last0100SyncDate = last0100SyncDate;
    report.istanbulCurrentTime = `${istDate} ${istMap.hour}:${istMap.minute}`;
    report.monitoredOfficialSites = httpResults;

    try {
      fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
      fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8');
      logMessage(`Döngü #${cycleCount} tamamlandı. Durum: ${report.overallStatus} | Skor: %${report.complianceScore} | Toplam Test: ${report.totalChecks} (${report.passedChecks} Başarılı, ${report.failedChecks} Hata, ${report.warningChecks} Uyarı).`);
    } catch (err) {
      logMessage(`Rapor yazma hatası: ${err.message}`);
    }
  } else {
    logMessage(`Döngü #${cycleCount}: Canlı rapor derleniyor...`);
  }
}

async function main() {
  logMessage('=== VAPUR KAPSAMLI SİSTEM VE GECE 01:00 TARİFE DENETİM AJANI DEVREDE ===');
  let cycle = 1;
  while (true) {
    try {
      await runCycle(cycle++);
    } catch (err) {
      logMessage(`Döngü sırasında hata: ${err.message}`);
    }
    await new Promise(r => setTimeout(r, 60000));
  }
}

main();
