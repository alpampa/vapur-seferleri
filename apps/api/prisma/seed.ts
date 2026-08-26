import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Operators
  const nyw = await prisma.operator.create({
    data: { name: 'NY Waterway', code: 'NYW' },
  });
  const ggf = await prisma.operator.create({
    data: { name: 'Golden Gate Ferry', code: 'GGF' },
  });
  const wsdot = await prisma.operator.create({
    data: { name: 'WSDOT Ferry', code: 'WSDOT' },
  });

  // 2. Ports
  const manhattan = await prisma.port.create({
    data: { name: 'Lower Manhattan', code: 'NYC-M', latitude: 40.703, longitude: -74.009, city: 'New York' },
  });
  const brooklyn = await prisma.port.create({
    data: { name: 'Dumbo', code: 'NYC-D', latitude: 40.703, longitude: -73.993, city: 'New York' },
  });
  const ferryBldg = await prisma.port.create({
    data: { name: 'Ferry Building', code: 'SF-FB', latitude: 37.795, longitude: -122.393, city: 'San Francisco' },
  });
  const sausalito = await prisma.port.create({
    data: { name: 'Sausalito', code: 'SF-SAU', latitude: 37.856, longitude: -122.478, city: 'Sausalito' },
  });

  // 3. Vessels
  const empireState = await prisma.vessel.create({
    data: { name: 'MV Empire State', operatorId: nyw.id, capacity: 400, status: 'DOCKED' },
  });
  const msSf = await prisma.vessel.create({
    data: { name: 'MS San Francisco', operatorId: ggf.id, capacity: 450, status: 'DOCKED' },
  });

  // 4. Routes
  const nyRoute = await prisma.route.create({
    data: {
      operatorId: nyw.id,
      originPortId: manhattan.id,
      destinationPortId: brooklyn.id,
      durationMinutes: 15,
      distanceKm: 3.2,
    },
  });
  const sfRoute = await prisma.route.create({
    data: {
      operatorId: ggf.id,
      originPortId: ferryBldg.id,
      destinationPortId: sausalito.id,
      durationMinutes: 30,
      distanceKm: 12.5,
    },
  });

  // 5. Trips (Scheduled)
  const now = new Date();
  
  await prisma.trip.create({
    data: {
      routeId: nyRoute.id,
      vesselId: empireState.id,
      scheduledDeparture: new Date(now.getTime() + 5 * 60000), // in 5 mins
      scheduledArrival: new Date(now.getTime() + 20 * 60000),
      platform: 'Pier 11',
      status: 'DEPARTING_SOON',
      price: 3.50,
    },
  });

  await prisma.trip.create({
    data: {
      routeId: sfRoute.id,
      vesselId: msSf.id,
      scheduledDeparture: new Date(now.getTime() + 20 * 60000), // in 20 mins
      scheduledArrival: new Date(now.getTime() + 50 * 60000),
      platform: 'Gate B',
      status: 'ON_TIME',
      price: 14.25,
    },
  });

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
