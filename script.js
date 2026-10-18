/**
 * TARJETA DE FELICITACIÓN MÓVIL - CUMPLEAÑOS MAMÁ DE MICH
 * Lógica interactiva completa:
 * - Pastel que se abre con salto sorpresa
 * - Gatito interactivo kawaii con gorrito y cupcake
 * - El gatito sopla físicamente las velas con ráfaga de aire
 * - El botón cambia a "¡Comer pastel! 🍰"
 * - El gatito come el pastel (ñam ñam con sonido y animación)
 * - El gatito queda llenito y panzón con carita feliz y glaseado en el cachete
 * - Posibilidad de acariciar su pancita
 * - Síntesis de sonido Web Audio API (Miau, mordiscos ñam ñam, ronroneo, soplo, melodía)
 * - Motor de confeti y corazones en Canvas
 * - Modal con cartita dedicatoria personalizada
 * - Personalización de nombre y compatibilidad móvil
 */

// ==========================================
// 1. ESTADO GLOBAL Y ELEMENTOS DEL DOM
// ==========================================
const state = {
  isOpened: false,
  candlesLit: true,
  soundEnabled: true,
  audioCtx: null,
  recipientName: 'Mamá de Mich',
  isMelodyPlaying: false,
  cakeAction: 'blow' // 'blow' -> 'eat' -> 'pet'
};

const elements = {
  interactiveCake: document.getElementById('interactive-cake'),
  cakeLid: document.getElementById('cake-lid'),
  kittenGroup: document.getElementById('kitten-group'),
  tapHint: document.getElementById('tap-hint'),
  kittenBubble: document.getElementById('kitten-bubble'),
  bubbleMessage: document.getElementById('bubble-message'),
  btnSound: document.getElementById('btn-sound'),
  soundIcon: document.getElementById('sound-icon'),
  btnBlowCandles: document.getElementById('btn-blow-candles'),
  blowLabel: document.getElementById('blow-label'),
  badgeTag: document.getElementById('badge-tag'),
  btnCloseLetter: document.getElementById('btn-close-letter'),
  btnFinishLetter: document.getElementById('btn-finish-letter'),
  letterModal: document.getElementById('letter-modal'),
  modalMomName: document.getElementById('modal-mom-name'),
  btnReplay: document.getElementById('btn-replay'),
  btnEditName: document.getElementById('btn-edit-name'),
  nameModal: document.getElementById('name-modal'),
  btnCloseName: document.getElementById('btn-close-name'),
  btnSaveName: document.getElementById('btn-save-name'),
  nameInput: document.getElementById('name-input'),
  nameTarget: document.getElementById('name-target'),
  quickChips: document.querySelectorAll('.quick-chip'),
  flames: [
    document.getElementById('flame-1'),
    document.getElementById('flame-center'),
    document.getElementById('flame-2'),
    document.getElementById('flame-kitten')
  ],
  confettiCanvas: document.getElementById('confetti-canvas'),
  giftContainer: document.getElementById('gift-container'),
  giftBox: document.getElementById('gift-box'),
  finaleOverlay: document.getElementById('finale-overlay'),
  finaleTitle: document.getElementById('finale-title'),
  finaleName: document.getElementById('finale-name'),
  btnFinaleReplay: document.getElementById('btn-finale-replay'),
  mananitasAudio: document.getElementById('mananitas-audio')
};

// ==========================================
// 2. MOTOR DE AUDIO (Web Audio API)
// Sin dependencias externas, 100% compatible
// ==========================================
// Sonido de Las Mañanitas (Pedro Infante)
function playMananitas() {
  if (!state.soundEnabled || !elements.mananitasAudio) return;
  try {
    elements.mananitasAudio.currentTime = 0;
    elements.mananitasAudio.volume = 0.35; // Volumen suave y agradable
    const playPromise = elements.mananitasAudio.play();
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        console.warn('Reproducción de audio sujeta a interacción:', err);
      });
    }
  } catch (e) {
    console.error(e);
  }
}

function stopMananitas() {
  if (!elements.mananitasAudio) return;
  try {
    elements.mananitasAudio.pause();
    elements.mananitasAudio.currentTime = 0;
  } catch (e) {}
}

