import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, off } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBwl9U2werI16C9zRhzb3WMHqFGjrJrm68",
  authDomain: "aquatech-monitoring.firebaseapp.com",
  databaseURL: "https://aquatech-monitoring-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "aquatech-monitoring",
  storageBucket: "aquatech-monitoring.firebasestorage.app",
  messagingSenderId: "81111367204",
  appId: "1:81111367204:android:4ab3a75415e7034d3262b1",
  measurementId: "G-ABC123DEF45"
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);
export const auth = getAuth(app);
export { ref, onValue, off };
