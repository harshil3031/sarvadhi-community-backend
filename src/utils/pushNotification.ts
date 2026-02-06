import fetch from 'node-fetch';
import { PushToken } from '../db/models/index.js';

interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
}

interface ExpoResponse {
  data?: {
    status?: string;
    details?: {
      error?: string;
    };
  };
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

  for (const tokenRecord of tokens) {
    try {
      const response = await fetch(
        'https://exp.host/--/api/v2/push/send',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: tokenRecord.token,
            sound: 'default',
            ...payload,
          }),
        }
      );

      const result = (await response.json()) as ExpoResponse;

      // Expo may say token is invalid → deactivate it
      if (
        result?.data?.status === 'error' &&
        result?.data?.details?.error === 'DeviceNotRegistered'
      ) {
        tokenRecord.isActive = false;
        await tokenRecord.save();
      }
    } catch (error) {
      console.error('Push notification error:', error);
    }
  }
};
