/**
 * SESLİ İSKELE ANONSU & ERİŞİLEBİLİRLİK MOTORU (Neural TTS Announcer)
 * 
 * Yolcular için doğal Türkçe tonlamalı iskele ve sefer kalkış anonsları üretir.
 * Görme engelli yolcular ve yürüyüş halindeki kullanıcılar için erişilebilirlik sağlar.
 */

class TransitAnnouncer {
  private isSpeaking = false;

  public speak(text: string, onEnd?: () => void) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      console.warn("SpeechSynthesis API bu tarayıcıda desteklenmiyor.");
      return;
    }

    // Devam eden önceki anonsu kes
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "tr-TR";
    utterance.rate = 0.95; // Rahat anlaşılır hafif yavaş hız
    utterance.pitch = 1.0;

    // Türkçe ses profilini bulmaya çalış
    const voices = window.speechSynthesis.getVoices();
    const trVoice = voices.find((v) => v.lang.startsWith("tr") || v.name.toLowerCase().includes("turkish"));
    if (trVoice) {
      utterance.voice = trVoice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      this.isSpeaking = false;
      console.error("Sesli anons hatası:", e);
    };

    window.speechSynthesis.speak(utterance);
  }

  public announceDeparture(origin: string, destination: string, departureTime: string, operator: string) {
    const announcement = `Sayın yolcularımız, ${origin} iskelesinden saat ${departureTime}'da kalkacak olan ${operator} ${destination} seferinin kalkışına az zaman kalmıştır. Lütfen turnikelerden geçişinizi tamamlayınız.`;
    this.speak(announcement);
  }

  public announceFerryDeparture(origin: string, destination: string, operator: string, departureTime: string, remainingMins?: number | null) {
    const minText = remainingMins && remainingMins > 0 ? `Kalkışa ${remainingMins} dakika bulunmaktadır.` : "";
    const announcement = `Sayın yolcularımız, ${origin} iskelesinden saat ${departureTime}'da hareket edecek olan ${operator} ${destination} seferi için çağrıdır. ${minText} İyi yolculuklar dileriz.`;
    this.speak(announcement);
  }

  public announceUrgent(destination: string, remainingMins: number) {
    const announcement = `Dikkat: ${destination} vapurunun kalkışına ${remainingMins} dakika kaldı. Kapılar kapanmak üzeredir.`;
    this.speak(announcement);
  }

  public stop() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
    }
  }

  public cancel() {
    this.stop();
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }
}

export const transitAnnouncer = new TransitAnnouncer();
