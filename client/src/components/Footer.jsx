import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Heart,
  Shield,
  RefreshCw,
  Sparkles,
  Mail,
  MapPin,
  ExternalLink,
  ArrowRightLeft,
  Gift
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-primary-900 text-slate-300 pt-16 pb-12 border-t border-primary-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-primary-800/80">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-white shadow-soft">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-white font-sans">
                Book<span className="text-accent">Loop</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 font-serif italic max-w-sm">
              "Give Books a Second Life – Read More. Spend Less. Share Knowledge."
            </p>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              BookLoop connects college students and book lovers nationwide to buy, sell, exchange,
              and donate pre-owned textbooks. Reducing education expenses and environmental paper waste.
            </p>
            <div className="flex items-center gap-4 pt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-accent font-semibold">
                <RefreshCw className="w-4 h-4" /> 1,200+ Swaps Completed
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <Shield className="w-4 h-4" /> Verified Student Network
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Marketplace
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/explore" className="hover:text-accent transition-colors">
                  Explore All Books
                </Link>
              </li>
              <li>
                <Link to="/exchange" className="hover:text-accent transition-colors flex items-center gap-1.5">
                  <ArrowRightLeft className="w-3.5 h-3.5 text-purple-400" />
                  <span>Exchange Books</span>
                </Link>
              </li>
              <li>
                <Link to="/donations" className="hover:text-accent transition-colors flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Free Donations</span>
                </Link>
              </li>
              <li>
                <Link to="/add-book" className="hover:text-accent transition-colors">
                  Sell a Book
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-accent transition-colors">
                  My BookLoop Hub
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Popular Subjects
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/explore?category=Programming" className="hover:text-accent transition-colors">
                  Programming
                </Link>
              </li>
              <li>
                <Link to="/explore?category=Computer+Science" className="hover:text-accent transition-colors">
                  Computer Science
                </Link>
              </li>
              <li>
                <Link to="/explore?category=Data+Structures+and+Algorithms" className="hover:text-accent transition-colors">
                  Data Structures
                </Link>
              </li>
              <li>
                <Link to="/explore?category=Artificial+Intelligence" className="hover:text-accent transition-colors">
                  Artificial Intelligence
                </Link>
              </li>
              <li>
                <Link to="/explore?category=Novels" className="hover:text-accent transition-colors">
                  Novels & Fiction
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Help & Policies
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/#how-it-works" className="hover:text-accent transition-colors">
                  How It Works & FAQs
                </Link>
              </li>
              <li>
                <Link to="/donations" className="hover:text-accent transition-colors">
                  Student Donation Drive
                </Link>
              </li>
              <li>
                <a href="mailto:support@bookloop.org" className="hover:text-accent transition-colors">
                  Contact Campus Support
                </a>
              </li>
              <li>
                <span className="text-slate-400 cursor-pointer hover:text-white transition-colors">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="text-slate-400 cursor-pointer hover:text-white transition-colors">
                  Terms of Service
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} BookLoop – Smart Book Exchange & Marketplace Platform. All rights reserved.</p>
          <div className="flex items-center gap-6 text-slate-400">
            <span className="flex items-center gap-1">
              Made with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for university book lovers
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
