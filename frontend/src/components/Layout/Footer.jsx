export default function Footer() {
  return (
    <footer className="mt-10 border-t border-slate-800 bg-slate-900/80 backdrop-blur-md py-6 px-4">
      <div className="max-w-6xl mx-auto flex flex-col items-center gap-4 text-center">
        {/* Copyright */}
        <p className="text-[11px] text-slate-500">
          © {new Date().getFullYear()} SpendWise — Atur keuanganmu menjadi lebih rapi.
        </p>
      </div>
    </footer>
  );
}
