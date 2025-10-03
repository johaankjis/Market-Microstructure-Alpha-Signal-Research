# Market Microstructure Alpha Signal Research

A professional quantitative finance platform for Limit Order Book (LOB) data analysis, signal engineering, and cost-aware backtesting. This application provides a comprehensive suite of tools for researching and developing alpha signals from market microstructure data.

## 🚀 Features

### 1. **Data Upload & Management**
- Upload LOB (Limit Order Book) snapshots in CSV format
- Support for multiple symbols and real-time data processing
- Automatic data validation and parsing
- Visual order book snapshot viewer with bid/ask depth display

### 2. **Signal Engineering**
- Advanced feature extraction from LOB data including:
  - **Imbalance Features**: Volume, depth, and price imbalances
  - **Spread Features**: Relative and effective spread metrics
  - **Volatility Features**: Microprice and spread volatility
  - **Order Flow Features**: Order flow toxicity and VPIN (Volume-Synchronized Probability of Informed Trading)
- Regularization methods to prevent overfitting:
  - **Lasso (L1)**: Promotes sparsity in feature selection
  - **Ridge (L2)**: Shrinks coefficients uniformly
  - **Elastic Net**: Combined L1 and L2 regularization
- Configurable alpha signal generation with confidence scoring

### 3. **Cost-Aware Backtesting**
- Realistic backtesting engine with:
  - Transaction cost modeling (configurable basis points)
  - Slippage simulation
  - Position size management
  - Walk-forward validation
- Multiple rebalancing frequencies (tick, second, minute)
- Comprehensive performance metrics:
  - Total Return
  - Sharpe Ratio
  - Sortino Ratio
  - Max Drawdown
  - Win Rate
  - Profit Factor
  - Calmar Ratio
  - Information Ratio

### 4. **Results & Analytics**
- Interactive equity curve visualization
- Signal distribution analysis
- Feature importance charts
- Performance heatmaps
- Trade history and statistics

## 🛠️ Technology Stack

