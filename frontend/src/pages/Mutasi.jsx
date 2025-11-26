import React, { useState, useEffect } from "react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Calendar,
  Wallet,
  Search,
  Filter,
  ChevronDown,
  FileDown,
  RotateCcw,
  BarChart2,
  Loader,
} from "lucide-react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const formatCurrency = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

export default function Mutasi() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("desc");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [userData, setUserData] = useState(null);

  // Fetch data dari backend
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // Fetch user data
      const userRes = await fetch("http://localhost:5000/api/user/profile", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const userData = await userRes.json();
      
      if (userData.success) {
        setUserData(userData.data);
      }

      // Fetch transactions
      const transRes = await fetch("http://localhost:5000/api/transactions", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const transData = await transRes.json();
      
      if (transData.success) {
        setTransactions(transData.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter data transaksi
  const filteredTx = transactions
    .filter((tx) => (filter === "all" ? true : tx.type === filter))
    .filter((tx) =>
      tx.category?.toLowerCase().includes(search.toLowerCase()) ||
      tx.description?.toLowerCase().includes(search.toLowerCase())
    )
    .filter((tx) =>
      (minAmount ? parseFloat(tx.amount) >= Number(minAmount) : true) &&
      (maxAmount ? parseFloat(tx.amount) <= Number(maxAmount) : true)
    )
    .filter((tx) => {
      if (!dateRange.from && !dateRange.to) return true;
      const date = new Date(tx.date);
      const from = dateRange.from ? new Date(dateRange.from) : null;
      const to = dateRange.to ? new Date(dateRange.to) : null;
      return (!from || date >= from) && (!to || date <= to);
    })
    .sort((a, b) => {
      if (sort === "asc") return new Date(a.date) - new Date(b.date);
      else return new Date(b.date) - new Date(a.date);
    });

  // Hitung total
  const totalIncome = filteredTx
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const totalExpense = filteredTx
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const balance = userData?.balance || (totalIncome - totalExpense);

  // Data grafik
  const groupedByDate = {};
  transactions.forEach((t) => {
    const d = t.date.split('T')[0]; // Format YYYY-MM-DD
    if (!groupedByDate[d]) groupedByDate[d] = { date: d, income: 0, expense: 0 };
    if (t.type === "income") groupedByDate[d].income += parseFloat(t.amount);
    else groupedByDate[d].expense += parseFloat(t.amount);
  });
  const chartData = Object.values(groupedByDate)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-30); // Last 30 days

  // Reset semua filter
  const resetFilters = () => {
    setFilter("all");
    setSearch("");
    setSort("desc");
    setMinAmount("");
    setMaxAmount("");
    setDateRange({ from: "", to: "" });
  };

  // Download CSV
  const downloadCSV = () => {
    const headers = ["Tanggal", "Tipe", "Kategori", "Nominal", "Deskripsi"];
    const rows = filteredTx.map((tx) => [
      tx.date,
      tx.type === "income" ? "Pemasukan" : "Pengeluaran",
      tx.category,
      tx.amount,
      tx.description || "-"
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mutasi_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Format date untuk display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-gray-400">Memuat data mutasi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 px-4 md:px-6 py-6 md:py-10">
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="flex items-center gap-3">
            <Wallet className="w-7 h-7 md:w-8 md:h-8 text-emerald-500" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Riwayat Mutasi</h1>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={downloadCSV}
              className="flex items-center gap-2 bg-blue-600 text-white px-3 md:px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
            >
              <FileDown className="w-4 h-4" /> 
              <span className="hidden sm:inline">Download CSV</span>
              <span className="sm:hidden">CSV</span>
            </button>
            <button 
              onClick={resetFilters}
              className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 md:px-4 py-2 rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              <RotateCcw className="w-4 h-4" /> 
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>

        {/* Ringkasan */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 md:p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm">
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-1">Saldo Sekarang</p>
            <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(balance)}</p>
          </div>
          <div className="p-4 md:p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm">
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-1">Total Pemasukan</p>
            <p className="text-xl md:text-2xl font-bold text-emerald-500">+{formatCurrency(totalIncome)}</p>
          </div>
          <div className="p-4 md:p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm">
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-1">Total Pengeluaran</p>
            <p className="text-xl md:text-2xl font-bold text-red-500">-{formatCurrency(totalExpense)}</p>
          </div>
        </div>

        {/* Grafik */}
        <div className="bg-white dark:bg-gray-800 p-4 md:p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <BarChart2 className="w-5 h-5 text-blue-500" />
            <h2 className="font-semibold text-gray-900 dark:text-white">Grafik Keuangan (30 Hari Terakhir)</h2>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  dataKey="date" 
                  stroke="#94a3b8"
                  tick={{ fontSize: 12 }}
                />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  formatter={(v) => formatCurrency(v)}
                  contentStyle={{ 
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} name="Pemasukan" />
                <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} name="Pengeluaran" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-400 dark:text-gray-500">
              Belum ada data transaksi
            </div>
          )}
        </div>

        {/* Filter Panel */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 md:p-5 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="flex gap-2 flex-wrap">
              {["all", "income", "expense"].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition ${
                    filter === t
                      ? t === "income"
                        ? "bg-emerald-600 text-white"
                        : t === "expense"
                        ? "bg-red-600 text-white"
                        : "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {t === "all" ? "Semua" : t === "income" ? "Pemasukan" : "Pengeluaran"}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 flex-1 md:flex-initial md:min-w-[250px]">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari transaksi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Filter Lanjutan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 text-sm">
            <div className="flex flex-col">
              <label className="text-gray-500 dark:text-gray-400 mb-1 text-xs">Dari Tanggal</label>
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 text-sm"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-500 dark:text-gray-400 mb-1 text-xs">Sampai</label>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 text-sm"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-500 dark:text-gray-400 mb-1 text-xs">Nominal Min</label>
              <input
                type="number"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                placeholder="10000"
                className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 text-sm"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-500 dark:text-gray-400 mb-1 text-xs">Nominal Max</label>
              <input
                type="number"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                placeholder="1000000"
                className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 text-sm"
              />
            </div>
            <button
              onClick={() => setSort(sort === "asc" ? "desc" : "asc")}
              className="flex items-center justify-center gap-1 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 mt-auto"
            >
              <Calendar className="w-4 h-4" />
              {sort === "asc" ? "Terlama" : "Terbaru"} <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Daftar Transaksi */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="font-semibold text-gray-700 dark:text-gray-200">Semua Transaksi</h2>
            <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm gap-1">
              <Filter className="w-4 h-4" />
              {filteredTx.length} transaksi
            </div>
          </div>

          {filteredTx.length === 0 ? (
            <p className="text-center text-gray-400 dark:text-gray-500 italic py-10">
              Tidak ada transaksi ditemukan.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredTx.map((tx) => (
                <li
                  key={tx.id}
                  className="flex justify-between items-center px-4 md:px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition"
                >
                  <div className="flex items-center gap-3">
                    {tx.type === "income" ? (
                      <ArrowUpCircle className="w-5 h-5 md:w-6 md:h-6 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <ArrowDownCircle className="w-5 h-5 md:w-6 md:h-6 text-red-500 flex-shrink-0" />
                    )}
                    <div>
                      <p className="font-medium text-sm md:text-base text-gray-900 dark:text-white">{tx.category}</p>
                      <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                        {tx.description || "Tanpa deskripsi"}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{formatDate(tx.date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold text-base md:text-lg ${
                        tx.type === "income" ? "text-emerald-500" : "text-red-500"
                      }`}
                    >
                      {tx.type === "income" ? "+" : "-"} {formatCurrency(tx.amount)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}