import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Navigation, StopCircle, MapPin, Car, Calendar, Clock } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MapView from '../components/MapView';
import { rideAPI } from '../api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const LiveMapPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, joinRide, sendLocation, endTracking } = useSocket();
  const [ride, setRide] = useState(null);
  const [liveLocation, setLiveLocation] = useState(null);
  const [tracking, setTracking] = useState(false);
  const [loading, setLoading] = useState(true);
  const watchRef = useRef(null);

  useEffect(() => {
    fetchRide();
    return () => stopTracking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (ride && socket) {
      joinRide(id);
      socket.on('ride-location', ({ lat, lng }) => {
        setLiveLocation({ lat, lng });
      });
      socket.on('tracking-ended', () => {
        toast('Driver has ended live tracking.');
        setTracking(false);
      });
    }
    return () => {
      if (socket) {
        socket.off('ride-location');
        socket.off('tracking-ended');
      }
    };
  }, [ride, socket, id]);

  const fetchRide = async () => {
    try {
      const { data } = await rideAPI.getRideById(id);
      setRide(data.ride);
      if (data.ride.liveLocation?.lat) {
        setLiveLocation(data.ride.liveLocation);
      }
    } catch {
      toast.error('Could not load ride.');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const isDriver = ride?.driver?._id === user?._id;

  const startTracking = () => {
    if (!navigator.geolocation) {
      return toast.error('Geolocation is not supported by your browser.');
    }
    setTracking(true);
    watchRef.current = navigator.geolocation.watchPosition(
      ({ coords }) => {
        const { latitude: lat, longitude: lng } = coords;
        setLiveLocation({ lat, lng });
        sendLocation(id, lat, lng);
      },
      (err) => {
        toast.error('Could not get location: ' + err.message);
        setTracking(false);
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 5000 }
    );
  };

  const stopTracking = () => {
    if (watchRef.current) {
      navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
    }
    if (id) endTracking(id);
    setTracking(false);
  };

  if (loading) return <div className="spinner"><div className="spinner-ring"></div></div>;
  if (!ride) return null;

  return (
    <>
      <Navbar />
      <div className="page">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>

        <div className="page-header">
          <h2>Live Tracking</h2>
          <p>{ride.from} to {ride.to}</p>
        </div>

        {/* Status bar */}
        <div className="live-status-bar">
          <div className="live-dot" />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>
              {tracking ? 'Broadcasting your location' : liveLocation ? 'Tracking active' : 'Waiting for driver'}
            </div>
            {liveLocation && (
              <div style={{ fontSize: '0.75rem', opacity: 0.85, marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={11} />
                {liveLocation.lat?.toFixed(5)}, {liveLocation.lng?.toFixed(5)}
              </div>
            )}
          </div>
        </div>

        {/* Map */}
        <MapView
          fromCoords={ride.fromCoords}
          toCoords={ride.toCoords}
          liveLocation={liveLocation}
          height="380px"
          showLive={true}
        />

        {/* Driver controls */}
        {isDriver && ride.status === 'active' && (
          <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
            {!tracking ? (
              <button className="btn btn-primary btn-full" onClick={startTracking}>
                <Navigation size={16} /> Start Broadcasting Location
              </button>
            ) : (
              <button className="btn btn-danger btn-full" onClick={stopTracking}>
                <StopCircle size={16} /> Stop Broadcasting
              </button>
            )}
          </div>
        )}

        {/* Passenger info */}
        {!isDriver && (
          <div style={{
            marginTop: 16,
            background: 'var(--bg-lavender)',
            border: '1px solid var(--border-lavender)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 18px',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
          }}>
            <Navigation size={16} color="var(--lavender)" style={{ flexShrink: 0, marginTop: 2 }} />
            <span>The map updates automatically as the driver shares their location. Stay safe.</span>
          </div>
        )}

        {/* Ride summary */}
        <div className="card" style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>FROM</div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{ride.from}</div>
            </div>
            <Navigation size={16} color="var(--lavender-light)" />
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>TO</div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{ride.to}</div>
            </div>
          </div>
          <div className="divider" />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Calendar size={13} color="var(--lavender-light)" />
              {ride.date}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Clock size={13} color="var(--lavender-light)" />
              {ride.time}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Car size={13} color="var(--lavender-light)" />
              {ride.vehicle}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default LiveMapPage;
