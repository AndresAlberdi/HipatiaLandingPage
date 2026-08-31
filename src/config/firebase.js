import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';

const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "hipatia-landing-page",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:634519644312:web:bcf91db9e61f2b401488ed",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "hipatia-landing-page.firebasestorage.app",
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDlj_ZK80nu4UO-sAMel6Qd7BSXukCGpDQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "hipatia-landing-page.firebaseapp.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "634519644312",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-K01K3MLE4W"
};

export const app = initializeApp(firebaseConfig);

// Initialize App Check only in browser environment
export let appCheck = null;
if (typeof document !== 'undefined') {
  appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider('6LcA1KEtAAAAAL8Yyw-wtHno1lMyBdI_BbVLzn85'),
    isTokenAutoRefreshEnabled: true
  });
}

export const db = getFirestore(app);
