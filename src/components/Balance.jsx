import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Balance.css';

const Balance = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [tarjeta, setTarjeta] = useState({
    id_tarjeta: '', // Valor por defecto
    saldo: '', // Valor por defecto
    ultima_actualizacion: '', // Valor por defecto
  });

  // Obtener la cédula del estado de navegación
  const cedula = location.state?.cedulaUser;
  

  useEffect(() => {
    const fetchTarjeta = async () => {
      console.log('Fetching tarjeta data...');
      console.log('Cédula del usuario:', cedula);
      
      if (!cedula) {
        console.error('No hay cédula disponible');
        return;
      }
      
      try {
        const response = await fetch(`http://localhost:5000/api/tarjeta/${cedula}`);
        
        if (!response.ok) {
          console.error('Error en la respuesta:', response.status, response.statusText);
          throw new Error('Error al obtener los datos de la tarjeta');
        }
        
        const data = await response.json();
        console.log('Datos recibidos:', data);
        
        setTarjeta({
          id_tarjeta: data.id_tarjeta ? `****${data.id_tarjeta.toString().slice(-4)}` : 'No disponible',
          saldo: data.saldo ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(data.saldo) : '$0',
        });
      } catch (error) {
        console.error('Error en la petición:', error);
      }
    };
    
    fetchTarjeta();
  }, [cedula]);

  const goBack = () => {
    navigate('/home');
  };

  return (
    <div className="app-container">
      {/* Header */}
      <div className="header">
        <button className="back-button" onClick={goBack}>‹</button>
        <div className="header-title">Ver saldo de tarjeta</div>
        <div className="info-button">ⓘ</div>
      </div>

      {/* Content */}
      <div className="content">
        {/* Welcome Banner */}
        <div className="welcome-banner">
          <p className="welcome-text">
            Bienvenido a tu <span className="welcome-name">Tu Llave</span>. Aquí puedes consultar tu saldo actual.
          </p>
        </div>

        {/* Card Section */}
        <div className="card-section">
          <div className="card-image">
            <div className="tullave-card">
              <div className="tullave-text">Tu llave</div>
            </div>
            <div className="card-info">Tarjeta registrada • ID: {tarjeta.id_tarjeta}</div>
          </div>
        </div>

        {/* Balance Section */}
        <div className="balance-section">
          <div className="balance-card">
            <div className="balance-label">Saldo actual en tu tarjeta</div>
            <div className="balance-amount">
              {tarjeta.saldo}
              <div className="eye-icon">👁️</div>
            </div>
          </div>
        </div>
      </div>

      {/* Help Center */}
      <div className="help-center">
        <div className="help-text">Centro de ayuda</div>
        <div className="help-arrow">›</div>
      </div>
    </div>
  );
};

export default Balance;