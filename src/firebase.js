import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

// Default Firebase Configuration (Can be customized via UI settings)
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: ''
};

const FIREBASE_CONFIG_KEY = 'WEB_TRANSAKSI_FIREBASE_CONFIG_V1';

export const getSavedFirebaseConfig = () => {
  const saved = localStorage.getItem(FIREBASE_CONFIG_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse saved Firebase config', e);
    }
  }
  return DEFAULT_FIREBASE_CONFIG;
};

export const saveFirebaseConfig = (config) => {
  localStorage.setItem(FIREBASE_CONFIG_KEY, JSON.stringify(config));
};

let app = null;
let db = null;

try {
  const config = getSavedFirebaseConfig();
  if (config && config.projectId && !config.projectId.includes('demo')) {
    app = initializeApp(config);
    db = getFirestore(app);
  }
} catch (err) {
  console.warn('Firebase init fallback to LocalStorage mode:', err);
}

// Function to push full state to Cloud Firestore
export const pushToCloudFirestore = async (fullData) => {
  if (!db) return false;
  try {
    const docRef = doc(db, 'konveksi_store', 'main_data');
    await setDoc(docRef, { ...fullData, updatedAt: new Date().toISOString() });
    return true;
  } catch (err) {
    console.error('Error syncing to Firebase Cloud:', err);
    return false;
  }
};

// Function to listen for live real-time changes across all connected devices
export const subscribeToCloudFirestore = (onDataReceived) => {
  if (!db) return () => {};
  try {
    const docRef = doc(db, 'konveksi_store', 'main_data');
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const cloudData = snapshot.data();
          if (cloudData.orders && cloudData.inventory) {
            onDataReceived(cloudData);
          }
        }
      },
      (error) => {
        console.warn('Cloud listener error:', error);
      }
    );
  } catch (e) {
    console.warn('Cloud listener exception:', e);
    return () => {};
  }
};
