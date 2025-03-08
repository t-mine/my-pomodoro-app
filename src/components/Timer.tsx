import React, { useState, useEffect } from 'react';
import { useTimer } from 'react-timer-hook';

interface PomodoroState {
  mode: 'work' | 'break';
  completedCount: number;
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
  const [pomodoroState, setPomodoroState] = useState<PomodoroState>({
    mode: 'work',
    completedCount: 0,
  });

  const getTimerDuration = () => {
    return pomodoroState.mode === "work"
      ? setting.workDuration 
      : setting.breakDuration
  };
  const getExpiryDateFromDuration = (durationSeconds: number): Date => {
    return new Date(Date.now() + durationSeconds * 1000);
  };
  const onExpire = () => {
    if (pomodoroState.mode === "work") {
      const newSetCount = pomodoroState.completedCount + 1;
      setPomodoroState((prevState)=>{
        return {
          ...prevState,
          mode: "break",
          completedCount: newSetCount
        }
      });
      restart(getExpiryDateFromDuration(setting.breakDuration), false);
    } else {
      setPomodoroState((prevState)=>{
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
    onExpire: () => onExpire(),
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
    <div className="h-screen w-screen flex flex-col justify-center items-center bg-gray-800">
      <div className="text-center">
        {/* 時間 */}
        <div className="text-8xl font-bold mb-4 text-white">{formatTime(minutes, seconds)}</div>
        {/* ボタン */}
        <div className="space-x-2">
          {!isRunning ? (
            <button onClick={start} className="bg-teal-700 text-white w-[7.5rem] px-4 py-2 rounded">
              start
            </button>
          ) : (
            <button onClick={pause} className="bg-amber-700 text-white w-[7.5rem] px-4 py-2 rounded">
              stop
            </button>
          )}
          <button onClick={resetTimer} className="bg-rose-700 text-white w-[7.5rem] px-4 py-2 rounded">
            reset
          </button>
        </div>
        {/* 完了ポモドーロ数 */}
        <div className="mt-4 text-white">completed : {pomodoroState.completedCount} / {setting.goalPomodoros}</div>
      </div>
    </div>
  );
};

export default Timer;
