
import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://127.0.0.1:8000';

function App() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [autenticado, setAutenticado] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access');

    if (token) {
      axios.get(`${API_URL}/api/privado`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then((respuesta) => {
        setAutenticado(true);
        setMensaje(respuesta.data.mensaje);
      })
      .catch(() => {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        setAutenticado(false);
      })
      .finally(() => setCargando(false));
    } else {
      setCargando(false);
    }
  }, []);

  const iniciarSesion = async (e) => {
    e.preventDefault();
    setMensaje('Verificando usuario...');

    try {
      const respuesta = await axios.post(`${API_URL}/api/token/`, {
        username: usuario,
        password: password
      });

      localStorage.setItem('access', respuesta.data.access);
      localStorage.setItem('refresh', respuesta.data.refresh);

      const acceso = await axios.get(`${API_URL}/api/privado`, {
        headers: {
          Authorization: `Bearer ${respuesta.data.access}`
        }
      });

      setAutenticado(true);
      setMensaje(acceso.data.mensaje);
      setPassword('');
    } catch (error) {
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');

      setAutenticado(false);
      setMensaje(
        error.response?.data?.detail || 'Usuario o contraseña incorrectos'
      );
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');

    setAutenticado(false);
    setUsuario('');
    setPassword('');
    setMensaje('Sesión cerrada correctamente');
  };

  if (cargando) {
    return <h2 className="cargando">Verificando sesión...</h2>;
  }

  return (
    <div className="contenedor">
      {!autenticado ? (
        <div className="login">
          <h1>Iniciar sesión</h1>
          <p>Accede con tu usuario registrado en Django</p>

          <form onSubmit={iniciarSesion}>
            <input
              type="text"
              placeholder="Usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit">Ingresar</button>
          </form>

          <p className="mensaje">{mensaje}</p>
        </div>
      ) : (
        <div className="privado">
          <h1>¡Bienvenido!</h1>
          <p>Has ingresado correctamente a la página privada.</p>
          <h3>{mensaje}</h3>
          <button onClick={cerrarSesion}>Cerrar sesión</button>
        </div>
      )}
    </div>
  );
}

export default App;
