import https from "node:https";

const routesToFetch = [
  // Şehiriçi
  { mainHatTuruId: "1", kalkisVal: "1_101_2_102", varisId: "104", origin: "Karaköy", destination: "Kadıköy", category: "BOGAZ" },
  { mainHatTuruId: "1", kalkisVal: "1_101_4_104", varisId: "102", origin: "Kadıköy", destination: "Karaköy", category: "BOGAZ" },
  { mainHatTuruId: "1", kalkisVal: "1_101_1_101", varisId: "104", origin: "Eminönü", destination: "Kadıköy", category: "BOGAZ" },
  { mainHatTuruId: "1", kalkisVal: "1_101_4_104", varisId: "101", origin: "Kadıköy", destination: "Eminönü", category: "BOGAZ" },
  { mainHatTuruId: "1", kalkisVal: "1_101_3_103", varisId: "101", origin: "Üsküdar", destination: "Eminönü", category: "BOGAZ" },
  { mainHatTuruId: "1", kalkisVal: "1_101_1_101", varisId: "103", origin: "Eminönü", destination: "Üsküdar", category: "BOGAZ" },
  { mainHatTuruId: "1", kalkisVal: "1_101_3_103", varisId: "102", origin: "Üsküdar", destination: "Karaköy", category: "BOGAZ" },
  { mainHatTuruId: "1", kalkisVal: "1_101_2_102", varisId: "103", origin: "Karaköy", destination: "Üsküdar", category: "BOGAZ" },

  // Adalar
  { mainHatTuruId: "3", kalkisVal: "3_103_1_101", varisId: "116", origin: "Eminönü", destination: "Büyükada", category: "ADALAR" },
  { mainHatTuruId: "3", kalkisVal: "3_103_1_101", varisId: "118", origin: "Eminönü", destination: "Heybeliada", category: "ADALAR" },
  { mainHatTuruId: "3", kalkisVal: "3_103_1_101", varisId: "117", origin: "Eminönü", destination: "Kınalıada", category: "ADALAR" },
  { mainHatTuruId: "3", kalkisVal: "3_103_2_102", varisId: "116", origin: "Karaköy", destination: "Büyükada", category: "ADALAR" },
  { mainHatTuruId: "3", kalkisVal: "3_103_4_104", varisId: "116", origin: "Kadıköy", destination: "Büyükada", category: "ADALAR" },
  { mainHatTuruId: "3", kalkisVal: "3_103_4_104", varisId: "118", origin: "Kadıköy", destination: "Heybeliada", category: "ADALAR" },
  { mainHatTuruId: "3", kalkisVal: "3_103_4_104", varisId: "117", origin: "Kadıköy", destination: "Kınalıada", category: "ADALAR" },
  { mainHatTuruId: "3", kalkisVal: "3_103_16_116", varisId: "101", origin: "Büyükada", destination: "Eminönü", category: "ADALAR" },
  { mainHatTuruId: "3", kalkisVal: "3_103_16_116", varisId: "104", origin: "Büyükada", destination: "Kadıköy", category: "ADALAR" },
  { mainHatTuruId: "3", kalkisVal: "3_103_18_118", varisId: "101", origin: "Heybeliada", destination: "Eminönü", category: "ADALAR" },
  { mainHatTuruId: "3", kalkisVal: "3_103_18_118", varisId: "104", origin: "Heybeliada", destination: "Kadıköy", category: "ADALAR" },
  { mainHatTuruId: "3", kalkisVal: "3_103_17_117", varisId: "101", origin: "Kınalıada", destination: "Eminönü", category: "ADALAR" },
  { mainHatTuruId: "3", kalkisVal: "3_103_17_117", varisId: "104", origin: "Kınalıada", destination: "Kadıköy", category: "ADALAR" },
];

function fetchTuryolSchedule(route) {
  return new Promise((resolve) => {
    const postData = `MainHatTuruId=${route.mainHatTuruId}&TarifeKalkisId=${route.kalkisVal}&TarifeVarisId=${route.varisId}`;
    const req = https.request(
      "https://www.turyol.com/Home/Tarifeler",
      {
        method: "POST",
        rejectUnauthorized: false,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(postData),
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          const times = [];
          const regex = /<td class="">(\d{2}:\d{2})<\/td>/g;
          let match;
          while ((match = regex.exec(body)) !== null) {
            times.push(match[1]);
          }
          resolve({ ...route, times });
        });
      }
    );
    req.on("error", (e) => {
      console.error(`Error fetching ${route.origin} -> ${route.destination}:`, e.message);
      resolve({ ...route, times: [] });
    });
    req.write(postData);
    req.end();
  });
}

async function main() {
  console.log("Fetching Turyol schedules...");
  const results = [];
  for (const r of routesToFetch) {
    const res = await fetchTuryolSchedule(r);
    console.log(`${res.origin} ➔ ${res.destination}: ${res.times.length} trips (${res.times.slice(0, 5).join(", ")}...)`);
    results.push(res);
  }
  const fs = await import("node:fs");
  fs.writeFileSync("d:/PROJE ÇALIŞMALARI/YAYILANAN PROJELERİM/Vapur/apps/web/src/lib/data/turyol-scraped.json", JSON.stringify(results, null, 2));
  console.log("Saved to turyol-scraped.json successfully!");
}

main();
