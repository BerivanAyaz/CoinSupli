import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PricePoint } from '../types';

interface PriceChartProps {
  data: PricePoint[];
  color?: string;
}

const PriceChart: React.FC<PriceChartProps> = ({ data, color = "#10b981" }) => {
  // Determine min/max for domain to make chart look dynamic
  const prices = data.map(d => d.price);
  const minPrice = Math.min(...prices) * 0.98;
  const maxPrice = Math.max(...prices) * 1.02;

  return (
    <div className="w-full h-64 bg-slate-800/50 rounded-xl p-2 border border-slate-700">
      <h3 className="text-slate-400 text-xs font-semibold mb-2 px-2">Son 7 Günlük Fiyat Hareketi (USD)</h3>
      <ResponsiveContainer width="100%" height="90%">
        <AreaChart
          data={data}
          margin={{
            top: 5,
            right: 0,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
          <XAxis 
            dataKey="date" 
            tick={{fill: '#94a3b8', fontSize: 10}} 
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            hide={true} 
            domain={[minPrice, maxPrice]}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc' }}
            itemStyle={{ color: color }}
            formatter={(value: number) => [`$${value.toFixed(4)}`, 'Fiyat']}
          />
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke={color} 
            fillOpacity={1} 
            fill="url(#colorPrice)" 
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceChart;