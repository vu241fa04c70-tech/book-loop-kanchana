import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Mail, ArrowRight, ArrowLeft, CheckCircle2, ShieldAlert } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resetToken, setResetToken] = useState(null); // For local dev simulation display
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      showToast('Please enter your registered email address', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/forgotpassword', { email });
      if (res.data.success) {
        setSubmitted(true);
        if (res.data.resetToken) {
          setResetToken(res.data.resetToken);
        }
        showToast('Password reset instructions generated successfully', 'success');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to request password reset';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-accent shadow-soft">
              <BookOpen className="w-6 h-6" />
            </div>
          </Link>
          <h2 className="text-3xl font-black text-primary tracking-tight">
            Reset Password
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Enter your university or personal email to receive secure recovery instructions.
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-soft space-y-5">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Your Account Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="student@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-primary hover:bg-primary-light disabled:opacity-50 text-white font-bold text-sm shadow-soft transition-all flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Sending link...' : 'Send Password Reset Link'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Check Your Inbox</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                We have generated a password reset link for <strong className="text-slate-800">{email}</strong>. If configured with SMTP, an email was dispatched.
              </p>

              {resetToken && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-left space-y-2">
                  <div className="flex items-center gap-1.5 text-amber-800 text-xs font-bold">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>Quick Local Link:</span>
                  </div>
                  <Link
                    to={`/reset-password/${resetToken}`}
                    className="block text-xs font-bold text-accent break-all underline hover:text-accent-hover"
                  >
                    Click here to reset your password now
                  </Link>
                </div>
              )}

              <button
                onClick={() => setSubmitted(false)}
                className="text-xs font-semibold text-slate-500 hover:text-primary transition-colors"
              >
                Did not receive? Try another email
              </button>
            </div>
          )}

          <div className="text-center text-xs text-slate-500 pt-3 border-t border-slate-100">
            <Link to="/login" className="inline-flex items-center gap-1.5 font-bold text-accent hover:underline">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
