import { AppNotification, Language } from "./types";

export function getNewNotifications(previousIds: ReadonlySet<string>, notifications: AppNotification[]) {
  return notifications.filter((notification) => !notification.isRead && !previousIds.has(notification.id));
}

export function getNotificationText(notification: AppNotification, lang: Language) {
  return {
    title: lang === "fr" ? notification.titleFr : notification.titleEn,
    body: lang === "fr" ? notification.contentFr : notification.contentEn
  };
}

export async function requestBrowserNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }

  if (Notification.permission === "granted") {
    return "granted";
  }

  if (Notification.permission === "denied") {
    return "denied";
  }

  return Notification.requestPermission();
}

export function showBrowserNotification(notification: AppNotification, lang: Language) {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return;
  }

  if (Notification.permission !== "granted") {
    return;
  }

  const { title, body } = getNotificationText(notification, lang);
  new Notification(title, {
    body,
    tag: notification.id
  });
}
