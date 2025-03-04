import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Rutas.css';

const Routes = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('rutas');
  const [rutas, setRutas] = useState([]);
  const [estaciones, setEstaciones] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [tiempoEstimado, setTiempoEstimado] = useState('35');
  const [destino, setDestino] = useState('');
  const [zonaSeleccionada, setZonaSeleccionada] = useState('');
  const [rutasVisibles, setRutasVisibles] = useState(3); // Número inicial de rutas visibles
  const scrollContainerRef = useRef(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Constantes para mapeo de zonas a prefijos de rutas
  const ZONAS_PREFIJOS = {
    'Portal Norte': 'B',
    'Portal Sur': 'G',
    'Portal Usme': 'H',
    'Portal El Dorado': 'K',
    'Portal Suba': 'C',
    'Portal 80': 'D',
    'Caracas': 'A',
    'NQS Central': 'E',
    'Américas': 'F',
    'Portal 20 de Julio': 'L'
  };

  // Obtener datos al cargar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setErrorMessage('');
        
        // Llamadas a la API
        try {
          const rutasRes = await fetch('http://localhost:5000/rutas');
          if (!rutasRes.ok) throw new Error('Error al cargar rutas');
          const rutasData = await rutasRes.json();
          
          try {
            const estacionesRes = await fetch('http://localhost:5000/estaciones');
            if (!estacionesRes.ok) throw new Error('Error al cargar estaciones');
            const estacionesData = await estacionesRes.json();
            
            try {
              const horariosRes = await fetch('http://localhost:5000/horarios');
              if (!horariosRes.ok) throw new Error('Error al cargar horarios');
              const horariosData = await horariosRes.json();
              
              // Procesar datos cuando todo está OK
              const rutasFormateadas = rutasData.map(ruta => ({
                ruta_id: ruta.rut_id,
                ruta_nombre: ruta.rut_nombre,
                ruta_origen: obtenerOrigenRuta(ruta.rut_id, estacionesData),
                ruta_destino: obtenerDestinoRuta(ruta.rut_id, estacionesData),
                ruta_zona: obtenerZonaRuta(ruta.rut_nombre),
                ruta_tiempo: obtenerTiempoRuta(),
                ruta_horario_inicial: formatearHora(ruta.rut_horario_inicial),
                ruta_horario_final: formatearHora(ruta.rut_horario_final)
              }));
              
              setRutas(rutasFormateadas);
              setEstaciones(estacionesData);
              setHorarios(horariosData);
              
            } catch (e) {
              console.error('Error al cargar horarios:', e);
              // En caso de error en horarios, al menos mostramos las rutas y estaciones
              const rutasFormateadas = rutasData.map(ruta => ({
                ruta_id: ruta.rut_id,
                ruta_nombre: ruta.rut_nombre,
                ruta_origen: obtenerOrigenRuta(ruta.rut_id, estacionesData),
                ruta_destino: obtenerDestinoRuta(ruta.rut_id, estacionesData),
                ruta_zona: obtenerZonaRuta(ruta.rut_nombre),
                ruta_tiempo: obtenerTiempoRuta(),
                ruta_horario_inicial: formatearHora(ruta.rut_horario_inicial),
                ruta_horario_final: formatearHora(ruta.rut_horario_final)
              }));
              
              setRutas(rutasFormateadas);
              setEstaciones(estacionesData);
            }
            
          } catch (e) {
            console.error('Error al cargar estaciones:', e);
            setErrorMessage('No se pudieron cargar las estaciones');
          }
          
        } catch (e) {
          console.error('Error al cargar rutas:', e);
        }
        
      } catch (error) {
        console.error('Error general en fetchData:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Función helper para obtener el origen de una ruta basado en su primera parada
  const obtenerOrigenRuta = (rutaId, estaciones) => {

    const origenesEjemplo = {
      1: 'Portal Usme',
      2: 'Portal 80',
      3: 'Portal Sur',
      4: 'Portal Suba',
      5: 'Portal Sur',
      6: 'Portal Américas',
      11: 'Portal El Dorado',
      41: 'Museo Nacional',
      71: 'Portal Norte',
      76: 'Portal Américas',
      81: 'Portal Norte',
      86: 'Portal Suba',
      91: 'Museo Nacional'
    };
    
    return origenesEjemplo[rutaId] || 'Estación Central';
  };

  // Función helper para obtener el destino de una ruta basado en su última parada
  const obtenerDestinoRuta = (rutaId, estaciones) => {

    const destinosEjemplo = {
      1: 'Hortúa',
      2: 'Carrera 47',
      3: 'Terminal',
      4: 'Shaio',
      5: 'Ricaurte',
      6: 'CAN',
      11: 'Corferias',
      41: 'Calle 72',
      71: 'Restrepo',
      76: 'Ricaurte',
      81: 'Restrepo',
      86: 'Ricaurte',
      91: 'Calle 72'
    };
    
    return destinosEjemplo[rutaId] || 'Estación Central';
  };

  // Función helper para obtener la zona de una ruta basada en el primer carácter del nombre
  const obtenerZonaRuta = (rutaNombre) => {
    if (!rutaNombre) return 'Desconocida';
    
    // Obtener el primer carácter del nombre de la ruta
    const prefijo = rutaNombre.charAt(0).toUpperCase();
    
    // Mapear el prefijo al nombre de la zona
    switch (prefijo) {
      case 'A': return 'Caracas';
      case 'B': return 'Portal Norte';
      case 'C': return 'Portal Suba';
      case 'D': return 'Portal 80';
      case 'E': return 'NQS Central';
      case 'F': return 'Américas';
      case 'G': return 'Portal Sur';
      case 'H': return 'Portal Usme';
      case 'K': return 'Portal El Dorado';
      case 'L': return 'Portal 20 de Julio';
      default: return 'Otra zona';
    }
  };

  // Función helper para obtener el tiempo estimado de la ruta
  const obtenerTiempoRuta = () => {
    // En un escenario real, esto vendría de la base de datos o un cálculo
    // Aquí generamos tiempos aleatorios entre 20 y 60 minutos
    return Math.floor(Math.random() * (60 - 20 + 1)) + 20;
  };

  // Función para formatear la hora desde un objeto Date o una cadena de fecha
  const formatearHora = (dateTimeString) => {
    if (!dateTimeString) return '';
    
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleTimeString('es-CO', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch (e) {
      console.error('Error al formatear hora:', e);
      return '';
    }
  };

  // Buscar rutas
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    try {
      setLoading(true);
      setErrorMessage('');
      
      const response = await fetch(`http://localhost:5000/rutas/buscar?q=${searchTerm}`);
      
      if (!response.ok) {
        throw new Error(`Error al buscar rutas: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transformar datos
      const rutasFormateadas = data.map(ruta => ({
        ruta_id: ruta.rut_id,
        ruta_nombre: ruta.rut_nombre,
        ruta_origen: obtenerOrigenRuta(ruta.rut_id, estaciones),
        ruta_destino: obtenerDestinoRuta(ruta.rut_id, estaciones),
        ruta_zona: obtenerZonaRuta(ruta.rut_nombre),
        ruta_horario_inicial: formatearHora(ruta.rut_horario_inicial),
        ruta_horario_final: formatearHora(ruta.rut_horario_final)
      }));
      
      setRutas(rutasFormateadas);
      setDestino(searchTerm);
      setRutasVisibles(3); // Resetear el contador de rutas visibles
    } catch (error) {
      console.error('Error searching routes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar rutas por zona
  const handleZoneClick = async (zona) => {
    setZonaSeleccionada(zona);
    try {
      setLoading(true);
      setErrorMessage('');
      
      // Obtener el prefijo de letra correspondiente a la zona
      const prefijo = ZONAS_PREFIJOS[zona];
      
      // En un caso real, esto llamaría a un endpoint de filtrado por zona
      // Como ejemplo, obtenemos todas las rutas y filtramos en el cliente
      const response = await fetch('http://localhost:5000/rutas');
      
      if (!response.ok) {
        throw new Error(`Error al obtener rutas: ${response.status}`);
      }
      
      const allRutas = await response.json();
      
      // Filtrar las rutas que comienzan con el prefijo de la zona
      const rutasFiltradas = allRutas.filter(ruta => 
        ruta.rut_nombre && ruta.rut_nombre.startsWith(prefijo)
      );
      
      // Transformar los datos
      const rutasFormateadas = rutasFiltradas.map(ruta => ({
        ruta_id: ruta.rut_id,
        ruta_nombre: ruta.rut_nombre,
        ruta_origen: obtenerOrigenRuta(ruta.rut_id, estaciones),
        ruta_destino: obtenerDestinoRuta(ruta.rut_id, estaciones),
        ruta_zona: obtenerZonaRuta(ruta.rut_nombre),
        ruta_horario_inicial: formatearHora(ruta.rut_horario_inicial),
        ruta_horario_final: formatearHora(ruta.rut_horario_final)
      }));
      
      setRutas(rutasFormateadas);
      setRutasVisibles(3); // Resetear el contador de rutas visibles
    } catch (error) {
      console.error('Error filtering by zone:', error);
      setErrorMessage('Error al filtrar por zona. Intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Cargar más rutas al hacer scroll
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      
      // Si el usuario ha llegado cerca del final, cargar más rutas
      if (scrollTop + clientHeight >= scrollHeight - 20) {
        // Incrementar el número de rutas visibles
        setRutasVisibles(prev => Math.min(prev + 3, rutas.length));
      }
    }
  };

  // Función para volver atrás
  const goBack = () => {
    navigate('/home');
  };

  // Función para formatear la hora actual
  const formatCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('es-CO', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Función para obtener zona de estación
  const getZonaEstacion = (estacion) => {
    // Extracto zona del tipo de estación o ubicación
    if (estacion.est_tipo) {
      return estacion.est_tipo;
    } else if (estacion.est_ubicacion && estacion.est_ubicacion.includes('Norte')) {
      return 'Norte';
    } else if (estacion.est_ubicacion && estacion.est_ubicacion.includes('Sur')) {
      return 'Sur';
    } else if (estacion.est_ubicacion && estacion.est_ubicacion.includes('Suba')) {
      return 'Suba';
    } else {
      return 'Central';
    }
  };

  // Función para obtener nombre de ruta
  const getNombreRuta = (horario) => {
    // Busca el nombre de la ruta por su ID
    const rutaEncontrada = rutas.find(r => r.ruta_id === horario.rut_id);
    if (rutaEncontrada) {
      return rutaEncontrada.ruta_nombre;
    } else {
      // Si no encuentra, genera un nombre basado en el ID
      return `Ruta ${horario.rut_id || 'Principal'}`;
    }
  };

  // Función para obtener día de la semana
  const getDiaSemana = (horario) => {
    // Mapeo del hor_dia (si existe) a un formato legible
    if (horario.hor_dia) {
      return horario.hor_dia;
    } else {
      // Valores por defecto si no hay información
      const opciones = ['Lunes a Viernes', 'Lunes a Sábado', 'Todos los días', 'Sábados y festivos'];
      return opciones[Math.floor(Math.random() * opciones.length)];
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <div className="header">
        <div className="back-button" onClick={goBack}>‹</div>
        <div className="header-title">Consulta rutas y horarios</div>
        <div className="info-button">ⓘ</div>
      </div>
      
      {/* Search Section */}
      <div className="search-section">
        <div className="search-label">Busca tu próximo destino:</div>
        <div className="search-input">
          <div className="search-icon">🔍</div>
          <input 
            type="text" 
            placeholder="Ingresa destino o nombre de ruta" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="search-text-input"
          />
        </div>
        <button 
          onClick={handleSearch} 
          className="search-button"
          disabled={loading}
        >
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </div>
      
      {/* Error Message */}
      {errorMessage && (
        <div className="error-message">
          {errorMessage}
        </div>
      )}
      
      {/* Tabs */}
      <div className="tabs">
        <div 
          className={`tab ${activeTab === 'rutas' ? 'active' : ''}`} 
          onClick={() => setActiveTab('rutas')}
        >
          Próximas rutas
        </div>
        <div 
          className={`tab ${activeTab === 'estaciones' ? 'active' : ''}`} 
          onClick={() => setActiveTab('estaciones')}
        >
          Estaciones
        </div>
        <div 
          className={`tab ${activeTab === 'horarios' ? 'active' : ''}`} 
          onClick={() => setActiveTab('horarios')}
        >
          Horarios
        </div>
      </div>
      
      {/* Estimated Time Message - Solo mostrar si hay un destino */}
      {destino && activeTab === 'rutas' && (
        <div className="estimated-time">
          <div className="estimated-text">
            Tiempo estimado de llegada a {destino}: <span className="estimated-bold">{tiempoEstimado} minutos</span>
          </div>
        </div>
      )}
      
      {/* Contenido según la pestaña activa */}
      {activeTab === 'rutas' && (
        <>
          {/* Route List con scroll */}
          <div 
            className="route-list-container" 
            ref={scrollContainerRef} 
            onScroll={handleScroll}
          >
            {loading ? (
              <div className="loading">Cargando rutas...</div>
            ) : rutas.length > 0 ? (
              <div className="routes-scroll">
                {rutas.slice(0, rutasVisibles).map((ruta, index) => (
                  <div className="route-item" key={ruta.ruta_id || index}>
                    <div className="route-col">
                      <div className="route-name">{ruta.ruta_nombre || `Ruta ${index + 1}`}</div>
                      <div className="route-status">
                        Estado: Activa
                        <div className="status-dot active"></div>
                      </div>
                    </div>
                    <div className="route-col">
                      <div className="route-name">{ruta.ruta_origen} → {ruta.ruta_destino}</div>
                      <div className="route-status">
                        Tiempo est.: {ruta.ruta_tiempo} min
                      </div>
                    </div>
                    <div className="route-col">
                      <div className="route-name">{formatCurrentTime()}</div>
                      <div className="route-status">
                        Estado: {index % 4 === 0 ? 'Retraso' : 'Activo'}
                        <div className={`status-dot ${index % 4 === 0 ? 'delay' : 'active'}`}></div>
                      </div>
                    </div>
                  </div>
                ))}
                {rutasVisibles < rutas.length && (
                  <div className="load-more-indicator">
                    Desliza para ver más rutas
                  </div>
                )}
              </div>
            ) : (
              <div className="no-results">No se encontraron rutas disponibles</div>
            )}
          </div>
          
          {/* Zones Section */}
          <div className="zones-section">
            <div className="zones-header">
              <div className="zones-title">Zonas principales</div>
              <div className="chevron-down">▼</div>
            </div>
            
            {/* Zones List */}
            <div className="zones-list">
              <div className="zone-item" onClick={() => handleZoneClick('Portal Norte')}>
                <div className="zone-left">
                  <div className="zone-color" style={{ backgroundColor: '#1e88e5' }}></div>
                  <div className="zone-name">Portal Norte</div>
                </div>
                <div className="zone-arrow">›</div>
              </div>
              
              <div className="zone-item" onClick={() => handleZoneClick('Portal Sur')}>
                <div className="zone-left">
                  <div className="zone-color" style={{ backgroundColor: '#43a047' }}></div>
                  <div className="zone-name">Portal Sur</div>
                </div>
                <div className="zone-arrow">›</div>
              </div>
              
              <div className="zone-item" onClick={() => handleZoneClick('Portal Suba')}>
                <div className="zone-left">
                  <div className="zone-color" style={{ backgroundColor: '#ffc107' }}></div>
                  <div className="zone-name">Portal Suba</div>
                </div>
                <div className="zone-arrow">›</div>
              </div>
              
              <div className="zone-item" onClick={() => handleZoneClick('Portal 80')}>
                <div className="zone-left">
                  <div className="zone-color" style={{ backgroundColor: '#9c27b0' }}></div>
                  <div className="zone-name">Portal 80</div>
                </div>
                <div className="zone-arrow">›</div>
              </div>
              
              <div className="zone-item" onClick={() => handleZoneClick('NQS Central')}>
                <div className="zone-left">
                  <div className="zone-color" style={{ backgroundColor: '#795548' }}></div>
                  <div className="zone-name">NQS Central</div>
                </div>
                <div className="zone-arrow">›</div>
              </div>
              
              <div className="zone-item" onClick={() => handleZoneClick('Portal El Dorado')}>
                <div className="zone-left">
                  <div className="zone-color" style={{ backgroundColor: '#f44336' }}></div>
                  <div className="zone-name">Portal El Dorado</div>
                </div>
                <div className="zone-arrow">›</div>
              </div>
              
              <div className="zone-item" onClick={() => handleZoneClick('Américas')}>
                <div className="zone-left">
                  <div className="zone-color" style={{ backgroundColor: '#ff9800' }}></div>
                  <div className="zone-name">Américas</div>
                </div>
                <div className="zone-arrow">›</div>
              </div>
              
              <div className="zone-item" onClick={() => handleZoneClick('Portal Usme')}>
                <div className="zone-left">
                  <div className="zone-color" style={{ backgroundColor: '#2196f3' }}></div>
                  <div className="zone-name">Portal Usme</div>
                </div>
                <div className="zone-arrow">›</div>
              </div>
              
              <div className="zone-item" onClick={() => handleZoneClick('Caracas')}>
                <div className="zone-left">
                  <div className="zone-color" style={{ backgroundColor: '#4caf50' }}></div>
                  <div className="zone-name">Caracas</div>
                </div>
                <div className="zone-arrow">›</div>
              </div>
              
              <div className="zone-item" onClick={() => handleZoneClick('Portal 20 de Julio')}>
                <div className="zone-left">
                  <div className="zone-color" style={{ backgroundColor: '#673ab7' }}></div>
                  <div className="zone-name">Portal 20 de Julio</div>
                </div>
                <div className="zone-arrow">›</div>
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* Pestaña de estaciones */}
      {activeTab === 'estaciones' && (
        <div className="content-container">
          {loading ? (
            <div className="loading">Cargando estaciones...</div>
          ) : estaciones.length > 0 ? (
            <div className="stations-list">
              {estaciones.slice(0, 20).map((estacion, index) => (
                <div className="station-item" key={estacion.est_id || index}>
                  <div className="station-name">{estacion.est_nombre || `Estación ${index + 1}`}</div>
                  <div className="station-details">
                    <div className="station-location">
                      <span className="detail-label">Ubicación:</span> {estacion.est_ubicacion || 'No disponible'}
                    </div>
                    <div className="station-zone">
                      <span className="detail-label">Zona:</span> {getZonaEstacion(estacion)}
                    </div>
                    <div className="station-status">
                      <span className="detail-label">Estado:</span> {estacion.est_estado || 'Activa'}
                      <div className="status-dot active"></div>
                    </div>
                  </div>
                </div>
              ))}
              {estaciones.length > 20 && (
                <div className="view-more">
                  Ver más <span className="view-more-arrow">›</span>
                </div>
              )}
            </div>
          ) : (
            <div className="no-results">No se encontraron estaciones disponibles</div>
          )}
        </div>
      )}
      
      {/* Pestaña de horarios */}
      {activeTab === 'horarios' && (
        <div className="content-container">
          {loading ? (
            <div className="loading">Cargando horarios...</div>
          ) : horarios.length > 0 ? (
            <div className="schedules-list">
              {horarios.slice(0, 20).map((horario, index) => (
                <div className="schedule-item" key={horario.rut_id || index}>
                  <div className="schedule-header">
                    <div className="schedule-route">Ruta: {horario.rut_nombre || `Ruta ${index + 1}`}</div>
                  </div>
                  <div className="schedule-details">
                    <div className="schedule-time">
                      <span className="detail-label">Hora inicio:</span> {formatearHora(horario.rut_horario_inicial) || '05:00 AM'}
                    </div>
                    <div className="schedule-time">
                      <span className="detail-label">Hora fin:</span> {formatearHora(horario.rut_horario_final) || '11:00 PM'}
                    </div>
                    <div className="schedule-frequency">
                    </div>
                  </div>
                </div>
              ))}
              {horarios.length > 20 && (
                <div className="view-more">
                  Ver más <span className="view-more-arrow">›</span>
                </div>
              )}
            </div>
          ) : (
            <div className="no-results">No se encontraron horarios disponibles</div>
          )}
        </div>
      )}
      
      {/* Help Center */}
      <div className="help-center">
        <div className="help-text">Centro de ayuda</div>
        <div className="zone-arrow">›</div>
      </div>
    </div>
  );
};

export default Routes;