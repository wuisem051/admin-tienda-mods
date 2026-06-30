import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Package } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import AddApp from './pages/AddApp';
import './index.css';

function App() {
    return (
        <Router>
            <div className="app-container">
                {/* Sidebar */}
                <aside className="sidebar">
                    <div className="sidebar-header">
                        <h2 className="logo">MODStore<span className="accent">Admin</span></h2>
                    </div>
                    <nav className="nav-menu">
                        <Link to="/" className="nav-link">
                            <LayoutDashboard size={20} />
                            <span>Dashboard</span>
                        </Link>
                        <Link to="/apps" className="nav-link">
                            <Package size={20} />
                            <span>Mis Aplicaciones</span>
                        </Link>
                        <Link to="/add" className="nav-link">
                            <PlusCircle size={20} />
                            <span>Agregar App</span>
                        </Link>
                    </nav>
                </aside>

                {/* Contenido Principal */}
                <main className="main-content">
                    <header className="topbar">
                        <h3>Panel de Administración</h3>
                        <div className="user-profile">
                            <img src="https://ui-avatars.com/api/?name=Admin&background=bb86fc&color=fff" alt="Admin" className="avatar" />
                        </div>
                    </header>
                    <div className="page-content">
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/apps" element={<Dashboard />} />
                            <Route path="/add" element={<AddApp />} />
                        </Routes>
                    </div>
                </main>
            </div>
        </Router>
    );
}

export default App;