- **Frontend Framework**: [Next.js 15](https://nextjs.org/) with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.x
- **UI Components**: Radix UI primitives
- **Charts**: Recharts
- **State Management**: In-memory data store
- **Icons**: Lucide React

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or pnpm package manager

### Setup

1. Clone the repository:
```bash
git clone https://github.com/johaankjis/Market-Microstructure-Alpha-Signal-Research.git
cd Market-Microstructure-Alpha-Signal-Research
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📊 Usage

### 1. Upload LOB Data

Navigate to the **Data Upload** tab and upload a CSV file with the following format:

```csv
timestamp,symbol,bid1,bid2,bid3,bid4,bid5,bidsize1,bidsize2,bidsize3,bidsize4,bidsize5,ask1,ask2,ask3,ask4,ask5,asksize1,asksize2,asksize3,asksize4,asksize5,mid_price,spread
1609459200000,AAPL,132.50,132.49,132.48,132.47,132.46,100,150,200,120,80,132.52,132.53,132.54,132.55,132.56,90,140,180,110,70,132.51,0.02
```

**CSV Columns**:
- `timestamp`: Unix timestamp in milliseconds
- `symbol`: Ticker symbol (e.g., AAPL, MSFT)
- `bid1-bid5`: Top 5 bid prices
- `bidsize1-bidsize5`: Sizes at each bid level
- `ask1-ask5`: Top 5 ask prices
- `asksize1-asksize5`: Sizes at each ask level
- `mid_price`: Mid price of the order book
- `spread`: Bid-ask spread

### 2. Generate Alpha Signals

Switch to the **Signal Engineering** tab:

1. Select a symbol from the loaded data
2. Configure regularization parameters:
   - **Method**: Lasso, Ridge, or Elastic Net
   - **Alpha**: Regularization strength (0.0 - 1.0)
   - **L1 Ratio**: For Elastic Net (0.0 - 1.0)
   - **Max Features**: Maximum number of features to use
3. Click "Generate Signals" to extract features and create alpha signals

### 3. Run Backtests

Go to the **Backtesting** tab:

1. Select a symbol with generated signals
2. Configure backtest parameters:
   - **Initial Capital**: Starting capital amount
   - **Transaction Cost**: Cost in basis points per trade
   - **Slippage**: Expected slippage in basis points
   - **Max Position Size**: Maximum position size per trade
   - **Rebalance Frequency**: How often to rebalance (tick/second/minute)
   - **Walk-Forward Window**: Number of observations for training
   - **Validation Window**: Number of observations for validation
3. Click "Run Backtest" to execute the simulation

### 4. Analyze Results

View comprehensive results in the **Results & Analytics** tab:
- Performance metrics summary
- Equity curve over time
- Drawdown analysis
- Trade history
- Signal distribution
- Feature importance rankings

## 📁 Project Structure

```
├── app/
│   └── page.tsx              # Main application page with tabs
├── components/
│   ├── backtest-config.tsx   # Backtesting configuration UI
│   ├── backtest-results.tsx  # Results display and metrics
│   ├── data-summary.tsx      # Data statistics dashboard
│   ├── data-upload.tsx       # CSV file upload interface
│   ├── equity-curve-chart.tsx          # Equity curve visualization
│   ├── feature-importance-chart.tsx    # Feature importance display
│   ├── lob-snapshot-viewer.tsx         # Order book viewer
│   ├── performance-heatmap.tsx         # Performance heatmap
│   ├── signal-distribution-chart.tsx   # Signal distribution
│   ├── signal-generator-ui.tsx         # Signal generation interface
│   └── ui/                   # Reusable UI components
├── lib/
│   ├── backtester.ts         # Backtesting engine implementation
│   ├── data-store.ts         # In-memory data storage
│   ├── lob-processor.ts      # LOB data processing utilities
│   ├── signal-generator.ts   # Alpha signal generation logic
│   ├── types.ts              # TypeScript type definitions
│   └── utils.ts              # Utility functions
├── styles/                   # Global styles
├── public/                   # Static assets
├── next.config.mjs           # Next.js configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Project dependencies
```

## 🔬 Core Components

### LOBProcessor
Processes raw limit order book data and extracts microstructure features:
- Calculates volume, depth, and price imbalances
- Computes spread metrics (relative, effective)
- Measures volatility (microprice, spread)
- Calculates order flow toxicity and VPIN

### SignalGenerator
Generates alpha signals from LOB features with regularization:
- Applies Lasso (L1), Ridge (L2), or Elastic Net regularization
- Feature selection based on correlation with returns
- Confidence scoring based on signal quality
- Walk-forward feature selection

### Backtester
Cost-aware backtesting engine:
- Simulates realistic execution with costs and slippage
- Manages positions and calculates PnL
- Tracks equity curve and drawdowns
- Computes comprehensive performance metrics

### DataStore
In-memory data management:
- Stores LOB snapshots by symbol
- Manages alpha signals
- Stores backtest results
- Provides statistics and summary data

## 📈 Signal Features

The platform extracts the following features from LOB data:

| Feature | Description |
|---------|-------------|
| **Volume Imbalance** | Difference between bid and ask volumes |
| **Depth Imbalance** | Imbalance across multiple price levels |
| **Price Imbalance** | Weighted price imbalance |
| **Relative Spread** | Spread relative to mid price |
| **Effective Spread** | Cost of immediate execution |
| **Microprice Volatility** | Volatility of the microprice |
| **Spread Volatility** | Volatility of the bid-ask spread |
| **Order Flow Toxicity** | Measure of informed trading |
| **VPIN** | Volume-Synchronized Probability of Informed Trading |

## 🎯 Performance Metrics

The backtesting engine calculates:

- **Total Return**: Overall portfolio return
- **Sharpe Ratio**: Risk-adjusted return (annualized)
- **Sortino Ratio**: Downside risk-adjusted return
- **Max Drawdown**: Largest peak-to-trough decline
- **Win Rate**: Percentage of profitable trades
- **Profit Factor**: Gross profit / gross loss ratio
- **Calmar Ratio**: Return / max drawdown
- **Information Ratio**: Risk-adjusted excess return
- **Average Trade**: Mean PnL per trade
- **Total Trades**: Number of executed trades

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is for research and educational purposes.

## 🔗 Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Radix UI](https://www.radix-ui.com)

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Note**: This is a research platform for educational purposes. Past performance does not guarantee future results. Always conduct thorough testing before using any trading strategies in live markets.