function getAudioContext() {
  if (!state.audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      state.audioCtx = new AudioContextClass();
    }
  }
  if (state.audioCtx && state.audioCtx.state === 'suspended') {
    state.audioCtx.resume();
  }
  return state.audioCtx;
}

// Sonido tierno de "Miau" de gatito
function playMeowSound() {
  if (!state.soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(460, now);
  osc.frequency.exponentialRampToValueAtTime(840, now + 0.16);
  osc.frequency.exponentialRampToValueAtTime(420, now + 0.55);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1600, now);
  filter.frequency.exponentialRampToValueAtTime(800, now + 0.55);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.28, now + 0.08);
  gain.gain.setValueAtTime(0.28, now + 0.22);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.58);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.6);

  // Armónico agudo
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(920, now);
  osc2.frequency.exponentialRampToValueAtTime(1680, now + 0.16);
  osc2.frequency.exponentialRampToValueAtTime(840, now + 0.5);

  gain2.gain.setValueAtTime(0.001, now);
  gain2.gain.linearRampToValueAtTime(0.08, now + 0.08);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.52);

  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.start(now);
  osc2.stop(now + 0.55);
}

// Sonido de soplar viento suave con filtro
function playWhooshSound() {
  if (!state.soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const bufferSize = ctx.sampleRate * 0.45;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(500, ctx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.42);
  filter.Q.value = 2.8;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.001, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.22, ctx.currentTime + 0.06);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.42);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start();
}

