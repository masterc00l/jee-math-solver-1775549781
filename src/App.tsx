import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Home } from './pages/Home';
import { Settings } from './pages/Settings';
import './index.css';
export default function App() {
  return (
    <BrowserRouter>
      <nav className="flex gap-4 p-4 border-b"><span className="font-bold">JEE Solver</span><Link to="/">Solve</Link><Link to="/settings">Settings</Link></nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}
