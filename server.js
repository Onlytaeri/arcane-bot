// server.js
import express from "express";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());

// load product list
const products = JSON.parse(fs.readFileSync("./products.json", "utf8"));

// search function
function searchProducts(query, limit = 5) {
  const q = query.toLowerCase();
  return products
    .filter((p) => p.name.toLowerCase().includes(q))
    .slice(0, limit);
}

// Webhook untuk menerima pesan dari panel
app.post("/webhook", async (req, res) => {
  const { phone, message } = req.body;

  if (!phone || !message) {
    return res.json({ reply: "Invalid payload." });
  }

  const text = message.trim().toLowerCase();

  // perintah LIST
  if (text === "list"  text === "daftar"  text === "harga") {
    return res.json({
      reply:
        "📦 *Daftar Kategori Produk*\n" +
        "- Susu\n" +
        "- Roti\n\n" +
        "Ketik nama produk untuk mencari.\nContoh: *susu*"
    });
  }

  // pencarian produk
  const results = searchProducts(text);
  if (results.length > 0) {
    let msg = 🔍 *Hasil pencarian untuk:* _${message}_\n\n;
    results.forEach((r) => {
      msg += • *${r.name}*\n  Harga: Rp ${r.price.toLocaleString()}\n  Kode: ${r.id}\n\n;
    });
    msg += "Untuk order, ketik: *order <kode> <qty>*\nContoh: order p001 2";
    return res.json({ reply: msg });
  }

  // perintah ORDER
  if (text.startsWith("order")) {
    const parts = text.split(" ");
    if (parts.length < 3) {
      return res.json({
        reply: "Format salah.\nContoh: *order p001 2*"
      });
    }

    const code = parts[1];
    const qty = parseInt(parts[2], 10);
    const product = products.find((p) => p.id === code);

    if (!product) {
      return res.json({ reply: "Kode produk tidak ditemukan." });
    }

    const total = qty * product.price;

    return res.json({
      reply:
        🛒 *Order Masuk*\n\n +
        Produk : ${product.name}\n +
        Qty     : ${qty}\n +
        Harga   : Rp ${product.price.toLocaleString()}\n +
        Total   : *Rp ${total.toLocaleString()}*\n\n +
        Silakan kirim Nama + Alamat untuk melanjutkan.
    });
  }

  // fallback
  return res.json({
    reply: Halo! Ketik *list* untuk melihat daftar produk.
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(Panel bot berjalan di port ${PORT}));
