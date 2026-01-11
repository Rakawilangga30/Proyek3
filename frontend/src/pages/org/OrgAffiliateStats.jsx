import { useState, useEffect } from 'react';
import api from '../../api';

function OrgAffiliateStats() {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('/organization/affiliate-stats');
            setStats(res.data);
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading-spinner">Loading...</div>;

    return (
        <div className="affiliate-stats">
            <h2>📊 Statistik Affiliate</h2>
            <p className="subtitle">Performa affiliate yang mempromosikan event Anda</p>

            {stats.length === 0 ? (
                <div className="empty-state">
                    <p>Belum ada affiliate yang disetujui</p>
                </div>
            ) : (
                <div className="stats-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Affiliate</th>
                                <th>Event</th>
                                <th>Kode Promo</th>
                                <th>Komisi</th>
                                <th>Pembeli</th>
                                <th>Pendapatan Affiliate</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.map((s) => (
                                <tr key={s.id}>
                                    <td>
                                        <div className="affiliate-name">{s.user_name}</div>
                                        <div className="affiliate-email">{s.user_email}</div>
                                    </td>
                                    <td>{s.event_title}</td>
                                    <td><code className="promo-code">{s.unique_code}</code></td>
                                    <td>{s.commission_percentage}%</td>
                                    <td className="buyers">{s.total_buyers}</td>
                                    <td className="earnings">Rp {s.total_earnings.toLocaleString('id-ID')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="summary-cards">
                <div className="summary-card">
                    <div className="card-label">Total Affiliate</div>
                    <div className="card-value">{stats.length}</div>
                </div>
                <div className="summary-card">
                    <div className="card-label">Total Pembeli via Affiliate</div>
                    <div className="card-value">{stats.reduce((acc, s) => acc + s.total_buyers, 0)}</div>
                </div>
                <div className="summary-card">
                    <div className="card-label">Total Komisi Dibayar</div>
                    <div className="card-value earnings">Rp {stats.reduce((acc, s) => acc + s.total_earnings, 0).toLocaleString('id-ID')}</div>
                </div>
            </div>

            <style>{`
                .affiliate-stats { max-width: 1100px; margin: 0 auto; padding: 20px; }
                .affiliate-stats h2 { margin-bottom: 8px; }
                .subtitle { color: var(--text-muted, #888); margin-bottom: 24px; }
                
                .empty-state { text-align: center; padding: 60px; background: var(--card-bg, #1a1a2e); border-radius: 12px; }
                
                .stats-table { background: var(--card-bg, #1a1a2e); border-radius: 12px; overflow: hidden; margin-bottom: 24px; }
                .stats-table table { width: 100%; border-collapse: collapse; }
                .stats-table th, .stats-table td { padding: 14px 16px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.05); }
                .stats-table th { background: rgba(0,0,0,0.2); font-weight: 600; font-size: 13px; color: var(--text-muted, #888); text-transform: uppercase; }
                .stats-table tr:hover { background: rgba(255,255,255,0.02); }
                
                .affiliate-name { font-weight: 500; }
                .affiliate-email { font-size: 12px; color: var(--text-muted, #888); }
                
                .promo-code { background: rgba(139, 92, 246, 0.2); color: #a78bfa; padding: 4px 8px; border-radius: 4px; font-size: 13px; }
                
                .buyers { font-weight: 600; color: #3b82f6; }
                .earnings { font-weight: 600; color: #2ed573; }
                
                .summary-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
                .summary-card { background: var(--card-bg, #1a1a2e); border-radius: 12px; padding: 20px; text-align: center; border: 1px solid rgba(255,255,255,0.05); }
                .card-label { font-size: 13px; color: var(--text-muted, #888); margin-bottom: 8px; }
                .card-value { font-size: 1.8rem; font-weight: 700; }
            `}</style>
        </div>
    );
}

export default OrgAffiliateStats;
