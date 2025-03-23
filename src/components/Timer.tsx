import React, { useState, useEffect } from 'react';
import { useTimer } from 'react-timer-hook';
import * as notification from '../features/notification/notification';
import * as bgm from '../features/bgm/bgm'; 
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch";
import Radio from "@/components/ui/radio";

type TimerMode = 'work' | 'break' | 'done';
type NotificationMode = 'sound'  | 'desktop';
type BgmMode = 'off' | 'white' | 'pink' | 'brown';

interface PomodoroState {
  mode: TimerMode;
  completedCount: number;
  isPaused: boolean;
}

interface SettingsState {
  workDurationMinutes: number;
  breakDurationMinutes: number;
  goalPomodoros: number;
  isAutoStart: boolean;
  notificationMode: NotificationMode;
  bgm: BgmMode;
}

const Timer: React.FC = () => {

  const [setting, setSetting] = useState<SettingsState>({
    workDurationMinutes: 25,
    breakDurationMinutes: 5,
    goalPomodoros: 4,
    isAutoStart: false,
    notificationMode: 'sound',
    bgm: 'off'
  });

  const [pomodoroState, setPomodoroState] = useState<PomodoroState>({
    mode: 'work',
    completedCount: 0,
    isPaused: false
  });

  useEffect(() => {
    // 設定をlocalStorageから読み込む
    const savedSettings = localStorage.getItem('pomodoro-settings');
    if (savedSettings) {
      setSetting(JSON.parse(savedSettings));
    }
  }, []);

  useEffect(() => {
    // 設定をlocalStorageに保存する
    localStorage.setItem('pomodoro-settings', JSON.stringify(setting));
    // 通知許可
    if (setting.notificationMode === 'desktop') {
      notification.requestNotificationPermission();
    }
    // Timerをリセットする
    onReset();
  }, [setting]);

  const { seconds, minutes, isRunning, start, pause, restart, resume } = useTimer({
    expiryTimestamp: getExpiryDateFromDurationMinutes(getTimerDurationMinutes()),
    autoStart: false,
    onExpire: onExpire,
  });

  function getTimerDurationMinutes () : number {
    return pomodoroState.mode === "work"
      ? setting.workDurationMinutes 
      : setting.breakDurationMinutes
  };

  function getExpiryDateFromDurationMinutes (durationMinutes : number): Date {
    return new Date(Date.now() + durationMinutes * 1000 * 60);
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
    if (nextMode !== "done") {
      const duration = isWorkMode ? setting.breakDurationMinutes : setting.workDurationMinutes;
      // restartはイベントハンドラ以外ではsetTimeoutを使用しないと動作しない
      setTimeout(() => restart(getExpiryDateFromDurationMinutes(duration), setting.isAutoStart),1);
    }

    sendNotification(setting.notificationMode, nextMode);
  };

  function sendNotification(notificationMode: NotificationMode, timerMode: TimerMode)
  {
    switch(notificationMode)
    {
      case 'sound':
        switch(timerMode) {
          case "work":
            notification.playSound();
            break;
          case "break":
            notification.playSound();
            break;
          case "done":
            notification.playSound();
            break;
        }
        break;
      case 'desktop':
        switch(timerMode) {
          case "work":
            notification.sendNotification("pomodoro timer", "end breaking");
            break;
          case "break":
            notification.sendNotification("pomodoro timer", "end working");
            break;
          case "done":
            notification.sendNotification("pomodoro timer", "complete!");
            break;
        }
        break;
    }
  }

  function handleStart () {
    bgm.playSound(setting.bgm);
    start();
  }

  function onReset () {
    setPomodoroState((prevState)=>({...prevState, mode: "work", completedCount: 0, isPaused: false}));
    restart(getExpiryDateFromDurationMinutes(setting.workDurationMinutes), false)
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

  function handleOptionChange (key: keyof SettingsState, value: number | boolean | string) {
    setSetting((prev) => ({ ...prev, [key]: value }));
  };

  const notificationModeOptions = [
    { value: 'sound', label: 'Sound' },
    { value: 'desktop', label: 'Desktop' },
  ];

  const bgmModeOptions = [
    { value: 'off', label: 'Off' },
    { value: 'white', label: 'White' },
    { value: 'pink', label: 'Pink' },
    { value: 'brown', label: 'Brown' },
  ];

  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center bg-gray-800">
      <div className="text-center">
        {/* time */}
        <div className="text-8xl font-bold mb-4 text-white">{formatTime(minutes, seconds)}</div>
        {/* buttons */}
        <div className="space-x-2">
          {/* resume button / start button / stop button */}
          {!isRunning ? (
            <button onClick={pomodoroState.isPaused ? onResume : handleStart} 
              className="bg-teal-700 text-white w-[7.5rem] px-4 py-2 rounded disabled:bg-gray-600 disabled:cursor-not-allowed" 
              disabled={pomodoroState.mode === "done"}>
              {pomodoroState.isPaused ? "Resume" : "Start"}
            </button>
          ) : (
            <button onClick={onPause} className="bg-amber-700 text-white w-[7.5rem] px-4 py-2 rounded">
              Stop
            </button>
          )}
          {/* reset button */}
          <button onClick={onReset} className="bg-rose-700 text-white w-[7.5rem] px-4 py-2 rounded">
            Reset
          </button>
        </div>
        {/* completed pomodoros */}
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
                  value={setting.workDurationMinutes}
                  onChange={(e) => handleOptionChange("workDurationMinutes", Number(e.target.value))}
                  className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {/* Break Duration */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-500">Break Duration (minutes)</label>
                <input
                  type="number"
                  value={setting.breakDurationMinutes}
                  onChange={(e) => handleOptionChange("breakDurationMinutes", Number(e.target.value))}
                  className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {/* Goal Pomodoros */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-500">Goal Pomodoros</label>
                <input
                  type="number"
                  value={setting.goalPomodoros}
                  onChange={(e) => handleOptionChange("goalPomodoros", Number(e.target.value))}
                  className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {/* Auto Start */}
              <div className="mb-4">
                <label className="block mb-1 text-sm font-medium text-gray-500">Auto Start</label>
                <Switch
                  checked={setting.isAutoStart}
                  onCheckedChange={(checked) => handleOptionChange("isAutoStart", checked)}
                />
              </div>
              {/* Notification Mode */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-500">Notification</label>
                <Radio
                  name="notificationMode"
                  selectedValue={setting.notificationMode}
                  onChange={e => handleOptionChange("notificationMode", e.target.value)}
                  options={notificationModeOptions}
                />
              </div>
              {/* Bgm */}
              <div>
                <label className="block text-sm font-medium text-gray-500">Bgm</label>
                <Radio
                  name="bgmMode"
                  selectedValue={setting.bgm}
                  onChange={e => handleOptionChange("bgm", e.target.value)}
                  options={bgmModeOptions}
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
