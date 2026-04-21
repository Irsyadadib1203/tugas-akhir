import { NextResponse } from "next/server";
import admin from "@/lib/firebaseAdmin";
import { DataSnapshot } from "firebase-admin/database";

export async function GET() {
  try {
    const now = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
    );

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    const yDate = yesterday.toISOString().split("T")[0];

    const date = now.toISOString().split("T")[0];
    const hour = String(now.getHours()).padStart(2, "0");

    const db = admin.database();
    const fs = admin.firestore();

    const minute = now.getMinutes();
    if (minute > 2) {
      console.log("Skip (not top of hour)");
      return NextResponse.json({ message: "Skip (not top of hour)" });
    }

    const snapshot = await db.ref(`/logs/${date}/${hour}`).once("value");

    if (!snapshot.exists()) {
      return NextResponse.json({ message: "No data" });
    }

    let totalTemp = 0;
    let totalPh = 0;
    let totalTurb = 0;
    let count = 0;

    snapshot.forEach((child: DataSnapshot) => {
      const data = child.val();
      totalTemp += data.suhu || 0;
      totalPh += data.ph || 0;
      totalTurb += data.turbidity || 0;
      count++;
    });

    if (count === 0) {
      return NextResponse.json({ message: "Empty data" });
    }

    const avgData = {
      suhu: totalTemp / count,
      ph: totalPh / count,
      turbidity: totalTurb / count,
      count,
      date,
      hour,
      createdAt: new Date().toISOString(),
    };

    // 🔥 SIMPAN KE FIRESTORE
    const docRef = fs
      .collection("history")
      .doc(date)
      .collection("hours")
      .doc(hour);

    await fs.collection("history").doc(date).set(
      {
        date: date,
      },
      { merge: true }
    );

    const docSnap = await docRef.get();

    if (docSnap.exists) {
      console.log("Already aggregated");
      return NextResponse.json({ message: "Already aggregated" });
    }
    await docRef.set(avgData, { merge: true });
    console.log(`Aggregate ${date} ${hour} sukses`);

    // hapus logs kemarin (kalau ada)
    if (hour === "00" && minute <= 2) {
      const yesterdayRef = db.ref(`/logs/${yDate}`);
      const snapYesterday = await yesterdayRef.once("value");

      if (snapYesterday.exists()) {
        await yesterdayRef.remove();
        console.log(`Logs ${yDate} dihapus`);
      }
    }
    return NextResponse.json({
      success: true,
      data: avgData,
    });
    
  } catch (err) {
    console.error("AGGREGATE ERROR:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}