import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Filter,
  SlidersHorizontal,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  DollarSign,
  Tag,
  GraduationCap,
  Sparkles,
  ArrowRightLeft,
  Gift,
  X
} from 'lucide-react';
import api from '../services/api';
import BookCard from '../components/BookCard';
import { BookGridSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';

const ExplorePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter States
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [listingType, setListingType] = useState(searchParams.get('listingType') || 'All');
  const [condition, setCondition] = useState(searchParams.get('condition') || 'All');
  const [college, setCollege] = useState(searchParams.get('college') || 'All');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'latest');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  // Data States
  const [books, setBooks] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  const categories = [
    'All',
    'Programming',
    'Computer Science',
    'Data Structures and Algorithms',
    'Artificial Intelligence',
    'Mathematics',
    'Science',
    'Novels',
    'Competitive Examination Preparation'
  ];

  const listingTypes = [
    { label: 'All Types', value: 'All' },
    { label: 'Buy (For Sale)', value: 'Sell' },
    { label: 'Swap (Exchange)', value: 'Exchange' },
    { label: 'Free Donation', value: 'Donate' }
  ];

  const conditions = ['All', 'Like New', 'Good', 'Fair', 'Poor'];

  const colleges = [
    'All',
    'Stanford University',
    'UC Berkeley',
    'Columbia University',
    'MIT',
    'Harvard University',
    'UCLA',
    'University of Washington',
    'NYU'
  ];

  // Fetch books from backend API
  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search.trim()) params.set('search', search.trim());
        if (category !== 'All') params.set('category', category);
        if (listingType !== 'All') params.set('listingType', listingType);
        if (condition !== 'All') params.set('condition', condition);
        if (college !== 'All') params.set('college', college);
        if (minPrice !== '') params.set('minPrice', minPrice);
        if (maxPrice !== '') params.set('maxPrice', maxPrice);
        if (sort) params.set('sort', sort);
        params.set('page', page.toString());
        params.set('limit', '12');

        const res = await api.get(`/books?${params.toString()}`);
        if (res.data.success) {
          setBooks(res.data.books);
          setTotal(res.data.total);
          setTotalPages(res.data.totalPages || 1);
        }
      } catch (err) {
        console.error('Error fetching books in ExplorePage:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();

    // Synchronize query params in URL
    const nextParams = new URLSearchParams();
    if (search.trim()) nextParams.set('search', search.trim());
    if (category !== 'All') nextParams.set('category', category);
    if (listingType !== 'All') nextParams.set('listingType', listingType);
    if (condition !== 'All') nextParams.set('condition', condition);
    if (college !== 'All') nextParams.set('college', college);
    if (minPrice !== '') nextParams.set('minPrice', minPrice);
    if (maxPrice !== '') nextParams.set('maxPrice', maxPrice);
    if (sort !== 'latest') nextParams.set('sort', sort);
    if (page > 1) nextParams.set('page', page.toString());
    setSearchParams(nextParams, { replace: true });
  }, [search, category, listingType, condition, college, minPrice, maxPrice, sort, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('All');
    setListingType('All');
    setCondition('All');
    setCollege('All');
    setMinPrice('');
    setMaxPrice('');
    setSort('latest');
    setPage(1);
  };

  const hasActiveFilters =
    search.trim() !== '' ||
    category !== 'All' ||
    listingType !== 'All' ||
    condition !== 'All' ||
    college !== 'All' ||
    minPrice !== '' ||
    maxPrice !== '' ||
    sort !== 'latest';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-cream-100 via-white to-cream-50 p-6 sm:p-10 rounded-3xl border border-cream-200/60 shadow-xs space-y-4">
        <div className="max-w-2xl">
          <span className="text-xs font-bold text-accent uppercase tracking-widest">
            BookLoop Marketplace
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-primary tracking-tight mt-1">
            Find the Book You Need
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Search thousands of used textbooks, study materials, and novels listed by fellow college students.
          </p>
        </div>

        {/* Large Prominent Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-3xl">
          <div className="relative flex items-center shadow-soft rounded-2xl bg-white border border-slate-200 overflow-hidden focus-within:ring-3 focus-within:ring-accent/30 focus-within:border-accent transition-all">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by title, author, course subject, or ISBN..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-12 pr-24 py-3.5 text-sm sm:text-base text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setPage(1);
                }}
                className="p-1 mr-2 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="mr-2 px-5 py-2 rounded-xl bg-primary hover:bg-primary-light text-white font-bold text-xs sm:text-sm transition-colors shadow-soft"
            >
              Search
            </button>
          </div>
        </form>

        {/* Category Pills (1-Click selection) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setCategory(cat);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                category === cat
                  ? 'bg-primary text-white shadow-soft scale-105'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Controls & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-soft">
        {/* Listing Type Quick Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {listingTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => {
                setListingType(type.value);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                listingType === type.value
                  ? 'bg-accent text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Right Sort & Filter Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Sort:</span>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-accent/40 text-slate-700 cursor-pointer"
            >
              <option value="latest">Latest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="views">Most Viewed</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

          <button
            onClick={() => setShowFiltersPanel(!showFiltersPanel)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
              showFiltersPanel || hasActiveFilters
                ? 'bg-primary text-white border-primary'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>More Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {/* 3. Collapsible Advanced Filters Panel */}
      {showFiltersPanel && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-soft-lg space-y-5 animate-in slide-in-from-top-3 duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Filter className="w-4 h-4 text-accent" />
              <span>Refine Your Search</span>
            </h3>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="text-xs font-bold text-rose-500 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset All Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Condition Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Book Condition</label>
              <select
                value={condition}
                onChange={(e) => {
                  setCondition(e.target.value);
                  setPage(1);
                }}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/40"
              >
                {conditions.map((c) => (
                  <option key={c} value={c}>{c === 'All' ? 'All Conditions' : c}</option>
                ))}
              </select>
            </div>

            {/* College Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Campus / College</label>
              <select
                value={college}
                onChange={(e) => {
                  setCollege(e.target.value);
                  setPage(1);
                }}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/40"
              >
                {colleges.map((col) => (
                  <option key={col} value={col}>{col === 'All' ? 'All Campuses' : col}</option>
                ))}
              </select>
            </div>

            {/* Price Range Filter */}
            <div className="space-y-1.5 lg:col-span-2">
              <label className="text-xs font-bold text-slate-700">Price Range ($)</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  placeholder="Min ($)"
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value);
                    setPage(1);
                  }}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/40"
                />
                <span className="text-slate-400 font-bold">-</span>
                <input
                  type="number"
                  placeholder="Max ($)"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value);
                    setPage(1);
                  }}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/40"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Active Results Count Bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
        <span>
          Showing <strong className="text-slate-800">{books.length}</strong> of{' '}
          <strong className="text-slate-800">{total}</strong> books available
        </span>
        {hasActiveFilters && (
          <button
            onClick={handleResetFilters}
            className="text-accent font-bold hover:underline"
          >
            Clear Active Filters
          </button>
        )}
      </div>

      {/* 5. Books Grid */}
      {loading ? (
        <BookGridSkeleton count={8} />
      ) : books.length === 0 ? (
        <EmptyState
          title="Oops! No books found"
          message="Try another search keyword, reset your price filter, or explore different categories."
          actionText={hasActiveFilters ? 'Clear All Filters' : 'Add Your First Book'}
          onAction={hasActiveFilters ? handleResetFilters : undefined}
          actionLink={hasActiveFilters ? undefined : '/add-book'}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {books.map((book) => (
            <BookCard key={book._id} book={book} />
          ))}
        </div>
      )}

      {/* 6. Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {[...Array(totalPages)].map((_, i) => {
            const pageNum = i + 1;
            return (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${
                  page === pageNum
                    ? 'bg-primary text-white shadow-soft scale-105'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ExplorePage;
