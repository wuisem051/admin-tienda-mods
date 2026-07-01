import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import { LayoutDashboard, PlusCircle, Package, LogOut, Loader2 } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import AddApp from './pages/AddApp';
import Login from './pages/Login';
import './index.css';

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        if (window.confirm('¿Seguro que deseas cerrar la sesión?')) {
            try {
                await signOut(auth);
            } catch (err) {
                console.error("Error signing out: ", err);
            }
        }
    };

    if (loading) {
        return (
            <div className="auth-loading">
                <Loader2 className="spinner" size={48} color="#bb86fc" />
                <p>Verificando credenciales...</p>
            </div>
        );
    }

    if (!user) {
        return <Login />;
    }

    return (
        <Router>
            <div className="app-container">
                {/* Sidebar */}
                <aside className="sidebar">
                    <div className="sidebar-header">
                        <h2 className="logo">MODStore<span className="accent">Admin</span></h2>
                    </div>
                    <nav className="nav-menu">
                        <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                            <LayoutDashboard size={20} />
                            <span>Dashboard</span>
                        </NavLink>
                        <NavLink to="/apps" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                            <Package size={20} />
                            <span>Mis Aplicaciones</span>
                        </NavLink>
                        <NavLink to="/add" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                            <PlusCircle size={20} />
                            <span>Agregar App</span>
                        </NavLink>
                    </nav>
                    <div className="sidebar-footer">
                        <button className="btn-logout" onClick={handleLogout}>
                            <LogOut size={18} />
                            <span>Cerrar Sesión</span>
                        </button>
                    </div>
                </aside>

                {/* Contenido Principal */}
                <main className="main-content">
                    <header className="topbar">
                        <h3>Panel de Administración</h3>
                        <div className="user-profile">
                            <span className="user-email">{user.email}</span>
                            <img src={`https://ui-avatars.com/api/?name=${user.email || 'Admin'}&background=bb86fc&color=fff`} alt="Admin" className="avatar" />
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
