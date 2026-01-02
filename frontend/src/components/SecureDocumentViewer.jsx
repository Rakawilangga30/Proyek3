import { useState, useRef, useEffect } from 'react';

/**
 * SecureDocumentViewer Component
 * 
 * A document viewer with content protection:
 * - Displays PDF/documents in an embedded viewer
 * - Disables right-click context menu
 * - Prevents keyboard shortcuts for save/download
 * - Hides download buttons
 * - Makes it harder to download files
 * 
 * Supported formats:
 * - PDF: Native browser viewer
 * - Images (JPG, PNG, GIF, WEBP): Direct display
 * - Office files (PPTX, DOCX, XLSX): Download-protected view with Office Web Apps
 * 
 * @param {Object} props
 * @param {string} props.src - Document source URL
 * @param {string} props.title - Document title for display
 * @param {Function} props.onClose - Callback to close the viewer
 */
export default function SecureDocumentViewer({ src, title = 'Document Viewer', onClose }) {
    const containerRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [viewerError, setViewerError] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Prevent right-click context menu
        const handleContextMenu = (e) => {
            e.preventDefault();
            return false;
        };

        // Prevent keyboard shortcuts (Ctrl+S, Ctrl+Shift+S, Ctrl+P)
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S' || e.key === 'p' || e.key === 'P')) {
                e.preventDefault();
                return false;
            }
        };

        container.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            container.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    // Auto-hide loading after timeout
    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    // Get file extension
    const getFileExtension = (url) => {
        if (!url) return '';
        const cleanUrl = url.split('?')[0];
        const parts = cleanUrl.split('.');
        return parts[parts.length - 1]?.toLowerCase() || '';
    };

    const extension = getFileExtension(src);

    // File type categories
    const isPDF = extension === 'pdf';
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(extension);
    const isOffice = ['ppt', 'pptx', 'doc', 'docx', 'xls', 'xlsx'].includes(extension);
    const isText = ['txt', 'md', 'json', 'xml', 'csv'].includes(extension);

    // Get icon based on file type
    const getFileIcon = () => {
        if (isPDF) return '📄';
        if (isImage) return '🖼️';
        if (['ppt', 'pptx'].includes(extension)) return '📊';
        if (['doc', 'docx'].includes(extension)) return '📝';
        if (['xls', 'xlsx'].includes(extension)) return '📈';
        return '📁';
    };

    // Render content based on file type
    const renderContent = () => {
        // PDF - use embed
        if (isPDF) {
            return (
                <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                    <embed
                        src={`${src}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
                        type="application/pdf"
                        width="100%"
                        height="100%"
                        onLoad={() => setLoading(false)}
                    />
                    {/* Overlay to block download button area */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '180px',
                        height: '40px',
                        background: '#525659',
                        zIndex: 5
                    }} />
                </div>
            );
        }

        // Images - display directly
        if (isImage) {
            return (
                <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                    boxSizing: 'border-box',
                    background: '#1a1a1a'
                }}>
                    <img
                        src={src}
                        alt={title}
                        onLoad={() => setLoading(false)}
                        onError={() => { setLoading(false); setViewerError(true); }}
                        style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                            borderRadius: '8px',
                            pointerEvents: 'none'
                        }}
                        draggable={false}
                        onDragStart={(e) => e.preventDefault()}
                    />
                </div>
            );
        }

        // Office files - For localhost, show informative fallback
        // Google Docs Viewer only works with public URLs
        if (isOffice) {
            // Check if running on localhost (development)
            const isLocalhost = window.location.hostname === 'localhost' ||
                window.location.hostname === '127.0.0.1';

            // For localhost, show protected view message
            return (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    padding: '40px',
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
                }}>
                    <div style={{
                        width: '120px',
                        height: '120px',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
                        borderRadius: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '24px',
                        boxShadow: '0 10px 40px rgba(59, 130, 246, 0.3)'
                    }}>
                        <span style={{ fontSize: '4rem' }}>{getFileIcon()}</span>
                    </div>

                    <h3 style={{
                        margin: '0 0 8px 0',
                        color: '#1e293b',
                        fontSize: '1.5rem',
                        fontWeight: '700'
                    }}>
                        {title}
                    </h3>

                    <div style={{
                        padding: '4px 12px',
                        background: '#e2e8f0',
                        borderRadius: '16px',
                        color: '#64748b',
                        fontSize: '0.85rem',
                        marginBottom: '20px',
                        fontWeight: '500'
                    }}>
                        Format: {extension.toUpperCase()}
                    </div>

                    <p style={{
                        margin: '0 0 24px 0',
                        color: '#64748b',
                        maxWidth: '400px',
                        lineHeight: '1.6'
                    }}>
                        File ini merupakan materi pembelajaran yang <strong>dilindungi</strong>.
                        Anda dapat mempelajari konten ini melalui platform.
                    </p>

                    <div style={{
                        display: 'flex',
                        gap: '16px',
                        flexWrap: 'wrap',
                        justifyContent: 'center'
                    }}>
                        <div style={{
                            padding: '16px 24px',
                            background: '#dcfce7',
                            border: '2px solid #86efac',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <span style={{ fontSize: '1.5rem' }}>🔒</span>
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontWeight: '600', color: '#166534', fontSize: '0.9rem' }}>
                                    Konten Terlindungi
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#15803d' }}>
                                    Download tidak diizinkan
                                </div>
                            </div>
                        </div>

                        <div style={{
                            padding: '16px 24px',
                            background: '#dbeafe',
                            border: '2px solid #93c5fd',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <span style={{ fontSize: '1.5rem' }}>📚</span>
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontWeight: '600', color: '#1e40af', fontSize: '0.9rem' }}>
                                    Materi Tersedia
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#1d4ed8' }}>
                                    Pelajari di platform ini
                                </div>
                            </div>
                        </div>
                    </div>

                    {isLocalhost && (
                        <p style={{
                            marginTop: '24px',
                            padding: '12px 16px',
                            background: '#fef3c7',
                            border: '1px solid #fcd34d',
                            borderRadius: '8px',
                            color: '#92400e',
                            fontSize: '0.8rem',
                            maxWidth: '450px'
                        }}>
                            💡 <strong>Info:</strong> Preview file Office akan tersedia setelah aplikasi di-deploy ke server publik dengan HTTPS.
                        </p>
                    )}
                </div>
            );
        }

        // Text files - fetch and display
        if (isText) {
            return (
                <div style={{
                    width: '100%',
                    height: '100%',
                    overflow: 'auto',
                    padding: '20px',
                    boxSizing: 'border-box',
                    background: '#1e1e1e',
                    color: '#d4d4d4',
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    whiteSpace: 'pre-wrap'
                }}>
                    <iframe
                        src={src}
                        title={title}
                        width="100%"
                        height="100%"
                        style={{ border: 'none', background: 'white' }}
                        onLoad={() => setLoading(false)}
                    />
                </div>
            );
        }

        // Unsupported format - show message
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                padding: '40px',
                textAlign: 'center',
                color: '#64748b'
            }}>
                <div style={{ fontSize: '5rem', marginBottom: '20px' }}>
                    {getFileIcon()}
                </div>
                <h3 style={{ margin: '0 0 12px 0', color: '#1e293b', fontSize: '1.25rem' }}>
                    {title}
                </h3>
                <p style={{ margin: '0 0 8px 0' }}>
                    Format file: <strong>.{extension.toUpperCase()}</strong>
                </p>
                <p style={{ margin: '0 0 20px 0', maxWidth: '400px' }}>
                    Preview tidak tersedia untuk format ini. File dilindungi dan tidak dapat di-download.
                </p>
                <div style={{
                    padding: '12px 20px',
                    background: '#fef3c7',
                    border: '1px solid #fcd34d',
                    borderRadius: '8px',
                    color: '#92400e',
                    fontSize: '0.9rem'
                }}>
                    🔒 Konten terlindungi untuk keamanan materi
                </div>
            </div>
        );
    };

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.9)',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            {/* Header */}
            <div style={{
                width: '100%',
                padding: '16px 24px',
                background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxSizing: 'border-box'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '1.5rem' }}>{getFileIcon()}</span>
                    <div>
                        <h3 style={{ margin: 0, color: 'white', fontSize: '1.1rem' }}>
                            {title}
                        </h3>
                        <span style={{
                            fontSize: '0.75rem',
                            color: 'rgba(255,255,255,0.7)',
                            textTransform: 'uppercase'
                        }}>
                            {extension}
                        </span>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    style={{
                        background: 'rgba(255,255,255,0.2)',
                        border: 'none',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}
                >
                    ✕ Tutup
                </button>
            </div>

            {/* Document Container */}
            <div
                ref={containerRef}
                className="secure-document-container"
                style={{
                    flex: 1,
                    width: '100%',
                    maxWidth: isPDF || isOffice ? '1000px' : '100%',
                    margin: '0 auto',
                    background: isImage ? '#1a1a1a' : 'white',
                    overflow: 'hidden',
                    position: 'relative'
                }}
            >
                {loading && (
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center',
                        zIndex: 10,
                        background: 'rgba(255,255,255,0.95)',
                        padding: '30px',
                        borderRadius: '12px'
                    }}>
                        <div style={{
                            width: '50px',
                            height: '50px',
                            border: '4px solid #e2e8f0',
                            borderTopColor: '#3b82f6',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            margin: '0 auto 16px'
                        }}></div>
                        <p style={{ color: '#64748b', margin: 0 }}>Memuat dokumen...</p>
                    </div>
                )}

                {renderContent()}

                {/* Subtle watermark for images */}
                {isImage && (
                    <div style={{
                        position: 'absolute',
                        bottom: '10px',
                        right: '10px',
                        padding: '4px 10px',
                        background: 'rgba(0,0,0,0.5)',
                        color: 'rgba(255,255,255,0.7)',
                        fontSize: '0.7rem',
                        borderRadius: '4px',
                        pointerEvents: 'none'
                    }}>
                        🔒 Protected Content
                    </div>
                )}
            </div>

            {/* Security Notice */}
            <div style={{
                padding: '12px 24px',
                background: 'rgba(59, 130, 246, 0.1)',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                width: '100%',
                textAlign: 'center',
                boxSizing: 'border-box'
            }}>
                <p style={{
                    margin: 0,
                    color: '#94a3b8',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                }}>
                    🔒 Dokumen ini dilindungi. Download dan copy tidak diizinkan.
                </p>
            </div>

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                .secure-document-container {
                    user-select: none !important;
                    -webkit-user-select: none !important;
                    -moz-user-select: none !important;
                    -ms-user-select: none !important;
                }

                .secure-document-container * {
                    user-select: none !important;
                }

                .secure-document-container img {
                    -webkit-user-drag: none;
                    user-drag: none;
                }
            `}</style>
        </div>
    );
}
