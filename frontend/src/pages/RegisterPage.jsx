import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Phone, Lock, Eye, EyeOff, Car, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../api';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      return toast.error('Password must be at least 6 characters.');
    }
    setLoading(true);
    try {
      const { data } = await authAPI.register(form);
      login(data.user, data.token);
      toast.success('Welcome to SheRides, ' + data.user.name.split(' ')[0]);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ paddingTop: 28 }}>
      <div className="auth-logo">
        <div className="auth-logo-icon">
          <Car color="white" size={36} />
        </div>
        <h1>SheRides</h1>
        <p>Women-only carpooling, safe and reliable</p>
      </div>

      <div className="auth-card slide-up">
        <h2>Create account</h2>
        <p className="subtitle">Join thousands of women carpooling safely</p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Full Name <span className="required">*</span></label>
            <div className="input-wrapper">
              <User className="input-icon" />
              <input
                type="text"
                name="name"
                placeholder="Priya Sharma"
                value={form.name}
                onChange={handleChange}
                className="has-icon"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Email <span className="required">*</span></label>
            <div className="input-wrapper">
              <Mail className="input-icon" />
              <input
                type="email"
                name="email"
                placeholder="priya@email.com"
                value={form.email}
                onChange={handleChange}
                className="has-icon"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Phone Number <span className="required">*</span></label>
            <div className="input-wrapper">
              <Phone className="input-icon" />
              <input
                type="tel"
                name="phone"
                placeholder="98765XXXXX"
                value={form.phone}
                onChange={handleChange}
                className="has-icon"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Password <span className="required">*</span></label>
            <div className="input-wrapper">
              <Lock className="input-icon" />
              <input
                type={showPass ? 'text' : 'password'}
                name="password"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={handleChange}
                className="has-icon"
                style={{ paddingRight: 44 }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: 'absolute', right: 14, top: '50%',
                  transform: 'translateY(-50%)', background: 'none',
                  border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                  display: 'flex', alignItems: 'center',
                }}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            background: 'var(--bg-lavender)', borderRadius: 'var(--radius-sm)',
            padding: '12px 14px', marginBottom: 20,
          }}>
            <ShieldCheck size={16} style={{ color: 'var(--lavender)', flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              SheRides is exclusively for women. By creating an account, you confirm that you identify as a woman.
            </p>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
