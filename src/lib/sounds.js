/**
 * MeeChain Smart Audio Synthesizer
 * Uses Web Audio API to generate real-time synthesized audio effects
 * for magical Quest Hall achievements and Level Up ceremonies.
 */

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Standard Chime Sound for typical magical Level Ups
 */
export function playMagicChime() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // We will create 3 chime notes rising in pitch
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);
      
      // Magical vibrato
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(12, now); // 12Hz vibrato
      lfoGain.gain.setValueAtTime(5, now); // vibrato depth 5Hz
      
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      
      gainNode.gain.setValueAtTime(0, now + idx * 0.12);
      gainNode.gain.linearRampToValueAtTime(0.3, now + idx * 0.12 + 0.03);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.8);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      lfo.start(now + idx * 0.12);
      osc.start(now + idx * 0.12);
      
      lfo.stop(now + idx * 0.12 + 0.8);
      osc.stop(now + idx * 0.12 + 0.8);
    });
  } catch (err) {
    console.warn('Web Audio is suspended or unsupported by this browser context:', err);
  }
}

/**
 * Epic brassy Fanfare for major achievements (e.g., Level 3 / Arch-Mage)
 */
export function playEpicFanfare() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Brassy chords or majestic fanfares: C4 -> G4 -> C5 -> E5 -> G5
    const fanfareNotes = [
      { f: 261.63, delay: 0.0, duration: 1.5, type: 'triangle' }, // C4
      { f: 392.00, delay: 0.15, duration: 1.35, type: 'triangle' }, // G4
      { f: 523.25, delay: 0.3, duration: 1.2, type: 'triangle' }, // C5
      { f: 659.25, delay: 0.45, duration: 1.05, type: 'triangle' }, // E5
      { f: 783.99, delay: 0.6, duration: 1.8, type: 'sawtooth' }, // G5 (Epic bright tone)
      { f: 1046.50, delay: 0.6, duration: 1.8, type: 'sine' } // Ultra-bright C6 highlight
    ];

    fanfareNotes.forEach(({ f, delay, duration, type }) => {
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gainNode = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(f, now + delay);

      // Lowpass filter to make triangle/sawtooth sound like warm brass
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, now + delay);
      filter.frequency.exponentialRampToValueAtTime(600, now + delay + duration);

      gainNode.gain.setValueAtTime(0, now + delay);
      gainNode.gain.linearRampToValueAtTime(0.15, now + delay + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + delay + duration);

      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + duration);
    });

    // Add extra tiny celebratory sparkle at the end
    setTimeout(() => {
      playMagicChime();
    }, 700);
  } catch (err) {
    console.warn('Web Audio failed to synthesize fanfare:', err);
  }
}

/**
 * Rhythmic drum-roll sweep preceding announcements
 */
export function playDrumRoll() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Create synthesized drum roll using white noise buffer
    const bufferSize = ctx.sampleRate * 0.8; // 0.8 seconds
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Filter to make it sound like a snare/snare drum roll
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(300, now);
    filter.frequency.linearRampToValueAtTime(1000, now + 0.8);
    filter.Q.setValueAtTime(5, now);

    // Dynamic amplitude modulation to simulate actual rolling taps
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.05, now);
    
    // Quick taps modulation
    for (let t = 0; t < 0.8; t += 0.05) {
      gainNode.gain.setValueAtTime(0.02, now + t);
      gainNode.gain.linearRampToValueAtTime(0.12, now + t + 0.025);
      gainNode.gain.linearRampToValueAtTime(0.02, now + t + 0.05);
    }
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 0.8);
  } catch (err) {
    console.warn('Web Audio snare roll failed:', err);
  }
}

/**
 * React Hook for playing Level Up sounds dynamically
 */
export function useLevelUpSound() {
  function playLevelUp(levelNum = 2) {
    // Drum roll first to build anticipation, followed by the specific chime or epic fanfare!
    playDrumRoll();
    
    setTimeout(() => {
      if (levelNum >= 3) {
        playEpicFanfare();
      } else {
        playMagicChime();
      }
    }, 450);
  }

  return {
    playLevelUp,
    playDrumRoll,
    playMagicChime,
    playEpicFanfare
  };
}

