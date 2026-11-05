import React from 'react';

export const BookCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-soft overflow-hidden animate-pulse">
    <div className="aspect-[4/3] bg-slate-200"></div>
    <div className="p-4 space-y-3">
      <div className="w-1/3 h-3 bg-slate-200 rounded"></div>
      <div className="w-4/5 h-4 bg-slate-200 rounded"></div>
      <div className="w-1/2 h-3 bg-slate-200 rounded"></div>
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="w-1/4 h-5 bg-slate-200 rounded"></div>
        <div className="w-1/3 h-7 bg-slate-200 rounded-xl"></div>
      </div>
    </div>
  </div>
);

export const BookGridSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <BookCardSkeleton key={i} />
    ))}
  </div>
);
