"use client";

import React, { useState, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer 
} from 'recharts';
import { Calendar, Download, TrendingUp, DollarSign, PackageCheck } from 'lucide-react';
import * as XLSX from 'xlsx';

type Order = {
  id: number;
  order_code: string;
  customer_name: string;
  total: number;
  status: string;
  created_at: string;
  payment_method: string;
};

export default function StatistikClient({ initialOrders }: { initialOrders: Order[] }) {
  const [dateFilter, setDateFilter] = useState<'1D' | '7D' | '1M' | '1Y' | 'CUSTOM'>('1M');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  
  // Search & Sort States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // 1. Filter Orders by Date
  const filteredOrders = useMemo(() => {
    const now = new Date();
    let startDate = new Date();

    if (dateFilter === '1D') startDate.setDate(now.getDate() - 1);
    else if (dateFilter === '7D') startDate.setDate(now.getDate() - 7);
    else if (dateFilter === '1M') startDate.setMonth(now.getMonth() - 1);
    else if (dateFilter === '1Y') startDate.setFullYear(now.getFullYear() - 1);
    else if (dateFilter === 'CUSTOM') {
      if (customStart) startDate = new Date(customStart);
      else startDate = new Date(0); // If not fully set, include all early
    }

    let endDate = now;
    if (dateFilter === 'CUSTOM' && customEnd) {
      endDate = new Date(customEnd);
      endDate.setHours(23, 59, 59, 999);
    }

    return initialOrders.filter(order => {
      const d = new Date(order.created_at);
      return d >= startDate && d <= endDate;
    });
  }, [initialOrders, dateFilter, customStart, customEnd]);

  // 2. Aggregate Data (Only Successful)
  const successStatuses = ['confirmed', 'processing', 'shipped', 'completed'];
  
  const { chartData, totalRevenue, totalOrders } = useMemo(() => {
    let rev = 0;
    let ord = 0;
    const dailyMap: Record<string, number> = {};

    filteredOrders.forEach(order => {
      const isSuccess = successStatuses.includes(order.status);
      if (isSuccess) {
        rev += order.total;
        ord += 1;
        
        // Group for chart by Date (YYYY-MM-DD)
        const dateStr = new Date(order.created_at).toISOString().split('T')[0];
        dailyMap[dateStr] = (dailyMap[dateStr] || 0) + order.total;
      }
    });

    // Convert map to sorted array for chart
    const data = Object.keys(dailyMap).sort().map(date => ({
      date,
      omzet: dailyMap[date]
    }));

    return { chartData: data, totalRevenue: rev, totalOrders: ord };
  }, [filteredOrders]);

  // Apply search and sort to filtered orders for the table
  const tableOrders = useMemo(() => {
    return filteredOrders.filter(o => {
      const matchSearch = o.order_code.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (o.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'all' || o.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [filteredOrders, searchTerm, statusFilter]);

  // 3. Export to Excel (Multi-sheet by Date)
  const exportToExcel = () => {
    if (filteredOrders.length === 0) return alert('Tidak ada data untuk diekspor pada rentang waktu ini.');

    const wb = XLSX.utils.book_new();

    // Group filtered orders by Date (YYYY-MM-DD) for sheets
    const ordersByDate: Record<string, Order[]> = {};
    filteredOrders.forEach(order => {
      const dateStr = new Date(order.created_at).toISOString().split('T')[0];
      if (!ordersByDate[dateStr]) ordersByDate[dateStr] = [];
      ordersByDate[dateStr].push(order);
    });

    // Create a sheet for each date
    Object.keys(ordersByDate).sort().forEach(dateStr => {
      const dayOrders = ordersByDate[dateStr];
      let dailyTotal = 0;
      let dailySuccessCount = 0;

      const rowData = dayOrders.map(o => {
        const isSuccess = successStatuses.includes(o.status);
        if (isSuccess) {
          dailyTotal += o.total;
          dailySuccessCount += 1;
        }
        return {
          "Kode Pesanan": o.order_code,
          "Waktu": new Date(o.created_at).toLocaleTimeString('id-ID'),
          "Pelanggan": o.customer_name || 'Tanpa Nama',
          "Status": o.status.toUpperCase(),
          "Metode": o.payment_method || '-',
          "Nominal (Rp)": o.total,
          "Dihitung Omzet?": isSuccess ? 'Ya' : 'Tidak'
        };
      });

      // Construct Sheet Data with Header
      const wsData: any[][] = [
        ["Ela Parfum - Laporan Penjualan Harian"],
        [`Tanggal: ${dateStr}`],
        [], // Empty row
        ...(XLSX.utils.sheet_to_json(XLSX.utils.json_to_sheet(rowData), { header: 1 }) as any[][]) // The table
      ];

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      
      // Append Totals at the bottom
      const rowIndex = wsData.length + 1;
      XLSX.utils.sheet_add_aoa(ws, [
        [],
        ["Total Pesanan Berhasil:", dailySuccessCount],
        ["Total Pemasukan:", dailyTotal]
      ], { origin: -1 });

      // Add to Workbook (Max sheet name length is 31 in excel)
      XLSX.utils.book_append_sheet(wb, ws, dateStr);
    });

    const fileName = `Laporan_Penjualan_${new Date().getTime()}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const formatRp = (num: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingBottom: 64 }}>
      
      {/* Header & Filter */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 16, alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--c-ink)", marginBottom: 4 }}>Statistik Penjualan</h1>
          <p style={{ color: "var(--c-ink-dim)", fontSize: "0.9rem" }}>Pantau performa omzet dan riwayat transaksi harian.</p>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", background: "var(--c-surface-2)", borderRadius: "var(--r-md)", padding: 4, border: "1px solid var(--c-border)" }}>
            {(['1D', '7D', '1M', '1Y', 'CUSTOM'] as const).map(f => (
              <button
                key={f}
                onClick={() => setDateFilter(f)}
                style={{
                  padding: "6px 12px",
                  border: "none",
                  borderRadius: 6,
                  fontSize: "0.85rem",
                  fontWeight: dateFilter === f ? 600 : 500,
                  background: dateFilter === f ? "var(--c-gold)" : "transparent",
                  color: dateFilter === f ? "#000" : "var(--c-ink-dim)",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                {f}
              </button>
            ))}
          </div>
          
          {dateFilter === 'CUSTOM' && (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input 
                type="date" 
                value={customStart} 
                onChange={e => setCustomStart(e.target.value)}
                style={{ padding: "6px 10px", borderRadius: "var(--r-sm)", border: "1px solid var(--c-border)", background: "var(--bg-color)", color: "var(--c-ink)", fontSize: "0.85rem" }} 
              />
              <span style={{ color: "var(--c-ink-dim)" }}>-</span>
              <input 
                type="date" 
                value={customEnd} 
                onChange={e => setCustomEnd(e.target.value)}
                style={{ padding: "6px 10px", borderRadius: "var(--r-sm)", border: "1px solid var(--c-border)", background: "var(--bg-color)", color: "var(--c-ink)", fontSize: "0.85rem" }} 
              />
            </div>
          )}

          <button
            onClick={exportToExcel}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", background: "var(--c-ink)", color: "var(--c-surface-1)", border: "none", borderRadius: "var(--r-md)", fontWeight: 600, cursor: "pointer" }}
          >
            <Download size={16} /> Ekspor Excel
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
        <div style={{ background: "var(--c-surface-1)", padding: 24, borderRadius: "var(--r-md)", border: "1px solid var(--c-border)", display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(16, 185, 129, 0.1)", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div style={{ fontSize: "0.85rem", color: "var(--c-ink-dim)", marginBottom: 4 }}>Total Omzet (Masuk)</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--c-ink)" }}>{formatRp(totalRevenue)}</div>
          </div>
        </div>

        <div style={{ background: "var(--c-surface-1)", padding: 24, borderRadius: "var(--r-md)", border: "1px solid var(--c-border)", display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(201, 168, 76, 0.1)", color: "var(--c-gold)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <PackageCheck size={24} />
          </div>
          <div>
            <div style={{ fontSize: "0.85rem", color: "var(--c-ink-dim)", marginBottom: 4 }}>Pesanan Berhasil</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--c-ink)" }}>{totalOrders} <span style={{ fontSize: "0.9rem", color: "var(--c-ink-muted)", fontWeight: 400 }}>transaksi</span></div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ background: "var(--c-surface-1)", padding: 24, borderRadius: "var(--r-md)", border: "1px solid var(--c-border)" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--c-ink)", marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
          <TrendingUp size={18} color="var(--c-gold)"/> Grafik Omzet Harian
        </h3>
        {chartData.length > 0 ? (
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--c-border)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--c-ink-dim)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--c-ink-dim)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `Rp ${val/1000}k`} />
                <RechartsTooltip 
                  formatter={(value: any) => [formatRp(Number(value) || 0), "Omzet"]}
                  labelStyle={{ color: '#000' }}
                  contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                />
                <Line type="monotone" dataKey="omzet" stroke="var(--c-gold)" strokeWidth={3} dot={{ r: 4, fill: "var(--c-gold)" }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div style={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--c-ink-dim)" }}>
            Belum ada data pemasukan pada periode ini.
          </div>
        )}
      </div>

      {/* Transaction Table */}
      <div style={{ background: "var(--c-surface-1)", borderRadius: "var(--r-md)", border: "1px solid var(--c-border)", overflow: "hidden" }}>
        <div style={{ padding: 20, borderBottom: "1px solid var(--c-border)", display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 16, alignItems: "center" }}>
          <div>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--c-ink)" }}>Riwayat Transaksi Terkait</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--c-ink-dim)" }}>Menampilkan transaksi pada periode terpilih.</p>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <input 
              type="text" 
              placeholder="Cari kode / nama..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: "var(--r-sm)", border: "1px solid var(--c-border)", background: "var(--bg-color)", color: "var(--c-ink)", fontSize: "0.85rem", width: 200 }}
            />
            <select 
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: "var(--r-sm)", border: "1px solid var(--c-border)", background: "var(--bg-color)", color: "var(--c-ink)", fontSize: "0.85rem", cursor: "pointer" }}
            >
              <option value="all">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Diproses</option>
              <option value="completed">Selesai</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "var(--c-surface-2)" }}>
                <th style={{ padding: "16px", fontSize: "0.85rem", fontWeight: 600, color: "var(--c-ink-dim)" }}>Tanggal</th>
                <th style={{ padding: "16px", fontSize: "0.85rem", fontWeight: 600, color: "var(--c-ink-dim)" }}>Kode Pesanan</th>
                <th style={{ padding: "16px", fontSize: "0.85rem", fontWeight: 600, color: "var(--c-ink-dim)" }}>Pelanggan</th>
                <th style={{ padding: "16px", fontSize: "0.85rem", fontWeight: 600, color: "var(--c-ink-dim)" }}>Total</th>
                <th style={{ padding: "16px", fontSize: "0.85rem", fontWeight: 600, color: "var(--c-ink-dim)" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {tableOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: 32, textAlign: "center", color: "var(--c-ink-dim)" }}>Tidak ada transaksi yang cocok.</td>
                </tr>
              ) : (
                tableOrders.map(o => {
                  const isSuccess = successStatuses.includes(o.status);
                  const isPending = o.status === 'pending';
                  return (
                    <tr key={o.id} style={{ borderBottom: "1px solid var(--c-border)" }}>
                      <td style={{ padding: "16px", fontSize: "0.9rem", color: "var(--c-ink)" }}>
                        {new Date(o.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ padding: "16px", fontSize: "0.9rem", color: "var(--c-ink)", fontWeight: 500 }}>{o.order_code}</td>
                      <td style={{ padding: "16px", fontSize: "0.9rem", color: "var(--c-ink)" }}>{o.customer_name || '-'}</td>
                      <td style={{ padding: "16px", fontSize: "0.9rem", color: isSuccess ? "var(--c-green)" : "var(--c-ink)", fontWeight: isSuccess ? 600 : 400 }}>
                        {formatRp(o.total)}
                      </td>
                      <td style={{ padding: "16px", fontSize: "0.9rem" }}>
                        <span style={{ 
                          padding: "4px 8px", 
                          borderRadius: 4, 
                          fontSize: "0.75rem", 
                          fontWeight: 600,
                          background: isSuccess ? "rgba(16, 185, 129, 0.1)" : isPending ? "rgba(201, 168, 76, 0.1)" : "rgba(244, 63, 94, 0.1)",
                          color: isSuccess ? "var(--c-green)" : isPending ? "var(--c-gold)" : "var(--c-rose)"
                        }}>
                          {o.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
