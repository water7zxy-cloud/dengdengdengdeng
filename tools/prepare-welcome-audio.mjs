import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

// Offline asset preparation on macOS; the website only needs the generated WAV.
const folder = fileURLToPath(new URL('../public/assets/welcome/', import.meta.url))
const temporary = mkdtempSync(join(tmpdir(), 'dengdeng-audio-'))
const decoded = join(temporary, 'original.wav')
execFileSync('/usr/bin/afconvert', ['-f', 'WAVE', '-d', 'LEI16', join(folder, '等灯音频.m4a'), decoded])
const wav = readFileSync(decoded)
let rate, channels, pcm
for (let offset = 12; offset + 8 <= wav.length;) {
  const type = wav.toString('ascii', offset, offset + 4)
  const size = wav.readUInt32LE(offset + 4)
  if (type === 'fmt ') {
    channels = wav.readUInt16LE(offset + 10)
    rate = wav.readUInt32LE(offset + 12)
    if (wav.readUInt16LE(offset + 22) !== 16) throw new Error('Expected 16-bit PCM')
  }
  if (type === 'data') pcm = wav.subarray(offset + 8, offset + 8 + size)
  offset += 8 + size + size % 2
}
if (!pcm || !channels || !rate) throw new Error('Invalid decoded audio')
const input = new Float64Array(pcm.length / (2 * channels))
for (let i = 0; i < input.length; i++) {
  for (let channel = 0; channel < channels; channel++) input[i] += pcm.readInt16LE((i * channels + channel) * 2) / 32768 / channels
}

function fft(real, imaginary, inverse = false) {
  const n = real.length
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1
    for (; j & bit; bit >>= 1) j ^= bit
    j ^= bit
    if (i < j) { [real[i], real[j]] = [real[j], real[i]]; [imaginary[i], imaginary[j]] = [imaginary[j], imaginary[i]] }
  }
  for (let length = 2; length <= n; length *= 2) {
    const angle = (inverse ? 2 : -2) * Math.PI / length
    for (let start = 0; start < n; start += length) {
      for (let j = 0; j < length / 2; j++) {
        const cosine = Math.cos(angle * j), sine = Math.sin(angle * j)
        const a = start + j, b = a + length / 2
        const r = real[b] * cosine - imaginary[b] * sine
        const im = real[b] * sine + imaginary[b] * cosine
        real[b] = real[a] - r; imaginary[b] = imaginary[a] - im
        real[a] += r; imaginary[a] += im
      }
    }
  }
  if (inverse) for (let i = 0; i < n; i++) { real[i] /= n; imaginary[i] /= n }
}

const size = 1024, hop = 256
const window = Float64Array.from({ length: size }, (_, i) => 0.5 - 0.5 * Math.cos(2 * Math.PI * i / (size - 1)))
const frames = []
for (let start = -size / 2; start < input.length; start += hop) {
  const real = Float64Array.from(window, (value, i) => value * (input[start + i] ?? 0))
  const imaginary = new Float64Array(size)
  fft(real, imaginary)
  frames.push({ start, real, imaginary })
}
const noise = new Float64Array(size)
for (let bin = 0; bin < size; bin++) {
  const powers = frames.filter(f => f.start >= 0 && f.start + size <= input.length)
    .map(f => f.real[bin] ** 2 + f.imaginary[bin] ** 2).sort((a, b) => a - b)
  noise[bin] = powers[Math.floor(powers.length * 0.15)] ?? 0
}
const output = new Float64Array(input.length), weights = new Float64Array(input.length)
for (const { start, real, imaginary } of frames) {
  for (let bin = 0; bin < size; bin++) {
    const power = real[bin] ** 2 + imaginary[bin] ** 2
    const hz = Math.min(bin, size - bin) * rate / size
    const denoise = Math.sqrt(Math.max(0.09, 1 - 1.1 * noise[bin] / (power + 1e-12)))
    const band = hz / Math.sqrt(hz * hz + 85 ** 2) / Math.sqrt(1 + (hz / 7500) ** 4)
    real[bin] *= denoise * band; imaginary[bin] *= denoise * band
  }
  fft(real, imaginary, true)
  for (let i = 0; i < size; i++) {
    const target = start + i
    if (target < 0 || target >= input.length) continue
    output[target] += real[i] * window[i]
    weights[target] += window[i] ** 2
  }
}
let peak = 0, energy = 0
for (let i = 0; i < output.length; i++) {
  output[i] /= Math.max(weights[i], 1e-8)
  peak = Math.max(peak, Math.abs(output[i])); energy += output[i] ** 2
}
const gain = Math.min(0.85 / Math.max(peak, 1e-8), 0.12 / Math.sqrt(energy / output.length + 1e-12))
const result = Buffer.alloc(44 + output.length * 2)
result.write('RIFF'); result.writeUInt32LE(result.length - 8, 4); result.write('WAVEfmt ', 8)
result.writeUInt32LE(16, 16); result.writeUInt16LE(1, 20); result.writeUInt16LE(1, 22)
result.writeUInt32LE(rate, 24); result.writeUInt32LE(rate * 2, 28)
result.writeUInt16LE(2, 32); result.writeUInt16LE(16, 34); result.write('data', 36)
result.writeUInt32LE(output.length * 2, 40)
for (let i = 0; i < output.length; i++) {
  const fade = Math.min(1, i / (rate * 0.012), (output.length - 1 - i) / (rate * 0.025))
  result.writeInt16LE(Math.round(Math.max(-1, Math.min(1, output[i] * gain * fade)) * 32767), 44 + i * 2)
}
const destination = join(folder, '等灯音频-clean.wav')
writeFileSync(destination, result)
console.log(`Prepared: ${destination}; ${(output.length / rate).toFixed(2)}s; original recording retained.`)