// Sonido tierno de comer pastel (ñam ñam)
function playMunchSound() {
  if (!state.soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const bites = [0, 0.22, 0.46, 0.70, 0.94];

  bites.forEach((t, i) => {
    const start = now + t;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = i % 2 === 0 ? 'sine' : 'triangle';
    const startFreq = 270 + Math.random() * 60;
    osc.frequency.setValueAtTime(startFreq, start);
    osc.frequency.exponentialRampToValueAtTime(130, start + 0.12);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(950, start);

    gain.gain.setValueAtTime(0.001, start);
    gain.gain.linearRampToValueAtTime(0.25, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.12);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(start);
    osc.stop(start + 0.14);
  });
}

// Sonido tierno de ronroneo al acariciar la pancita
function playPurrSound() {
  if (!state.soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const duration = 1.3;

  const lfo = ctx.createOscillator();
  lfo.frequency.setValueAtTime(26, now);

  const lfoGain = ctx.createGain();
  lfoGain.gain.setValueAtTime(0.55, now);

  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(85, now);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(260, now);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.24, now + 0.15);
  gain.gain.setValueAtTime(0.24, now + duration - 0.2);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  lfo.connect(lfoGain.gain);
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  lfo.start(now);
  osc.stop(now + duration);
  lfo.stop(now + duration);
}

// Pop de fiesta suave
function playPopSound() {
  if (!state.soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(650, now);
  osc.frequency.exponentialRampToValueAtTime(140, now + 0.12);

  gain.gain.setValueAtTime(0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.15);
}

// Sonido mágico y celestial de fuegos artificiales / chispas brillantes
function playSparkleSound() {
  if (!state.soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; // C5, E5, G5, C6, E6, G6
  notes.forEach((freq, i) => {
    const start = ctx.currentTime + (i * 0.055);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, start);

    gain.gain.setValueAtTime(0.001, start);
    gain.gain.linearRampToValueAtTime(0.08, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.32);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(start);
    osc.stop(start + 0.35);
  });
}

// Melodía "Cumpleaños Feliz"
function playHappyBirthdayMelody() {
  if (!state.soundEnabled || state.isMelodyPlaying) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  state.isMelodyPlaying = true;

  const notes = {
    C4: 261.63,
    D4: 293.66,
    E4: 329.63,
    F4: 349.23,
    G4: 392.00,
    A4: 440.00,
    Bb4: 466.16,
    B4: 493.88,
    C5: 523.25
  };

  const melody = [
    { note: 'C4', dur: 0.25, pause: 0.05 },
    { note: 'C4', dur: 0.25, pause: 0.05 },
    { note: 'D4', dur: 0.5,  pause: 0.08 },
    { note: 'C4', dur: 0.5,  pause: 0.08 },
    { note: 'F4', dur: 0.5,  pause: 0.08 },
    { note: 'E4', dur: 0.9,  pause: 0.25 },

    { note: 'C4', dur: 0.25, pause: 0.05 },
    { note: 'C4', dur: 0.25, pause: 0.05 },
    { note: 'D4', dur: 0.5,  pause: 0.08 },
    { note: 'C4', dur: 0.5,  pause: 0.08 },
    { note: 'G4', dur: 0.5,  pause: 0.08 },
    { note: 'F4', dur: 0.9,  pause: 0.3 }
  ];

  let currentTimeOffset = 0.05;

  melody.forEach(item => {
    const start = ctx.currentTime + currentTimeOffset;
    const dur = item.dur;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(notes[item.note] || 440, start);

    gain.gain.setValueAtTime(0.001, start);
    gain.gain.linearRampToValueAtTime(0.18, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, start + dur);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(start);
    osc.stop(start + dur + 0.05);

    currentTimeOffset += dur + item.pause;
  });

  setTimeout(() => {
    state.isMelodyPlaying = false;
  }, currentTimeOffset * 1000);
}

// ==========================================
// 3. MOTOR DE CONFETI Y CORAZONES EN CANVAS
// ==========================================
class ConfettiEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.animationId = null;
    this.colors = ['#FF4081', '#FF80AB', '#FFD54F', '#00E676', '#40C4FF', '#E040FB', '#FFAB91', '#FFFDE7'];
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  burst(count = 60, originX = 0.5, originY = 0.5) {
    if (this.canvas.width !== window.innerWidth || this.canvas.height !== window.innerHeight) {
      this.resize();
    }
    const x = this.canvas.width * originX;
    const y = this.canvas.height * originY;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * (i / count)) + (Math.random() * 0.4 - 0.2);
      const speed = Math.random() * 8 + 3;
      const isHeart = Math.random() > 0.72;
      const isStar = !isHeart && Math.random() > 0.65;

      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: (Math.sin(angle) * speed) - (Math.random() * 5 + 4),
        gravity: 0.18,
        friction: 0.98,
        size: Math.random() * 8 + 6,
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        wobble: 0,
        wobbleSpeed: Math.random() * 0.1 + 0.05,
        opacity: 1,
        fadeSpeed: Math.random() * 0.008 + 0.005,
        type: isHeart ? 'heart' : (isStar ? 'star' : 'rect')
      });
    }

    if (!this.animationId) {
      this.animate();
    }
  }

  // Estallido radial de fuegos artificiales en un punto exacto
  fireworkBurst(x, y, palette = null) {
    if (this.canvas.width !== window.innerWidth || this.canvas.height !== window.innerHeight) {
      this.resize();
    }
    const colors = palette || ['#FF4081', '#FFD54F', '#00E676', '#40C4FF', '#E040FB', '#FFFFFF', '#FF9100', '#FF80AB', '#FFE082'];
    const particleCount = 70;
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() * 0.15 - 0.075);
      const speed = Math.random() * 7.5 + 2.5;
      const color = colors[Math.floor(Math.random() * colors.length)];
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 0.07,
        friction: 0.96,
        size: Math.random() * 3 + 2.5,
        color: color,
        opacity: 1,
        fadeSpeed: Math.random() * 0.012 + 0.008,
        type: 'spark',
        sparkle: Math.random() > 0.3
      });
    }
    if (!this.animationId) {
      this.animate();
    }
  }

  // Cohete que asciende y estalla en la posición meta
  launchRocket(targetX, targetY, palette = null) {
    if (this.canvas.width !== window.innerWidth || this.canvas.height !== window.innerHeight) {
      this.resize();
    }
    const startX = targetX + (Math.random() * 40 - 20);
    const startY = this.canvas.height;
    const dy = targetY - startY;
    const dx = targetX - startX;
    const duration = 24; // frames de subida
    const vx = dx / duration;
    const vy = dy / duration;

    this.particles.push({
      x: startX,
      y: startY,
      vx: vx,
      vy: vy,
      gravity: 0,
      friction: 1,
      size: 4,
      color: '#FFF9C4',
      opacity: 1,
      fadeSpeed: 0,
      type: 'rocket',
      life: duration,
      targetX: targetX,
      targetY: targetY,
      palette: palette
    });

    if (!this.animationId) {
      this.animate();
    }
  }

  // Lanzamiento continuo de fuegos artificiales
  startFireworks(durationMs = 9000) {
    this.stopFireworks();
    if (this.canvas.width !== window.innerWidth || this.canvas.height !== window.innerHeight) {
      this.resize();
    }
    // Estallidos inmediatos
    this.fireworkBurst(this.canvas.width * 0.5, this.canvas.height * 0.35);
    setTimeout(() => this.fireworkBurst(this.canvas.width * 0.25, this.canvas.height * 0.25), 180);
    setTimeout(() => this.fireworkBurst(this.canvas.width * 0.75, this.canvas.height * 0.25), 360);
    playSparkleSound();

    this.fireworksInterval = setInterval(() => {
      const rx = this.canvas.width * (0.15 + Math.random() * 0.7);
      const ry = this.canvas.height * (0.12 + Math.random() * 0.32);
      this.launchRocket(rx, ry);
    }, 420);

    if (durationMs > 0) {
      setTimeout(() => {
        this.stopFireworks();
      }, durationMs);
    }
  }

  stopFireworks() {
    if (this.fireworksInterval) {
      clearInterval(this.fireworksInterval);
      this.fireworksInterval = null;
    }
  }

  drawHeart(ctx, x, y, size, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = color;
    ctx.beginPath();
    const topCurveHeight = size * 0.3;
    ctx.moveTo(0, topCurveHeight);
    ctx.bezierCurveTo(0, 0, -size / 2, 0, -size / 2, topCurveHeight);
    ctx.bezierCurveTo(-size / 2, (size + topCurveHeight) / 2, 0, size, 0, size * 1.3);
    ctx.bezierCurveTo(0, size, size / 2, (size + topCurveHeight) / 2, size / 2, topCurveHeight);
    ctx.bezierCurveTo(size / 2, 0, 0, 0, 0, topCurveHeight);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  drawStar(ctx, x, y, size, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * size, -Math.sin((18 + i * 72) * Math.PI / 180) * size);
      ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * (size / 2), -Math.sin((54 + i * 72) * Math.PI / 180) * (size / 2));
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      // Caso especial: cohete de fuegos artificiales
      if (p.type === 'rocket') {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;

        // Estela brillante del cohete
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.moveTo(p.x - p.vx * 2.5, p.y - p.vy * 2.5);
        this.ctx.lineTo(p.x, p.y);
        this.ctx.strokeStyle = '#FFE082';
        this.ctx.lineWidth = 3.2;
        this.ctx.lineCap = 'round';
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fill();
        this.ctx.restore();

        if (p.life <= 0) {
          this.fireworkBurst(p.x, p.y, p.palette);
          playSparkleSound();
          this.particles.splice(i, 1);
          continue;
        }
        continue;
      }

      p.vx *= p.friction;
      p.vy *= p.friction;
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += (p.rotationSpeed || 0);
      p.wobble += (p.wobbleSpeed || 0);
      p.opacity -= p.fadeSpeed;

      if (p.opacity <= 0 || p.y > this.canvas.height + 50) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, p.opacity);

      if (p.type === 'spark') {
        // Estela del destello de fuego artificial
        this.ctx.beginPath();
        this.ctx.moveTo(p.x - (p.vx * 1.8), p.y - (p.vy * 1.8));
        this.ctx.lineTo(p.x, p.y);
        this.ctx.strokeStyle = (p.sparkle && Math.random() > 0.4) ? '#FFFFFF' : p.color;
        this.ctx.lineWidth = p.size;
        this.ctx.lineCap = 'round';
        this.ctx.stroke();

        // Destello central
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size * 0.85, 0, Math.PI * 2);
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fill();
      } else if (p.type === 'heart') {
        this.drawHeart(this.ctx, p.x, p.y, p.size, p.color);
      } else if (p.type === 'star') {
        this.drawStar(this.ctx, p.x, p.y, p.size * 0.8, p.color);
      } else {
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.rotation * Math.PI) / 180);
        this.ctx.fillStyle = p.color;
        const width = Math.cos(p.wobble) * p.size;
        this.ctx.fillRect(-width / 2, -p.size / 2, width, p.size);
      }

      this.ctx.restore();
    }

    if (this.particles.length === 0) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

