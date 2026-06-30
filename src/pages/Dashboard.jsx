import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Trash2, Edit } from 'lucide-react';

function Dashboard() {
    const [mods, setMods] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onSnapshot(collection(db, 'mods'), (snapshot) => {
            let data = [];
            snapshot.forEach(doc => {
                data.push({ id: doc.id, ...doc.data() });
            });
            setMods(data);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('¿Seguro quieres eliminar este mod?')) {
            await deleteDoc(doc(db, 'mods', id));
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>Mis Aplicaciones Guardadas</h2>
            </div>

            {loading ? (
                <p>Cargando apps...</p>
            ) : mods.length === 0 ? (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
                    <p style={{ color: 'var(--text-muted)' }}>No hay aplicaciones subidas todavía.</p>
                </div>
            ) : (
                <div className="mod-grid">
                    {mods.map(app => (
                        <div key={app.id} className="mod-card">
                            <div className="mod-header">
                                {app.imageUrl ? (
                                    <img src={app.imageUrl} alt={app.name} className="mod-icon" />
                                ) : (
                                    <div className="mod-icon" />
                                )}
                                <div>
                                    <h4 className="mod-title">{app.name}</h4>
                                    <span className="mod-version">v{app.version || '1.0'}</span>
                                </div>
                            </div>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                {app.description?.substring(0, 50)}...
                            </p>
                            <div className="mod-actions">
                                <button className="btn btn-small" onClick={() => alert('Pronto editar')}>
                                    <Edit size={14} /> Editar
                                </button>
                                <button className="btn btn-danger btn-small" onClick={() => handleDelete(app.id)}>
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Dashboard;
