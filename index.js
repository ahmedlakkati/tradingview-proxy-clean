const express = require('express');
const fetch = require('node-fetch'); // Make sure this line exists
const app = express();
const PORT = 3000;

// Add this middleware to parse JSON
app.use(express.json());

const tvPostBody = {
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
    // Use node-fetch properly
    const response = await fetch('https://scanner.tradingview.com/america/scan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0'
      },
      body: JSON.stringify(tvPostBody)
    });
    
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy running on port ${PORT}`);
});