const confetti = new ConfettiEngine(elements.confettiCanvas);

// ==========================================
// 4. ACCIÓN: ABRIR EL PASTEL POR PRIMERA VEZ
// ==========================================
function openSurpriseCake() {
  getAudioContext();

  if (!state.isOpened) {
    state.isOpened = true;

    // Reproducir Las Mañanitas de Pedro Infante con el primer toque del pastel
    playMananitas();

    // 1. Ocultar el indicador de "Toca el pastel"
    elements.tapHint.classList.add('hidden');

    // 2. Levantar la tapa del pastel
    elements.cakeLid.classList.add('open');

    // 3. Sonido de pop festivo y confeti
    playPopSound();
    confetti.burst(70, 0.5, 0.45);

    // 4. El gatito salta alegremente con su cupcake
    setTimeout(() => {
      elements.kittenGroup.classList.remove('kitten-hidden');
      elements.kittenGroup.classList.add('kitten-revealed');
      
      playMeowSound();

      setTimeout(() => {
        confetti.burst(50, 0.5, 0.35);
      }, 250);

      // Mostrar la burbuja con el mensaje
      setTimeout(() => {
        elements.kittenBubble.classList.add('show');
      }, 600);

      // Mostrar la dedicatoria especial con mucho amor
      setTimeout(() => {
        openLetterModal();
      }, 1100);
    }, 280);

  } else {
    // Si ya está abierto:
    if (state.cakeAction === 'pet') {
      petFullKitten();
    } else {
      playMeowSound();
      confetti.burst(30, 0.5, 0.4);

      elements.kittenGroup.style.transform = 'translateY(-40px) scale(1.05)';
      setTimeout(() => {
        elements.kittenGroup.style.transform = '';
      }, 280);

      // Si la música estaba pausada y el sonido está activo, reanudar
      if (elements.mananitasAudio && elements.mananitasAudio.paused && state.soundEnabled) {
        elements.mananitasAudio.play().catch(() => {});
      }
    }
  }
}

