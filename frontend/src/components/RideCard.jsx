import { Link } from 'react-router-dom';
import { CalendarDays, Timer, UsersRound, Banknote, Car, Star, ShieldCheck } from 'lucide-react';

const getInitials = (name = '') =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

/**
 * Cleans verbose Nominatim location names for display.
 * "Thane, Maharashtra, India" → "Thane, Maharashtra"
 * "Mumbai, Mumbai Suburban District, Maharashtra" → "Mumbai, Maharashtra"
 */
const cleanLocation = (loc = '') => {
  if (!loc) return '';
  // Strip country suffix
  const parts = loc.replace(/, India$/i, '').split(',').map((p) => p.trim());
  // Remove parts that contain any other part (e.g. "Mumbai Suburban District" contains "Mumbai")
  const filtered = parts.filter(
    (p, i) => !parts.some((q, j) => i !== j && p.toLowerCase().includes(q.toLowerCase()) && q.length < p.length)
  );
  // Return first 2 meaningful parts
  return filtered.slice(0, 2).join(', ');
};

const RideCard = ({ ride }) => {
  if (!ride) return null;

  const { _id, driver, from, to, date, time, seatsLeft, seats, price, vehicle, status } = ride;

  const statusClass = {
    scheduled: 'badge-scheduled',
    active: 'badge-active',
    completed: 'badge-completed',
    cancelled: 'badge-cancelled',
  }[status] || 'badge-scheduled';

  return (
    <Link to={`/rides/${_id}`} className="ride-card fade-in">
      {/* Driver Info */}
      <div className="ride-card-header">
        <div className="driver-info">
          <div className="driver-avatar">
            {driver?.profilePhoto ? (
              <img src={driver.profilePhoto} alt={driver.name} />
            ) : (
              getInitials(driver?.name)
            )}
          </div>
          <div>
            <div className="driver-name" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {driver?.name}
              {driver?.isVerified && (
                <ShieldCheck size={14} color="#22C55E" />
              )}
            </div>
            <div className="driver-rating">
              <Star size={12} fill="#F59E0B" color="#F59E0B" />
              <span>{driver?.rating?.toFixed(1) || '5.0'}</span>
              <span style={{ margin: '0 4px', color: '#ddd' }}>·</span>
              <span className={`badge ${statusClass}`} style={{ padding: '2px 8px', fontSize: '0.6875rem' }}>
                {status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Route */}
      <div className="route-display">
        <div className="route-line" />
        <div className="route-point">
          <div className="route-dot from" />
          <div>
            <div className="route-label">FROM</div>
            <div className="route-place">{cleanLocation(from)}</div>
          </div>
        </div>
        <div className="route-point" style={{ marginTop: 12 }}>
          <div className="route-dot to" />
          <div>
            <div className="route-label">TO</div>
            <div className="route-place">{cleanLocation(to)}</div>
          </div>
        </div>
      </div>

      {/* Meta info */}
      <div className="ride-meta">
        <div className="meta-block" style={{ background: '#EDE9FE' }}>
          <div className="meta-item">
            <CalendarDays size={13} color="#7C3AED" />
            <div>
              <div className="meta-label" style={{ color: '#7C3AED' }}>Date</div>
              <div className="meta-value">{date}</div>
            </div>
          </div>
        </div>
        <div className="meta-block" style={{ background: '#CCFBF1' }}>
          <div className="meta-item">
            <Timer size={13} color="#0F766E" />
            <div>
              <div className="meta-label" style={{ color: '#0F766E' }}>Time</div>
              <div className="meta-value">{time}</div>
            </div>
          </div>
        </div>
        <div className="meta-block" style={{ background: '#FEF3C7' }}>
          <div className="meta-item">
            <UsersRound size={13} color="#B45309" />
            <div>
              <div className="meta-label" style={{ color: '#B45309' }}>Seats</div>
              <div className="meta-value">{seatsLeft} of {seats}</div>
            </div>
          </div>
        </div>
        <div className="meta-block" style={{ background: '#FDE8F0' }}>
          <div className="meta-item">
            <Banknote size={13} color="#D63384" />
            <div>
              <div className="meta-label" style={{ color: '#D63384' }}>Price</div>
              <div className="meta-value" style={{ color: 'var(--pink)' }}>₹{price}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle */}
      {vehicle && (
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--lavender)', fontSize: '0.8125rem', fontWeight: 500 }}>
          <Car size={14} color="var(--lavender)" />
          <span>{vehicle}</span>
        </div>
      )}
    </Link>
  );
};

export default RideCard;
