import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProfitLossAnalysis.css';

const ProfitLossAnalysis = () => {
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stockCache, setStockCache] = useState({
        prices: {},
        companyNames: {}
    });

    const loadStockPurchases = async () => {
        try {
            // Realizamos la petición para obtener las compras de acciones
            const response = await axios.get('http://localhost:8000/');
            const purchases = response.data;

            // Obtenemos los símbolos de las acciones para realizar las consultas
            const stockSymbols = purchases.map(purchase => purchase.stock);

            // Consultamos los precios y nombres solo si no están en el caché
            const currentPrices = await getCurrentStockPrices(stockSymbols);
            const companyNames = await getCompanyNames(stockSymbols);

            // Actualizamos el caché solo con los valores nuevos
            setStockCache(prevCache => ({
                prices: { ...prevCache.prices, ...currentPrices },
                companyNames: { ...prevCache.companyNames, ...companyNames }
            }));

            // Calculamos el Profit/Loss para cada compra
            const purchasesWithProfitLoss = purchases.map((purchase) => {
                const currentPrice = stockCache.prices[purchase.stock] || currentPrices[purchase.stock];
                const companyName = stockCache.companyNames[purchase.stock] || companyNames[purchase.stock];

                // Si no tenemos el precio o el nombre de la compañía, los marcamos como 'N/A'
                if (currentPrice === null || isNaN(currentPrice)) {
                    return { ...purchase, currentPrice: 'N/A', profitOrLoss: 'N/A', profitLossPercentage: 'N/A' };
                }

                // Calculamos el Profit/Loss y el porcentaje de Profit/Loss
                const profitOrLoss = (currentPrice - purchase.price) * purchase.quantity;
                const profitLossPercentage = ((currentPrice - purchase.price) / purchase.price) * 100;

                return { ...purchase, currentPrice, profitOrLoss, profitLossPercentage, companyName };
            });

            // Actualizamos el estado con las compras que tienen Profit/Loss calculado
            setPurchases(purchasesWithProfitLoss);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching stock purchases", err);
            setError("Error loading data");
            setLoading(false);
        }
    };

    // Esta función obtiene los precios de las acciones en función del caché y la API de Finnhub
    const getCurrentStockPrices = async (symbols) => {
        const prices = {};
        const symbolsToFetch = [];

        // Verificamos si el precio de cada símbolo ya está en el caché, si no, lo marcamos para obtenerlo
        for (const symbol of symbols) {
            if (!stockCache.prices[symbol]) {
                symbolsToFetch.push(symbol);
            } else {
                prices[symbol] = stockCache.prices[symbol];
            }
        }

        // Si hay símbolos para los que hacer peticiones a la API
        if (symbolsToFetch.length > 0) {
            try {
                const priceResponses = await Promise.all(symbolsToFetch.map(symbol =>
                    axios.get(`http://localhost:8000/stock/${symbol}`)
                ));

                priceResponses.forEach((response, index) => {
                    const symbol = symbolsToFetch[index];
                    prices[symbol] = response.data.c || null; // Cambié 'results[0]?.c' por 'data.c' según la estructura de la API Finnhub
                });
            } catch (err) {
                console.error("Error fetching stock prices:", err);
            }
        }

        return prices;
    };

    // Esta función obtiene los nombres de las compañías en función del caché y valores fijos
    const getCompanyNames = (symbols) => {
        const names = {};
        const symbolsToFetch = [];

        // Verificamos si el nombre de la compañía ya está en el caché, si no, lo marcamos para obtenerlo
        for (const symbol of symbols) {
            if (!stockCache.companyNames[symbol]) {
                symbolsToFetch.push(symbol);
            } else {
                names[symbol] = stockCache.companyNames[symbol];
            }
        }

        // Si hay símbolos para los que hacer peticiones
        symbolsToFetch.forEach(symbol => {
            // Se asignan valores fijos en caso de que no haya datos
            const companyNames = {
                AAPL: 'Apple',
                GOOG: 'Google',
                AMZN: 'Amazon',
                MSFT: 'Microsoft',
            };

            names[symbol] = companyNames[symbol] || symbol;
        });

        return names;
    };

    useEffect(() => {
        loadStockPurchases(); // Llamada a la función para cargar las compras y obtener la data
    }, []); // El array vacío asegura que solo se ejecute una vez al montar el componente

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
