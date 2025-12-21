import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api"; // Pastikan path api.js benar

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("applications"); // 'users' or 'applications'
    const [users, setUsers] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (activeTab === "users") {
                const res = await api.get("/admin/users");
                setUsers(res.data.users || []);
            } else {
                const res = await api.get("/admin/organization/applications");
                setApplications(res.data.applications || []);
            }
        } catch (error) {
            console.error("Gagal memuat data:", error);
            if (error.response?.status === 403 || error.response?.status === 401) {
                alert("Akses ditolak. Anda bukan Admin.");
                navigate("/dashboard");
            }
        } finally {
            setLoading(false);
        }
    };

    // --- HANDLER APPROVAL ---
    const handleReview = async (appId, status) => {
        const reason = prompt(status === 'APPROVED' ? "Catatan Persetujuan (Opsional):" : "Alasan Penolakan:");
        if (status === 'REJECTED' && !reason) return alert("Alasan penolakan wajib diisi!");

        try {
            await api.post(`/admin/organization/applications/${appId}/review`, {
                status: status,
                rejection_reason: reason || ""
            });
            alert(`Aplikasi berhasil ${status === 'APPROVED' ? 'Disetujui' : 'Ditolak'}`);
            loadData(); // Refresh list
        } catch (error) {
            alert("Gagal memproses: " + (error.response?.data?.error || "Error"));
        }
    };

    // --- HANDLER HAPUS USER ---
    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Yakin ingin menghapus user ini?")) return;
        try {
            await api.delete(`/admin/users/${userId}`);
            alert("User berhasil dihapus");
            loadData();
        } catch (error) {
            alert("Gagal menghapus user");
        }
    };

    return (
        <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto", fontFamily: "sans-serif" }}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:30}}>
                <h1 style={{color:"#2d3748"}}>🛡️ Admin Dashboard</h1>
                <div style={{display:"flex", gap:10}}>
                    <button 
                        onClick={() => setActiveTab("applications")}
                        style={{
                            padding: "10px 20px", borderRadius: "6px", cursor: "pointer", border:"none", fontWeight:"bold",
                            background: activeTab === "applications" ? "#3182ce" : "#e2e8f0",
                            color: activeTab === "applications" ? "white" : "#4a5568"
                        }}
                    >
                        📝 Pengajuan Creator
                    </button>
                    <button 
                        onClick={() => setActiveTab("users")}
                        style={{
                            padding: "10px 20px", borderRadius: "6px", cursor: "pointer", border:"none", fontWeight:"bold",
                            background: activeTab === "users" ? "#3182ce" : "#e2e8f0",
                            color: activeTab === "users" ? "white" : "#4a5568"
                        }}
                    >
                        👥 User List
                    </button>
                </div>
            </div>

            {loading ? <div style={{textAlign:"center", padding:50}}>⏳ Memuat Data...</div> : (
                <>
                    {/* TAB APPLICATIONS */}
                    {activeTab === "applications" && (
                        <div>
                            {applications.length === 0 ? <p style={{textAlign:"center", color:"#888"}}>Tidak ada pengajuan pending.</p> : 
                            applications.map(app => (
                                <div key={app.id} style={{background:"white", border:"1px solid #e2e8f0", borderRadius:8, padding:20, marginBottom:15, boxShadow:"0 2px 4px rgba(0,0,0,0.05)"}}>
                                    <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start"}}>
                                        <div>
                                            <h3 style={{marginTop:0}}>{app.org_name} <span style={{fontSize:"0.7em", background:"#bee3f8", color:"#2b6cb0", padding:"2px 6px", borderRadius:4}}>{app.org_category}</span></h3>
                                            <p style={{color:"#666", margin:"5px 0"}}><strong>Oleh:</strong> User ID {app.user_id} ({app.org_email})</p>
                                            <p style={{margin:"10px 0"}}><strong>Alasan:</strong> {app.reason}</p>
                                            {app.org_website && <a href={app.org_website} target="_blank" rel="noreferrer" style={{color:"#3182ce"}}>Website Link</a>}
                                        </div>
                                        <div style={{display:"flex", flexDirection:"column", gap:10}}>
                                            <button onClick={() => handleReview(app.id, "APPROVED")} style={{padding:"8px 15px", background:"#48bb78", color:"white", border:"none", borderRadius:4, cursor:"pointer", fontWeight:"bold"}}>✅ Setujui</button>
                                            <button onClick={() => handleReview(app.id, "REJECTED")} style={{padding:"8px 15px", background:"#f56565", color:"white", border:"none", borderRadius:4, cursor:"pointer", fontWeight:"bold"}}>❌ Tolak</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* TAB USERS */}
                    {activeTab === "users" && (
                        <div style={{overflowX:"auto"}}>
                            <table style={{width:"100%", borderCollapse:"collapse", background:"white", borderRadius:8, overflow:"hidden", boxShadow:"0 1px 3px rgba(0,0,0,0.1)"}}>
                                <thead style={{background:"#f7fafc", borderBottom:"2px solid #e2e8f0"}}>
                                    <tr>
                                        <th style={{padding:15, textAlign:"left"}}>ID</th>
                                        <th style={{padding:15, textAlign:"left"}}>Nama</th>
                                        <th style={{padding:15, textAlign:"left"}}>Email</th>
                                        <th style={{padding:15, textAlign:"left"}}>Role</th>
                                        <th style={{padding:15, textAlign:"center"}}>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u.id} style={{borderBottom:"1px solid #eee"}}>
                                            <td style={{padding:15}}>{u.id}</td>
                                            <td style={{padding:15}}>{u.name}</td>
                                            <td style={{padding:15}}>{u.email}</td>
                                            <td style={{padding:15}}>
                                                <span style={{
                                                    background: u.roles?.includes('ADMIN') ? '#fed7d7' : (u.roles?.includes('ORGANIZER') ? '#c6f6d5' : '#edf2f7'),
                                                    color: u.roles?.includes('ADMIN') ? '#822727' : (u.roles?.includes('ORGANIZER') ? '#22543d' : '#4a5568'),
                                                    padding:"2px 8px", borderRadius:4, fontSize:"0.85em", fontWeight:"bold"
                                                }}>
                                                    {u.roles || "USER"}
                                                </span>
                                            </td>
                                            <td style={{padding:15, textAlign:"center"}}>
                                                {!u.roles?.includes('ADMIN') && (
                                                    <button onClick={() => handleDeleteUser(u.id)} style={{color:"red", background:"none", border:"none", cursor:"pointer"}}>🗑 Hapus</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}