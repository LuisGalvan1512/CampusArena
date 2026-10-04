'use client';

import dynamic from 'next/dynamic';

export const CommandPaletteLazy = dynamic(
  () => import('@/components/CommandPalette').then((m) => m.CommandPalette),
  { ssr: false }
);
