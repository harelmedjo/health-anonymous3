import test from "node:test";
import assert from "node:assert/strict";
import { getNewNotifications, getNotificationText } from "./notifications";
import type { AppNotification } from "./types";

const baseNotification: AppNotification = {
  id: "n1",
  titleEn: "New post",
  titleFr: "Nouveau message",
  contentEn: "A new post was published",
  contentFr: "Une nouvelle publication a été publiée",
  timestamp: "Just now",
  isRead: false
};

test("getNewNotifications returns only unseen ids", () => {
  const previousIds = new Set(["n1"]);
  const notifications = [
    baseNotification,
    { ...baseNotification, id: "n2", isRead: false },
    { ...baseNotification, id: "n3", isRead: true }
  ];

  const result = getNewNotifications(previousIds, notifications);
  assert.deepEqual(result.map((item) => item.id), ["n2"]);
});

test("getNotificationText chooses the right language", () => {
  const result = getNotificationText(baseNotification, "fr");
  assert.equal(result.title, "Nouveau message");
  assert.equal(result.body, "Une nouvelle publication a été publiée");
});
