const express = require('express');
const fetch = require('node-fetch');
const yahooFinance = require('yahoo-finance2').default;
const app = express();
const PORT = process.env.PORT || 3000;

// TradingView configuration
const tvConfig = {
  filter: [],
  symbols: { query: { types: [] }, tickers: [] },
  columns: ['name', 'close', 'change', 'volume', 'exchange'],
  sort: { sortBy: 'change', sortOrder: 'desc' },
  options: { lang: 'en' },
  range: [0, 20]
};

// Get top movers from Yahoo Finance
async function getYahooMovers() {
  try {
    const queryOptions = { count: 20, lang: 'en' };
    const result = await yahooFinance.trendingSymbols('US', queryOptions);
    return result.map(stock => ({
      symbol: stock.symbol,
      name: stock.name,
      price: stock.regularMarketPrice,
      change: stock.regularMarketChangePercent,
      volume: stock.regularMarketVolume,
      exchange: stock.exchange
    }));
  } catch (err) {
    console.error("Yahoo Finance Error:", err);
    return null;
  }
}

app.get('/', (req, res) => res.send('Proxy is running!'));

app.post('/tv-screener', async (req, res) => {
  try {
    // First try TradingView
    const tvResponse = await fetch('https://scanner.tradingview.com/america/scan', {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Content-Type': 'application/json',
        'Origin': 'https://www.tradingview.com'
      },
      body: JSON.stringify(tvConfig)
    });

    const tvData = await tvResponse.json();
    
    if (tvData?.data) {
      const processed = tvData.data.map(item => ({
        symbol: item.s,
        name: item.d[0],
        price: item.d[1],
        change: item.d[2],
        volume: item.d[3],
        exchange: item.d[4]
      }));
      return res.json({ source: 'TradingView', data: processed });
    }

    // Fallback to Yahoo Finance
    const yahooData = await getYahooMovers();
    if (yahooData) {
      return res.json({ source: 'Yahoo Finance', data: yahooData });
    }

    throw new Error('Both APIs failed');

  } catch (err) {
    console.error("API Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
