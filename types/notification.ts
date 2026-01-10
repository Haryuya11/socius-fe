export enum EventTypes {
  NOTIFICATION = "NOTIFICATION",
  CHAT = "CHAT",
}

export interface NotificationPayload {
  title: string;
  content: string;
  linkUrl?: string;
}

export interface NotificationMessage {
  id: number;
  receiverId: string;
  deliveryType: number;
  payload: NotificationPayload;
  isRead: number;
  createdAt: string;
}

export interface WebSocketMessage<T> {
  type: EventTypes;
  data: T;
}
