import React from 'react';
import { BookX, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmptyState = ({
  icon: Icon = BookX,
  title = 'No books found',
  description,
  message,
  actionLabel,
  actionText,
  actionLink,
  onAction
}) => {
  const displayDesc = message || description || 'Try another search or explore different categories.';
  const displayActionText = actionText || actionLabel;

  return (
    <div className="flex flex-col items-center justify-center p-10 sm:p-14 text-center bg-white rounded-3xl border border-slate-100 shadow-soft max-w-lg mx-auto my-6 space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-cream-50 border border-cream-200/60 flex items-center justify-center text-accent shadow-xs">
        <Icon className="w-8 h-8" />
      </div>

      <div className="space-y-1 max-w-sm">
        <h3 className="text-xl font-black text-slate-900 tracking-tight">{title}</h3>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{displayDesc}</p>
      </div>

      {displayActionText && (
        <div className="pt-2">
          {onAction ? (
            <button
              onClick={onAction}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-light text-white font-bold text-xs sm:text-sm transition-all shadow-soft"
            >
              <span>{displayActionText}</span>
              <ArrowRight className="w-4 h-4 text-accent" />
            </button>
          ) : actionLink ? (
            <Link
              to={actionLink}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-light text-white font-bold text-xs sm:text-sm transition-all shadow-soft"
            >
              <span>{displayActionText}</span>
              <ArrowRight className="w-4 h-4 text-accent" />
            </Link>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
