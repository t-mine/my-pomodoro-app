let audio: HTMLAudioElement | null = null;

/**
 * MP3を再生する関数
 */
export function playSound(bgmMode: BgmMode) {
    console.log(`bgmMode:${bgmMode}`);
  if (bgmMode === 'off') {
    stopSound();
    return;
  }
  if (!audio) {
    const src = bgmModeToMp3Src.get(bgmMode);
    console.log(`src:${src}`);
    if (!src) {
      return;
    }
    audio = new Audio(src);
    audio.loop = true;
    audio.volume = 0.05;
  }
  audio.play();
}

const bgmModeToMp3Src = new Map<BgmMode, string | null>([
    ['off', null],
    ['white', "/sounds/whitenoise.mp3"],
    ['pink', "/sounds/pinknoise.mp3"],
    ['brown', "/sounds/browniannoise.mp3"],
  ]);

/**
 * MP3を停止する関数
 */
export function stopSound() {
  if (audio) {
    audio.pause();
    audio.currentTime = 0; // 再生位置をリセット
  }
}
