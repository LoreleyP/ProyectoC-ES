import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './RegisterPurchase.css';

const RegisterPurchase = () => {
    const [purchaseDate, setPurchaseDate] = useState(new Date());
    const [companyName, setCompanyName] = useState('');
    const [purchaseValue, setPurchaseValue] = useState('');
    const [sharesAmount, setSharesAmount] = useState('');
    const [openPrice, setOpenPrice] = useState(null); // Valor de apertura
    const [closePrice, setClosePrice] = useState(null); // Valor de cierre
    const [errorMessage, setErrorMessage] = useState(''); // Mensaje de error

    // Función para obtener el valor de apertura y cierre de la acción desde el backend
    const fetchStockData = async () => {
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
                throw new Error('Error fetching stock data');
            }

            const data = await response.json();
            if (data.length > 0) {
                const stockData = data[0];
                setOpenPrice(stockData.open); // Setea el precio de apertura
                setClosePrice(stockData.close); // Setea el precio de cierre
            } else {
                setOpenPrice(null);
                setClosePrice(null);
            }
        } catch (error) {
            console.error('Error fetching stock data:', error);
            setOpenPrice(null);
            setClosePrice(null);
        }
    };

    useEffect(() => {
        fetchStockData();
    }, [companyName, purchaseDate]); // Cada vez que cambia la fecha o la compañía

    // Función para manejar el cambio en el valor de compra
    const handlePurchaseValueChange = (e) => {
        const value = e.target.value;
        setPurchaseValue(value);
        setErrorMessage(''); // Limpiar cualquier mensaje de error mientras se edita
    };

    const handleSharesAmountChange = (e) => {
        const value = e.target.value;
        // Solo actualizar si el valor es un número entero positivo
        if (/^\d+$/.test(value) || value === '') {
            setSharesAmount(value);
        }
    };

    const handlePurchase = async (e) => {
        e.preventDefault();

        // Convertir purchaseValue a número para validación
        const purchaseValueNumber = parseFloat(purchaseValue);

        // Asegurarse de que el valor de apertura y cierre están en el orden correcto
        const validMinPrice = Math.min(openPrice, closePrice);
        const validMaxPrice = Math.max(openPrice, closePrice);

        // Verifica si el valor está dentro del rango antes de hacer la compra
        if (purchaseValueNumber < validMinPrice || purchaseValueNumber > validMaxPrice) {
            setErrorMessage(`El valor debe estar entre $${validMinPrice} y $${validMaxPrice}`);
            return; // Detener la compra si el valor no está en el rango
        }

        const purchaseData = {
            stock: companyName,
            name: 'Stock Name', // Este campo puedes actualizarlo con datos reales
            price: purchaseValueNumber,
            quantity: parseInt(sharesAmount, 10),
            currency: 'USD',
            stock_date: new Date(purchaseDate).toISOString(),
            purchase_date: new Date(purchaseDate).toISOString(),
        };

        try {
            const response = await fetch('http://localhost:8000/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(purchaseData),
            });

            if (!response.ok) {
                throw new Error('Error al realizar la compra');
            }

            const result = await response.json();
            console.log('Compra exitosa:', result);

            setSharesAmount(''); // Limpiar cantidad de acciones
            setPurchaseValue(''); // Limpiar valor de compra
            setPurchaseDate(new Date()); // Restablecer fecha
            alert('¡Compra registrada con éxito!');
        } catch (error) {
            console.error('Error al confirmar la compra:', error.message);
            alert('Hubo un error al confirmar la compra. Por favor, inténtalo de nuevo.');
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
                        <option value="GOOGL">Google</option>
                        <option value="AMZN">Amazon</option>
                        <option value="MSFT">Microsoft</option>
                        <option value="TSLA">Tesla</option>
                        <option value="NVDA">NVIDIA</option>
                        <option value="META">Meta Platforms</option>
                        <option value="BRK.B">Berkshire Hathaway</option>
                        <option value="MS">Morgan Stanley</option>
                        <option value="V">Visa</option>
                        <option value="JNJ">Johnson & Johnson</option>
                        <option value="WMT">Walmart</option>
                        <option value="UNH">UnitedHealth Group</option>
                        <option value="PG">Procter & Gamble</option>
                        <option value="DIS">Walt Disney</option>
                        <option value="HD">Home Depot</option>
                        <option value="PYPL">PayPal</option>
                        <option value="VZ">Verizon</option>
                        <option value="MA">Mastercard</option>
                        <option value="INTC">Intel</option>

                    </select>

                    <label htmlFor="purchase-value">Purchase value</label>
                    <input
                        type="number"
                        id="purchase-value"
                        value={purchaseValue}
                        onChange={handlePurchaseValueChange}
                        placeholder="$xxxxxx"
                    />
                    {errorMessage && <p style={{ color: 'red', fontSize: '12px' }}>{errorMessage}</p>} {/* Mensaje de error */}

                    <small style={{ color: '#888' }}>
                        {openPrice && closePrice && `Range: $${Math.min(openPrice, closePrice)} - $${Math.max(openPrice, closePrice)}`}
                    </small>

                    <label htmlFor="shares-amount">Amount of Shares</label>
                    <input
                        type="number"
                        id="shares-amount"
                        value={sharesAmount}
                        onChange={handleSharesAmountChange}
                        placeholder="xx"
                        min="1" // Asegurarse que el valor no sea menor que 1
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
