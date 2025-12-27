// Audio.js - Menu and gameplay music system

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
    this.muted = this.loadMutePreference();
    this.volume = 0.5;

    // Preload check - we'll load on first interaction
    this.initialized = false;
  }

  loadMutePreference() {
    try {
      return localStorage.getItem('mop_muted') === 'true';
    } catch {
      return false;
    }
  }

  saveMutePreference() {
    try {
      localStorage.setItem('mop_muted', this.muted.toString());
    } catch {
      // localStorage not available
    }
  }

  getRandomTrack(tracks) {
    return tracks[Math.floor(Math.random() * tracks.length)];
  }

  async playMenuMusic() {
    if (this.currentType === 'menu' && this.currentAudio && !this.currentAudio.paused) {
      return; // Already playing menu music
    }

    this.stopMusic();
    this.currentType = 'menu';

    const track = this.getRandomTrack(MENU_TRACKS);
    await this.playTrack(track);
  }

  async playGameMusic() {
    if (this.currentType === 'game' && this.currentAudio && !this.currentAudio.paused) {
      return; // Already playing game music
    }

    this.stopMusic();
    this.currentType = 'game';

    const track = this.getRandomTrack(GAMEPLAY_TRACKS);
    await this.playTrack(track);
  }

  async playTrack(src) {
    try {
      this.currentAudio = new window.Audio(src);
      this.currentAudio.loop = true;
      this.currentAudio.volume = this.muted ? 0 : this.volume;

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

  toggleMute() {
    this.muted = !this.muted;
    this.saveMutePreference();

    if (this.currentAudio) {
      this.currentAudio.volume = this.muted ? 0 : this.volume;
    }

    return this.muted;
  }

  setMuted(muted) {
    this.muted = muted;
    this.saveMutePreference();

    if (this.currentAudio) {
      this.currentAudio.volume = this.muted ? 0 : this.volume;
    }
  }

  isMuted() {
    return this.muted;
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.currentAudio && !this.muted) {
      this.currentAudio.volume = this.volume;
    }
  }
}
