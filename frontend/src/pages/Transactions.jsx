import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  Calendar,
  X,
  Edit2,
  Trash2,
  Check,
  ArrowLeft,
} from "lucide-react";
import { formatCurrency } from "../utils/formatCurrency";

export default function Transactions() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get("type") || "";

  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    type: initialType || "expense",
    category: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
  });

  // Categories
  const categories = {
    income: ["Gaji", "Freelance", "Investasi", "Bonus", "Lainnya"],
    expense: [
      "Makanan",
      "Transport",
      "Belanja",
      "Tagihan",
      "Hiburan",
      "Kesehatan",
      "Pendidikan",
      "Lainnya",
    ],
  };

  // Extract userId from JWT
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("❌ No token found, redirecting to login");
      navigate("/login");
      return;
    }
    
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      console.log("✅ JWT Payload:", payload);
      
      const userId = payload.userId || payload.id;
      
      if (!userId) {
        console.error("❌ No userId found in token");
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }
      
      setUser({ ...payload, userId });
      fetchTransactions(userId);
    } catch (err) {
      console.error("❌ JWT error:", err);
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [navigate]);

  // Fetch transactions
  const fetchTransactions = async (userId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      console.log("📊 Fetching transactions for userId:", userId);
      
      const res = await fetch(`http://localhost:5000/api/transactions?userId=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        console.error("❌ Unauthorized - token invalid");
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      const data = await res.json();
      console.log("💳 Transactions response:", data);
      
      if (data.success) {
        setTransactions(data.data || []);
        setFilteredTransactions(data.data || []);
      } else {
        console.error("❌ Error:", data.message);
      }
    } catch (err) {
      console.error("❌ Error fetching transactions:", err);
      alert("Gagal mengambil data transaksi");
    } finally {
      setLoading(false);
    }
  };

  // Filter transactions
  useEffect(() => {
    let filtered = transactions;

    if (filterType !== "all") {
      filtered = filtered.filter((t) => t.type === filterType);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTransactions(filtered);
  }, [searchTerm, filterType, transactions]);

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || !user.userId) {
      alert("Sesi telah berakhir. Silakan login kembali.");
      navigate("/login");
      return;
    }

    const trimmedCategory = formData.category.trim();
    const trimmedAmount = formData.amount.toString().trim();

    if (!trimmedCategory || !trimmedAmount || trimmedAmount === "0" || parseFloat(trimmedAmount) <= 0) {
      alert("Kategori dan jumlah harus diisi dengan benar!");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Sesi telah berakhir. Silakan login kembali.");
      navigate("/login");
      return;
    }

    try {
      const url = editingId
        ? `http://localhost:5000/api/transactions/${editingId}`
        : "http://localhost:5000/api/transactions";

      const method = editingId ? "PUT" : "POST";

      const payload = {
        user_id: user.userId,
        type: formData.type,
        category: trimmedCategory,
        amount: parseFloat(trimmedAmount),
        date: formData.date,
        description: formData.description.trim(),
      };

      console.log("📤 Sending payload:", payload);

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("📥 Server response:", data);

      if (res.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (data.success) {
        // 🔥 Refresh transactions
        await fetchTransactions(user.userId);
        resetForm();
        setShowModal(false);
        alert(editingId ? "Transaksi berhasil diupdate" : "Transaksi berhasil ditambahkan");
      } else {
        alert(data.message || "Gagal menyimpan transaksi");
      }
    } catch (err) {
      console.error("❌ Error saving transaction:", err);
      alert("Terjadi kesalahan saat menyimpan transaksi");
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus transaksi ini?")) return;

    if (!user || !user.userId) {
      alert("Sesi telah berakhir. Silakan login kembali.");
      navigate("/login");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Sesi telah berakhir. Silakan login kembali.");
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/transactions/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (data.success) {
        // 🔥 Refresh transactions
        await fetchTransactions(user.userId);
        alert("Transaksi berhasil dihapus");
      } else {
        alert(data.message || "Gagal menghapus transaksi");
      }
    } catch (err) {
      console.error("❌ Error deleting transaction:", err);
      alert("Terjadi kesalahan saat menghapus transaksi");
    }
  };

  // Handle edit
  const handleEdit = (transaction) => {
    setEditingId(transaction.id);
    setFormData({
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount.toString(),
      date: transaction.date,
      description: transaction.description || "",
    });
    setShowModal(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      type: "expense",
      category: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
    });
    setEditingId(null);
  };

  // 🔥 Navigate back with refresh flag
  const handleBackToDashboard = () => {
    navigate("/dashboard", { state: { refresh: true } });
  };

  // Calculate totals
  const totalIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalExpense = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const balance = totalIncome - totalExpense;

  if (loading && transactions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <div className="text-slate-100 text-xl">Memuat transaksi...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackToDashboard}
              className="p-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold">Transaksi</h1>
              <p className="text-slate-400 text-sm">Kelola semua transaksi keuangan Anda</p>
            </div>
          </div>

          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-semibold transition-all hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            Tambah Transaksi
          </button>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-700/10 border border-emerald-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-emerald-400 font-medium">Total Pemasukan</p>
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-3xl font-bold">{formatCurrency(totalIncome)}</p>
          </div>

          <div className="bg-gradient-to-br from-rose-600/20 to-rose-700/10 border border-rose-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-rose-400 font-medium">Total Pengeluaran</p>
              <TrendingDown className="w-5 h-5 text-rose-400" />
            </div>
            <p className="text-3xl font-bold">{formatCurrency(totalExpense)}</p>
          </div>

          <div className="bg-gradient-to-br from-blue-600/20 to-blue-700/10 border border-blue-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-blue-400 font-medium">Saldo</p>
              <Calendar className="w-5 h-5 text-blue-400" />
            </div>
            <p className={`text-3xl font-bold ${balance >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {formatCurrency(balance)}
            </p>
          </div>
        </div>

        {/* FILTER & SEARCH */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari transaksi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
              >
                <option value="all">Semua Transaksi</option>
                <option value="income">Pemasukan</option>
                <option value="expense">Pengeluaran</option>
              </select>
            </div>

            {(searchTerm || filterType !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterType("all");
                }}
                className="px-4 py-3 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <X className="w-5 h-5" />
                Reset Filter
              </button>
            )}
          </div>
        </div>

        {/* TRANSACTIONS LIST */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-6">
            Daftar Transaksi ({filteredTransactions.length})
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-slate-400 text-lg">Loading...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400 text-lg mb-4">Belum ada transaksi</p>
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold transition-all"
              >
                Tambah Transaksi Pertama
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 bg-slate-700/30 hover:bg-slate-700/50 rounded-xl transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-lg ${
                        tx.type === "income"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-rose-500/20 text-rose-400"
                      }`}
                    >
                      {tx.type === "income" ? (
                        <TrendingUp className="w-5 h-5" />
                      ) : (
                        <TrendingDown className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <p className="font-semibold text-lg">{tx.category}</p>
                      <p className="text-sm text-slate-400">{tx.description || "Tidak ada deskripsi"}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(tx.date).toLocaleDateString("id-ID", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <p
                      className={`text-2xl font-bold ${
                        tx.type === "income" ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {tx.type === "income" ? "+" : "-"}
                      {formatCurrency(tx.amount)}
                    </p>

                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(tx)}
                        className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(tx.id)}
                        className="p-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {editingId ? "Edit Transaksi" : "Tambah Transaksi"}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-slate-700 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tipe Transaksi</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "income", category: "" })}
                    className={`py-3 rounded-xl font-semibold transition-all ${
                      formData.type === "income"
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                    }`}
                  >
                    Pemasukan
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "expense", category: "" })}
                    className={`py-3 rounded-xl font-semibold transition-all ${
                      formData.type === "expense"
                        ? "bg-rose-600 text-white"
                        : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                    }`}
                  >
                    Pengeluaran
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Kategori *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Pilih Kategori</option>
                  {categories[formData.type].map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Jumlah *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tanggal *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Deskripsi (Opsional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Catatan tambahan..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-semibold transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  {editingId ? "Update" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}