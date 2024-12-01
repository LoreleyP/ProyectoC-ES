import React, { useState } from 'react';
import StockChart from './StockChart';
import RegisterPurchase from './RegisterPurchase';
import ProfitLossAnalysis from './ProfitLossAnalysis';

const App = () => {
    const [view, setView] = useState('history'); // Estado para determinar qué vista mostrar

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
                {/* Cambia el texto del encabezado dinámicamente según la vista seleccionada */}
                <h1>
                    {view === 'chart' && 'Stock Chart'}
                    {view === 'history' && 'Register'}
                    {view === 'analysis' && 'Investments'}
                </h1>

                {/* Renderizamos el componente correspondiente según el valor de `view` */}
                {view === 'chart' && <StockChart />}
                {view === 'history' && <RegisterPurchase />}
                {view === 'analysis' && <ProfitLossAnalysis />}
            </div>
        </div>
    );
};

export default App;
