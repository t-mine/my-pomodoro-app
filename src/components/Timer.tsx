import React, { useState, useEffect } from 'react';
import { useTimer } from 'react-timer-hook';

interface PomodoroState {
  mode: 'work' | 'break' | 'done';
  completedCount: number;
  isPaused: boolean;
}

interface SettingsState {
  workDuration: number;
  breakDuration: number;
  goalPomodoros: number;
  isAutoStart: boolean;
}

const Timer: React.FC = () => {

  // setting state
  const [setting, setSetting] = useState<SettingsState>({
    workDuration: 10,
    breakDuration: 5,
    goalPomodoros: 2,
    isAutoStart: false
  });

  // pomodoro state
  const [pomodoroState, setPomodoroState] = useState<PomodoroState>({
    mode: 'work',
    completedCount: 0,
    isPaused: false
  });

  // 作業時間 or 休憩時間を取得する
  const getTimerDuration = () => {
    return pomodoroState.mode === "work"
      ? setting.workDuration 
      : setting.breakDuration
  };

  // react-timer-hook用のタイマー終了時間を算出
  const getExpiryDateFromDuration = (durationSeconds : number): Date => {
    return new Date(Date.now() + durationSeconds * 1000);
  };

  // onExpire
  const onExpire = () => {
    const isWorkMode = pomodoroState.mode === "work";
    const completedCount = isWorkMode ? pomodoroState.completedCount + 1 : pomodoroState.completedCount;
    const nextMode = isWorkMode
      ? completedCount === setting.goalPomodoros ? "done" : "break"
      : "work";

    setPomodoroState((prevState)=>({
      ...prevState, 
      mode: nextMode, 
      completedCount
    }));

    if (nextMode != "done") {
      const duration = isWorkMode ? setting.breakDuration : setting.workDuration;
      // restartはイベントハンドラ以外ではsetTimeoutを使用しないと動作しない
      setTimeout(() => restart(getExpiryDateFromDuration(duration), setting.isAutoStart),1);
    }
  };

  // useTimer
  const { seconds, minutes, isRunning, start, pause, restart, resume } = useTimer({
    expiryTimestamp: getExpiryDateFromDuration(getTimerDuration()),
    autoStart: false,
    onExpire: onExpire,
  });

  // onReset
  const onReset = () => {
    setPomodoroState((prevState)=>({...prevState, mode: "work", completedCount: 0, isPaused: false}));
    restart(getExpiryDateFromDuration(setting.workDuration), false)
  }

  // onPause
  const onPause = () => {
    setPomodoroState((prevState) => ({ ...prevState, isPaused: true }));
    pause();
  }

  // onResume
  const onResume = () => {
    setPomodoroState((prevState) => ({ ...prevState, isPaused: false }));
    resume();
  }

  // format time
  const formatTime = (m: number, s: number) => {
    const mm = m.toString().padStart(2, "0");
    const ss = s.toString().padStart(2, "0");
    return `${mm}:${ss}`;
  };

  // request notification permission
  const requestNotificationPermission = () => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          console.log("通知が許可されました！");
        }
      });
    }
  };
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // send notification
  const sendNotification = (title: string, body: string) => {
    if (Notification.permission === "granted") {
      new Notification(title, {
        body: body,
        //icon: "/icon.png",
      });
    }
  };
  useEffect(() => {
    if (pomodoroState.completedCount === 0) return;
    
    switch(pomodoroState.mode) {
      case "work":
        sendNotification("pomodoro timer", "end breaking");
        break;
      case "break":
        sendNotification("pomodoro timer", "end working");
        break;
      case "done":
        sendNotification("pomodoro timer", "complete!");
        break;
    }
  }, [pomodoroState.mode]);

  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center bg-gray-800">
      <div className="text-center">
        {/* time */}
        <div className="text-8xl font-bold mb-4 text-white">{formatTime(minutes, seconds)}</div>
        {/* buttons */}
        <div className="space-x-2">
          {!isRunning ? (
            <button onClick={pomodoroState.isPaused ? onResume : start} 
              className="bg-teal-700 text-white w-[7.5rem] px-4 py-2 rounded disabled:bg-gray-600 disabled:cursor-not-allowed" 
              disabled={pomodoroState.mode === "done"}>
              {pomodoroState.isPaused ? "resume" : "start"}
            </button>
          ) : (
            <button onClick={onPause} className="bg-amber-700 text-white w-[7.5rem] px-4 py-2 rounded">
              stop
            </button>
          )}
          <button onClick={onReset} className="bg-rose-700 text-white w-[7.5rem] px-4 py-2 rounded">
            reset
          </button>
        </div>
        {/* completed */}
        <div className="mt-4 text-white">completed : {pomodoroState.completedCount} / {setting.goalPomodoros}</div>
      </div>
    </div>
  );
};

export default Timer;
