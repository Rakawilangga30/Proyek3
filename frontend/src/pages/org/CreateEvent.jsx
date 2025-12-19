import { useState } from "react";
import api, { uploadEventThumbnail } from "../../api";
import { useNavigate } from "react-router-dom";

export default function CreateEvent() {
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("Programming");
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // 1. Buat Event (Backend akan mengembalikan event_id)
            // Pastikan URL di backend route.go sudah sesuai: org.POST("/events", controllers.CreateEvent)
            const res = await api.post("/organization/events", {
                title,
                description,
                category
            });
            
            console.log("Event Created Response:", res.data);

            const newEventId = res.data.event_id;

            // 2. Jika ada file thumbnail, upload ke endpoint terpisah menggunakan ID event yang baru dibuat
            if (thumbnailFile && newEventId) {
                try {
                    await uploadEventThumbnail(newEventId, thumbnailFile);
                } catch (err) {
                    console.error("Gagal upload thumbnail:", err);
                    alert("Event berhasil dibuat, tetapi gagal upload thumbnail. Anda bisa menguploadnya nanti di menu Manage.");
                }
            } else if (thumbnailFile && !newEventId) {
                 alert("Warning: Backend tidak mengembalikan event_id, thumbnail tidak bisa diupload.");
            }

            alert("✅ Event Berhasil Dibuat!");
            // Arahkan ke halaman Manage Event yang baru dibuat
            navigate(`/org/event/${newEventId}/manage`);
        } catch (error) {
            console.error(error);
            alert("Gagal: " + (error.response?.data?.error || "Terjadi kesalahan sistem"));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
            <div style={{ width: "600px", maxWidth: "95%", background: "white", borderRadius: 8, padding: 20, boxShadow: "0 8px 40px rgba(0,0,0,0.4)", position: "relative" }}>
                <button onClick={() => navigate(-1)} style={{ position: "absolute", right: 12, top: 12, border: "none", background: "transparent", cursor: "pointer", fontSize: 18 }}>✖</button>
                <h2 style={{ marginTop: 0 }}>Buat Event Baru</h2>
                
                <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {/* Input Judul */}
                    <div>
                        <label style={{fontWeight: "bold", display: "block", marginBottom: "5px"}}>Judul Event</label>
                        <input 
                            type="text" required 
                            value={title} onChange={e => setTitle(e.target.value)}
                            style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: 4, boxSizing: "border-box" }}
                            placeholder="Contoh: Webinar Belajar Golang Dasar"
                        />
                    </div>

                    {/* Input Kategori */}
                    <div>
                        <label style={{fontWeight: "bold", display: "block", marginBottom: "5px"}}>Kategori</label>
                        <select 
                            value={category} onChange={e => setCategory(e.target.value)}
                            style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: 4, boxSizing: "border-box" }}
                        >
                            <option value="Programming">Programming</option>
                            <option value="Desain">Desain</option>
                            <option value="Bisnis">Bisnis</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Lifestyle">Lifestyle</option>
                        </select>
                    </div>

                    {/* Input Deskripsi */}
                    <div>
                        <label style={{fontWeight: "bold", display: "block", marginBottom: "5px"}}>Deskripsi</label>
                        <textarea 
                            rows="4" required
                            value={description} onChange={e => setDescription(e.target.value)}
                            style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: 4, boxSizing: "border-box", fontFamily: "inherit" }}
                            placeholder="Jelaskan detail event Anda..."
                        />
                    </div>

                    {/* Input Thumbnail (DIPERBAIKI) */}
                    <div>
                        <label style={{fontWeight:"bold", display:"block", marginBottom: 6}}>Thumbnail (opsional)</label>
                        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                            {/* Input Asli sekarang terlihat */}
                            <input
                                id="create-thumb-input"
                                type="file"
                                accept="image/*"
                                style={{ display: "block", padding: 6 }}
                                onChange={e => setThumbnailFile(e.target.files?.[0] || null)}
                            />
                            
                            {/* Tombol Custom untuk memicu input asli */}
                            <button 
                                type="button" 
                                onClick={() => document.getElementById('create-thumb-input').click()} 
                                style={{ padding: "8px 15px", borderRadius: 6, border: "1px solid #ccc", background: "#f0f0f0", cursor: "pointer", display:"flex", alignItems:"center", gap: 5 }}
                            >
                                📁 Pilih Gambar
                            </button>
                            
                            <span style={{ color: "#666", fontSize: "0.9em", fontStyle: "italic" }}>
                                {thumbnailFile ? thumbnailFile.name : "Belum memilih file"}
                            </span>
                        </div>
                        
                        {/* Preview Gambar */}
                        {thumbnailFile && (
                            <div style={{ marginTop: 10, border: "1px solid #eee", padding: 5, borderRadius: 6, display: "inline-block" }}>
                                <img 
                                    src={URL.createObjectURL(thumbnailFile)} 
                                    alt="preview" 
                                    style={{ maxWidth: "100%", maxHeight: 150, borderRadius: 4, display: 'block' }} 
                                />
                            </div>
                        )}
                    </div>

                    {/* Tombol Aksi */}
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20, borderTop: "1px solid #eee", paddingTop: 15 }}>
                        <button type="button" onClick={() => navigate(-1)} style={{ padding: "10px 20px", borderRadius: 6, border: "1px solid #ccc", background: "white", cursor: "pointer" }}>Batal</button>
                        <button type="submit" disabled={submitting} style={{ padding: "10px 20px", borderRadius: 6, border: "none", background: "#3182ce", color: "white", cursor: "pointer", fontWeight: "bold" }}>
                            {submitting ? 'Menyimpan...' : 'Simpan & Lanjut'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}