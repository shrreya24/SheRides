import { Link } from 'react-router-dom';
import { Car, Heart, Shield } from 'lucide-react';

const Footer = () => (
  <footer className="footer">
    <div className="footer-main">
      {/* Brand */}
      <div>
        <Link to="/" className="footer-logo">
          <div className="footer-logo-icon">
            <Car color="white" size={16} />
          </div>
          <span className="footer-logo-text">SheRides</span>
        </Link>
        <p className="footer-desc">
          India's first women-only carpooling platform. Safe, verified, and
          community-driven rides connecting women everywhere.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', color: 'rgba(255,255,255,0.45)' }}>
          <Heart size={13} color="#e879a0" fill="#e879a0" />
          Built for women's safety &amp; comfort
        </div>
      </div>

      {/* Quick Links */}
      <div className="footer-col">
        <h5>Explore</h5>
        <ul className="footer-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/search">Find Rides</Link></li>
          <li><Link to="/post">Post a Ride</Link></li>
          <li><Link to="/community">Community &amp; FAQ</Link></li>
        </ul>
      </div>

      {/* Account */}
      <div className="footer-col">
        <h5>Account</h5>
        <ul className="footer-links">
          <li><Link to="/profile">My Profile</Link></li>
          <li><Link to="/requests">My Requests</Link></li>
          <li><Link to="/login">Sign In</Link></li>
          <li><Link to="/register">Create Account</Link></li>
        </ul>
      </div>

      {/* Safety */}
      <div className="footer-col">
        <h5>Safety</h5>
        <ul className="footer-links">
          <li><Link to="/community">Safety Tips</Link></li>
          <li><Link to="/community">Community Guidelines</Link></li>
          <li><Link to="/profile">ID Verification</Link></li>
          <li><Link to="/community">FAQ</Link></li>
        </ul>
      </div>
    </div>

    <div className="footer-bottom">
      <div className="footer-bottom-inner">
        <span>© 2025 SheRides. All rights reserved.</span>
        <div className="footer-bottom-badge">
          <Shield size={12} />
          Women-Only Platform
        </div>
        <span>Empowering women through safe travel 🚗💜</span>
      </div>
    </div>
  </footer>
);

export default Footer;
