import admin from 'firebase-admin';
import fs from 'fs';

let app: admin.app.App | null = null;

const loadServiceAccount = (): admin.ServiceAccount => {
  const jsonEnv = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const pathEnv = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

  if (jsonEnv) {
    return JSON.parse(jsonEnv) as admin.ServiceAccount;
  }

  if (!pathEnv) {
    throw new Error('Missing FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_JSON');
  }

  const raw = fs.readFileSync(pathEnv, 'utf8');
  return JSON.parse(raw) as admin.ServiceAccount;
};

export const getFirebaseAdmin = (): admin.app.App => {
  if (app) return app;

  const serviceAccount = loadServiceAccount();

  app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  return app;
};