export interface SeagullSimitGuide {
  recommendedDeckSide: "PUPA_SANCAK" | "PUPA_ISKELE" | "PUPA_ORTA";
  recommendedDeckLabel: string;
  throwAngleAdvice: string;
  physicsReason: string;
  seagullBehaviorNote: string;
  safetyTip: string;
}

/**
 * "Martılara Simit Atma" Rüzgar Altı Güverte Göstergesi
 * Vapurun seyir hızına ve gerçek rüzgar açısına göre rüzgaraltı (leeward) güverte alanını hesaplar.
 * Simidin rüzgarla yolcunun yüzüne savrulmasını engeller, martıların süzülme hava koridorunu bulmasını sağlar.
 */
export function calculateSeagullSimitDeck(
  vesselHeadingDeg: number = 315,
  windDeg: number = 45, // Poyraz
  windSpeedKnots: number = 12
): SeagullSimitGuide {
  // Gemi pruvasına göre bağıl rüzgar açısı (Relative Wind Angle)
  const relWind = ((windDeg - vesselHeadingDeg + 360) % 360);

  // Rüzgar soldan (iskeleden) esiyorsa, rüzgaraltı sağ (sancak) pupadır!
  // Rüzgar sağdan (sancaktan) esiyorsa, rüzgaraltı sol (iskele) pupadır!
  let side: "PUPA_SANCAK" | "PUPA_ISKELE" | "PUPA_ORTA" = "PUPA_ORTA";
  let label = "Açık Arka Güverte (Pupa Ortası)";
  let throwAdvice = "Simit parçasını 45 derecelik açıyla geminin dümen suyu izine doğru fırlatın.";
  let physics = "Rüzgar gemi pruvasıyla paralel aktığından dümen suyundaki hava girdabı simidi havada asılı tutar.";

  if (relWind > 190 && relWind < 350) {
    // Rüzgar İskele (sol) taraftan esiyor -> Rüzgaraltı SANCAK (sağ) taraf
    side = "PUPA_SANCAK";
    label = "Arka Güverte Sancak (Sağ Köşe)";
    throwAdvice = "Sağ arka korkuluktan, rüzgarın estiği yönün tersine doğru hafif kavisle atın.";
    physics = "Rüzgar iskeleden vurduğu için sancak arka köşe rüzgaraltı (leeward) korunaklı vortex oluşturur.";
  } else if (relWind > 10 && relWind < 170) {
    // Rüzgar Sancak (sağ) taraftan esiyor -> Rüzgaraltı İSKELE (sol) taraf
    side = "PUPA_ISKELE";
    label = "Arka Güverte İskele (Sol Köşe)";
    throwAdvice = "Sol arka korkuluktan Boğaz'ın dümen suyuna doğru havaya süzdürerek atın.";
    physics = "Rüzgar sancaktan estiğinden iskele arka köşe rüzgar siperinde kalır; simit geriye savrulmaz.";
  }

  return {
    recommendedDeckSide: side,
    recommendedDeckLabel: label,
    throwAngleAdvice: throwAdvice,
    physicsReason: physics,
    seagullBehaviorNote: "İstanbul gümüş martıları vapurun oluşturduğu yukarı yönlü termal hava akımını (updraft) kullanarak kanat çırpmadan süzülürler.",
    safetyTip: "Simidi atarken cep telefonu veya fotoğraf makinenizi denize düşürmemek için bileklik ipi kullanın."
  };
}
