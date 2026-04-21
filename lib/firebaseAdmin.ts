import admin from "firebase-admin";
import serviceAccount from "./serviceAccountKey.json";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    databaseURL: "https://tugas-akhir-aedf4-default-rtdb.asia-southeast1.firebasedatabase.app",
  });
}

export default admin;