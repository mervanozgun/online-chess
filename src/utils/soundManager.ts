class SoundManager {
  private ctx: AudioContext | null = null;
  private musicInterval: any = null;
  private isMusicPlaying: boolean = false;
  private volume: number = 0.2;

  constructor() {
    // Lazy initialize AudioContext on interaction
  }

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    this.volume = vol;
  }

  public playMove() {
    try {
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(this.volume * 0.4, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    } catch (e) {
      console.error(e);
    }
  }

  public playCapture() {
    try {
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(this.volume * 0.5, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch (e) {
      console.error(e);
    }
  }

  public playCheck() {
    try {
      this.init();
      if (!this.ctx) return;

      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(600, this.ctx.currentTime);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(750, this.ctx.currentTime);

      gain.gain.setValueAtTime(this.volume * 0.6, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(this.ctx.currentTime + 0.3);
      osc2.stop(this.ctx.currentTime + 0.3);
    } catch (e) {
      console.error(e);
    }
  }

  public playWin() {
    try {
      this.init();
      if (!this.ctx) return;

      const notes = [261.6, 329.6, 392.0, 523.3]; // C E G C
      notes.forEach((note, index) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note, this.ctx!.currentTime + index * 0.15);

        gain.gain.setValueAtTime(0, this.ctx!.currentTime + index * 0.15);
        gain.gain.linearRampToValueAtTime(this.volume * 0.4, this.ctx!.currentTime + index * 0.15 + 0.05);
        gain.gain.linearRampToValueAtTime(0, this.ctx!.currentTime + index * 0.15 + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(this.ctx!.currentTime + index * 0.15);
        osc.stop(this.ctx!.currentTime + index * 0.15 + 0.3);
      });
    } catch (e) {
      console.error(e);
    }
  }

  public startMusic() {
    if (this.isMusicPlaying) return;
    try {
      this.init();
      if (!this.ctx) return;

      this.isMusicPlaying = true;
      const playBar = () => {
        if (!this.isMusicPlaying || !this.ctx) return;

        // Generate gentle chord progression (e.g. Amin7, Gmaj, Fmaj, Emin7)
        const progression = [
          [220, 261.6, 329.6, 392.0], // Am7
          [196, 246.9, 293.7, 392.0], // G6/Gmaj
          [174.6, 220, 261.6, 329.6], // Fmaj7
          [164.8, 196, 246.9, 329.6]  // Em7
        ];

        const barIndex = Math.floor(Math.random() * progression.length);
        const chord = progression[barIndex];

        chord.forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.8);

          // Soft ambient volume
          gain.gain.setValueAtTime(0, this.ctx.currentTime + idx * 0.8);
          gain.gain.linearRampToValueAtTime(this.volume * 0.15, this.ctx.currentTime + idx * 0.8 + 0.4);
          gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + idx * 0.8 + 1.8);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(this.ctx.currentTime + idx * 0.8);
          osc.stop(this.ctx.currentTime + idx * 0.8 + 1.8);
        });
      };

      playBar();
      this.musicInterval = setInterval(playBar, 3500);
    } catch (e) {
      console.error(e);
    }
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const soundManager = new SoundManager();
