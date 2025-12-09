import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";

export default function EventDetail() {
    const { id } = useParams(); 
    const [event, setEvent] = useState(null);
    const [sessions, setSessions] = useState([]);
    
    // State untuk materi yang sedang aktif
    const [selectedSessionMedia, setSelectedSessionMedia] = useState(null); 
    const [activeVideoUrl, setActiveVideoUrl] = useState(null); 

    useEffect(() => {
        fetchEventDetail();
    }, [id]);

    const fetchEventDetail = async () => {
        try {
            const response = await api.get(`/events/${id}`);
            setEvent(response.data.event);
            
            const initialSessions = response.data.sessions.map(s => ({ ...s, isPurchased: false }));
            setSessions(initialSessions);

            const token = localStorage.getItem("token");
            if (token) {
                checkPurchaseStatus(initialSessions);
            }
        } catch (error) {
            console.error("Gagal ambil detail event", error);
        }
    };

    const checkPurchaseStatus = async (currentSessions) => {
        const updatedSessions = await Promise.all(currentSessions.map(async (s) => {
            try {
                const res = await api.get(`/user/sessions/${s.id}/check-purchase`);
                return { ...s, isPurchased: res.data.has_purchased };
            } catch (error) {
                return s;
            }
        }));
        setSessions(updatedSessions);
    };

    const handleBuy = async (sessionID) => {
        if (!confirm("Yakin mau beli sesi ini?")) return;
        try {
            await api.post(`/user/buy/${sessionID}`);
            alert("Pembelian Berhasil!");
            fetchEventDetail(); 
        } catch (error) {
            alert("Gagal membeli: " + (error.response?.data?.error || "Error"));
        }
    };

    const handleOpenMaterial = async (sessionID) => {
        try {
            const res = await api.get(`/user/sessions/${sessionID}/media`);
            setSelectedSessionMedia(res.data);
            setActiveVideoUrl(null); 
            // Scroll ke area belajar di kanan (opsional, bagus untuk UX di HP)
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            alert("Gagal membuka materi: " + (error.response?.data?.error || "Error"));
        }
    };

    // --- FUNGSI PLAY VIDEO (PERBAIKAN) ---
    const handlePlayVideo = async (videoUrl) => {
        if (!videoUrl) {
            alert("URL video tidak valid!");
            return;
        }

        try {
            // Ambil nama file dari path database (misal: "uploads/videos/abc.mp4" -> "abc.mp4")
            const filename = videoUrl.split("/").pop();
            console.log("Request Signed URL untuk:", filename);

            // Minta URL aman ke backend
            const res = await api.get(`/user/sessions/signed-video/${filename}`);
            
            // Gabungkan dengan base URL backend
            const fullUrl = `http://localhost:8080${res.data.url}`;
            console.log("Video Stream URL:", fullUrl);

            setActiveVideoUrl(fullUrl);
            
        } catch (error) {
            console.error("Gagal load video:", error);
            alert("Gagal memuat video! Cek Console.");
        }
    };

    // --- FUNGSI BUKA FILE (PDF/PPT) ---
    const handleOpenFile = async (fileUrl) => {
        if (!fileUrl) {
            alert("URL file tidak valid!");
            return;
        }

        try {
            const filename = fileUrl.split("/").pop();
            const res = await api.get(`/user/sessions/signed-file/${filename}`);
            const fullUrl = `http://localhost:8080${res.data.url}`;
            
            // Buka di tab baru
            window.open(fullUrl, '_blank');
        } catch (error) {
            console.error("Gagal load file", error);
            alert("Gagal memuat file!");
        }
    };

    if (!event) return <div style={{padding: "50px", textAlign: "center"}}>Loading Event...</div>;

    return (
        <div style={{ padding: "20px", fontFamily: "sans-serif", maxWidth: "1200px", margin: "0 auto" }}>
            
            {/* Header Event */}
            <div style={{ marginBottom: "30px", borderBottom: "2px solid #ddd", paddingBottom: "20px" }}>
                <h1 style={{ marginBottom: "10px" }}>{event.title}</h1>
                <p style={{ color: "#555", fontSize: "1.1em" }}>{event.description}</p>
                <span style={{ background: "#eee", padding: "5px 15px", borderRadius: "20px", fontSize: "0.9em", fontWeight: "bold" }}>
                    {event.category}
                </span>
            </div>

            <div style={{ display: "flex", gap: "30px", flexDirection: "row", flexWrap: "wrap" }}>
                
                {/* KIRI: Daftar Sesi */}
                <div style={{ flex: 1, minWidth: "300px" }}>
                    <h2 style={{ borderBottom: "1px solid #ccc", paddingBottom: "10px" }}>Daftar Sesi</h2>
                    {sessions.map((s) => (
                        <div key={s.id} style={{ 
                            border: "1px solid #ccc", padding: "20px", marginBottom: "15px", borderRadius: "8px",
                            background: s.isPurchased ? "#f0fff4" : "white",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                        }}>
                            <h3 style={{ marginTop: 0 }}>{s.title}</h3>
                            <p style={{ color: "#666" }}>Harga: <strong>Rp {s.price.toLocaleString()}</strong></p>
                            
                            {s.isPurchased ? (
                                <button 
                                    onClick={() => handleOpenMaterial(s.id)}
                                    style={{ width: "100%", background: "#38a169", color: "white", padding: "10px", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}
                                >
                                    📂 Buka Materi
                                </button>
                            ) : (
                                <button 
                                    onClick={() => handleBuy(s.id)}
                                    style={{ width: "100%", background: "#3182ce", color: "white", padding: "10px", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}
                                >
                                    🛒 Beli Sesi Ini
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* KANAN: Area Belajar (Video Player & File List) */}
                <div style={{ flex: 2, minWidth: "300px", border: "1px solid #ddd", padding: "25px", borderRadius: "8px", background: "#fafafa", minHeight: "500px" }}>
                    <h2 style={{ marginTop: 0, borderBottom: "1px solid #ccc", paddingBottom: "10px" }}>Area Belajar</h2>
                    
                    {!selectedSessionMedia ? (
                        <div style={{ textAlign: "center", padding: "50px", color: "#888" }}>
                            <p>👈 Silakan klik tombol <strong>"Buka Materi"</strong> pada sesi di sebelah kiri.</p>
                        </div>
                    ) : (
                        <div>
                            {/* --- Video Section --- */}
                            <h3 style={{ marginTop: 0 }}>📺 Video Pembelajaran</h3>
                            
                            {selectedSessionMedia.videos.length === 0 ? (
                                <p style={{ color: "#888", fontStyle: "italic", marginBottom: "20px" }}>Tidak ada video di sesi ini.</p>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "30px" }}>
                                    {selectedSessionMedia.videos.map((vid) => (
                                        <button 
                                            key={vid.id}
                                            onClick={() => handlePlayVideo(vid.video_url)}
                                            style={{ 
                                                display: "flex", alignItems: "center", gap: "15px",
                                                padding: "15px", background: "white", border: "1px solid #ccc", 
                                                borderRadius: "8px", cursor: "pointer", textAlign: "left",
                                                transition: "0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.background = "#eef"}
                                            onMouseOut={(e) => e.currentTarget.style.background = "white"}
                                        >
                                            <div style={{ fontSize: "1.5em" }}>▶️</div>
                                            <div>
                                                <div style={{ fontWeight: "bold", color: "#2c5282", fontSize: "1.1em" }}>{vid.title}</div>
                                                <div style={{ fontSize: "0.8em", color: "#777" }}>Klik untuk memutar</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Player Video */}
                            {activeVideoUrl && (
                                <div style={{ marginBottom: "40px", background: "black", borderRadius: "8px", overflow: "hidden", boxShadow: "0 4px 10px rgba(0,0,0,0.3)" }}>
                                    <video controls width="100%" height="400px" src={activeVideoUrl} autoPlay />
                                </div>
                            )}

                            <hr style={{ margin: "30px 0", border: "0", borderTop: "1px solid #ddd" }} />
                            
                            {/* --- File Section --- */}
                            <h3>📄 Dokumen Pendukung (PDF/PPT)</h3>
                            
                            {selectedSessionMedia.files.length === 0 ? (
                                <p style={{ color: "#888", fontStyle: "italic" }}>Tidak ada file materi.</p>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                    {selectedSessionMedia.files.map((f) => (
                                        <button 
                                            key={f.id}
                                            onClick={() => handleOpenFile(f.file_url)}
                                            style={{ 
                                                display: "flex", alignItems: "center", gap: "15px",
                                                padding: "15px", background: "white", border: "1px solid #ccc", 
                                                borderRadius: "8px", cursor: "pointer", textAlign: "left",
                                                boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.background = "#fffaf0"}
                                            onMouseOut={(e) => e.currentTarget.style.background = "white"}
                                        >
                                            <div style={{ fontSize: "1.5em" }}>📄</div>
                                            <div>
                                                <div style={{ fontWeight: "bold", color: "#2d3748", fontSize: "1.1em" }}>{f.title}</div>
                                                <div style={{ fontSize: "0.8em", color: "#777" }}>Klik untuk membuka di tab baru</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}