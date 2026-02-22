'use client'; 
import { useParams, useRouter } from 'next/navigation'; 
import { historicalData, formatDateIndonesian } from '@/data/mockSensorData';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Thermometer, Droplet, Eye, Waves } from 'lucide-react';
import { SensorChart } from '@/components/dashboard/SensorChart';

export default function HistoryDetail() { // Ubah dari export const HistoryDetail = () => menjadi export default function HistoryDetail()
 const { date } = useParams<{ date: string }>(); // Tetap sama, tapi dari next/navigation
  const router = useRouter(); // Ganti useNavigate dengan useRouter

  const dayData = historicalData.find(d => d.date === date);

  if (!dayData) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-muted-foreground mb-4">Data tidak ditemukan</p>
        <Button onClick={() => router.push('/history')}>Kembali ke History</Button>
      </div>
    );
  }

  const formattedDate = formatDateIndonesian(dayData.date);

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-4 border border-border/50 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sensor-ph flex items-center justify-center">
            <Droplet className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Rata-rata pH</p>
            <p className="text-xl font-bold">{dayData.averages.ph.toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border/50 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sensor-temperature flex items-center justify-center">
            <Thermometer className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Rata-rata Suhu</p>
            <p className="text-xl font-bold">{dayData.averages.temperature.toFixed(1)}°C</p>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border/50 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sensor-turbidity flex items-center justify-center">
            <Eye className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Rata-rata Kekeruhan</p>
            <p className="text-xl font-bold">{dayData.averages.turbidity.toFixed(2)} NTU</p>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border/50 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sensor-level flex items-center justify-center">
            <Waves className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Rata-rata Ketinggian</p>
            <p className="text-xl font-bold">{dayData.averages.waterLevel.toFixed(1)} cm</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SensorChart
          title="pH Level"
          data={dayData.readings}
          dataKey="ph"
          color="hsl(var(--sensor-ph))"
          unit="pH"
        />
        <SensorChart
          title="Suhu Air"
          data={dayData.readings}
          dataKey="temperature"
          color="hsl(var(--sensor-temperature))"
          unit="°C"
        />
        <SensorChart
          title="Kekeruhan"
          data={dayData.readings}
          dataKey="turbidity"
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
                <TableHead className="font-semibold">Kekeruhan (NTU)</TableHead>
                <TableHead className="font-semibold">Ketinggian (cm)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dayData.readings.map((reading, index) => (
                <TableRow key={index} className="hover:bg-muted/30">
                  <TableCell className="font-medium">
                    {new Date(reading.timestamp).toLocaleTimeString('id-ID', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </TableCell>
                  <TableCell>{reading.ph.toFixed(2)}</TableCell>
                  <TableCell>{reading.temperature.toFixed(1)}</TableCell>
                  <TableCell>{reading.turbidity.toFixed(2)}</TableCell>
                  <TableCell>{reading.waterLevel.toFixed(1)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
