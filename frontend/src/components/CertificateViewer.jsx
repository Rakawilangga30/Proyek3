import { useState, useEffect, useRef } from 'react';
import api from '../api';
import Modal from './Modal';

export default function CertificateViewer({ eventId, onClose }) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        fetchCertificate();
    }, [eventId]);

    const fetchCertificate = async () => {
        try {
            const res = await api.get(`/user/events/${eventId}/certificate`);
            setData(res.data);
            if (res.data.has_certificate) {
                setTimeout(() => drawCertificate(res.data), 100);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Gagal memuat sertifikat');
        } finally {
            setLoading(false);
        }
    };

    const drawCertificate = (certData) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = 1200;
        const height = 850;
        canvas.width = width;
        canvas.height = height;

        // Background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        // Border
        ctx.strokeStyle = '#1e40af';
        ctx.lineWidth = 8;
        ctx.strokeRect(20, 20, width - 40, height - 40);

        // Inner border
        ctx.strokeStyle = '#dbeafe';
        ctx.lineWidth = 3;
        ctx.strokeRect(35, 35, width - 70, height - 70);

        // Gold accent line
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.strokeRect(45, 45, width - 90, height - 90);

        // Header decoration
        ctx.fillStyle = '#1e40af';
        ctx.beginPath();
        ctx.moveTo(width / 2 - 150, 80);
        ctx.lineTo(width / 2 + 150, 80);
        ctx.lineTo(width / 2 + 130, 100);
        ctx.lineTo(width / 2 - 130, 100);
        ctx.closePath();
        ctx.fill();

        // Title
        ctx.fillStyle = '#1e40af';
        ctx.font = 'bold 48px Georgia, serif';
        ctx.textAlign = 'center';
        ctx.fillText('CERTIFICATE', width / 2, 180);

        ctx.font = '24px Georgia, serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText('OF COMPLETION', width / 2, 220);

        // Decorative line
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(width / 2 - 200, 250);
        ctx.lineTo(width / 2 + 200, 250);
        ctx.stroke();

        // "This is to certify that"
        ctx.font = '20px Georgia, serif';
        ctx.fillStyle = '#374151';
        ctx.fillText('This is to certify that', width / 2, 310);

        // User name
        ctx.font = 'italic 42px Georgia, serif';
        ctx.fillStyle = '#1e40af';
        ctx.fillText(certData.user_name || 'Student Name', width / 2, 380);

        // Underline for name
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(width / 2 - 250, 395);
        ctx.lineTo(width / 2 + 250, 395);
        ctx.stroke();

        // "has successfully completed"
        ctx.font = '20px Georgia, serif';
        ctx.fillStyle = '#374151';
        ctx.fillText('has successfully completed', width / 2, 450);

        // Event name
        ctx.font = 'bold 32px Georgia, serif';
        ctx.fillStyle = '#1e293b';
        const eventTitle = certData.event_title || 'Course Name';
        ctx.fillText(eventTitle.length > 40 ? eventTitle.substring(0, 40) + '...' : eventTitle, width / 2, 510);

        // Score
        ctx.font = '18px Arial, sans-serif';
        ctx.fillStyle = '#10b981';
        ctx.fillText(`with a score of ${certData.certificate?.total_score_percent?.toFixed(1) || 0}%`, width / 2, 555);

        // Organization
        ctx.font = '22px Georgia, serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText('Presented by', width / 2, 620);
        ctx.font = 'bold 26px Georgia, serif';
        ctx.fillStyle = '#1e40af';
        ctx.fillText(certData.org_name || 'Organization', width / 2, 660);

        // Date
        const date = certData.certificate?.issued_at
            ? new Date(certData.certificate.issued_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
            : new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        ctx.font = '16px Arial, sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText(date, width / 2, 720);

        // Certificate code
        ctx.font = '12px monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`ID: ${certData.certificate?.certificate_code || 'CERT-XXXXXX'}`, width / 2, 780);

        // Corner decorations
        drawCornerDecor(ctx, 60, 60, 0);
        drawCornerDecor(ctx, width - 60, 60, 90);
        drawCornerDecor(ctx, width - 60, height - 60, 180);
        drawCornerDecor(ctx, 60, height - 60, 270);
    };

    const drawCornerDecor = (ctx, x, y, rotation) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    };

    const handleDownload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const link = document.createElement('a');
        link.download = `certificate-${data?.event_title || 'course'}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    if (loading) {
        return (
            <Modal isOpen={true} onClose={onClose} title="Memuat Sertifikat..." size="sm" hideCloseButton={true}>
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <div className="animate-spin" style={{ width: '30px', height: '30px', border: '3px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', margin: '0 auto 10px' }}></div>
                    <p>Menyiapkan sertifikat kelulusan...</p>
                </div>
            </Modal>
        );
    }

    if (error) {
        return (
            <Modal isOpen={true} onClose={onClose} title="Error" size="sm">
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <h3 style={{ color: '#ef4444' }}>❌ Gagal Memuat</h3>
                    <p style={{ color: '#64748b' }}>{error}</p>
                    <button onClick={onClose} className="btn btn-secondary">Tutup</button>
                </div>
            </Modal>
        );
    }

    if (!data?.has_certificate) {
        return (
            <Modal isOpen={true} onClose={onClose} title="Sertifikat Belum Tersedia" size="sm">
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📜</div>
                    <h3 style={{ margin: '0 0 10px 0' }}>Belum Lulus</h3>
                    <p style={{ color: '#64748b', marginBottom: '16px' }}>
                        {data?.message || 'Selesaikan semua kuis dengan skor minimal untuk mendapatkan sertifikat.'}
                    </p>
                    {data?.total_score !== undefined && (
                        <div style={{ marginBottom: '20px', padding: '15px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fcd34d' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '1.5rem', color: '#b45309' }}>
                                {data.total_score?.toFixed(1)}%
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#92400e' }}>
                                Skor saat ini (minimal {data.min_required}%)
                            </div>
                        </div>
                    )}
                    <button onClick={onClose} className="btn btn-primary">Tutup</button>
                </div>
            </Modal>
        );
    }

    return (
        <Modal isOpen={true} onClose={onClose} title="🎓 Sertifikat Kelulusan" size="xl">
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <canvas
                    ref={canvasRef}
                    style={{ maxWidth: '100%', height: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
                <button onClick={handleDownload} className="btn btn-primary">
                    📥 Download Sertifikat (PNG)
                </button>
                <button onClick={onClose} className="btn btn-secondary">Tutup</button>
            </div>
        </Modal>
    );
}
