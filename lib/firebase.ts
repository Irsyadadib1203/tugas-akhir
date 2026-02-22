import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCLSGw-rgl0mLK-lFl3z3FI-P6Sir07Enk",
  authDomain: "tugas-akhir-aedf4.firebaseapp.com",
  databaseURL: "https://tugas-akhir-aedf4-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tugas-akhir-aedf4",
  storageBucket: "tugas-akhir-aedf4.firebasestorage.app",
  messagingSenderId: "552036437399",
  appId: "1:552036437399:web:504074e3e521be3808c8d2"
};


const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
