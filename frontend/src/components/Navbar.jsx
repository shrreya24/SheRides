import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Car, Menu, X, LogOut, Search, Users, Home, PlusCircle, Bell, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const getInitials = (name = '') =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
  };

  // Role-based nav links
  const passengerLinks = [
    { to: '/',         label: 'Home',       icon: <Home size={15} />,       end: true  },
    { to: '/search',   label: 'Find Rides', icon: <Search size={15} />,     end: false },
    { to: '/profile',  label: 'My Rides',   icon: <User size={15} />,       end: false },
    { to: '/community',label: 'Community',  icon: <Users size={15} />,      end: false },
  ];

  const driverLinks = [
    { to: '/',         label: 'Home',        icon: <Home size={15} />,       end: true  },
    { to: '/post',     label: 'Post a Ride', icon: <PlusCircle size={15} />, end: false },
    { to: '/requests', label: 'Requests',    icon: <Bell size={15} />,       end: false },
    { to: '/community',label: 'Community',   icon: <Users size={15} />,      end: false },
  ];

  const guestLinks = [
    { to: '/',         label: 'Home',      icon: <Home size={15} />,  end: true  },
    { to: '/community',label: 'Community', icon: <Users size={15} />, end: false },
  ];

  const navLinks = !user
    ? guestLinks
    : user.role === 'driver'
    ? driverLinks
    : passengerLinks;

  return (
    <header className="header">
      <div className="header-inner">
        {/* Logo */}
        <Link to="/" className="header-logo">
          <div className="header-logo-icon">
            <Car color="white" size={20} />
          </div>
          <span className="header-logo-text">SheRides</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="header-nav">
          {navLinks.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => `header-nav-link${isActive ? ' active' : ''}`}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Actions */}
        <div className="header-actions">
          {user ? (
            <div className="header-user">
              <NavLink
                to="/profile"
                className="header-user-avatar"
                title={user.name}
              >
                {user.profilePhoto
                  ? <img src={user.profilePhoto} alt={user.name} />
                  : getInitials(user.name)}
              </NavLink>
              <button onClick={handleLogout} className="btn btn-sm btn-secondary" style={{ gap: 6 }}>
                <LogOut size={14} /> Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/login"    className="btn btn-sm btn-secondary">Log In</Link>
              <Link to="/register" className="btn btn-sm btn-primary">Sign Up Free</Link>
            </>
          )}

          {/* Mobile Toggle */}
          <button className="mobile-menu-btn" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="mobile-dropdown">
          {navLinks.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => `header-nav-link mobile-nav-link${isActive ? ' active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {l.icon}
              {l.label}
            </NavLink>
          ))}
          {user ? (
            <>
              <div className="mobile-nav-divider" />
              <div className="mobile-nav-user">
                <div className="driver-avatar" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                  {user.profilePhoto
                    ? <img src={user.profilePhoto} alt={user.name} />
                    : getInitials(user.name)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{user.name.split(' ')[0]}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user.role}</div>
                </div>
              </div>
              <button className="btn btn-sm btn-secondary" onClick={handleLogout} style={{ marginTop: 8, width: '100%', gap: 6 }}>
                <LogOut size={14} /> Logout
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <Link to="/login"    className="btn btn-sm btn-secondary" style={{ flex: 1 }} onClick={() => setMenuOpen(false)}>Log In</Link>
              <Link to="/register" className="btn btn-sm btn-primary"   style={{ flex: 1 }} onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
