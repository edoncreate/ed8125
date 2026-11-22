import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useHashScroll } from './hooks/useHashScroll'
import { AlbumPage } from './pages/AlbumPage'
import { Home } from './pages/Home/Home'
import { LatestBeatsPage } from './pages/LatestBeatsPage'
import './styles/global.css'

export function AppRoutes() {
  useHashScroll()
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/brasil-com-amor" element={<AlbumPage />} />
      <Route path="/latest-beats" element={<LatestBeatsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
