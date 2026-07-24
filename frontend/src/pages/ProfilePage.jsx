import { useState, useEffect, useRef } from 'react';
import { LogOut, Edit2, Upload, Car, Star, ShieldCheck, ShieldOff, MapPin, Check, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import RideCard from '../components/RideCard';
import { authAPI, rideAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

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
  const [tab, setTab] = useState('offered');
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

  const displayedRides = tab === 'offered' ? myRides.offeredRides : myRides.bookedRides;

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
                  <div style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {user.name}
                    {user.isVerified
                      ? <ShieldCheck size={18} color="#22C55E" />
                      : <ShieldOff size={18} color="var(--text-muted)" />}
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
          <button className={`tab-btn${tab === 'offered' ? ' active' : ''}`} onClick={() => setTab('offered')}>
            Offered ({myRides.offeredRides.length})
          </button>
          <button className={`tab-btn${tab === 'booked' ? ' active' : ''}`} onClick={() => setTab('booked')}>
            Booked ({myRides.bookedRides.length})
          </button>
        </div>

        {ridesLoading ? (
          <div className="spinner"><div className="spinner-ring" /></div>
        ) : displayedRides.length === 0 ? (
          <div className="empty-state">
            <MapPin />
            <h3>{tab === 'offered' ? 'No rides offered yet' : 'No rides booked yet'}</h3>
            <p>Your {tab} rides will appear here</p>
          </div>
        ) : (
          displayedRides.map(ride => <RideCard key={ride._id} ride={ride} />)
        )}
      </div>
      <Footer />
    </>
  );
};

export default ProfilePage;
