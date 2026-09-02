/**
 * Synthesizer Service for Ambient Relaxation Sounds (Rain, Ocean, Zen)
 * utilizing the browser Web Audio API with zero external audio assets.
 */

class AmbientAudioService {
  constructor() {
    this.audioContext = null
    this.masterGain = null
    this.activeNodes = []
  }

  ensureContext() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return null

    if (!this.audioContext || this.audioContext.state === 'closed') {
      this.audioContext = new AudioContextClass()
    }

    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume()
    }

    return this.audioContext
  }

  setVolume(level) {
    if (this.masterGain && this.audioContext) {
      this.masterGain.gain.setValueAtTime(level, this.audioContext.currentTime)
    }
  }

  stop() {
    for (const node of this.activeNodes) {
      try {
        if (typeof node.stop === 'function') node.stop()
        if (typeof node.disconnect === 'function') node.disconnect()
      } catch {
        // ignore disconnect failures on stopped nodes
      }
    }
    this.activeNodes = []
  }

  start(soundType, volume = 0.5) {
    this.stop()
    const ctx = this.ensureContext()
    if (!ctx) return false

    const masterGain = ctx.createGain()
    masterGain.gain.setValueAtTime(volume, ctx.currentTime)
    masterGain.connect(ctx.destination)
    this.masterGain = masterGain

    if (soundType === 'rain') {
      this.playRain(ctx, masterGain)
    } else if (soundType === 'ocean') {
      this.playOcean(ctx, masterGain)
    } else if (soundType === 'zen') {
      this.playZen(ctx, masterGain)
    }

    return true
  }

  playRain(ctx, destination) {
    const bufferSize = ctx.sampleRate * 2
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const output = noiseBuffer.getChannelData(0)
    let lastOut = 0.0

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1
      output[i] = (lastOut + 0.02 * white) / 1.02
      lastOut = output[i]
      output[i] *= 3.5
    }

    const whiteNoise = ctx.createBufferSource()
    whiteNoise.buffer = noiseBuffer
    whiteNoise.loop = true

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(850, ctx.currentTime)

    whiteNoise.connect(filter)
    filter.connect(destination)
    whiteNoise.start()

    this.activeNodes = [whiteNoise, filter]
  }

  playOcean(ctx, destination) {
    const bufferSize = ctx.sampleRate * 2
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const output = noiseBuffer.getChannelData(0)
    let b0 = 0, b1 = 0, b2 = 0

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1
      b0 = 0.99886 * b0 + white * 0.0555179
      b1 = 0.99332 * b1 + white * 0.0750759
      b2 = 0.96900 * b2 + white * 0.153852
      output[i] = (b0 + b1 + b2) * 0.2
    }

    const pinkNoise = ctx.createBufferSource()
    pinkNoise.buffer = noiseBuffer
    pinkNoise.loop = true

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(450, ctx.currentTime)

    const waveGain = ctx.createGain()
    waveGain.gain.setValueAtTime(0.3, ctx.currentTime)

    const lfo = ctx.createOscillator()
    lfo.frequency.setValueAtTime(0.16, ctx.currentTime)

    const lfoGain = ctx.createGain()
    lfoGain.gain.setValueAtTime(0.35, ctx.currentTime)

    lfo.connect(lfoGain)
    lfoGain.connect(waveGain.gain)

    pinkNoise.connect(filter)
    filter.connect(waveGain)
    waveGain.connect(destination)

    pinkNoise.start()
    lfo.start()

    this.activeNodes = [pinkNoise, filter, waveGain, lfo, lfoGain]
  }

  playZen(ctx, destination) {
    const chordFrequencies = [174, 285, 396, 528]
    const nodes = []

    chordFrequencies.forEach((freq) => {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, ctx.currentTime)

      const oscGain = ctx.createGain()
      oscGain.gain.setValueAtTime(0.12, ctx.currentTime)

      const tremolo = ctx.createOscillator()
      tremolo.frequency.setValueAtTime(0.1, ctx.currentTime)
      const tremoloGain = ctx.createGain()
      tremoloGain.gain.setValueAtTime(0.04, ctx.currentTime)

      tremolo.connect(tremoloGain)
      tremoloGain.connect(oscGain.gain)

      osc.connect(oscGain)
      oscGain.connect(destination)

      osc.start()
      tremolo.start()

      nodes.push(osc, oscGain, tremolo, tremoloGain)
    })

    this.activeNodes = nodes
  }
}

export const ambientAudioService = new AmbientAudioService()
