import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Calendar, Clock, Users, IndianRupee, Car,
  FileText, Star, ShieldCheck, Navigation, MessageSquare,
  CheckCircle, XCircle, MapPin,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MapView from '../components/MapView';
import { rideAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const getInitials = (name = '') =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

const RideDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [starting, setStarting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewTarget, setReviewTarget] = useState(null); // who to review
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  useEffect(() => { fetchRide(); }, [id]);
  useEffect(() => { if (ride?.status === 'completed') fetchReviews(); }, [ride]);

  const fetchRide = async () => {
    try {
      const { data } = await rideAPI.getRideById(id);
      setRide(data.ride);
    } catch {
      toast.error('Ride not found.');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data } = await rideAPI.getReviews(id);
      setReviews(data.reviews);
      // Check if current user already reviewed
      const already = data.reviews.some((r) => r.reviewer?._id === user?._id);
      setHasReviewed(already);
    } catch { /* silent */ }
  };

  const isDriver = ride?.driver?._id === user?._id;
  const myPassenger = ride?.passengers?.find(
    (p) => p.user?._id === user?._id || p.user === user?._id
  );

  const handleRequest = async () => {
    setRequesting(true);
    try {
      await rideAPI.requestRide(id, { message });
      toast.success('Request sent! The driver will review it soon.');
      fetchRide();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request.');
    } finally {
      setRequesting(false);
    }
  };

  const handleStart = async () => {
    setStarting(true);
    try {
      await rideAPI.startRide(id);
      toast.success('Ride started! Live tracking is now active.');
      fetchRide();
      navigate(`/live/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start ride.');
    } finally {
      setStarting(false);
    }
  };

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await rideAPI.completeRide(id);
      toast.success('Ride completed! Great journey.');
      fetchRide();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete ride.');
    } finally {
      setCompleting(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewTarget) return toast.error('Select who you\'re reviewing.');
    setSubmittingReview(true);
    try {
      await rideAPI.createReview(id, {
        rating: reviewRating,
        comment: reviewComment,
        revieweeId: reviewTarget,
      });
      toast.success('Review submitted! ⭐');
      setHasReviewed(true);
      fetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <div className="spinner"><div className="spinner-ring"></div></div>;
  if (!ride) return null;

  const statusClass = {
    scheduled: 'badge-scheduled',
    active: 'badge-active',
    completed: 'badge-completed',
    cancelled: 'badge-cancelled',
  }[ride.status] || 'badge-scheduled';

  return (
    <>
      <Navbar />
      <div className="page">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>

        {/* Driver Info */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div className="driver-info">
              <div className="driver-avatar" style={{ width: 48, height: 48 }}>
                {ride.driver?.profilePhoto
                  ? <img src={ride.driver.profilePhoto} alt={ride.driver.name} />
                  : getInitials(ride.driver?.name)}
              </div>
              <div>
                <div className="driver-name" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {ride.driver?.name}
                  {ride.driver?.isVerified && <ShieldCheck size={15} color="#22C55E" />}
                </div>
                <div className="driver-rating">
                  <Star size={12} fill="#F59E0B" color="#F59E0B" />
                  <span>{ride.driver?.rating?.toFixed(1)}</span>
                  <span style={{ margin: '0 4px', color: '#ddd' }}>·</span>
                  <span>{ride.driver?.ridesCount} rides</span>
                </div>
              </div>
            </div>
            <span className={`badge ${statusClass}`}>{ride.status}</span>
          </div>

          {/* Route */}
          <div className="route-display">
            <div className="route-line" />
            <div className="route-point">
              <div className="route-dot from" />
              <div>
                <div className="route-label">FROM</div>
                <div className="route-place">{ride.from}</div>
              </div>
            </div>
            <div className="route-point" style={{ marginTop: 12 }}>
              <div className="route-dot to" />
              <div>
                <div className="route-label">TO</div>
                <div className="route-place">{ride.to}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Map Preview */}
        {(ride.fromCoords?.lat || ride.toCoords?.lat) && (
          <div style={{ marginBottom: 16 }}>
            <MapView fromCoords={ride.fromCoords} toCoords={ride.toCoords} height="220px" />
          </div>
        )}

        {/* Meta Grid */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="ride-meta">
            <div className="meta-block">
              <div className="meta-item">
                <Calendar size={14} />
                <div>
                  <div className="meta-label">Date</div>
                  <div className="meta-value">{ride.date}</div>
                </div>
              </div>
            </div>
            <div className="meta-block">
              <div className="meta-item">
                <Clock size={14} />
                <div>
                  <div className="meta-label">Time</div>
                  <div className="meta-value">{ride.time}</div>
                </div>
              </div>
            </div>
            <div className="meta-block">
              <div className="meta-item">
                <Users size={14} />
                <div>
                  <div className="meta-label">Seats Left</div>
                  <div className="meta-value">{ride.seatsLeft} of {ride.seats}</div>
                </div>
              </div>
            </div>
            <div className="meta-block">
              <div className="meta-item">
                <IndianRupee size={14} />
                <div>
                  <div className="meta-label">Price / Seat</div>
                  <div className="meta-value" style={{ color: 'var(--pink)' }}>Rs. {ride.price}</div>
                </div>
              </div>
            </div>
          </div>

          {ride.vehicle && (
            <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--lavender)', fontWeight: 600, fontSize: '0.9rem' }}>
              <Car size={16} color="var(--lavender)" />
              <span>{ride.vehicle}</span>
            </div>
          )}

          {ride.notes && (
            <div style={{ marginTop: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.8125rem', marginBottom: 4 }}>
                <FileText size={14} /> Notes
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{ride.notes}</p>
            </div>
          )}
        </div>

        {/* Live tracking button */}
        {ride.status === 'active' && (
          <button
            className="btn btn-secondary btn-full"
            style={{ marginBottom: 12 }}
            onClick={() => navigate(`/live/${id}`)}
          >
            <Navigation size={16} /> View Live Map
          </button>
        )}

        {/* This is your ride banner */}
        {isDriver && (
          <div style={{
            background: 'var(--gradient-card)',
            border: '1.5px solid var(--border-lavender)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 18px',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            color: 'var(--lavender-dark)',
            fontWeight: 700,
            fontSize: '0.9375rem',
          }}>
            <Car size={16} color="var(--lavender-dark)" />
            This is your ride
          </div>
        )}

        {/* Driver actions */}
        {isDriver && ride.status === 'scheduled' && (
          <button className="btn btn-primary btn-full" style={{ marginBottom: 12 }} onClick={handleStart} disabled={starting}>
            <Navigation size={16} />
            {starting ? 'Starting...' : 'Start Ride & Enable Live Tracking'}
          </button>
        )}

        {isDriver && ride.status === 'active' && (
          <button className="btn btn-secondary btn-full" style={{ marginBottom: 12 }} onClick={handleComplete} disabled={completing}>
            <CheckCircle size={16} />
            {completing ? 'Completing...' : 'Mark Ride as Completed'}
          </button>
        )}

        {/* Passenger actions */}
        {!isDriver && ride.status === 'scheduled' && !myPassenger && ride.seatsLeft > 0 && (
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="input-group" style={{ marginBottom: 12 }}>
              <div className="input-wrapper">
                <MessageSquare className="input-icon" />
                <input
                  type="text"
                  placeholder="Add a message to the driver (optional)"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="has-icon"
                />
              </div>
            </div>
            <button className="btn btn-primary btn-full" onClick={handleRequest} disabled={requesting}>
              {requesting ? 'Sending request...' : 'Request to Join'}
            </button>
          </div>
        )}

        {/* Request status */}
        {!isDriver && myPassenger && (
          <div style={{
            background: myPassenger.status === 'accepted' ? '#D1FAE5' : myPassenger.status === 'rejected' ? '#FEE2E2' : '#F5F3FF',
            border: `1.5px solid ${myPassenger.status === 'accepted' ? '#6EE7B7' : myPassenger.status === 'rejected' ? '#FCA5A5' : 'var(--border-lavender)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontWeight: 600,
            fontSize: '0.9375rem',
            color: myPassenger.status === 'accepted' ? '#065F46' : myPassenger.status === 'rejected' ? '#991B1B' : 'var(--lavender-dark)',
          }}>
            {myPassenger.status === 'accepted' && <CheckCircle size={18} />}
            {myPassenger.status === 'rejected' && <XCircle size={18} />}
            {myPassenger.status === 'pending' && <Clock size={18} color="var(--lavender)" />}
            <span>
              {myPassenger.status === 'accepted' && 'You are confirmed for this ride'}
              {myPassenger.status === 'rejected' && 'Your request was not accepted'}
              {myPassenger.status === 'pending' && 'Request pending — driver will respond soon'}
            </span>
          </div>
        )}

        {!isDriver && ride.seatsLeft === 0 && !myPassenger && (
          <div className="empty-state" style={{ padding: 20 }}>
            <XCircle style={{ color: 'var(--text-muted)' }} />
            <h3>No seats available</h3>
          </div>
        )}

        {/* ── Review Section (only for completed rides) ── */}
        {ride.status === 'completed' && (
          <div className="card" style={{ marginTop: 16 }}>
            <div className="section-title" style={{ marginBottom: 16 }}>Reviews</div>

            {/* Review form */}
            {!hasReviewed && (
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 10 }}>Rate someone from this ride:</p>

                {/* Who to review */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                  {isDriver && ride.passengers
                    .filter((p) => p.status === 'accepted')
                    .map((p) => (
                      <button
                        key={p.user?._id}
                        onClick={() => setReviewTarget(p.user?._id)}
                        style={{
                          padding: '6px 14px', borderRadius: 20, fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer',
                          border: '1.5px solid', transition: 'all 0.15s',
                          borderColor: reviewTarget === p.user?._id ? 'var(--pink)' : 'var(--border)',
                          background: reviewTarget === p.user?._id ? '#FFF0F6' : 'var(--bg-input)',
                          color: reviewTarget === p.user?._id ? 'var(--pink)' : 'var(--text-primary)',
                        }}
                      >
                        {p.user?.name || 'Passenger'}
                      </button>
                    ))
                  }
                  {!isDriver && (
                    <button
                      onClick={() => setReviewTarget(ride.driver?._id)}
                      style={{
                        padding: '6px 14px', borderRadius: 20, fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer',
                        border: '1.5px solid',
                        borderColor: reviewTarget === ride.driver?._id ? 'var(--pink)' : 'var(--border)',
                        background: reviewTarget === ride.driver?._id ? '#FFF0F6' : 'var(--bg-input)',
                        color: reviewTarget === ride.driver?._id ? 'var(--pink)' : 'var(--text-primary)',
                      }}
                    >
                      {ride.driver?.name} (Driver)
                    </button>
                  )}
                </div>

                {/* Star picker */}
                <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} onClick={() => setReviewRating(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                      <Star size={24} fill={s <= reviewRating ? '#F59E0B' : 'none'} color={s <= reviewRating ? '#F59E0B' : 'var(--border)'} />
                    </button>
                  ))}
                </div>

                <textarea
                  placeholder="Write a short comment (optional)"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  style={{ width: '100%', minHeight: 70, marginBottom: 10, padding: '10px 12px', fontSize: '0.875rem' }}
                />

                <button
                  className="btn btn-primary"
                  onClick={handleSubmitReview}
                  disabled={submittingReview || !reviewTarget}
                >
                  <Star size={14} /> {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            )}

            {hasReviewed && (
              <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: '#D1FAE5', color: '#065F46', fontWeight: 600, fontSize: '0.875rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle size={16} /> Review submitted. Thank you!
              </div>
            )}

            {/* Existing reviews */}
            {reviews.length > 0 && (
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>All Reviews</div>
                {reviews.map((r, i) => (
                  <div key={i} style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <div className="driver-avatar" style={{ width: 30, height: 30, fontSize: '0.7rem' }}>
                        {r.reviewer?.profilePhoto
                          ? <img src={r.reviewer.profilePhoto} alt={r.reviewer.name} />
                          : (r.reviewer?.name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{r.reviewer?.name}</span>
                      <span style={{ marginLeft: 'auto', display: 'flex', gap: 2 }}>
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} size={13} fill={s <= r.rating ? '#F59E0B' : 'none'} color={s <= r.rating ? '#F59E0B' : 'var(--border)'} />
                        ))}
                      </span>
                    </div>
                    {r.comment && <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', paddingLeft: 38 }}>{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default RideDetailPage;
