import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Knowledge from './pages/Knowledge'
import Chat from './pages/Chat'
import DocumentDetail from './pages/DocumentDetail'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import About from './pages/About'
import Shortcuts from './pages/Shortcuts'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/knowledge" element={<Knowledge />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/documents/:id" element={<DocumentDetail />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/about" element={<About />} />
      <Route path="/shortcuts" element={<Shortcuts />} />
      {/* 移动端问答复用 Chat，内部自适应单栏 */}
      <Route path="/m/chat" element={<Chat />} />
    </Routes>
  )
}
