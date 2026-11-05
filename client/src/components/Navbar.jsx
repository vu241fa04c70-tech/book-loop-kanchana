import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  Search,
  PlusCircle,
  Heart,
  MessageSquare,
  User,
  Shield,
  LogOut,
  Menu,
  X,
  Gift,
  ChevronDown,
  Sparkles
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout, login } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleQuickDemoLogin = async (role) => {
    if (role === 'student') {
      await login('alex@student.edu', 'password123');
    } else if (role === 'admin') {
      await login('admin@bookloop.org', 'password123');
    }
    setUserDropdownOpen(false);
  };

  const navLinks = [
    { label: 'Explore Books', path: '/explore' },
    { label: 'Free Donations', path: '/donations', badge: 'Free' },
    { label: 'How It Works', path: '/#how-it-works' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary to-primary-light flex items-center justify-center text-white shadow-soft group-hover:scale-105 transition-transform duration-200">
              <BookOpen className="w-6 h-6 text-accent" />
            </div>
            <div>
              <span className="text-2xl font-extrabold tracking-tight text-primary flex items-center gap-1 font-sans">
                Book<span className="text-accent">Loop</span>
              </span>
              <p className="hidden sm:block text-[10px] uppercase font-bold tracking-widest text-slate-600">
                Student Book Exchange
              </p>
            </div>
          </Link>

          {/* Search bar (desktop) */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex items-center relative flex-1 max-w-md mx-8"
          >
            <Search className="w-4 h-4 text-slate-600 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by title, author, course, or ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all placeholder:text-slate-600"
            />
          </form>

          {/* Navigation Links (desktop) */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  location.pathname === link.path
                    ? 'text-primary'
                    : 'text-slate-600 hover:text-primary'
                }`}
              >
                {link.label}
                {link.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold tracking-wide rounded-full bg-emerald-100 text-emerald-700">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            {/* List Your Book CTA */}
            <Link
              to="/add-book"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-bold shadow-soft hover:shadow-soft-lg transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>List a Book</span>
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-2 relative">
                {/* Wishlist Link */}
                <Link
                  to="/dashboard?tab=wishlist"
                  className="p-2.5 rounded-xl text-slate-600 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                  title="My Saved Books"
                >
                  <Heart className="w-5 h-5" />
                </Link>

                {/* Messages Link */}
                <Link
                  to="/messages"
                  className="p-2.5 rounded-xl text-slate-600 hover:text-primary hover:bg-primary-50 transition-colors relative"
                  title="Messages & Swaps"
                >
                  <MessageSquare className="w-5 h-5" />
                </Link>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-slate-200 hover:border-slate-300 bg-slate-50 transition-all text-left"
                  >
                    <img
                      src={user?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                      alt={user?.name}
                      className="w-7 h-7 rounded-full object-cover border border-white"
                    />
                    <span className="text-xs font-bold text-slate-700 max-w-[80px] truncate">
                      {user?.name?.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                        <p className="text-[11px] text-slate-600 truncate">{user?.college}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-md bg-primary-100 text-primary uppercase">
                          {user?.role}
                        </span>
                      </div>

                      <Link
                        to="/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <User className="w-4 h-4 text-slate-600" />
                        <span>My Dashboard</span>
                      </Link>

                      <Link
                        to="/dashboard?tab=my-listings"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <BookOpen className="w-4 h-4 text-slate-600" />
                        <span>My Listed Books</span>
                      </Link>

                      <Link
                        to="/messages"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <MessageSquare className="w-4 h-4 text-slate-600" />
                        <span>Chat & Inquiries</span>
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-amber-700 bg-amber-50/50 hover:bg-amber-50 font-medium"
                        >
                          <Shield className="w-4 h-4 text-amber-600" />
                          <span>Admin Portal</span>
                        </Link>
                      )}

                      <div className="border-t border-slate-100 my-1"></div>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-primary transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-light text-white text-sm font-semibold transition-colors"
                >
                  Register
                </Link>

                {/* 1-Click Demo Login Helper */}
                <div className="relative group">
                  <button
                    type="button"
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold flex items-center gap-1 transition-colors"
                    title="Quick Demo Login for test"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-accent" />
                    <span className="hidden xl:inline">Demo</span>
                  </button>
                  <div className="hidden group-hover:block absolute right-0 mt-1 w-48 bg-white border border-slate-200 shadow-xl rounded-xl p-2 z-50">
                    <p className="text-[10px] font-bold text-slate-600 uppercase px-2 mb-1">
                      1-Click Instant Login
                    </p>
                    <button
                      onClick={() => handleQuickDemoLogin('student')}
                      className="w-full text-left px-2 py-1.5 text-xs rounded-lg hover:bg-slate-50 text-slate-700 font-medium"
                    >
                      🎓 Student (Alex)
                    </button>
                    <button
                      onClick={() => handleQuickDemoLogin('admin')}
                      className="w-full text-left px-2 py-1.5 text-xs rounded-lg hover:bg-amber-50 text-amber-800 font-medium"
                    >
                      🛡️ Administrator
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative mb-3">
            <Search className="w-4 h-4 text-slate-600 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            />
          </form>

          <Link
            to="/explore"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-semibold text-slate-700 hover:bg-slate-50 rounded-xl"
          >
            Explore Books
          </Link>
          <Link
            to="/donations"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between px-3 py-2 text-base font-semibold text-slate-700 hover:bg-slate-50 rounded-xl"
          >
            <span>Free Book Donations</span>
            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">Free</span>
          </Link>
          <Link
            to="/add-book"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-bold text-accent hover:bg-amber-50 rounded-xl"
          >
            + List a New Book
          </Link>

          {isAuthenticated ? (
            <>
              <div className="border-t border-slate-100 pt-3">
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-base font-semibold text-slate-700 hover:bg-slate-50 rounded-xl"
                >
                  My Dashboard
                </Link>
                <Link
                  to="/messages"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-base font-semibold text-slate-700 hover:bg-slate-50 rounded-xl"
                >
                  Messages & Swaps
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-base font-semibold text-amber-700 bg-amber-50 rounded-xl"
                  >
                    Admin Portal
                  </Link>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-3 py-2 text-base font-semibold text-rose-600 hover:bg-rose-50 rounded-xl"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2.5 rounded-xl bg-primary text-white text-sm font-bold"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
