'use client'; 

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// import { historicalData, formatDateIndonesian } from '@/data/mockSensorData';
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
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';

const ITEMS_PER_PAGE = 10;
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

export default function History() {
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();
  const [historicalData, setHistoricalData] = useState<{ date: string }[]>([]);

  const totalPages = Math.max(1, Math.ceil(historicalData.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentData = historicalData.slice(startIndex, endIndex);
  useEffect(() => {
  const fetchHistory = async () => {
    try {
      
      const snapshot = await getDocs(collection(firestore, 'history'));

      const data = snapshot.docs.map(doc => ({
        date: doc.id // karena doc.id = tanggal
      }));
      console.log(snapshot.docs);

      // urutkan terbaru dulu
      data.sort((a, b) => b.date.localeCompare(a.date));

      setHistoricalData(data);
    } catch (err) {
      console.error('Error fetch history:', err);
    }
  };

  fetchHistory();
}, []);

  const handleViewDetail = (date: string) => {
    router.push(`/history/${date}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">History</h1>
        <p className="text-muted-foreground">Riwayat data sensor berdasarkan tanggal</p>
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden sensor-card-shadow">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold w-1/4 text-center">No</TableHead>
              <TableHead className="font-semibold w-1/4 text-center">Hari</TableHead>
              <TableHead className="font-semibold w-1/4 text-center">Tanggal</TableHead>
              <TableHead className="font-semibold w-1/4 text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {historicalData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                  Belum ada data history
                </TableCell>
              </TableRow>
            ) : (
            currentData.map((data, index) => {
              const formattedDate = formatDateIndonesian(data.date);
              const rowNumber = startIndex + index + 1;
              
              return (
                <TableRow key={data.date} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium text-center">{rowNumber}</TableCell>
                  <TableCell className="text-center">{formattedDate.day}</TableCell>
                  <TableCell className="text-center">{formattedDate.date} {formattedDate.month} {formattedDate.year}</TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetail(data.date)}
                      className="gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Detail
                    </Button>
                  </TableCell>
                </TableRow>
              );
            }))}
          </TableBody>
        </Table>

        {/* Pagination */}
        {historicalData.length > 0 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Menampilkan {startIndex + 1} - {Math.min(endIndex, historicalData.length)} dari {historicalData.length} data
          </p>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Prev
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={currentPage === page ? 'gradient-primary' : ''}
                >
                  {page}
                </Button>
              ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>)}
      </div>
    </div>
  );
};
