import React, { useState, useEffect } from 'react';
import { useTimer } from 'react-timer-hook';
import * as notification from '../features/notification/notification'; 
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch";

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

  useEffect(() => {
    notification.requestNotificationPermission();
  }, []);

  const { seconds, minutes, isRunning, start, pause, restart, resume } = useTimer({
    expiryTimestamp: getExpiryDateFromDuration(getTimerDuration()),
    autoStart: false,
    onExpire: onExpire,
  });

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
    notifyModeTransition(nextMode);
  };

  function notifyModeTransition(nextMode : string) {
    switch(nextMode) {
      case "work":
        //notification.sendNotification("pomodoro timer", "end breaking");
        notification.playSound();
        break;
      case "break":
        //notification.sendNotification("pomodoro timer", "end working");
        notification.playSound();
        break;
      case "done":
        //notification.sendNotification("pomodoro timer", "complete!");
        notification.playSound();
        break;
    }
  }

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

  function handleChange (key: keyof SettingsState, value: number | boolean) {
    setSetting((prev) => ({ ...prev, [key]: value }));
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
              {pomodoroState.isPaused ? "Resume" : "Start"}
            </button>
          ) : (
            <button onClick={onPause} className="bg-amber-700 text-white w-[7.5rem] px-4 py-2 rounded">
              Stop
            </button>
          )}
          <button onClick={onReset} className="bg-rose-700 text-white w-[7.5rem] px-4 py-2 rounded">
            Reset
          </button>
        </div>
        {/* completed */}
        <div className="mt-4 text-white">Completed pomodoros : {pomodoroState.completedCount} / {setting.goalPomodoros}</div>
        {/* options */}
        <Dialog>
          <DialogTrigger className="mt-12 bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 w-[7.5rem] px-4 py-2 rounded">Options</DialogTrigger>
          <DialogContent className="bg-gray-800 border-none">
            <DialogHeader>
              <DialogTitle className="text-gray-300">Options</DialogTitle>
            </DialogHeader>
            <div>
              {/* Work Duration */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-500">Work Duration (minutes)</label>
                <input
                  type="number"
                  value={setting.workDuration}
                  onChange={(e) => handleChange("workDuration", Number(e.target.value))}
                  className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Break Duration */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-500">Break Duration (minutes)</label>
                <input
                  type="number"
                  value={setting.breakDuration}
                  onChange={(e) => handleChange("breakDuration", Number(e.target.value))}
                  className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Goal Pomodoros */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-500">Goal Pomodoros</label>
                <input
                  type="number"
                  value={setting.goalPomodoros}
                  onChange={(e) => handleChange("goalPomodoros", Number(e.target.value))}
                  className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Auto Start */}
              <div className="mb-4 flex items-center justify-between">
                <label className="text-sm font-medium text-gray-500">Auto Start</label>
                <Switch
                  checked={setting.isAutoStart}
                  onCheckedChange={(checked) => handleChange("isAutoStart", checked)}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Timer;
