import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SupplyPoint } from '../types';
import { translations, Language } from '../locales';

interface SupplyChartProps {
  data: SupplyPoint[];
  lang: Language;
}

const SupplyChart: React.FC<SupplyChartProps> = ({ data, lang }) => {
  if (!data || data.length === 0) return null;

  const t = translations[lang];
  const locale = lang === 'tr' ? 'tr-TR' : 'en-US';

  // Min/Max hesaplayarak grafiğin Y eksenini dinamik yap
  const supplies = data.map(d => d.supply);
  const minSupply = Math.min(...supplies);
  const maxSupply = Math.max(...supplies);
  
  // Y ekseni için biraz pay bırak
  const domainMin = minSupply * 0.99;
  const domainMax = maxSupply * 1.01;

  // Başlangıç ve bitiş arzı arasındaki fark (Enflasyon hesabı için basit bir gösterge)
  const startSupply = supplies[0];
  const endSupply = supplies[supplies.length - 1];
  const increase = endSupply - startSupply;
  const increasePercentage = startSupply > 0 ? (increase / startSupply) * 100 : 0;

  return (
    <div className="w-full h-64 bg-slate-900/50 rounded-xl p-4 border border-slate-800 flex flex-col">
      <div className="flex justify-between items-start mb-4 px-2">
        <div>
          <h3 className="text-slate-200 text-xs font-semibold">{t.supplyChange}</h3>
          <p className="text-slate-500 text-[10px]">{t.last1Year}</p>
        </div>
        <div className="text-right">
          <span className={`text-xs font-bold font-mono ${increase >= 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {increase >= 0 ? '+' : ''}%{increasePercentage.toFixed(2)}
          </span>
          <p className="text-[10px] text-slate-500">{t.annualInflation}</p>
        </div>
      </div>
      
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
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
              <linearGradient id="colorSupply" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.5} />
            <XAxis 
              dataKey="date" 
              tick={{fill: '#64748b', fontSize: 9}} 
              axisLine={false}
              tickLine={false}
              minTickGap={30}
            />
            <YAxis 
              hide={true} 
              domain={[domainMin, domainMax]}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', fontSize: '12px' }}
              itemStyle={{ color: '#f59e0b' }}
              formatter={(value: number) => [new Intl.NumberFormat(locale, { notation: "compact" }).format(value), t.supply]}
              labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
            />
            <Area 
              type="monotone" 
              dataKey="supply" 
              stroke="#f59e0b" 
              fillOpacity={1} 
              fill="url(#colorSupply)" 
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SupplyChart;