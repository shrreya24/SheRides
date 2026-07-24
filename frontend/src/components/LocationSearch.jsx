import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Loader } from 'lucide-react';

const LocationSearch = ({ value, onChange, placeholder = 'Search location...', label, required = false }) => {
    const [query, setQuery] = useState(value || '');
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [dropdownStyle, setDropdownStyle] = useState({});
    const debounceRef = useRef(null);
    const inputRef = useRef(null);
    const selectedRef = useRef(false);

    useEffect(() => { setQuery(value || ''); }, [value]);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (inputRef.current && !inputRef.current.closest('[data-locationsearch]')?.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Reposition dropdown when it opens
    useEffect(() => {
        if (open && inputRef.current) {
            const rect = inputRef.current.getBoundingClientRect();
            setDropdownStyle({
                position: 'fixed',
                top: rect.bottom + 4,
                left: rect.left,
                width: rect.width,
                zIndex: 9999,
            });
        }
    }, [open]);

    const search = useCallback(async (q) => {
        if (!q || q.length < 3) { setSuggestions([]); setOpen(false); return; }
        setLoading(true);
        try {
            const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=6&countrycodes=in`;
            const res = await fetch(url, {
                headers: { 'Accept-Language': 'en', 'User-Agent': 'SheRidesApp/1.0' },
            });
            const data = await res.json();
            setSuggestions(data);
            setOpen(data.length > 0);
        } catch {
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleInput = (e) => {
        const val = e.target.value;
        setQuery(val);
        selectedRef.current = false;
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            if (!selectedRef.current) search(val);
        }, 400);
    };

    const handleSelect = (place) => {
        const a = place.address || {};
        const city = a.city || a.town || a.suburb || a.village || a.municipality || a.county || a.state_district || '';
        const state = a.state || '';
        const displayName = city
            ? state ? `${city}, ${state}` : city
            : place.display_name.split(',').slice(0, 2).join(', ').trim();

        setQuery(displayName);
        setSuggestions([]);
        setOpen(false);
        selectedRef.current = true;
        onChange(displayName, parseFloat(place.lat), parseFloat(place.lon));
    };

    const getIcon = (type) => {
        if (['city', 'town', 'village'].includes(type)) return '🏙️';
        if (type === 'station' || type === 'halt') return '🚉';
        if (type === 'airport') return '✈️';
        return '📍';
    };

    const formatSuggestion = (place) => {
        const a = place.address || {};
        const main = a.city || a.town || a.suburb || a.village || a.municipality || place.display_name.split(',')[0];
        const sub = [a.state_district, a.state].filter(Boolean).join(', ');
        return { main, sub };
    };

    return (
        <div data-locationsearch="true">
            {label && (
                <label className="input-label">
                    {label} {required && <span className="required">*</span>}
                </label>
            )}
            <div className="input-wrapper" ref={inputRef}>
                {loading
                    ? <Loader className="input-icon" size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    : <MapPin className="input-icon" size={16} />}
                <input
                    type="text"
                    value={query}
                    onChange={handleInput}
                    onFocus={() => suggestions.length > 0 && setOpen(true)}
                    placeholder={placeholder}
                    className="has-icon"
                    autoComplete="off"
                    required={required}
                />
            </div>

            {open && suggestions.length > 0 && (
                <div style={{
                    ...dropdownStyle,
                    background: 'var(--bg-card)',
                    border: '1.5px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: '0 8px 32px rgba(139,92,246,0.18)',
                    overflow: 'hidden',
                    maxHeight: 280,
                    overflowY: 'auto',
                }}>
                    {suggestions.map((place, i) => {
                        const { main, sub } = formatSuggestion(place);
                        return (
                            <div
                                key={place.place_id}
                                onMouseDown={() => handleSelect(place)}
                                style={{
                                    padding: '10px 14px',
                                    cursor: 'pointer',
                                    borderBottom: i < suggestions.length - 1 ? '1px solid var(--border)' : 'none',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: 10,
                                    background: 'transparent',
                                    transition: 'background 0.12s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-lavender)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <span style={{ fontSize: 16, marginTop: 1, flexShrink: 0 }}>{getIcon(place.type)}</span>
                                <div>
                                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{main}</div>
                                    {sub && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 1 }}>{sub}</div>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default LocationSearch;
