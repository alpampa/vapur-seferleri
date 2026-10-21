import { ISTANBUL_FERRY_FLEET, type RegisteredVessel } from "@/lib/agents/fleet-registry";

function normalize(value: string): string {
  return value
    .toLocaleLowerCase("tr-TR")
    .replaceAll("ı", "i")
    .replaceAll("ş", "s")
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function operatorMatches(vesselOperator: string, operator?: string): boolean {
  if (!operator) return true;
  const vesselOp = normalize(vesselOperator);
  const requestedOp = normalize(operator);
  if (!requestedOp) return true;
  return vesselOp === requestedOp || vesselOp.includes(requestedOp) || requestedOp.includes(vesselOp);
}

function lineMatches(vessel: RegisteredVessel, origin: string, destination: string): boolean {
  const o = normalize(origin);
  const d = normalize(destination);
  return vessel.assignedLines.some((line) => {
    const normalizedLine = normalize(line);
    return normalizedLine.includes(o) && normalizedLine.includes(d);
  });
}

export function getDefaultVesselForTrip(
  origin: string,
  destination: string,
  operator?: string
): RegisteredVessel {
  const byOperator = ISTANBUL_FERRY_FLEET.filter((vessel) =>
    operatorMatches(vessel.operator, operator)
  );

  const exactLine = byOperator.find((vessel) => lineMatches(vessel, origin, destination));
  if (exactLine) return exactLine;

  const partialLine = byOperator.find((vessel) => {
    const o = normalize(origin);
    const d = normalize(destination);
    return vessel.assignedLines.some((line) => {
      const normalizedLine = normalize(line);
      return normalizedLine.includes(o) || normalizedLine.includes(d);
    });
  });
  if (partialLine) return partialLine;

  return byOperator[0] ?? ISTANBUL_FERRY_FLEET[0];
}

export function getFleetForOperator(operator?: string): RegisteredVessel[] {
  if (!operator) return ISTANBUL_FERRY_FLEET;
  const matches = ISTANBUL_FERRY_FLEET.filter((vessel) =>
    operatorMatches(vessel.operator, operator)
  );
  return matches.length > 0 ? matches : ISTANBUL_FERRY_FLEET;
}
