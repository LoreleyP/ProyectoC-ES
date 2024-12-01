import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import Chart from 'chart.js/auto';

const StockChart = ({ symbol }) => {
    const [chartData, setChartData] = useState({
        labels: ['Prices'], // Etiqueta genérica para todas las barras
        datasets: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const generateColor = () => {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        return `rgba(${r}, ${g}, ${b}, 0.5)`;
    };

    const loadData = async () => {
        try {
            // Obtener datos históricos de compras
            const purchasesResponse = await fetch(`http://localhost:8000/${symbol}`);
            if (!purchasesResponse.ok) {
                throw new Error('Error fetching historical data');
            }
            const purchaseData = await purchasesResponse.json();

            // Obtener datos de precio actual del stock
            const stockResponse = await fetch(`http://localhost:8000/stock/${symbol}`);
            if (!stockResponse.ok) {
                throw new Error('Error fetching stock data');
            }
            const stockData = await stockResponse.json();

            if (!stockData || !stockData.results || stockData.results.length === 0) {
                throw new Error('No stock data available');
            }

            // Crear dataset para el precio del stock
            const stockPriceDataset = {
                label: 'Stock Price',
                data: [stockData.results[0].c], // Precio actual
                backgroundColor: 'rgba(75, 192, 192, 0.5)'
            };

            // Crear datasets para cada compra
            const purchaseDatasets = purchaseData.map(item => ({
                label: `Purchase Price (ID: ${item.id})`,
                data: [item.price], // Precio de compra
                backgroundColor: generateColor(),
            }));

            // Configurar datos del gráfico
            setChartData({
                labels: ['Prices'], // Etiqueta genérica
                datasets: [stockPriceDataset, ...purchaseDatasets] // Combinar todos los datasets
            });

            setLoading(false);
            setError(false);
        } catch (error) {
            setError(`Error loading data: ${error.message}`);
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData(); // Cargar todos los datos al montar el componente
    }, [symbol]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h2>{symbol} Stock Price</h2>
            <Bar data={chartData} /> {/* Gráfico de barras */}
        </div>
    );
};

export default StockChart;
