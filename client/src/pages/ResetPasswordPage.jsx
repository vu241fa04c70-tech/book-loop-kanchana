import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { BookOpen, Lock, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const ResetPasswordPage = () => {
  const { resetToken } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      showToast('Please enter both password fields', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters long', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.put(`/auth/resetpassword/${resetToken}`, {
        password,
        confirmPassword
      });

      if (res.data.success) {
        setSuccess(true);
        showToast('Password updated successfully! Please sign in.', 'success');
        setTimeout(() => {
          navigate('/login');
        }, 2500);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Password reset token is invalid or has expired';
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
            Create New Password
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Please enter and confirm your new secure account password.
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-soft space-y-5">
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="password"
                    required
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-primary hover:bg-primary-light disabled:opacity-50 text-white font-bold text-sm shadow-soft transition-all flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Updating password...' : 'Update Password & Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="space-y-4 text-center py-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Password Changed!</h3>
              <p className="text-xs text-slate-500">
                Your password has been securely updated. Redirecting you to the sign-in page...
              </p>
              <Link
                to="/login"
                className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-soft"
              >
                Sign In Now
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
