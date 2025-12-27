// Audio.js - Menu and gameplay music system with separate music/SFX controls

const MENU_TRACKS = [
  '/music/Victory Parade.mp3',
  '/music/Victory Parade (1).mp3'
];

const GAMEPLAY_TRACKS = [
  '/music/Marching Forward.mp3',
  '/music/March of Pixels.mp3',
  '/music/March of Pixels (1).mp3',
  '/music/March of Pixels (Cover).mp3'
];

export class Audio {
  constructor() {
    this.currentAudio = null;
    this.currentType = null; // 'menu' or 'game'

    // Load preferences
    this.musicEnabled = this.loadPreference('mop_music', true);
    this.sfxEnabled = this.loadPreference('mop_sfx', true);
    this.musicVolume = this.loadVolumePreference('mop_music_vol', 0.5);
    this.sfxVolume = this.loadVolumePreference('mop_sfx_vol', 0.7);

    // Preload check - we'll load on first interaction
    this.initialized = false;
    this.pendingPlay = null;

    // Web Audio API for synthesized SFX
    this.audioContext = null;

    // Setup first interaction listener
    this.setupFirstInteraction();
  }

  getAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    return this.audioContext;
  }

  loadPreference(key, defaultValue) {
    try {
      const saved = localStorage.getItem(key);
      if (saved === null) return defaultValue;
      return saved === 'true';
    } catch {
      return defaultValue;
    }
  }

  loadVolumePreference(key, defaultValue) {
    try {
      const saved = localStorage.getItem(key);
      if (saved === null) return defaultValue;
      const vol = parseFloat(saved);
      return isNaN(vol) ? defaultValue : Math.max(0, Math.min(1, vol));
    } catch {
      return defaultValue;
    }
  }

  savePreference(key, value) {
    try {
      localStorage.setItem(key, value.toString());
    } catch {
      // localStorage not available
    }
  }

  setupFirstInteraction() {
    const startMusic = () => {
      if (!this.initialized && this.pendingPlay) {
        this.initialized = true;
        if (this.pendingPlay === 'menu') {
          this.playMenuMusic();
        } else if (this.pendingPlay === 'game') {
          this.playGameMusic();
        }
      }
      document.removeEventListener('click', startMusic);
      document.removeEventListener('touchstart', startMusic);
      document.removeEventListener('keydown', startMusic);
    };

    document.addEventListener('click', startMusic);
    document.addEventListener('touchstart', startMusic);
    document.addEventListener('keydown', startMusic);
  }

  getRandomTrack(tracks) {
    return tracks[Math.floor(Math.random() * tracks.length)];
  }

  async playMenuMusic() {
    this.pendingPlay = 'menu';

    if (!this.musicEnabled) return;

    if (this.currentType === 'menu' && this.currentAudio && !this.currentAudio.paused) {
      return; // Already playing menu music
    }

    this.stopMusic();
    this.currentType = 'menu';

    const track = this.getRandomTrack(MENU_TRACKS);
    await this.playTrack(track);
  }

  async playGameMusic() {
    this.pendingPlay = 'game';

    if (!this.musicEnabled) return;

    if (this.currentType === 'game' && this.currentAudio && !this.currentAudio.paused) {
      return; // Already playing game music
    }

    this.stopMusic();
    this.currentType = 'game';

    const track = this.getRandomTrack(GAMEPLAY_TRACKS);
    await this.playTrack(track);
  }

  async playTrack(src) {
    if (!this.musicEnabled) return;

    try {
      this.currentAudio = new window.Audio(src);
      this.currentAudio.loop = true;
      this.currentAudio.volume = this.musicVolume;

      // When track ends, play another random one from same category
      this.currentAudio.addEventListener('ended', () => {
        if (this.currentType === 'menu') {
          this.playMenuMusic();
        } else if (this.currentType === 'game') {
          this.playGameMusic();
        }
      });

      await this.currentAudio.play();
      this.initialized = true;
    } catch (error) {
      console.warn('Audio playback failed:', error);
      // Browser may block autoplay - will try again on user interaction
    }
  }

  stopMusic() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    this.currentType = null;
  }

  fadeOut(duration = 1000) {
    if (!this.currentAudio) return Promise.resolve();

    return new Promise((resolve) => {
      const audio = this.currentAudio;
      const startVolume = audio.volume;
      const startTime = Date.now();

      const fade = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        audio.volume = startVolume * (1 - progress);

        if (progress < 1) {
          requestAnimationFrame(fade);
        } else {
          this.stopMusic();
          resolve();
        }
      };

      fade();
    });
  }

  // Music controls
  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    this.savePreference('mop_music', this.musicEnabled);

    if (this.musicEnabled) {
      // Resume music
      if (this.pendingPlay === 'menu') {
        this.playMenuMusic();
      } else if (this.pendingPlay === 'game') {
        this.playGameMusic();
      }
    } else {
      this.stopMusic();
    }

    return this.musicEnabled;
  }

  setMusicEnabled(enabled) {
    if (this.musicEnabled === enabled) return;
    this.toggleMusic();
  }

  isMusicEnabled() {
    return this.musicEnabled;
  }

  getMusicVolume() {
    return this.musicVolume;
  }

  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    this.savePreference('mop_music_vol', this.musicVolume);
    if (this.currentAudio) {
      this.currentAudio.volume = this.musicVolume;
    }
  }

  // SFX controls
  toggleSFX() {
    this.sfxEnabled = !this.sfxEnabled;
    this.savePreference('mop_sfx', this.sfxEnabled);
    return this.sfxEnabled;
  }

  setSFXEnabled(enabled) {
    this.sfxEnabled = enabled;
    this.savePreference('mop_sfx', this.sfxEnabled);
  }

  isSFXEnabled() {
    return this.sfxEnabled;
  }

  getSFXVolume() {
    return this.sfxVolume;
  }

  setSFXVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    this.savePreference('mop_sfx_vol', this.sfxVolume);
  }

  // Play sound effect
  playSFX(src) {
    if (!this.sfxEnabled) return;

    try {
      const sfx = new window.Audio(src);
      sfx.volume = this.sfxVolume;
      sfx.play().catch(() => {});
    } catch {
      // Ignore SFX errors
    }
  }

  // Legacy mute support (mutes both)
  toggleMute() {
    const newState = !this.musicEnabled;
    this.setMusicEnabled(newState);
    this.setSFXEnabled(newState);
    return !newState;
  }

  isMuted() {
    return !this.musicEnabled && !this.sfxEnabled;
  }

  // Synthesized shooting sound (laser/pew)
  playShootSound() {
    if (!this.sfxEnabled) return;

    try {
      const ctx = this.getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(800, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);

      gainNode.gain.setValueAtTime(this.sfxVolume * 0.15, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.1);
    } catch {
      // Ignore audio errors
    }
  }

  // Synthesized hit sound (impact)
  playHitSound() {
    if (!this.sfxEnabled) return;

    try {
      const ctx = this.getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(150, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.15);

      gainNode.gain.setValueAtTime(this.sfxVolume * 0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.15);
    } catch {
      // Ignore audio errors
    }
  }

  // Synthesized death sound (explosion)
  playDeathSound() {
    if (!this.sfxEnabled) return;

    try {
      const ctx = this.getAudioContext();

      // Noise burst for explosion
      const bufferSize = ctx.sampleRate * 0.2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);

      noise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      gainNode.gain.setValueAtTime(this.sfxVolume * 0.4, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

      noise.start(ctx.currentTime);
      noise.stop(ctx.currentTime + 0.2);
    } catch {
      // Ignore audio errors
    }
  }

  // Synthesized pickup sound (weapon collect)
  playPickupSound() {
    if (!this.sfxEnabled) return;

    try {
      const ctx = this.getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(400, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
      oscillator.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15);

      gainNode.gain.setValueAtTime(this.sfxVolume * 0.2, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.15);
    } catch {
      // Ignore audio errors
    }
  }
}
