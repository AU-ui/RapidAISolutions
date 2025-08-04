const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// Note: You'll need to download your service account key from Firebase Console
// and place it in the backend folder as 'serviceAccountKey.json'

let serviceAccount;
try {
  serviceAccount = require('./serviceAccountKey.json');
} catch (error) {
  console.log('Service account key not found. Please add serviceAccountKey.json to the backend folder.');
  console.log('You can download it from Firebase Console > Project Settings > Service Accounts');
}

// Initialize Firebase Admin
const initializeFirebase = () => {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'rapid-ai-solutions-client.firebasestorage.app'
    });
  }
  return admin;
};

// Get Firestore instance
const getFirestore = () => {
  const admin = initializeFirebase();
  return admin.firestore();
};

// Get Auth instance
const getAuth = () => {
  const admin = initializeFirebase();
  return admin.auth();
};

// Get Storage instance
const getStorage = () => {
  const admin = initializeFirebase();
  return admin.storage();
};

module.exports = {
  initializeFirebase,
  getFirestore,
  getAuth,
  getStorage,
  admin
}; 