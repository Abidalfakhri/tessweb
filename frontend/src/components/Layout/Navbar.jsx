import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiMenu, FiUser, FiSettings, FiLogOut, FiSun, FiMoon } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar({ onToggleSidebar }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark'); // ⬅️ Baca theme dari localStorage
    const menuRef = useRef(null);

    // ===================================
    // 💡 THEME MANAGEMENT
    // ===================================
    useEffect(() => {
        const root = window.document.documentElement;
        
        // Hapus class tema lama dan tambahkan tema baru ke <html>
        root.classList.remove(theme === 'dark' ? 'light' : 'dark');
        root.classList.add(theme);

        // Simpan tema ke localStorage
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };


    // ===================================
    // 🔒 AUTH CHECK
    // ===================================
    const checkAuth = useCallback(() => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        
        if (token && savedUser) {
            try {
                const userData = JSON.parse(savedUser);
                setUser(userData);
                // console.log('✅ Navbar - User loaded:', userData);
            } catch (error) {
                console.error('❌ Navbar - Error parsing user:', error);
                setUser(null);
            }
        } else {
            setUser(null);
        }
    }, []);

    useEffect(() => {
        checkAuth();

        // Listen for storage changes (for cross-tab sync)
        window.addEventListener('storage', checkAuth);
        
        // Custom event for same-tab auth changes (e.g., after login/logout action)
        window.addEventListener('auth-change', checkAuth);

        return () => {
            window.removeEventListener('storage', checkAuth);
            window.removeEventListener('auth-change', checkAuth);
        };
    }, [checkAuth]);

    // ===================================
    // 🖱️ CLOSE MENU OUTSIDE CLICK
    // ===================================
    useEffect(() => {
        function handleClickOutside(event) {
            // Gunakan `menuRef.current` untuk memeriksa klik di luar elemen dropdown
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // ===================================
    // 🚪 LOGOUT
    // ===================================
    const handleLogout = () => {
        console.log('👋 Logging out...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setMenuOpen(false);
        
        // Dispatch custom event to notify other components (e.g., Dashboard, App.jsx)
        window.dispatchEvent(new Event('auth-change'));
        
        navigate('/login');
    };
    
    // ===================================
    // 📝 UTILITY: FORMAT PATHNAME
    // ===================================
    const formatPathname = (pathname) => {
        if (pathname === '/') return 'Dashboard';
        // Hapus slash, ganti hyphen dengan spasi, dan jadikan huruf kapital di awal kata
        const path = pathname.replace('/', '').replace(/-/g, ' ');
        return path.charAt(0).toUpperCase() + path.slice(1);
    };
    
    // Dapatkan path yang diformat
    const currentPath = formatPathname(location.pathname);


    return (
        // 🚨 Z-index: Navbar tetap harus tinggi (e.g., z-[1000]) tapi modal (z-[1000] di Transactions.jsx) akan sama tingginya, pastikan tidak ada konflik. 
        // Saya asumsikan ini Navbar fixed/sticky
        <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-4 md:px-6 z-[1000] sticky top-0">
            
            {/* Left: Logo and Sidebar Toggle */}
            <div className="flex items-center gap-3">
                {/* Sidebar Toggle (Unified button for simplicity) */}
                <button
                    className="p-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition"
                    onClick={onToggleSidebar}
                    title="Toggle Sidebar"
                >
                    <FiMenu size={20} />
                </button>

                {/* Logo */}
                <Link to="/dashboard" className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-white">
                        SW
                    </div>
                    <span className="font-semibold text-white text-lg hidden sm:inline">SpendWise</span>
                </Link>

                {/* Path Display */}
                <span className="text-sm text-slate-400 hidden md:inline ml-4 border-l border-slate-700 pl-4">
                    {currentPath}
                </span>
            </div>

            {/* Right: Theme + User */}
            <div className="flex items-center gap-4 relative">
                
                {/* Theme toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 transition"
                    title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
                >
                    {theme === 'light' ? <FiSun size={18} /> : <FiMoon size={18} />}
                </button>

                {user ? (
                    <div ref={menuRef} className="relative z-50"> 
                        {/* User Avatar Button (z-index untuk memastikan tombol ini tidak tertimpa) */}
                        <button
                            onClick={() => setMenuOpen((prev) => !prev)}
                            className="flex items-center gap-2 focus:outline-none"
                            title={`Logged in as ${user.name || user.username}`}
                        >
                            <div className="h-9 w-9 rounded-full border-2 border-emerald-500 bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center font-bold text-white text-md hover:scale-105 transition">
                                {(user.name || user.username || 'U').charAt(0).toUpperCase()}
                            </div>
                            <span className="hidden lg:inline text-sm font-medium text-slate-300">
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
                                    // 🚨 z-index: Pastikan dropdown berada di atas elemen lain di Navbar
                                    className="absolute right-0 mt-3 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden"
                                >
                                    {/* User Info */}
                                    <div className="px-4 py-3 border-b border-slate-700 bg-slate-700/50">
                                        <p className="text-sm font-semibold text-white truncate">{user.name || user.username}</p>
                                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                                    </div>

                                    {/* Menu Items */}
                                    <Link
                                        to="/profile"
                                        onClick={() => setMenuOpen(false)}
                                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition"
                                    >
                                        <FiUser size={16} /> Profile
                                    </Link>
                                    <Link
                                        to="/settings"
                                        onClick={() => setMenuOpen(false)}
                                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition"
                                    >
                                        <FiSettings size={16} /> Settings
                                    </Link>
                                    
                                    {/* Logout Button */}
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-slate-700 transition border-t border-slate-700"
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