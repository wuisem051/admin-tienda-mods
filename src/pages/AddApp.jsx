import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { Upload, ArrowLeft, Image as ImageIcon, Plus, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function AddApp() {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);

    // Form fields state
    const [formData, setFormData] = useState({
        name: '',
        version: '',
        description: '',
        downloadUrl: '',
        category: 'Juegos',
        imageUrl: ''
    });

    // File upload states
    const [imageFile, setImageFile] = useState(null);
    const [apkFile, setApkFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState({ image: 0, apk: 0 });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        let finalDownloadUrl = formData.downloadUrl;
        let finalImageUrl = formData.imageUrl;

        if (!formData.name) return alert("El nombre es obligatorio");
        if (!apkFile && !finalDownloadUrl) return alert("Debes subir un archivo APK o propocionar una URL de descarga");
        if (!imageFile && !finalImageUrl) return alert("Debes subir un icono o proporcionar una URL del icono");

        setSubmitting(true);
        try {
            // 1. Upload Icon if selected
            if (imageFile) {
                const imgUrl = await handleFileUpload(imageFile, 'image');
                if (imgUrl) finalImageUrl = imgUrl;
            }

            // 2. Upload APK if selected
            if (apkFile) {
                const apkUrl = await handleFileUpload(apkFile, 'apk');
                if (apkUrl) finalDownloadUrl = apkUrl;
            }

            // 3. Add to Firestore db
            await addDoc(collection(db, 'mods'), {
                name: formData.name,
                version: formData.version || '1.0',
                category: formData.category,
                description: formData.description || '',
                downloadUrl: finalDownloadUrl,
                imageUrl: finalImageUrl,
                downloads: 0,
                createdAt: serverTimestamp()
            });

            alert("Aplicación publicada con éxito");
            navigate('/apps');
        } catch (err) {
            console.error("Error creating app: ", err);
            alert("Error al publicar la aplicación. Detalles: " + err.message);
        }
        setSubmitting(false);
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <button className="btn btn-secondary btn-small" onClick={() => navigate(-1)} style={{ marginBottom: '1.5rem', gap: '0.4rem' }}>
                <ArrowLeft size={16} /> Volver
            </button>

            <div className="glass-panel">
                <h2>Agregar Nueva Aplicación</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>
                    Agrega una nueva app o mod a tu tienda. Llena los detalles y sube los archivos necesarios.
                </p>

                <form onSubmit={handleSubmit} className="add-app-form">
                    <div className="form-row-2">
                        <div className="form-group">
                            <label>Nombre de la App *</label>
                            <input
                                type="text"
                                name="name"
                                className="form-input"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="Ej: Minecraft MOD"
                            />
                        </div>
                        <div className="form-group">
                            <label>Versión</label>
                            <input
                                type="text"
                                name="version"
                                className="form-input"
                                value={formData.version}
                                onChange={handleChange}
                                placeholder="Ej: v1.21.32"
                            />
                        </div>
                    </div>

                    <div className="form-row-2">
                        <div className="form-group">
                            <label>Categoría</label>
                            <select
                                name="category"
                                className="form-input"
                                value={formData.category}
                                onChange={handleChange}
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
                                className="form-input"
                                value={formData.downloadUrl}
                                onChange={handleChange}
                                placeholder="https://..."
                                disabled={!!apkFile}
                            />
                        </div>
                    </div>

                    {/* APK File Uploader */}
                    <div className="form-group upload-section-card">
                        <label className="upload-box-label">Sube tu Archivo APK / Instalador</label>
                        <div className="file-uploader-box">
                            <Upload size={24} className="upload-box-icon" />
                            <input
                                type="file"
                                accept=".apk"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    setImageFile(null); // prevent cross updates
                                    setApkFile(file);
                                }}
                                className="file-input-hidden"
                                id="add-apk-file"
                            />
                            <label htmlFor="add-apk-file" className="file-selector-btn">
                                {apkFile ? apkFile.name : "Seleccionar archivo APK"}
                            </label>
                            {apkFile && (
                                <span className="file-size-badge">
                                    {(apkFile.size / (1024 * 1024)).toFixed(2)} MB
                                </span>
                            )}
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
                            className="form-input"
                            rows="4"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Ej: Mod menú con dinero infinito, skins desbloqueadas y sin anuncios..."
                        ></textarea>
                    </div>

                    <div className="form-row-2">
                        <div className="form-group">
                            <label>URL de la Imagen / Icono (Play Store u otro)</label>
                            <input
                                type="url"
                                name="imageUrl"
                                className="form-input"
                                value={formData.imageUrl}
                                onChange={handleChange}
                                placeholder="https://play-lh.googleusercontent.com/..."
                                disabled={!!imageFile}
                            />
                        </div>

                        {/* Logo Image File Uploader */}
                        <div className="form-group">
                            <label>O Sube el Icono de la App</label>
                            <div className="file-uploader-box small-uploader">
                                <ImageIcon size={18} className="upload-box-icon" />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setImageFile(e.target.files[0])}
                                    className="file-input-hidden"
                                    id="add-img-file"
                                />
                                <label htmlFor="add-img-file" className="file-selector-btn small-btn">
                                    {imageFile ? imageFile.name : "Seleccionar Icono"}
                                </label>
                            </div>
                            {uploadProgress.image > 0 && (
                                <div className="progress-container">
                                    <div className="progress-bar" style={{ width: `${uploadProgress.image}%` }}></div>
                                    <span className="progress-text">Subiendo Icono: {uploadProgress.image}%</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <button type="submit" className="btn btn-large" disabled={submitting} style={{ marginTop: '2rem', width: '100%', gap: '0.6rem' }}>
                        {submitting ? (
                            <>
                                <Loader2 className="spinner" size={20} /> Publicando y subiendo archivos...
                            </>
                        ) : (
                            <>
                                <Plus size={20} /> Publicar Nueva Aplicación
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AddApp;
