const express = require('express');
const axios = require('axios');

const app = express();
const port = 3000;

// List of crypto trading pairs
const pairs = [
    "1INCH-USDT",
    "AAVE-USDT",
    "TLM-USDT",
    "ANKR-USDT",
    "BAL-USDT",
    "BAND-USDT",
    "BAT-USDT",
    "BTC-USDT",
    "BCH-USDT",
    "BNB-USDT",
    "ADA-USDT",
    "CTSI-USDT",
    "CELR-USDT",
    "LINK-USDT",
    "CLV-USDT",
    "COMP-USDT",
    "ATOM-USDT",
    "COTI-USDT",
    "DIA-USDT",
    "DOGE-USDT",
    "XEC-USDT",
    "EOS-USDT",
    "ETH-USDT",
    "ETC-USDT",
    "FTM-USDT",
    "FET-USDT",
    "FLOKI-USDT",
    "FLOW-USDT",
    "FLUX-USDT",
    "ILV-USDT",
    "IOTA-USDT",
    "KSM-USDT",
    "LTC-USDT",
    "LTO-USDT",
    "MKR-USDT",
    "POND-USDT",
    "DAR-USDT",
    "EGLD-USDT",
    "ALICE-USDT",
    "NEAR-USDT",
    "ONT-USDT",
    "MATIC-USDT",
    "PROM-USDT",
    "REEF-USDT",
    "SHIB-USDT",
    "SLP-USDT",
    "SUSHI-USDT",
    "SNX-USDT",
    "XTZ-USDT",
    "ZEC-USDT"
  ];  

// Fetch prices from KuCoin
async function getKuCoinPrice(pair) {
    try {
        const response = await axios.get(`https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=${pair}`);
        return response.data.data.price || null;
    } catch (error) {
        console.error(`Error fetching price from KuCoin for ${pair}: ${error.message}`);
        return null;
    }
}

// Fetch prices from Binance
async function getBinancePrice(pair) {
    const binancePair = pair.replace('-', ''); // Convert pair to Binance format
    try {
        const response = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${binancePair}`);
        return response.data.price || null;
    } catch (error) {
        console.error(`Error fetching price from Binance for ${binancePair}: ${error.message}`);
        return null;
    }
}

// Check for arbitrage opportunities
async function checkArbitrage(pair) {
    const kuCoinPrice = parseFloat(await getKuCoinPrice(pair));
    const binancePrice = parseFloat(await getBinancePrice(pair));

    if (kuCoinPrice === null || binancePrice === null) {
        return null;
    }

    console.log(`${pair} - KuCoin Price: ${kuCoinPrice}, Binance Price: ${binancePrice}`);

    const threshold = 0.005; // Arbitrage threshold: 0.5%

    if (kuCoinPrice < binancePrice * (1 - threshold)) {
        return {
            pair,
            opportunity: 'Buy on KuCoin, Sell on Binance',
            kuCoinPrice,
            binancePrice
        };
    } else if (binancePrice < kuCoinPrice * (1 - threshold)) {
        return {
            pair,
            opportunity: 'Buy on Binance, Sell on KuCoin',
            kuCoinPrice,
            binancePrice
        };
    } else {
        return null;
    }
}

app.get('/check-arbitrage', async (req, res) => {
    try {
        const results = await Promise.all(pairs.map(pair => checkArbitrage(pair)));

        const opportunities = results.filter(result => result !== null);

        res.json(opportunities);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

app.listen(port, () => {
    console.log(`Arbitrage bot listening at http://localhost:${port}`);
});
