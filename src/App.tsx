import React, { useState, useEffect, useCallback } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Newspaper, 
  BarChart3, 
  Settings, 
  Search,
  ChevronRight,
  ExternalLink,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchCryptoNews, fetchMarketData, CryptoNews, MarketData } from './services/cryptoService';

const App: React.FC = () => {
  const [news, setNews] = useState<CryptoNews[]>([]);
  const [market, setMarket] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [newsData, marketData] = await Promise.all([
        fetchCryptoNews(),
        fetchMarketData()
      ]);
      setNews(newsData);
      setMarket(marketData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadData, 300000);
    return () => clearInterval(interval);
  }, [loadData]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col max-w-md mx-auto border-x border-zinc-800 shadow-2xl overflow-hidden">
      {/* Header */}
      <header className="p-4 pt-8 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-zinc-950 w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">CryptoPulse</h1>
          </div>
          <div className="flex gap-3">
            <button className="p-2 hover:bg-zinc-900 rounded-full transition-colors">
              <Search className="w-5 h-5 text-zinc-400" />
            </button>
            <button className="p-2 hover:bg-zinc-900 rounded-full transition-colors">
              <Settings className="w-5 h-5 text-zinc-400" />
            </button>
          </div>
        </div>

        {/* Market Ticker */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {market.map((coin) => (
            <motion.div 
              key={coin.symbol}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-shrink-0 bg-zinc-900/50 border border-zinc-800 p-3 rounded-2xl min-w-[120px]"
            >
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-bold text-zinc-500">{coin.symbol}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  coin.change24h >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                }`}>
                  {coin.change24h >= 0 ? '+' : ''}{coin.change24h}%
                </span>
              </div>
              <div className="text-sm font-mono font-medium">
                ${coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </motion.div>
          ))}
          {loading && market.length === 0 && (
            [1, 2, 3].map(i => (
              <div key={i} className="flex-shrink-0 bg-zinc-900/50 border border-zinc-800 p-3 rounded-2xl min-w-[120px] animate-pulse">
                <div className="h-4 bg-zinc-800 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-zinc-800 rounded w-3/4"></div>
              </div>
            ))
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-emerald-500" />
            Latest News
          </h2>
          <button 
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Updating...' : `Updated ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
          </button>
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {news.map((item, index) => (
              <motion.article
                key={item.id || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className="bg-zinc-900/30 border border-zinc-900 rounded-3xl p-5 hover:bg-zinc-900/50 transition-all group cursor-pointer"
                onClick={() => window.open(item.url, '_blank')}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
                    {item.source}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                    <Clock className="w-3 h-3" />
                    {item.timestamp}
                  </div>
                </div>
                <h3 className="text-base font-bold leading-snug mb-2 group-hover:text-emerald-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
                  {item.summary}
                </p>
                <div className="flex justify-between items-center pt-4 border-t border-zinc-900/50">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      item.sentiment === 'positive' ? 'bg-emerald-500' : 
                      item.sentiment === 'negative' ? 'bg-rose-500' : 'bg-zinc-500'
                    }`} />
                    <span className="text-[10px] font-medium text-zinc-500 capitalize">
                      {item.sentiment} Sentiment
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-zinc-400 transition-all transform group-hover:translate-x-1" />
                </div>
              </motion.article>
            ))}
          </AnimatePresence>

          {loading && news.length === 0 && (
            [1, 2, 3, 4].map(i => (
              <div key={i} className="bg-zinc-900/30 border border-zinc-900 rounded-3xl p-5 animate-pulse">
                <div className="h-4 bg-zinc-800 rounded w-1/4 mb-4"></div>
                <div className="h-6 bg-zinc-800 rounded w-full mb-2"></div>
                <div className="h-6 bg-zinc-800 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-zinc-800 rounded w-full"></div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="p-4 pb-8 border-t border-zinc-900 bg-zinc-950/80 backdrop-blur-md flex justify-around items-center">
        <button className="flex flex-col items-center gap-1 text-emerald-500">
          <Newspaper className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">News</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-zinc-600 hover:text-zinc-400 transition-colors">
          <BarChart3 className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Market</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-zinc-600 hover:text-zinc-400 transition-colors">
          <TrendingUp className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Portfolio</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
