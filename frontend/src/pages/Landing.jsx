import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { DollarSign, Target, BarChart2, Zap } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const features = [
  { icon: DollarSign, title: "Lacak Setiap Rupiah", desc: "Kategorisasi otomatis dan pelacakan pengeluaran/pemasukan secara real-time.", color: "text-emerald-400" },
  { icon: Target, title: "Capai Tujuan Finansial", desc: "Tetapkan target menabung yang realistis dan pantau progresnya secara visual.", color: "text-blue-400" },
  { icon: BarChart2, title: "Insight Keuangan Mendalam", desc: "Laporan visual yang intuitif, membantu Anda memahami pola pengeluaran.", color: "text-purple-400" },
];

const testimonials = [
    { quote: "SpendWise benar-benar mengubah cara saya mengelola uang. Hemat waktu dan bebas stres!", author: "Michael Garcia" },
    { quote: "Antarmukanya bersih dan mudah digunakan. Semua yang saya butuhkan ada di satu tempat.", author: "Rendy Manurung" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-x-hidden">
      
      {/* Navbar: Tetap di Kiri-Kanan */}
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-sm border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2">
                <div className="h-8 w-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-white text-lg">
                    SW
                </div>
                <span className="text-xl sm:text-2xl font-bold text-white hidden sm:inline">SpendWise</span>
            </Link>
            
          <div className="space-x-2 sm:space-x-4 flex items-center">
            <Link 
              to="/login" 
              className="px-3 sm:px-4 py-2 bg-slate-800 rounded-full text-sm font-medium hover:bg-slate-700 transition-colors hidden sm:inline-block"
            >
              Masuk
            </Link>
            <Link
              to="/register"
              className="px-3 sm:px-4 py-2 bg-emerald-600 rounded-full text-sm font-medium hover:bg-emerald-500 transition-colors shadow-md"
            >
              Daftar Gratis
            </Link>
          </div>
        </div>
      </header>

      {/* Background Blur Effects */}
      <div className="absolute inset-0 z-0 opacity-50 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl transform -translate-x-1/2"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl transform translate-x-1/2"></div>
      </div>

      <main className="z-10 relative">

        {/* Hero Section: Centered Layout (Hanya 1 Kolom) */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-16 md:pt-24 pb-20 md:pb-32 text-center">
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4 sm:space-y-6"
          >
            {/* Judul Utama Tengah */}
            <motion.h1 
                variants={itemVariants}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter leading-tight mx-auto max-w-4xl"
            >
              Kelola Keuangan{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                Lebih Cerdas
              </span>
            </motion.h1>

            {/* Deskripsi Tengah */}
            <motion.p variants={itemVariants} className="text-slate-400 text-base sm:text-xl leading-relaxed mx-auto max-w-2xl">
              SpendWise membantu kamu mengatur, menabung, dan memantau setiap transaksi dengan teknologi yang intuitif.
            </motion.p>

            {/* Tombol CTA Tengah */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 justify-center">
              <Link
                to="/register"
                className="px-6 sm:px-8 py-3 bg-emerald-600 rounded-full text-base sm:text-lg font-bold hover:bg-emerald-500 transition-all transform hover:scale-[1.02] shadow-xl shadow-emerald-900/50 text-center"
              >
                Mulai Gratis
              </Link>
              <Link
                to="/login"
                className="px-6 sm:px-8 py-3 border border-slate-700 text-slate-300 rounded-full text-base sm:text-lg font-medium hover:bg-slate-800 transition-colors text-center"
              >
                Masuk
              </Link>
            </motion.div>
          </motion.div>
          
          {/* Ilustrasi dihapus dari sini */}
        </section>

        {/* Feature Section (Sudah Tengah) */}
        <section className="bg-slate-900 py-16 md:py-20 border-t border-b border-slate-800">
          <motion.div 
            className="max-w-7xl mx-auto px-4 sm:px-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={containerVariants}
          >
            <motion.h2 
                variants={itemVariants}
                className="text-3xl sm:text-4xl font-extrabold text-center mb-4"
            >
                Kelola Uang, Bukan Dikelola Uang
            </motion.h2>
            <motion.p variants={itemVariants} className="text-slate-400 text-base sm:text-lg text-center mb-10 md:mb-12 max-w-3xl mx-auto">
                SpendWise dirancang untuk membuat keuangan yang rumit menjadi mudah dipahami dan dikuasai.
            </motion.p>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {features.map((f, i) => (
                <motion.div 
                    key={i} 
                    variants={itemVariants}
                    className="bg-slate-950 p-6 md:p-8 rounded-2xl border border-slate-800 shadow-xl hover:border-emerald-500 transition-all duration-300 transform hover:-translate-y-1 group text-left"
                >
                    <f.icon className={`w-7 h-7 sm:w-8 sm:h-8 mb-4 ${f.color}`} /> 
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                        {f.title}
                    </h3>
                    <p className="text-slate-400 text-sm sm:text-base">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
        
        {/* Testimonial Section (Sudah Tengah) */}
        <section className="py-16 md:py-20">
            <motion.div 
                className="max-w-7xl mx-auto px-4 sm:px-6"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={containerVariants}
            >
                <motion.h2 
                    variants={itemVariants}
                    className="text-3xl sm:text-4xl font-extrabold text-center mb-10"
                >
                    Mereka Sudah Merasakannya
                </motion.h2>
                
                <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
                    {testimonials.map((t, i) => (
                        <motion.div 
                            key={i} 
                            variants={itemVariants}
                            className="bg-slate-900 p-5 sm:p-6 rounded-xl border border-slate-800 shadow-lg"
                        >
                            <p className="italic text-slate-300 text-base sm:text-lg mb-4">
                                “{t.quote}”
                            </p>
                            <p className="text-sm font-semibold text-emerald-400">
                                — {t.author}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </section>

        {/* Final CTA Section (Sudah Tengah) */}
        <section className="py-12 md:py-16 bg-gradient-to-r from-emerald-900/50 to-blue-900/50 border-t border-slate-800">
            <motion.div 
                className="max-w-4xl mx-auto text-center px-4 sm:px-6"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
            >
                <h2 className="text-3xl sm:text-4xl font-extrabold mb-3">Siap Mengambil Kendali?</h2>
                <p className="text-slate-300 text-base sm:text-lg mb-6 md:mb-8">
                    Daftar sekarang dan ubah cara Anda melihat uang selamanya. Tanpa biaya tersembunyi.
                </p>
                <Link
                    to="/register"
                    className="inline-block px-8 sm:px-10 py-3 sm:py-4 bg-emerald-500 rounded-full text-lg sm:text-xl font-bold text-slate-900 hover:bg-emerald-400 transition-all transform hover:scale-[1.05] shadow-2xl shadow-emerald-500/30"
                >
                    Daftar Gratis Hari Ini
                </Link>
            </motion.div>
        </section>

      </main>

      <footer className="py-6 text-center border-t border-slate-800">
        <p className="text-slate-500 text-xs sm:text-sm">
          © {new Date().getFullYear()} SpendWise — Smart Finance Management
        </p>
      </footer>
    </div>
  );
}