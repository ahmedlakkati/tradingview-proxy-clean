const express = require('express');
const app = express();
const PORT = 4000; // Changed to 4000 to avoid any port conflicts

// Middleware
app.use(express.json());

// Test route
app.get('/', (req, res) => {
    console.log('GET / received');
    res.send('Server is working!');
});

// TradingView route
app.post('/tv-screener', (req, res) => {
    console.log('POST /tv-screener received');
    res.json({ 
        status: 'success',
        message: 'Basic endpoint working', 
        nextStep: 'Now implement TradingView logic here' 
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`\nSERVER READY\nAccess these endpoints:`);
    console.log(`http://localhost:${PORT}`);
    console.log(`http://localhost:${PORT}/tv-screener`);
});
