import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import "./Historial.css";

const Historial = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("Todo");
  const [tarjetaInfo, setTarjetaInfo] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [currentFare, setCurrentFare] = useState(0);
 
  // Obtener cédula del usuario de location state o sessionStorage
  const userCedula = location.state?.cedulaUser || sessionStorage.getItem('userCedula');

  const goToHome = () => {
    navigate('/home');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Verificamos que tengamos la cédula del usuario
        if (!userCedula) {
          setLoading(false);
          setError("No se encontró información del usuario");
          return;
        }
        
        // Obtenemos la información del usuario y su tipo
        const userResponse = await fetch(`http://localhost:5000/api/user/${userCedula}`);
        
        const userData = await userResponse.json();
        setUserInfo(userData);
        
        // Obtenemos la información de la tarjeta
        const tarjetaResponse = await fetch(`http://localhost:5000/api/tarjeta/${userCedula}`);
        
        if (!tarjetaResponse.ok) {
          throw new Error("No se encontró tarjeta para este usuario");
        }
        
        const tarjetaData = await tarjetaResponse.json();
        setTarjetaInfo(tarjetaData);
        
        // Obtenemos el tipo de usuario para consultar la tarifa correspondiente
        const tipoUsuarioResponse = await fetch(`http://localhost:5000/api/usuario/tipo/${userCedula}`);
        
        if (!tipoUsuarioResponse.ok) {
          throw new Error("Error al obtener el tipo de usuario");
        }
        
        const tipoUsuarioData = await tipoUsuarioResponse.json();
        const tipoUsuario = tipoUsuarioData.usu_tipo || 'Regular';
        
        // Obtenemos la tarifa según el tipo de usuario
        const tarifaResponse = await fetch(`http://localhost:5000/api/tarifas/pasaje/${tipoUsuario}`);
        
        if (!tarifaResponse.ok) {
          throw new Error("Error al obtener tarifa");
        }
        
        const tarifaData = await tarifaResponse.json();
        setCurrentFare(tarifaData.tip_pas_valor);
        
        // Obtenemos las recargas
        const recargasResponse = await fetch(`http://localhost:5000/api/recargas/${tarjetaData.id_tarjeta}`);
        
        if (!recargasResponse.ok) {
          throw new Error("El usuario no tiene recargas");
        }
        
        const recargasData = await recargasResponse.json();
        setTransactions(recargasData);
        
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userCedula]);

  // Filter transactions based on the selected filter
  const filteredTransactions = filter === "Todo" 
    ? transactions 
    : transactions.filter(transaction => {
        // Implement your filtering logic here based on the filter state
        // For example, if filter is "Recargas", return only recharge transactions
        return true; // Replace with actual filtering condition
      });

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // Función para formatear la hora
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="app-container">
        <div className="header">
          <div className="back-button" onClick={goToHome}>‹</div>
          <div className="header-title">Historial de Recargas</div>
          <div className="info-button">ⓘ</div>
        </div>
        <div className="content">
          <div className="loading-message">Cargando información...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Header */}
      <div className="header">
        <div className="back-button" onClick={goToHome}>‹</div>
        <div className="header-title">Historial de Recargas</div>
        <div className="info-button">ⓘ</div>
      </div>

      {/* Content */}
      <div className="content">
        {/* Current Fare Section */}
        <div className="fare-section">
          <div className="fare-label">Tarifa actual del pasaje:</div>
          <div className="fare-amount">${currentFare.toLocaleString()} COP</div>
        </div>

        {/* Error message if any */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Transaction History Card */}
        <div className="history-card">
          <div className="history-header">
            <div className="history-title">Recargas recientes</div>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="empty-message">No hay recargas registradas para tu tarjeta.</div>
          ) : (
            <>
              {/* Table Header */}
              <div className="table-header">
                <div className="table-header-date">Fecha</div>
                <div className="table-header-time">Hora</div>
                <div className="table-header-amount">Valor</div>
                <div className="table-header-bank">Banco</div>
              </div>

              {/* Transaction Rows */}
              {filteredTransactions.map((transaction, index) => (
                <div className="table-row" key={index}>
                  <div className="table-cell-date">
                    <div className="date-primary">
                      {formatDate(transaction.rec_fecha)}
                    </div>
                    <div className="date-secondary">
                      {`Rec. #${transaction.rec_id}`}
                    </div>
                  </div>
                  <div className="table-cell-time">
                    {formatTime(transaction.rec_fecha)}
                  </div>
                  <div className="table-cell-amount">
                    <div className="amount-credit">+${transaction.rec_valor.toLocaleString()} COP</div>
                    <div className="transaction-type">Recarga</div>
                  </div>
                  <div className="table-cell-bank">{transaction.prov_banco || "No especificado"}</div>
                </div>
              ))}

              {/* View More Button */}
              {filteredTransactions.length > 5 && (
                <div className="view-more">Ver más recargas</div>
              )}
            </>
          )}
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

export default Historial;