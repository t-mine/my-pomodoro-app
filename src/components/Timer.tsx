import React, { useState, useEffect } from 'react';

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
    
  useEffect(() => {
    // 停止の場合、何もしない
    if (!timerState.isRunning) return;
    // 残り時間が無い場合、何もしない
    if (timerState.remainingTime === 0) return;
    // タイマー開始
    const intervalId = setInterval(() => {
      setTimerState((prevState: TimerState) => {

        // 残り時間が無い場合、かつ、ゴールポモドーロ数に到達していない場合
        if (prevState.remainingTime === 0 && prevState.completedPomodoros < setting.goalPomodoros) {
          // 完了ポモドーロ数
          const completedPomodoros = prevState.mode === 'work' ? prevState.completedPomodoros + 1 : prevState.completedPomodoros
          const isCompleted = completedPomodoros === setting.goalPomodoros;
          // モード切替、workの場合は完了ポモドーロ数を+1
          return {
            ...prevState,
            remainingTime: 
              isCompleted 
                ? 0
                : prevState.mode === 'work' 
                  ? setting.breakDuration 
                  : setting.workDuration,
            isRunning: !isCompleted,
            mode: 
            isCompleted
              ? prevState.mode
              : prevState.mode === 'work' 
                ? 'break' 
                : 'work',
            completedPomodoros: completedPomodoros
          }
        }
        // 残り時間を1秒減らす
        return {
          ...prevState,
          remainingTime: prevState.remainingTime - 1
        }
      });
    }, 1000);
    // timerState.isRunning変更時にタイマー停止
    return () => clearInterval(intervalId);
  }, [timerState.isRunning]);

  const startTimer = () => setTimerState(prevState => ({
    ...prevState,
    isRunning: true
  }));
  const pauseTimer = () => setTimerState(prevState => ({
    ...prevState,
    isRunning: false
  }));
  const resetTimer = () => setTimerState(prevState => ({
    ...prevState,
    remainingTime: setting.workDuration,
    isRunning: false
  }));

  const formatTime = (remainingTime: number) => {
    const mins = Math.floor(remainingTime / 60);
    const secs = remainingTime % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="text-center">
      <div className="text-6xl font-bold mb-4">{formatTime(timerState.remainingTime)}</div>
      <div className="space-x-2">
        {!timerState.isRunning ? (
          <button onClick={startTimer} className="bg-green-500 text-white px-4 py-2 rounded">
            開始
          </button>
        ) : (
          <button onClick={pauseTimer} className="bg-yellow-500 text-white px-4 py-2 rounded">
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
