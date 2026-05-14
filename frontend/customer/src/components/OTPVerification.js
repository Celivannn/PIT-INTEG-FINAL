import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function OTPVerification({ email, onVerified, onBack }) {
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (otpCode.length !== 6) {
      toast.error('Please enter the 6-digit verification code');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(
        'http://localhost:8000/api/auth/verify-otp/',
        { email, otp_code: otpCode },
        { withCredentials: true }
      );
      
      toast.success('Email verified successfully!');
      onVerified(data);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h2 style={{ marginBottom: 16 }}>Verify Your Email</h2>
      <p style={{ color: '#666', marginBottom: 8 }}>
        We've sent a verification code to:
      </p>
      <p style={{ fontWeight: 'bold', marginBottom: 24, color: '#0a1e3d' }}>
        {email}
      </p>
      
      <input
        type="text"
        placeholder="Enter 6-digit code"
        value={otpCode}
        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
        style={{
          width: '100%',
          padding: '14px',
          fontSize: '20px',
          textAlign: 'center',
          letterSpacing: '6px',
          border: '2px solid #e0e0e0',
          borderRadius: '10px',
          marginBottom: 20,
          outline: 'none',
        }}
        autoFocus
      />
      
      <button
        onClick={handleVerify}
        disabled={loading || otpCode.length !== 6}
        style={{
          width: '100%',
          padding: '14px',
          backgroundColor: '#0a1e3d',
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: 'bold',
          marginBottom: 12,
        }}
      >
        {loading ? 'Verifying...' : 'Verify & Continue'}
      </button>
      
      <button
        onClick={onBack}
        style={{
          background: 'none',
          border: 'none',
          color: '#666',
          cursor: 'pointer',
          fontSize: '14px',
        }}
      >
        ← Back to Login
      </button>
    </div>
  );
}