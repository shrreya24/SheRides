import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, IndianRupee, Car, FileText, ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LocationSearch from '../components/LocationSearch';
import toast from 'react-hot-toast';
import { rideAPI } from '../api';

const PostRidePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    from: '', fromLat: null, fromLng: null,
    to: '', toLat: null, toLng: null,
    date: '', time: '', seats: 1, price: '', vehicle: '', notes: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFromSelect = (name, lat, lng) => {
    setForm((prev) => ({ ...prev, from: name, fromLat: lat, fromLng: lng }));
  };

  const handleToSelect = (name, lat, lng) => {
    setForm((prev) => ({ ...prev, to: name, toLat: lat, toLng: lng }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.from || !form.to || !form.date || !form.time || !form.price || !form.vehicle) {
      return toast.error('Please fill in all required fields.');
    }

    setLoading(true);
    try {
      const payload = {
        from: form.from,
        to: form.to,
        date: form.date,
        time: form.time,
        seats: parseInt(form.seats),
        price: parseFloat(form.price),
        vehicle: form.vehicle,
        notes: form.notes,
        fromCoords: form.fromLat ? { lat: form.fromLat, lng: form.fromLng } : {},
        toCoords: form.toLat ? { lat: form.toLat, lng: form.toLng } : {},
      };

      const { data } = await rideAPI.createRide(payload);
      toast.success('Ride posted successfully!');
      navigate(`/rides/${data.ride._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post ride.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="page">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>

        <div className="page-header">
          <h2>Offer a Ride</h2>
          <p>Share your journey with fellow women travelers</p>
        </div>

        <form onSubmit={handleSubmit}>

          {/* Route */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="section-title" style={{ marginBottom: 16 }}>Route Details</div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 14 }}>
              Type a city, area, or landmark — select from the suggestions.
            </p>

            <div className="input-group">
              <LocationSearch
                label="From"
                required
                value={form.from}
                placeholder="e.g. Bandra, Mumbai"
                onChange={handleFromSelect}
              />
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <LocationSearch
                label="To"
                required
                value={form.to}
                placeholder="e.g. Andheri East, Mumbai"
                onChange={handleToSelect}
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="section-title" style={{ marginBottom: 16 }}>Schedule</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Date <span className="required">*</span></label>
                <div className="input-wrapper">
                  <Calendar className="input-icon" />
                  <input type="date" name="date" value={form.date} onChange={handleChange} className="has-icon" required />
                </div>
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Time <span className="required">*</span></label>
                <div className="input-wrapper">
                  <Clock className="input-icon" />
                  <input type="time" name="time" value={form.time} onChange={handleChange} className="has-icon" required />
                </div>
              </div>
            </div>
          </div>

          {/* Seats & Price */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="section-title" style={{ marginBottom: 16 }}>Seats &amp; Pricing</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Available Seats <span className="required">*</span></label>
                <div className="input-wrapper">
                  <Users className="input-icon" />
                  <input type="number" name="seats" min="1" max="6" value={form.seats} onChange={handleChange} className="has-icon" required />
                </div>
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Price / Seat (₹) <span className="required">*</span></label>
                <div className="input-wrapper">
                  <IndianRupee className="input-icon" />
                  <input type="number" name="price" min="0" placeholder="e.g. 150" value={form.price} onChange={handleChange} className="has-icon" required />
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle & Notes */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="section-title" style={{ marginBottom: 16 }}>Vehicle &amp; Notes</div>
            <div className="input-group">
              <label className="input-label">Vehicle Name <span className="required">*</span></label>
              <div className="input-wrapper">
                <Car className="input-icon" />
                <input type="text" name="vehicle" placeholder="e.g. Maruti Swift, Honda City" value={form.vehicle} onChange={handleChange} className="has-icon" required />
              </div>
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Notes (optional)</label>
              <div className="input-wrapper">
                <FileText className="input-icon" style={{ top: 16 }} />
                <textarea name="notes" placeholder="e.g. Morning commute, happy to chat or ride in silence!" value={form.notes} onChange={handleChange} style={{ paddingLeft: 42, minHeight: 90 }} />
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Posting ride...' : <><Car size={15} /> Post Ride</>}
          </button>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default PostRidePage;
