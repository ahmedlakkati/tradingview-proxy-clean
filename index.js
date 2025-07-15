console.log("🚀 Starting TradingView Proxy..."); 

const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const tradingViewPayload = {
  "symbols": {
    "tickers": [],
    "query": { "types": [] }
  },
  "columns": [
    "name", "close", "change", "change_abs", "volume", "market_cap_basic", "exchange"
  ],
  "filter": [],
  "sort": {
    "sortBy": "change",
    "sortOrder": "desc"
  },
  "range": [0, 50]
};

app.get('/', (req, res) => {
  console.log("✅ Health check passed");
  res.send('TradingView Proxy is running!');
});

app.post('/tv-screener', async (req, res) => {
  console.log("📡 Received POST /tv-screener");

  try {
    const response = await fetch('https://scanner.tradingview.com/america/scan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://www.tradingview.com',
        'Referer': 'https://www.tradingview.com/',
        'User-Agent': 'Mozilla/5.0'
      },
      body: JSON.stringify(tradingViewPayload)
    });

    const json = await response.json();
    console.log("📥 TradingView API response:", JSON.stringify(json));

    if (!json.data || json.data.length === 0) {
      console.warn("⚠️ Warning: No data field in API response");
      return res.status(500).json({ error: "'data' field missing in API response" });
    }

    const stocks = json.data.map(item => ({
      symbol: item.s,
      name: item.d[0],
      price: item.d[1],
      changePercent: (item.d[2] * 100).toFixed(2) + "%",
      changeAbs: item.d[3],
      volume: item.d[4],
      marketCap: item.d[5],
      exchange: item.d[6]
    }));

    console.log(`✅ Found ${stocks.length} stocks`);
    res.json(stocks);
  } catch (err) {
    console.error("🔥 Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🌐 Proxy running on http://localhost:${PORT}`);
});
