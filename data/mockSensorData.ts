// Generate realistic mock sensor data (sesuai Firebase Kolam)

export interface SensorReading {
  timestamp: Date;
  ph: number;
  suhu: number;            // suhu air (°C)
  ntu: number;             // kekeruhan (NTU)
  jarak_air_cm: number;    // ketinggian air (cm), -1 = error sensor
}

export interface DailyData {
  date: string;
  readings: SensorReading[];
  averages: {
    ph: number;
    suhu: number;
    ntu: number;
    jarak_air_cm: number;
  };
}

/* =========================
   Generate hourly readings
========================= */
const generateDayReadings = (date: Date): SensorReading[] => {
  const readings: SensorReading[] = [];

  for (let hour = 0; hour < 24; hour++) {
    const timestamp = new Date(date);
    timestamp.setHours(hour, 0, 0, 0);

    const jarak =
      Math.random() < 0.05
        ? -1 // simulasi error ultrasonic
        : 25 + Math.random() * 30; // 25 – 55 cm

    readings.push({
      timestamp,
      ph: 6.8 + Math.random() * 1.4,          // 6.8 – 8.2
      suhu: 26 + Math.random() * 4,           // 26 – 30 °C
      ntu: 500 + Math.random() * 2500,        // 500 – 3000 NTU
      jarak_air_cm: jarak,
    });
  }

  return readings;
};

/* =========================
   Calculate averages
   (abaikan jarak = -1)
========================= */
const calculateAverages = (readings: SensorReading[]) => {
  const validJarak = readings.filter(r => r.jarak_air_cm !== -1);

  const total = readings.reduce(
    (acc, r) => {
      acc.ph += r.ph;
      acc.suhu += r.suhu;
      acc.ntu += r.ntu;
      return acc;
    },
    { ph: 0, suhu: 0, ntu: 0 }
  );

  const totalJarak = validJarak.reduce(
    (sum, r) => sum + r.jarak_air_cm,
    0
  );

  const count = readings.length;

  return {
    ph: total.ph / count,
    suhu: total.suhu / count,
    ntu: total.ntu / count,
    jarak_air_cm:
      validJarak.length > 0
        ? totalJarak / validJarak.length
        : -1,
  };
};

/* =========================
   Generate historical data
========================= */
export const generateHistoricalData = (days: number): DailyData[] => {
  const data: DailyData[] = [];
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const readings = generateDayReadings(date);

    data.push({
      date: date.toISOString().split('T')[0],
      readings,
      averages: calculateAverages(readings),
    });
  }

  return data;
};

/* =========================
   Today readings (chart)
========================= */
export const getTodayReadings = (): SensorReading[] => {
  return generateDayReadings(new Date());
};

/* =========================
   Current realtime reading
========================= */
export const getCurrentReadings = (): SensorReading => {
  return {
    timestamp: new Date(),
    ph: 7.2 + (Math.random() - 0.5) * 0.6,      // ~6.9 – 7.5
    suhu: 28 + (Math.random() - 0.5) * 1.5,    // ~27 – 29
    ntu: 1500 + (Math.random() - 0.5) * 1000,  // ~1000 – 2000
    jarak_air_cm:
      Math.random() < 0.05
        ? -1
        : 35 + (Math.random() - 0.5) * 10,
  };
};

/* =========================
   Pre-generated data
========================= */
export const historicalData = generateHistoricalData(30);

/* =========================
   Date formatter (ID)
========================= */
export const formatDateIndonesian = (
  dateString: string
): { day: string; date: number; month: string; year: number } => {
  const date = new Date(dateString);

  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];

  return {
    day: days[date.getDay()],
    date: date.getDate(),
    month: months[date.getMonth()],
    year: date.getFullYear(),
  };
};
