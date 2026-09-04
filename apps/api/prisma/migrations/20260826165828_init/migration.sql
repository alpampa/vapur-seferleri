-- CreateTable
CREATE TABLE "Operator" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "logo" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Vessel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "imoNumber" TEXT,
    "mmsi" TEXT,
    "operatorId" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OFFLINE',
    "latitude" REAL,
    "longitude" REAL,
    "heading" REAL,
    "speed" REAL,
    "lastSeenAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Vessel_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Operator" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Port" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "city" TEXT
);

-- CreateTable
CREATE TABLE "Terminal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "portId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "platforms" TEXT NOT NULL,
    CONSTRAINT "Terminal_portId_fkey" FOREIGN KEY ("portId") REFERENCES "Port" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Route" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "operatorId" TEXT NOT NULL,
    "originPortId" TEXT NOT NULL,
    "destinationPortId" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "distanceKm" REAL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Route_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Operator" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Route_originPortId_fkey" FOREIGN KEY ("originPortId") REFERENCES "Port" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Route_destinationPortId_fkey" FOREIGN KEY ("destinationPortId") REFERENCES "Port" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RouteStop" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "routeId" TEXT NOT NULL,
    "portId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "scheduledArrival" INTEGER,
    "scheduledDeparture" INTEGER,
    CONSTRAINT "RouteStop_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RouteStop_portId_fkey" FOREIGN KEY ("portId") REFERENCES "Port" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Trip" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "routeId" TEXT NOT NULL,
    "vesselId" TEXT,
    "scheduledDeparture" DATETIME NOT NULL,
    "estimatedDeparture" DATETIME,
    "actualDeparture" DATETIME,
    "scheduledArrival" DATETIME NOT NULL,
    "estimatedArrival" DATETIME,
    "actualArrival" DATETIME,
    "platform" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "price" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Trip_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Trip_vesselId_fkey" FOREIGN KEY ("vesselId") REFERENCES "Vessel" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Operator_code_key" ON "Operator"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Vessel_imoNumber_key" ON "Vessel"("imoNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Vessel_mmsi_key" ON "Vessel"("mmsi");

-- CreateIndex
CREATE UNIQUE INDEX "Port_code_key" ON "Port"("code");
