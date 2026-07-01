import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { Trash2, Edit, Package, Download, Heart, X, Save, Upload, Loader2 } from 'lucide-react';

function Dashboard() {
    const [mods, setMods] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [editingApp, setEditingApp] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Upload progress states
    const [imageFile, setImageFile] = useState(null);
    const [apkFile, setApkFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState({ image: 0, apk: 0 });

    useEffect(() => {
        const unsub = onSnapshot(collection(db, 'mods'), (snapshot) => {
            let data = [];
            snapshot.forEach(doc => {
                data.push({ id: doc.id, ...doc.data() });
            });
            setMods(data);
            setLoading(false);
        }, (err) => {
            console.error("Error in snapshot listener: ", err);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('¿Seguro quieres eliminar este mod?')) {
            try {
                await deleteDoc(doc(db, 'mods', id));
            } catch (err) {
                console.error("Error deleting app: ", err);
                alert("Error al eliminar la aplicación");
            }
        }
    };

    const handleOpenEdit = (app) => {
        setEditingApp({ ...app });
        setImageFile(null);
        setApkFile(null);
        setUploadProgress({ image: 0, apk: 0 });
        setModalOpen(true);
    };

    const handleCloseEdit = () => {
        setEditingApp(null);
        setModalOpen(false);
    };

    const handleEditChange = (e) => {
        setEditingApp({ ...editingApp, [e.target.name]: e.target.value });
    };

    const handleFileUpload = (file, type) => {
        return new Promise((resolve, reject) => {
            if (!file) {
                resolve(null);
                return;
            }

            const folder = type === 'image' ? 'images' : 'apks';
            const fileRef = ref(storage, `mods/${folder}/${Date.now()}_${file.name}`);
            const uploadTask = uploadBytesResumable(fileRef, file);

            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setUploadProgress(prev => ({ ...prev, [type]: Math.round(progress) }));
                },
                (error) => {
                    console.error("Upload error: ", error);
                    reject(error);
                },
                async () => {
                    const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(downloadUrl);
                }
            );
        });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!editingApp.name) return alert("El nombre es requerido");

        setSubmitting(true);
        try {
            let updatedImageUrl = editingApp.imageUrl;
            let updatedDownloadUrl = editingApp.downloadUrl;

            // Upload image if present
            if (imageFile) {
                const imgUrl = await handleFileUpload(imageFile, 'image');
                if (imgUrl) updatedImageUrl = imgUrl;
            }

            // Upload apk if present
            if (apkFile) {
                const apkUrl = await handleFileUpload(apkFile, 'apk');
                if (apkUrl) updatedDownloadUrl = apkUrl;
            }

            const docRef = doc(db, 'mods', editingApp.id);
            await updateDoc(docRef, {
                name: editingApp.name,
                version: editingApp.version || '',
                description: editingApp.description || '',
                category: editingApp.category || 'Juegos',
                imageUrl: updatedImageUrl,
                downloadUrl: updatedDownloadUrl
            });

            alert("Aplicación actualizada con éxito");
            setModalOpen(false);
        } catch (err) {
            console.error("Error updating app: ", err);
            alert("Error al actualizar la aplicación");
        }
        setSubmitting(false);
    };

    // Calculate aggregated stats
    const totalApps = mods.length;
    const totalDownloads = mods.reduce((sum, item) => sum + (item.downloads || 0), 0);
    const gamesCount = mods.filter(app => app.category === 'Juegos').length;

    return (
        <div>
            {/* Header section stats */}
            <div className="stats-grid">
                <div className="stats-card">
                    <div className="stats-icon-container">
                        <Package size={24} />
                    </div>
                    <div className="stats-details">
                        <h3>{totalApps}</h3>
                        <p>Total Apps</p>
                    </div>
                </div>

                <div className="stats-card">
                    <div className="stats-icon-container">
                        <Download size={24} />
                    </div>
                    <div className="stats-details">
                        <h3>{totalDownloads}</h3>
                        <p>Descargas Totales</p>
                    </div>
                </div>

                <div className="stats-card">
                    <div className="stats-icon-container">
                        <Heart size={24} />
                    </div>
                    <div className="stats-details">
                        <h3>{gamesCount}</h3>
                        <p>Total Juegos</p>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>Mis Aplicaciones Guardadas</h2>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                    <Loader2 className="spinner" size={32} color="#bb86fc" />
                    <span style={{ marginLeft: '10px', color: 'var(--text-muted)' }}>Cargando apps...</span>
                </div>
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
                            <span className="mod-category-badge">{app.category || 'Categoría'}</span>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', minHeight: '40px', marginTop: '0.8rem' }}>
                                {app.description?.length > 70 ? `${app.description.substring(0, 70)}...` : app.description || 'Sin descripción'}
                            </p>
                            <div style={{ fontSize: '0.8rem', color: 'var(--accent)', marginTop: '0.5rem', display: 'flex', gap: '15px' }}>
                                <span>📥 {app.downloads || 0} descargas</span>
                            </div>
                            <div className="mod-actions">
                                <button className="btn btn-small" onClick={() => handleOpenEdit(app)}>
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

            {/* Modal de edición */}
            {modalOpen && editingApp && (
                <div className="modal-overlay">
                    <div className="modal-content glass-panel">
                        <div className="modal-header">
                            <h3>Editar Aplicación</h3>
                            <button className="modal-close" onClick={handleCloseEdit}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="modal-form">
                            <div className="form-row-2">
                                <div className="form-group">
                                    <label>Nombre de la App</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={editingApp.name}
                                        onChange={handleEditChange}
                                        className="form-input"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Versión</label>
                                    <input
                                        type="text"
                                        name="version"
                                        value={editingApp.version}
                                        onChange={handleEditChange}
                                        className="form-input"
                                    />
                                </div>
                            </div>

                            <div className="form-row-2">
                                <div className="form-group">
                                    <label>Categoría</label>
                                    <select
                                        name="category"
                                        value={editingApp.category || 'Juegos'}
                                        onChange={handleEditChange}
                                        className="form-input"
                                    >
                                        <option value="Juegos">Juegos</option>
                                        <option value="Herramientas">Herramientas</option>
                                        <option value="Social">Social</option>
                                        <option value="Otros">Otros</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>URL de Descarga Manual (Opcional)</label>
                                    <input
                                        type="url"
                                        name="downloadUrl"
                                        value={editingApp.downloadUrl}
                                        onChange={handleEditChange}
                                        className="form-input"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>

                            {/* APK Upload option */}
                            <div className="form-group upload-section-card">
                                <label className="upload-box-label">Subir APK / Archivo Instalador (Reemplaza URL anterior)</label>
                                <div className="file-uploader-box">
                                    <Upload size={20} className="upload-box-icon" />
                                    <input
                                        type="file"
                                        accept=".apk"
                                        onChange={(e) => setApkFile(e.target.files[0])}
                                        className="file-input-hidden"
                                        id="edit-apk-file"
                                    />
                                    <label htmlFor="edit-apk-file" className="file-selector-btn">
                                        {apkFile ? apkFile.name : "Seleccionar archivo APK"}
                                    </label>
                                    {apkFile && <span className="file-size-badge">{(apkFile.size / (1024 * 1024)).toFixed(2)} MB</span>}
                                </div>
                                {uploadProgress.apk > 0 && (
                                    <div className="progress-container">
                                        <div className="progress-bar" style={{ width: `${uploadProgress.apk}%` }}></div>
                                        <span className="progress-text">Subiendo APK: {uploadProgress.apk}%</span>
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Descripción del Mod</label>
                                <textarea
                                    name="description"
                                    value={editingApp.description}
                                    onChange={handleEditChange}
                                    className="form-input"
                                    rows="3"
                                />
                            </div>

                            <div className="form-row-2">
                                <div className="form-group">
                                    <label>URL de la Imagen (Play Store / Logo)</label>
                                    <input
                                        type="url"
                                        name="imageUrl"
                                        value={editingApp.imageUrl}
                                        onChange={handleEditChange}
                                        className="form-input"
                                    />
                                </div>

                                {/* Logo image Upload option */}
                                <div className="form-group">
                                    <label>O Subir Icono desde el dispositivo</label>
                                    <div className="file-uploader-box small-uploader">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setImageFile(e.target.files[0])}
                                            className="file-input-hidden"
                                            id="edit-img-file"
                                        />
                                        <label htmlFor="edit-img-file" className="file-selector-btn small-btn">
                                            {imageFile ? imageFile.name : "Subir nueva imagen"}
                                        </label>
                                    </div>
                                    {uploadProgress.image > 0 && (
                                        <div className="progress-container">
                                            <div className="progress-bar" style={{ width: `${uploadProgress.image}%` }}></div>
                                            <span className="progress-text">Subiendo imagen: {uploadProgress.image}%</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="modal-actions-footer">
                                <button type="button" className="btn btn-secondary" onClick={handleCloseEdit} disabled={submitting}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn" disabled={submitting}>
                                    {submitting ? (
                                        <>
                                            <Loader2 className="spinner" size={16} /> Salvando...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={16} /> Guardar Cambios
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;
