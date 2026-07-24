import { useState } from 'react';
import { MessageCircle, HelpCircle, ChevronDown, ChevronUp, Shield, Star } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const FAQS = [
  {
    q: 'How does SheRides ensure my safety?',
    a: 'Every user must verify their identity with a government-issued ID. Our team reviews all verifications and only authenticated women are allowed on the platform. Every active ride also has live GPS tracking that you can share with trusted contacts.',
  },
  {
    q: 'What if I feel unsafe during a ride?',
    a: 'If you ever feel unsafe, immediately share your live ride location with a trusted contact from within the app. We always recommend informing a friend or family member before starting any ride.',
  },
  {
    q: 'Can men use SheRides?',
    a: 'Absolutely not. SheRides is exclusively for women — both drivers and passengers must be verified women. This is our core commitment and it will never change.',
  },
  {
    q: 'How is the price for a ride determined?',
    a: 'Drivers set their own price per seat based on distance, fuel costs, and convenience. You can compare all available rides and choose the one that fits your budget and schedule.',
  },
  {
    q: 'What if a driver cancels after accepting my request?',
    a: "You'll be notified immediately if a driver cancels. You can then search for another available ride. We encourage all drivers to communicate in advance if their plans change.",
  },
  {
    q: 'How do I get verified as a driver?',
    a: 'Go to your Profile page and tap "Verify Your Identity." Upload a clear photo of your government-issued ID. Once approved (usually within 24 hours), you\'ll receive a Verified badge and can start posting rides.',
  },
  {
    q: 'How does live tracking work?',
    a: 'Once a driver starts a ride, they can share their real-time GPS location. Passengers can see the driver\'s live position on the map and share that link with family members for added safety.',
  },
  {
    q: 'Can I cancel a ride request I sent?',
    a: 'Currently you can view the status of your requests in the Requests page. If you need to cancel, please message the driver directly. We\'re working on a one-tap cancellation feature.',
  },
];

const TIPS = [
  {
    initials: 'SM', name: 'Sneha Menon', date: '2 days ago',
    content: 'Always share your ride details (driver name, car number, and your live location) with a family member before getting in. It takes 30 seconds and gives enormous peace of mind! 🙏',
    tag: '💡 Safety Tip',
  },
  {
    initials: 'DK', name: 'Deepa K.', date: '4 days ago',
    content: 'For intercity rides I always check the driver\'s rating and total rides completed. Members with 20+ rides and a "Trusted" status are amazing — super reliable and great company!',
    tag: '⭐ Travel Tip',
  },
  {
    initials: 'PV', name: 'Pooja Verma', date: '1 week ago',
    content: 'Just completed my 50th ride on SheRides! 🎉 Met so many incredible women. It\'s not just a carpool app anymore — it\'s a community. Highly recommend connecting with your regular drivers.',
    tag: '❤️ Community',
  },
  {
    initials: 'NS', name: 'Nandita S.', date: '1 week ago',
    content: 'Daily commuter hack: search for the same time slots every day and request the same verified driver. Many of us have become regulars on our routes and it\'s so much more comfortable than random bookings!',
    tag: '💡 Commuter Tip',
  },
  {
    initials: 'RT', name: 'Ritu Tiwari', date: '2 weeks ago',
    content: 'Pro tip: add your coordinates when posting or requesting a ride. The map view is incredibly useful for passengers to see exactly where pickup and dropoff points are.',
    tag: '🗺️ Map Tip',
  },
];

const FaqItem = ({ faq }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item${open ? ' open' : ''}`}>
      <button className="faq-question" onClick={() => setOpen(o => !o)}>
        <span style={{ flex: 1 }}>{faq.q}</span>
        {open
          ? <ChevronUp size={18} color="var(--lavender)" style={{ flexShrink: 0 }} />
          : <ChevronDown size={18} color="var(--text-muted)" style={{ flexShrink: 0 }} />}
      </button>
      {open && <div className="faq-answer">{faq.a}</div>}
    </div>
  );
};

const CommunityPage = () => (
  <>
    <Navbar />
    <div className="community-page">

      {/* ── Hero ── */}
      <div className="community-hero">
        <div className="container">
          <h1>Community &amp; Support</h1>
          <p>
            A safe space for women to find answers, share travel tips,
            and support each other on every journey.
          </p>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="community-content">

        {/* FAQ Column */}
        <div>
          <div className="community-section-title">
            <HelpCircle size={22} color="var(--lavender)" />
            Frequently Asked Questions
          </div>
          <div className="faq-list">
            {FAQS.map((faq, i) => <FaqItem key={i} faq={faq} />)}
          </div>
        </div>

        {/* Tips / Discussion Column */}
        <div>
          <div className="community-section-title">
            <MessageCircle size={22} color="var(--pink)" />
            Women's Travel Stories &amp; Tips
          </div>

          {/* Community notice */}
          <div style={{
            background: 'linear-gradient(135deg,#FFF0F6,#F5F3FF)',
            border: '1.5px solid var(--border-lavender)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 18px', marginBottom: 20,
            display: 'flex', alignItems: 'flex-start', gap: 10,
            fontSize: '0.875rem', color: 'var(--lavender-dark)', fontWeight: 500,
          }}>
            <Shield size={18} color="var(--pink)" style={{ flexShrink: 0, marginTop: 1 }} />
            <span>
              This is a moderated, women-only community. All members are
              identity-verified. Stay safe, be kind, and lift each other up. 💜
            </span>
          </div>

          <div className="tips-grid">
            {TIPS.map((tip, i) => (
              <div className="tip-card" key={i}>
                <div className="tip-card-header">
                  <div className="tip-card-avatar">{tip.initials}</div>
                  <div>
                    <div className="tip-card-name">{tip.name}</div>
                    <div className="tip-card-date">{tip.date}</div>
                  </div>
                </div>
                <p className="tip-card-content">{tip.content}</p>
                <span className="tip-card-tag">{tip.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Safety Banner ── */}
      <div style={{ background: 'var(--gradient-primary)', padding: '72px 0', marginTop: 20 }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <Shield size={44} color="white" style={{ margin: '0 auto 18px', display: 'block', opacity: 0.9 }} />
          <h2 style={{ color: 'white', marginBottom: 12, fontSize: '2rem' }}>
            Your Safety Is Our Priority
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', maxWidth: 520, margin: '0 auto 36px', fontSize: '1.0625rem' }}>
            Every ride on SheRides includes live GPS tracking.
            Always share your ride details with a trusted contact before traveling.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
            {[
              '✅ ID-Verified Members',
              '📍 Live GPS Tracking',
              '⭐ Rating System',
              '🔒 Women-Only Space',
            ].map(item => (
              <div key={item} style={{
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: '50px', padding: '10px 22px',
                color: 'white', fontSize: '0.9rem', fontWeight: 600,
                backdropFilter: 'blur(8px)',
              }}>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

    <Footer />
  </>
);

export default CommunityPage;