// ==========================================
// 5. ACCIÓN MULTI-PASO:
// PASO 1: SOPLAR LAS VELAS
// PASO 2: COMER PASTEL
// PASO 3: ACARICIAR PANCITA
// ==========================================
function handleCakeAction() {
  getAudioContext();

  // Si aún no se abre el pastel, abrirlo primero
  if (!state.isOpened) {
    openSurpriseCake();
    return;
  }

  // --- PASO 1: EL GATITO SOPLA LAS VELAS ---
  if (state.cakeAction === 'blow') {
    // 1. El gatito adopta la pose de soplar con vientito
    elements.kittenGroup.classList.add('is-blowing');
    playWhooshSound();

    // Las llamas se apagan con humo suave
    setTimeout(() => {
      elements.flames.forEach(flame => {
        if (flame) flame.classList.add('flame-extinguished');
      });
      state.candlesLit = false;
      confetti.burst(50, 0.5, 0.45);
    }, 280);

    // Termina el soplo y el botón cambia a Comer Pastel
    setTimeout(() => {
      elements.kittenGroup.classList.remove('is-blowing');
      state.cakeAction = 'eat';

      // Mensaje del gatito preguntando por el pastel
      elements.bubbleMessage.textContent = '¡Fuuu! 💨🕯️ ¡Listo, velitas apagadas! Y ahora... ¿podemos comer pastel? 😋🍰';

      // Actualizar botón a "¡Comer pastel!" con icono y pulso llamativo
      const icon = elements.btnBlowCandles.querySelector('.btn-icon');
      if (icon) icon.textContent = '🍰';
      elements.blowLabel.textContent = '¡Comer pastel!';
      elements.btnBlowCandles.classList.add('pulse-action-btn');
    }, 700);

    return;
  }

  // --- PASO 2: EL GATITO SE COME EL PASTEL COMPLETO ---
  if (state.cakeAction === 'eat') {
    elements.blowLabel.textContent = 'Ñam, ñam... 😋';
    elements.btnBlowCandles.classList.remove('pulse-action-btn');

    // Gatito come con cabecita arriba/abajo y chispitas
    elements.kittenGroup.classList.add('is-eating');
    elements.bubbleMessage.textContent = '¡Ñam, ñam, ñam! 🍰😋';

    playMunchSound();
    confetti.burst(40, 0.5, 0.45);

    // A los 400ms: ¡El pastel completo colapsa y desaparece en el estómago del gatito!
    setTimeout(() => {
      elements.interactiveCake.classList.add('cake-eaten');
      confetti.burst(35, 0.5, 0.65);
    }, 400);

    // Tras comer: se transforma en LLENITO y gordito sentado en el plato
    setTimeout(() => {
      elements.kittenGroup.classList.remove('is-eating');
      elements.kittenGroup.classList.add('kitten-full');

      playMeowSound();
      confetti.burst(70, 0.5, 0.45);

      // Burbuja con el gatito satisfecho y panzoncito
      elements.bubbleMessage.textContent = '¡Ñam, ñam! ¡Me comí todo el pastel, perdón por no invitar! 😋🎂🐾';

      // Actualizar botón para seguir festejando (en lugar de acariciar pancita)
      state.cakeAction = 'celebrate';
      const icon = elements.btnBlowCandles.querySelector('.btn-icon');
      if (icon) icon.textContent = '🎉';
      elements.blowLabel.textContent = 'Seguir festejando';
      elements.btnBlowCandles.classList.add('pulse-action-btn');
    }, 1300);

    return;
  }

  // --- PASO 3: SEGUIR FESTEJANDO (APARECE EL REGALO) ---
  if (state.cakeAction === 'celebrate') {
    showGiftBox();
    return;
  }

  // --- PASO 4: ABRIR EL REGALO (FUEGOS ARTIFICIALES Y SALIDA CON FELICIDADES) ---
  if (state.cakeAction === 'open-gift') {
    openGiftBox();
    return;
  }
}

