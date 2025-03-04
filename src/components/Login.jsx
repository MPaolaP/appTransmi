import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import logoUrl from '../assets/logo.png'

const Login = () => {
  const [cedula, setCedula] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!cedula || !password) {
      alert('Por favor ingresa cédula y contraseña');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cedula, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Importante: Obtener el nombre completo del usuario de la respuesta
        const userName = `${data.user.per_nombre || ''} ${data.user.per_apellido || ''}`.trim();
        
        // Guardar en localStorage
        sessionStorage.removeItem('userName');
        sessionStorage.removeItem('cedula');
        sessionStorage.setItem('userName', userName);
        sessionStorage.setItem('userCedula', cedula);

        // Redirige a la pantalla principal y pasa tanto la cédula como el nombre
        navigate('/home', { 
          state: { 
            cedula,
            userName
          } 
        });
      } else {
        alert(data.message || 'Error de autenticación'); 
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error conectando con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="login-card">
        <h1>TRANSMILENIO</h1>
        <div className="logo-container">
          <img src={logoUrl} alt="Logo Transmilenio" className="logo" />
        </div>
        <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
          <div className="form-group">
            <label htmlFor="cedula">Número de cédula</label>
            <input
              type="text"
              id="cedula"
              placeholder="Ingresa tu número de cédula"
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
          >
            {isLoading ? 'Cargando...' : 'Continuar'}
          </button>
          <div className="terms">
            Al hacer clic en Continuar, aceptas nuestros Términos de Servicio y nuestra Política de Privacidad.
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;