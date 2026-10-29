/**
 * A single entry rendered by the primary navigation.
 *
 * The `id` is intentionally independent from the route (`to`) so links can
 * remain stable list keys even when their destination changes.
 */
export interface NavItem {
  /** Stable identifier used as the React list key. */
  readonly id: string;
  /** Human-readable label shown to the user. */
  readonly label: string;
  /** Destination understood by `react-router-dom`. */
  readonly to: string;
}

/** Immutable collection of navigation entries. */
export type NavItems = readonly NavItem[];
