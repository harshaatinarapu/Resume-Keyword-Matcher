import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuthContext } from './context/AuthContext.jsx'
import LoginPage from './pages/LoginPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'

function RequireAuth({ children }) {
  const { user, initializing } = useAuthContext()
  if (initializing) return null
  if (!user) return <Navigate to="/login" replace />
  return children
}

function RedirectIfAuthed({ children }) {
  const { user, initializing } = useAuthContext()
  if (initializing) return null
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              <RedirectIfAuthed>
                <LoginPage />
              </RedirectIfAuthed>
            }
          />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <DashboardPage />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
