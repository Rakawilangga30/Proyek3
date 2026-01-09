import { useState } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { Loader2, CreditCard } from 'lucide-react';

/**
 * PurchaseButton Component
 * 
 * A reusable button for purchasing sessions via Midtrans Snap
 */
export default function PurchaseButton({
  sessionId,
  sessionName,
  price,
  onSuccess,
  onPending,
  onError,
  disabled = false,
  className = ''
}) {
  const [loading, setLoading] = useState(false);

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handlePurchase = async () => {
    if (loading || disabled) return;

    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Silakan login terlebih dahulu untuk membeli');
      window.location.href = '/login';
      return;
    }

    setLoading(true);

    try {
      // Get payment token from backend
      const response = await api.post('/user/payment/token', {
        session_id: sessionId
      });

      const { token: snapToken, order_id } = response.data;

      // Check if Snap is available
      if (!window.snap) {
        throw new Error('Midtrans Snap tidak tersedia. Silakan refresh halaman.');
      }

      // Open Snap payment popup
      window.snap.pay(snapToken, {
        onSuccess: async function (result) {
          console.log('Payment success:', result);

          // Simulate success for sandbox
          try {
            await api.post('/sandbox/simulate-payment', { order_id: order_id });
          } catch (e) {
            console.log('Sandbox simulate:', e);
          }

          setLoading(false);
          if (onSuccess) {
            onSuccess(result, order_id);
          } else {
            toast.success('Pembayaran berhasil!');
            window.location.reload();
          }
        },
        onPending: function (result) {
          console.log('Payment pending:', result);
          setLoading(false);
          if (onPending) {
            onPending(result, order_id);
          } else {
            toast('Pembayaran menunggu verifikasi.', { icon: '⏳' });
          }
        },
        onError: function (result) {
          console.error('Payment error:', result);
          setLoading(false);
          if (onError) {
            onError(result, order_id);
          } else {
            toast.error('Pembayaran gagal. Silakan coba lagi.');
          }
        },
        onClose: async function () {
          console.log('Payment popup closed');
          setLoading(false);

          // For sandbox: try to simulate success when popup is closed
          try {
            // Optional: check status or simulate
          } catch (e) {
            console.log(e);
          }
        }
      });

    } catch (error) {
      console.error('Error getting payment token:', error);
      setLoading(false);

      const errorData = error.response?.data;

      // Detailed logging for debugging "Failed to create purchase record"
      console.log("Full Error Data:", JSON.stringify(errorData, null, 2));

      // Check if profile is incomplete
      if (errorData?.profile_incomplete) {
        const missingFields = errorData.missing_fields?.join(', ') || '';
        const message = `${errorData.error}\n\nField: ${missingFields}`;

        toast.error(message, { duration: 5000 });

        // redirect after delay
        setTimeout(() => {
          window.location.href = '/dashboard/profile';
        }, 2000);
        return;
      }

      const errorMessage = errorData?.error || error.message || 'Gagal memproses pembayaran';

      if (onError) {
        onError({ message: errorMessage });
      } else {
        toast.error(errorMessage);
      }
    }
  };

  return (
    <button
      className={`btn ${className} ${loading ? 'opacity-80 cursor-wait' : ''}`}
      onClick={handlePurchase}
      disabled={loading || disabled}
      style={{
        background: "linear-gradient(135deg, #f59e0b, #d97706)",
        color: "white",
        border: "none",
        fontWeight: 600,
        boxShadow: "0 4px 6px -1px rgba(245, 158, 11, 0.3)"
      }}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <Loader2 className="animate-spin" size={18} />
          Memproses...
        </span>
      ) : (
        <span className="flex flex-col items-center leading-tight">
          <span className="text-lg font-bold">{formatPrice(price)}</span>
          <span className="text-xs font-medium opacity-90 flex items-center gap-1">
            <CreditCard size={12} /> Beli Sekarang
          </span>
        </span>
      )}
    </button>
  );
}
