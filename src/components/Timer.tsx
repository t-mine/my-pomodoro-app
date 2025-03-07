import React, { useState, useEffect } from 'react';
import { useTimer } from 'react-timer-hook';

interface TimerState {
  remainingTime: number;
  isRunning: boolean;
  mode: 'work' | 'break';
  completedPomodoros: number;
}

interface SettingsState {
  workDuration: number;
  breakDuration: number;
  goalPomodoros: number;
}

// Timerコンポーネント
const Timer: React.FC = () => {

  // 設定ステート
  const [setting, setSetting] = useState<SettingsState>({
    workDuration: 10,
    breakDuration: 5,
    goalPomodoros: 2
  });

  // タイマーステート
  const [timerState, setTimerState] = useState<TimerState>({
    remainingTime: setting.workDuration,
    isRunning: false,
    mode: 'work',
    completedPomodoros: 0,
  });

  const getTimerDuration = () => {
    return timerState.mode === "work"
      ? setting.workDuration 
      : setting.breakDuration
  };
  const getExpiryDateFromDuration = (durationSeconds: number): Date => {
    return new Date(Date.now() + durationSeconds * 1000);
  };
  const handleExpire = () => {
    if (timerState.mode === "work") {
      const newSetCount = timerState.completedPomodoros + 1;
      setTimerState((prevState)=>{
        return {
          ...prevState,
          mode: "break",
          completedPomodoros: newSetCount
        }
      });
      restart(getExpiryDateFromDuration(setting.breakDuration), false);
    } else {
      setTimerState((prevState)=>{
        return {
          ...prevState,
          mode: "work",
        }
      });
      restart(getExpiryDateFromDuration(setting.workDuration), false);
    }
  };

  const { seconds, minutes, isRunning, start, pause, restart } = useTimer({
    expiryTimestamp: getExpiryDateFromDuration(getTimerDuration()),
    autoStart: false,
    onExpire: () => handleExpire(),
  });

  const resetTimer = () => {
    restart(getExpiryDateFromDuration(setting.workDuration), false)
  }

  const formatTime = (m: number, s: number) => {
    const mm = m.toString().padStart(2, "0");
    const ss = s.toString().padStart(2, "0");
    return `${mm}:${ss}`;
  };

  return (
    <div className="text-center">
      <div className="text-6xl font-bold mb-4">{formatTime(minutes, seconds)}</div>
      <div className="space-x-2">
        {!timerState.isRunning ? (
          <button onClick={start} className="bg-green-500 text-white px-4 py-2 rounded">
            開始
          </button>
        ) : (
          <button onClick={pause} className="bg-yellow-500 text-white px-4 py-2 rounded">
            一時停止
          </button>
        )}
        <button onClick={resetTimer} className="bg-red-500 text-white px-4 py-2 rounded">
          リセット
        </button>
        <div>完了ポモドーロ数 : {timerState.completedPomodoros}</div>
      </div>
    </div>
  );
};

export default Timer;
