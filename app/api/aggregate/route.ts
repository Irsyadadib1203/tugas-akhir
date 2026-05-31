import { NextResponse } from "next/server";
import admin from "@/lib/firebaseAdmin";

export async function GET() {
  try {
    const db = admin.database();
    const fs = admin.firestore();

    const snapshot = await db.ref("/logs").once("value");

    if (!snapshot.exists()) {
      return NextResponse.json({ message: "No logs found" });
    }

    const logs = snapshot.val();

    for (const date in logs) {
      let allHoursMigrated = true;

      // ✅ pastikan parent document ada
      await fs.collection("history").doc(date).set(
        { date },
        { merge: true }
      );

      for (const hour in logs[date]) {
        const hourRef = logs[date][hour];

        let totalTemp = 0;
        let totalPh = 0;
        let totalTurb = 0;
        let count = 0;

        for (const minute in hourRef) {
          const data = hourRef[minute];

          totalTemp += data.suhu || 0;
          totalPh += data.ph || 0;
          totalTurb += data.turbidity || 0;
          count++;
        }

        if (count === 0) continue;

        const avgData = {
          suhu: totalTemp / count,
          ph: totalPh / count,
          turbidity: totalTurb / count,
          count,
          date,
          hour,
          createdAt: new Date().toISOString(),
        };

        const docRef = fs
          .collection("history")
          .doc(date)
          .collection("hours")
          .doc(hour);

        const docSnap = await docRef.get();

        if (!docSnap.exists) {
          try {
            await docRef.set(avgData, { merge: true });
            console.log(`Migrated ${date} ${hour}`);
          } catch (err) {
            console.error(`Gagal migrate ${date} ${hour}`, err);
            allHoursMigrated = false;
          }
        } else {
          console.log(`Skip ${date} ${hour}`);
        }
      }

      // 🔥 HAPUS LOGS PER TANGGAL (AMAN)
      if (allHoursMigrated) {
        await db.ref(`/logs/${date}`).remove();
        console.log(`Logs ${date} dihapus`);
      } else {
        console.log(`Logs ${date} TIDAK dihapus (masih ada error)`);
      }
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("MIGRATION ERROR:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}