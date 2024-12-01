import React, { useState, useEffect } from 'react';

const ProfitLossAnalysis = ({ symbol }) => {
    const [purchases, setPurchases] = useState([]);
    const [currentStockPrice, setCurrentStockPrice] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            // Obtener datos históricos de compras
            const purchasesResponse = await fetch(`http://localhost:8000/${symbol}`);
            if (!purchasesResponse.ok) {
                throw new Error('Error fetching historical purchases data');
            }
            const purchasesData = await purchasesResponse.json();
            setPurchases(purchasesData);

            // Obtener datos de precio actual del stock
            const stockResponse = await fetch(`http://localhost:8000/stock/${symbol}`);
            if (!stockResponse.ok) {
                throw new Error('Error fetching stock data');
            }
            const stockData = await stockResponse.json();
            setCurrentStockPrice(stockData.results[0].c); // Campo "c" es el precio actual

            setLoading(false);
            setError(null);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [symbol]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    const calculateProfitLoss = () => {
        let totalProfitLoss = 0;

        const analysis = purchases.map((purchase) => {
            const profitLoss = (currentStockPrice - purchase.price) * purchase.quantity;
            totalProfitLoss += profitLoss;

            return {
                id: purchase.id,
                stockDate: new Date(purchase.stock_date).toLocaleDateString(),
                purchasePrice: purchase.price,
                currentStockPrice: currentStockPrice,
                quantity: purchase.quantity,
                profitLoss: profitLoss,
            };
        });

        return { analysis, totalProfitLoss };
    };

    const { analysis, totalProfitLoss } = calculateProfitLoss();

    return (
        <div>
            <h2>{symbol} Profit/Loss Analysis</h2>
            <table border="1" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                <thead>
                    <tr>
                        <th>Stock Date</th>
                        <th>Purchase Price</th>
                        <th>Current Price</th>
                        <th>Quantity</th>
                        <th>Profit/Loss</th>
                    </tr>
                </thead>
                <tbody>
                    {analysis.map((item) => (
                        <tr key={item.id}>
                            <td>{item.stockDate}</td>
                            <td>${item.purchasePrice.toFixed(2)}</td>
                            <td>${item.currentStockPrice.toFixed(2)}</td>
                            <td>{item.quantity}</td>
                            <td
                                style={{
                                    color: item.profitLoss >= 0 ? 'green' : 'red',
                                }}
                            >
                                ${item.profitLoss.toFixed(2)}
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan="4" style={{ textAlign: 'right', fontWeight: 'bold' }}>
                            Total Profit/Loss:
                        </td>
                        <td
                            style={{
                                fontWeight: 'bold',
                                color: totalProfitLoss >= 0 ? 'green' : 'red',
                            }}
                        >
                            ${totalProfitLoss.toFixed(2)}
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
};

export default ProfitLossAnalysis;
