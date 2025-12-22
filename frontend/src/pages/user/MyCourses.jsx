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
            // Sesuai route backend: userGroup.GET("/purchases", ...)
            const res = await api.get("/user/purchases");
            setCourses(res.data.data || []); // Asumsi response backend { data: [...] }
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
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 20 }}>
                    {courses.map((purchase) => {
                        // Data event ada di dalam purchase.Event (sesuai struktur GORM backend)
                        const event = purchase.Event; 
                        return (
                            <div key={purchase.ID} style={{ border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden", background: "white" }}>
                                <div style={{ height: 140, background: "#cbd5e0" }}>
                                    {event.thumbnail ? (
                                        <img 
                                            src={`http://localhost:8080/${event.thumbnail}`} 
                                            alt={event.title}
                                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                        />
                                    ) : (
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#718096" }}>
                                            No Thumbnail
                                        </div>
                                    )}
                                </div>
                                <div style={{ padding: 15 }}>
                                    <h4 style={{ margin: "0 0 10px 0" }}>{event.title}</h4>
                                    <button 
                                        style={{ width: "100%", padding: "8px", background: "#3182ce", color: "white", border: "none", borderRadius: 4, cursor: "pointer" }}
                                        onClick={() => window.location.href = `/dashboard/learning/${purchase.ID}`} // Nanti buat halaman belajar
                                    >
                                        Lanjut Belajar
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}