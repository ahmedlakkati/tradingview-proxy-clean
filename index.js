// TradingView Proxy Server
console.log("🚀 Starting TradingView Proxy Server...");

const express = require('express');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// TradingView API request payload
const tvPayload = {
  filter: [],
  symbols: { query: { types: [] }, tickers: [] },
  columns: [
    'logoid', 'name', 'close', 'change_abs', 'change', 'volume', 'exchange'
  ],
  sort: { sortBy: 'change', sortOrder: 'desc' },
  options: { lang: 'en' },
  range: { from: 0, to: 20 }
};

// Health Check Endpoint
app.get('/', (req, res) => {
  console.log("✅ Health check passed");
  res.send('TradingView Proxy is running!');
});

// TradingView Screener Endpoint
app.post('/tv-screener', async (req, res) => {
  console.log("📡 Fetching data from TradingView...");
  try {
    const response = await fetch('https://scanner.tradingview.com/america/scan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0'
      },
      body: JSON.stringify(tvPayload)
    });

    const data = await response.json();

    if (!data?.data) {
      console.error("❌ TradingView API response missing 'data'");
      return res.status(500).json({ error: "'data' field missing in API response" });
    }

    const stocks = data.data.map(row => ({
      symbol: row.s,
      price: row.d[2],
      gap: row.d[4] * 100, // percent change
      volume: row.d[5],
      exchange: row.d[6]
    }));

    console.log(`✅ Found ${stocks.length} stocks`);
    res.json(stocks);

  } catch (err) {
    console.error("🔥 Proxy Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Proxy running on port ${PORT}`);
});
