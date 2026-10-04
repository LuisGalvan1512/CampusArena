'use client';

import React from 'react';
import { getCompetitorNameStyle, type ProfileCustomizationState } from '@/lib/profile-customization';

interface CompetitorNameProps {
  userId?: string;
  name: string;
  className?: string;
  customization?: Partial<ProfileCustomizationState> | null;
}

/**
 * Universal Competitor Name Component
 * Applies the user's customized font family and custom color consistently
 * across rankings, forums, leaderboards and profile cards.
 */
export function CompetitorName({
  userId,
  name,
  className = '',
  customization,
}: CompetitorNameProps) {
  const { className: fontAndColorClass, style } = getCompetitorNameStyle(userId, customization);

  return (
    <span className={`inline-block transition-all ${fontAndColorClass} ${className}`.trim()} style={style}>
      {name}
    </span>
  );
}
