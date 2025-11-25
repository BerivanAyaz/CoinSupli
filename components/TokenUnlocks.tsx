import React from 'react';
import { MarketData } from '../types';
import { translations, Language } from '../locales';

interface TokenUnlocksProps {
  marketData: MarketData;
  annualEmission?: number | null;
  lang: Language;
}

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
);

const UnlockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>
);

const InfinityIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400"><path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 1 0 0-8c-2 0-4 1.33-6 4Z"/></svg>
);

const TokenUnlocks: React.FC<TokenUnlocksProps> = ({ marketData, annualEmission, lang }) => {
  const t = translations[lang];
  const locale = lang === 'tr' ? 'tr-TR' : 'en-US';

  const { 
    circulating_supply, 
    total_supply, 
    max_supply, 
    current_price,
    fully_diluted_valuation,
    market_cap 
  } = marketData;

  // Determine if the coin has a hard cap
  const hasMaxSupply = max_supply !== null && max_supply > 0;
  
  // Reference for calculation: Max if exists, otherwise Total
  const referenceSupply = hasMaxSupply ? max_supply : total_supply;
  
  if (!referenceSupply || !current_price?.usd) return null;

  // For fixed supply: Locked = Max - Circulating
  // For dynamic supply: NonCirculating = Total - Circulating
  const nonCirculatingAmount = Math.max(0, referenceSupply - circulating_supply);
  const nonCirculatingValue = nonCirculatingAmount * current_price.usd;
  
  // FDV logic
  // If max supply exists, FDV is based on Max. If not, FDV usually refers to Total Supply valuation in APIs, or effectively Market Cap if Total~=Circulating.
  const fdv = fully_diluted_valuation?.usd || (referenceSupply * current_price.usd);
  
  // Timeline Calculations
  const progress = Math.min(100, (circulating_supply / referenceSupply) * 100);
  
  // Estimated Completion Date (Only valid if there is a Max Supply to reach)
  let estimatedDateString = null;
  
  if (hasMaxSupply && nonCirculatingAmount > 0 && annualEmission && annualEmission > 0) {
      const yearsLeft = nonCirculatingAmount / annualEmission;
      if (yearsLeft < 100) {
          const futureDate = new Date();
          futureDate.setMonth(futureDate.getMonth() + Math.round(yearsLeft * 12));
          estimatedDateString = futureDate.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
      }
  }

  const mcapFdvRatio = fdv > 0 ? market_cap.usd / fdv : 1;

  // --- VIEW 1: No Max Supply (Dynamic/Inflationary) ---
  if (!hasMaxSupply) {
      return (
        <div className="space-y-3">
             <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <InfinityIcon /> {t.upcomingUnlocks}
            </h2>
            
            {/* Warning Card */}
            <div className="bg-amber-900/10 p-4 rounded-xl border border-amber-900/30 flex items-start gap-3">
                <div className="p-1.5 bg-amber-500/10 rounded-full text-amber-400 shrink-0 mt-0.5">
                    <InfinityIcon />
                </div>
                <div>
                    <h3 className="text-amber-200 text-sm font-semibold">{t.noMaxSupplyTitle}</h3>
                    <p className="text-amber-200/60 text-xs mt-1 leading-relaxed">{t.noMaxSupplyDesc}</p>
                </div>
            </div>

            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
                 {/* Stats Row */}
                 <div className="flex justify-between items-center mb-4">
                     <div>
                         <span className="text-[10px] text-slate-500 font-bold uppercase block mb-0.5">{t.totalSupply}</span>
                         <span className="text-sm font-mono text-slate-200">
                            {new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 2 }).format(total_supply)}
                         </span>
                     </div>
                     <div className="text-right">
                         <span className="text-[10px] text-slate-500 font-bold uppercase block mb-0.5">{t.nonCirculating}</span>
                         <span className="text-sm font-mono text-slate-200">
                             {new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 2 }).format(nonCirculatingAmount)}
                         </span>
                         <p className="text-[9px] text-slate-500">{t.nonCirculatingDesc}</p>
                     </div>
                 </div>

                 {/* Progress Bar (Total vs Circulating) */}
                 <div className="space-y-2">
                      <div className="flex justify-between text-[10px] text-slate-400">
                          <span>{t.circulating}: %{progress.toFixed(1)}</span>
                          <span>100% ({t.totalSupply})</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-slate-600 rounded-full"
                            style={{ width: `${progress}%` }}
                          />
                      </div>
                 </div>
            </div>
        </div>
      );
  }

  // --- VIEW 2: Max Supply Exists & Fully Distributed ---
  if (hasMaxSupply && nonCirculatingAmount <= 0) {
      return (
        <div className="space-y-3">
             <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <UnlockIcon /> {t.distributionStatus}
            </h2>
            <div className="bg-emerald-900/10 p-4 rounded-xl border border-emerald-900/30 flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-full text-emerald-400 shrink-0">
                    <UnlockIcon />
                </div>
                <div>
                    <h3 className="text-emerald-300 text-sm font-semibold">{t.allCirculating}</h3>
                    <p className="text-emerald-400/60 text-xs mt-0.5">{t.allCirculatingDesc}</p>
                </div>
            </div>
        </div>
      );
  }

  // --- VIEW 3: Max Supply Exists & Unlocks Remaining ---
  return (
    <div className="space-y-3">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <UnlockIcon /> {t.upcomingUnlocks}
        </h2>
        
        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
            {/* Top Info: FDV and Ratio */}
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-4 mb-4 pb-4 border-b border-slate-800">
                <div className="flex flex-col justify-center">
                    <span className="text-[10px] text-slate-500 font-bold uppercase mb-1 tracking-wider">{t.fdv}</span>
                    <span className="text-sm font-mono text-slate-200 truncate">
                        ${new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 2 }).format(fdv)}
                    </span>
                </div>
                <div className="flex flex-col justify-center">
                    <span className="text-[10px] text-slate-500 font-bold uppercase mb-1 tracking-wider">{t.mcapFdvRatio}</span>
                    <div className="flex items-center gap-2">
                         <span className={`text-sm font-mono font-bold ${mcapFdvRatio < 0.5 ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {mcapFdvRatio.toFixed(2)}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium border ${mcapFdvRatio < 0.5 ? 'bg-amber-900/20 text-amber-200 border-amber-900/30' : 'bg-emerald-900/20 text-emerald-200 border-emerald-900/30'}`}>
                            {mcapFdvRatio < 0.5 ? t.highRisk : t.lowRisk}
                        </span>
                    </div>
                </div>
            </div>

            {/* Locked Stats */}
            <div className="space-y-3">
                <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 group">
                    <div className="flex items-start gap-3">
                        <div className="mt-1 p-1.5 bg-slate-800 rounded text-slate-400 shrink-0">
                            <LockIcon />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-300">{t.remainingLocked}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{t.waitingForMarket}</p>
                        </div>
                    </div>
                    <div className="text-left xs:text-right pl-10 xs:pl-0">
                         <p className="text-xs font-mono text-white">
                             {new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 }).format(nonCirculatingAmount)}
                         </p>
                         <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                             ~${new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 }).format(nonCirculatingValue)}
                         </p>
                    </div>
                </div>
            </div>

            {/* Timeline Visualization */}
            <div className="mt-8 mb-2 relative px-2">
                 {/* Base Line */}
                 <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-800 -translate-y-1/2 rounded-full"></div>
                 
                 {/* Progress Line */}
                 <div 
                    className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-indigo-900 to-indigo-500 -translate-y-1/2 rounded-full transition-all duration-1000" 
                    style={{width: `${progress}%`}}
                 ></div>

                 {/* Start Dot */}
                 <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-slate-700 rounded-full border-2 border-slate-900 z-10"></div>
                 
                 {/* Current Dot (Pulsing) */}
                 <div 
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-indigo-500 rounded-full border-[3px] border-slate-900 shadow-[0_0_15px_rgba(99,102,241,0.6)] z-20 transition-all duration-1000 flex items-center justify-center group cursor-help"
                    style={{left: `${progress}%`, transform: 'translate(-50%, -50%)'}}
                 >
                    <div className="w-1 h-1 bg-white rounded-full opacity-70"></div>
                     <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        {t.current}: %{progress.toFixed(1)}
                     </div>
                 </div>

                 {/* End Dot */}
                 <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-slate-700 rounded-full border-2 border-slate-900 z-10"></div>

                 {/* Timeline Labels */}
                 <div className="flex justify-between text-[9px] text-slate-500 font-medium mt-4 pt-1 select-none">
                      <span className="-ml-2">{t.timelineStart}</span>
                      
                      <div className="text-right -mr-2 flex flex-col items-end">
                          <span>{t.maxSupply}</span>
                          {estimatedDateString && (
                              <span className="text-indigo-400 font-semibold mt-0.5 flex items-center gap-1">
                                  {t.estimatedEnd} {estimatedDateString}
                              </span>
                          )}
                          {!estimatedDateString && nonCirculatingAmount > 0 && (
                              <span className="text-slate-600 font-normal mt-0.5">
                                  {annualEmission ? t.calculating : t.dateUnknown}
                              </span>
                          )}
                      </div>
                 </div>
            </div>
            
            {estimatedDateString && (
                 <p className="text-[10px] text-slate-500/80 mt-4 leading-relaxed bg-slate-800/30 p-2 rounded-lg border border-slate-800/50">
                    <span className="text-indigo-400 font-bold">*</span> {t.estimationNote.replace("1", new Intl.NumberFormat(locale, { notation: "compact" }).format(annualEmission || 0) + "/y")}
                 </p>
            )}

        </div>
    </div>
  );
};

export default TokenUnlocks;