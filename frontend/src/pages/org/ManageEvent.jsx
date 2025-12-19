import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
// Pastikan fungsi-fungsi ini ada di api.js Anda
import api, { updateEvent, updateSession, uploadEventThumbnail } from "../../api"; 

// --- 1. KOMPONEN MODAL VISIBILITAS ---
const VisibilityModal = ({ config, onClose, onSave }) => {
    if (!config.isOpen) return null;

    const [status, setStatus] = useState(config.currentStatus || 'DRAFT');
    const [scheduleDate, setScheduleDate] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setStatus(config.currentStatus || 'DRAFT');
        if (config.currentDate) {
            const date = new Date(config.currentDate);
            const offset = date.getTimezoneOffset() * 60000;
            const localISOTime = (new Date(date - offset)).toISOString().slice(0, 16);
            setScheduleDate(localISOTime);
        } else {
            setScheduleDate('');
        }
    }, [config]);

    const handleSave = async () => {
        setLoading(true);
        if (status === 'SCHEDULED' && !scheduleDate) {
            alert("Silakan pilih tanggal dan jam penayangan!");
            setLoading(false);
            return;
        }
        await onSave(status, scheduleDate);
        setLoading(false);
        onClose();
    };

    return (
        <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999
        }}>
            <div style={{ background: "white", padding: "25px", borderRadius: "8px", width: "400px", maxWidth: "90%", boxShadow: "0 4px 15px rgba(0,0,0,0.3)" }}>
                <h3 style={{marginTop:0, borderBottom:"1px solid #eee", paddingBottom:10}}>👁️ Atur Status: {config.type}</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                    <label style={{ display: "flex", gap: "10px", padding: "10px", border: "1px solid #ddd", borderRadius: "5px", cursor:"pointer", background: status==='DRAFT'?'#f7fafc':'white' }}>
                        <input type="radio" name="vis" value="DRAFT" checked={status === 'DRAFT'} onChange={() => setStatus('DRAFT')} />
                        <div><b>🔒 Private (Draft)</b><br/><small style={{color:"#718096"}}>Hanya Anda yang bisa melihat.</small></div>
                    </label>
                    <label style={{ display: "flex", gap: "10px", padding: "10px", border: "1px solid #ddd", borderRadius: "5px", cursor:"pointer", background: status==='PUBLISHED'?'#f0fff4':'white' }}>
                        <input type="radio" name="vis" value="PUBLISHED" checked={status === 'PUBLISHED'} onChange={() => setStatus('PUBLISHED')} />
                        <div><b>🌍 Public (Tayang)</b><br/><small style={{color:"#718096"}}>Dapat dilihat semua orang.</small></div>
                    </label>
                    <label style={{ display: "flex", gap: "10px", padding: "10px", border: "1px solid #ddd", borderRadius: "5px", cursor:"pointer", background: status==='SCHEDULED'?'#fffaf0':'white' }}>
                        <input type="radio" name="vis" value="SCHEDULED" checked={status === 'SCHEDULED'} onChange={() => setStatus('SCHEDULED')} />
                        <div><b>📅 Jadwalkan</b><br/><small style={{color:"#718096"}}>Tayang otomatis nanti.</small></div>
                    </label>
                    {status === 'SCHEDULED' && (
                        <div style={{marginLeft:30}}>
                            <input type="datetime-local" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} style={{width: "100%", padding: "8px", border:"1px solid #ccc", borderRadius:4}} />
                        </div>
                    )}
                </div>
                <div style={{display:"flex", justifyContent:"flex-end", gap:10}}>
                    <button onClick={onClose} disabled={loading} style={{ padding: "8px 15px", border: "none", background: "#cbd5e0", borderRadius: "4px", cursor: "pointer" }}>Batal</button>
                    <button onClick={handleSave} disabled={loading} style={{ background: "#3182ce", color: "white", padding: "8px 15px", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight:"bold" }}>{loading ? "Menyimpan..." : "Simpan Status"}</button>
                </div>
            </div>
        </div>
    );
};

