import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import Chart from 'chart.js/auto';

const StockHistory = ({ symbol }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);

    // Estados del formulario de compra
    const [purchaseAmount, setPurchaseAmount] = useState('');
    const [purchasePrice, setPurchasePrice] = useState('');
    const [purchaseDate, setPurchaseDate] = useState('');

    const fetchData = async () => {
        try {
            const response = await fetch(`http://localhost:8000/stock/history`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ticker: symbol,
                    start_date: '2023-11-27',
                    end_date: '2024-11-30',
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch stock history');
            }

            const result = await response.json();
            if(!result){
                setError("sin datos");
                setLoading(false);
            }
            setData(result);
            setLoading(false);
        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [symbol]);

    const handlePurchase = async (e) => {
        e.preventDefault();

        const purchaseData = {
            stock: symbol,               // Símbolo de la acción
            name: "Stock Name",          // Este campo puedes actualizarlo con datos reales
            price: parseFloat(purchasePrice),        // Convertir el precio a número flotante
            quantity: parseInt(purchaseAmount, 10), // Convertir la cantidad a número entero
            currency: "USD",
            stock_date: new Date(purchaseDate).toISOString(), // Convertir a formato ISO
            purchase_date: new Date().toISOString(),          // Fecha actual en ISO
        };
        console.log("purchaseData:",purchaseData)
        try {
            const response = await fetch("http://localhost:8000/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(purchaseData),
            });

            if (!response.ok) {
                throw new Error("Error al realizar la compra");
            }

            const result = await response.json();
            console.log("Compra exitosa:", result);

            setPurchaseAmount('');
            setPurchasePrice('');
            setPurchaseDate('');
            setShowForm(false);
        } catch (error) {
            console.error("Error al confirmar la compra:", error.message);
            alert("Hubo un error al confirmar la compra. Por favor, inténtalo de nuevo.");
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    const chartData = {
        labels: data.map(item => new Date(Number(item.date)).toLocaleDateString()),
        datasets: [
            {
                label: `${symbol} Stock Price`,
                data: data.map(item => item.close),
                fill: false,
                borderColor: 'rgba(75, 192, 192, 1)',
                tension: 0.1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            tooltip: {
                callbacks: {
                    title: tooltipItem => tooltipItem[0].label,
                    label: tooltipItem => `Close: ${tooltipItem.raw}`,
                },
            },
        },
        onClick: (event, elements) => {
            if (elements.length > 0) {
                const datasetIndex = elements[0].datasetIndex;
                const index = elements[0].index;
                const clickedPrice = chartData.datasets[datasetIndex].data[index];
                const clickedDate = chartData.labels[index];

                setPurchasePrice(clickedPrice);
                setPurchaseDate(clickedDate);
                setShowForm(true);
            }
        },
    };

    return (
        <div>
            <h2>{symbol} Stock History</h2>
            <Line data={chartData} options={options} />
            {showForm && (
                <form onSubmit={handlePurchase} style={{ marginTop: '20px' }}>
                    <div>
                        <label>Cantidad a comprar:</label>
                        <input
                            type="number"
                            value={purchaseAmount}
                            onChange={e => setPurchaseAmount(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label>Precio por acción:</label>
                        <input type="number" value={purchasePrice} readOnly />
                    </div>
                    <div>
                        <label>Fecha:</label>
                        <input type="text" value={purchaseDate} readOnly />
                    </div>
                    <button type="submit">Confirmar compra</button>
                </form>
            )}
        </div>
    );
};

export default StockHistory;
