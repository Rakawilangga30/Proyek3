import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api';

export default function AdminOfficialOrgEventDetail() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [editForm, setEditForm] = useState({ title: '', description: '', category: '' });
    const [editingSession, setEditingSession] = useState(null);
    const [editingVideo, setEditingVideo] = useState(null);
    const [editingFile, setEditingFile] = useState(null);
    const [expandedSession, setExpandedSession] = useState(null);
    const [sessionMedia, setSessionMedia] = useState({});
    const [playingVideo, setPlayingVideo] = useState(null);

    const categories = ['Teknologi', 'Bisnis', 'Pendidikan', 'Desain', 'Marketing', 'Musik', 'Gaming', 'Lifestyle', 'Lainnya'];

    useEffect(() => {
        fetchData();
    }, [eventId]);

    const fetchData = async () => {
        try {
            const response = await api.get(`/admin/official-org/events/${eventId}`);
            setEvent(response.data.event);
            setSessions(response.data.sessions || []);
            setEditForm({
                title: response.data.event.title,
                description: response.data.event.description || '',
                category: response.data.event.category || 'Teknologi'
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSessionMedia = async (sessionId) => {
        try {
            const response = await api.get(`/admin/organizations/0/sessions/${sessionId}/media`);
            setSessionMedia(prev => ({ ...prev, [sessionId]: response.data }));
        } catch (err) {
            console.error(err);
        }
    };

    const toggleSession = (sessionId) => {
        if (expandedSession === sessionId) {
            setExpandedSession(null);
        } else {
            setExpandedSession(sessionId);
            if (!sessionMedia[sessionId]) {
                fetchSessionMedia(sessionId);
            }
        }
    };

    const handleUpdateEvent = async () => {
        try {
            await api.put(`/admin/official-org/events/${eventId}`, editForm);
            setEditMode(false);
            fetchData();
            alert('✅ Event berhasil diupdate');
        } catch (err) {
            alert('❌ Gagal update event');
        }
    };

    const handleUploadThumbnail = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('thumbnail', file);
        try {
            await api.post(`/admin/official-org/events/${eventId}/thumbnail`, formData);
            fetchData();
            alert('✅ Thumbnail berhasil diupdate');
        } catch (err) {
            alert('❌ Gagal upload thumbnail');
        }
    };

    const handleUpdateSession = async (sessionId, data) => {
        try {
            await api.put(`/admin/official-org/sessions/${sessionId}`, data);
            setEditingSession(null);
            fetchData();
            alert('✅ Session berhasil diupdate');
        } catch (err) {
            alert('❌ Gagal update session');
        }
    };

    const handleUpdateVideo = async (videoId, data) => {
        try {
            await api.put(`/admin/official-org/videos/${videoId}`, data);
            setEditingVideo(null);
            fetchSessionMedia(expandedSession);
            alert('✅ Video berhasil diupdate');
        } catch (err) {
            alert('❌ Gagal update video');
        }
    };

    const handleDeleteVideo = async (videoId) => {
        if (!confirm('Hapus video ini?')) return;
        try {
            await api.delete(`/admin/official-org/videos/${videoId}`);
            fetchSessionMedia(expandedSession);
            fetchData();
            alert('✅ Video berhasil dihapus');
        } catch (err) {
            alert('❌ Gagal hapus video');
        }
    };

    const handleUpdateFile = async (fileId, data) => {
        try {
            await api.put(`/admin/official-org/files/${fileId}`, data);
            setEditingFile(null);
            fetchSessionMedia(expandedSession);
            alert('✅ File berhasil diupdate');
        } catch (err) {
            alert('❌ Gagal update file');
        }
    };

    const handleDeleteFile = async (fileId) => {
        if (!confirm('Hapus file ini?')) return;
        try {
            await api.delete(`/admin/official-org/files/${fileId}`);
            fetchSessionMedia(expandedSession);
            fetchData();
            alert('✅ File berhasil dihapus');
        } catch (err) {
            alert('❌ Gagal hapus file');
        }
    };

    const handleDeleteEvent = async () => {
        if (!confirm('Hapus event ini beserta semua sesi dan materinya?')) return;
        try {
            await api.delete(`/admin/official-org/events/${eventId}`);
            navigate('/dashboard/admin/official-org');
            alert('✅ Event berhasil dihapus');
        } catch (err) {
            alert('❌ Gagal hapus event');
        }
    };

    const formatPrice = (amount) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount || 0);
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    if (loading) {
        return <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Memuat data...</div>;
    }

    if (!event) {
        return (
            <div style={{ padding: "40px", textAlign: "center" }}>
                <h2>⚠️ Event tidak ditemukan</h2>
                <Link to="/dashboard/admin/official-org" style={{ color: "#3b82f6" }}>← Kembali</Link>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: "24px" }}>
                <Link to="/dashboard/admin/official-org" style={{ color: "#3b82f6", textDecoration: "none", fontSize: "0.9rem", display: "inline-block", marginBottom: "12px" }}>
                    ← Kembali ke Official Organization
                </Link>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
                    <div>
                        <h1 style={{ margin: "0 0 8px 0", color: "#1e40af", fontSize: "1.5rem" }}>📦 {event.title}</h1>
                        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                            <span style={{
                                padding: "4px 12px",
                                borderRadius: "20px",
                                background: event.publish_status === 'PUBLISHED' ? '#d1fae5' : '#fef3c7',
                                color: event.publish_status === 'PUBLISHED' ? '#047857' : '#b45309',
                                fontWeight: "500"
                            }}>
                                {event.publish_status}
                            </span>
                            <span style={{ color: "#64748b" }}>📅 {formatDate(event.created_at)}</span>
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={() => setEditMode(!editMode)} style={editMode ? btnDanger : btnPrimary}>
                            {editMode ? '✖ Batal' : '✏️ Edit'}
                        </button>
                        <button onClick={handleDeleteEvent} style={btnDanger}>🗑️ Hapus</button>
                    </div>
                </div>
            </div>

            {/* Thumbnail */}
            <div style={cardStyle}>
                <h3 style={{ margin: "0 0 16px 0", color: "#1e293b" }}>🖼️ Thumbnail</h3>
                <div style={{ display: "flex", gap: "24px", alignItems: "flex-start", flexWrap: "wrap" }}>
                    {event.thumbnail_url && (
                        <img src={`http://localhost:8080/${event.thumbnail_url}`} alt="Thumbnail"
                            style={{ width: "200px", borderRadius: "8px", objectFit: "cover" }} />
                    )}
                    <div>
                        <input type="file" accept="image/*" id="thumb-upload" style={{ display: "none" }} onChange={handleUploadThumbnail} />
                        <label htmlFor="thumb-upload" style={{ ...btnSecondary, cursor: "pointer", display: "inline-block" }}>
                            📤 Upload Thumbnail Baru
                        </label>
                    </div>
                </div>
            </div>

            {/* Event Info Edit */}
            <div style={{ ...cardStyle, marginTop: "16px" }}>
                <h3 style={{ margin: "0 0 16px 0", color: "#1e293b" }}>📋 Informasi Event</h3>
                {editMode ? (
                    <div style={{ display: "grid", gap: "16px" }}>
                        <div>
                            <label style={labelStyle}>Judul</label>
                            <input type="text" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Kategori</label>
                            <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} style={inputStyle}>
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Deskripsi</label>
                            <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} style={{ ...inputStyle, minHeight: "100px" }} />
                        </div>
                        <button onClick={handleUpdateEvent} style={btnPrimary}>💾 Simpan Perubahan</button>
                    </div>
                ) : (
                    <div style={{ display: "grid", gap: "12px" }}>
                        <div style={infoRow}><span style={{ color: "#64748b" }}>Judul:</span><span style={{ fontWeight: "600" }}>{event.title}</span></div>
                        <div style={infoRow}><span style={{ color: "#64748b" }}>Kategori:</span><span>{event.category || '-'}</span></div>
                        <div style={infoRow}><span style={{ color: "#64748b" }}>Deskripsi:</span><span>{event.description || '-'}</span></div>
                        {event.affiliate_submission_id && (
                            <div style={infoRow}>
                                <span style={{ color: "#64748b" }}>Affiliate:</span>
                                <Link to={`/dashboard/admin/affiliates/${event.affiliate_submission_id}`} style={{ color: "#3b82f6" }}>
                                    ID #{event.affiliate_submission_id}
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Sessions List */}
            <div style={{ marginTop: "24px" }}>
                <h3 style={{ margin: "0 0 16px 0", color: "#1e293b" }}>📚 Sesi & Materi ({sessions.length})</h3>

                {sessions.length === 0 ? (
                    <div style={{ ...cardStyle, textAlign: "center", padding: "40px" }}>
                        <div style={{ fontSize: "2rem", marginBottom: "8px" }}>📭</div>
                        <p style={{ color: "#64748b" }}>Belum ada sesi dalam event ini</p>
                    </div>
                ) : (
                    <div style={{ display: "grid", gap: "16px" }}>
                        {sessions.map(session => (
                            <div key={session.id} style={cardStyle}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", cursor: "pointer" }}
                                    onClick={() => toggleSession(session.id)}>
                                    <div>
                                        <h4 style={{ margin: "0 0 8px 0", color: "#1e293b" }}>
                                            {expandedSession === session.id ? '🔽' : '▶️'} {session.title}
                                        </h4>
                                        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", fontSize: "0.85rem", color: "#64748b" }}>
                                            <span style={{
                                                padding: "2px 8px", borderRadius: "12px",
                                                background: session.publish_status === 'PUBLISHED' ? '#d1fae5' : '#fef3c7',
                                                color: session.publish_status === 'PUBLISHED' ? '#047857' : '#b45309'
                                            }}>{session.publish_status}</span>
                                            <span>💰 {formatPrice(session.price)}</span>
                                            <span>🎬 {session.videos_count || 0} video</span>
                                            <span>📄 {session.files_count || 0} file</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Session - Show Media */}
                                {expandedSession === session.id && sessionMedia[session.id] && (
                                    <div style={{ marginTop: "20px", borderTop: "1px solid #e2e8f0", paddingTop: "20px" }}>
                                        {/* Videos */}
                                        <h5 style={{ margin: "0 0 12px 0" }}>🎬 Video ({sessionMedia[session.id].videos?.length || 0})</h5>
                                        {sessionMedia[session.id].videos?.map(video => (
                                            <div key={video.id} style={{ background: "#f8fafc", borderRadius: "8px", padding: "16px", marginBottom: "12px" }}>
                                                {editingVideo === video.id ? (
                                                    <div style={{ display: "grid", gap: "8px" }}>
                                                        <input type="text" defaultValue={video.title} id={`vid-title-${video.id}`} style={inputStyle} placeholder="Judul" />
                                                        <textarea defaultValue={video.description || ''} id={`vid-desc-${video.id}`} style={{ ...inputStyle, minHeight: "60px" }} placeholder="Deskripsi" />
                                                        <div style={{ display: "flex", gap: "8px" }}>
                                                            <button onClick={() => handleUpdateVideo(video.id, {
                                                                title: document.getElementById(`vid-title-${video.id}`).value,
                                                                description: document.getElementById(`vid-desc-${video.id}`).value
                                                            })} style={btnPrimary}>💾 Simpan</button>
                                                            <button onClick={() => setEditingVideo(null)} style={btnSecondary}>Batal</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                                                            <strong>{video.title}</strong>
                                                            <div style={{ display: "flex", gap: "8px" }}>
                                                                <button onClick={() => setPlayingVideo(playingVideo === video.id ? null : video.id)} style={btnSecondary}>
                                                                    {playingVideo === video.id ? '⏹️ Stop' : '▶️ Play'}
                                                                </button>
                                                                <button onClick={() => setEditingVideo(video.id)} style={btnSecondary}>✏️</button>
                                                                <button onClick={() => handleDeleteVideo(video.id)} style={btnDangerSmall}>🗑️</button>
                                                            </div>
                                                        </div>
                                                        {video.description && <p style={{ margin: "0 0 8px 0", fontSize: "0.85rem", color: "#64748b" }}>{video.description}</p>}
                                                        {playingVideo === video.id && (
                                                            <video controls autoPlay style={{ width: "100%", maxHeight: "400px", borderRadius: "8px", marginTop: "8px" }}>
                                                                <source src={`http://localhost:8080/${video.video_url}`} type="video/mp4" />
                                                            </video>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        ))}

                                        {/* Files */}
                                        <h5 style={{ margin: "16px 0 12px 0" }}>📄 File ({sessionMedia[session.id].files?.length || 0})</h5>
                                        {sessionMedia[session.id].files?.map(file => (
                                            <div key={file.id} style={{ background: "#f8fafc", borderRadius: "8px", padding: "16px", marginBottom: "12px" }}>
                                                {editingFile === file.id ? (
                                                    <div style={{ display: "grid", gap: "8px" }}>
                                                        <input type="text" defaultValue={file.title} id={`file-title-${file.id}`} style={inputStyle} placeholder="Judul" />
                                                        <textarea defaultValue={file.description || ''} id={`file-desc-${file.id}`} style={{ ...inputStyle, minHeight: "60px" }} placeholder="Deskripsi" />
                                                        <div style={{ display: "flex", gap: "8px" }}>
                                                            <button onClick={() => handleUpdateFile(file.id, {
                                                                title: document.getElementById(`file-title-${file.id}`).value,
                                                                description: document.getElementById(`file-desc-${file.id}`).value
                                                            })} style={btnPrimary}>💾 Simpan</button>
                                                            <button onClick={() => setEditingFile(null)} style={btnSecondary}>Batal</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                        <div>
                                                            <strong>{file.title}</strong>
                                                            {file.description && <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem", color: "#64748b" }}>{file.description}</p>}
                                                        </div>
                                                        <div style={{ display: "flex", gap: "8px" }}>
                                                            <a href={`http://localhost:8080/${file.file_url}`} target="_blank" style={btnSecondary}>📥 Download</a>
                                                            <button onClick={() => setEditingFile(file.id)} style={btnSecondary}>✏️</button>
                                                            <button onClick={() => handleDeleteFile(file.id)} style={btnDangerSmall}>🗑️</button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

const cardStyle = {
    background: "white",
    borderRadius: "12px",
    padding: "24px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
};

const infoRow = {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: "1px solid #f1f5f9"
};

const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "1rem",
    boxSizing: "border-box"
};

const labelStyle = {
    display: "block",
    marginBottom: "6px",
    fontWeight: "500",
    color: "#374151"
};

const btnPrimary = {
    padding: "10px 20px",
    background: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "500"
};

const btnSecondary = {
    padding: "8px 16px",
    background: "#f1f5f9",
    color: "#374151",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    cursor: "pointer",
    textDecoration: "none",
    fontSize: "0.9rem"
};

const btnDanger = {
    padding: "10px 20px",
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "500"
};

const btnDangerSmall = {
    padding: "6px 12px",
    background: "#fee2e2",
    color: "#dc2626",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.85rem"
};
