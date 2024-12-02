import React, { useState } from 'react';
import StockChart from './StockChart';
import RegisterPurchase from './RegisterPurchase';
import ProfitLossAnalysis from './ProfitLossAnalysis';

const App = () => {
    const [view, setView] = useState('chart'); 
    const [symbol, setSymbol] = useState("AMZN");

    return (
        <div className="app-container">
            {/* Menú lateral */}
            <div className="sidebar">
                <h2>GACT</h2>
                <ul>                    
                    <li 
                        onClick={() => setView('history')} 
                        className={view === 'history' ? 'active' : ''}
                    >
                        💰 Register
                    </li>
                    <li 
                        onClick={() => setView('analysis')} 
                        className={view === 'analysis' ? 'active' : ''}
                    >
                        📊 Investments
                    </li>
                </ul>
            </div>

            {/* Contenido principal */}
            <div className="main-content">
                {/* Renderiza la barra de entrada solo en la vista "Investments" */}
                {view === 'analysis' && (
                    <input
                        type="text"
                        value={symbol}
                        onChange={(e) => setSymbol(e.target.value)}
                        placeholder="Enter stock symbol"
                    />
                )}
                
                <h1>
                    {view === 'chart' && 'Stock Chart'}
                    {view === 'history' && 'Register'}
                    {view === 'analysis' && 'Investments'}
                </h1>

                {/* Renderizamos el componente correspondiente según el valor de view */}
                {view === 'chart' && <StockChart />}
                {view === 'history' && <RegisterPurchase />}
                {view === 'analysis' && <ProfitLossAnalysis symbol={symbol} />}
            </div>
        </div>
    );
};

export default App;