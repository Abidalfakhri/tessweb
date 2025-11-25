import { Outlet, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Layout/Navbar';
import Sidebar from '@/components/Layout/Sidebar';
import Footer from '@/components/Layout/Footer';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Check authentication
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      
      // Jika tidak ada token, redirect ke login
      if (!token) {
        console.log("🚫 No token in DashboardLayout, redirecting to login");
        navigate("/login");
        return;
      }

      // Parse JWT untuk mendapatkan user info
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const savedUser = localStorage.getItem("user");
        
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        } else {
          setUser(payload);
        }
        
        console.log("✅ DashboardLayout - User authenticated:", payload);
      } catch (error) {
        console.error("❌ Invalid token in DashboardLayout:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      }
    };

    // Check on mount
    checkAuth();

    // Listen for auth changes
    window.addEventListener('auth-change', checkAuth);

    return () => {
      window.removeEventListener('auth-change', checkAuth);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Navbar onToggleSidebar={() => setSidebarOpen((s) => !s)} />
        
        <main className="flex-1 p-6 overflow-y-auto">
          {/* User yang sampai sini sudah pasti authenticated - TIDAK ADA PESAN TAMU */}
          <Outlet />
        </main>
        
        <Footer />
      </div>
    </div>
  );
}