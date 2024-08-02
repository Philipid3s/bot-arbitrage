const express = require('express');
const axios = require('axios');
const fs = require('fs');

// Read configuration file
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

const app = express();
const port = config.port;
const pairs = config.pairs;
const threshold = config.threshold;
const historicalPriceLimit = config.historicalPriceLimit;
const kucoinApiUrl = config.kucoinApiUrl;
const binanceApiUrl = config.binanceApiUrl;
const binanceKlinesApiUrl = config.binanceKlinesApiUrl;

// Fetch prices from KuCoin
async function getKuCoinPrice(pair) {
    try {
        const response = await axios.get(`${kucoinApiUrl}${pair}`);
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
        const response = await axios.get(`${binanceApiUrl}${binancePair}`);
        return response.data.price || null;
    } catch (error) {
        console.error(`Error fetching price from Binance for ${binancePair}: ${error.message}`);
        return null;
    }
}

// Fetch historical prices for trend analysis
async function getHistoricalPrices(pair, limit = historicalPriceLimit) {
    const binancePair = pair.replace('-', ''); // Convert pair to Binance format
    try {
        const response = await axios.get(`${binanceKlinesApiUrl}${binancePair}&interval=1h&limit=${limit}`);
        return response.data.map(candle => parseFloat(candle[4])); // Closing prices
    } catch (error) {
        console.error(`Error fetching historical prices for ${binancePair}: ${error.message}`);
        return null;
    }
}

// Determine if the price trend is bullish
function isBullishTrend(historicalPrices) {
    if (!historicalPrices || historicalPrices.length < 2) {
        return false;
    }
    const movingAverage = historicalPrices.reduce((sum, price) => sum + price, 0) / historicalPrices.length;
    const currentPrice = historicalPrices[historicalPrices.length - 1];
    return currentPrice > movingAverage;
}

// Check for arbitrage opportunities
async function checkArbitrage(pair) {
    const kuCoinPrice = parseFloat(await getKuCoinPrice(pair));
    const binancePrice = parseFloat(await getBinancePrice(pair));

    if (kuCoinPrice === null || binancePrice === null) {
        return null;
    }

    console.log(`${pair} - KuCoin Price: ${kuCoinPrice}, Binance Price: ${binancePrice}`);

    let opportunity = null;
    if (kuCoinPrice < binancePrice * (1 - threshold)) {
        opportunity = {
            pair,
            opportunity: 'Buy on KuCoin, Sell on Binance',
            kuCoinPrice,
            binancePrice
        };
    } else if (binancePrice < kuCoinPrice * (1 - threshold)) {
        opportunity = {
            pair,
            opportunity: 'Buy on Binance, Sell on KuCoin',
            kuCoinPrice,
            binancePrice
        };
    }

    if (opportunity) {
        const historicalPrices = await getHistoricalPrices(pair);
        const bullishTrend = isBullishTrend(historicalPrices);

        if (bullishTrend) {
            return opportunity;
        }
    }

    return null;
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
