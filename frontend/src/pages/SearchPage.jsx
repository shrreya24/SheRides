import { useState, useEffect } from 'react';
import { Search, Calendar, Car, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import RideCard from '../components/RideCard';
import LocationSearch from '../components/LocationSearch';
import { rideAPI } from '../api';
import toast from 'react-hot-toast';

const SearchPage = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState({ from: '', to: '', date: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchRides = async (params = {}, pageNum = 1) => {
    setLoading(true);
    try {
      const { data } = await rideAPI.getRides({ ...params, page: pageNum, limit: 9 });
      setRides(data.rides);
      setTotalPages(data.pages || 1);
      setTotal(data.total || data.rides.length);
    } catch {
      toast.error('Failed to load rides.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRides(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = {};
    if (search.from) params.from = search.from;
    if (search.to) params.to = search.to;
    if (search.date) params.date = search.date;
    setPage(1);
    fetchRides(params, 1);
  };

  const handleClear = () => {
    setSearch({ from: '', to: '', date: '' });
    setPage(1);
    fetchRides({}, 1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    const params = {};
    if (search.from) params.from = search.from;
    if (search.to) params.to = search.to;
    if (search.date) params.date = search.date;
    fetchRides(params, newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Navbar />
      <div className="search-page">

        {/* ── Hero Banner ── */}
        <div className="search-hero">
          <div className="container">
            <h1>Find Your Ride</h1>
            <p>Browse verified women drivers heading your way</p>
          </div>
        </div>

        {/* ── Filter Card ── */}
        <div className="container">
          <form onSubmit={handleSearch} className="search-filter-card">
            <div className="search-filter-grid">

              <div className="input-group" style={{ marginBottom: 0 }}>
                <LocationSearch
                  label="From"
                  value={search.from}
                  placeholder="Starting city or area"
                  onChange={(name) => setSearch((s) => ({ ...s, from: name }))}
                />
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <LocationSearch
                  label="To"
                  value={search.to}
                  placeholder="Destination city or area"
                  onChange={(name) => setSearch((s) => ({ ...s, to: name }))}
                />
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Date</label>
                <div className="input-wrapper">
                  <Calendar className="input-icon" />
                  <input
                    type="date"
                    value={search.date}
                    onChange={e => setSearch({ ...search, date: e.target.value })}
                    className="has-icon"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, alignSelf: 'end' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  <Search size={16} /> Search
                </button>
                {(search.from || search.to || search.date) && (
                  <button type="button" className="btn btn-secondary btn-sm" onClick={handleClear} style={{ flexShrink: 0 }}>
                    Clear
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* ── Results ── */}
        <div className="container" style={{ marginTop: 48 }}>
          <div className="section-title">
            <span>Available Rides</span>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 400 }}>
              {!loading && `${total} ride${total !== 1 ? 's' : ''} found`}
            </span>
          </div>

          {loading ? (
            <div className="spinner"><div className="spinner-ring" /></div>
          ) : rides.length === 0 ? (
            <div className="empty-state">
              <Car />
              <h3>No rides found</h3>
              <p>Try different locations or check back later</p>
            </div>
          ) : (
            <>
              <div className="rides-grid">
                {rides.map(ride => <RideCard key={ride._id} ride={ride} />)}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: 8, marginTop: 40, marginBottom: 20,
                }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <ChevronLeft size={15} /> Prev
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      style={{
                        width: 36, height: 36, borderRadius: 8, border: '1.5px solid',
                        borderColor: p === page ? 'var(--pink)' : 'var(--border)',
                        background: p === page ? 'var(--gradient-primary)' : 'var(--bg-card)',
                        color: p === page ? 'white' : 'var(--text-primary)',
                        fontWeight: p === page ? 700 : 400,
                        cursor: 'pointer', fontSize: '0.875rem',
                      }}
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    Next <ChevronRight size={15} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default SearchPage;
