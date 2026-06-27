"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatRupiah } from '@/lib/types';

export default function SalesChart({ data }: { data: { name: string, total: number }[] }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--c-ink-dim)', fontSize: '0.9rem' }}>
        Belum ada data penjualan untuk 7 hari terakhir.
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 10, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--c-border)" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'var(--c-ink-dim)', fontSize: 12 }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'var(--c-ink-dim)', fontSize: 12 }}
            tickFormatter={(value) => value >= 1000 ? `Rp ${value / 1000}k` : `Rp ${value}`}
            allowDecimals={false}
            domain={Math.max(...data.map(d => d.total)) === 0 ? [0, 500000] : [0, 'auto']}
            tickCount={6}
          />
          <Tooltip 
            cursor={{ fill: 'var(--c-border)' }}
            contentStyle={{ background: 'var(--glass-bg)', backdropFilter: 'blur(12px)', border: '1px solid var(--glass-border)', borderRadius: 'var(--r-md)', color: 'var(--c-ink)', boxShadow: 'var(--shadow-float)' }}
            formatter={(value: any) => [formatRupiah(Number(value) || 0), "Pendapatan"]}
            labelStyle={{ color: 'var(--c-ink-dim)', marginBottom: 4 }}
          />
          <Bar dataKey="total" fill="var(--c-gold)" radius={[4, 4, 0, 0]} maxBarSize={50} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