// Mostrar el regalo sorpresa
function showGiftBox() {
  getAudioContext();
  playPopSound();
  confetti.burst(35, 0.5, 0.45);

  // Ocultar pastel interactivo
  elements.interactiveCake.style.display = 'none';

  // Mostrar contenedor del regalo
  elements.giftContainer.classList.remove('hidden');
  elements.giftBox.classList.remove('gift-opened');

  // Ocultar burbuja del gatito
  elements.kittenBubble.classList.remove('show');

  // Actualizar botón de acción principal a ¡Abrir regalo!
  state.cakeAction = 'open-gift';
  const icon = elements.btnBlowCandles.querySelector('.btn-icon');
  if (icon) icon.textContent = '🎁';
  elements.blowLabel.textContent = '¡Abrir regalo!';
  elements.btnBlowCandles.classList.add('pulse-action-btn');
}

// Abrir el regalo, lanzar fuegos artificiales y activar la pantalla final con letras ¡FELICIDADES!
function openGiftBox() {
  if (elements.giftBox.classList.contains('gift-opened')) return;

  getAudioContext();
  elements.giftBox.classList.add('gift-opened');
  if (elements.giftContainer) elements.giftContainer.classList.add('opened');
  playPopSound();
  playSparkleSound();

  // Actualizar nombre en la pantalla final de inmediato
  if (elements.finaleName) {
    elements.finaleName.textContent = state.recipientName;
  }

  // Fundido de salida inmediato: el fondo comienza a oscurecerse suavemente al momento de abrir el regalo
  elements.finaleOverlay.classList.add('active');
  elements.finaleOverlay.setAttribute('aria-hidden', 'false');

  // Gran estallido de confeti y fuegos artificiales saliendo del regalo
  confetti.burst(75, 0.5, 0.5);
  confetti.startFireworks(10000);

  // Salvas iniciales de fuegos artificiales celebrando en el cielo oscuro
  confetti.fireworkBurst(window.innerWidth * 0.5, window.innerHeight * 0.22);
  setTimeout(() => confetti.fireworkBurst(window.innerWidth * 0.22, window.innerHeight * 0.32), 180);
  setTimeout(() => confetti.fireworkBurst(window.innerWidth * 0.78, window.innerHeight * 0.32), 360);

  // Actualizar botón de acción
  const icon = elements.btnBlowCandles.querySelector('.btn-icon');
  if (icon) icon.textContent = '✨';
  elements.blowLabel.textContent = '¡Felicidades!';
  elements.btnBlowCandles.classList.remove('pulse-action-btn');
}

