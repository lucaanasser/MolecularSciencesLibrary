export type Notification = {
  id: string | number;
  message: string;
  date: string;
  read: boolean;
  type?: string;
  metadata?: any;
};