import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'src/lib/data/official-scraped-schedules.json');
const rawTrips = JSON.parse(fs.readFileSync(filePath, 'utf8'));

console.log('Starting Master Voyage Consolidation...');
console.log('Total Raw Trips in Database:', rawTrips.length);

// 1. Normalize Ring Trips (where origin === destination)
rawTrips.forEach(t => {
  if (t.origin === t.destination) {
    if (!t.stops) t.stops = [];
    const hasReturn = t.stops.some(s => s.name === t.origin);
    if (!hasReturn && t.arrivalTime) {
      t.stops.push({ name: t.origin, time: t.arrivalTime });
    }
    if (t.origin === 'Bostancı' && t.category === 'ADALAR') {
      t.destination = 'Adalar Ring (Bostancı)';
      t.routeTitle = 'Bostancı - Adalar Ring Hattı';
    } else if (t.origin === 'Aşiyan') {
      t.destination = 'Küçüksu - Anadolu Hisarı Ring';
      t.routeTitle = 'Aşiyan - Anadolu Hisarı - Küçüksu Ring Hattı';
    } else {
      t.destination = `${t.origin} Ring`;
    }
  }
});

// 2. Consolidate Boğaz Night Triangular Ring (Kadıköy - Karaköy - Beşiktaş - Kadıköy)
const bogazNightCycles = [
  { dep: '01:30', karakoy: '01:50', besiktas: '02:05', arr: '02:30' },
  { dep: '02:35', karakoy: '02:55', besiktas: '03:10', arr: '03:35' },
  { dep: '03:45', karakoy: '04:05', besiktas: '04:20', arr: '04:45' },
  { dep: '04:55', karakoy: '05:15', besiktas: '05:30', arr: '05:55' }
];

const bogazSubIds = new Set();
bogazNightCycles.forEach((c) => {
  const master = rawTrips.find(t => t.origin === 'Kadıköy' && t.departureTime === c.dep);
  if (master) {
    master.destination = 'Gece Ring (Karaköy - Beşiktaş - Kadıköy)';
    master.routeTitle = 'Kadıköy - Karaköy - Beşiktaş Gece Ring Hattı';
    master.arrivalTime = c.arr;
    master.stops = [
      { name: 'Karaköy', time: c.karakoy },
      { name: 'Beşiktaş', time: c.besiktas },
      { name: 'Kadıköy', time: c.arr }
    ];
  }

  rawTrips.forEach(t => {
    if (t.operator === 'Şehir Hatları') {
      if (t.origin === 'Karaköy' && (t.departureTime === c.karakoy || (t.stops || []).some(s => s.time === c.arr))) {
        bogazSubIds.add(t.id);
      }
      if (t.origin === 'Beşiktaş' && (t.departureTime === c.besiktas || (t.stops || []).some(s => s.time === c.karakoy))) {
        bogazSubIds.add(t.id);
      }
    }
  });
});

// 3. Build full station sequence for each trip
function getSequence(t) {
  const seq = [{ name: t.origin, time: t.departureTime }];
  if (t.stops) {
    t.stops.forEach(s => seq.push({ name: s.name, time: s.time }));
  }
  if (t.arrivalTime && t.destination && !t.destination.includes('Ring')) {
    seq.push({ name: t.destination, time: t.arrivalTime });
  }
  return seq;
}

// 4. Find sub-trips whose all events are sequentially contained in a larger master trip
const subTripIds = new Set(bogazSubIds);

for (let i = 0; i < rawTrips.length; i++) {
  const tA = rawTrips[i];
  const seqA = getSequence(tA);

  for (let j = 0; j < rawTrips.length; j++) {
    if (i === j) continue;
    const tB = rawTrips[j];
    if (tA.operator !== tB.operator) continue;
    const seqB = getSequence(tB);

    if (seqB.length <= seqA.length) continue;

    // Check if seqA is a sub-sequence of seqB in chronological order
    let bIdx = 0;
    let matchCount = 0;
    for (let a = 0; a < seqA.length; a++) {
      while (bIdx < seqB.length) {
        if (seqB[bIdx].name === seqA[a].name && seqB[bIdx].time === seqA[a].time) {
          matchCount++;
          bIdx++;
          break;
        }
        bIdx++;
      }
    }

    if (matchCount === seqA.length) {
      subTripIds.add(tA.id);
      break;
    }
  }
}

console.log('Sub-legs identified for purge:', subTripIds.size);
const masterTrips = rawTrips.filter(t => !subTripIds.has(t.id));
console.log('Consolidated Master Trips remaining:', masterTrips.length);

// Save updated master voyages back to official-scraped-schedules.json
fs.writeFileSync(filePath, JSON.stringify(masterTrips, null, 2), 'utf8');
console.log('Successfully saved consolidated master trips to official-scraped-schedules.json!');