// Acariciar la pancita del gatito cuando ya está llenito (al tocar el gatito directamente)
function petFullKitten() {
  // Sin sonido desagradable (silencioso y tierno)
  elements.kittenGroup.classList.add('belly-jiggle');
  confetti.burst(35, 0.5, 0.65); // Lluvia tierna de corazones y chispas

  setTimeout(() => {
    elements.kittenGroup.classList.remove('belly-jiggle');
  }, 550);

  const petResponses = [
    `¡Awww qué rico! 🥰🐾 ¡Gracias por las caricias en mi pancita, ${state.recipientName}!`,
    `¡Qué suavecita está mi pancita! 🥰💕 ¡Eres la mamá más hermosa del mundo!`,
    `¡Muchos cariñitos y amor especial para ti en tu día! 🌸💖`
  ];
  const randomPet = petResponses[Math.floor(Math.random() * petResponses.length)];
  elements.bubbleMessage.textContent = randomPet;
}

// ==========================================
// 6. ACCIÓN: REPETIR SORPRESA (REPLAY)
// ==========================================
function replaySurprise() {
  state.isOpened = false;
  state.cakeAction = 'blow';
  state.candlesLit = true;

  // Detener música de Las Mañanitas y restablecer posición
  stopMananitas();

  // Detener fuegos artificiales y cerrar overlay de final
  confetti.stopFireworks();
  elements.finaleOverlay.classList.remove('active');
  elements.finaleOverlay.setAttribute('aria-hidden', 'true');

  // Restaurar visibilidad del pastel y ocultar regalo
  elements.giftContainer.classList.add('hidden');
  elements.giftContainer.classList.remove('opened');
  elements.giftBox.classList.remove('gift-opened');
  elements.interactiveCake.style.display = '';
  elements.interactiveCake.classList.remove('cake-eaten');

  // Ocultar burbuja
  elements.kittenBubble.classList.remove('show');

  // Limpiar clases de estado del gatito
  elements.kittenGroup.classList.remove('kitten-revealed', 'kitten-full', 'is-blowing', 'is-eating', 'belly-jiggle');
  elements.kittenGroup.classList.add('kitten-hidden');

  // Restablecer botón principal
  const icon = elements.btnBlowCandles.querySelector('.btn-icon');
  if (icon) icon.textContent = '🎂';
  elements.blowLabel.textContent = '¡Soplar las velas!';
  elements.btnBlowCandles.classList.remove('pulse-action-btn');

  // Re-encender velas
  elements.flames.forEach(flame => {
    if (flame) flame.classList.remove('flame-extinguished');
  });

  // Cerrar tapa
  setTimeout(() => {
    elements.cakeLid.classList.remove('open');
    elements.tapHint.classList.remove('hidden');
  }, 250);

  // Restablecer mensaje original (sin 'te quiero con todo mi corazón')
  elements.bubbleMessage.textContent = '¡Miau! 🐾 ¡Muchas felicidades en tu día! 💖🎂';
}

// ==========================================
// 7. MODALES: DEDICATORIA Y NOMBRE
// ==========================================
function openLetterModal() {
  getAudioContext();
  elements.letterModal.classList.add('active');
  elements.letterModal.setAttribute('aria-hidden', 'false');
  confetti.burst(35, 0.5, 0.3);
}

function closeLetterModal() {
  elements.letterModal.classList.remove('active');
  elements.letterModal.setAttribute('aria-hidden', 'true');
}

function openNameModal() {
  elements.nameModal.classList.add('active');
  elements.nameModal.setAttribute('aria-hidden', 'false');
  elements.nameInput.focus();
}

function closeNameModal() {
  elements.nameModal.classList.remove('active');
  elements.nameModal.setAttribute('aria-hidden', 'true');
}

