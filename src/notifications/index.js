import PushNotification from 'react-native-push-notification';

const REMINDER_CHANNEL_ID = 'reminder';

export function createReminderChannel() {
  return PushNotification.createChannel(
    {
      channelId: REMINDER_CHANNEL_ID, // (required)
      channelName: 'Recordatorio', // (required)
      channelDescription: 'Notificaciones', // (optional) default: undefined.
      playSound: true, // (optional) default: true
      soundName: 'default', // (optional) See `soundName` parameter of `localNotification` function
      importance: 4, // (optional) default: 4. Int value of the Android notification importance
      vibrate: true, // (optional) default: true. Creates the default vibration patten if true.
    }, // (optional) callback returns whether the channel was created, false means it already existed.
  );
}

export function pushReminderNotification(message, date) {
  return PushNotification.localNotificationSchedule({
    channelId: REMINDER_CHANNEL_ID, // required
    message: message, // (required)
    date: date, // new Date(Date.now() + 1 * 1000), // in miliseconds
    allowWhileIdle: true, // (optional) set notification to work while on doze, default: false
  });
}

export function removeAllNotifications() {
  PushNotification.cancelAllLocalNotifications();
}
