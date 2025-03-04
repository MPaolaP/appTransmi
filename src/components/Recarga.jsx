import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import "./Recarga.css";

const RechargePage = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState(20000);
  const [email, setEmail] = useState("");
  const [bank, setBank] = useState("");
  const [cedula, setCedula] = useState("");
  const [tarjetaId, setTarjetaId] = useState("");
  const [tarjetaInfo, setTarjetaInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const goToHome = () => {
    navigate('/home');
  };

  const buscarTarjeta = async () => {
    if (!cedula) {
      setErrorMessage("Por favor ingrese un número de cédula");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    try {
      const response = await fetch(`http://localhost:5000/api/tarjeta/${cedula}`);
      
      // Capturar la respuesta como texto primero
      const responseText = await response.text();
      console.log("Respuesta de la búsqueda:", responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`No se pudo parsear la respuesta: ${responseText.substring(0, 100)}...`);
      }
      
      if (!response.ok) {
        throw new Error(data.message || "No se encontró la tarjeta para esta cédula");
      }
      
      setTarjetaInfo(data);
      setTarjetaId(data.id_tarjeta);
      console.log("Tarjeta encontrada:", data);
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage(error.message || "Error al buscar la tarjeta");
    } finally {
      setLoading(false);
    }
  };

  const handleRecharge = async () => {
    if (!email) {
      setErrorMessage("Por favor ingrese un correo electrónico");
      return;
    }
    
    if (!bank) {
      setErrorMessage("Por favor seleccione un banco");
      return;
    }
    
    if (!tarjetaId) {
      setErrorMessage("Por favor busque una tarjeta primero");
      return;
    }
  
    setLoading(true);
    setErrorMessage("");
    try {
      console.log("Enviando datos de recarga:", { email, bank, amount, tarId: tarjetaId });
      
      const response = await fetch("http://localhost:5000/api/online-recharge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email, 
          bank, 
          amount, 
          tarId: tarjetaId 
        }),
      });
  
      // Capturar la respuesta como texto primero
      const responseText = await response.text();
      console.log("Respuesta de la recarga:", responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`No se pudo parsear la respuesta: ${responseText.substring(0, 100)}...`);
      }
      
      if (!response.ok) {
        throw new Error(data.message || "Error al procesar la recarga");
      }
      
      alert("¡Recarga exitosa!");
      // Refrescar los datos de la tarjeta para mostrar el nuevo saldo
      if (cedula) {
        buscarTarjeta();
      }
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage(error.message || "Error al procesar la recarga");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <div className="header">
        <div className="back-button" onClick={goToHome}>‹</div>
        <div className="header-title">Realiza recargas</div>
        <div className="info-button">ⓘ</div>
      </div>
      
      {/* Content */}
      <div className="content">
        <div className="welcome-bannerH">
          <p className="welcome-text">
            Recarga tu tarjeta Tu Llave para seguir moviéndote por la ciudad.
          </p>
        </div>
        
        {errorMessage && (
          <div className="error-message">
            {errorMessage}
          </div>
        )}
        
        <div className="tab-container">
          <div className="tab active">Recarga Online</div>
        </div>
        
        {/* Búsqueda de tarjeta */}
        <div className="card-section">
          <div className="section-title">Buscar tarjeta</div>
          
          <div className="form-group">
            <label className="form-label">Cédula de ciudadanía</label>
            <div className="search-container">
              <input
                type="text"
                className="form-input"
                placeholder="Ingresa tu cédula"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
              />
              <button 
                className="search-button"
                onClick={buscarTarjeta}
                disabled={loading}
              >
                {loading ? "Buscando..." : "Buscar"}
              </button>
            </div>
          </div>
          
          {tarjetaInfo && (
            <div className="tarjeta-info">
              <p><strong>ID Tarjeta:</strong> {tarjetaInfo.id_tarjeta}</p>
              <p><strong>Saldo actual:</strong> ${tarjetaInfo.saldo.toLocaleString()}</p>
            </div>
          )}
        </div>
        
        {/* Datos de recarga */}
        <div className="card-section">
          <div className="section-title">Datos de recarga</div>
          
          <div className="form-label">Selecciona el monto a recargar</div>
          <div className="amount-options">
            {[5000, 10000, 20000, 30000, 50000].map((value) => (
              <div
                key={value}
                className={`amount-option ${amount === value ? "selected" : ""}`}
                onClick={() => setAmount(value)}
              >
                ${value.toLocaleString()}
              </div>
            ))}
          </div>
          
          <div className="form-group">
            <label className="form-label">Correo electrónico</label>
            <input
              type="email"
              className="form-input"
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Entidad bancaria</label>
            <select
              className="form-select"
              value={bank}
              onChange={(e) => setBank(e.target.value)}
            >
              <option value="">Selecciona tu banco</option>
              <option value="Bancolombia">Bancolombia</option>
              <option value="Davivienda">Davivienda</option>
              <option value="BBVA">BBVA</option>
              <option value="Banco de Bogotá">Banco de Bogotá</option>
              <option value="Banco Popular">Banco Popular</option>
              <option value="Banco de Occidente">Banco de Occidente</option>
              <option value="Scotiabank Colpatria">Scotiabank Colpatria</option>
              <option value="Banco Agrario">Banco Agrario</option>
              <option value="Banco AV Villas">Banco AV Villas</option>
            </select>
          </div>
          
          <button 
            className="recharge-button" 
            onClick={handleRecharge}
            disabled={loading || !tarjetaId}
          >
            {loading ? "PROCESANDO..." : "RECARGAR AHORA"}
          </button>
          
          <div className="secure-badge">
            <span className="secure-icon">🔒</span> Transacción segura y
            protegida
          </div>
          
          <div className="payment-providers">
            Aceptamos pagos con Visa, Mastercard, PayPal y más.
          </div>
        </div>
      </div>
      
      <div className="help-center">
        <div className="help-text">Centro de ayuda</div>
        <div className="help-arrow">›</div>
      </div>
    </div>
  );
};

export default RechargePage;