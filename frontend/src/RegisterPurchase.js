import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './RegisterPurchase.css'; 

const RegisterPurchase = () => {
    const [purchaseDate, setPurchaseDate] = useState(new Date());
    const [companyName, setCompanyName] = useState('');
    const [purchaseValue, setPurchaseValue] = useState('');
    const [sharesAmount, setSharesAmount] = useState('');

    const fetchPurchaseValue = async () => {
        if (!companyName || !purchaseDate) return;

        const formattedDate = purchaseDate.toISOString().split('T')[0]; // Formatear la fecha a YYYY-MM-DD
        const payload = {
            ticker: companyName,
            start_date: formattedDate,
            end_date: formattedDate,
        };

        try {
            const response = await fetch('http://localhost:8000/stock/history', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error('Error fetching purchase value');
            }

            const data = await response.json();
            if (data.length > 0) {
                setPurchaseValue(data[0].close); // Actualizar el campo "purchase value" con el valor "close"
            } else {
                setPurchaseValue(''); // Vaciar el campo si no hay datos
            }
        } catch (error) {
            console.error('Error fetching purchase value:', error);
            setPurchaseValue('');
        }
    };

    // Llamar al API cada vez que cambie la compañía o la fecha
    useEffect(() => {
        fetchPurchaseValue();
    }, [companyName, purchaseDate]);

    const handlePurchase = async (e) => {
        e.preventDefault();

        const purchaseData = {
            stock: companyName, // Símbolo de la acción
            name: "Stock Name", // Este campo puedes actualizarlo con datos reales
            price: parseFloat(purchaseValue), // Convertir el precio a número flotante
            quantity: parseInt(sharesAmount, 10), // Convertir la cantidad a número entero
            currency: "USD",
            stock_date: new Date(purchaseDate).toISOString(), // Convertir a formato ISO
            purchase_date: new Date(purchaseDate).toISOString(), // Fecha actual en ISO
        };

        console.log("purchaseData:", purchaseData);

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

            setSharesAmount('');
            setPurchaseValue('');
            setPurchaseDate(new Date());
            alert('¡Compra registrada con éxito!');
        } catch (error) {
            console.error("Error al confirmar la compra:", error.message);
            alert("Hubo un error al confirmar la compra. Por favor, inténtalo de nuevo.");
        }
    };

    return (
        <div className="register-purchase-container">
            <h2>Register purchase</h2>
            <form onSubmit={handlePurchase} className="register-purchase-form">
                <div className="form-group calendar-group">
                    <label htmlFor="purchase-date">Purchase date</label>
                    <Calendar
                        onChange={setPurchaseDate}
                        value={purchaseDate}
                        className="custom-calendar"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="company-name">Company name</label>
                    <select
                        id="company-name"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        required
                    >
                        <option value="" disabled>
                            Select company
                        </option>
                        <option value="AAPL">Apple</option>
                        <option value="GOOG">Google</option>
                        <option value="AMZN">Amazon</option>
                        <option value="MSFT">Microsoft</option>
                    </select>
                    <label htmlFor="purchase-value">Purchase value</label>
                    <input
                        type="number"
                        id="purchase-value"
                        value={purchaseValue}
                        readOnly
                        placeholder="$xxxxxx"
                        style={{ backgroundColor: '#f5f5f5' }}
                    />
                    <label htmlFor="shares-amount">Amount of Shares</label>
                    <input
                        type="number"
                        id="shares-amount"
                        value={sharesAmount}
                        onChange={(e) => setSharesAmount(e.target.value)}
                        placeholder="xx"
                        required
                    />
                    
                    <button type="submit" className="register-button">
                        Register
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RegisterPurchase;
