import { useState, useEffect } from 'react';
import api from '../api';
import Modal from './Modal';

export default function QuizTaker({ sessionId, onClose, onComplete }) {
    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);

    useEffect(() => {
        fetchQuiz();
    }, [sessionId]);

    const fetchQuiz = async () => {
        try {
            const res = await api.get(`/user/sessions/${sessionId}/quiz`);
            setQuiz(res.data.quiz);
            setQuestions(res.data.questions || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (questionId, option) => {
        setAnswers({ ...answers, [questionId]: option });
    };

    const handleSubmit = async () => {
        if (Object.keys(answers).length < questions.length) {
            alert('Jawab semua pertanyaan terlebih dahulu');
            return;
        }

        setSubmitting(true);
        try {
            const res = await api.post(`/user/sessions/${sessionId}/quiz/submit`, { answers });
            setResult(res.data);
            if (onComplete) onComplete(res.data);
        } catch (err) {
            alert('Gagal: ' + (err.response?.data?.error || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Modal isOpen={true} onClose={onClose} title="Memuat Kuis..." size="sm" hideCloseButton={true}>
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <div className="animate-spin" style={{ width: '30px', height: '30px', border: '3px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', margin: '0 auto 10px' }}></div>
                    <p>Mohon tunggu sebentar...</p>
                </div>
            </Modal>
        );
    }

    if (!quiz || questions.length === 0) {
        return (
            <Modal isOpen={true} onClose={onClose} title="Tidak Ada Kuis" size="sm">
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <h3 style={{ marginTop: 0 }}>📭</h3>
                    <p style={{ color: '#64748b' }}>Sesi ini belum memiliki kuis.</p>
                    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
                        <button onClick={onClose} className="btn btn-primary">Tutup</button>
                    </div>
                </div>
            </Modal>
        );
    }

    // Show result
    if (result) {
        return (
            <Modal isOpen={true} onClose={onClose} title="Hasil Kuis" size="md">
                <div style={{ textAlign: 'center', padding: '10px' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '16px' }} className="animate-scale-in">
                        {result.passed ? '🎉' : '📚'}
                    </div>
                    <h2 style={{ margin: '0 0 12px 0', color: result.passed ? '#10b981' : '#f59e0b' }}>
                        {result.passed ? 'Selamat! Kamu Lulus!' : 'Belum Lulus - Coba Lagi!'}
                    </h2>
                    <div style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '8px', color: '#1e293b' }}>
                        {result.score_percent.toFixed(0)}%
                    </div>
                    <p style={{ color: '#64748b', marginBottom: '16px' }}>
                        {result.correct_answers} dari {result.total_questions} jawaban benar
                    </p>

                    <div style={{
                        padding: '12px',
                        background: result.passed ? '#f0fdf4' : '#fffbeb',
                        borderRadius: '8px',
                        marginBottom: '24px',
                        border: result.passed ? '1px solid #bbf7d0' : '1px solid #fde68a'
                    }}>
                        {result.passed ? (
                            <p style={{ margin: 0, color: '#15803d', fontSize: '0.95rem', fontWeight: '500' }}>
                                ✅ Skor kamu akan dihitung untuk sertifikat!
                            </p>
                        ) : (
                            <p style={{ margin: 0, color: '#b45309', fontSize: '0.95rem', fontWeight: '500' }}>
                                ⚠️ Skor minimal 80% untuk lulus. Silakan coba lagi.
                            </p>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                        <button onClick={() => { setResult(null); setAnswers({}); }} className="btn btn-secondary">
                            🔄 Kerjakan Ulang
                        </button>
                        <button onClick={onClose} className="btn btn-primary">Tutup</button>
                    </div>
                </div>
            </Modal>
        );
    }

    return (
        <Modal isOpen={true} onClose={onClose} title={`📝 ${quiz.title}`} size="lg">
            <div style={{ marginBottom: '20px', padding: '16px', background: '#eff6ff', borderRadius: '12px', border: '1px solid #dbeafe', color: '#1e40af', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.2rem' }}>📌</span>
                <div>
                    <strong>Petunjuk Pengerjaan:</strong>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', opacity: 0.9 }}>
                        Pilih jawaban yang paling tepat. Anda perlu mencapai skor minimal <strong>80%</strong> untuk dinyatakan lulus pada sesi ini.
                    </p>
                </div>
            </div>

            {/* Questions */}
            <div style={{ display: 'grid', gap: '24px', maxHeight: '50vh', overflowY: 'auto', paddingRight: '10px', marginBottom: '24px' }}>
                {questions.map((q, idx) => (
                    <div key={q.id} style={{
                        padding: '20px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        background: '#fff'
                    }}>
                        <div style={{ fontWeight: '600', marginBottom: '16px', fontSize: '1.05rem', display: 'flex', gap: '8px' }}>
                            <span style={{ color: '#64748b' }}>{idx + 1}.</span>
                            <span>{q.question_text}</span>
                        </div>
                        <div style={{ display: 'grid', gap: '10px' }}>
                            {['A', 'B', 'C', 'D'].map(opt => {
                                const optValue = q[`option_${opt.toLowerCase()}`];
                                if (!optValue) return null;
                                const isSelected = answers[q.id] === opt;
                                return (
                                    <label
                                        key={opt}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '12px',
                                            padding: '12px 16px', borderRadius: '8px', cursor: 'pointer',
                                            border: isSelected ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                                            background: isSelected ? '#eff6ff' : 'white',
                                            transition: 'all 0.2s ease'
                                        }}
                                        className={isSelected ? '' : 'hover:bg-slate-50'}
                                    >
                                        <input
                                            type="radio"
                                            name={`q-${q.id}`}
                                            checked={isSelected}
                                            onChange={() => handleAnswer(q.id, opt)}
                                            style={{ width: '18px', height: '18px', accentColor: '#2563eb' }}
                                        />
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <strong style={{ color: isSelected ? '#1e40af' : '#64748b' }}>{opt}.</strong>
                                            <span style={{ color: isSelected ? '#1e3a8a' : '#1e293b' }}>{optValue}</span>
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Sticky Footer for Progress & Submit */}
            <div style={{
                background: 'white',
                borderTop: '1px solid #f1f5f9',
                paddingTop: '20px',
                marginTop: 'auto'
            }}>
                <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>
                        <span>Progress Jawaban</span>
                        <span>{Object.keys(answers).length} dari {questions.length} terjawab</span>
                    </div>
                    <div style={{ height: '10px', background: '#f1f5f9', borderRadius: '5px', overflow: 'hidden' }}>
                        <div style={{
                            width: `${(Object.keys(answers).length / questions.length) * 100}%`,
                            height: '100%',
                            background: '#2563eb',
                            transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            borderRadius: '5px'
                        }} />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button onClick={onClose} className="btn btn-secondary">Batal</button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || Object.keys(answers).length < questions.length}
                        className="btn btn-primary"
                        style={{
                            minWidth: '150px'
                        }}
                    >
                        {submitting ? 'Mengirim...' : (Object.keys(answers).length < questions.length ? 'Selesaikan Dulu' : '📤 Kirim Jawaban')}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
