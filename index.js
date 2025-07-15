const express = require('express');
const fetch = require('node-fetch').default; // Critical change here
const app = express();
const PORT = 3000;

app.use(express.json());

const tvConfig = {
  filter: [],
  symbols: { query: { types: [] }, tickers: [] },
  columns: ['name', 'close', 'change', 'volume', 'exchange'],
  sort: { sortBy: 'change', sortOrder: 'desc' },
  options: { lang: 'en' },
  range: [0, 20]
};

app.get('/', (req, res) => res.send('Proxy is working!'));

app.post('/tv-screener', async (req, res) => {
  try {
    const response = await fetch('https://scanner.tradingview.com/america/scan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0',
        'Origin': 'https://www.tradingview.com'
      },
      body: JSON.stringify(tvConfig)
    });
    
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("API Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
