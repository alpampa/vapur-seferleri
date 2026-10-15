import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Minimal, bağımlılıksız .env yükleyici.
 *
 * NestJS CJS (CommonJS) olarak derlendiği için, ESM-only yapılandırma
 * paketlerine bağımlı olmak yerine ortam değişkenlerini burada
 * doğrudan okuruz. Zaten tanımlı olan değişkenler EZİLMEZ.
 */
export function loadEnv(): void {
  const candidates = [
    '.env',
    'apps/api/.env',
    '../../.env',
    resolve(process.cwd(), '.env'),
  ];

  for (const candidate of candidates) {
    const filePath = resolve(process.cwd(), candidate);
    if (!existsSync(filePath)) continue;

    const content = readFileSync(filePath, 'utf8');
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;

      const eq = line.indexOf('=');
      if (eq === -1) continue;

      const key = line.slice(0, eq).trim();
      if (!key) continue;

      let value = line.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  }
}
