import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Heart, Shield, RefreshCw, Sparkles, Mail, MapPin, ExternalLink } from 'lucide-react';

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
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/explore" className="hover:text-accent transition-colors">
                  Explore All Books
                </Link>
              </li>
              <li>
                <Link to="/donations" className="hover:text-accent transition-colors flex items-center gap-1.5">
                  Free Book Donations <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-bold">Free</span>
                </Link>
              </li>
              <li>
                <Link to="/add-book" className="hover:text-accent transition-colors">
                  List Your Book
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-accent transition-colors">
                  Student Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Top Categories
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/explore?category=Computer+Science" className="hover:text-accent transition-colors">
                  Computer Science & IT
                </Link>
              </li>
              <li>
                <Link to="/explore?category=Engineering" className="hover:text-accent transition-colors">
                  Engineering Sciences
                </Link>
              </li>
              <li>
                <Link to="/explore?category=Medicine+%26+Health" className="hover:text-accent transition-colors">
                  Medicine & Health
                </Link>
              </li>
              <li>
                <Link to="/explore?category=Business+%26+Economics" className="hover:text-accent transition-colors">
                  Business & Economics
                </Link>
              </li>
              <li>
                <Link to="/explore?category=Mathematics" className="hover:text-accent transition-colors">
                  Mathematics & Stats
                </Link>
              </li>
            </ul>
          </div>

          {/* Campus Safety & Trust */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Campus Swaps
            </h4>
            <div className="bg-primary-800/40 border border-primary-800 p-4 rounded-xl space-y-2 text-xs text-slate-300">
              <p className="font-semibold text-white flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-accent" /> Safe Campus Meetups
              </p>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Always meet fellow students at well-lit campus landmarks like the university library,
                student center, or campus cafe.
              </p>
              <div className="pt-2 border-t border-primary-700/50">
                <span className="text-[11px] text-slate-400">Ready to contribute?</span>
                <Link to="/donations" className="block text-accent font-semibold hover:underline mt-0.5">
                  Donate a spare textbook →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} BookLoop Platform. All rights reserved. Built with React, Node, Express & MongoDB.</p>
          <div className="flex items-center gap-6 text-slate-400">
            <span className="flex items-center gap-1">
              Made with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for university students
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
