  export function requestNotificationPermission () {
    if (Notification.permission !== "granted") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          console.log("通知が許可されました！");
        }
      });
    }
  };

  export function sendNotification (title: string, body: string) {
    if (Notification.permission === "granted") {
      new Notification(title, {
        body: body,
        //icon: "/icon.png",
      });
    }
  };

  export function playSound () {
    const audio = new Audio('/sounds/notification-sound.mp3');
    audio.volume = 0.07;
    audio.play();
  };

  export function sendNotificationByMode(notificationMode: NotificationMode, timerMode: TimerMode) {
    switch(notificationMode) {
      case 'sound':
        switch(timerMode) {
          case "work":
            playSound();
            break;
          case "break":
            playSound();
            break;
          case "done":
            playSound();
            break;
        }
        break;
      case 'desktop':
        switch(timerMode) {
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
        break;
    }
  }