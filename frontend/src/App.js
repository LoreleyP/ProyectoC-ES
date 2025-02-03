import React, { useState } from 'react';
import RegisterPurchase from './RegisterPurchase';
import ProfitLossAnalysis from './ProfitLossAnalysis';  // Componente para mostrar todas las compras
import SummaryAnalysis from './SummaryAnalysis';

const App = () => {
    const [view, setView] = useState('history'); // Estado para cambiar vistas
    
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
                    <li 
                        onClick={() => setView('summary')} 
                        className={view === 'summary' ? 'active' : ''}
                    >
                        📊 Sumary
                    </li>
                </ul>
            </div>

            {/* Contenido principal */}
            <div className="main-content">
                <h1>                    
                    {view === 'history' && 'Register'}
                    {view === 'analysis' && 'Investments'}
                    {view === 'summary' && 'Sumary'}
                </h1>

                {/* Renderizar componentes basados en la vista seleccionada */}
                {view === 'history' && <RegisterPurchase />}                
                {/* Para mostrar todas las compras de acciones */}
                {view === 'analysis' && <ProfitLossAnalysis />}
                {/* Para mostrar el resumen de todas las compras */}
                {view === 'summary' && <SummaryAnalysis />}
            </div>
        </div>
    );
};

export default App;
