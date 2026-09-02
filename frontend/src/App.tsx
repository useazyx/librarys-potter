import { lazy, Suspense, type ReactNode } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { BrandLoader } from './components/ui/Loaders'
import { useAuth } from './context/AuthContext'
import type { Role } from './types/api'

// Cada rota vira um chunk separado: quem abre a home só baixa a home.
const Home = lazy(() => import('./pages/Home'))
const Catalog = lazy(() => import('./pages/Catalog'))
const BookDetail = lazy(() => import('./pages/BookDetail'))
const Saga = lazy(() => import('./pages/Saga'))
const SortingHat = lazy(() => import('./pages/SortingHat'))
const WandWorkshop = lazy(() => import('./pages/WandWorkshop'))
const Library = lazy(() => import('./pages/Library'))
const Spells = lazy(() => import('./pages/Spells'))
const SettingsPage = lazy(() => import('./pages/Settings'))
const CartPage = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/Checkout'))
const Profile = lazy(() => import('./pages/Profile'))
const Support = lazy(() => import('./pages/Support'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const NotFound = lazy(() => import('./pages/NotFound'))

function RequireAuth({ children, roles }: { children: ReactNode; roles?: Role[] }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <BrandLoader label="Conferindo sua carteirinha..." />

  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />

  if (roles && !roles.includes(user.role)) return <Navigate to="/perfil" replace />

  return <>{children}</>
}

export default function App() {
  return (
    <Suspense fallback={<BrandLoader />}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<Catalog />} />
          <Route path="/produto/:slug" element={<BookDetail />} />
          {/* A rota antiga continua valendo: links de fora do site e pedidos
              já feitos apontam para `/livro/:slug`. */}
          <Route path="/livro/:slug" element={<BookDetail />} />
          <Route path="/saga" element={<Saga />} />
          <Route path="/chapeu-seletor" element={<SortingHat />} />
          <Route path="/oficina-de-varinhas" element={<WandWorkshop />} />
          <Route path="/biblioteca" element={<Library />} />
          <Route path="/feiticos" element={<Spells />} />
          <Route path="/configuracoes" element={<SettingsPage />} />
          <Route path="/carrinho" element={<CartPage />} />
          <Route path="/ajuda" element={<Support />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Register />} />
          <Route path="/redefinir-senha" element={<ResetPassword />} />

          <Route
            path="/checkout"
            element={
              <RequireAuth>
                <Checkout />
              </RequireAuth>
            }
          />
          <Route
            path="/perfil"
            element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            }
          />
          <Route
            path="/painel"
            element={
              <RequireAuth roles={['SUPPLIER', 'SUPPORT']}>
                <Dashboard />
              </RequireAuth>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
