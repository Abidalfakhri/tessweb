/**
 * seed.js
 * menjalankan seed data simple (1x)
 * pastikan .env sudah benar dan database sudah dibuat.
 */
require('dotenv').config();
const pool = require('./src/config/db');

async function run() {
  try {
    // Categories (dummyCategories)
    const categories = [
      { name: "Makanan", type: "expense", target: 3000000 },
      { name: "Transportasi", type: "expense", target: 2000000 },
      { name: "Tagihan", type: "expense", target: 1300000 },
      { name: "Kesehatan", type: "expense", target: 800000 },
      { name: "Hiburan", type: "expense", target: 700000 },
      { name: "Belanja", type: "expense", target: 750000 },
      { name: "Pendidikan", type: "expense", target: 900000 },
      { name: "Donasi", type: "expense", target: 500000 },
      { name: "Gaji", type: "income", target: 9500000 },
      { name: "Bonus", type: "income", target: 1000000 },
      { name: "Freelance", type: "income", target: 1500000 },
      { name: "Investasi", type: "income", target: 2000000 }
    ];

    for (const c of categories) {
      await pool.query(
        `INSERT INTO categories (name, type, target) 
         VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`,
        [c.name, c.type, c.target]
      );
    }

    // create demo user
    const bcrypt = require('bcryptjs');
    const username = 'demo';
    const password = 'demo123';
    const hash = await bcrypt.hash(password, 10);

    const userRes = await pool.query(
      'INSERT INTO users (username, password_hash) VALUES ($1,$2) ON CONFLICT (username) DO UPDATE SET username=EXCLUDED.username RETURNING id',
      [username, hash]
    );
    const userId = userRes.rows[0].id;

    // dummy transactions
    const tx = [
      { title:'Gaji Bulanan', type:'income', category:'Gaji', amount:15000000, date:'2025-10-01', description:'Gaji Bulanan' },
      { title:'Dividen saham', type:'income', category:'Investasi', amount:2200000, date:'2025-10-03', description:'Dividen saham' },
      { title:'Proyek desain', type:'income', category:'Freelance', amount:1800000, date:'2025-10-10', description:'Proyek desain UI' },

      { title:'Belanja mingguan', type:'expense', category:'Makanan', amount:3200000, date:'2025-10-02', description:'Belanja mingguan' },
      { title:'Bensin & parkir', type:'expense', category:'Transportasi', amount:2500000, date:'2025-10-04', description:'Bensin dan parkir' },
      { title:'Listrik & Air', type:'expense', category:'Tagihan', amount:1200000, date:'2025-10-05', description:'Tagihan' },
      { title:'Obat & vitamin', type:'expense', category:'Kesehatan', amount:1000000, date:'2025-10-07', description:'Obat dan vitamin' },
      { title:'Langganan & nonton', type:'expense', category:'Hiburan', amount:650000, date:'2025-10-09', description:'Streaming & bioskop' }
    ];

    for (const t of tx) {
      await pool.query(
        `INSERT INTO transactions (title, amount, type, category, description, date, user_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
         [t.title, t.amount, t.type, t.category, t.description, t.date, userId]
      );
    }

    console.log('Seed selesai. user demo / demo123');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
