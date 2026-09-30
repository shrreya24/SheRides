import { useState, useEffect, useRef } from 'react';
import { LogOut, Edit2, Upload, Car, Star, ShieldCheck, ShieldOff, MapPin, Check, X, Phone, Users, User } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import RideCard from '../components/RideCard';
import { authAPI, rideAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';

const getInitials = (name = '') =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

const ProfilePage = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [myRides, setMyRides] = useState({ offeredRides: [], bookedRides: [] });
  const [ridesLoading, setRidesLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState(user?.role === 'driver' ? 'offered' : 'booked');
  const fileRef = useRef();

  useEffect(() => { fetchMyRides(); }, []);

  const fetchMyRides = async () => {
    try {
      const { data } = await rideAPI.getMyRides();
      setMyRides(data);
    } catch {
      toast.error('Failed to load rides.');
    } finally {
      setRidesLoading(false);
    }
  };

  const handleIdUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('governmentId', file);
      const { data } = await authAPI.uploadId(formData);
      updateUser(data.user);
      toast.success('ID uploaded. Account verified.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', editForm.name);
      formData.append('phone', editForm.phone);
      const { data } = await authAPI.updateProfile(formData);
      updateUser(data.user);
      setEditing(false);
      toast.success('Profile updated.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out. See you soon.');
  };

  if (!user) return null;

  // For drivers: show offered rides with passenger details underneath
  // For passengers: show booked rides with their booking status badge
  const isDriver = user.role === 'driver';
  const displayedRides = tab === 'offered' ? myRides.offeredRides : myRides.bookedRides;

  // Helper: get this user's booking status for a booked ride (passenger view)
  const getBookingStatus = (ride) => {
    const passenger = ride.passengers?.find(
      (p) => p.user?._id?.toString() === user._id?.toString() || p.user?.toString() === user._id?.toString()
    );
    return passenger?.status || 'pending';
  };

  // Get accepted passengers on an offered ride (driver view)
  const getAcceptedPassengers = (ride) =>
    (ride.passengers || []).filter((p) => p.status === 'accepted');

  return (
    <>
      <Navbar />
      <div className="page">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <h2 style={{ marginBottom: 2 }}>My Profile</h2>
            <p style={{ fontSize: '0.875rem' }}>Manage your account and rides</p>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <LogOut size={15} /> Log Out
          </button>
        </div>

        {/* User info */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <div className="profile-avatar">
              {user.profilePhoto
                ? <img src={user.profilePhoto} alt={user.name} />
                : getInitials(user.name)}
            </div>
            <div style={{ flex: 1 }}>
              {editing ? (
                <div>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    style={{ marginBottom: 8, padding: '8px 12px', fontSize: '0.875rem', width: '100%' }}
                  />
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    style={{ padding: '8px 12px', fontSize: '0.875rem', width: '100%', marginBottom: 10 }}
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-primary btn-sm" onClick={handleSaveProfile} disabled={saving}>
                      <Check size={13} /> {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setEditing(false)}>
                      <X size={13} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    {user.name}
                    {user.isVerified
                      ? <ShieldCheck size={18} color="#22C55E" />
                      : <ShieldOff size={18} color="var(--text-muted)" />}
                    {/* Role badge */}
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      background: user.role === 'driver' ? 'linear-gradient(135deg,#EDE9FE,#F5F3FF)' : 'linear-gradient(135deg,#FFF0F6,#FDF4FF)',
                      border: `1px solid ${user.role === 'driver' ? 'var(--border-lavender)' : 'rgba(214,51,132,0.2)'}`,
                      borderRadius: 20, padding: '2px 10px',
                      fontSize: '0.72rem', fontWeight: 700,
                      color: user.role === 'driver' ? 'var(--lavender-dark)' : '#b02770',
                      textTransform: 'capitalize',
                    }}>
                      {user.role === 'driver'
                        ? <Car size={11} />
                        : <User size={11} />}
                      {user.role}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 3 }}>{user.email}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 1 }}>{user.phone}</div>
                </>
              )}
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                style={{
                  background: 'var(--bg-input)', border: '1px solid var(--border)',
                  borderRadius: 8, padding: 8, cursor: 'pointer', color: 'var(--text-secondary)',
                  display: 'flex', alignItems: 'center',
                }}
              >
                <Edit2 size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="profile-stats">
          <div className="stat-card">
            <Car className="stat-icon" />
            <span className="stat-value">{user.ridesCount}</span>
            <span className="stat-label">Rides</span>
          </div>
          <div className="stat-card">
            <Star className="stat-icon" style={{ fill: '#FDE68A', color: '#F59E0B' }} />
            <span className="stat-value">{user.rating?.toFixed(1)}</span>
            <span className="stat-label">Rating</span>
          </div>
          <div className="stat-card">
            <ShieldCheck className="stat-icon" />
            <span className="stat-value" style={{ fontSize: '0.9rem' }}>{user.status}</span>
            <span className="stat-label">Status</span>
          </div>
        </div>

        {/* ID Verification */}
        {!user.isVerified ? (
          <div className="verify-card">
            <div className="verify-icon"><Upload size={20} /></div>
            <h4>Verify Your Identity</h4>
            <p>Upload a government ID photo to earn your Verified badge and unlock full access.</p>
            <input type="file" accept="image/*" ref={fileRef} style={{ display: 'none' }} onChange={handleIdUpload} />
            <button className="upload-btn" onClick={() => fileRef.current.click()} disabled={uploading}>
              <Upload size={16} />
              {uploading ? 'Uploading...' : 'Tap to upload ID photo'}
            </button>
          </div>
        ) : (
          <div style={{
            background: '#D1FAE5', border: '1.5px solid #6EE7B7',
            borderRadius: 'var(--radius-md)', padding: '14px 18px',
            display: 'flex', alignItems: 'center', gap: 10,
            marginBottom: 24, color: '#065F46', fontWeight: 600,
          }}>
            <ShieldCheck size={20} color="#065F46" />
            Identity Verified ✓
          </div>
        )}

        {/* My Rides */}
        <div className="section-title" style={{ marginBottom: 16 }}>My Rides</div>
        <div className="tab-bar">
          {isDriver ? (
            <button className={`tab-btn${tab === 'offered' ? ' active' : ''}`} onClick={() => setTab('offered')}>
              Offered ({myRides.offeredRides.length})
            </button>
          ) : (
            <button className={`tab-btn${tab === 'booked' ? ' active' : ''}`} onClick={() => setTab('booked')}>
              My Bookings ({myRides.bookedRides.length})
            </button>
          )}
        </div>

        {ridesLoading ? (
          <div className="spinner"><div className="spinner-ring" /></div>
        ) : displayedRides.length === 0 ? (
          <div className="empty-state">
            <MapPin />
            <h3>{isDriver ? 'No rides offered yet' : 'No rides booked yet'}</h3>
            <p>{isDriver ? 'Post a ride to get started' : 'Find a ride and book your seat'}</p>
          </div>
        ) : isDriver && tab === 'offered' ? (
          // Driver view: ride card + passenger manifest below
          displayedRides.map(ride => {
            const accepted = getAcceptedPassengers(ride);
            return (
              <div key={ride._id} style={{ marginBottom: 16 }}>
                {/* No bookingStatus badge for driver's own rides */}
                <RideCard ride={ride} />

                {/* Passenger manifest */}
                {accepted.length > 0 && (
                  <div style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderTop: '2px solid var(--lavender)',
                    borderRadius: '0 0 var(--radius-md) var(--radius-md)',
                    padding: '14px 18px',
                    marginTop: -8,
                  }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      fontSize: '0.75rem', fontWeight: 700,
                      color: 'var(--lavender-dark)', textTransform: 'uppercase',
                      letterSpacing: '0.5px', marginBottom: 10,
                    }}>
                      <Users size={13} /> {accepted.length} Passenger{accepted.length !== 1 ? 's' : ''} Booked
                    </div>
                    {accepted.map((p, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        paddingTop: i > 0 ? 10 : 0,
                        borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                      }}>
                        <div className="driver-avatar" style={{ width: 34, height: 34, fontSize: '0.75rem', flexShrink: 0 }}>
                          {p.user?.profilePhoto
                            ? <img src={p.user.profilePhoto} alt={p.user?.name} />
                            : getInitials(p.user?.name || '?')}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                            {p.user?.name || 'Unknown'}
                          </div>
                          {p.user?.phone && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                              <Phone size={11} /> {p.user.phone}
                            </div>
                          )}
                        </div>
                        <span style={{
                          background: '#D1FAE5', color: '#065F46',
                          border: '1px solid #6EE7B7',
                          padding: '2px 10px', borderRadius: 20,
                          fontSize: '0.7rem', fontWeight: 700,
                          textTransform: 'uppercase',
                        }}>Confirmed</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          // Passenger view: booked rides with booking status badge
          displayedRides.map(ride => (
            <RideCard
              key={ride._id}
              ride={ride}
              bookingStatus={getBookingStatus(ride)}
            />
          ))
        )}
      </div>
      <Footer />
    </>
  );
};

export default ProfilePage;
