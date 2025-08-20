export const EXCHANGES = {
  ORDER_EXCHANGE: 'order_exchange',
  NOTIFICATION_EXCHANGE: 'notification_exchange',
  INVENTORY_EXCHANGE: 'inventory_exchange',
} as const;

export const ROUTING_KEYS = {
  ORDER_CREATED: 'order.created',
  ORDER_UPDATED: 'order.updated',
  ORDER_CANCELLED: 'order.cancelled',
  ORDER_SHIPPED: 'order.shipped',
  ORDER_DELIVERED: 'order.delivered',
  PAYMENT_COMPLETED: 'payment.completed',
  PAYMENT_FAILED: 'payment.failed',
  INVENTORY_RESERVED: 'inventory.reserved',
  INVENTORY_RELEASED: 'inventory.released',
  NOTIFICATION_EMAIL: 'notification.email',
  NOTIFICATION_SMS: 'notification.sms',
} as const;

export const QUEUES = {
  ORDER_PROCESSING: 'order_processing',
  ORDER_NOTIFICATION: 'order_notification', 
  INVENTORY_UPDATE: 'inventory_update',
  EMAIL_NOTIFICATION: 'email_notification',
  SMS_NOTIFICATION: 'sms_notification',
} as const;