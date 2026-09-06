/**
 * Synthesizes a pleasant 2-tone marine chime using the native Web Audio API.
 * No external MP3 file download required, works offline and immediately!
 */
export function playMarineChime() {
  if (typeof window === 'undefined') return;

  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    // First Tone: F5 (698.46 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(698.46, ctx.currentTime);
    gain1.gain.setValueAtTime(0.3, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.6);

    // Second Tone: A5 (880.00 Hz) - 0.2s later
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.0, ctx.currentTime + 0.2);
    gain2.gain.setValueAtTime(0.4, ctx.currentTime + 0.2);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.2);
    osc2.stop(ctx.currentTime + 0.9);

    // Vibration on mobile devices
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 300]);
    }
  } catch (err) {
    console.warn('Web Audio playback error:', err);
  }
}

/**
 * ÖNERİ 3: Synthesizes the authentic deep acoustic horn of historical Istanbul steam ferries.
 * Uses a double-harmonic acoustic oscillator (A3 ~218 Hz + E4 ~327 Hz with steam low-pass resonance)
 * echoing across the Bosphorus, accompanied by physical mobile haptic vibration!
 */
export function playHistoricalFerryHorn() {
  if (typeof window === 'undefined') return;

  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    // Fundamental steam horn tone (A3: ~218 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(218.0, ctx.currentTime);

    // Harmonic fifth tone (E4: ~327 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(327.0, ctx.currentTime);

    // Acoustic Low-pass filter to simulate steam whistle chamber resonance
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(750, ctx.currentTime);

    // Envelope: Gentle steam attack, sustained powerful blast, realistic natural release
    gain1.gain.setValueAtTime(0.01, ctx.currentTime);
    gain1.gain.linearRampToValueAtTime(0.45, ctx.currentTime + 0.15);
    gain1.gain.setValueAtTime(0.45, ctx.currentTime + 1.1);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.2);

    gain2.gain.setValueAtTime(0.01, ctx.currentTime);
    gain2.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.15);
    gain2.gain.setValueAtTime(0.35, ctx.currentTime + 1.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.2);

    osc1.connect(gain1);
    osc2.connect(gain2);
    gain1.connect(filter);
    gain2.connect(filter);
    filter.connect(ctx.destination);

    osc1.start(ctx.currentTime);
    osc2.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 2.3);
    osc2.stop(ctx.currentTime + 2.3);

    // Physical vibration on mobile devices
    if ('vibrate' in navigator) {
      navigator.vibrate([400, 150, 600]);
    }
  } catch (err) {
    console.warn('Web Audio ferry horn error:', err);
  }
}

/**
 * Synthesizes an escalating urgent siren for the last ferry leaving the Prince Islands
 * to prevent passengers from being stranded on the island overnight.
 */
export function playStrandedEmergencySiren() {
  if (typeof window === 'undefined') return;

  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    [0, 0.25, 0.5, 0.75].forEach((offset, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(idx % 2 === 0 ? 698.46 : 1174.66, ctx.currentTime + offset);
      gain.gain.setValueAtTime(0.4, ctx.currentTime + offset);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + offset + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + offset);
      osc.stop(ctx.currentTime + offset + 0.22);
    });

    if ('vibrate' in navigator) {
      navigator.vibrate([400, 150, 400, 150, 700]);
    }
  } catch (err) {
    console.warn('Emergency siren error:', err);
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}
