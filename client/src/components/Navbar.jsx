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
  Sparkles,
  ArrowRightLeft,
  Home
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
      setMobileMenuOpen(false);
    }
  };

  const handleQuickDemoLogin = async (role) => {
    if (role === 'student') {
      await login('alex@student.edu', 'password123');
    } else if (role === 'admin') {
      await login('admin@bookloop.org', 'password123');
    }
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Explore Books', path: '/explore' },
    { label: 'Exchange Books', path: '/exchange', badge: 'Swap' },
    { label: 'Free Donations', path: '/donations', badge: 'Free' },
    { label: 'How It Works', path: '/#how-it-works' }
  ];

  const handleNavClick = (path) => {
    setMobileMenuOpen(false);
    if (path === '/#how-it-works') {
      if (location.pathname === '/') {
        const el = document.getElementById('how-it-works');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate('/#how-it-works');
      }
    }
  };

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
              <span className="text-2xl font-black tracking-tight text-primary flex items-center gap-1 font-sans">
                Book<span className="text-accent">Loop</span>
              </span>
              <p className="hidden sm:block text-[10px] uppercase font-bold tracking-widest text-slate-500">
                Give Books a Second Life
              </p>
            </div>
          </Link>

          {/* Quick Search Bar (desktop) */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex items-center relative flex-1 max-w-xs lg:max-w-sm mx-6"
          >
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search books, authors, courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs lg:text-sm bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all placeholder:text-slate-400"
            />
          </form>

          {/* Navigation Links (desktop) */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-6">
            {navLinks.map((link) => {
              const isActive =
                link.path === '/'
                  ? location.pathname === '/' && !location.hash
                  : link.path === '/#how-it-works'
                  ? location.hash === '#how-it-works'
                  : location.pathname.startsWith(link.path);

              return (
                <Link
                  key={link.label}
                  to={link.path}
                  onClick={() => handleNavClick(link.path)}
                  className={`text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                    isActive ? 'text-primary font-bold' : 'text-slate-600 hover:text-primary'
                  }`}
                >
                  {link.label}
                  {link.badge && (
                    <span
                      className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                        link.badge === 'Free'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Sell a Book CTA */}
            <Link
              to="/add-book"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs lg:text-sm font-bold shadow-soft hover:shadow-soft-lg transition-all duration-200"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Sell a Book</span>
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-2 relative">
                {/* Wishlist Link */}
                <Link
                  to="/dashboard?tab=wishlist"
                  className="p-2.5 rounded-xl text-slate-600 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                  title="Books I Want (Wishlist)"
                >
                  <Heart className="w-5 h-5" />
                </Link>

                {/* Messages Link */}
                <Link
                  to="/messages"
                  className="p-2.5 rounded-xl text-slate-600 hover:text-primary hover:bg-primary-50 transition-colors relative"
                  title="Messages & Chat"
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
                      src={
                        user?.profileImage ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
                      }
                      alt={user?.name}
                      className="w-7 h-7 rounded-full object-cover border border-white"
                    />
                    <span className="text-xs font-bold text-slate-800 max-w-[80px] truncate">
                      {user?.name?.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user?.college}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-md bg-primary-100 text-primary uppercase">
                          {user?.role}
                        </span>
                      </div>

                      <Link
                        to="/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <span>My BookLoop</span>
                      </Link>

                      <Link
                        to="/dashboard?tab=my-books"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <BookOpen className="w-4 h-4 text-slate-400" />
                        <span>My Listed Books</span>
                      </Link>

                      <Link
                        to="/dashboard?tab=wishlist"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <Heart className="w-4 h-4 text-rose-500" />
                        <span>Books I Want</span>
                      </Link>

                      <Link
                        to="/dashboard?tab=exchanges"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <ArrowRightLeft className="w-4 h-4 text-purple-600" />
                        <span>Exchange Requests</span>
                      </Link>

                      <Link
                        to="/messages"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <MessageSquare className="w-4 h-4 text-slate-400" />
                        <span>Messages</span>
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-amber-700 bg-amber-50/50 hover:bg-amber-50"
                        >
                          <Shield className="w-4 h-4 text-amber-600" />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}

                      <div className="border-t border-slate-100 my-1"></div>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
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
                  className="px-3 py-1.5 text-xs lg:text-sm font-semibold text-slate-700 hover:text-primary transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary-light text-white text-xs lg:text-sm font-semibold transition-colors shadow-soft"
                >
                  Sign Up
                </Link>

                {/* 1-Click Instant Demo Login Menu */}
                <div className="relative group">
                  <button
                    type="button"
                    className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold flex items-center gap-1 transition-colors"
                    title="1-Click Demo Login"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-accent" />
                    <span className="hidden xl:inline text-[11px]">Demo</span>
                  </button>
                  <div className="hidden group-hover:block absolute right-0 mt-1 w-48 bg-white border border-slate-200 shadow-xl rounded-xl p-2 z-50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase px-2 mb-1">
                      1-Click Instant Login
                    </p>
                    <button
                      onClick={() => handleQuickDemoLogin('student')}
                      className="w-full text-left px-2 py-1.5 text-xs rounded-lg hover:bg-slate-50 text-slate-700 font-medium"
                    >
                      Login as Student (Alex)
                    </button>
                    <button
                      onClick={() => handleQuickDemoLogin('admin')}
                      className="w-full text-left px-2 py-1.5 text-xs rounded-lg hover:bg-amber-50 text-amber-800 font-medium"
                    >
                      Login as Admin
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex lg:hidden items-center gap-2">
            <Link
              to="/add-book"
              className="p-2 rounded-xl bg-accent text-white"
              title="Sell a Book"
            >
              <PlusCircle className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-4 pt-4 pb-6 space-y-4 shadow-xl animate-in slide-in-from-top-4 duration-200">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, author, or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            />
          </form>

          <nav className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.path}
                onClick={() => handleNavClick(link.path)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      link.badge === 'Free'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
            <Link
              to="/add-book"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-accent hover:bg-accent/10"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Sell or Swap a Book</span>
            </Link>
          </nav>

          <div className="pt-3 border-t border-slate-100">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 px-2 py-1">
                  <img
                    src={user?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                    alt={user?.name}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                    <p className="text-xs text-slate-500">{user?.college}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 text-center text-xs font-bold bg-slate-50 rounded-xl text-slate-700"
                  >
                    My BookLoop
                  </Link>
                  <Link
                    to="/messages"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 text-center text-xs font-bold bg-slate-50 rounded-xl text-slate-700"
                  >
                    Messages
                  </Link>
                </div>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full mt-2 py-2 text-center text-xs font-bold text-rose-600 bg-rose-50 rounded-xl"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 text-center text-sm font-bold border border-slate-200 rounded-xl text-slate-800"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 text-center text-sm font-bold bg-primary text-white rounded-xl shadow-soft"
                  >
                    Sign Up
                  </Link>
                </div>

                <button
                  onClick={() => handleQuickDemoLogin('student')}
                  className="w-full py-2 text-xs font-bold text-accent bg-accent/10 rounded-xl flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Instant Student Demo Login</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
