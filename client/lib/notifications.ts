import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleHabitReminder(
  habitId: string,
  habitName: string,
  hour: number,
  minute: number
): Promise<void> {
  const granted = await requestNotificationPermission();
  if (!granted) return;

  await Notifications.cancelScheduledNotificationAsync(habitId);

  await Notifications.scheduleNotificationAsync({
    identifier: habitId,
    content: {
      title: 'Level Up',
      body: `Time for: ${habitName}`,
    },
    trigger: {
      type: 'daily' as const,
      hour,
      minute,
    },
  });
}

export async function cancelHabitReminder(habitId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(habitId);
}
