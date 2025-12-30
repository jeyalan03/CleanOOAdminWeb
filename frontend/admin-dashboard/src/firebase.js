import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCiTfS5lTGPJAROglKf0VvrgmCEB4h0aYY",
  authDomain: "wastemanagementadmin.firebaseapp.com",
  projectId: "wastemanagementadmin",
  storageBucket: "wastemanagementadmin.firebasestorage.app",
  messagingSenderId: "523257367116",
  appId: "1:523257367116:web:7b4a6b4ab4bcdf76cb42e9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
