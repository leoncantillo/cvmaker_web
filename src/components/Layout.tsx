import type { ReactElement } from 'react';
import type { WithChildren } from '../types/react';
import '../styles/Layout.scss';

function Layout({ children }: WithChildren): ReactElement {
  return <div className="layout-root">{children}</div>;
}

export default Layout;
