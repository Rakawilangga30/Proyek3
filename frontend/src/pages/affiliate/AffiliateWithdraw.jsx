import { useState, useEffect } from 'react';
import api from '../../api';
import toast from 'react-hot-toast';

function AffiliateWithdraw() {
    const [balance, setBalance] = useState(0);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        amount: '',
        bank_name: '',
        bank_account: '',
        bank_account_name: '',
        notes: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [balanceRes, historyRes] = await Promise.all([
                api.get('/affiliate/balance'),
                api.get('/user/withdrawal-requests?type=AFFILIATE')
            ]);
            setBalance(balanceRes.data.balance || 0);
            setHistory(historyRes.data);
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.amount || !form.bank_name || !form.bank_account || !form.bank_account_name) {
            toast.error('Lengkapi semua data');
            return;
        }
        if (parseFloat(form.amount) > balance) {
            toast.error('Jumlah melebihi saldo tersedia');
            return;
        }

        setSubmitting(true);
        try {
            await api.post('/affiliate/withdrawal-request', {
                ...form,
                amount: parseFloat(form.amount)
            });
            toast.success('Permintaan penarikan berhasil diajukan!');
            setShowForm(false);
            setForm({ amount: '', bank_name: '', bank_account: '', bank_account_name: '', notes: '' });
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Gagal submit');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            PENDING: { bg: '#f39c12', text: 'Menunggu' },
            APPROVED: { bg: '#27ae60', text: 'Disetujui' },
            REJECTED: { bg: '#e74c3c', text: 'Ditolak' }
        };
        const s = styles[status] || { bg: '#888', text: status };
        return <span style={{ background: s.bg, padding: '4px 10px', borderRadius: '4px', fontSize: '12px', color: 'white' }}>{s.text}</span>;
    };

    if (loading) return <div className="loading-spinner">Loading...</div>;

    return (
        <div className="affiliate-withdraw">
            <h2>💰 Tarik Dana Affiliate</h2>

            <div className="balance-card">
                <div className="balance-label">Saldo Tersedia</div>
                <div className="balance-amount">Rp {balance.toLocaleString('id-ID')}</div>
                <button onClick={() => setShowForm(true)} className="btn-withdraw" disabled={balance <= 0}>
                    Ajukan Penarikan
                </button>
                <p className="info-text">⚠️ Penarikan hanya bisa dilakukan 1x per bulan (reset tiap tanggal 1)</p>
            </div>

            <h3>Riwayat Permintaan</h3>
            {history.length === 0 ? (
                <p className="empty-text">Belum ada riwayat penarikan</p>
            ) : (
                <div className="history-list">
                    {history.map(h => (
                        <div key={h.id} className="history-item">
                            <div className="history-main">
                                <div className="history-amount">Rp {h.amount.toLocaleString('id-ID')}</div>
                                <div className="history-date">{new Date(h.created_at).toLocaleDateString('id-ID')}</div>
                            </div>
                            <div className="history-bank">{h.bank_name} - {h.bank_account}</div>
                            {getStatusBadge(h.status)}
                            {h.admin_notes && <div className="admin-notes">Admin: {h.admin_notes}</div>}
                        </div>
                    ))}
                </div>
            )}

            {/* Request Form Modal */}
            {showForm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Ajukan Penarikan Dana</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Jumlah (Rp)</label>
                                <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="Contoh: 100000" max={balance} required />
                            </div>
                            <div className="form-group">
                                <label>Nama Bank</label>
                                <select value={form.bank_name} onChange={(e) => setForm({ ...form, bank_name: e.target.value })} required>
                                    <option value="">Pilih Bank</option>
                                    <option value="BCA">BCA</option>
                                    <option value="BNI">BNI</option>
                                    <option value="BRI">BRI</option>
                                    <option value="Mandiri">Mandiri</option>
                                    <option value="DANA">DANA</option>
                                    <option value="OVO">OVO</option>
                                    <option value="GoPay">GoPay</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Nomor Rekening</label>
                                <input type="text" value={form.bank_account} onChange={(e) => setForm({ ...form, bank_account: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Atas Nama</label>
                                <input type="text" value={form.bank_account_name} onChange={(e) => setForm({ ...form, bank_account_name: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Catatan (opsional)</label>
                                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowForm(false)} className="btn-cancel">Batal</button>
                                <button type="submit" disabled={submitting} className="btn-submit">{submitting ? 'Mengirim...' : 'Kirim Permintaan'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .affiliate-withdraw { max-width: 800px; margin: 0 auto; padding: 20px; }
                .balance-card { background: linear-gradient(135deg, #1a1a2e, #16213e); border-radius: 16px; padding: 32px; text-align: center; margin-bottom: 32px; border: 1px solid rgba(255,255,255,0.1); }
                .balance-label { color: var(--text-muted, #888); font-size: 14px; margin-bottom: 8px; }
                .balance-amount { font-size: 2.5rem; font-weight: 700; color: #2ed573; margin-bottom: 20px; }
                .btn-withdraw { background: linear-gradient(135deg, #8b5cf6, #6366f1); border: none; color: white; padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 16px; cursor: pointer; }
                .btn-withdraw:disabled { opacity: 0.5; cursor: not-allowed; }
                .info-text { color: var(--text-muted, #888); font-size: 13px; margin-top: 16px; }
                h3 { margin-bottom: 16px; }
                .empty-text { color: var(--text-muted, #888); }
                .history-list { display: flex; flex-direction: column; gap: 12px; }
                .history-item { background: var(--card-bg, #1a1a2e); border-radius: 12px; padding: 16px; display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
                .history-main { flex: 1; }
                .history-amount { font-weight: 600; font-size: 18px; }
                .history-date { color: var(--text-muted, #888); font-size: 13px; }
                .history-bank { color: var(--text-muted, #888); font-size: 14px; }
                .admin-notes { width: 100%; font-size: 13px; color: var(--text-muted, #888); background: rgba(0,0,0,0.2); padding: 8px 12px; border-radius: 6px; margin-top: 8px; }
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 1000; }
                .modal-content { background: var(--card-bg, #1a1a2e); border-radius: 16px; padding: 28px; width: 100%; max-width: 450px; }
                .modal-content h3 { margin: 0 0 20px 0; }
                .form-group { margin-bottom: 16px; }
                .form-group label { display: block; margin-bottom: 6px; font-weight: 500; font-size: 14px; }
                .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--border-color, #333); background: var(--bg-color, #0f0f23); color: white; font-size: 15px; }
                .modal-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px; }
                .btn-cancel { padding: 12px 24px; border-radius: 8px; border: 1px solid var(--border-color, #333); background: transparent; color: white; cursor: pointer; }
                .btn-submit { padding: 12px 24px; border-radius: 8px; border: none; background: linear-gradient(135deg, #8b5cf6, #6366f1); color: white; font-weight: 600; cursor: pointer; }
            `}</style>
        </div>
    );
}

export default AffiliateWithdraw;
