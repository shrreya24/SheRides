import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { token, user } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (token) {
      const s = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
      });
      socketRef.current = s;
      setSocket(s);

      s.on('connect', () => {
        setConnected(true);
        console.log('🔌 Socket connected');
      });

      s.on('disconnect', () => {
        setConnected(false);
        console.log('❌ Socket disconnected');
      });

      // Listen for request-update notifications (passenger gets alerted when driver accepts/rejects)
      s.on('request-update', ({ from, to, status }) => {
        if (status === 'accepted') {
          toast.success(`✅ Your request for ${from} → ${to} was accepted!`);
        } else {
          toast.error(`❌ Your request for ${from} → ${to} was not accepted.`);
        }
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off('request-update');
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
    };
  }, [token]);

  // Once connected and user is known, join personal notification room
  useEffect(() => {
    if (socket && user?._id && connected) {
      socket.emit('join-user', { userId: user._id });
    }
  }, [socket, user, connected]);

  const joinRide = (rideId) => {
    if (socketRef.current) {
      socketRef.current.emit('join-ride', { rideId });
    }
  };

  const sendLocation = (rideId, lat, lng) => {
    if (socketRef.current) {
      socketRef.current.emit('update-location', { rideId, lat, lng });
    }
  };

  const endTracking = (rideId) => {
    if (socketRef.current) {
      socketRef.current.emit('end-tracking', { rideId });
    }
  };

  return (
    <SocketContext.Provider value={{ socket, connected, joinRide, sendLocation, endTracking }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
};
