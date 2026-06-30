import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function AddApp() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        version: '',
        description: '',
        downloadUrl: '',
        category: 'Juegos',
        imageUrl: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.downloadUrl) return alert("Nombre y URL son obligatorios");

        setLoading(true);
        try {
            await addDoc(collection(db, 'mods'), {
                ...formData,
                createdAt: serverTimestamp(),
                downloads: 0
            });

            alert("Aplicación guardada correctamente");
            navigate('/apps');
        } catch (err) {
            console.error(err);
            alert("Error al guardar");
        }
        setLoading(false);
    };

    return (
        <div className="glass-panel" style={{ maxWidth: '800px' }}>
            <h2>Agregar Nueva Aplicación</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                Agrega una nueva app o mod a tu tienda para que los usuarios la descarguen.
            </p>

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="form-group">
                        <label>Nombre de la App</label>
                        <input type="text" name="name" className="form-input" onChange={handleChange} required placeholder="Ej: Minecraft MOD" />
                    </div>
                    <div className="form-group">
                        <label>Versión</label>
                        <input type="text" name="version" className="form-input" onChange={handleChange} placeholder="Ej: V 1.20.0" />
                    </div>
                </div>

                <div className="form-group">
                    <label>URL de Descarga (APK / Enlace externo)</label>
                    <input type="url" name="downloadUrl" className="form-input" onChange={handleChange} required placeholder="https://..." />
                </div>

                <div className="form-group">
                    <label>Categoría</label>
                    <select name="category" className="form-input" onChange={handleChange}>
                        <option value="Juegos">Juegos</option>
                        <option value="Herramientas">Herramientas</option>
                        <option value="Social">Social</option>
                        <option value="Otros">Otros</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Descripción corta</label>
                    <textarea name="description" className="form-input" rows="4" onChange={handleChange} placeholder="Mod con dinero ilimitado..."></textarea>
                </div>

                <div className="form-group">
                    <label>URL de la Imagen (Play Store)</label>
                    <input type="url" name="imageUrl" className="form-input" onChange={handleChange} required placeholder="https://play-lh.googleusercontent.com/..." />
                </div>

                <button type="submit" className="btn" disabled={loading} style={{ marginTop: '1rem' }}>
                    {loading ? 'Subiendo...' : <><Upload size={18} /> Publicar Aplicación</>}
                </button>
            </form>
        </div>
    );
}

export default AddApp;
