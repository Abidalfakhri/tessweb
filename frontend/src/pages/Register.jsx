import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import Input from "../components/common/Input";
import Button from "../components/common/Button";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validasi semua field wajib
    if (!name || !email || !username || !password) {
      return setError("Semua field wajib diisi");
    }

    try {
      setLoading(true);

      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, username, password }),
      });

      const data = await res.json();
      console.log("📥 Register response:", data);

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Gagal mendaftar");
      }

      console.log("✅ Register berhasil!");
      console.log("👤 User:", data.data.user);
      console.log("🔑 Token saved");

      // Register berhasil → simpan token & user
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));

      // Trigger event untuk update komponen lain (Navbar, dll)
      window.dispatchEvent(new Event('auth-change'));

      // Redirect ke dashboard
      navigate("/dashboard");

    } catch (err) {
      console.error("❌ Register error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute -top-24 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-500/20 rounded-full blur-2xl"></div>
      </div>

      <div className="flex flex-col md:flex-row-reverse items-center justify-center gap-10 z-10 max-w-5xl w-full">
        {/* Ilustrasi kanan */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden md:flex flex-col items-center text-center text-slate-200 max-w-sm"
        >
          <img
            src="/src/assets/illustrations/finance.svg"
            alt="Register Illustration"
            className="w-64 mb-6 drop-shadow-xl"
          />
          <h1 className="text-3xl font-bold mb-2">Buat Akun SpendWise</h1>
          <p className="text-slate-400">
            Mulai perjalanan finansialmu. Kelola uang, rencanakan tabungan, dan raih stabilitas ekonomi!
          </p>
        </motion.div>

        {/* Form registrasi */}
        <motion.form
          onSubmit={handleSubmit}
          className="bg-slate-800/60 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-full max-w-sm border border-slate-700/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl font-semibold text-center mb-6 text-white">
            Daftar Akun Baru
          </h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <Input
            label="Nama Lengkap"
            type="text"
            placeholder="Masukkan nama lengkap..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Email"
            type="email"
            placeholder="Masukkan email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Username"
            type="text"
            placeholder="Masukkan username..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="Masukkan password..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            className="w-full mt-6 bg-blue-600 hover:bg-blue-500 transition-all"
            disabled={loading}
          >
            {loading ? "Memproses..." : "Daftar"}
          </Button>

          <div className="mt-4 text-center text-sm text-slate-400">
            Sudah punya akun?{" "}
            <Link to="/login" className="text-blue-400 hover:underline">
              Masuk
            </Link>
          </div>
        </motion.form>
      </div>
    </div>
  );
}