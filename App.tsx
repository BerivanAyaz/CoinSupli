import React, { useState, useEffect } from 'react';
import { searchCoin, getCoinDetails, getCoinMarketChart } from './services/api';
import { CoinDetail, SupplyPoint } from './types';
import TokenomicsChart from './components/TokenomicsChart';
import TokenUnlocks from './components/TokenUnlocks';
import SupplyChart from './components/SupplyChart';
import { translations, Language } from './locales';

// Icons
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);

const FileTextIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
);

const GlobeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
);

const TrendingUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
);

const TrendingDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>
);

const AlertIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
);

const SearchXIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="8" x2="14" y2="14"></line><line x1="14" y1="8" x2="8" y2="14"></line></svg>
);

function App() {
  const [inputValue, setInputValue] = useState('');
  const [coinData, setCoinData] = useState<CoinDetail | null>(null);
  const [supplyHistory, setSupplyHistory] = useState<SupplyPoint[]>([]);
  const [annualEmission, setAnnualEmission] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'not_found' | 'rate_limit' | 'generic' | null>(null);
  const [lang, setLang] = useState<Language>('en'); // Default en, will update in useEffect
  
  // Initialize Language Detection
  useEffect(() => {
    const browserLang = navigator.language || (navigator.languages && navigator.languages[0]);
    if (browserLang && browserLang.toLowerCase().includes('tr')) {
      setLang('tr');
    } else {
      setLang('en');
    }
  }, []);

  const t = translations[lang]; // Current translations
  const locale = lang === 'tr' ? 'tr-TR' : 'en-US';

  useEffect(() => {
    loadCoin('bitcoin');
  }, [lang]); // Reloading if lang changes isn't strictly necessary for data, but good for consistent state

  const loadCoin = async (query: string) => {
    setLoading(true);
    setError(null);
    setErrorType(null);
    setSupplyHistory([]); 
    setAnnualEmission(null);

    try {
      const searchResults = await searchCoin(query);
      if (searchResults.length === 0) {
        throw new Error("COIN_NOT_FOUND_IN_SEARCH");
      }
      const coinId = searchResults[0].id;
      
      // Detayları çek
      const details = await getCoinDetails(coinId);
      setCoinData(details);

      // Arz geçmişini çek (Sessiz hata yönetimi)
      try {
        const historyData = await getCoinMarketChart(coinId, 365);
        if (historyData && historyData.prices && historyData.market_caps) {
          const supplyPoints: SupplyPoint[] = historyData.market_caps.map((item, index) => {
            const timestamp = item[0];
            const cap = item[1];
            // Aynı indexteki fiyatı bulmaya çalış (genelde 1:1 eşleşir)
            const priceItem = historyData.prices[index];
            const price = priceItem ? priceItem[1] : 0;
            
            return {
              date: new Date(timestamp).toLocaleDateString(locale, { day: 'numeric', month: 'short' }),
              supply: price > 0 ? cap / price : 0
            };
          }).filter(p => p.supply > 0);
          
          setSupplyHistory(supplyPoints);

          // Yıllık emisyonu hesapla (Son veri - İlk veri)
          if (supplyPoints.length >= 2) {
             const startSupply = supplyPoints[0].supply;
             const endSupply = supplyPoints[supplyPoints.length - 1].supply;
             const emission = endSupply - startSupply;
             setAnnualEmission(emission > 0 ? emission : 0);
          }
        }
      } catch (chartErr) {
        console.warn("Chart data could not be fetched", chartErr);
        // Ana veri geldiyse chart hatasını kullanıcıya bloklayıcı olarak gösterme
      }

    } catch (err: any) {
      let message = err.message || t.errorGeneric;
      let type: 'not_found' | 'rate_limit' | 'generic' = 'generic';

      if (message.includes("API_LIMIT")) {
        message = t.errorRateLimit;
        type = 'rate_limit';
      } else if (message.includes("NOT_FOUND") || message.includes("COIN_NOT_FOUND_IN_SEARCH")) {
        message = `${t.errorNotFound} "${query}"`;
        type = 'not_found';
      } else {
        message = t.errorGeneric;
      }

      setError(message);
      setErrorType(type);
      setCoinData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      loadCoin(inputValue);
      setInputValue('');
      // Dismiss keyboard on mobile
      (document.activeElement as HTMLElement)?.blur();
    }
  };

  const cleanDescription = (detail: CoinDetail) => {
    const desc = lang === 'tr' && detail.description.tr ? detail.description.tr : detail.description.en;
    if (!desc) return t.descriptionNotFound;
    
    const stripped = desc.replace(/<[^>]+>/g, ''); 
    return stripped.length > 350 ? stripped.substring(0, 350) + "..." : stripped;
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-24 font-sans text-slate-100 selection:bg-indigo-500/30">
      
      {/* Sticky Header - Fully Responsive */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/60 shadow-lg">
        <div className="container mx-auto max-w-7xl px-4 py-3 lg:py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative group w-full md:max-w-md">
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full bg-slate-800/80 text-base sm:text-sm text-white placeholder-slate-400 rounded-2xl py-3 pl-5 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 border border-slate-700/50 transition-all shadow-sm group-focus-within:bg-slate-800"
                style={{ fontSize: '16px' }} // Prevent iOS zoom
              />
              <button 
                type="submit"
                className="absolute right-1.5 top-1.5 p-2 bg-indigo-600 rounded-xl hover:bg-indigo-500 active:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20"
                aria-label="Ara"
              >
                <SearchIcon />
              </button>
            </form>
            
            {/* Quick Tags - Responsive Scrolling/Wrapping */}
            <div className="w-full md:w-auto overflow-x-auto flex gap-2 no-scrollbar scroll-smooth md:flex-wrap md:justify-end pb-1 md:pb-0">
              {['Bitcoin', 'Ethereum', 'Solana', 'Chainlink', 'ICP', 'NEAR'].map((c) => (
                <button
                  key={c}
                  onClick={() => loadCoin(c)}
                  className="shrink-0 px-4 py-1.5 bg-slate-800/50 border border-slate-700/50 rounded-full text-xs font-medium text-slate-300 active:scale-95 hover:bg-slate-700 hover:text-white hover:border-slate-600 transition-all"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl px-4 py-6 space-y-6">
        
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-12 h-12 border-[3px] border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 animate-pulse text-sm font-medium">{t.loading}</p>
          </div>
        )}

        {error && (
          <div className="max-w-md mx-auto mt-12">
            <div className={`rounded-2xl p-6 border flex flex-col items-center text-center space-y-4 animate-in fade-in zoom-in-95 duration-200 ${
              errorType === 'rate_limit' 
                ? 'bg-amber-500/5 border-amber-500/20 text-amber-100' 
                : 'bg-red-500/5 border-red-500/20 text-red-100'
            }`}>
              <div className={`p-4 rounded-full shadow-inner ${errorType === 'rate_limit' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}>
                  {errorType === 'rate_limit' ? <ClockIcon /> : (errorType === 'not_found' ? <SearchXIcon /> : <AlertIcon />)}
              </div>
              
              <div>
                  <h3 className="font-semibold text-lg mb-1">
                      {errorType === 'not_found' ? t.errorTitleNotFound : (errorType === 'rate_limit' ? t.errorTitleRateLimit : t.errorTitleGeneric)}
                  </h3>
                  <p className="text-sm opacity-80 leading-relaxed max-w-[280px] mx-auto">
                      {error}
                  </p>
              </div>

              <button 
                onClick={() => loadCoin(inputValue || 'bitcoin')}
                className={`w-full max-w-[200px] py-3 rounded-xl text-sm font-semibold transition-transform active:scale-95 shadow-lg ${
                    errorType === 'rate_limit'
                    ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-500/10'
                    : 'bg-red-600 hover:bg-red-500 text-white shadow-red-500/10'
                }`}
              >
                {t.retry}
              </button>
            </div>
          </div>
        )}

        {!loading && !error && coinData && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT COLUMN: Identity, Price, Basics */}
            <div className="lg:col-span-4 xl:col-span-3 space-y-6">
              
              {/* Coin Identity Card */}
              <div className="bg-slate-900/60 rounded-2xl p-5 border border-slate-800 shadow-sm backdrop-blur-sm">
                 <div className="flex items-center gap-4 mb-4">
                    <div className="relative shrink-0">
                      <img src={coinData.image.large} alt={coinData.name} className="w-16 h-16 rounded-full shadow-xl ring-2 ring-slate-800" />
                      <div className="absolute -bottom-1 -right-1 bg-slate-900 rounded-full px-2 py-0.5 border border-slate-700">
                         <span className="text-[10px] font-bold text-slate-300">#{coinData.market_data.market_cap_rank}</span>
                      </div>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight leading-none">{coinData.name}</h1>
                        <p className="text-sm text-slate-400 font-medium mt-1 uppercase tracking-wide">{coinData.symbol}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-3xl font-bold font-mono text-white tracking-tight">
                      ${coinData.market_data.current_price.usd.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs font-semibold mt-2 py-1 px-2 rounded-lg bg-slate-900 border border-slate-800 inline-block ${coinData.market_data.price_change_percentage_24h >= 0 ? 'text-emerald-400 border-emerald-500/20' : 'text-red-400 border-red-500/20'}`}>
                      {coinData.market_data.price_change_percentage_24h >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                      <span>{Math.abs(coinData.market_data.price_change_percentage_24h).toFixed(2)}% {t.priceChange24h}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-6">
                    <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/50">
                      <p className="text-slate-500 text-[9px] uppercase font-bold mb-1 tracking-wider">{t.marketCap}</p>
                      <p className="text-slate-200 font-mono font-semibold text-sm truncate">
                          ${new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 2 }).format(coinData.market_data.market_cap.usd)}
                      </p>
                    </div>
                    <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/50">
                      <p className="text-slate-500 text-[9px] uppercase font-bold mb-1 tracking-wider">{t.volume24h}</p>
                      <p className="text-slate-200 font-mono font-semibold text-sm truncate">
                           ${new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 2 }).format(coinData.market_data.total_volume.usd)}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                      {coinData.links.homepage[0] && (
                          <a href={coinData.links.homepage[0]} target="_blank" rel="noreferrer" className="flex-1 bg-slate-800 hover:bg-slate-750 py-2.5 rounded-lg flex items-center justify-center gap-2 text-xs font-semibold text-slate-300 transition-all border border-slate-700 hover:border-slate-600">
                              <GlobeIcon /> {t.web}
                          </a>
                      )}
                       {coinData.links.whitepaper && coinData.links.whitepaper[0] && (
                          <a href={coinData.links.whitepaper[0]} target="_blank" rel="noreferrer" className="flex-1 bg-slate-800 hover:bg-slate-750 py-2.5 rounded-lg flex items-center justify-center gap-2 text-xs font-semibold text-slate-300 transition-all border border-slate-700 hover:border-slate-600">
                              <FileTextIcon /> {t.whitepaper}
                          </a>
                      )}
                  </div>
              </div>

              {/* Description - Desktop Only (Moves to bottom on mobile via grid order if needed, but here works fine) */}
              <div className="hidden lg:block space-y-3">
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">{t.about}</h2>
                <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800">
                  <p className="text-slate-300 text-sm leading-relaxed font-light">
                    {cleanDescription(coinData)}
                  </p>
                </div>
              </div>

            </div>

            {/* MIDDLE COLUMN: Charts & Stats */}
            <div className="lg:col-span-8 xl:col-span-6 space-y-6">
               
               {/* Price Details Grid */}
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   {/* ATH Card */}
                   <div className="bg-gradient-to-br from-slate-900 to-slate-900/50 p-4 rounded-2xl border border-slate-800 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                         <TrendingUpIcon />
                      </div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">{t.ath}</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-mono text-slate-200 block truncate">
                            ${coinData.market_data.ath.usd.toLocaleString(locale)}
                        </span>
                        <span className={`text-[10px] font-bold ${coinData.market_data.ath_change_percentage.usd >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {coinData.market_data.ath_change_percentage.usd.toFixed(2)}%
                        </span>
                      </div>
                   </div>
                   
                   {/* Range Card */}
                   <div className="bg-gradient-to-br from-slate-900 to-slate-900/50 p-4 rounded-2xl border border-slate-800 flex flex-col justify-center">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block mb-2">{t.range24h}</span>
                      <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-end text-[11px] font-mono text-slate-300">
                              <span>L: ${new Intl.NumberFormat(locale, { notation: "compact" }).format(coinData.market_data.low_24h.usd)}</span>
                              <span>H: ${new Intl.NumberFormat(locale, { notation: "compact" }).format(coinData.market_data.high_24h.usd)}</span>
                          </div>
                          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden relative">
                              {/* Simple visual approximation since we don't have current price position percentage easily calc here without clutter */}
                              <div className="absolute inset-y-0 bg-gradient-to-r from-indigo-600 to-purple-500 w-1/2 left-1/4 rounded-full opacity-80"></div>
                          </div>
                      </div>
                   </div>
               </div>

               {/* Charts Section */}
               <div className="space-y-6">
                  <h2 className="text-sm font-semibold text-white/90 uppercase tracking-wider pl-1 border-l-2 border-indigo-500 ml-1">{t.economicsSupply}</h2>
                  
                  <TokenomicsChart 
                    circulating={coinData.market_data.circulating_supply} 
                    total={coinData.market_data.total_supply}
                    lang={lang}
                  />

                  {supplyHistory.length > 0 && (
                    <SupplyChart data={supplyHistory} lang={lang} />
                  )}

                  {/* Detailed Supply List */}
                  <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/80 divide-y divide-slate-800/50">
                    <div className="flex justify-between items-start py-2 pb-3">
                        <div className="flex flex-col">
                            <span className="text-slate-300 text-xs font-bold">{t.circulatingSupply}</span>
                            <span className="text-[10px] text-slate-500 mt-0.5">{t.circulatingDesc}</span>
                        </div>
                        <div className="text-right">
                            <div className="text-slate-200 text-sm font-mono font-medium">
                                {coinData.market_data.circulating_supply.toLocaleString(locale)}
                            </div>
                            <div className="text-emerald-400/80 text-[11px] font-mono mt-0.5 font-medium">
                                ≈ ${(coinData.market_data.circulating_supply * coinData.market_data.current_price.usd).toLocaleString(locale, {maximumFractionDigits: 0})}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center py-3">
                        <span className="text-slate-400 text-xs font-medium">{t.totalSupply}</span>
                        <span className="text-slate-200 text-xs sm:text-sm font-mono font-medium">
                            {coinData.market_data.total_supply ? coinData.market_data.total_supply.toLocaleString(locale) : '-'}
                        </span>
                    </div>
                     <div className="flex justify-between items-center py-3 pt-3">
                        <span className="text-slate-400 text-xs font-medium">{t.maxSupply}</span>
                        <span className="text-slate-200 text-xs sm:text-sm font-mono font-medium">
                            {coinData.market_data.max_supply ? coinData.market_data.max_supply.toLocaleString(locale) : '∞'}
                        </span>
                    </div>
                  </div>
               </div>
            </div>

            {/* RIGHT COLUMN: Unlocks & Extra Info */}
            <div className="lg:col-span-12 xl:col-span-3 space-y-6">
                <TokenUnlocks marketData={coinData.market_data} annualEmission={annualEmission} lang={lang} />
                
                {/* Mobile Description (Hidden on LG+) */}
                <div className="lg:hidden space-y-3">
                  <h2 className="text-sm font-semibold text-white/90 uppercase tracking-wider pl-1">{t.about}</h2>
                  <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800">
                    <p className="text-slate-300 text-sm leading-7 font-light">
                      {cleanDescription(coinData)}
                    </p>
                  </div>
                </div>
            </div>

          </div>
        )}
      </main>

      <footer className="container mx-auto max-w-7xl px-6 py-8 text-center border-t border-slate-800/50 mt-8">
        <p className="text-[11px] text-slate-500 flex flex-col md:flex-row items-center justify-center gap-2">
          <span>{t.footerData}</span>
          <span className="hidden md:inline">•</span>
          <span className="opacity-70">{t.footerDisclaimer}</span>
        </p>
      </footer>

    </div>
  );
}

export default App;