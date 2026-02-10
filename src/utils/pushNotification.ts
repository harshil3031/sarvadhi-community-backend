import { PushToken } from '../db/models/index.js';
import { getFirebaseAdmin } from './firebaseAdmin.js';

interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
}

export const sendPushNotification = async (
  userId: string,
  payload: PushPayload
): Promise<void> => {
  // Get active push tokens
  const tokens = await PushToken.findAll({
    where: {
      userId,
      isActive: true,
    },
  });

  if (!tokens.length) return;

  const app = getFirebaseAdmin();
  const messaging = app.messaging();

  const registrationTokens = tokens.map(t => t.token);

  if (!registrationTokens.length) return;

  const dataPayload: Record<string, string> = {};
  if (payload.data) {
    for (const [key, value] of Object.entries(payload.data)) {
      dataPayload[key] = typeof value === 'string' ? value : JSON.stringify(value);
    }
  }

  try {
    const response = await messaging.sendEachForMulticast({
      tokens: registrationTokens,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: dataPayload,
      android: {
        priority: 'high',
        notification: {
          channelId: 'default',
          sound: 'default',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    });

    response.responses.forEach((res, idx) => {
      if (!res.success) {
        const errorCode = (res.error as any)?.code;
        if (errorCode === 'messaging/registration-token-not-registered') {
          tokens[idx].isActive = false;
          tokens[idx].save().catch(() => undefined);
        }
      }
    });
  } catch (error) {
    console.error('FCM push notification error:', error);
  }
};