// --- 2. KOMPONEN UTAMA MANAGE EVENT ---
export default function ManageEvent() {
    const { eventID } = useParams();
    
    // State Data
    const [event, setEvent] = useState(null);
    const [sessions, setSessions] = useState([]);
    
    // State UI
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalConfig, setModalConfig] = useState({ isOpen: false, type: '', id: null, title: '', currentStatus: '', currentDate: null });

    // State Edit Event
    const [isEditingEvent, setIsEditingEvent] = useState(false);
    const [editEventForm, setEditEventForm] = useState({ title: "", description: "", category: "" });
    const [savingEvent, setSavingEvent] = useState(false);

    // --- State Edit Session ---
    const [editingSessionId, setEditingSessionId] = useState(null);
    const [editSessionForm, setEditSessionForm] = useState({ title: "", description: "", price: 0 });
    const [savingSession, setSavingSession] = useState(false);

    // State Create & Upload
    const [newSession, setNewSession] = useState({ title: "", description: "", price: 0 });
    const [uploadingId, setUploadingId] = useState(null); 

    useEffect(() => {
        loadData();
    }, [eventID]);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get(`/organization/events/${eventID}`);
            console.log("Loaded Data:", res.data);
            setEvent(res.data.event);
            setSessions(res.data.sessions || []);
        } catch (err) {
            console.error("Error loading event:", err);
            setError("Gagal memuat event. Pastikan Anda login dan pemilik event ini.");
        } finally {
            setLoading(false);
        }
    };

    // --- HANDLER UPDATE EVENT ---
    const handleEditEventClick = () => {
        setEditEventForm({
            title: event.title,
            description: event.description,
            category: event.category || "Technology"
        });
        setIsEditingEvent(true);
    };

    const handleUpdateEventSubmit = async (e) => {
        e.preventDefault();
        setSavingEvent(true);
        try {
            await updateEvent(event.id, editEventForm);
            setEvent(prev => ({ ...prev, ...editEventForm }));
            setIsEditingEvent(false);
            alert("✅ Info Event berhasil diperbarui!");
        } catch (err) {
            console.error(err);
            alert("❌ Gagal update event: " + (err.response?.data?.error || "Terjadi kesalahan"));
        } finally {
            setSavingEvent(false);
        }
    };

    // --- HANDLER UPLOAD THUMBNAIL (COVER) ---
    const handleThumbnailChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
            const res = await uploadEventThumbnail(event.id, file);
            setEvent(prev => ({ ...prev, thumbnail_url: res.thumbnail_url }));
            alert("✅ Thumbnail berhasil diubah!");
        } catch (error) {
            console.error(error);
            alert("❌ Gagal upload thumbnail");
        }
    };

    // --- HANDLER UPDATE SESSION ---
    const handleEditSessionClick = (session) => {
        setEditingSessionId(session.id);
        setEditSessionForm({
            title: session.title,
            description: session.description,
            price: session.price
        });
    };

    const handleUpdateSessionSubmit = async (e) => {
        e.preventDefault();
        setSavingSession(true);
        try {
            await updateSession(editingSessionId, editSessionForm);
            setSessions(prev => prev.map(s => 
                s.id === editingSessionId ? { ...s, ...editSessionForm } : s
            ));
            setEditingSessionId(null);
            alert("✅ Sesi berhasil diperbarui!");
        } catch (error) {
            console.error(error);
            alert("❌ Gagal update sesi: " + (error.response?.data?.error || "Error"));
        } finally {
            setSavingSession(false);
        }
    };

    // --- HANDLER CREATE SESSION ---
    const handleCreateSession = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/organization/events/${eventID}/sessions`, newSession);
            alert("✅ Sesi berhasil ditambahkan!");
            setNewSession({ title: "", description: "", price: 0 });
            loadData(); 
        } catch (error) {
            alert("Gagal: " + (error.response?.data?.error || "Error"));
        }
    };

    // --- HANDLER UPLOAD MATERI ---
    const handleUpload = async (type, sessionID, fileInput) => {
        const file = fileInput.files[0];
        if (!file) return alert(`Pilih file ${type} dulu!`);

        const formData = new FormData();
        formData.append(type === 'video' ? 'video' : 'file', file);
        formData.append("title", file.name);
        
        setUploadingId(`${type}-${sessionID}`);
        try {
            await api.post(`/organization/sessions/${sessionID}/${type}s`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            alert("✅ Upload Berhasil!");
            fileInput.value = "";
            loadData(); // Reload untuk menampilkan materi baru
        } catch (error) {
            console.error(error);
            alert("❌ Gagal Upload: " + (error.response?.data?.error || "Error"));
        } finally {
            setUploadingId(null);
        }
    };

    const handleSaveVisibility = async (status, date) => {
        const { type, id } = modalConfig;
        try {
            let endpoint = type === 'Event' ? `/organization/events/${id}` : `/organization/sessions/${id}`;
            if (status === 'PUBLISHED') endpoint += `/publish`;
            else if (status === 'DRAFT') endpoint += `/unpublish`;
            else endpoint += `/schedule`;

            const payload = status === 'SCHEDULED' ? { publish_at: date } : {}; 
            const res = await api.put(endpoint, payload);
            
            if (type === 'Event') {
                setEvent(prev => ({ ...prev, publish_status: res.data.status, publish_at: res.data.publish_at }));
            } else {
                setSessions(prev => prev.map(s => s.id === id ? { ...s, publish_status: res.data.status, publish_at: res.data.publish_at } : s));
            }
            alert(`Status berhasil diubah menjadi: ${res.data.status}`);
        } catch (error) {
            alert("Gagal update status.");
        }
    };

    const openModal = (type, item) => {
        setModalConfig({ isOpen: true, type: type, id: item.id, title: item.title, currentStatus: item.publish_status, currentDate: item.publish_at });
    };

    if (loading) return <div style={{padding:50, textAlign:"center"}}>⏳ Memuat Data...</div>;
    if (error) return <div style={{padding:50, textAlign:"center", color:"red"}}>⚠️ {error} <br/><br/> <Link to="/org">Kembali ke Dashboard</Link></div>;
    if (!event) return null;

    return (
        <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto", fontFamily: "sans-serif" }}>
            
            <VisibilityModal config={modalConfig} onClose={() => setModalConfig({...modalConfig, isOpen: false})} onSave={handleSaveVisibility} />

            <div style={{ marginBottom: 30, paddingBottom: 20, borderBottom: "1px solid #eee" }}>
                <Link to="/org" style={{textDecoration:"none", color:"#555"}}>⬅️ Kembali</Link>
                
                {/* THUMBNAIL */}
                <div style={{marginTop: 20, marginBottom: 20, position: "relative", width: "100%", height: "250px", background: "#f0f0f0", borderRadius: "8px", overflow: "hidden", border: "1px dashed #ccc"}}>
                    {event.thumbnail_url ? (
                        <img src={`http://localhost:8080/${event.thumbnail_url}`} alt="Event Cover" style={{width: "100%", height: "100%", objectFit: "cover"}} onError={(e) => { e.target.onerror = null; e.target.src="https://via.placeholder.com/800x250?text=Error+Loading+Image"; }} />
                    ) : (
                        <div style={{display:"flex", alignItems:"center", justifyContent:"center", height:"100%", color:"#888"}}><span>Belum ada gambar sampul</span></div>
                    )}
                    <div style={{position: "absolute", bottom: 10, right: 10}}>
                        <input type="file" id="thumbInput" style={{display: "none"}} accept="image/*" onChange={handleThumbnailChange} />
                        <button onClick={() => document.getElementById("thumbInput").click()} style={{background: "rgba(0,0,0,0.7)", color: "white", border: "none", padding: "8px 15px", borderRadius: "5px", cursor: "pointer"}}>📷 Ganti Cover</button>
                    </div>
                </div>

                {!isEditingEvent ? (
                    <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginTop:10}}>
                        <div>
                            <span style={{background:"#bee3f8", color:"#2b6cb0", padding:"2px 8px", borderRadius:4, fontSize:"0.8em", fontWeight:"bold"}}>{event.category || "Uncategorized"}</span>
                            <h1 style={{margin:"10px 0"}}>{event.title}</h1>
                            <p style={{color:"#666", margin:"5px 0", whiteSpace:"pre-wrap"}}>{event.description}</p>
                        </div>
                        <div style={{display:"flex", flexDirection:"column", gap:10, alignItems:"flex-end"}}>
                            <button onClick={handleEditEventClick} style={{padding:"8px 16px", background:"#3182ce", color:"white", border:"none", borderRadius:5, cursor:"pointer"}}>✏️ Edit Info</button>
                            <button onClick={() => openModal('Event', event)} style={{padding:"10px 20px", cursor:"pointer", borderRadius:5, border:"1px solid #ccc", background:"white"}}>Status: <b style={{color: event.publish_status === 'PUBLISHED' ? 'green' : (event.publish_status === 'SCHEDULED' ? 'orange' : 'gray')}}>{event.publish_status || 'DRAFT'}</b> ⚙️</button>
                        </div>
                    </div>
                ) : (
                    <div style={{marginTop:10, background:"#f7fafc", padding:20, borderRadius:8, border:"1px solid #e2e8f0"}}>
                        <h2 style={{marginTop:0}}>✏️ Edit Detail Event</h2>
                        <form onSubmit={handleUpdateEventSubmit} style={{display:"flex", flexDirection:"column", gap:15}}>
                            <input type="text" value={editEventForm.title} onChange={e => setEditEventForm({...editEventForm, title: e.target.value})} style={{width:"100%", padding:10, border:"1px solid #ccc", borderRadius:4}} required />
                            <select value={editEventForm.category} onChange={e => setEditEventForm({...editEventForm, category: e.target.value})} style={{width:"100%", padding:10, border:"1px solid #ccc", borderRadius:4}}>
                                <option value="Technology">Technology</option>
                                <option value="Business">Business</option>
                                <option value="Design">Design</option>
                                <option value="Lifestyle">Lifestyle</option>
                            </select>
                            <textarea rows="5" value={editEventForm.description} onChange={e => setEditEventForm({...editEventForm, description: e.target.value})} style={{width:"100%", padding:10, border:"1px solid #ccc", borderRadius:4}} required />
                            <div style={{display:"flex", gap:10}}>
                                <button type="button" onClick={() => setIsEditingEvent(false)} disabled={savingEvent} style={{padding:"10px 20px", background:"#cbd5e0", border:"none", borderRadius:4, cursor:"pointer"}}>Batal</button>
                                <button type="submit" disabled={savingEvent} style={{padding:"10px 20px", background:"#2f855a", color:"white", border:"none", borderRadius:4, cursor:"pointer"}}>Simpan</button>
                            </div>
                        </form>
                    </div>
                )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 30 }}>
                {/* FORM CREATE SESSION */}
                <div style={{ background: "#f8fff9", padding: 20, borderRadius: 8, border: "1px solid #c6f6d5", height: "fit-content" }}>
                    <h3 style={{marginTop:0, color:"#2f855a"}}>➕ Tambah Sesi</h3>
                    <form onSubmit={handleCreateSession} style={{display:"flex", flexDirection:"column", gap:10}}>
                        <input type="text" placeholder="Judul Sesi" required value={newSession.title} onChange={e=>setNewSession({...newSession, title:e.target.value})} style={{padding:10, border:"1px solid #ddd", borderRadius:4}}/>
                        <textarea placeholder="Deskripsi Singkat" value={newSession.description} onChange={e=>setNewSession({...newSession, description:e.target.value})} style={{padding:10, border:"1px solid #ddd", borderRadius:4}}/>
                        <input type="number" placeholder="Harga (Rp)" value={newSession.price} onChange={e=>setNewSession({...newSession, price:parseInt(e.target.value)})} style={{padding:10, border:"1px solid #ddd", borderRadius:4}}/>
                        <button type="submit" style={{padding:10, background:"#38a169", color:"white", border:"none", borderRadius:4, fontWeight:"bold", cursor:"pointer"}}>Simpan Sesi</button>
                    </form>
                </div>

                {/* LIST SESSION & MATERIAL */}
                <div>
                    <h2 style={{marginTop:0}}>Daftar Materi & Sesi</h2>
                    {sessions.length === 0 && <p style={{color:"#888"}}>Belum ada sesi.</p>}
                    
                    {sessions.map(s => (
                        <div key={s.id} style={{ border: "1px solid #e2e8f0", padding: 20, marginBottom: 15, borderRadius: 8, background: "white", boxShadow:"0 2px 4px rgba(0,0,0,0.02)" }}>
                            {editingSessionId === s.id ? (
                                <div style={{background:"#fffaf0", padding:15, borderRadius:6, border:"1px dashed #ed8936"}}>
                                    <h4 style={{marginTop:0, color:"#c05621"}}>📝 Edit Sesi</h4>
                                    <form onSubmit={handleUpdateSessionSubmit} style={{display:"flex", flexDirection:"column", gap:10}}>
                                        <input type="text" value={editSessionForm.title} onChange={e => setEditSessionForm({...editSessionForm, title: e.target.value})} style={{padding:8, borderRadius:4, border:"1px solid #ccc"}} />
                                        <textarea value={editSessionForm.description} onChange={e => setEditSessionForm({...editSessionForm, description: e.target.value})} style={{padding:8, borderRadius:4, border:"1px solid #ccc"}} />
                                        <input type="number" value={editSessionForm.price} onChange={e => setEditSessionForm({...editSessionForm, price: parseInt(e.target.value)})} style={{padding:8, borderRadius:4, border:"1px solid #ccc"}} />
                                        <div style={{display:"flex", gap:10}}>
                                            <button type="button" onClick={() => setEditingSessionId(null)} style={{flex:1, padding:8, background:"#cbd5e0", border:"none", borderRadius:4}}>Batal</button>
                                            <button type="submit" disabled={savingSession} style={{flex:1, padding:8, background:"#ed8936", color:"white", border:"none", borderRadius:4}}>Simpan</button>
                                        </div>
                                    </form>
                                </div>
                            ) : (
                                <div>
                                    <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:15}}>
                                        <div><h3 style={{margin:0}}>📂 {s.title}</h3><span style={{fontSize:"0.85em", background:"#eee", padding:"2px 6px", borderRadius:4, color:"#555"}}>Rp {s.price.toLocaleString()}</span></div>
                                        <div style={{display:"flex", gap:5}}>
                                            <button onClick={() => handleEditSessionClick(s)} style={{fontSize:"0.85em", cursor:"pointer", padding:"5px 10px", borderRadius:4, border:"1px solid #3182ce", background:"white", color:"#3182ce"}}>✏️ Edit</button>
                                            <button onClick={() => openModal('Sesi', s)} style={{fontSize:"0.85em", cursor:"pointer", padding:"5px 10px", borderRadius:4, border:"1px solid #ddd", background:"#f7fafc"}}>Status: <b>{s.publish_status || 'DRAFT'}</b> ⚙️</button>
                                        </div>
                                    </div>
                                    <p style={{color:"#666", fontSize:"0.9em", borderBottom:"1px solid #eee", paddingBottom:10}}>{s.description || "Tidak ada deskripsi"}</p>
                                    
                                    {/* --- LIST MATERI (YANG SEBELUMNYA HILANG) --- */}
                                    {((s.videos && s.videos.length > 0) || (s.files && s.files.length > 0)) && (
                                        <div style={{marginTop: 15, padding: "10px", background: "#f8f9fa", borderRadius: 6, border: "1px solid #e9ecef"}}>
                                            {s.videos?.length > 0 && (
                                                <div style={{marginBottom: 10}}>
                                                    <b style={{fontSize:"0.85em", color:"#2b6cb0", display:"block", marginBottom:5}}>🎥 Video Terupload:</b>
                                                    <ul style={{listStyle:"none", padding:0, margin:0}}>
                                                        {s.videos.map(v => (
                                                            <li key={v.id} style={{display:"flex", alignItems:"center", gap:10, marginBottom:5, fontSize:"0.9em", background:"white", padding:"5px 10px", borderRadius:4, border:"1px solid #eee"}}>
                                                                <span style={{flex:1}}>📺 {v.title}</span>
                                                                <a href={`http://localhost:8080/${v.video_url}`} target="_blank" rel="noopener noreferrer" style={{textDecoration:"none", color:"white", background:"#3182ce", padding:"2px 8px", borderRadius:4, fontSize:"0.8em"}}>▶ Putar</a>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {s.files?.length > 0 && (
                                                <div>
                                                    <b style={{fontSize:"0.85em", color:"#c05621", display:"block", marginBottom:5}}>📄 Modul Terupload:</b>
                                                    <ul style={{listStyle:"none", padding:0, margin:0}}>
                                                        {s.files.map(f => (
                                                            <li key={f.id} style={{display:"flex", alignItems:"center", gap:10, marginBottom:5, fontSize:"0.9em", background:"white", padding:"5px 10px", borderRadius:4, border:"1px solid #eee"}}>
                                                                <span style={{flex:1}}>📑 {f.title}</span>
                                                                <a href={`http://localhost:8080/${f.file_url}`} target="_blank" rel="noopener noreferrer" style={{textDecoration:"none", color:"white", background:"#dd6b20", padding:"2px 8px", borderRadius:4, fontSize:"0.8em"}}>⬇ Download</a>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div style={{display:"flex", gap:15, marginTop:15}}>
                                        <div style={{flex:1, background:"#ebf8ff", padding:15, borderRadius:6, border:"1px dashed #4299e1"}}>
                                            <h4 style={{marginTop:0, fontSize:"0.9em", color:"#2b6cb0"}}>📹 Upload Video</h4>
                                            <input type="file" id={`vid-${s.id}`} style={{fontSize:"0.8em", marginBottom:10, width:"100%"}} />
                                            <button onClick={() => handleUpload('video', s.id, document.getElementById(`vid-${s.id}`))} disabled={uploadingId===`video-${s.id}`} style={{background:"#3182ce", color:"white", border:"none", padding:"6px 12px", borderRadius:4, cursor:"pointer", fontSize:"0.9em"}}>{uploadingId===`video-${s.id}` ? "Uploading..." : "Upload Video"}</button>
                                        </div>
                                        <div style={{flex:1, background:"#fffaf0", padding:15, borderRadius:6, border:"1px dashed #dd6b20"}}>
                                            <h4 style={{marginTop:0, fontSize:"0.9em", color:"#c05621"}}>📄 Upload Modul</h4>
                                            <input type="file" id={`file-${s.id}`} style={{fontSize:"0.8em", marginBottom:10, width:"100%"}} />
                                            <button onClick={() => handleUpload('file', s.id, document.getElementById(`file-${s.id}`))} disabled={uploadingId===`file-${s.id}`} style={{background:"#dd6b20", color:"white", border:"none", padding:"6px 12px", borderRadius:4, cursor:"pointer", fontSize:"0.9em"}}>{uploadingId===`file-${s.id}` ? "Uploading..." : "Upload File"}</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}