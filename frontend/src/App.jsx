import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/layout/Sidebar';
import BottomBar from './components/layout/BottomBar';
import DetailPanel from './components/layout/DetailPanel';
import LoginRegister from './components/auth/LoginRegister';
import CatalogPage from './pages/CatalogPage';
import OrdersPage from './pages/OrdersPage';
import ProfilePage from './pages/ProfilePage';
import UsersPage from './pages/UsersPage';

function RutaProtegida({ children }) {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base-black text-text-subdued">
        Cargando…
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/** Igual que RutaProtegida, pero además exige rol de administrador. */
function RutaAdmin({ children }) {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base-black text-text-subdued">
        Cargando…
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (usuario.rol !== 'admin') {
    return <Navigate to="/catalogo" replace />;
  }

  return children;
}

function LayoutPrincipal({ children }) {
  return (
    <div className="flex h-screen flex-col bg-base-black">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-base-panel">{children}</main>
        <DetailPanel />
      </div>
      <BottomBar />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginRegister />} />

      <Route
        path="/catalogo"
        element={
          <RutaProtegida>
            <LayoutPrincipal>
              <CatalogPage />
            </LayoutPrincipal>
          </RutaProtegida>
        }
      />

      <Route
        path="/pedidos"
        element={
          <RutaProtegida>
            <LayoutPrincipal>
              <OrdersPage />
            </LayoutPrincipal>
          </RutaProtegida>
        }
      />

      <Route
        path="/perfil"
        element={
          <RutaProtegida>
            <LayoutPrincipal>
              <ProfilePage />
            </LayoutPrincipal>
          </RutaProtegida>
        }
      />

      {/* Vista exclusiva de administrador */}
      <Route
        path="/usuarios"
        element={
          <RutaAdmin>
            <LayoutPrincipal>
              <UsersPage />
            </LayoutPrincipal>
          </RutaAdmin>
        }
      />

      <Route path="*" element={<Navigate to="/catalogo" replace />} />
    </Routes>
  );
}
