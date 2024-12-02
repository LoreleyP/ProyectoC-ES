import React, { useEffect, useState } from 'react';

const InvestmentsTable = () => {
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/stocks') // Cambia la URL si es necesario
      .then(response => response.json())
      .then(data => setStocks(data))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  return (
    <div>
      <h1>Investment Table</h1>
      <table>
        <thead>
          <tr>
            <th>Company</th>
            <th>Purchase Date</th>
            <th>Quantity</th>
            <th>Purchase Price</th>
            <th>Current Price</th>
            <th>Profit/Loss</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock, index) => (
            <tr key={index}>
              <td>{stock.company}</td>
              <td>{stock.date}</td>
              <td>{stock.quantity}</td>
              <td>{stock.purchasePrice}</td>
              <td>{stock.currentPrice}</td>
              <td>{(stock.currentPrice - stock.purchasePrice) * stock.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InvestmentsTable;
