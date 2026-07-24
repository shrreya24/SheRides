const Ride = require('../models/Ride');

const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Each user joins their own personal room for targeted notifications
    socket.on('join-user', ({ userId }) => {
      socket.join(`user_${userId}`);
      console.log(`👤 User ${userId} joined personal room`);
    });

    // Driver / passenger joins a ride room
    socket.on('join-ride', ({ rideId }) => {
      socket.join(rideId);
      console.log(`📍 Socket ${socket.id} joined ride room: ${rideId}`);
    });

    // Driver sends live location update
    socket.on('update-location', async ({ rideId, lat, lng }) => {
      try {
        // Persist latest location to DB
        await Ride.findByIdAndUpdate(rideId, {
          liveLocation: { lat, lng, updatedAt: new Date() },
        });

        // Broadcast to all others in the ride room
        socket.to(rideId).emit('ride-location', { lat, lng, updatedAt: new Date() });
      } catch (err) {
        console.error('Socket location update error:', err.message);
      }
    });

    // Driver leaves / ends live tracking
    socket.on('end-tracking', ({ rideId }) => {
      socket.to(rideId).emit('tracking-ended');
      socket.leave(rideId);
      console.log(`🏁 Tracking ended for ride: ${rideId}`);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = initSocket;
