import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProfitLossAnalysis.css';

const ProfitLossAnalysis = () => {
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadStockPurchases = async () => {
        try {
            const response = await axios.get('http://localhost:8000/'); 
            const purchases = response.data;

            const purchasesWithProfitLoss = await Promise.all(
                purchases.map(async (purchase) => {
                    const currentPrice = await getCurrentStockPrice(purchase.stock);

                    if (currentPrice === null || isNaN(currentPrice)) {
                        return { ...purchase, currentPrice: 'N/A', profitOrLoss: 'N/A', profitLossPercentage: 'N/A' };
                    }

                    const profitOrLoss = (currentPrice - purchase.price) * purchase.quantity;
                    const profitLossPercentage = ((currentPrice - purchase.price) / purchase.price) * 100;

                    const companyName = await getCompanyName(purchase.stock);
                    return { ...purchase, currentPrice, profitOrLoss, profitLossPercentage, companyName };
                })
            );

            setPurchases(purchasesWithProfitLoss);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching stock purchases", err);
            setError("Error loading data");
            setLoading(false);
        }
    };

    const getCurrentStockPrice = async (symbol) => {
        try {
            const response = await axios.get(`http://localhost:8000/stock/${symbol}`);
            return response.data.results[0].c;
        } catch (err) {
            console.error(`Error fetching current price for stock ${symbol}:`, err);
            return null;
        }
    };

    const getCompanyName = async (symbol) => {
        const companyNames = {
            AAPL: 'Apple',
            GOOG: 'Google',
            AMZN: 'Amazon',
            MSFT: 'Microsoft',
        };
        return companyNames[symbol] || symbol;
    };

    useEffect(() => {
        loadStockPurchases(); 
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="table-container">
            <h2>Stock Purchases</h2> 
            <table className="stock-table">
                <thead>
                    <tr>
                        <th>Transaction ID</th> 
                        <th>Company</th>
                        <th>Purchase Date</th>
                        <th>Quantity</th>
                        <th>Purchase Price</th>
                        <th>Current Price</th>
                        <th>Profit/Loss</th>
                        <th>Profit/Loss (%)</th>
                    </tr>
                </thead>
                <tbody>
                    {purchases.map((purchase) => (
                        <tr key={purchase.id}>
                            <td>{purchase.id}</td> 
                            <td>{purchase.companyName}</td>
                            <td>{new Date(purchase.purchase_date).toLocaleDateString()}</td>
                            <td>{purchase.quantity}</td>
                            <td>${purchase.price.toFixed(2)}</td>
                            <td>{purchase.currentPrice !== 'N/A' ? `$${purchase.currentPrice.toFixed(2)}` : 'N/A'}</td>
                            <td style={{ color: purchase.profitOrLoss >= 0 ? 'green' : 'red' }}>
                                {purchase.profitOrLoss !== 'N/A' ? `$${purchase.profitOrLoss.toFixed(2)}` : 'N/A'}
                            </td>
                            <td style={{ color: purchase.profitLossPercentage >= 0 ? 'green' : 'red' }}>
                                {purchase.profitLossPercentage !== 'N/A' ? `${purchase.profitLossPercentage.toFixed(2)}%` : 'N/A'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProfitLossAnalysis;

