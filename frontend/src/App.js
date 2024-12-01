import React, { useState } from 'react';
import StockChart from './StockChart';
import RegisterPurchase from './RegisterPurchase';
import ProfitLossAnalysis from './ProfitLossAnalysis';

const App = () => {
    const [symbol, setSymbol] = useState("AAPL");
    const [view, setView] = useState('chart'); // Estado para determinar qué vista mostrar

    return (
        <div>
            <h1>Stock Dashboard</h1>
            <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder="Enter stock symbol"
            />

            {/* Botones para alternar entre vistas */}
            <div>
                <button onClick={() => setView('chart')}>Show Stock Chart</button>
                <button onClick={() => setView('history')}>Register Purchase</button>
                <button onClick={() => setView('analysis')}>Profit/Loss Analysis</button>
            </div>

            {/* Renderizamos el componente correspondiente según el valor de `view` */}
            {view === 'chart' && <StockChart symbol={symbol} />}
            {view === 'history' && <RegisterPurchase symbol={symbol} />}
            {view === 'analysis' && <ProfitLossAnalysis symbol={symbol} />}
        </div>
    );
};

export default App;
