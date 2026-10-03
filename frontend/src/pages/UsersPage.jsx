import { useEffect, useState } from 'react';
import UserList from '../components/users/UserList';
import { usuarioService } from '../services/usuarioService';

export default function UsersPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  async function cargarUsuarios() {
    setCargando(true);
    setError(null);
    try {
      const data = await usuarioService.listar();
      setUsuarios(data);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudieron cargar los usuarios.');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarUsuarios();
  }, []);

  async function manejarActualizarRol(id, rol) {
    try {
      await usuarioService.actualizar(id, { rol });
      await cargarUsuarios();
    } catch (err) {
      alert(err.response?.data?.error || 'No se pudo actualizar el rol.');
    }
  }

  async function manejarEliminar(id) {
    if (!confirm('¿Eliminar este usuario de forma permanente?')) return;
    try {
      await usuarioService.eliminar(id);
      await cargarUsuarios();
    } catch (err) {
      alert(err.response?.data?.error || 'No se pudo eliminar el usuario.');
    }
  }

  return (
    <div className="p-6 pb-28">
      <h1 className="mb-1 text-2xl font-bold text-text-primary">Usuarios</h1>
      <p className="mb-6 text-sm text-text-subdued">{usuarios.length} usuarios registrados</p>

      {cargando ? (
        <p className="text-sm text-text-muted">Cargando usuarios…</p>
      ) : error ? (
        <p className="text-sm text-red-400">{error}</p>
      ) : (
        <UserList usuarios={usuarios} onActualizarRol={manejarActualizarRol} onEliminar={manejarEliminar} />
      )}
    </div>
  );
}
