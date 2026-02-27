/**
 * OTPVerification.tsx — Phone OTP Verification Component
 * Premium Glassy UI matching Signup.tsx style
 */

import React, { useState, useEffect, useRef } from 'react';
import { Phone, CheckCircle, X, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const OTP_STYLES = `
/* Keyframes for OTP animations */
@keyframes otpFadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes otpPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
@keyframes otpShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-8px); }
  75% { transform: translateX(8px); }
}

.otp-fade-in { animation: otpFadeIn 0.4s ease-out; }
.otp-pulse { animation: otpPulse 1.5s ease-in-out infinite; }
.otp-shake { animation: otpShake 0.4s ease-in-out; }

.otp-input {
  width: 3rem;
  height: 3.5rem;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 700;
  border: 2px solid #d1fae5;
  border-radius: 0.75rem;
  background: #ffffff;
  color: #064e3b;
  transition: all 0.2s ease;
}

.otp-input:focus {
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16,185,129,0.2);
  outline: none;
  background: #f0fdf4;
}

.otp-input.filled {
  border-color: #059669;
  background: #d1fae5;
}

.otp-input.error {
  border-color: #ef4444;
  background: #fee2e2;
}
`;

interface OTPVerificationProps {
  phoneNumber: string;
  onVerified: () => void;
  onCancel: () => void;
  onResendOTP: () => Promise<void>;
}

const OTPVerification: React.FC<OTPVerificationProps> = ({
  phoneNumber,
  onVerified,
  onCancel,
  onResendOTP
}) => {
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    // Countdown timer for resend
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only digits

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Take last digit only
    setOtp(newOtp);
    setError(null);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all filled
    if (newOtp.every(digit => digit) && index === 5) {
      verifyOTP(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];

    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    if (pastedData.length === 6) {
      verifyOTP(pastedData);
    } else {
      inputRefs.current[pastedData.length]?.focus();
    }
  };

  const verifyOTP = async (otpCode: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { phone: phoneNumber, otp: otpCode }
      });

      if (error) throw error;

      if (data?.verified) {
        onVerified();
      } else {
        setError(data?.error || 'Invalid OTP. Please try again.');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setLoading(true);
    setError(null);

    try {
      await onResendOTP();
      setResendTimer(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{OTP_STYLES}</style>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onCancel} />

        {/* Modal */}
        <div className="otp-fade-in relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl z-10"
             style={{
               border: '1.5px solid rgba(52,211,153,0.3)',
               boxShadow: '0 24px 64px rgba(0,0,0,0.22)'
             }}>

          {/* Close button */}
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full mb-4">
              <Phone className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
              Verify Phone Number
            </h2>
            <p className="text-sm text-gray-600">
              Enter the 6-digit code sent to
            </p>
            <p className="text-sm font-bold text-emerald-700 mt-1">
              {phoneNumber}
            </p>
          </div>

          {/* OTP Input */}
          <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                className={`otp-input ${digit ? 'filled' : ''} ${error ? 'error otp-shake' : ''}`}
                disabled={loading}
              />
            ))}
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              {error}
            </div>
          )}

          {/* Loading indicator */}
          {loading && (
            <div className="mb-4 flex items-center justify-center gap-2 text-sm text-emerald-700">
              <div className="w-4 h-4 rounded-full border-2 border-emerald-700 border-t-transparent animate-spin" />
              Verifying...
            </div>
          )}

          {/* Resend OTP */}
          <div className="text-center mb-6">
            {canResend ? (
              <button
                onClick={handleResend}
                disabled={loading}
                className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4" />
                Resend OTP
              </button>
            ) : (
              <p className="text-sm text-gray-600">
                Resend OTP in{' '}
                <span className="font-bold text-emerald-700 otp-pulse">
                  {resendTimer}s
                </span>
              </p>
            )}
          </div>

          {/* Manual verify button */}
          <button
            onClick={() => verifyOTP(otp.join(''))}
            disabled={loading || otp.some(d => !d)}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-extrabold text-base shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            Verify & Continue
          </button>

          {/* Helper text */}
          <p className="text-xs text-gray-500 text-center mt-4">
            Didn't receive the code? Check your messages or try resending.
          </p>
        </div>
      </div>
    </>
  );
};

export default OTPVerification;
