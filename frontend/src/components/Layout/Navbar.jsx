import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiMenu, FiUser, FiSettings, FiLogOut, FiSun, FiMoon } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar({ onToggleSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('dark');
  const menuRef = useRef(null);

  // Check user authentication status
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          console.log('✅ Navbar - User loaded:', userData);
        } catch (error) {
          console.error('❌ Navbar - Error parsing user:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    // Check on mount
    checkAuth();

    // Listen for storage changes (when user logs in/out in another tab)
    window.addEventListener('storage', checkAuth);
    
    // Custom event for same-tab auth changes
    window.addEventListener('auth-change', checkAuth);

    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('auth-change', checkAuth);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    console.log('👋 Logging out...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setMenuOpen(false);
    
    // Dispatch custom event for other components
    window.dispatchEvent(new Event('auth-change'));
    
    navigate('/login');
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-4 md:px-6 z-[9999] relative">
      {/* Left: Logo and Sidebar Toggle */}
      <div className="flex items-center gap-3">
        {/* Mobile sidebar button */}
        <button
          className="md:hidden px-2 py-1 rounded bg-slate-800 text-white hover:bg-slate-700"
          onClick={onToggleSidebar}
        >
          ☰
        </button>

        {/* Desktop sidebar button */}
        <button
          className="hidden md:inline-flex text-white hover:text-emerald-400 transition"
          onClick={onToggleSidebar}
        >
          <FiMenu size={20} />
        </button>

        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-white">
            SW
          </div>
          <span className="font-semibold text-white text-lg">SpendWise</span>
        </Link>

        <span className="text-xs text-slate-400 hidden md:inline">
          / {location.pathname.replace('/', '') || 'dashboard'}
        </span>
      </div>

      {/* Right: Theme + User */}
      <div className="flex items-center gap-4 relative">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 transition"
          title="Toggle theme"
        >
          {theme === 'light' ? <FiSun size={18} /> : <FiMoon size={18} />}
        </button>

        {user ? (
          <div ref={menuRef} className="relative z-[9999]">
            {/* User Avatar Button */}
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 focus:outline-none"
              title={`Logged in as ${user.name || user.username}`}
            >
              <div className="h-8 w-8 rounded-full border-2 border-emerald-500 bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center font-semibold text-white text-sm hover:scale-105 transition">
                {(user.name || user.username || 'U').charAt(0).toUpperCase()}
              </div>
              <span className="hidden md:inline text-sm text-slate-300">
                {user.name || user.username}
              </span>
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-lg z-[9999] overflow-hidden"
                >
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-slate-700">
                    <p className="text-sm font-medium text-white">{user.name || user.username}</p>
                    <p className="text-xs text-slate-400">{user.email}</p>
                  </div>

                  {/* Menu Items */}
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition"
                  >
                    <FiUser size={16} /> Profile
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition"
                  >
                    <FiSettings size={16} /> Settings
                  </Link>
                  
                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-slate-700 transition border-t border-slate-700"
                  >
                    <FiLogOut size={16} /> Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <Link
            to="/login"
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-medium text-white transition"
          >
            Login
          </Link>
        )}
      </div>
    </header>
  );
}