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

  // state
  const [setting, setSetting] = useState<SettingsState>({
    workDuration: 10,
    breakDuration: 5,
    goalPomodoros: 2,
    isAutoStart: false
  });

  const [pomodoroState, setPomodoroState] = useState<PomodoroState>({
    mode: 'work',
    completedCount: 0,
    isPaused: false
  });

  // first render
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // useTimer
  const { seconds, minutes, isRunning, start, pause, restart, resume } = useTimer({
    expiryTimestamp: getExpiryDateFromDuration(getTimerDuration()),
    autoStart: false,
    onExpire: onExpire,
  });

  // functions
  function getTimerDuration () {
    return pomodoroState.mode === "work"
      ? setting.workDuration 
      : setting.breakDuration
  };

  function getExpiryDateFromDuration (durationSeconds : number): Date {
    return new Date(Date.now() + durationSeconds * 1000);
  };

  function onExpire () {
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

    // restart
    if (nextMode != "done") {
      const duration = isWorkMode ? setting.breakDuration : setting.workDuration;
      // restartはイベントハンドラ以外ではsetTimeoutを使用しないと動作しない
      setTimeout(() => restart(getExpiryDateFromDuration(duration), setting.isAutoStart),1);
    }

    // desktop notification
    switch(nextMode) {
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
  };

  function onReset () {
    setPomodoroState((prevState)=>({...prevState, mode: "work", completedCount: 0, isPaused: false}));
    restart(getExpiryDateFromDuration(setting.workDuration), false)
  }

  function onPause () {
    setPomodoroState((prevState) => ({ ...prevState, isPaused: true }));
    pause();
  }

  function onResume () {
    setPomodoroState((prevState) => ({ ...prevState, isPaused: false }));
    resume();
  }

  function formatTime (m: number, s: number) {
    const mm = m.toString().padStart(2, "0");
    const ss = s.toString().padStart(2, "0");
    return `${mm}:${ss}`;
  };

  function requestNotificationPermission () {
    if (Notification.permission !== "granted") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          console.log("通知が許可されました！");
        }
      });
    }
  };

  function sendNotification (title: string, body: string) {
    if (Notification.permission === "granted") {
      new Notification(title, {
        body: body,
        //icon: "/icon.png",
      });
    }
  };

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
