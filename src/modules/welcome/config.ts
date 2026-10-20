import coverImage from './assets/cover.png'

export const coverConfig = {
  image: coverImage,
  audio: '/assets/welcome/等灯音频-cute.wav',
  voiceVolume: 0.4,
  buttonLabel: '点亮小灯',
  lightDurationMs: 1500,
  letterDurationMs: 80,
  typingIntervalMs: 130,
}

let welcomeSound: HTMLAudioElement | null = null

export function playWelcomeAudio() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel()
  welcomeSound ??= new Audio(coverConfig.audio)
  welcomeSound.volume = coverConfig.voiceVolume
  welcomeSound.currentTime = 0
  void welcomeSound.play().catch((error: unknown) => console.warn('封面音效未能播放', error))
}
