import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Home.css';
import imgBusUrl from '../assets/bus.png';
import imgRecargaUrl from '../assets/recarga.png';
import imgHistorialUrl from '../assets/historial.png';
import imgTrajeta2Url from '../assets/tarjeta2.png';

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [userName, setUserName] = useState('Usuario');
  const [cedulaUser, setCedulaUser] = useState('');

  useEffect(() => {
    // Check if user data is available in location.state
    if (location.state) {
      const { cedula, userName: nameFromState } = location.state;
      
      if (cedula) {
        setCedulaUser(cedula);
        
        // If name is directly provided from Login, use it
        if (nameFromState) {
          setUserName(nameFromState);
          // Save to localStorage
          localStorage.setItem('cedula', cedula);
          localStorage.setItem('userName', nameFromState);
          return; // No need to fetch
        }
        
        // Fetch user data if we have cedula but no name
        fetchUserName(cedula);
      }
    } else {
      // If no location state, try localStorage
      const storedCedula = localStorage.getItem('cedula');
      const storedUserName = localStorage.getItem('userName');
      
      if (storedCedula && storedUserName) {
        setCedulaUser(storedCedula);
        setUserName(storedUserName);
      } else if (storedCedula) {
        // If we have cedula but no name in localStorage
        setCedulaUser(storedCedula);
        fetchUserName(storedCedula);
      }
    }
  }, [location]);

  // Function to fetch user name
  const fetchUserName = async (cedula) => {
    try {
      const response = await fetch(`http://localhost:5000/api/user/${cedula}`);
      
      if (!response.ok) {
        throw new Error('Error al obtener el nombre del usuario');
      }
      
      const data = await response.json();
      setUserName(data.nombre);
      
      // Save to localStorage
      localStorage.setItem('cedula', cedula);
      localStorage.setItem('userName', data.nombre);
    } catch (error) {
      console.error('Error:', error);
      // Keep default name on error
    }
  };

  const goToLogin = () => {
    // Clear localStorage when logging out
    localStorage.removeItem('userName');
    localStorage.removeItem('cedula');
    navigate('/Login');
  };

  // Función para navegar a la página de rutas
  const navigateToRoutes = () => {
    navigate('/rutas');
  };

  // Función para navegar a la página de saldo
  const handleViewBalance = () => {
    navigate('/balance', { state: {cedulaUser} });
  };
  
  const goToHistorial = () => {
    navigate('/historial', { state: {cedulaUser} });
  };
  
  const goToRecarga = () => {
    navigate('/recarga', { state: {cedulaUser} });
  };

  return (
    <div className="app-container">
      {/* App Header */}
      <div className="header">
        <div className="back-button" onClick={goToLogin}>‹</div>
        <div className="logo-container">
          <div className="logo-text">TRANSMILENIO</div>
        </div>
        <div className="user-icon"></div>
      </div>

      {/* Welcome Banner */}
      <div className="welcome-banner">
        <p className="welcome-text">
          Bienvenido, <span className="welcome-name">{userName}</span>. ¿Qué deseas hacer hoy?
        </p>
      </div>

      {/* Section Title */}
      <div className="section-title">Servicios principales</div>

      {/* Menu Items */}
      <div className="menu-items">
        {/* Consulta rutas y horarios */}
        <div className="menu-item" onClick={navigateToRoutes}>
          <div className="menu-text">
            Consulta rutas y horarios
            <div className="menu-description">Encuentra tu mejor ruta</div>
          </div>
          <div className="menu-icon bus">
            <img src={imgBusUrl} alt="Bus icon" className="icon-img" />
          </div>
        </div>

        {/* Ver saldo de tarjeta */}
        <div className="menu-item" onClick={handleViewBalance}>
          <div className="menu-text">
            Ver saldo de tarjeta
            <div className="menu-description">Consulta tu saldo actual</div>
          </div>
          <div className="menu-icon tarjeta">
            <img src={imgTrajeta2Url} alt="Tarjeta icon" className="icon-img" />
          </div>
        </div>

        {/* Historial de viajes y pagos */}
        <div className="menu-item" onClick={goToHistorial}>
          <div className="menu-text">
            Historial de viajes y pagos
            <div className="menu-description">Revisa tus viajes recientes y gastos</div>
          </div>
          <div className="menu-icon historial">
            <img src={imgHistorialUrl} alt="Historial icon" className="icon-img" />
          </div>
        </div>

        {/* Realiza recargas */}
        <div className="menu-item" onClick={goToRecarga}>
          <div className="menu-text">
            Realiza recargas
            <div className="menu-description">Recarga tu tarjeta de forma rápida y segura</div>
          </div>
          <div className="menu-icon recarga">
            <img src={imgRecargaUrl} alt="Recarga icon" className="icon-img" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;