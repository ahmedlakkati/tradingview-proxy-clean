const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// TradingView Payload
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

app.get('/', (req, res) => {
  console.log("✅ Health check passed");
  res.send('TradingView Proxy is running!');
});

app.post('/tv-screener', async (req, res) => {
  console.log("📡 Fetching gappers from TradingView...");
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
    console.log("📥 TradingView API raw response:", data);

    if (!data.data) {
      throw new Error("'data' field missing in API response");
    }

    const stocks = data.data.map(row => ({
      symbol: row.s,
      price: row.d[2],
      change: row.d[4],
      volume: row.d[5],
      exchange: row.d[6]
    }));

    res.json(stocks);
  } catch (err) {
    console.error("🔥 Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
