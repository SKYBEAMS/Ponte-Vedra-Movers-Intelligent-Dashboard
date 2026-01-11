import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDDMT5Hng8OSc20ceODfL1kEmTttZlvl6A",
  authDomain: "mover-dashboard.firebaseapp.com",
  databaseURL: "https://mover-dashboard-default-rtdb.firebaseio.com",
  projectId: "mover-dashboard",
  storageBucket: "mover-dashboard.firebasestorage.app",
  messagingSenderId: "1039656026314",
  appId: "1:1039656026314:web:d5a6f7182a25d1889b3433"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);