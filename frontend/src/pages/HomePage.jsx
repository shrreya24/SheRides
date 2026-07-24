import { Link } from 'react-router-dom';
import {
  Car, Shield, Star, MapPin, MessageCircle,
  ArrowRight, Navigation, CheckCircle, Users,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  {
    icon: <Shield size={26} />, color: 'white',
    bg: 'linear-gradient(135deg,#D63384,#b02770)',
    title: 'Women Only',
    desc: 'Every driver and passenger is a verified woman. No exceptions, no compromise.',
  },
  {
    icon: <CheckCircle size={26} />, color: 'white',
    bg: 'linear-gradient(135deg,#8B5CF6,#6D28D9)',
    title: 'Verified Users',
    desc: 'Government ID checks ensure every member in our community is authenticated.',
  },
  {
    icon: <Navigation size={26} />, color: 'white',
    bg: 'linear-gradient(135deg,#0EA5E9,#0284C7)',
    title: 'Live Tracking',
    desc: 'Real-time GPS lets you share your exact location with loved ones.',
  },
  {
    icon: <MessageCircle size={26} />, color: 'white',
    bg: 'linear-gradient(135deg,#F59E0B,#D97706)',
    title: 'Community',
    desc: 'Connect, share travel tips, and build friendships with women near you.',
  },
];

const TESTIMONIALS = [
  {
    initials: 'PS', name: 'Priya Sharma', meta: 'Daily commuter · Bengaluru',
    quote: "SheRides transformed my morning commute. I feel genuinely safe knowing everyone is verified. My carpool buddy has become one of my closest friends!",
  },
  {
    initials: 'RK', name: 'Riya Kapoor', meta: 'Driver · Pune',
    quote: "I love sharing fuel costs with women going the same way. The live tracking feature gives my family peace of mind every single day.",
  },
  {
    initials: 'AN', name: 'Anjali Nair', meta: 'Passenger · Hyderabad',
    quote: "The verification process is thorough and I've never felt unsafe. The community is wonderful — we even have a group chat now for our regular route!",
  },
];

const STATS = [
  { num: '10K+', label: 'Women Registered' },
  { num: '4.9★', label: 'Average Rating' },
  { num: '50K+', label: 'Safe Rides Completed' },
];

const HomePage = () => {
  const { user } = useAuth();

  return (
    <>
      <Navbar />

      {/* ── HERO ── */}
      <section className="hero-section">
        <div className="hero-inner">
          <div className="hero-badge">
            <Shield size={14} />
            India's First Women-Only Carpooling Platform
          </div>

          <h1 className="hero-title">
            Safe Rides for Women,<br />by Women
          </h1>

          <p className="hero-subtitle">
            SheRides connects verified female drivers and passengers for safe,
            comfortable journeys every day. Join thousands of women traveling
            with confidence.
          </p>

          <div className="hero-actions">
            {user ? (
              <>
                <Link to="/search" className="btn btn-white btn-lg">
                  <MapPin size={18} /> Find a Ride
                </Link>
                <Link to="/post" className="btn btn-ghost btn-lg">
                  <Car size={18} /> Offer a Ride
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn btn-white btn-lg">
                  Get Started — It's Free
                </Link>
                <Link to="/login" className="btn btn-ghost btn-lg">
                  Sign In
                </Link>
              </>
            )}
          </div>

          <div className="hero-stats">
            {STATS.map((s, i) => (
              <>
                {i > 0 && <div key={`div-${i}`} className="hero-stat-divider" />}
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div className="hero-stat-num">{s.num}</div>
                  <div className="hero-stat-label">{s.label}</div>
                </div>
              </>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="features-section">
        <div className="container">
          <div className="section-heading">
            <span className="section-label">Why SheRides</span>
            <h2>Everything you need to travel safely</h2>
            <p>Built by women, for women — every feature is designed with your safety and comfort in mind.</p>
          </div>
          <div className="features-grid">
            {FEATURES.map(f => (
              <div className="feature-card" key={f.title}>
                <div className="feature-card-icon" style={{ background: f.bg }}>
                  <span style={{ color: f.color }}>{f.icon}</span>
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RIDER OR PASSENGER ── */}
      <section className="cta-section">
        <div className="container">
          <div className="section-heading">
            <span className="section-label">Get Started</span>
            <h2>Are you a Driver or a Passenger?</h2>
            <p>Choose your role — we'll get you on the road in minutes.</p>
          </div>

          <div className="cta-grid">
            {/* Driver */}
            <Link to={user ? '/post' : '/register'} className="cta-card cta-card-driver">
              <div className="cta-card-icon">
                <Car size={32} color="white" />
              </div>
              <h3>I'm a Driver </h3>
              <p>
                Share your daily journey, split fuel costs, and help fellow women
                travel safely. Earn trust, build community.
              </p>
              <div className="cta-card-arrow">
                Post a Ride <ArrowRight size={20} />
              </div>
            </Link>

            {/* Passenger */}
            <Link to={user ? '/search' : '/register'} className="cta-card cta-card-passenger">
              <div className="cta-card-icon">
                <MapPin size={32} color="white" />
              </div>
              <h3>I'm a Passenger </h3>
              <p>
                Find a verified woman driver going your way. Book a seat, track
                your ride live, and arrive safely.
              </p>
              <div className="cta-card-arrow">
                Find a Ride <ArrowRight size={20} />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-heading">
            <span className="section-label">Community Love</span>
            <h2>What women are saying</h2>
            <p>Real stories from real women in our verified community.</p>
          </div>

          <div className="testimonials-grid">
            {TESTIMONIALS.map(t => (
              <div className="testimonial-card fade-in" key={t.name}>
                <div className="testimonial-stars">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} size={14} fill="#F59E0B" color="#F59E0B" />
                  ))}
                </div>
                <p className="testimonial-quote">{t.quote}</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.initials}</div>
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-meta">{t.meta}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default HomePage;
