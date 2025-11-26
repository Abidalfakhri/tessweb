import { useState, useEffect, useCallback } from "react";
import { X, Plus, Edit2, Trash2, Save, Loader } from "lucide-react";

// ============================================
// 🟢 MAPS UNTUK MENERJEMAHKAN IKON (DB String ⇌ UI Emoji)
// ============================================

// Map Ikon dari Database (string) ke Emoji (untuk Tampilan UI)
const iconMap = {
    // Contoh mapping standar dari Lucide icon names ke Emoji
    'briefcase': '💼', 
    'laptop': '💻',    
    'trending-up': '📈', 
    'gift': '🎁',      
    'utensils': '🍔',   
    'car': '🚗',        
    'shopping-cart': '🛍️', 
    'file-text': '📄',   
    'film': '🎬',       
    'heart': '🏥',      
    'book': '📚',       
    'more-horizontal': '📄', 
};

// Map Ikon dari Emoji (di UI/formData) ke Database (string)
// Digunakan saat mengirim data ke backend agar konsisten dengan data lama
const reverseIconMap = Object.entries(iconMap).reduce((acc, [key, value]) => {
    acc[value] = key;
    return acc;
}, {});

// ============================================
// KOMPONEN CATEGORY MANAGER
// ============================================

export default function CategoryManager({ onClose }) { 
    const [categories, setCategories] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    
    const [formData, setFormData] = useState({
        name: "",
        type: "expense",
        icon: iconMap['utensils'] || '🍔',
        color: "#ef4444"
    });

    // Icon options (untuk tampilan pemilihan)
    const iconOptions = [
        "🍔", "🚗", "🛍️", "🎬", "📄", "🏥", "📚", "📦",
        "💰", "💼", "📈", "🎁", "🏠", "✈️", "🎮", "☕",
        "💳", "📱", "👕", "⚡", "🌟", "🎯", "🔧", "🎨"
    ]; 

    // Color options
    const colorOptions = [
        "#10b981", "#3b82f6", "#ef4444", "#f59e0b", "#8b5cf6",
        "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1"
    ];

    const resetForm = () => {
        setFormData({
            name: "",
            type: "expense",
            icon: iconMap['utensils'] || '🍔',
            color: "#ef4444"
        });
        setEditingId(null);
        setError(null);
        setSuccess(null);
    };

    // 1. Fungsi Fetch Categories (READ)
    const fetchCategories = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            if (!token) return; 

            const res = await fetch(`http://localhost:5000/api/categories`, {
                headers: { 
                    Authorization: `Bearer ${token}` 
                },
            });

            if (res.status === 401) throw new Error("Token kedaluwarsa. Silakan login ulang.");

            const responseData = await res.json();
            
            if (responseData.success) {
                const apiCategories = responseData.data || []; 
                
                // Map ikon string dari DB ke emoji untuk tampilan UI
                const mappedCategories = apiCategories.map(cat => ({
                    ...cat,
                    icon: iconMap[cat.icon] || cat.icon || '📄' 
                }));

                setCategories(mappedCategories); 
            } else {
                throw new Error(responseData.error || "Gagal mengambil data kategori");
            }
        } catch (err) {
            console.error("❌ Error fetching categories:", err);
            setError(err.message || "Terjadi kesalahan jaringan.");
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        if (localStorage.getItem("token")) {
            fetchCategories();
        } else {
            setError("Anda harus login untuk mengelola kategori.");
        }
    }, [fetchCategories]);


    // 2. Fungsi Create Category (CREATE)
    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const token = localStorage.getItem("token");
            
            // Mapping icon (emoji ke string DB) untuk dikirim ke backend
            const iconNameForDb = reverseIconMap[formData.icon];
            
            const dataToSend = {
                ...formData,
                // Kirim string jika ada di map, jika tidak ada (emoji kustom), kirim emojinya
                icon: iconNameForDb || formData.icon, 
            };
            
            const response = await fetch("http://localhost:5000/api/categories", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dataToSend)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Gagal membuat kategori");
            }

            if (data.success) {
                setSuccess("Kategori berhasil ditambahkan!");
                resetForm();
                await fetchCategories(); // Refresh list
            }
        } catch (error) {
            console.error("Error creating category:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };
    
    // 3. Fungsi untuk Memulai Edit (UI LOGIC)
    const handleStartEdit = (category) => {
        setEditingId(category.id); 
        
        // Mengisi state formData dengan data kategori (icon sudah berupa emoji)
        setFormData({
            name: category.name,
            type: category.type,
            icon: category.icon, 
            color: category.color,
        });
        
        setError(null);
        setSuccess(null);
    };


    // 4. Fungsi Update Category (UPDATE)
    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);
        
        try {
            const token = localStorage.getItem("token");

            // Mapping icon (emoji ke string DB) untuk dikirim ke backend
            const iconNameForDb = reverseIconMap[formData.icon];
            const dataToSend = {
                ...formData,
                icon: iconNameForDb || formData.icon, 
            };

            const response = await fetch(
                `http://localhost:5000/api/categories/${editingId}`,
                {
                    method: "PUT",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(dataToSend)
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Gagal mengupdate kategori");
            }

            if (data.success) {
                setSuccess("Kategori berhasil diperbarui!");
                resetForm();
                await fetchCategories();
            }
        } catch (error) {
            console.error("Error updating category:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // 5. Fungsi Delete Category (DELETE)
    const handleDelete = async (categoryId) => {
        if (!confirm("Apakah Anda yakin ingin menghapus kategori ini?")) return;

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:5000/api/categories/${categoryId}`,
                {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Gagal menghapus kategori");
            }

            if (data.success) {
                setSuccess("Kategori berhasil dihapus!");
                await fetchCategories();
            }
        } catch (error) {
            console.error("Error deleting category:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="space-y-6">
            {/* Header dan Tombol Close */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {editingId ? "Edit Kategori" : "Tambah Kategori Baru"}
                </h2>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                >
                    <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
            </div>

            {/* Alert Messages */}
            {error && (
                <div className="p-3 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 rounded-lg text-sm">
                    {error}
                </div>
            )}
            {success && (
                <div className="p-3 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 rounded-lg text-sm">
                    {success}
                </div>
            )}

            
            <form onSubmit={editingId ? handleUpdate : handleCreate} className="space-y-5">
                {/* Input Nama Kategori */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nama Kategori *
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Contoh: Makanan & Minuman"
                        required
                        disabled={loading}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none disabled:opacity-50"
                    />
                </div>
                
                {/* Pilihan Tipe (Income/Expense) */}
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tipe *
                    </label>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, type: "expense" })}
                            disabled={loading}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                                formData.type === "expense"
                                    ? "bg-rose-600 text-white"
                                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                            } disabled:opacity-50`}
                        >
                            Pengeluaran
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, type: "income" })}
                            disabled={loading}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                                formData.type === "income"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                            } disabled:opacity-50`}
                        >
                            Pemasukan
                        </button>
                    </div>
                </div>

                {/* Pilihan Icon */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Pilih Icon
                    </label>
                    <div className="grid grid-cols-8 gap-2">
                        {iconOptions.map((icon) => (
                            <button
                                key={icon}
                                type="button"
                                onClick={() => setFormData({ ...formData, icon })}
                                disabled={loading}
                                className={`text-2xl p-3 rounded-lg transition hover:scale-110 ${
                                    formData.icon === icon
                                        ? "bg-emerald-100 dark:bg-emerald-900/40 ring-2 ring-emerald-500"
                                        : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                                } disabled:opacity-50`}
                            >
                                {icon}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Pilihan Warna */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Pilih Warna
                    </label>
                    <div className="flex gap-2 flex-wrap">
                        {colorOptions.map((color) => (
                            <button
                                key={color}
                                type="button"
                                onClick={() => setFormData({ ...formData, color })}
                                disabled={loading}
                                className={`w-10 h-10 rounded-lg transition hover:scale-110 ${
                                    formData.color === color ? "ring-2 ring-offset-2 ring-gray-400" : ""
                                } disabled:opacity-50`}
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>
                </div>

                {/* Preview Kategori */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Preview:
                    </p>
                    <div className="flex items-center gap-3">
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-2xl shadow-md"
                            style={{ backgroundColor: formData.color }}
                        >
                            {formData.icon}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                                {formData.name || "Nama Kategori"}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {formData.type === "income" ? "Pemasukan" : "Pengeluaran"}
                            </p>
                        </div>
                    </div>
                </div>
                
                {/* Action Buttons (Submit/Cancel) */}
                <div className="flex gap-3 pt-4">
                    {editingId && (
                        <button
                            type="button"
                            onClick={resetForm}
                            disabled={loading}
                            className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition disabled:opacity-50"
                        >
                            Batal
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={loading || !formData.name.trim()}
                        className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-emerald-500 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader className="w-4 h-4 animate-spin" />
                                Menyimpan...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                {editingId ? "Update Kategori" : "Tambah Kategori"}
                            </>
                        )}
                    </button>
                </div>
            </form>
            
            {/* List Existing Categories */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Kategori yang Ada ({categories.length})
                </h3>
                
                {categories.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                        {loading ? "Sedang memuat..." : "Belum ada kategori"}
                    </p>
                ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {categories.map((cat) => (
                            <div
                                key={cat.id}
                                className={`flex items-center justify-between p-3 rounded-lg border ${
                                    editingId === cat.id
                                        ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700"
                                        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shadow-sm"
                                        style={{ backgroundColor: cat.color }}
                                    >
                                        {cat.icon}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {cat.name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {cat.type === "income" ? "Pemasukan" : "Pengeluaran"}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleStartEdit(cat)}
                                        disabled={loading}
                                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition disabled:opacity-50"
                                        title="Edit"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(cat.id)}
                                        disabled={loading}
                                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition disabled:opacity-50"
                                        title="Hapus"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}