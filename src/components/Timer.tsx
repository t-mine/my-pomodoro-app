import React, { useState, useEffect } from 'react';

const WORK_TIME = 25 * 60; // 25分
const BREAK_TIME = 5 * 60; // 5分

interface TimerState {
  seconds: number;
  isRunning: boolean;
  mode: 'work' | 'break';
}

// Timerコンポーネント
const Timer: React.FC = () => {
  // タイマーステート
  const [timerState, setTimerState] = useState<TimerState>({
    seconds: 25 * 60,   // 初期の秒数
    isRunning: false,  // 初期状態でタイマーは停止している
    mode: 'work',  // 初期モードは「work」
  });

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    // タイマー開始
    if (timerState.isRunning)
    {
      intervalId = setInterval(() => {
        setTimerState(prevState => {
          const prevTime = prevState.seconds;
          const nextTime = prevTime - 1;
          if (nextTime <= 0) 
          {
            // タイマー終了
            return {
              ...prevState,
              seconds: 0,
              isRunning: false
            }
          }
          return {
            ...prevState,
            seconds: nextTime
          }
        });
      }, 1000);
    }
    // タイマー停止
    return () => clearInterval(intervalId);
  }, [timerState]);

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
    soconds: WORK_TIME,
    isRunning: false
  }));

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="text-center">
      <div className="text-6xl font-bold mb-4">{formatTime(timerState.seconds)}</div>
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
      </div>
    </div>
  );
};

export default Timer;
