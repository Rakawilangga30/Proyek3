import { useState, useEffect } from "react";
import api from "../../api"; // Pastikan path benar

export default function UserProfile() {
    const [user, setUser] = useState({ name: "", email: "", bio: "", phone: "", username: "" });
    const [previewImg, setPreviewImg] = useState(null);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [orgProfile, setOrgProfile] = useState(null);

    // Helper untuk URL gambar (handle path relatif dari backend)
    const getImgUrl = (path) => {
        if (!path) return null;
        if (path.startsWith("http")) return path;
        return `http://localhost:8080/${path}`; // Sesuaikan port backend
    };

    useEffect(() => {
        loadProfile();
        loadOrgIfNeeded();
    }, []);

    const loadProfile = async () => {
        try {
            // FIX 1: Path harus /user/profile
            const res = await api.get("/user/profile"); 
            const serverUser = res.data.user || {};
            // Prefer username returned by server, fallback to localStorage
            const localUser = JSON.parse(localStorage.getItem("user") || "{}");
            setUser({ ...serverUser, username: serverUser.username || localUser.username || "" });
            setPreviewImg(getImgUrl(serverUser.profile_img));

            // Sync important fields back to localStorage.user (keep roles & token)
            try {
                const localUser = JSON.parse(localStorage.getItem("user") || "{}");
                const mergedLocal = { ...localUser, name: serverUser.name, email: serverUser.email, phone: serverUser.phone, profile_img: serverUser.profile_img, bio: serverUser.bio };
                localStorage.setItem("user", JSON.stringify(mergedLocal));
            } catch (e) {
                // ignore storage errors
            }
        } catch (err) {
            console.error(err);
        }
    };

    const loadOrgIfNeeded = async () => {
        try {
            const localUser = JSON.parse(localStorage.getItem("user") || "{}");
            const roles = localUser.roles || [];
            if (roles.includes("ORGANIZER")) {
                const res = await api.get("/organization/profile");
                const org = res.data.organization || null;
                if (org) {
                    org.website = org.website || "";
                    org.social_link = org.social_link || "";
                    org.address = org.address || "";
                }
                setOrgProfile(org);
            }
        } catch (e) {
            // ignore if not organization or endpoint returns 403
            setOrgProfile(null);
        }
    };

    const handleChange = (e) => setUser({ ...user, [e.target.name]: e.target.value });
    
    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            setFile(selected);
            setPreviewImg(URL.createObjectURL(selected));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // 1. Update Text Data
            // FIX 2: Path harus /user/profile
            await api.put("/user/profile", {
                name: user.name,
                username: user.username,
                phone: user.phone,
                bio: user.bio,
                profile_img: user.profile_img // Kirim path lama jika tidak update foto
            });

            // Jika user adalah organizer, kirim juga update untuk organization profile
            if (orgProfile) {
                try {
                    await api.put("/organization/profile", {
                        name: orgProfile.name,
                        description: orgProfile.description,
                        category: orgProfile.category,
                        logo_url: orgProfile.logo_url,
                        email: orgProfile.email,
                        phone: orgProfile.phone,
                        website: orgProfile.website,
                        social_link: orgProfile.social_link,
                        address: orgProfile.address,
                    });
                } catch (err) {
                    console.warn('Gagal update organization profile', err);
                }
            }

            // 2. Update Foto (Jika ada file baru dipilih)
            if (file) {
                const formData = new FormData();
                formData.append("profile_img", file); // Key harus sesuai backend (profile_img)

                // Upload and read returned URL
                const resp = await api.post("/user/profile/upload-image", formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                const url = resp.data?.url || resp.data?.url || null;
                if (url) {
                    // update local state and localStorage
                    setUser(prev => ({ ...prev, profile_img: url }));
                    try {
                        const localUser = JSON.parse(localStorage.getItem("user") || "{}");
                        localStorage.setItem("user", JSON.stringify({ ...localUser, profile_img: url, name: user.name, username: user.username }));
                    } catch (e) {}
                    setPreviewImg(getImgUrl(url));
                }
            }

            alert("Profil berhasil diperbarui!");

            // Update nama & username di localStorage agar sidebar dan login state berubah
            try {
                const localUser = JSON.parse(localStorage.getItem("user") || "{}");
                localStorage.setItem("user", JSON.stringify({ ...localUser, name: user.name, username: user.username }));
            } catch (e) {}

            // Reload org profile to reflect any changes (if organizer)
            if (orgProfile) await loadOrgIfNeeded();
        } catch (error) {
            console.error(error);
            alert("Gagal update profil: " + (error.response?.data?.error || "Error"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ background: "white", padding: 30, borderRadius: 10, boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>
            <h2 style={{marginTop:0}}>👤 Profil Saya</h2>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                
                {/* Bagian Foto */}
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                    <div style={{ width: 100, height: 100, borderRadius: "50%", background: "#edf2f7", overflow: "hidden", border:"2px solid #e2e8f0" }}>
                        {previewImg ? (
                            <img src={previewImg} alt="Profil" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                            <div style={{textAlign:"center", lineHeight:"100px", color:"#a0aec0"}}>No IMG</div>
                        )}
                    </div>
                    <div>
                        <input type="file" accept="image/*" onChange={handleFileChange} />
                        <p style={{fontSize:12, color:"#718096", marginTop:5}}>Format: JPG, PNG, WEBP. Max 2MB.</p>
                    </div>
                </div>

                <div>
                    <label style={{fontWeight:"bold", display:"block", marginBottom:5}}>Nama Lengkap</label>
                    <input type="text" name="name" value={user.name || ""} onChange={handleChange} style={{ width: "100%", padding: "10px", border:"1px solid #cbd5e0", borderRadius:6 }} required />
                </div>

                <div>
                    <label style={{fontWeight:"bold", display:"block", marginBottom:5}}>Username (tampilan)</label>
                    <input type="text" name="username" value={user.username || ""} onChange={handleChange} style={{ width: "100%", padding: "10px", border:"1px solid #cbd5e0", borderRadius:6 }} placeholder="username untuk ditampilkan" />
                    <small style={{ color: "#718096" }}>Username akan disimpan di sisi frontend untuk tampilan profil.</small>
                </div>
                
                <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:20}}>
                    <div>
                        <label style={{fontWeight:"bold", display:"block", marginBottom:5}}>Email</label>
                        <input type="email" value={user.email || ""} disabled style={{ width: "100%", padding: "10px", border:"1px solid #e2e8f0", borderRadius:6, background: "#f7fafc", color:"#718096" }} />
                    </div>
                    <div>
                        <label style={{fontWeight:"bold", display:"block", marginBottom:5}}>No. Telepon</label>
                        <input type="text" name="phone" value={user.phone || ""} onChange={handleChange} style={{ width: "100%", padding: "10px", border:"1px solid #cbd5e0", borderRadius:6 }} />
                    </div>
                </div>

                <div>
                    <label style={{fontWeight:"bold", display:"block", marginBottom:5}}>Biodata</label>
                    <textarea name="bio" value={user.bio || ""} onChange={handleChange} rows="4" style={{ width: "100%", padding: "10px", border:"1px solid #cbd5e0", borderRadius:6 }} placeholder="Ceritakan sedikit tentang dirimu..." />
                </div>

                {/* Jika user adalah organisasi, tampilkan link organisasi */}
                {orgProfile && (
                    <div style={{ padding: 12, background: "#f7fafc", border: "1px solid #e2e8f0", borderRadius: 6 }}>
                        <label style={{fontWeight:"bold", display:"block", marginBottom:5}}>Organisasi</label>
                        <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: "bold", marginBottom: 8 }}>{orgProfile.name}</div>

                                <div style={{ display: "grid", gap: 10 }}>
                                    <div>
                                        <label style={{ display: "block", fontWeight: "bold", marginBottom: 4 }}>Website</label>
                                        <input type="text" name="website" value={orgProfile.website || ""} onChange={e => setOrgProfile({...orgProfile, website: e.target.value})} style={{ width: "100%", padding: 8, borderRadius:6, border: "1px solid #cbd5e0" }} />
                                    </div>
                                    <div>
                                        <label style={{ display: "block", fontWeight: "bold", marginBottom: 4 }}>Social (tampilan teks)</label>
                                        <input type="text" name="social_link" value={orgProfile.social_link || ""} onChange={e => setOrgProfile({...orgProfile, social_link: e.target.value})} style={{ width: "100%", padding: 8, borderRadius:6, border: "1px solid #cbd5e0" }} />
                                    </div>
                                    <div>
                                        <label style={{ display: "block", fontWeight: "bold", marginBottom: 4 }}>Alamat</label>
                                        <textarea name="address" value={orgProfile.address || ""} onChange={e => setOrgProfile({...orgProfile, address: e.target.value})} rows={3} style={{ width: "100%", padding: 8, borderRadius:6, border: "1px solid #cbd5e0" }} />
                                    </div>
                                </div>
                            </div>
                            <div style={{ minWidth: 140 }}>
                                <a href="/dashboard/org" style={{ padding: "8px 12px", background: "#3182ce", color: "white", borderRadius: 6, textDecoration: "none", display: "inline-block" }}>Kelola Organisasi</a>
                            </div>
                        </div>
                    </div>
                )}

                <button type="submit" disabled={loading} style={{ padding: "12px", background: loading ? "#718096" : "#3182ce", color: "white", border: "none", borderRadius: 6, cursor: loading ? "default" : "pointer", fontWeight: "bold", fontSize:16 }}>
                    {loading ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
            </form>
        </div>
    );
}