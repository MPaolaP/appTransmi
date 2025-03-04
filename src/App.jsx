import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Home from './components/Home';
import Rutas from './components/Rutas';
import Balance from './components/Balance';
import Historial from './components/Historial';
import Recarga from './components/Recarga';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/rutas" element={<Rutas />} />
        <Route path="/balance" element={<Balance />} />
        <Route path="/historial" element={<Historial />} />
        <Route path="/recarga" element={<Recarga />} />
      </Routes>
    </Router>
  );
};

export default App;