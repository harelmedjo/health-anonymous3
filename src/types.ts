export type Language = "en" | "fr";

export type View = "splash" | "language_select" | "register" | "explore" | "chat" | "groups" | "profile" | "condition_detail" | "anonymity_guide" | "admin" | "medications" | "medication_detail" | "direct_messages" | "notifications";

export interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
}

export interface Condition {
  id: string;
  nameEn: string;
  nameFr: string;
  category: string;
  descriptionEn: string;
  descriptionFr: string;
  membersCount: string;
  resourcesCountEn: string;
  resourcesCountFr: string;
  icon: string; // Material symbol icon name
}

export interface Medication {
  id: string;
  nameEn: string;
  nameFr: string;
  usageEn: string;
  usageFr: string;
  dosageEn: string;
  dosageFr: string;
  sideEffectsEn: string;
  sideEffectsFr: string;
  warningsEn: string;
  warningsFr: string;
  category: string;
}

export interface PrivateMessage {
  id: string;
  chatId: string;
  senderAlias: string;
  recipientAlias: string;
  content: string;
  timestamp: string;
  mediaUrl?: string;
}

export interface DirectChat {
  id: string;
  peerAlias: string;
  lastMessage: string;
  timestamp: string;
}

export interface AppNotification {
  id: string;
  titleEn: string;
  titleFr: string;
  contentEn: string;
  contentFr: string;
  timestamp: string;
  isRead: boolean;
}

export interface GroupPost {
  id: string;
  conditionId: string;
  authorAlias: string;
  content: string;
  timestamp: string;
  likes: number;
  commentsCount: number;
  status?: "pending" | "approved" | "rejected";
  imageUrl?: string;
}

export interface GroupComment {
  id: string;
  postId: string;
  authorAlias: string;
  content: string;
  timestamp: string;
  imageUrl?: string;
}

export interface UserAccount {
  username?: string;
  password?: string;
  isRegistered: boolean;
  anonymousAlias: string;
  preferredLanguage: Language;
}

