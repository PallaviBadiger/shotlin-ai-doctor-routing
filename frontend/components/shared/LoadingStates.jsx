"use client";

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-blue-100" />
          <div className="absolute inset-0 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        </div>
        <p className="text-sm text-gray-400 animate-pulse">Loading...</p>
      </div>
    </div>
  );
}

export function Spinner({ size, className }) {
  var s = size || 16;
  return (
    <svg
      className={"animate-spin " + (className || "")}
      style={{ width: s, height: s }}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export function Skeleton({ className }) {
  return (
    <div className={"animate-pulse bg-gray-200 rounded-xl " + (className || "")} />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="card flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl bg-gray-200 animate-pulse flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-6 w-12 bg-gray-200 animate-pulse rounded" />
        <div className="h-3 w-20 bg-gray-200 animate-pulse rounded" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows, cols }) {
  var r = rows || 5;
  var c = cols || 4;
  return (
    <div className="table-container">
      <div className="bg-gray-50 border-b border-gray-100 px-4 py-3.5 flex gap-6">
        {Array.from({ length: c }).map(function(_, i) {
          return <div key={i} className="h-3 flex-1 bg-gray-200 animate-pulse rounded" />;
        })}
      </div>
      {Array.from({ length: r }).map(function(_, i) {
        return (
          <div key={i} className="flex gap-6 px-4 py-3.5 border-b border-gray-50 last:border-0">
            {Array.from({ length: c }).map(function(_, j) {
              return <div key={j} className="h-4 flex-1 bg-gray-200 animate-pulse rounded" />;
            })}
          </div>
        );
      })}
    </div>
  );
}

export function EmptyState({ icon, title, description, action }) {
  var Icon = icon;
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
          <Icon size={24} className="text-gray-400" />
        </div>
      )}
      <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-gray-400 max-w-sm mb-6">{description}</p>
      )}
      {action}
    </div>
  );
}