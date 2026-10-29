import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import type { NavItems } from '../types/navigation';
import '../styles/Navbar.scss';

/**
 * Navigation entries are data rather than repeated JSX so that adding,
 * removing, or reordering links stays type-checked in one place.
 */
const NAV_ITEMS: NavItems = [
  { id: 'link-1', label: 'Link 1', to: '' },
  { id: 'link-2', label: 'Link 2', to: '' },
];

function Navbar(): ReactElement {
  return (
    <div className="main-menu">
      <h1>Navigation</h1>
      <ul>
        {NAV_ITEMS.map(({ id, label, to }) => (
          <li key={id}>
            <Link to={to}>{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Navbar;
