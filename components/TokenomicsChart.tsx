import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { translations, Language } from '../locales';

interface TokenomicsChartProps {
  circulating: number;
  total: number;
  lang: Language;
}

const TokenomicsChart: React.FC<TokenomicsChartProps> = ({ circulating, total, lang }) => {
  const t = translations[lang];
  const effectiveTotal = total || circulating; 
  const locked = effectiveTotal - circulating;
  
  const data = [
    { name: t.circulating, value: circulating, color: '#10b981' }, // Emerald
    { name: t.locked, value: Math.max(0, locked), color: '#334155' }, // Slate 700
  ];

  const percentage = Math.round((circulating / effectiveTotal) * 100);
  const locale = lang === 'tr' ? 'tr-TR' : 'en-US';

  return (
    <div className="flex flex-col xs:flex-row items-center gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800 transition-all hover:border-slate-700">
      {/* Chart Section */}
      <div className="relative w-24 h-24 xs:w-28 xs:h-28 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={35}
              outerRadius={45}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              stroke="none"
              paddingAngle={2}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
             <RechartsTooltip 
               contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px', padding: '8px' }}
               itemStyle={{ color: '#fff' }}
               formatter={(value: number) => new Intl.NumberFormat(locale, { notation: "compact" }).format(value)}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Centered Percentage */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
          <span className="text-xs font-bold text-slate-200">%{percentage}</span>
          <span className="text-[8px] text-slate-500 uppercase">{t.unlocked}</span>
        </div>
      </div>
      
      {/* Legend & Stats Section */}
      <div className="flex-1 w-full space-y-3">
        {/* Circulating */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-emerald-400 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span> 
              {t.circulating}
            </span>
            <span className="text-slate-200 font-mono tracking-tight">
              {new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 2 }).format(circulating)}
            </span>
          </div>
          <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Total Supply */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
             <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-600"></span> 
              {t.totalSupply}
            </span>
            <span className="text-slate-400 font-mono tracking-tight">
              {total ? new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 2 }).format(total) : '∞'}
            </span>
          </div>
          {/* Visual indicator for locked supply portion if total exists */}
          {total && (
            <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden flex justify-end">
               <div 
                  className="bg-slate-700 h-full rounded-full" 
                  style={{ width: `${100 - percentage}%` }}
                />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TokenomicsChart;