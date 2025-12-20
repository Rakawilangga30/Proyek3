import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api, { updateEvent, updateSession, uploadEventThumbnail } from "../../api"; 

// ==========================================
// 1. KOMPONEN HELPER: MATERIAL ITEM
// ==========================================
const MaterialItem = ({ item, type, onEdit, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);
    const isVideo = type === 'video';
    const icon = isVideo ? '📺' : '📑';
    const btnText = isVideo ? '▶ Putar' : '⬇ Download';
    const btnColor = isVideo ? '#3182ce' : '#dd6b20'; 
    const url = isVideo ? item.video_url : item.file_url;
    const descBg = isVideo ? "#f7fafc" : "#fffaf0";
    const descBorder = isVideo ? "#edf2f7" : "#feebc8";

    return (
        <div style={{background:"white", padding:"12px 15px", borderRadius:4, border:"1px solid #eee"}}>
            <div style={{display:"flex", alignItems:"center", gap:10, justifyContent:"space-between"}}>
                <div onClick={() => setIsOpen(!isOpen)} style={{display:"flex", alignItems:"center", gap:10, cursor:"pointer", flex:1, userSelect:"none"}}>
                    <span style={{fontSize:"0.7em", color:"#aaa", transform: isOpen ? "rotate(180deg)" : "rotate(90deg)", transition:"transform 0.2s"}}>▼</span>
                    <span style={{fontWeight:"bold", fontSize:"1em", color:"#333"}}>{icon} {item.title}</span>
                </div>
                <div style={{display:"flex", gap:8}}>
                    <button onClick={(e) => { e.stopPropagation(); onEdit(item, type); }} style={{border:"1px solid #cbd5e0", background:"white", color:"#4a5568", borderRadius:4, padding:"4px 8px", cursor:"pointer", fontSize:"0.8em"}} title="Edit Info">✏️</button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(item, type); }} style={{border:"1px solid #fc8181", background:"#fff5f5", color:"#c53030", borderRadius:4, padding:"4px 8px", cursor:"pointer", fontSize:"0.8em"}} title="Hapus Materi">🗑</button>
                    <a href={`http://localhost:8080/${url}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{textDecoration:"none", color:"white", background: btnColor, padding:"4px 12px", borderRadius:4, fontSize:"0.8em", fontWeight: "500"}}>{btnText}</a>
                </div>
            </div>
            {isOpen && item.description && (
                <div style={{marginTop: "12px", padding: "12px", backgroundColor: descBg, borderRadius: "6px", border: `1px solid ${descBorder}`, maxHeight: "150px", overflowY: "auto", whiteSpace: "pre-wrap", fontSize: "0.9em", color: "#4a5568", lineHeight: "1.6", textAlign: "justify", marginLeft: "20px"}}>
                    {item.description}
                </div>
            )}
        </div>
    );
};

// ==========================================
// 2. MODAL UPDATE MATERI
// ==========================================
const UpdateMaterialModal = ({ isOpen, config, onClose, onSave }) => {
    if (!isOpen) return null;
    const [title, setTitle] = useState(config.initialTitle || "");
    const [description, setDescription] = useState(config.initialDesc || "");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTitle(config.initialTitle || "");
            setDescription(config.initialDesc || "");
        }
    }, [isOpen, config]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await onSave(config.type, config.sessionId, config.mediaId, title, description);
        setLoading(false);
        onClose();
    };

    return (
        <div style={modalOverlayStyle}>
            <div style={{...modalContentStyle, width: "600px"}}>
                <h3 style={{marginTop:0, borderBottom:"1px solid #eee", paddingBottom:10}}>✏️ Edit Info {config.type === 'video' ? 'Video' : 'Modul'}</h3>
                <form onSubmit={handleSubmit} style={{display:"flex", flexDirection:"column", gap:15}}>
                    <div><label style={{display:"block", marginBottom:5, fontWeight:"bold"}}>Judul Materi</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required style={{width:"100%", padding:10, border:"1px solid #ccc", borderRadius:4}} /></div>
                    <div><label style={{display:"block", marginBottom:5, fontWeight:"bold"}}>Deskripsi / Penjelasan</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="8" style={{width:"100%", padding:10, border:"1px solid #ccc", borderRadius:4, fontFamily:"inherit", lineHeight: "1.5", resize: "vertical"}} /></div>
                    <div style={{display:"flex", justifyContent:"flex-end", gap:10, marginTop:10}}><button type="button" onClick={onClose} disabled={loading} style={btnSecondaryStyle}>Batal</button><button type="submit" disabled={loading} style={btnPrimaryStyle}>{loading ? "Menyimpan..." : "Simpan Perubahan"}</button></div>
                </form>
            </div>
        </div>
    );
};

// ==========================================
// 3. KOMPONEN HELPER LAIN
// ==========================================
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
        if (status === 'SCHEDULED' && !scheduleDate) { alert("Pilih tanggal!"); setLoading(false); return; }
        await onSave(status, scheduleDate);
        setLoading(false); onClose();
    };

    return (
        <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
                <h3 style={{marginTop:0, borderBottom:"1px solid #eee", paddingBottom:10}}>👁️ Atur Status</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                    <label style={{ ...radioLabelStyle, background: status==='DRAFT'?'#f7fafc':'white' }}><input type="radio" name="vis" value="DRAFT" checked={status === 'DRAFT'} onChange={() => setStatus('DRAFT')} /> Private (Draft)</label>
                    <label style={{ ...radioLabelStyle, background: status==='PUBLISHED'?'#f0fff4':'white' }}><input type="radio" name="vis" value="PUBLISHED" checked={status === 'PUBLISHED'} onChange={() => setStatus('PUBLISHED')} /> Public (Tayang)</label>
                    <label style={{ ...radioLabelStyle, background: status==='SCHEDULED'?'#fffaf0':'white' }}><input type="radio" name="vis" value="SCHEDULED" checked={status === 'SCHEDULED'} onChange={() => setStatus('SCHEDULED')} /> Jadwalkan</label>
                    {status === 'SCHEDULED' && <input type="datetime-local" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} style={{marginLeft:30, width:"90%", padding:8}} />}
                </div>
                <div style={{display:"flex", justifyContent:"flex-end", gap:10}}><button onClick={onClose} disabled={loading} style={btnSecondaryStyle}>Batal</button><button onClick={handleSave} disabled={loading} style={btnPrimaryStyle}>Simpan</button></div>
            </div>
        </div>
    );
};

const UploadModal = ({ isOpen, type, onClose, onUpload }) => {
    if (!isOpen) return null;
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return alert("Pilih file!");
        setLoading(true);
        await onUpload(file, title.trim() || file.name, description);
        setLoading(false); setFile(null); setTitle(""); setDescription(""); onClose();
    };

    return (
        <div style={modalOverlayStyle}>
            <div style={{...modalContentStyle, width: "600px"}}>
                <h3 style={{marginTop:0, borderBottom:"1px solid #eee", paddingBottom:10}}>Upload {type === 'video' ? 'Video' : 'Modul'}</h3>
                <form onSubmit={handleSubmit} style={{display:"flex", flexDirection:"column", gap:15}}>
                    <input type="file" onChange={(e) => setFile(e.target.files[0])} required style={{padding:5, border:"1px solid #ccc"}} />
                    <input type="text" placeholder="Judul (Opsional)" value={title} onChange={(e) => setTitle(e.target.value)} style={{padding:10, border:"1px solid #ccc"}} />
                    <textarea placeholder="Deskripsi..." value={description} onChange={(e) => setDescription(e.target.value)} rows="5" style={{padding:10, border:"1px solid #ccc"}} />
                    <div style={{display:"flex", justifyContent:"flex-end", gap:10}}><button type="button" onClick={onClose} style={btnSecondaryStyle}>Batal</button><button type="submit" disabled={loading} style={btnPrimaryStyle}>Upload</button></div>
                </form>
            </div>
        </div>
    );
};

// ==========================================
// 4. MAIN COMPONENT: MANAGE EVENT
// ==========================================
export default function ManageEvent() {
    const { eventID } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Config Modals
    const [visModal, setVisModal] = useState({ isOpen: false });
    const [uploadModal, setUploadModal] = useState({ isOpen: false });
    const [updateModal, setUpdateModal] = useState({ isOpen: false, type: '', sessionId: null, mediaId: null, initialTitle: '', initialDesc: '' });

    // States
    const [isEditingEvent, setIsEditingEvent] = useState(false);
    const [editEventForm, setEditEventForm] = useState({});
    const [editSessionId, setEditSessionId] = useState(null);
    const [editSessionForm, setEditSessionForm] = useState({});
    const [newSession, setNewSession] = useState({ title: "", description: "", price: 0 });

    useEffect(() => { loadData(); }, [eventID]);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/organization/events/${eventID}`);
            setEvent(res.data.event);
            setSessions(res.data.sessions || []);
        } catch (err) { setError("Gagal memuat data."); } 
        finally { setLoading(false); }
    };

    // --- FITUR GANTI THUMBNAIL (YANG KEMBALI) ---
    const handleThumbnailChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const res = await uploadEventThumbnail(event.id, file);
            setEvent(prev => ({ ...prev, thumbnail_url: res.thumbnail_url }));
            alert("✅ Thumbnail berhasil diubah!");
        } catch (error) {
            alert("❌ Gagal upload thumbnail");
        }
    };

    // --- HANDLER LAINNYA ---
    const handleDeleteEvent = async () => {
        const confirmMsg = "⚠️ PERINGATAN KERAS!\n\nApakah Anda yakin ingin menghapus Event ini?\n\nTindakan ini akan MENGHAPUS SEMUA SESI dan MATERI (Video/File) yang ada di dalamnya secara permanen.\n\nData tidak dapat dikembalikan.";
        if (window.confirm(confirmMsg)) {
            try {
                await api.delete(`/organization/events/${event.id}`);
                alert("Event berhasil dihapus.");
                navigate("/org"); 
            } catch (error) {
                alert("Gagal menghapus event: " + (error.response?.data?.error || "Error"));
            }
        }
    };

    const handleDeleteSession = async (sessionId) => {
        const confirmMsg = "Apakah Anda yakin ingin menghapus Sesi ini?\n\nSemua materi (Video/File) dalam sesi ini akan ikut terhapus.";
        if (window.confirm(confirmMsg)) {
            try {
                await api.delete(`/organization/sessions/${sessionId}`);
                alert("Sesi berhasil dihapus.");
                loadData(); 
                setEditSessionId(null);
            } catch (error) {
                alert("Gagal menghapus sesi: " + (error.response?.data?.error || "Error"));
            }
        }
    };

    const handleDeleteMaterial = async (item, type, sessionId) => {
        const label = type === 'video' ? 'Video' : 'File';
        if (window.confirm(`Yakin ingin menghapus ${label}: "${item.title}"?`)) {
            try {
                await api.delete(`/organization/sessions/${sessionId}/${type}s/${item.id}`);
                alert(`${label} berhasil dihapus!`);
                loadData(); 
            } catch (error) {
                alert(`Gagal menghapus ${label}: ` + (error.response?.data?.error || "Error"));
            }
        }
    };

    const handleEditSessionClick = (session) => {
        setEditSessionId(session.id);
        setEditSessionForm({ title: session.title, description: session.description, price: session.price });
    };

    const handleUpdateSession = async (e) => {
        e.preventDefault();
        try { 
            await updateSession(editSessionId, editSessionForm); 
            setSessions(prev => prev.map(s => s.id === editSessionId ? {...s, ...editSessionForm} : s));
            setEditSessionId(null); 
            alert("✅ Sesi berhasil diupdate!"); 
        } catch(e){ alert("Gagal update sesi"); }
    };

    const openUpdateModal = (item, type, sessionId) => {
        setUpdateModal({ isOpen: true, type, sessionId, mediaId: item.id, initialTitle: item.title, initialDesc: item.description });
    };

    const handleUpdateMaterialSubmit = async (type, sessionId, mediaId, title, description) => {
        try {
            await api.put(`/organization/sessions/${sessionId}/${type}s/${mediaId}`, { title, description });
            alert("✅ Berhasil diperbarui!"); loadData(); 
        } catch (error) { alert("❌ Gagal update"); }
    };

    const handleUpdateEvent = async (e) => {
        e.preventDefault();
        try { await updateEvent(event.id, editEventForm); setEvent({...event, ...editEventForm}); setIsEditingEvent(false); alert("Updated!"); } catch(e){ alert("Error updating event"); }
    };

    const handleCreateSession = async (e) => {
        e.preventDefault();
        try { await api.post(`/organization/events/${eventID}/sessions`, newSession); setNewSession({title:"", description:"", price:0}); loadData(); alert("Created!"); } catch(e){ alert("Error"); }
    };

    const handleUploadSubmit = async (file, title, desc) => {
        const formData = new FormData();
        formData.append(uploadModal.type==='video'?'video':'file', file);
        formData.append("title", title); formData.append("description", desc);
        try { await api.post(`/organization/sessions/${uploadModal.sessionId}/${uploadModal.type}s`, formData); loadData(); alert("Uploaded!"); } catch(e){ alert("Error"); }
    };

    const handleSaveVisibility = async (status, date) => {
        try {
            let ep = visModal.type === 'Event' ? `/organization/events/${visModal.id}` : `/organization/sessions/${visModal.id}`;
            ep += status === 'PUBLISHED' ? '/publish' : (status === 'DRAFT' ? '/unpublish' : '/schedule');
            await api.put(ep, status==='SCHEDULED'?{publish_at:date}:{}); loadData(); alert("Status Updated!");
        } catch(e) { alert("Error"); }
    };

    if (loading) return <div style={{padding:50, textAlign:"center"}}>⏳ Memuat...</div>;
    if (error) return <div style={{padding:50, textAlign:"center", color:"red"}}>{error}</div>;

    return (
        <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto", fontFamily: "sans-serif" }}>
            <VisibilityModal config={visModal} onClose={()=>setVisModal({...visModal, isOpen:false})} onSave={handleSaveVisibility} />
            <UploadModal isOpen={uploadModal.isOpen} type={uploadModal.type} onClose={()=>setUploadModal({...uploadModal, isOpen:false})} onUpload={handleUploadSubmit} />
            <UpdateMaterialModal isOpen={updateModal.isOpen} config={updateModal} onClose={() => setUpdateModal({...updateModal, isOpen: false})} onSave={handleUpdateMaterialSubmit} />

            <div style={{marginBottom:30, paddingBottom:20, borderBottom:"1px solid #eee"}}>
                <Link to="/org" style={{textDecoration:"none", color:"#555"}}>⬅️ Kembali</Link>
                
                {/* --- BAGIAN THUMBNAIL (SUDAH DIKEMBALIKAN) --- */}
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

                <div style={{marginTop:20}}>
                    {!isEditingEvent ? (
                        <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start"}}>
                            <div><h1>{event.title}</h1><p style={{color:"#666"}}>{event.description}</p></div>
                            <div style={{display:"flex", gap:10}}>
                                <button onClick={()=>{setEditEventForm(event); setIsEditingEvent(true)}} style={btnSecondaryStyle}>✏️ Edit Event</button>
                                <button onClick={handleDeleteEvent} style={{...btnSecondaryStyle, background:"#fee2e2", color:"#c53030", border:"1px solid #fc8181"}}>🗑 Hapus Event</button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleUpdateEvent} style={{display:"flex", flexDirection:"column", gap:10}}>
                            <input value={editEventForm.title} onChange={e=>setEditEventForm({...editEventForm, title:e.target.value})} style={{padding:8, width:"100%"}} />
                            <textarea value={editEventForm.description} onChange={e=>setEditEventForm({...editEventForm, description:e.target.value})} rows="4" style={{padding:8, width:"100%"}} />
                            <div style={{display:"flex", gap:10}}>
                                <button type="button" onClick={()=>setIsEditingEvent(false)} style={btnSecondaryStyle}>Batal</button>
                                <button type="submit" style={btnPrimaryStyle}>Simpan</button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 30 }}>
                {/* CREATE SESSION */}
                <div style={{ background: "#f8fff9", padding: 20, borderRadius: 8, border: "1px solid #c6f6d5", height: "fit-content" }}>
                    <h3>➕ Tambah Sesi</h3>
                    <form onSubmit={handleCreateSession} style={{display:"flex", flexDirection:"column", gap:10}}>
                        <input placeholder="Judul Sesi" value={newSession.title} onChange={e=>setNewSession({...newSession, title:e.target.value})} style={{padding:8}} required />
                        <textarea placeholder="Deskripsi Sesi" value={newSession.description} onChange={e=>setNewSession({...newSession, description:e.target.value})} style={{padding:8}} />
                        <input type="number" placeholder="Harga (0 = Gratis)" value={newSession.price} onChange={e=>setNewSession({...newSession, price:parseInt(e.target.value)})} style={{padding:8}} />
                        <button type="submit" style={btnPrimaryStyle}>Simpan Sesi</button>
                    </form>
                </div>

                {/* LIST SESSIONS */}
                <div>
                    {sessions.map(s => (
                        <div key={s.id} style={{ border: "1px solid #e2e8f0", padding: 20, marginBottom: 15, borderRadius: 8 }}>
                            {editSessionId === s.id ? (
                                <div style={{background:"#fffaf0", padding:15, borderRadius:6, border:"1px dashed #ed8936"}}>
                                    <h4 style={{marginTop:0, color:"#c05621"}}>📝 Edit Sesi</h4>
                                    <form onSubmit={handleUpdateSession} style={{display:"flex", flexDirection:"column", gap:10}}>
                                        <div><label style={{fontWeight:"bold", fontSize:"0.9em"}}>Judul</label><input type="text" value={editSessionForm.title} onChange={e => setEditSessionForm({...editSessionForm, title: e.target.value})} style={{width:"100%", padding:8, borderRadius:4, border:"1px solid #ccc"}} /></div>
                                        <div><label style={{fontWeight:"bold", fontSize:"0.9em"}}>Deskripsi</label><textarea value={editSessionForm.description} onChange={e => setEditSessionForm({...editSessionForm, description: e.target.value})} rows="3" style={{width:"100%", padding:8, borderRadius:4, border:"1px solid #ccc"}} /></div>
                                        <div><label style={{fontWeight:"bold", fontSize:"0.9em"}}>Harga</label><input type="number" value={editSessionForm.price} onChange={e => setEditSessionForm({...editSessionForm, price: parseInt(e.target.value)})} style={{width:"100%", padding:8, borderRadius:4, border:"1px solid #ccc"}} /></div>
                                        <div style={{display:"flex", gap:10, marginTop:10}}>
                                            <button type="button" onClick={() => setEditSessionId(null)} style={{flex:1, padding:8, background:"#cbd5e0", border:"none", borderRadius:4}}>Batal</button>
                                            <button type="submit" style={{flex:1, padding:8, background:"#ed8936", color:"white", border:"none", borderRadius:4}}>Simpan</button>
                                            <button type="button" onClick={() => handleDeleteSession(s.id)} style={{flex:1, padding:8, background:"#fee2e2", color:"#c53030", border:"1px solid #fc8181", borderRadius:4}}>🗑 Hapus Sesi</button>
                                        </div>
                                    </form>
                                </div>
                            ) : (
                                <div style={{display:"flex", justifyContent:"space-between", marginBottom:15, alignItems:"flex-start"}}>
                                    <div><h3 style={{margin:0}}>📂 {s.title}</h3><p style={{margin:"5px 0", color:"#666", fontSize:"0.9em"}}>{s.description || "Tidak ada deskripsi"}</p><span style={{fontSize:"0.8em", background:"#eee", padding:"2px 6px", borderRadius:4}}>Rp {s.price.toLocaleString()}</span></div>
                                    <div style={{display:"flex", gap:5, flexDirection:"column", alignItems:"flex-end"}}>
                                        <button onClick={() => handleEditSessionClick(s)} style={{fontSize:"0.8em", cursor:"pointer", border:"1px solid #ccc", background:"white", padding:"4px 8px", borderRadius:4}}>⚙️ Edit Sesi</button>
                                        <div style={{display:"flex", gap:5, marginTop:5}}>
                                            <button onClick={()=>{setUploadModal({isOpen:true, type:'video', sessionId:s.id})}} style={{cursor:"pointer", background:"#ebf8ff", border:"1px solid #bee3f8", padding:"5px 10px", borderRadius:4, fontSize:"0.85em"}}>➕ Video</button>
                                            <button onClick={()=>{setUploadModal({isOpen:true, type:'file', sessionId:s.id})}} style={{cursor:"pointer", background:"#fffaf0", border:"1px solid #feebc8", padding:"5px 10px", borderRadius:4, fontSize:"0.85em"}}>➕ File</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div style={{background:"#f9fafb", padding:10, borderRadius:6, marginTop:10}}>
                                {s.videos?.map(v => (
                                    <div key={v.id} style={{marginBottom:10}}>
                                        <MaterialItem 
                                            item={v} type="video" 
                                            onEdit={(item, type) => openUpdateModal(item, type, s.id)} 
                                            onDelete={(item, type) => handleDeleteMaterial(item, type, s.id)}
                                        />
                                    </div>
                                ))}
                                {s.files?.map(f => (
                                    <div key={f.id} style={{marginBottom:10}}>
                                        <MaterialItem 
                                            item={f} type="file" 
                                            onEdit={(item, type) => openUpdateModal(item, type, s.id)} 
                                            onDelete={(item, type) => handleDeleteMaterial(item, type, s.id)}
                                        />
                                    </div>
                                ))}
                                {(!s.videos?.length && !s.files?.length) && <p style={{color:"#aaa", fontSize:"0.9em", textAlign:"center"}}>Belum ada materi.</p>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// STYLES
const modalOverlayStyle = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 };
const modalContentStyle = { background: "white", padding: "25px", borderRadius: "8px", width: "450px", maxWidth: "90%", boxShadow: "0 4px 15px rgba(0,0,0,0.3)" };
const radioLabelStyle = { display: "flex", gap: "10px", padding: "10px", border: "1px solid #ddd", borderRadius: "5px", cursor:"pointer" };
const btnPrimaryStyle = { background: "#3182ce", color: "white", padding: "8px 15px", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight:"bold" };
const btnSecondaryStyle = { padding: "8px 15px", border: "none", background: "#cbd5e0", borderRadius: "4px", cursor: "pointer" };