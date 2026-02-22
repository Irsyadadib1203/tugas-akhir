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
import { getTodayReadings, SensorReading } from '@/data/mockSensorData';
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

  const [todayData] = useState<SensorReading[]>(getTodayReadings());
  const [current, setCurrent] = useState<FirebaseSensorData | null>(null);

  const [waterFilling, setWaterFilling] = useState(false);
  const [waterDraining, setWaterDraining] = useState(false);

  /* =============================
     Firebase realtime listener
  ============================= */
  useEffect(() => {
  const rootRef = ref(db, '/');

  const unsubscribe = onValue(rootRef, (snapshot) => {
    if (!snapshot.exists()) return;

    const data = snapshot.val();

    // SENSOR (dari kolam)
    setCurrent({
      ph: data.kolam?.ph ?? 0,
      suhu: data.kolam?.suhu ?? 0,
      ntu: data.kolam?.ntu ?? 0,
      jarak_air_cm: data.kolam?.jarak_air_cm ?? -1,
    });

    // KONTROL (root level)
    setWaterFilling(!!data.kontrol?.inlet);
    setWaterDraining(!!data.kontrol?.outlet);

    // DEBUG (boleh dihapus)
    console.log('OUTLET:', data.kontrol?.outlet);
  });

  return () => unsubscribe();
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
          {/* <SensorChart title="pH" data={todayData} dataKey="ph" unit="pH" /> */}
          {/* <SensorChart title="Suhu" data={todayData} dataKey="suhu" unit="°C" />
          <SensorChart title="Kekeruhan" data={todayData} dataKey="ntu" unit="NTU" /> */}
        </div>
      </div>
    </div>
  );
}
