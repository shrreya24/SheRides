import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Car, Menu, X, LogOut } from 'lucide-react';
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

  const navLinks = [
    { to: '/',         label: 'Home',       end: true },
    { to: '/search',   label: 'Find Rides',  end: false },
    { to: '/community',label: 'Community',  end: false },
    ...(user ? [
      { to: '/post',     label: 'Post a Ride', end: false },
      { to: '/requests', label: 'Requests',    end: false },
    ] : []),
  ];

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
              <span className="header-user-name" style={{ display: 'none', ['@media (min-width: 900px)']: { display: 'block' } }}>
                {user.name.split(' ')[0]}
              </span>
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
              className={({ isActive }) => `header-nav-link${isActive ? ' active' : ''}`}
              onClick={() => setMenuOpen(false)}
              style={{ display: 'block', padding: '10px 16px' }}
            >
              {l.label}
            </NavLink>
          ))}
          {user ? (
            <>
              <NavLink to="/profile" className="header-nav-link" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '10px 16px' }}>
                Profile
              </NavLink>
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
