import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProfitLossAnalysis.css';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ProfitLossAnalysis = () => {
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stockCache, setStockCache] = useState({
        prices: {},
        companyNames: {}
    });
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [
            {
                label: 'Ganancias/Pérdidas',
                data: [],
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    });
    const [sortType, setSortType] = useState('lexicographic'); // Estado para controlar el tipo de orden

    const loadStockPurchases = async () => {
        try {
            const response = await axios.get('http://localhost:8000/');
            const purchases = response.data;
            const stockSymbols = purchases.map(purchase => purchase.stock);

            // Consultamos los precios y nombres solo si no están en el caché
            const currentPrices = await getCurrentStockPrices(stockSymbols);
            const companyNames = await getCompanyNames(stockSymbols);

            setStockCache(prevCache => ({
                prices: { ...prevCache.prices, ...currentPrices },
                companyNames: { ...prevCache.companyNames, ...companyNames }
            }));

            // Agrupar las compras por cada acción (empresa)
            const groupedPurchases = purchases.reduce((acc, purchase) => {
                if (!acc[purchase.stock]) {
                    acc[purchase.stock] = {
                        companyName: companyNames[purchase.stock],
                        totalQuantity: 0,
                        totalUSDValue: 0,
                        costPrice: 0,
                        currentPrice: currentPrices[purchase.stock] || 'N/A',
                        profitOrLoss: 0,
                        profitLossPercentage: 0
                    };
                }

                acc[purchase.stock].totalQuantity += purchase.quantity;
                acc[purchase.stock].totalUSDValue += purchase.quantity * purchase.price;

                return acc;
            }, {});

            // Calculamos el precio de costo y Profit/Loss para cada acción
            for (const stock in groupedPurchases) {
                const stockData = groupedPurchases[stock];

                stockData.costPrice = stockData.totalUSDValue / stockData.totalQuantity;

                if (stockData.currentPrice !== 'N/A') {
                    stockData.profitOrLoss = (stockData.currentPrice - stockData.costPrice) * stockData.totalQuantity;
                    stockData.profitLossPercentage = ((stockData.currentPrice - stockData.costPrice) / stockData.costPrice) * 100;
                }
            }

            // Convertimos el objeto a un array
            const purchasesWithProfitLoss = Object.values(groupedPurchases);

            // Ordenamos inicialmente por el nombre de la acción (lexicográficamente)
            purchasesWithProfitLoss.sort((a, b) => a.companyName.localeCompare(b.companyName));

            setPurchases(purchasesWithProfitLoss);
            setLoading(false);

            // Creamos los datos para el gráfico
            const chartLabels = purchasesWithProfitLoss.map(purchase => purchase.companyName);
            const chartValues = purchasesWithProfitLoss.map(purchase => purchase.profitOrLoss);

            setChartData({
                labels: chartLabels,
                datasets: [
                    {
                        label: 'Ganancias/Pérdidas',
                        data: chartValues,
                        backgroundColor: chartValues.map(value => value >= 0 ? 'rgba(75, 192, 192, 0.2)' : 'rgba(255, 99, 132, 0.2)'),
                        borderColor: chartValues.map(value => value >= 0 ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)'),
                        borderWidth: 1,
                    },
                ],
            });

        } catch (err) {
            console.error("Error fetching stock purchases", err);
            setError("Error loading data");
            setLoading(false);
        }
    };

    const getCurrentStockPrices = async (symbols) => {
        const prices = {};
        const symbolsToFetch = [];

        for (const symbol of symbols) {
            if (!stockCache.prices[symbol]) {
                symbolsToFetch.push(symbol);
            } else {
                prices[symbol] = stockCache.prices[symbol];
            }
        }

        if (symbolsToFetch.length > 0) {
            try {
                const priceResponses = await Promise.all(symbolsToFetch.map(symbol =>
                    axios.get(`http://localhost:8000/stock/${symbol}`)
                ));

                priceResponses.forEach((response, index) => {
                    const symbol = symbolsToFetch[index];
                    prices[symbol] = response.data.c || null;
                });
            } catch (err) {
                console.error("Error fetching stock prices:", err);
            }
        }

        return prices;
    };

    const getCompanyNames = (symbols) => {
        const names = {};
        const symbolsToFetch = [];

        for (const symbol of symbols) {
            if (!stockCache.companyNames[symbol]) {
                symbolsToFetch.push(symbol);
            } else {
                names[symbol] = stockCache.companyNames[symbol];
            }
        }

        symbolsToFetch.forEach(symbol => {
            const companyNames = {
                AAPL: 'Apple',
                GOOGL: 'Google',
                AMZN: 'Amazon',
                MSFT: 'Microsoft',
                TSLA: 'Tesla',
                NVDA: 'NVIDIA',
                META: 'Meta Platforms',
                BRK_B: 'Berkshire Hathaway',
                MS: 'Morgan Stanley',
                V: 'Visa',
                JNJ: 'Johnson & Johnson',
                WMT: 'Walmart',
                UNH: 'UnitedHealth Group',
                PG: 'Procter & Gamble',
                DIS: 'Walt Disney',
                HD: 'Home Depot',
                PYPL: 'PayPal',
                VZ: 'Verizon',
                MA: 'Mastercard',
                INTC: 'Intel'
            };

            names[symbol] = companyNames[symbol] || symbol;
        });

        return names;
    };

    const handleSortChange = (e) => {
        const sortValue = e.target.value;
        setSortType(sortValue);

        let sortedPurchases = [...purchases];

        if (sortValue === 'lexicographic') {
            sortedPurchases.sort((a, b) => a.companyName.localeCompare(b.companyName));
        } else if (sortValue === 'asc') {
            sortedPurchases.sort((a, b) => a.profitOrLoss - b.profitOrLoss);
        } else if (sortValue === 'desc') {
            sortedPurchases.sort((a, b) => b.profitOrLoss - a.profitOrLoss);
        }

        setPurchases(sortedPurchases);
    };

    useEffect(() => {
        loadStockPurchases();
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="table-container">
            <h2>Stock Purchases Summary</h2>
            <div>
                <label htmlFor="sortType">Sort By: </label>
                <select id="sortType" value={sortType} onChange={handleSortChange}>
                    <option value="lexicographic">Lexicographic Order</option>
                    <option value="asc">Ascending by Profit/Loss</option>
                    <option value="desc">Descending by Profit/Loss</option>
                </select>
            </div>
            <table className="stock-table">
                <thead>
                    <tr>
                        <th>CompanyName</th>
                        <th>Total Quantity</th>
                        <th>USD Value</th>
                        <th>Cost Price</th>
                        <th>Profit/Loss (%)</th>
                        <th>Profit/Loss</th>
                    </tr>
                </thead>
                <tbody>
                    {purchases.map((purchase, index) => (
                        <tr key={index}>
                            <td>{purchase.companyName}</td>
                            <td>{purchase.totalQuantity}</td>
                            <td>${purchase.totalUSDValue.toFixed(2)}</td>
                            <td>${purchase.costPrice.toFixed(2)}</td>
                            <td style={{ color: purchase.profitLossPercentage >= 0 ? 'green' : 'red' }}>
                                {purchase.profitLossPercentage.toFixed(2)}%
                            </td>
                            <td style={{ color: purchase.profitOrLoss >= 0 ? 'green' : 'red' }}>
                                ${purchase.profitOrLoss.toFixed(2)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="chart-container">
                <h3>Profit/Loss over time</h3>
                <Bar data={chartData} options={{ responsive: true }} />
            </div>
        </div>
    );
};

export default ProfitLossAnalysis;
