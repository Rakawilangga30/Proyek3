import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { uploadEventThumbnail } from "../../api";

export default function MyOrganization() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showCreate, setShowCreate] = useState(false);
    const [newEvent, setNewEvent] = useState({ title: "", description: "", category: "Teknologi" });
    const [thumbnailFile, setThumbnailFile] = useState(null);

    useEffect(() => {
        fetchMyEvents();
    }, []);

    const fetchMyEvents = async () => {
        try {
            const res = await api.get("/organization/events");
            setEvents(res.data.events || []);
        } catch (error) {
            console.error("Gagal load event:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post("/organization/events", newEvent);
            const createdId = res.data?.event_id || res.data?.id || res.data?.ID || null;

            if (thumbnailFile && createdId) {
                try {
                    await uploadEventThumbnail(createdId, thumbnailFile);
                } catch (err) {
                    console.error("Gagal upload thumbnail:", err);
                    alert("Event berhasil dibuat, tetapi gagal upload thumbnail. Anda bisa menguploadnya nanti di Manage.");
                }
            }

            alert("Event berhasil dibuat!");
            setShowCreate(false);
            setNewEvent({ title: "", description: "", category: "Teknologi" });
            setThumbnailFile(null);
            fetchMyEvents();
        } catch (error) {
            console.error(error);
            alert("Gagal buat event: " + (error.response?.data?.error || "Error"));
        }
    };

    return (
        <div>
            {/* Header */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
                flexWrap: "wrap",
                gap: "16px"
            }}>
                <div>
                    <h2 style={{ margin: "0 0 4px 0", color: "#1e293b", fontSize: "1.5rem" }}>
                        🏢 Dashboard Organisasi
                    </h2>
                    <p style={{ margin: 0, color: "#64748b", fontSize: "0.9rem" }}>
                        Kelola semua event organisasi Anda
                    </p>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <Link
                        to="/"
                        style={{
                            padding: "10px 16px",
                            background: "white",
                            color: "#374151",
                            textDecoration: "none",
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                            fontWeight: "500",
                            fontSize: "0.9rem"
                        }}
                    >
                        🏠 Home
                    </Link>
                    <button
                        onClick={() => setShowCreate(!showCreate)}
                        style={{
                            background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                            color: "white",
                            padding: "10px 20px",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontWeight: "600",
                            fontSize: "0.9rem"
                        }}
                    >
                        ➕ Buat Event Baru
                    </button>
                </div>
            </div>

            {/* Create Event Form */}
            {showCreate && (
                <div style={{
                    background: "white",
                    padding: "24px",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    marginBottom: "24px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                }}>
                    <h3 style={{ margin: "0 0 20px 0", color: "#1e293b" }}>✨ Buat Event Baru</h3>
                    <form onSubmit={handleCreateEvent} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div>
                            <label style={labelStyle}>Judul Event</label>
                            <input
                                type="text"
                                placeholder="Contoh: Webinar Belajar Coding"
                                required
                                value={newEvent.title}
                                onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                                style={inputStyle}
                            />
                        </div>

                        <div>
                            <label style={labelStyle}>Deskripsi</label>
                            <textarea
                                placeholder="Jelaskan detail event Anda..."
                                required
                                rows="3"
                                value={newEvent.description}
                                onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                                style={{ ...inputStyle, resize: "vertical" }}
                            />
                        </div>

                        <div>
                            <label style={labelStyle}>Kategori</label>
                            <select
                                value={newEvent.category}
                                onChange={e => setNewEvent({ ...newEvent, category: e.target.value })}
                                style={inputStyle}
                            >
                                <option value="Teknologi">Teknologi</option>
                                <option value="Bisnis">Bisnis</option>
                                <option value="Desain">Desain</option>
                                <option value="Lainnya">Lainnya</option>
                            </select>
                        </div>

                        <div>
                            <label style={labelStyle}>Thumbnail (Opsional)</label>
                            <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                                <label style={{
                                    padding: "10px 16px",
                                    background: "#f1f5f9",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontWeight: "500",
                                    fontSize: "0.9rem",
                                    border: "1px solid #e2e8f0"
                                }}>
                                    📁 Pilih Gambar
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={e => setThumbnailFile(e.target.files?.[0] || null)}
                                        style={{ display: "none" }}
                                    />
                                </label>
                                <span style={{ color: "#64748b", fontSize: "0.9rem" }}>
                                    {thumbnailFile ? thumbnailFile.name : "Belum memilih file"}
                                </span>
                            </div>
                            {thumbnailFile && (
                                <div style={{ marginTop: "12px" }}>
                                    <img
                                        src={URL.createObjectURL(thumbnailFile)}
                                        alt="preview"
                                        style={{ maxWidth: "200px", maxHeight: "120px", borderRadius: "8px", border: "1px solid #e2e8f0" }}
                                    />
                                </div>
                            )}
                        </div>

                        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", paddingTop: "8px" }}>
                            <button
                                type="button"
                                onClick={() => setShowCreate(false)}
                                style={{
                                    padding: "10px 20px",
                                    background: "white",
                                    color: "#374151",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontWeight: "500"
                                }}
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                style={{
                                    padding: "10px 20px",
                                    background: "linear-gradient(135deg, #22c55e, #16a34a)",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontWeight: "600"
                                }}
                            >
                                💾 Simpan Event
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Event List */}
            <div style={{
                background: "white",
                borderRadius: "12px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                overflow: "hidden"
            }}>
                {loading ? (
                    <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                        <div style={{
                            width: "32px",
                            height: "32px",
                            border: "3px solid #e2e8f0",
                            borderTopColor: "#3b82f6",
                            borderRadius: "50%",
                            animation: "spin 1s linear infinite",
                            margin: "0 auto 12px"
                        }}></div>
                        Memuat event...
                    </div>
                ) : events.length === 0 ? (
                    <div style={{
                        textAlign: "center",
                        padding: "48px 20px",
                        color: "#64748b"
                    }}>
                        <div style={{ fontSize: "3rem", marginBottom: "16px" }}>📭</div>
                        <p style={{ margin: "0 0 8px 0", fontWeight: "500", color: "#1e293b" }}>
                            Belum ada event
                        </p>
                        <p style={{ margin: 0, fontSize: "0.9rem" }}>
                            Klik tombol "Buat Event Baru" untuk memulai
                        </p>
                    </div>
                ) : (
                    <div style={{ padding: "16px", display: "grid", gap: "12px" }}>
                        {events.map(evt => (
                            <div key={evt.id} style={{
                                border: "1px solid #e2e8f0",
                                padding: "20px",
                                borderRadius: "10px",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                background: "#fafafa"
                            }}>
                                <div>
                                    <h4 style={{ margin: "0 0 8px 0", color: "#1e293b" }}>{evt.title}</h4>
                                    <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                                        <span style={{
                                            background: "#eff6ff",
                                            color: "#3b82f6",
                                            fontSize: "0.75rem",
                                            padding: "4px 10px",
                                            borderRadius: "6px",
                                            fontWeight: "600"
                                        }}>
                                            {evt.category}
                                        </span>
                                        <span style={{
                                            fontSize: "0.8rem",
                                            fontWeight: "600",
                                            color: evt.publish_status === 'PUBLISHED'
                                                ? "#16a34a"
                                                : evt.publish_status === 'SCHEDULED'
                                                    ? "#f59e0b"
                                                    : "#64748b"
                                        }}>
                                            ● {evt.publish_status || "DRAFT"}
                                        </span>
                                    </div>
                                </div>
                                <Link
                                    to={`/dashboard/org/event/${evt.id}/manage`}
                                    style={{
                                        background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                                        color: "white",
                                        textDecoration: "none",
                                        padding: "10px 18px",
                                        borderRadius: "8px",
                                        fontWeight: "600",
                                        fontSize: "0.85rem"
                                    }}
                                >
                                    ⚙️ Kelola
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

const labelStyle = {
    display: "block",
    marginBottom: "6px",
    fontWeight: "500",
    color: "#374151",
    fontSize: "0.875rem"
};

const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "0.95rem",
    boxSizing: "border-box"
};