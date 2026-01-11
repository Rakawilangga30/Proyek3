import { useState, useEffect } from 'react';
import api from '../../api';
import toast from 'react-hot-toast';

function OrgAffiliateRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(null);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [approvalForm, setApprovalForm] = useState({
        commission_percentage: 10,
        unique_code: ''
    });

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await api.get('/organization/affiliate-requests');
            setRequests(res.data || []);
        } catch (err) {
            console.error('Error fetching requests:', err);
        } finally {
            setLoading(false);
        }
    };

    const openApprovalModal = (req) => {
        setSelectedRequest(req);
        setApprovalForm({
            commission_percentage: req.commission_percentage || 10,
            unique_code: req.unique_code || ''
        });
    };

    const handleApprove = async () => {
        if (approvalForm.commission_percentage < 1 || approvalForm.commission_percentage > 50) {
            toast.error('Komisi harus antara 1% - 50%');
            return;
        }

        setProcessing(selectedRequest.id);
        try {
            const res = await api.put(`/organization/affiliate-requests/${selectedRequest.id}/approve`, approvalForm);
            toast.success(`Berhasil disetujui! Kode: ${res.data.unique_code}`);
            setSelectedRequest(null);
            fetchRequests();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Gagal approve');
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Tolak permintaan ini?')) return;

        setProcessing(id);
        try {
            await api.put(`/organization/affiliate-requests/${id}/reject`);
            toast.success('Permintaan ditolak');
            fetchRequests();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Gagal reject');
        } finally {
            setProcessing(null);
        }
    };

    const pendingCount = requests.filter(r => r.status === 'PENDING').length;
    const approvedCount = requests.filter(r => r.status === 'APPROVED').length;

    if (loading) {
        return <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Memuat data...</div>;
    }

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: "32px" }}>
                <h1 style={{ margin: "0 0 8px 0", color: "#1e293b", fontSize: "1.75rem" }}>
                    👥 Kelola Affiliate
                </h1>
                <p style={{ margin: 0, color: "#64748b" }}>
                    Kelola user yang ingin mempromosikan event Anda
                </p>
            </div>

            {/* Stats Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "32px" }}>
                <div style={{ background: "linear-gradient(135deg, #f39c12, #e67e22)", borderRadius: "12px", padding: "20px", color: "white" }}>
                    <div style={{ fontSize: "2rem", fontWeight: "700" }}>{pendingCount}</div>
                    <div style={{ opacity: 0.9 }}>Menunggu Review</div>
                </div>
                <div style={{ background: "linear-gradient(135deg, #27ae60, #2ecc71)", borderRadius: "12px", padding: "20px", color: "white" }}>
                    <div style={{ fontSize: "2rem", fontWeight: "700" }}>{approvedCount}</div>
                    <div style={{ opacity: 0.9 }}>Affiliate Aktif</div>
                </div>
            </div>

            {/* Requests List */}
            {requests.length === 0 ? (
                <div style={{ background: "white", borderRadius: "12px", padding: "60px", textAlign: "center", border: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "16px" }}>📭</div>
                    <p style={{ color: "#64748b", margin: 0 }}>Belum ada permintaan affiliate</p>
                </div>
            ) : (
                <div style={{ display: "grid", gap: "16px" }}>
                    {requests.map((req) => (
                        <div key={req.id} style={{
                            background: "white",
                            borderRadius: "12px",
                            padding: "20px",
                            border: "1px solid #e2e8f0",
                            borderLeft: `4px solid ${req.status === 'PENDING' ? '#f39c12' : req.status === 'APPROVED' ? '#27ae60' : '#e74c3c'}`,
                            opacity: req.status === 'REJECTED' ? 0.6 : 1
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                                <div>
                                    <h3 style={{ margin: "0 0 4px 0", color: "#1e293b", fontSize: "1.1rem" }}>{req.user_name}</h3>
                                    <p style={{ margin: 0, color: "#64748b", fontSize: "0.9rem" }}>{req.user_email}</p>
                                </div>
                                <span style={{
                                    background: req.status === 'PENDING' ? '#f39c12' : req.status === 'APPROVED' ? '#27ae60' : '#e74c3c',
                                    color: "white",
                                    padding: "4px 12px",
                                    borderRadius: "20px",
                                    fontSize: "12px",
                                    fontWeight: "600"
                                }}>
                                    {req.status === 'PENDING' ? 'Menunggu' : req.status === 'APPROVED' ? 'Disetujui' : 'Ditolak'}
                                </span>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginBottom: "16px" }}>
                                <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px" }}>
                                    <div style={{ color: "#64748b", fontSize: "12px", marginBottom: "4px" }}>📅 Event</div>
                                    <div style={{ fontWeight: "500", color: "#1e293b" }}>{req.event_title}</div>
                                </div>
                                <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px" }}>
                                    <div style={{ color: "#64748b", fontSize: "12px", marginBottom: "4px" }}>🏦 Bank</div>
                                    <div style={{ fontWeight: "500", color: "#1e293b" }}>{req.bank_name || '-'} - {req.bank_account || '-'}</div>
                                </div>
                                <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px" }}>
                                    <div style={{ color: "#64748b", fontSize: "12px", marginBottom: "4px" }}>👤 Atas Nama</div>
                                    <div style={{ fontWeight: "500", color: "#1e293b" }}>{req.bank_account_name || '-'}</div>
                                </div>
                                <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px" }}>
                                    <div style={{ color: "#64748b", fontSize: "12px", marginBottom: "4px" }}>📱 Sosmed</div>
                                    <div style={{ fontWeight: "500", color: "#1e293b" }}>{req.social_media || '-'}</div>
                                </div>
                                <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px" }}>
                                    <div style={{ color: "#64748b", fontSize: "12px", marginBottom: "4px" }}>📞 Telepon</div>
                                    <div style={{ fontWeight: "500", color: "#1e293b" }}>{req.phone || req.user_phone || '-'}</div>
                                </div>
                                <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px" }}>
                                    <div style={{ color: "#64748b", fontSize: "12px", marginBottom: "4px" }}>🗓️ Tanggal Daftar</div>
                                    <div style={{ fontWeight: "500", color: "#1e293b" }}>{new Date(req.created_at).toLocaleDateString('id-ID')}</div>
                                </div>
                            </div>

                            {req.status === 'APPROVED' && (
                                <div style={{ background: "#f0fdf4", border: "1px solid #86efac", padding: "16px", borderRadius: "8px", marginBottom: "16px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                                        <div>
                                            <span style={{ color: "#15803d", fontSize: "14px" }}>Kode Promo: </span>
                                            <code style={{ background: "#dcfce7", padding: "4px 12px", borderRadius: "4px", fontWeight: "700", color: "#166534", fontSize: "1.1rem" }}>{req.unique_code}</code>
                                        </div>
                                        <div style={{ color: "#15803d" }}>Komisi: <strong>{req.commission_percentage}%</strong></div>
                                    </div>
                                </div>
                            )}

                            {req.status === 'PENDING' && (
                                <div style={{ display: "flex", gap: "12px" }}>
                                    <button
                                        onClick={() => openApprovalModal(req)}
                                        disabled={processing === req.id}
                                        style={{
                                            flex: 1,
                                            padding: "12px 20px",
                                            background: "linear-gradient(135deg, #27ae60, #2ecc71)",
                                            border: "none",
                                            borderRadius: "8px",
                                            color: "white",
                                            fontWeight: "600",
                                            cursor: "pointer",
                                            opacity: processing === req.id ? 0.5 : 1
                                        }}
                                    >
                                        ✓ Review & Approve
                                    </button>
                                    <button
                                        onClick={() => handleReject(req.id)}
                                        disabled={processing === req.id}
                                        style={{
                                            flex: 1,
                                            padding: "12px 20px",
                                            background: "transparent",
                                            border: "2px solid #e74c3c",
                                            borderRadius: "8px",
                                            color: "#e74c3c",
                                            fontWeight: "600",
                                            cursor: "pointer",
                                            opacity: processing === req.id ? 0.5 : 1
                                        }}
                                    >
                                        ✕ Tolak
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Approval Modal */}
            {selectedRequest && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    background: "rgba(0,0,0,0.7)", display: "flex",
                    alignItems: "center", justifyContent: "center", zIndex: 9999
                }}>
                    <div style={{
                        background: "white", borderRadius: "16px", padding: "32px",
                        width: "100%", maxWidth: "480px", color: "#1e293b"
                    }}>
                        <h2 style={{ margin: "0 0 8px 0", fontSize: "1.5rem" }}>✅ Approve Affiliate</h2>
                        <p style={{ color: "#64748b", marginBottom: "24px" }}>
                            Setujui <strong>{selectedRequest.user_name}</strong> untuk event <strong>{selectedRequest.event_title}</strong>
                        </p>

                        <div style={{ marginBottom: "20px" }}>
                            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Persentase Komisi (%)</label>
                            <input
                                type="number"
                                min="1"
                                max="50"
                                value={approvalForm.commission_percentage}
                                onChange={(e) => setApprovalForm({ ...approvalForm, commission_percentage: parseFloat(e.target.value) })}
                                style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "16px" }}
                            />
                            <small style={{ display: "block", marginTop: "6px", color: "#64748b" }}>
                                Affiliate akan mendapat {approvalForm.commission_percentage}% dari setiap penjualan
                            </small>
                        </div>

                        <div style={{ marginBottom: "24px" }}>
                            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Kode Unik Promo</label>
                            <input
                                type="text"
                                value={approvalForm.unique_code}
                                onChange={(e) => setApprovalForm({ ...approvalForm, unique_code: e.target.value.toUpperCase() })}
                                placeholder="Kosongkan untuk auto-generate"
                                style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "16px" }}
                            />
                            <small style={{ display: "block", marginTop: "6px", color: "#64748b" }}>
                                Contoh: PROMO2024, DISKON10. Kosongkan untuk otomatis.
                            </small>
                        </div>

                        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                            <button
                                onClick={() => setSelectedRequest(null)}
                                style={{ padding: "12px 24px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "white", cursor: "pointer" }}
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleApprove}
                                disabled={processing}
                                style={{
                                    padding: "12px 24px", borderRadius: "8px", border: "none",
                                    background: "linear-gradient(135deg, #27ae60, #2ecc71)",
                                    color: "white", fontWeight: "600", cursor: "pointer",
                                    opacity: processing ? 0.5 : 1
                                }}
                            >
                                {processing ? 'Memproses...' : 'Approve Affiliate'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default OrgAffiliateRequests;
