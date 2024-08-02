# Crypto Arbitrage Bot

This is a Node.js application for tracking arbitrage opportunities between Binance and KuCoin for a list of cryptocurrency trading pairs. The bot only considers arbitrage opportunities if the price trend is bullish.

## Features

- Fetches real-time prices from KuCoin and Binance.
- Checks for arbitrage opportunities based on price discrepancies.
- Only triggers trades if the price trend is bullish.
- Configurable list of trading pairs and other parameters.

## Prerequisites

- Node.js (v12 or later)
- npm (Node Package Manager)

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/crypto-arbitrage-bot.git
    ```
2. Navigate to the project directory:
    ```sh
    cd crypto-arbitrage-bot
    ```
3. Install the dependencies:
    ```sh
    npm install
    ```

## Configuration

Update the `config.json` file to configure the list of trading pairs, API endpoints, and other parameters.

Example `config.json`:
```json
{
  "port": 3000,
  "pairs": [
    "1INCH-USDT",
    "AAVE-USDT",
    "TLM-USDT",
    "ANKR-USDT",
    ...
  ],
  "threshold": 0.01,
  "historicalPriceLimit": 10,
  "kucoinApiUrl": "https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=",
  "binanceApiUrl": "https://api.binance.com/api/v3/ticker/price?symbol=",
  "binanceKlinesApiUrl": "https://api.binance.com/api/v3/klines?symbol="
}
```

## Usage

Usage
Start the application by running:

```sh
npm start
```

The bot will start listening for arbitrage opportunities on the specified port (default is 3000).

You can check for arbitrage opportunities by visiting:

```bash
http://localhost:3000/check-arbitrage
```

## How It Works

1. Fetches real-time prices from KuCoin and Binance for the specified trading pairs.

2. Checks if there's an arbitrage opportunity based on a configurable threshold.

3. If an opportunity is found, fetches historical prices to determine if the price trend is bullish.

4. Only considers the opportunity if the trend is bullish.
