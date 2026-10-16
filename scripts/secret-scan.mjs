import { execFileSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const MAX_FILE_BYTES = 1_500_000;

const BINARY_EXTENSIONS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".ico", ".webp", ".avif", ".bmp",
  ".woff", ".woff2", ".ttf", ".eot", ".otf",
  ".pdf", ".zip", ".gz", ".tar", ".7z", ".rar",
  ".mp3", ".mp4", ".mov", ".webm", ".wav",
  ".wasm", ".xlsx", ".docx", ".pptx", ".sqlite", ".db"
]);

const PATTERNS = [
  { name: "PRIVATE_KEY_BLOCK", regex: /-----BEGIN [A-Z ]*PRIVATE KEY-----/g },
  { name: "AWS_ACCESS_KEY", regex: /\bAKIA[0-9A-Z]{16}\b/g },
  { name: "GITHUB_TOKEN", regex: /\bgh[pousr]_[A-Za-z0-9]{36}\b/g },
  { name: "GITHUB_FINE_GRAINED_TOKEN", regex: /\bgithub_pat_[A-Za-z0-9_]{22,}\b/g },
  { name: "GOOGLE_API_KEY", regex: /\bAIza[0-9A-Za-z\-_]{35}\b/g },
  { name: "SLACK_TOKEN", regex: /\bxox[abprs]-[A-Za-z0-9-]{10,}\b/g },
  { name: "STRIPE_LIVE_KEY", regex: /\b(sk|rk)_live_[0-9a-zA-Z]{20,}\b/g },
  { name: "MAPBOX_TOKEN", regex: /\bpk\.[A-Za-z0-9]{20,}\.[A-Za-z0-9]{20,}\b/g },
  { name: "OPENAI_KEY", regex: /\bsk-[A-Za-z0-9]{20,}\b/g },
  { name: "SENDGRID_KEY", regex: /\bSG\.[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{43}\b/g },
  { name: "TELEGRAM_BOT_TOKEN", regex: /\b\d{8,10}:AA[A-Za-z0-9_-]{33}\b/g },
  { name: "JWT_TOKEN", regex: /\beyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{10,}\b/g }
];

const GENERIC_ASSIGNMENT =
  /(api[_-]?key|apikey|client[_-]?secret|secret[_-]?key|access[_-]?token|auth[_-]?token|password|passwd)\s*["']?\s*[:=]\s*["']([A-Za-z0-9+/=_\-\.]{18,})["']/gi;

const GENERIC_PLACEHOLDER = /example|placeholder|changeme|change_me|your[_-]|xxx+|dummy|sample|redacted|hidden|process\.env|\$\{|%s|test[_-]?(key|secret|token)|lorem|abcabc/i;

function isProbablyText(buffer, filePath) {
  if (BINARY_EXTENSIONS.has(path.extname(filePath).toLowerCase())) return false;
  const sample = buffer.subarray(0, 4096);
  if (sample.includes(0)) return false;
  return true;
}

function isHighEntropyish(value) {
  return /[a-zA-Z]/.test(value) && /[0-9]/.test(value) && value.length >= 20;
}

function mask(secret) {
  if (secret.length <= 8) return "***";
  return `${secret.slice(0, 4)}...${"*".repeat(Math.min(12, secret.length - 8))}`;
}

function loadAllowlist() {
  const allowlistPath = path.join(ROOT, ".secret-scan-allowlist");
  try {
    return readFileSync(allowlistPath, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith("#"))
      .map((line) => line.replace(/\\/g, "/"));
  } catch {
    return [];
  }
}

function isAllowed(filePath, allowlist) {
  const normalized = filePath.replace(/\\/g, "/");
  return allowlist.some((entry) => normalized === entry || normalized.startsWith(entry));
}

function main() {
  const allowlist = loadAllowlist();
  const tracked = execFileSync("git", ["ls-files", "-z"], {
    cwd: ROOT,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024
  })
    .split("\0")
    .filter(Boolean);

  const findings = [];
  let scannedCount = 0;
  let skippedCount = 0;

  for (const relativePath of tracked) {
    if (isAllowed(relativePath, allowlist)) {
      skippedCount += 1;
      continue;
    }

    const absolutePath = path.join(ROOT, relativePath);
    let buffer;
    try {
      const stat = statSync(absolutePath);
      if (!stat.isFile() || stat.size > MAX_FILE_BYTES) {
        skippedCount += 1;
        continue;
      }
      buffer = readFileSync(absolutePath);
    } catch {
      skippedCount += 1;
      continue;
    }

    if (!isProbablyText(buffer, relativePath)) {
      skippedCount += 1;
      continue;
    }

    scannedCount += 1;
    const content = buffer.toString("utf8");
    const lines = content.split(/\r?\n/);

    for (const { name, regex } of PATTERNS) {
      regex.lastIndex = 0;
      const match = regex.exec(content);
      if (match) {
        const prefix = content.slice(0, match.index);
        const lineNumber = prefix.split("\n").length;
        findings.push({ file: relativePath, line: lineNumber, rule: name, preview: mask(match[0]) });
      }
    }

    for (let i = 0; i < lines.length; i += 1) {
      GENERIC_ASSIGNMENT.lastIndex = 0;
      const match = GENERIC_ASSIGNMENT.exec(lines[i]);
      if (!match) continue;
      const value = match[2];
      if (GENERIC_PLACEHOLDER.test(value)) continue;
      if (!isHighEntropyish(value)) continue;
      findings.push({
        file: relativePath,
        line: i + 1,
        rule: "GENERIC_SECRET_ASSIGNMENT",
        preview: mask(value)
      });
    }
  }

  console.log(`Secret scan — ${scannedCount} dosya tarandı, ${skippedCount} atlandı (binary/büyük/allowlist).`);
  if (findings.length === 0) {
    console.log("Sonuç: TEMİZ — gizli anahtar/şifre kalıbı bulunamadı.");
    process.exit(0);
  }

  console.log(`Sonuç: ${findings.length} BULGU — inceleyin:`);
  for (const finding of findings) {
    console.log(`  ${finding.file}:${finding.line}  [${finding.rule}]  ${finding.preview}`);
  }
  console.log("\nGerçek sızıntıysa anahtarı iptal edip geçmişten temizleyin. Yanlış alarm ise dosyayı .secret-scan-allowlist'e ekleyin (bilinçli karar).");
  process.exit(1);
}

main();
