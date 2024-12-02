import React, { useState } from 'react';
import StockChart from './StockChart';
import RegisterPurchase from './RegisterPurchase';
import ProfitLossAnalysis from './ProfitLossAnalysis';  // Componente para mostrar todas las compras

const App = () => {
    const [view, setView] = useState('chart'); // Estado para cambiar vistas
    const [symbol, setSymbol] = useState("AMZN"); // Estado para el símbolo de acciones (solo si es necesario)

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
                <h1>
                    {view === 'chart' && 'Stock Chart'}
                    {view === 'history' && 'Register'}
                    {view === 'analysis' && 'Investments'}
                </h1>

                {/* Renderizar componentes basados en la vista seleccionada */}
                {view === 'chart' && <StockChart />}
                {view === 'history' && <RegisterPurchase />}
                
                {/* Para mostrar todas las compras de acciones */}
                {view === 'analysis' && <ProfitLossAnalysis />}
            </div>
        </div>
    );
};

export default App;
