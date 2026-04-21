'use client';

import { useState, useEffect } from 'react';
import {
  Thermometer,
  Droplet,
  Eye,
  Waves,
  ArrowUpCircle,
  ArrowDownCircle
} from 'lucide-react';

import { SensorCard } from '@/components/dashboard/SensorCard';
import { SensorChart } from '@/components/dashboard/SensorChart';
import {  SensorReading } from '@/data/mockSensorData';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';


/* =============================
   Firebase data interface
============================= */
interface FirebaseSensorData {
  ph: number;
  suhu: number;
  ntu: number;
  jarak_air_cm: number;
}
interface LogItem {
  ph: number;
  suhu: number;
  turbidity: number;
  jarak_air_cm?: number;
}

/* =============================
   Sensor status helper
============================= */
const getSensorStatus = (
  type: 'ph' | 'suhu' | 'ntu' | 'level',
  value: number
): 'normal' | 'warning' | 'danger' => {

  if (value === -1) return 'danger';

  switch (type) {
    case 'ph':
      if (value >= 6.5 && value <= 8.5) return 'normal';
      if (value >= 6.0 && value <= 9.0) return 'warning';
      return 'danger';

    case 'suhu':
      if (value >= 26 && value <= 30) return 'normal';
      if (value >= 24 && value <= 32) return 'warning';
      return 'danger';

    case 'ntu':
      if (value <= 1000) return 'normal';
      if (value <= 2000) return 'warning';
      return 'danger';

    case 'level':
      if (value >= 25 && value <= 50) return 'normal';
      if (value >= 20 && value <= 55) return 'warning';
      return 'danger';

    default:
      return 'normal';
  }
};

export default function Dashboard() {

  const [todayData, setTodayData] = useState<SensorReading[]>([]);
  const [current, setCurrent] = useState<FirebaseSensorData | null>(null);

  const [waterFilling, setWaterFilling] = useState(false);
  const [waterDraining, setWaterDraining] = useState(false);
  
  


  /* =============================
     Firebase realtime listener
  ============================= */
  useEffect(() => {

    // SENSOR (dari kolam)
    const kolamRef = ref(db, '/kolam');
    const unsubKolam = onValue(kolamRef, (snap) => {
      const data = snap.val();
      if (!data) return;

      setCurrent({
        ph: data.ph ?? 0,
        suhu: data.suhu ?? 0,
        ntu: data.ntu ?? 0,
        jarak_air_cm: data.jarak_air_cm ?? -1,
      });
     
    });

    // KONTROL (root level)
    const kontrolRef = ref(db, '/kontrol');
    const unsubKontrol = onValue(kontrolRef, (snap) => {
      const data = snap.val();
      setWaterFilling(!!data?.inlet);
      setWaterDraining(!!data?.outlet);
    });

    // =====================
    // 📊 AMBIL LOGS HARI INI
    // =====================
    const today = new Date().toLocaleDateString("en-CA", {timeZone: "Asia/Jakarta"});
    const logsRef = ref(db, `/logs/${today}`);
    const unsubLogs = onValue(logsRef, (snapshot) => {
    if (!snapshot.exists()) {
      setTodayData([]);
      return;
    }

    const logs = snapshot.val();
    const readings: SensorReading[] = [];

        Object.entries(logs).forEach(([hour, hourData]) => {
      Object.entries(hourData as Record<string, LogItem>).forEach(
        ([minute, item]) => {
          readings.push({
            timestamp: new Date(`${today}T${hour}:${minute}:00+07:00`),
            ph: item.ph,
            suhu: item.suhu,
            ntu: item.turbidity,
            jarak_air_cm: item.jarak_air_cm ?? -1,
          });
        }
      );
    });
    console.log("READINGS:", readings);
    const MAX_POINTS = 100;

    readings.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    const finalData =
      readings.length > MAX_POINTS
        ? readings.slice(-MAX_POINTS)
        : readings;

    setTodayData(finalData);
  });

  return () => {
    unsubKolam();
    unsubKontrol();
    unsubLogs();
  };
}, []);




  if (!current) {
    return <p className="text-muted-foreground">Menghubungkan ke Firebase...</p>;
  }

  /* =============================
     Sensor cards config
  ============================= */
  const sensors = [
    {
      title: 'Sensor pH',
      value: current.ph,
      unit: 'pH',
      icon: Droplet,
      colorClass: 'bg-sensor-ph',
      status: getSensorStatus('ph', current.ph),
    },
    {
      title: 'Suhu Air',
      value: current.suhu,
      unit: '°C',
      icon: Thermometer,
      colorClass: 'bg-sensor-temperature',
      status: getSensorStatus('suhu', current.suhu),
    },
    {
      title: 'Kekeruhan Air',
      value: current.ntu,
      unit: 'NTU',
      icon: Eye,
      colorClass: 'bg-sensor-turbidity',
      status: getSensorStatus('ntu', current.ntu),
    },
    {
      title: 'Ketinggian Air',
      value: current.jarak_air_cm,
      unit: 'cm',
      icon: Waves,
      colorClass: 'bg-sensor-level',
      status: getSensorStatus('level', current.jarak_air_cm),
    },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Monitoring kualitas air kolam lele secara real-time
        </p>
      </div>

      {/* Sensor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {sensors.map((sensor) => (
          <SensorCard key={sensor.title} {...sensor} />
        ))}
      </div>

      {/* Water Control Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Inlet */}
        <Card className="shadow-lg">
          <CardContent className="p-6 flex justify-between items-center">
            <div className="flex gap-4 items-center">
              <ArrowUpCircle className={cn(
                "w-10 h-10",
                waterFilling ? "text-success" : "text-muted-foreground"
              )} />
              <div>
                <p className="text-sm text-muted-foreground">Pengisian Air</p>
                <p className="font-bold">{waterFilling ? 'Aktif' : 'Tidak Aktif'}</p>
              </div>
            </div>
            <span className={cn(
              "w-3 h-3 rounded-full",
              waterFilling ? "bg-success animate-pulse" : "bg-muted"
            )} />
          </CardContent>
        </Card>

        {/* Outlet */}
        <Card className="shadow-lg">
          <CardContent className="p-6 flex justify-between items-center">
            <div className="flex gap-4 items-center">
              <ArrowDownCircle className={cn(
                "w-10 h-10",
                waterDraining ? "text-warning" : "text-muted-foreground"
              )} />
              <div>
                <p className="text-sm text-muted-foreground">Pembuangan Air</p>
                <p className="font-bold">{waterDraining ? 'Aktif' : 'Tidak Aktif'}</p>
              </div>
            </div>
            <span className={cn(
              "w-3 h-3 rounded-full",
              waterDraining ? "bg-warning animate-pulse" : "bg-muted"
            )} />
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div>
        <h2 className="font-display text-xl font-semibold mb-4">Grafik Hari Ini</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SensorChart title="pH" data={todayData} dataKey="ph" unit="pH" color="#3b82f6" />
          <SensorChart title="Suhu" data={todayData} dataKey="suhu" unit="°C" color="#ef4444" />
          <SensorChart title="Kekeruhan" data={todayData} dataKey="ntu" unit="NTU" color="#10b981" />
        </div>
      </div>
    </div>
  );
}
