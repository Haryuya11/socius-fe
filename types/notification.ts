
export enum DomainTypes {
  MESSAGE = "MESSAGE",
  NOTIFICATION = "NOTIFICATION",
  SYSTEM = "SYSTEM",
}

export enum EventTypes {
  NEW_MESSAGE = "NEW_MESSAGE",
  MESSAGE_UPDATED = "MESSAGE_UPDATED",
  MESSAGE_DELETED = "MESSAGE_DELETED",
  TYPING_INDICATOR = "TYPING_INDICATOR",

  REACTION_ADDED = "REACTION_ADDED",
  REACTION_REMOVED = "REACTION_REMOVED",

  NEW_NOTIFICATION = "NEW_NOTIFICATION",
  SYSTEM_BROADCAST = "SYSTEM_BROADCAST",
}

export interface WsNotificationPayload {
  notificationId: string | number;
  title: string;
  content: string;
  redirectUrl?: string;
  createdAt?: string;
  senderName?: string;
  senderAvatar?: string;
}

export interface NotificationMessage {
  id: number | string;
  title: string;
  content: string;
  redirectUrl?: string;
  isRead: number;
  createdAt: string;
  deliveryType?: number;
}

export interface WebSocketMessage<T> {
  domain: DomainTypes;
  type: EventTypes;
  data: T;
}
