'use client';

import React from 'react';

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton-shimmer ${className}`} />;
}

export function TournamentCardSkeleton() {
  return (
    <div className="arena-card rounded-2xl overflow-hidden p-0 border border-[var(--border-card)] space-y-4">
      {/* Banner */}
      <div className="h-44 w-full skeleton-shimmer" />
      {/* Content */}
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="w-24 h-4 skeleton-shimmer rounded-full" />
          <div className="w-16 h-4 skeleton-shimmer rounded-full" />
        </div>
        <div className="w-3/4 h-6 skeleton-shimmer rounded-lg" />
        <div className="space-y-2">
          <div className="w-full h-3 skeleton-shimmer rounded" />
          <div className="w-5/6 h-3 skeleton-shimmer rounded" />
        </div>
        <div className="grid grid-cols-2 gap-2 pt-2">
          <div className="h-10 skeleton-shimmer rounded-xl" />
          <div className="h-10 skeleton-shimmer rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function RankingRowSkeleton() {
  return (
    <div className="p-4 arena-card border border-[var(--border-card)] flex items-center justify-between gap-4 rounded-xl">
      <div className="flex items-center gap-3.5 flex-1">
        <div className="w-8 h-8 skeleton-shimmer rounded-lg shrink-0" />
        <div className="w-10 h-10 skeleton-shimmer rounded-full shrink-0" />
        <div className="space-y-1.5 flex-1 max-w-xs">
          <div className="w-36 h-4 skeleton-shimmer rounded" />
          <div className="w-24 h-3 skeleton-shimmer rounded" />
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="w-20 h-6 skeleton-shimmer rounded-lg" />
        <div className="w-16 h-6 skeleton-shimmer rounded-lg" />
      </div>
    </div>
  );
}

export function CommunityPostSkeleton() {
  return (
    <div className="arena-card p-6 border border-[var(--border-card)] rounded-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 skeleton-shimmer rounded-full" />
          <div className="space-y-1.5">
            <div className="w-32 h-4 skeleton-shimmer rounded" />
            <div className="w-20 h-3 skeleton-shimmer rounded" />
          </div>
        </div>
        <div className="w-16 h-5 skeleton-shimmer rounded-full" />
      </div>
      <div className="space-y-2 pt-1">
        <div className="w-3/4 h-5 skeleton-shimmer rounded" />
        <div className="w-full h-4 skeleton-shimmer rounded" />
        <div className="w-5/6 h-4 skeleton-shimmer rounded" />
      </div>
      <div className="h-48 w-full skeleton-shimmer rounded-xl" />
      <div className="flex items-center gap-4 pt-2 border-t border-[var(--border-card)]">
        <div className="w-16 h-6 skeleton-shimmer rounded-lg" />
        <div className="w-16 h-6 skeleton-shimmer rounded-lg" />
      </div>
    </div>
  );
}