function updateRecipientName(newName) {
  if (!newName || !newName.trim()) return;
  const trimmed = newName.trim();
  state.recipientName = trimmed;

  elements.nameTarget.textContent = trimmed;
  elements.modalMomName.textContent = trimmed;
  if (elements.finaleName) elements.finaleName.textContent = trimmed;
  document.title = `¡Feliz Cumpleaños, ${trimmed}! 🎂🐾`;

  try {
    localStorage.setItem('birthday_mom_name', trimmed);
  } catch (e) {}

  closeNameModal();
  confetti.burst(40, 0.5, 0.3);
}

// ==========================================
// 8. CONTROL DE SONIDO
// ==========================================
function toggleSound() {
  state.soundEnabled = !state.soundEnabled;
  elements.soundIcon.textContent = state.soundEnabled ? '🔔' : '🔕';
  
  if (elements.mananitasAudio) {
    if (!state.soundEnabled) {
      elements.mananitasAudio.pause();
    } else if (state.isOpened) {
      elements.mananitasAudio.play().catch(() => {});
    }
  }

  if (state.soundEnabled) {
    getAudioContext();
    playPopSound();
  }
}

// ==========================================
// 9. DETECCIÓN DE PARÁMETROS EN URL & STORAGE
// ==========================================
function checkInitialName() {
  const urlParams = new URLSearchParams(window.location.search);
  const nameFromUrl = urlParams.get('nombre') || urlParams.get('name');

  if (nameFromUrl && nameFromUrl.trim()) {
    updateRecipientName(nameFromUrl.trim());
    elements.nameInput.value = nameFromUrl.trim();
    return;
  }

  try {
    const savedName = localStorage.getItem('birthday_mom_name');
    if (savedName && savedName.trim()) {
      updateRecipientName(savedName.trim());
      elements.nameInput.value = savedName.trim();
    }
  } catch (e) {}
}

// ==========================================
// 10. EVENT LISTENERS
// ==========================================
elements.interactiveCake.addEventListener('click', openSurpriseCake);
elements.interactiveCake.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    openSurpriseCake();
  }
});

// Botón de acción (Soplar velas -> Comer pastel -> Acariciar pancita)
elements.btnBlowCandles.addEventListener('click', handleCakeAction);

// Badge superior para reabrir dedicatoria si lo desean
if (elements.badgeTag) {
  elements.badgeTag.addEventListener('click', openLetterModal);
}
elements.btnReplay.addEventListener('click', replaySurprise);

// Sonido
elements.btnSound.addEventListener('click', toggleSound);

// Modales
elements.btnCloseLetter.addEventListener('click', closeLetterModal);
elements.btnFinishLetter.addEventListener('click', () => {
  closeLetterModal();
  confetti.burst(60, 0.5, 0.4);
});

elements.btnEditName.addEventListener('click', openNameModal);
elements.btnCloseName.addEventListener('click', closeNameModal);

elements.btnSaveName.addEventListener('click', () => {
  updateRecipientName(elements.nameInput.value);
});

elements.nameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    updateRecipientName(elements.nameInput.value);
  }
});

// Chips de nombres rápidos
elements.quickChips.forEach(chip => {
  chip.addEventListener('click', () => {
    const val = chip.getAttribute('data-val');
    if (val) {
      elements.nameInput.value = val;
      updateRecipientName(val);
    }
  });
});

// Cerrar modales tocando el fondo
elements.letterModal.addEventListener('click', (e) => {
  if (e.target === elements.letterModal) closeLetterModal();
});

elements.nameModal.addEventListener('click', (e) => {
  if (e.target === elements.nameModal) closeNameModal();
});

// Abrir regalo al tocar el regalo directamente
if (elements.giftContainer) {
  elements.giftContainer.addEventListener('click', openGiftBox);
}

// Volver a vivir la sorpresa desde la pantalla final
if (elements.btnFinaleReplay) {
  elements.btnFinaleReplay.addEventListener('click', replaySurprise);
}

// Inicializar
window.addEventListener('DOMContentLoaded', () => {
  checkInitialName();
  if (elements.mananitasAudio) {
    elements.mananitasAudio.volume = 0.35;
  }
});
