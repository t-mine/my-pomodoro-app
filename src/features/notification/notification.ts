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