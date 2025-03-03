import React, { useState, useEffect } from 'react';

const INITIAL_TIME = 25 * 60; // 25分

// Timerコンポーネント
const Timer: React.FC = () => {
  // 時間[秒]
  const [time, setTime] = useState(INITIAL_TIME);
  // 動作中フラグ
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    // タイマー開始
    if (isRunning)
    {
      intervalId = setInterval(() => {
        setTime((prevTime) => {
          const nextTime = prevTime - 1;
          if (nextTime <= 0) 
          {
            clearInterval(intervalId);
            return 0;
          }
          return nextTime;
        });
      }, 1000);
    }
    // タイマー停止
    return () => clearInterval(intervalId);
  }, [isRunning]);

  const startTimer = () => setIsRunning(true);
  const pauseTimer = () => setIsRunning(false);
  const resetTimer = () => {
    setIsRunning(false);
    setTime(INITIAL_TIME);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="text-center">
      <div className="text-6xl font-bold mb-4">{formatTime(time)}</div>
      <div className="space-x-2">
        {!isRunning ? (
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
