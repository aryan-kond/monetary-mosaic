import { Info, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';
import { Logo } from '../Logo/Logo';
import { primaryNav, utilityNav, type NavId, type NavItem } from './navItems';
import './Sidebar.css';

const SAMPLE_NOTE = 'Figures shown are examples, not from a bank account.';

interface SidebarProps {
  activeId: NavId;
  onNavigate: (id: NavId) => void;
  /** Provided when the sidebar is shown as a drawer on small screens. */
  onClose?: () => void;
  /** Icon-only rail. Only ever true on desktop. */
  collapsed?: boolean;
  /** Provided on desktop, where the sidebar can be collapsed. */
  onToggleCollapsed?: () => void;
}

interface NavLinkProps {
  item: NavItem;
  active: boolean;
  onNavigate: (id: NavId) => void;
}

/**
 * The label always stays in the page, so screen readers keep reading it. When the sidebar is
 * collapsed, CSS shrinks and fades it, and shows the tooltip on hover or focus.
 */
function NavLink({ item, active, onNavigate }: NavLinkProps) {
  const Icon = item.icon;
  return (
    <a
      className="nav-link rail-tip"
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
      <span className="rail-tip__text" aria-hidden="true">
        {item.label}
      </span>
    </a>
  );
}

export function Sidebar({
  activeId,
  onNavigate,
  onClose,
  collapsed = false,
  onToggleCollapsed,
}: SidebarProps) {
  const toggleLabel = collapsed ? 'Expand sidebar' : 'Collapse sidebar';
  const ToggleIcon = collapsed ? PanelLeftOpen : PanelLeftClose;

  return (
    <div className={collapsed ? 'sidebar sidebar--collapsed' : 'sidebar'}>
      <div className="sidebar__brand">
        {/* Both logos stay in the page and cross-fade. Only the visible one is announced. */}
        <div className="sidebar__logos">
          <span className="sidebar__logo sidebar__logo--full" aria-hidden={collapsed}>
            <Logo variant="full" />
          </span>
          <span className="sidebar__logo sidebar__logo--mark" aria-hidden={!collapsed}>
            <Logo variant="mark" />
          </span>
        </div>
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
        {/* The full note and the icon both stay in the page, so one can fade out as the other
            fades in. inert keeps the hidden one out of the tab order and away from screen readers. */}
        <div className="sidebar__sample-area">
          <div className="sidebar__sample-slot" inert={collapsed}>
            <div className="sidebar__sample-clip">
              <div className="sidebar__sample">
                <strong>Sample data</strong>
                <span>{SAMPLE_NOTE}</span>
              </div>
            </div>
          </div>
          <div className="sidebar__sample-rail-slot" inert={!collapsed}>
            <div className="sidebar__sample-rail-clip">
              <div className="sidebar__sample-rail rail-tip" role="note" tabIndex={0}>
                <Info size={18} strokeWidth={1.75} aria-hidden="true" />
                <span className="visually-hidden">Sample data. {SAMPLE_NOTE}</span>
                <span className="rail-tip__text rail-tip__text--wide" aria-hidden="true">
                  Sample data. {SAMPLE_NOTE}
                </span>
              </div>
            </div>
          </div>
        </div>

        {onToggleCollapsed && (
          <button
            type="button"
            className="nav-link nav-link--button rail-tip"
            onClick={onToggleCollapsed}
          >
            <span className="nav-link__icon" aria-hidden="true">
              <ToggleIcon size={18} strokeWidth={1.75} />
            </span>
            <span className="nav-link__label">{toggleLabel}</span>
            <span className="rail-tip__text" aria-hidden="true">
              {toggleLabel}
            </span>
          </button>
        )}

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
