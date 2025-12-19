import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api";

// --- 1. KOMPONEN MODAL VISIBILITAS (DITARUH DILUAR AGAR TIDAK ERROR REACT) ---
const VisibilityModal = ({ config, onClose, onSave }) => {
    if (!config.isOpen) return null;

    // State lokal modal
    const [status, setStatus] = useState(config.currentStatus || 'DRAFT');
    const [scheduleDate, setScheduleDate] = useState('');
    const [loading, setLoading] = useState(false);

    // Reset state saat modal dibuka
    useEffect(() => {
        setStatus(config.currentStatus || 'DRAFT');
        // Format tanggal agar masuk ke input datetime-local (YYYY-MM-DDTHH:mm)
        if (config.currentDate) {
            const date = new Date(config.currentDate);
            // Trik timezone offset agar jam sesuai lokal
            const offset = date.getTimezoneOffset() * 60000;
            const localISOTime = (new Date(date - offset)).toISOString().slice(0, 16);
            setScheduleDate(localISOTime);
        } else {
            setScheduleDate('');
        }
    }, [config]);

    const handleSave = async () => {
        setLoading(true);
        // Validasi jika pilih Scheduled tapi tanggal kosong
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
                <p style={{fontSize:"0.9em", color:"#666"}}>Item: <b>{config.title}</b></p>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                    {/* Pilihan DRAFT */}
                    <label style={{ display: "flex", gap: "10px", padding: "10px", border: "1px solid #ddd", borderRadius: "5px", cursor:"pointer", background: status==='DRAFT'?'#f7fafc':'white' }}>
                        <input type="radio" name="vis" value="DRAFT" checked={status === 'DRAFT'} onChange={() => setStatus('DRAFT')} />
                        <div><b>🔒 Private (Draft)</b><br/><small style={{color:"#718096"}}>Hanya Anda yang bisa melihat.</small></div>
                    </label>
                    
                    {/* Pilihan PUBLISHED */}
                    <label style={{ display: "flex", gap: "10px", padding: "10px", border: "1px solid #ddd", borderRadius: "5px", cursor:"pointer", background: status==='PUBLISHED'?'#f0fff4':'white' }}>
                        <input type="radio" name="vis" value="PUBLISHED" checked={status === 'PUBLISHED'} onChange={() => setStatus('PUBLISHED')} />
                        <div><b>🌍 Public (Tayang)</b><br/><small style={{color:"#718096"}}>Dapat dilihat semua orang.</small></div>
                    </label>

                    {/* Pilihan SCHEDULED */}
                    <label style={{ display: "flex", gap: "10px", padding: "10px", border: "1px solid #ddd", borderRadius: "5px", cursor:"pointer", background: status==='SCHEDULED'?'#fffaf0':'white' }}>
                        <input type="radio" name="vis" value="SCHEDULED" checked={status === 'SCHEDULED'} onChange={() => setStatus('SCHEDULED')} />
                        <div><b>📅 Jadwalkan</b><br/><small style={{color:"#718096"}}>Tayang otomatis nanti.</small></div>
                    </label>
                    
                    {status === 'SCHEDULED' && (
                        <div style={{marginLeft:30}}>
                            <input 
                                type="datetime-local" 
                                value={scheduleDate} 
                                onChange={(e) => setScheduleDate(e.target.value)} 
                                style={{width: "100%", padding: "8px", border:"1px solid #ccc", borderRadius:4}} 
                            />
                        </div>
                    )}
                </div>

                <div style={{display:"flex", justifyContent:"flex-end", gap:10}}>
                    <button onClick={onClose} disabled={loading} style={{ padding: "8px 15px", border: "none", background: "#cbd5e0", borderRadius: "4px", cursor: "pointer" }}>Batal</button>
                    <button onClick={handleSave} disabled={loading} style={{ background: "#3182ce", color: "white", padding: "8px 15px", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight:"bold" }}>
                        {loading ? "Menyimpan..." : "Simpan Status"}
                    </button>
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

    // State Forms
    const [newSession, setNewSession] = useState({ title: "", description: "", price: 0 });
    const [uploadingId, setUploadingId] = useState(null); 

    useEffect(() => {
        loadData();
    }, [eventID]);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            // PENTING: Panggil endpoint organization agar draft tetap muncul
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

    // --- Create Session ---
    const handleCreateSession = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/organization/events/${eventID}/sessions`, newSession);
            alert("✅ Sesi berhasil ditambahkan!");
            setNewSession({ title: "", description: "", price: 0 });
            loadData(); // Reload data
        } catch (error) {
            alert("Gagal: " + (error.response?.data?.error || "Error"));
        }
    };

    // --- Handle Upload ---
    const handleUpload = async (type, sessionID, fileInput) => {
        const file = fileInput.files[0];
        if (!file) return alert(`Pilih file ${type} dulu!`);

        const formData = new FormData();
        formData.append(type === 'video' ? 'video' : 'file', file);
        // Kirim title default sesuai nama file
        formData.append("title", file.name);
        
        setUploadingId(`${type}-${sessionID}`);
        try {
            await api.post(`/organization/sessions/${sessionID}/${type}s`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            alert("✅ Upload Berhasil!");
            fileInput.value = "";
        } catch (error) {
            console.error(error);
            alert("❌ Gagal Upload: " + (error.response?.data?.error || "Error"));
        } finally {
            setUploadingId(null);
        }
    };

    // --- Logic Save dari Modal ---
    const handleSaveVisibility = async (status, date) => {
        const { type, id } = modalConfig;
        try {
            let endpoint = type === 'Event' ? `/organization/events/${id}` : `/organization/sessions/${id}`;
            
            // Tentukan suffix URL
            if (status === 'PUBLISHED') endpoint += `/publish`;
            else if (status === 'DRAFT') endpoint += `/unpublish`;
            else endpoint += `/schedule`;

            // Payload body (hanya kirim publish_at jika scheduled)
            const payload = status === 'SCHEDULED' ? { publish_at: date } : {}; 
            
            const res = await api.put(endpoint, payload);
            
            // Update State Lokal tanpa Refresh Halaman
            if (type === 'Event') {
                setEvent(prev => ({ ...prev, publish_status: res.data.status, publish_at: res.data.publish_at }));
            } else {
                setSessions(prev => prev.map(s => s.id === id ? { ...s, publish_status: res.data.status, publish_at: res.data.publish_at } : s));
            }
            alert(`Status berhasil diubah menjadi: ${res.data.status}`);
        } catch (error) {
            console.error(error);
            alert("Gagal update status: " + (error.response?.data?.error || error.message));
        }
    };

    // Helper buka modal
    const openModal = (type, item) => {
        setModalConfig({
            isOpen: true,
            type: type,
            id: item.id,
            title: item.title,
            currentStatus: item.publish_status,
            currentDate: item.publish_at
        });
    };

    // --- RENDER HALAMAN ---
    if (loading) return <div style={{padding:50, textAlign:"center"}}>⏳ Memuat Data...</div>;
    if (error) return <div style={{padding:50, textAlign:"center", color:"red"}}>⚠️ {error} <br/><br/> <Link to="/org">Kembali ke Dashboard</Link></div>;
    if (!event) return null;

    return (
        <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto", fontFamily: "sans-serif" }}>
            
            {/* Render Modal */}
            <VisibilityModal 
                config={modalConfig} 
                onClose={() => setModalConfig({...modalConfig, isOpen: false})} 
                onSave={handleSaveVisibility} 
            />

            {/* Header */}
            <div style={{ marginBottom: 30, paddingBottom: 20, borderBottom: "1px solid #eee" }}>
                <Link to="/org" style={{textDecoration:"none", color:"#555"}}>⬅️ Kembali</Link>
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:10}}>
                    <div>
                        <h1 style={{margin:0}}>⚙️ Kelola: {event.title}</h1>
                        <p style={{color:"#666", margin:"5px 0 0 0"}}>{event.description}</p>
                    </div>
                    <button 
                        onClick={() => openModal('Event', event)} 
                        style={{padding:"10px 20px", cursor:"pointer", borderRadius:5, border:"1px solid #ccc", background:"white", display:"flex", alignItems:"center", gap:5, boxShadow:"0 2px 5px rgba(0,0,0,0.05)"}}
                    >
                        Status: <b style={{color: event.publish_status === 'PUBLISHED' ? 'green' : (event.publish_status === 'SCHEDULED' ? 'orange' : 'gray')}}>
                            {event.publish_status || 'DRAFT'}
                        </b> ✏️
                    </button>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 30 }}>
                {/* KIRI: Form Tambah Sesi */}
                <div style={{ background: "#f8fff9", padding: 20, borderRadius: 8, border: "1px solid #c6f6d5", height: "fit-content" }}>
                    <h3 style={{marginTop:0, color:"#2f855a"}}>➕ Tambah Sesi</h3>
                    <form onSubmit={handleCreateSession} style={{display:"flex", flexDirection:"column", gap:10}}>
                        <input type="text" placeholder="Judul Sesi" required value={newSession.title} onChange={e=>setNewSession({...newSession, title:e.target.value})} style={{padding:10, border:"1px solid #ddd", borderRadius:4}}/>
                        <textarea placeholder="Deskripsi Singkat" value={newSession.description} onChange={e=>setNewSession({...newSession, description:e.target.value})} style={{padding:10, border:"1px solid #ddd", borderRadius:4}}/>
                        <input type="number" placeholder="Harga (Rp)" value={newSession.price} onChange={e=>setNewSession({...newSession, price:parseInt(e.target.value)})} style={{padding:10, border:"1px solid #ddd", borderRadius:4}}/>
                        <button type="submit" style={{padding:10, background:"#38a169", color:"white", border:"none", borderRadius:4, fontWeight:"bold", cursor:"pointer"}}>Simpan Sesi</button>
                    </form>
                </div>

                {/* KANAN: List Sesi */}
                <div>
                    <h2 style={{marginTop:0}}>Daftar Materi & Sesi</h2>
                    {sessions.length === 0 && <p style={{color:"#888"}}>Belum ada sesi. Tambahkan di sebelah kiri.</p>}
                    
                    {sessions.map(s => (
                        <div key={s.id} style={{ border: "1px solid #e2e8f0", padding: 20, marginBottom: 15, borderRadius: 8, background: "white", boxShadow:"0 2px 4px rgba(0,0,0,0.02)" }}>
                            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:15}}>
                                <h3 style={{margin:0}}>📂 {s.title}</h3>
                                <button 
                                    onClick={() => openModal('Sesi', s)} 
                                    style={{fontSize:"0.85em", cursor:"pointer", padding:"5px 10px", borderRadius:4, border:"1px solid #ddd", background:"#f7fafc"}}
                                >
                                    Status: <b>{s.publish_status || 'DRAFT'}</b> ✏️
                                </button>
                            </div>
                            <p style={{color:"#666", fontSize:"0.9em", borderBottom:"1px solid #eee", paddingBottom:10}}>{s.description || "Tidak ada deskripsi"}</p>
                            
                            {/* Area Upload */}
                            <div style={{display:"flex", gap:15, marginTop:15}}>
                                {/* Upload Video */}
                                <div style={{flex:1, background:"#ebf8ff", padding:15, borderRadius:6, border:"1px dashed #4299e1"}}>
                                    <h4 style={{marginTop:0, fontSize:"0.9em", color:"#2b6cb0"}}>📹 Upload Video</h4>
                                    <input type="file" id={`vid-${s.id}`} style={{fontSize:"0.8em", marginBottom:10, width:"100%"}} />
                                    <button 
                                        onClick={() => handleUpload('video', s.id, document.getElementById(`vid-${s.id}`))} 
                                        disabled={uploadingId===`video-${s.id}`}
                                        style={{background:"#3182ce", color:"white", border:"none", padding:"6px 12px", borderRadius:4, cursor:"pointer", fontSize:"0.9em"}}
                                    >
                                        {uploadingId===`video-${s.id}` ? "Uploading..." : "Upload Video"}
                                    </button>
                                </div>
                                
                                {/* Upload File */}
                                <div style={{flex:1, background:"#fffaf0", padding:15, borderRadius:6, border:"1px dashed #dd6b20"}}>
                                    <h4 style={{marginTop:0, fontSize:"0.9em", color:"#c05621"}}>📄 Upload Modul</h4>
                                    <input type="file" id={`file-${s.id}`} style={{fontSize:"0.8em", marginBottom:10, width:"100%"}} />
                                    <button 
                                        onClick={() => handleUpload('file', s.id, document.getElementById(`file-${s.id}`))} 
                                        disabled={uploadingId===`file-${s.id}`}
                                        style={{background:"#dd6b20", color:"white", border:"none", padding:"6px 12px", borderRadius:4, cursor:"pointer", fontSize:"0.9em"}}
                                    >
                                        {uploadingId===`file-${s.id}` ? "Uploading..." : "Upload File"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}