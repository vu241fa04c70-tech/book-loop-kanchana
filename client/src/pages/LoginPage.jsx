import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Mail, Lock, ArrowRight, Sparkles, Shield, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email and password', 'error');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate(from, { replace: true });
    }
  };

  const handleDemoLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setLoading(true);
    const result = await login(demoEmail, demoPassword);
    setLoading(false);
    if (result.success) {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-accent shadow-soft">
              <BookOpen className="w-6 h-6" />
            </div>
          </Link>
          <h2 className="text-3xl font-black text-primary tracking-tight">
            Welcome to BookLoop
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Sign in to manage your campus book swaps and marketplace inquiries.
          </p>
        </div>

        {/* Demo Fast Login Cards */}
        <div className="bg-cream-100/70 border border-cream-200 p-4 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-accent" /> 1-Click Demo Accounts
            </span>
            <span className="text-[10px] font-semibold text-amber-800 bg-white/80 px-2 py-0.5 rounded-full">
              Instant Fill
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleDemoLogin('alex@student.edu', 'password123')}
              className="px-3 py-2 bg-white hover:bg-slate-50 border border-amber-200/80 rounded-xl text-left text-xs text-slate-700 transition-colors font-medium flex items-center gap-2"
            >
              <User className="w-3.5 h-3.5 text-primary" />
              <div>
                <p className="font-bold text-[11px] text-slate-900">Student</p>
                <p className="text-[10px] text-slate-400">alex@student.edu</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('admin@bookloop.org', 'password123')}
              className="px-3 py-2 bg-white hover:bg-slate-50 border border-amber-200/80 rounded-xl text-left text-xs text-slate-700 transition-colors font-medium flex items-center gap-2"
            >
              <Shield className="w-3.5 h-3.5 text-amber-600" />
              <div>
                <p className="font-bold text-[11px] text-amber-900">Administrator</p>
                <p className="text-[10px] text-slate-400">admin@bookloop.org</p>
              </div>
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-soft space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
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

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-bold text-accent hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-primary hover:bg-primary-light disabled:opacity-50 text-white font-bold text-sm shadow-soft transition-all flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Signing in...' : 'Sign In to BookLoop'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-xs text-slate-500 pt-3 border-t border-slate-100">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-accent hover:underline">
              Create a free student account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
