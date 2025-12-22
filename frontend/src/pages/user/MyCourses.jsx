import { useEffect, useState } from "react";
import api from "../../api"; // Pastikan path ke api.js benar

export default function MyCourses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyCourses();
    }, []);

    const fetchMyCourses = async () => {
        try {
            // Ambil semua pembelian sesi milik user
            const res = await api.get("/user/purchases");
            // Backend sekarang mengembalikan { purchases: [...] }
            const purchases = res.data.purchases || [];

            // Group purchases by event
            const byEvent = {};
            purchases.forEach(p => {
                const eid = p.event_id || p.EventID || 0;
                if (!byEvent[eid]) {
                    byEvent[eid] = { event_id: eid, event_title: p.event_title || p.EventTitle || "Untitled Event", thumbnail: p.thumbnail_url || p.EventThumb || null, sessions: [] };
                }
                byEvent[eid].sessions.push({ id: p.session_id || p.SessionID, title: p.session_title || p.Title || "Sesi", purchase_id: p.id || p.PurchaseID, price: p.price_paid });
            });

            const grouped = Object.values(byEvent);
            setCourses(grouped);
        } catch (error) {
            console.error("Gagal ambil kursus:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ padding: 20 }}>Sedang memuat kursus...</div>;

    return (
        <div style={{ padding: 30 }}>
            <h2 style={{ marginBottom: 20 }}>📚 Kursus Saya</h2>
            
            {courses.length === 0 ? (
                <div style={{ color: "#718096" }}>Belum ada kursus yang diikuti.</div>
            ) : (
                <div style={{ display: "grid", gap: 20 }}>
                    {courses.map(eventGroup => (
                        <div key={eventGroup.event_id} style={{ border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden", background: "white" }}>
                            <div style={{ display: "flex", gap: 15, alignItems: "center", padding: 15, borderBottom: "1px solid #eee" }}>
                                <div style={{ width: 120, height: 80, background: "#e2e8f0" }}>
                                    {eventGroup.thumbnail ? (
                                        <img src={`http://localhost:8080/${eventGroup.thumbnail}`} alt={eventGroup.event_title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    ) : (
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#718096" }}>No Thumb</div>
                                    )}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: 0 }}>{eventGroup.event_title}</h3>
                                    <div style={{ color: "#718096", fontSize: "0.9em" }}>{eventGroup.sessions.length} sesi dibeli</div>
                                </div>
                                <div style={{ paddingRight: 15 }}>
                                    <button style={{ background: "#2b6cb0", color: "white", padding: "8px 12px", border: "none", borderRadius: 6, cursor: "pointer" }} onClick={() => window.location.href = `/dashboard/event/${eventGroup.event_id}`}>
                                        Lihat Event
                                    </button>
                                </div>
                            </div>
                            <div style={{ padding: 15 }}>
                                {eventGroup.sessions.map(s => (
                                    <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                                        <div>
                                            <div style={{ fontWeight: "bold" }}>{s.title}</div>
                                            <div style={{ color: "#718096", fontSize: 13 }}>Harga dibayar: Rp {s.price?.toLocaleString?.() ?? s.price}</div>
                                        </div>
                                        <div>
                                            <button style={{ padding: "8px 12px", background: "#3182ce", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }} onClick={() => window.location.href = `/dashboard/learning/session/${s.id}`}>
                                                Lanjut Belajar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}