const mongoose = require('mongoose');

const passengerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
  requestedAt: { type: Date, default: Date.now },
});

const rideSchema = new mongoose.Schema(
  {
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    from: {
      type: String,
      required: [true, 'Starting location is required'],
      trim: true,
    },
    to: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true,
    },
    fromCoords: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    toCoords: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
    },
    time: {
      type: String,
      required: [true, 'Time is required'],
    },
    seats: {
      type: Number,
      required: [true, 'Number of seats is required'],
      min: 1,
      max: 6,
    },
    seatsLeft: {
      type: Number,
    },
    price: {
      type: Number,
      required: [true, 'Price per seat is required'],
      min: 0,
    },
    vehicle: {
      type: String,
      required: [true, 'Vehicle name is required'],
      trim: true,
    },
    vehicleNumber: {
      type: String,
      default: '',
      trim: true,
    },
    notes: {
      type: String,
      default: '',
      maxlength: [300, 'Notes cannot exceed 300 characters'],
    },
    status: {
      type: String,
      enum: ['scheduled', 'active', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    passengers: [passengerSchema],
    liveLocation: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
      updatedAt: { type: Date, default: null },
    },
  },
  { timestamps: true }
);

// Set seatsLeft = seats on creation (Mongoose 9 async pattern — no next() needed)
rideSchema.pre('save', async function () {
  if (this.isNew) {
    this.seatsLeft = this.seats;
  }
});

// Query Optimization Indexes
rideSchema.index({ status: 1, seatsLeft: 1 });
rideSchema.index({ from: 1, to: 1, date: 1 });
rideSchema.index({ driver: 1 });

module.exports = mongoose.model('Ride', rideSchema);
