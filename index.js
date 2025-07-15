const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

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

const dummyData = [
  {
    symbol: "AAPL",
    price: 145.09,
    gap: 2.15,
    volume: 100000,
    exchange: "NASDAQ"
  },
  {
    symbol: "TSLA",
    price: 709.44,
    gap: 1.75,
    volume: 85000,
    exchange: "NASDAQ"
  }
];

app.get('/', (req, res) => {
  res.send('TradingView Proxy is running!');
});

app.post('/tv-screener', async (req, res) => {
  try {
    const response = await fetch('https://scanner.tradingview.com/america/scan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0',
        'Origin': 'https://www.tradingview.com',
        'Referer': 'https://www.tradingview.com/'
      },
      body: JSON.stringify(tvPayload)
    });

    const data = await response.json();

    console.log("TradingView API response:", data);

    if (!data.data || data.data.length === 0) {
      console.log("No live data from API, returning dummy data.");
      return res.json(dummyData);
    }

    const stocks = data.data.map(row => ({
      symbol: row.s,
      price: row.d[2],
      gap: row.d[4],
      volume: row.d[5],
      exchange: row.d[6]
    }));

    res.json(stocks);

  } catch (err) {
    console.error("Proxy error:", err);
    res.json(dummyData); // fallback dummy data on error
  }
});

app.listen(PORT, () => {
  console.log(`Proxy running on port ${PORT}`);
});
