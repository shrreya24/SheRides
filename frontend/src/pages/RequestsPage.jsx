import { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Star, ShieldCheck, ArrowRight, Trash2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { rideAPI } from '../api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const getInitials = (name = '') =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

const RequestsPage = () => {
  const [tab, setTab] = useState('incoming');
  const [incoming, setIncoming] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [inRes, myRes] = await Promise.all([
        rideAPI.getIncomingRequests(),
        rideAPI.getMyRequests(),
      ]);
      setIncoming(inRes.data.requests);
      setMyRequests(myRes.data.requests);
    } catch {
      toast.error('Failed to load requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (rideId, passengerId, action) => {
    const key = `${rideId}-${passengerId}`;
    setActionLoading((prev) => ({ ...prev, [key]: true }));
    try {
      await rideAPI.handleRequest(rideId, passengerId, action);
      toast.success('Request ' + action + 'ed successfully.');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed.');
    } finally {
      setActionLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleCancelRequest = async (rideId) => {
    setActionLoading((prev) => ({ ...prev, [`cancel-${rideId}`]: true }));
    try {
      await rideAPI.cancelRequest(rideId);
      toast.success('Request cancelled.');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed.');
    } finally {
      setActionLoading((prev) => ({ ...prev, [`cancel-${rideId}`]: false }));
    }
  };

  const statusColors = {
    pending: { bg: '#F5F3FF', color: 'var(--lavender-dark)', border: 'var(--border-lavender)' },
    accepted: { bg: '#D1FAE5', color: '#065F46', border: '#6EE7B7' },
    rejected: { bg: '#FEE2E2', color: '#991B1B', border: '#FCA5A5' },
  };

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="page-header">
          <h2>Requests</h2>
          <p>Manage ride requests</p>
        </div>

        <div className="tab-bar">
          <button
            className={`tab-btn ${tab === 'incoming' ? 'active' : ''}`}
            onClick={() => setTab('incoming')}
          >
            Incoming {incoming.length > 0 && `(${incoming.length})`}
          </button>
          <button
            className={`tab-btn ${tab === 'mine' ? 'active' : ''}`}
            onClick={() => setTab('mine')}
          >
            My Requests
          </button>
        </div>

        {loading ? (
          <div className="spinner"><div className="spinner-ring" /></div>
        ) : tab === 'incoming' ? (
          incoming.length === 0 ? (
            <div className="empty-state">
              <Clock />
              <h3>No incoming requests</h3>
            </div>
          ) : (
            incoming.map((req, i) => {
              const key = `${req.rideId}-${req.passengerId}`;
              return (
                <div className="request-card fade-in" key={i}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div className="driver-avatar" style={{ width: 44, height: 44 }}>
                      {req.passenger?.profilePhoto
                        ? <img src={req.passenger.profilePhoto} alt={req.passenger.name} />
                        : getInitials(req.passenger?.name)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {req.passenger?.name}
                        {req.passenger?.isVerified && <ShieldCheck size={13} color="#22C55E" />}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        <Star size={11} fill="#F59E0B" color="#F59E0B" />
                        {req.passenger?.rating?.toFixed(1)} · {req.passenger?.status}
                      </div>
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', marginBottom: 10, fontSize: '0.875rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {req.from}
                      <ArrowRight size={14} color="var(--text-muted)" />
                      {req.to}
                    </div>
                    <div style={{ color: 'var(--text-muted)', marginTop: 2 }}>{req.date} at {req.time}</div>
                  </div>

                  {req.message && (
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: 10, paddingLeft: 2 }}>
                      "{req.message}"
                    </p>
                  )}

                  <div className="request-actions">
                    <button
                      className="btn btn-primary"
                      style={{ flex: 1, padding: '10px' }}
                      onClick={() => handleAction(req.rideId, req.passengerId, 'accept')}
                      disabled={actionLoading[key]}
                    >
                      <CheckCircle size={15} /> Accept
                    </button>
                    <button
                      className="btn btn-danger"
                      style={{ flex: 1, padding: '10px' }}
                      onClick={() => handleAction(req.rideId, req.passengerId, 'reject')}
                      disabled={actionLoading[key]}
                    >
                      <XCircle size={15} /> Reject
                    </button>
                  </div>
                </div>
              );
            })
          )
        ) : (
          myRequests.length === 0 ? (
            <div className="empty-state">
              <Clock />
              <h3>No requests yet</h3>
            </div>
          ) : (
            myRequests.map((req, i) => {
              const sc = statusColors[req.status] || statusColors.pending;
              const cancelKey = `cancel-${req.rideId}`;
              return (
                <div className="request-card fade-in" key={i} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <Link to={`/rides/${req.rideId}`} style={{ textDecoration: 'none', flex: 1 }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                        {req.from}
                        <ArrowRight size={14} color="var(--text-muted)" />
                        {req.to}
                      </div>
                    </Link>
                    <span style={{
                      background: sc.bg, color: sc.color,
                      border: `1px solid ${sc.border}`,
                      padding: '3px 10px', borderRadius: 20,
                      fontSize: '0.75rem', fontWeight: 600,
                      marginLeft: 8,
                    }}>
                      {req.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 10 }}>
                    {req.date} at {req.time}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="driver-avatar" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                        {req.driver?.profilePhoto
                          ? <img src={req.driver.profilePhoto} alt={req.driver.name} />
                          : getInitials(req.driver?.name)}
                      </div>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        Driver: {req.driver?.name}
                      </span>
                    </div>
                    {/* Allow cancel if ride hasn't started yet and request isn't rejected */}
                    {req.rideStatus === 'scheduled' && req.status !== 'rejected' && (
                      <button
                        className="btn btn-danger btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8125rem' }}
                        onClick={() => handleCancelRequest(req.rideId)}
                        disabled={actionLoading[cancelKey]}
                      >
                        <Trash2 size={13} />
                        {actionLoading[cancelKey] ? 'Cancelling...' : 'Cancel Request'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )
        )}
      </div>
      <Footer />
    </>
  );
};

export default RequestsPage;
