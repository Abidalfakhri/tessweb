import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, Edit3, Trash2, Plus, X, Filter, Search, Wallet, Receipt } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';
import dummyCategories from '../data/dummyCategories';
import dummyTransactions from '../data/dummyTransactions';

const formatNumberWithDots = (value) => {
  const num = value.replace(/\D/g, '');
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export default function Transactions() {
  const [transactions, setTransactions] = useState(dummyTransactions);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterType, setFilterType] = useState('all'); // all, income, expense
  const [searchQuery, setSearchQuery] = useState('');
  const [form, setForm] = useState({
    type: 'expense',
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    const matchType = filterType === 'all' || tx.type === filterType;
    const matchSearch = tx.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       (tx.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchSearch;
  });

  // Calculate summary
  const summary = transactions.reduce(
    (acc, tx) => {
      if (tx.type === 'income') acc.income += tx.amount;
      else acc.expense += tx.amount;
      return acc;
    },
    { income: 0, expense: 0 }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'amount') {
      const formatted = formatNumberWithDots(value);
      setForm((prev) => ({ ...prev, amount: formatted }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!form.category || !form.amount || !form.date) {
      alert('Mohon lengkapi data transaksi!');
      return;
    }

    const transactionData = {
      ...form,
      amount: parseInt(form.amount.replace(/\./g, '')),
    };

    if (editingId) {
      // Update existing transaction
      setTransactions((prev) =>
        prev.map((tx) => (tx.id === editingId ? { ...tx, ...transactionData } : tx))
      );
      setEditingId(null);
    } else {
      // Add new transaction
      const newTx = {
        id: Date.now(),
        ...transactionData,
      };
      setTransactions((prev) => [newTx, ...prev]);
    }

    // Reset form
    setForm({ 
      type: 'expense', 
      category: '', 
      amount: '', 
      date: new Date().toISOString().split('T')[0], 
      description: '' 
    });
    setIsFormOpen(false);
  };

  const handleEdit = (id) => {
    const tx = transactions.find((t) => t.id === id);
    if (tx) {
      setForm({
        type: tx.type,
        category: tx.category,
        amount: formatNumberWithDots(tx.amount.toString()),
        date: tx.date,
        description: tx.description || '',
      });
      setEditingId(id);
      setIsFormOpen(true);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Yakin ingin menghapus transaksi ini?')) {
      setTransactions((prev) => prev.filter((tx) => tx.id !== id));
    }
  };

  const handleCancel = () => {
    setForm({ 
      type: 'expense', 
      category: '', 
      amount: '', 
      date: new Date().toISOString().split('T')[0], 
      description: '' 
    });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const filteredCategories = dummyCategories.filter((cat) => cat.type === form.type);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-200 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Transaksi Keuangan</h1>
            <p className="text-sm md:text-base text-slate-400">Kelola semua pemasukan dan pengeluaran Anda</p>
          </div>
          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg w-full md:w-auto"
          >
            {isFormOpen ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {isFormOpen ? 'Tutup Form' : 'Tambah Transaksi'}
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 backdrop-blur-xl border border-emerald-500/30 rounded-xl md:rounded-2xl p-4 md:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 md:p-3 bg-emerald-500/20 rounded-lg md:rounded-xl">
                <ArrowUpRight className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-slate-400 text-xs md:text-sm">Total Pemasukan</p>
                <p className="text-lg md:text-2xl font-bold text-white">{formatCurrency(summary.income)}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-rose-500/20 to-rose-600/10 backdrop-blur-xl border border-rose-500/30 rounded-xl md:rounded-2xl p-4 md:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 md:p-3 bg-rose-500/20 rounded-lg md:rounded-xl">
                <ArrowDownRight className="w-5 h-5 md:w-6 md:h-6 text-rose-400" />
              </div>
              <div>
                <p className="text-slate-400 text-xs md:text-sm">Total Pengeluaran</p>
                <p className="text-lg md:text-2xl font-bold text-white">{formatCurrency(summary.expense)}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 backdrop-blur-xl border border-blue-500/30 rounded-xl md:rounded-2xl p-4 md:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 md:p-3 bg-blue-500/20 rounded-lg md:rounded-xl">
                <Wallet className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-slate-400 text-xs md:text-sm">Saldo Bersih</p>
                <p className="text-lg md:text-2xl font-bold text-white">{formatCurrency(summary.income - summary.expense)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Section */}
        {isFormOpen && (
          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700 rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl">
            <h2 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-6">
              {editingId ? 'Edit Transaksi' : 'Tambah Transaksi Baru'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs md:text-sm font-medium text-slate-300 mb-2">Tipe Transaksi</label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className="bg-slate-700 border border-slate-600 p-2.5 md:p-3 rounded-lg w-full text-sm md:text-base text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  >
                    <option value="income">Pemasukan</option>
                    <option value="expense">Pengeluaran</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-medium text-slate-300 mb-2">Kategori</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    required
                    className="bg-slate-700 border border-slate-600 p-2.5 md:p-3 rounded-lg w-full text-sm md:text-base text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  >
                    <option value="">Pilih Kategori</option>
                    {filteredCategories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-medium text-slate-300 mb-2">Jumlah</label>
                  <input
                    type="text"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    placeholder="100.000"
                    required
                    className="bg-slate-700 border border-slate-600 p-2.5 md:p-3 rounded-lg w-full text-sm md:text-base text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-medium text-slate-300 mb-2">Tanggal</label>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    required
                    className="bg-slate-700 border border-slate-600 p-2.5 md:p-3 rounded-lg w-full text-sm md:text-base text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-slate-300 mb-2">Deskripsi (Opsional)</label>
                <input
                  type="text"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Catatan tambahan..."
                  className="bg-slate-700 border border-slate-600 p-2.5 md:p-3 rounded-lg w-full text-sm md:text-base text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                />
              </div>

              <div className="flex flex-col md:flex-row gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 md:py-3 rounded-lg text-sm md:text-base font-semibold transition duration-200"
                >
                  {editingId ? 'Update Transaksi' : 'Tambah Transaksi'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="md:px-6 bg-slate-700 hover:bg-slate-600 text-white py-2.5 md:py-3 rounded-lg text-sm md:text-base font-semibold transition duration-200"
                  >
                    Batal
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Filter & Search */}
        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700 rounded-xl md:rounded-2xl p-3 md:p-4">
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari transaksi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-700 border border-slate-600 pl-9 md:pl-10 pr-4 py-2 md:py-2.5 rounded-lg w-full text-sm md:text-base text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition ${
                  filterType === 'all'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setFilterType('income')}
                className={`px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition ${
                  filterType === 'income'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                Pemasukan
              </button>
              <button
                onClick={() => setFilterType('expense')}
                className={`px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition ${
                  filterType === 'expense'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                Pengeluaran
              </button>
            </div>
          </div>
        </div>

        {/* Transaction List */}
        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700 rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl">
          <h2 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-6 flex items-center gap-2">
            <Receipt className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" />
            Daftar Transaksi ({filteredTransactions.length})
          </h2>

          {filteredTransactions.length === 0 ? (
            <div className="text-center p-8 md:p-10 bg-slate-700/30 rounded-xl border border-slate-600">
              <p className="text-base md:text-lg font-medium text-slate-400">Tidak ada transaksi yang ditemukan</p>
              <p className="text-xs md:text-sm text-slate-500 mt-2">
                {searchQuery ? 'Coba kata kunci lain' : 'Mulai catat transaksi Anda'}
              </p>
            </div>
          ) : (
            <div className="space-y-2 md:space-y-3">
              {filteredTransactions.map((tx) => {
                const isIncome = tx.type === 'income';
                const amountClass = isIncome ? 'text-emerald-400' : 'text-rose-400';
                const iconBgClass = isIncome ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400';

                return (
                  <div
                    key={tx.id}
                    className="flex items-center gap-2 md:gap-4 p-3 md:p-4 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg md:rounded-xl transition-all duration-200 border border-slate-600/50"
                  >
                    <div className={`p-2 md:p-3 rounded-lg md:rounded-xl flex-shrink-0 ${iconBgClass}`}>
                      {isIncome ? <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5" /> : <ArrowDownRight className="w-4 h-4 md:w-5 md:h-5" />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm md:text-lg text-white truncate">{tx.category}</p>
                      <p className="text-xs md:text-sm text-slate-400 truncate">{tx.description || 'Tidak ada deskripsi'}</p>
                      <p className="text-xs text-slate-500 md:hidden">{tx.date}</p>
                    </div>
                    
                    <div className="text-right flex-shrink-0">
                      <p className={`font-bold text-sm md:text-xl ${amountClass}`}>
                        {isIncome ? '+' : '-'} {formatCurrency(tx.amount)}
                      </p>
                      <p className="text-xs text-slate-500 hidden md:block">{tx.date}</p>
                    </div>

                    <div className="flex gap-1 md:gap-2 flex-shrink-0">
                      <button 
                        onClick={() => handleEdit(tx.id)} 
                        className="p-1.5 md:p-2 text-blue-400 hover:text-blue-300 hover:bg-slate-600 rounded-lg transition"
                        title="Edit Transaksi"
                      >
                        <Edit3 className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(tx.id)} 
                        className="p-1.5 md:p-2 text-rose-400 hover:text-rose-300 hover:bg-slate-600 rounded-lg transition"
                        title="Hapus Transaksi"
                      >
                        <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}