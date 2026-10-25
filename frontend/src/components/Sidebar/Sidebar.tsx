import { X } from 'lucide-react';
import { Logo } from '../Logo/Logo';
import { primaryNav, utilityNav, type NavId, type NavItem } from './navItems';
import './Sidebar.css';

interface SidebarProps {
  activeId: NavId;
  onNavigate: (id: NavId) => void;
  /** Provided when the sidebar is shown as a drawer on small screens. */
  onClose?: () => void;
}

interface NavLinkProps {
  item: NavItem;
  active: boolean;
  onNavigate: (id: NavId) => void;
}

function NavLink({ item, active, onNavigate }: NavLinkProps) {
  const Icon = item.icon;
  return (
    <a
      className="nav-link"
      href={`#${item.id}`}
      aria-current={active ? 'page' : undefined}
      onClick={(event) => {
        event.preventDefault();
        onNavigate(item.id);
      }}
    >
      <span className="nav-link__icon" aria-hidden="true">
        <Icon size={18} strokeWidth={1.75} />
      </span>
      <span className="nav-link__label">{item.label}</span>
    </a>
  );
}

export function Sidebar({ activeId, onNavigate, onClose }: SidebarProps) {
  return (
    <div className="sidebar">
      <div className="sidebar__brand">
        <Logo variant="full" />
        <button
          type="button"
          className="icon-button sidebar__close"
          aria-label="Close navigation"
          onClick={onClose}
        >
          <X size={20} strokeWidth={1.75} aria-hidden="true" />
        </button>
      </div>

      <nav aria-label="Primary">
        <ul className="sidebar__list">
          {primaryNav.map((item) => (
            <li key={item.id}>
              <NavLink item={item} active={item.id === activeId} onNavigate={onNavigate} />
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar__footer">
        <div className="sidebar__sample">
          <strong>Sample data</strong>
          <span>Figures shown are examples, not from a bank account.</span>
        </div>
        <nav aria-label="Settings">
          <ul className="sidebar__list">
            {utilityNav.map((item) => (
              <li key={item.id}>
                <NavLink item={item} active={item.id === activeId} onNavigate={onNavigate} />
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
