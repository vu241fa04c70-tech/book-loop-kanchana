import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Sparkles,
  ShieldCheck,
  Leaf,
  DollarSign,
  Users,
  Repeat,
  Heart,
  CheckCircle2,
  Lock,
  ArrowRight
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-accent/15 text-accent text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Our Mission & Vision
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Every Book Deserves Another Reader.
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            BookLoop is a student-first circular economy marketplace and reader community. We connect university students and avid readers to buy, sell, exchange, and donate books directly—cutting textbook costs and reducing paper waste.
          </p>
        </div>

        {/* 3 Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Save on Courseware</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Academic textbooks are notoriously overpriced. Students save up to 70% by purchasing or trading directly from peers on their campus.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <Repeat className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Circular Book Exchange</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              No money? No problem. Propose 1-for-1 book swaps with peer readers, negotiate counter-offers, and trade titles seamlessly.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-accent flex items-center justify-center mx-auto mb-4">
              <Leaf className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Sustainable & Eco-Friendly</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Every book reused keeps paper out of landfills and reduces the environmental footprint of heavy book publishing and shipping.
            </p>
          </div>
        </div>

        {/* How BookLoop Works */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 sm:p-12 mb-16">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-8 text-center">
            How The Transaction Lifecycle Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-xl bg-navy text-white text-xs font-black flex items-center justify-center mb-3">
                01
              </div>
              <h4 className="font-bold text-slate-800 text-sm">List in 60 Seconds</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Add book photos, condition, price, ISBN, and campus location. Mark as Sell, Exchange, or Free Donation.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-8 h-8 rounded-xl bg-navy text-white text-xs font-black flex items-center justify-center mb-3">
                02
              </div>
              <h4 className="font-bold text-slate-800 text-sm">Discover & Negotiate</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Search by subject, author, ISBN, or campus. Submit purchase requests or exchange proposals with flexible counter-offers.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-8 h-8 rounded-xl bg-navy text-white text-xs font-black flex items-center justify-center mb-3">
                03
              </div>
              <h4 className="font-bold text-slate-800 text-sm">Coordinate Meeting</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Chat securely on BookLoop to agree on a safe, convenient public campus handover spot (e.g., University Library, Student Union).
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-8 h-8 rounded-xl bg-navy text-white text-xs font-black flex items-center justify-center mb-3">
                04
              </div>
              <h4 className="font-bold text-slate-800 text-sm">Dual-Party Confirmation</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Both buyer and seller confirm physical handover in the app to mark the order complete and exchange verified reviews.
              </p>
            </div>
          </div>
        </div>

        {/* Trust & Safety Standards */}
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl mb-16">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">
              <ShieldCheck className="w-3.5 h-3.5" /> Trust, Safety & Ethics
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-4">
              Our Commitment to Student Safety
            </h2>
            <div className="space-y-4 text-xs sm:text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Safe Campus Handovers:</strong> We encourage transactions in monitored public university locations during daylight hours (campus libraries, student center lounges, coffee shops).
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Zero Platform Commission:</strong> BookLoop does not clip margins or take fees from student pockets. Book exchange between learners should remain accessible and fair.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Moderation & Reporting:</strong> Any inappropriate listings, spam, abusive behavior, or suspicious activity can be reported instantly to the community moderation desk.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-6">
          <h3 className="text-xl font-bold text-slate-900 mb-3">Ready to Join the Movement?</h3>
          <p className="text-xs sm:text-sm text-slate-500 mb-6 max-w-md mx-auto">
            Find the textbooks you need for this semester or give your read books to someone who needs them.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/explore"
              className="bg-accent hover:bg-accent/90 text-white font-bold px-6 py-3 rounded-2xl text-sm shadow-md transition-all inline-flex items-center gap-2"
            >
              Explore Books <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/community"
              className="bg-white hover:bg-slate-100 text-slate-700 font-bold px-6 py-3 rounded-2xl text-sm border border-slate-300 transition-all inline-flex items-center gap-2"
            >
              Join Community <Users className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
