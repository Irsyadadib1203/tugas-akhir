'use client'; 
import { useParams, useRouter } from 'next/navigation'; 
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Thermometer, Droplet, Eye } from 'lucide-react';
import { SensorChart } from '@/components/dashboard/SensorChart';

const formatDateIndonesian = (dateString: string) => {
  const date = new Date(dateString);
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return {
    day: days[date.getDay()],
    date: date.getDate(),
    month: months[date.getMonth()],
    year: date.getFullYear()
  };
};

type HistoryItem = {
  hour: string;
  ph: number;
  suhu: number;
  turbidity: number;
};

export default function HistoryDetail() {
  const { date } = useParams<{ date: string }>();
  const router = useRouter();
  const [data, setData] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true); // ✅ mulai true

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const ref = collection(firestore, 'history', date, 'hours');
        const snapshot = await getDocs(ref);

        const result: HistoryItem[] = snapshot.docs.map(doc => {
          const d = doc.data();
          return {
            hour: doc.id,
            ph: d.ph ?? 0,
            suhu: d.suhu ?? 0,
            turbidity: d.turbidity ?? 0,
          };
        });

        result.sort((a, b) => a.hour.localeCompare(b.hour));
        setData(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (date) fetchDetail();
  }, [date]);

  const chartData = data.map(item => ({
    timestamp: `${item.hour}:00`,
    ph: item.ph,
    suhu: item.suhu,
    ntu: item.turbidity
  }));

  const averages = {
    ph: data.reduce((acc, d) => acc + d.ph, 0) / (data.length || 1),
    temperature: data.reduce((acc, d) => acc + d.suhu, 0) / (data.length || 1),
    turbidity: data.reduce((acc, d) => acc + d.turbidity, 0) / (data.length || 1),
  };

  // ✅ Tampilkan loading skeleton terlebih dahulu
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3">
        <span className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-muted-foreground">Memuat data...</p>
      </div>
    );
  }

  // ✅ Baru cek data kosong setelah loading selesai
  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-muted-foreground mb-4">Data tidak ditemukan</p>
        <Button onClick={() => router.push('/history')}>Kembali ke History</Button>
      </div>
    );
  }

  const formattedDate = formatDateIndonesian(date);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/history')}
          className="rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Detail Data Sensor
          </h1>
          <p className="text-muted-foreground">
            {formattedDate.day}, {formattedDate.date} {formattedDate.month} {formattedDate.year}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl p-4 border border-border/50 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sensor-ph flex items-center justify-center">
            <Droplet className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Rata-rata pH</p>
            <p className="text-xl font-bold">{averages.ph.toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border/50 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sensor-temperature flex items-center justify-center">
            <Thermometer className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Rata-rata Suhu</p>
            <p className="text-xl font-bold">{averages.temperature.toFixed(1)}°C</p>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border/50 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sensor-turbidity flex items-center justify-center">
            <Eye className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Rata-rata Kekeruhan</p>
            <p className="text-xl font-bold">{averages.turbidity.toFixed(2)} NTU</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SensorChart
          title="pH Level"
          data={chartData}
          dataKey="ph"
          color="hsl(var(--sensor-ph))"
          unit="pH"
        />
        <SensorChart
          title="Suhu Air"
          data={chartData}
          dataKey="suhu"
          color="hsl(var(--sensor-temperature))"
          unit="°C"
        />
        <SensorChart
          title="Kekeruhan"
          data={chartData}
          dataKey="ntu"
          color="hsl(var(--sensor-turbidity))"
          unit="NTU"
        />
      </div>

      {/* Data Table */}
      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden sensor-card-shadow">
        <div className="p-4 border-b border-border">
          <h2 className="font-display font-semibold text-lg">Data Per Jam</h2>
        </div>
        <div className="max-h-96 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Waktu</TableHead>
                <TableHead className="font-semibold">pH</TableHead>
                <TableHead className="font-semibold">Suhu (°C)</TableHead>
                {/* ✅ Kolom ketinggian dihapus karena datanya belum ada */}
                <TableHead className="font-semibold">Kekeruhan (NTU)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, index) => (
                <TableRow key={index} className="hover:bg-muted/30">
                  <TableCell className="font-medium">{item.hour}:00</TableCell>
                  <TableCell>{item.ph?.toFixed(2) ?? '-'}</TableCell>
                  <TableCell>{item.suhu?.toFixed(1) ?? '-'}</TableCell>
                  <TableCell>{item.turbidity?.toFixed(2) ?? '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}