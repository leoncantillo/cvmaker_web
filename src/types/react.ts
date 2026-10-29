import type { ReactNode } from 'react';

/** Shared contract for components that wrap arbitrary content. */
export interface WithChildren {
  readonly children: ReactNode;
}
