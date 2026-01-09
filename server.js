const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// 1. CONNECTION CONFIG
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Nihaal2008', // <--- CHECK THIS
    multipleStatements: true
};

const db = mysql.createConnection(dbConfig);

// 2. INITIALIZE DATABASE
db.connect((err) => {
    if (err) {
        console.error('❌ Connection Failed:', err.message);
        return;
    }
    console.log('✅ Connected to MySQL Server.');

    const initSQL = `
        CREATE DATABASE IF NOT EXISTS neevtimes_db;
        USE neevtimes_db;
        
        CREATE TABLE IF NOT EXISTS articles (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255),
            category TEXT,
            author VARCHAR(100),
            date VARCHAR(50),
            image TEXT,
            excerpt TEXT,
            content TEXT
        );

        CREATE TABLE IF NOT EXISTS site_settings (
            id INT PRIMARY KEY,
            hero_headline VARCHAR(255),
            hero_subtext TEXT,
            hero_image TEXT,
            hero_tagline VARCHAR(255) -- New Column
        );
        
        INSERT IGNORE INTO site_settings (id, hero_headline, hero_subtext, hero_image, hero_tagline) 
        VALUES (1, 'The Neev Times', 'Voice of the Students', 'https://images.unsplash.com/photo-1504711434969-e33886168f5c', 'Est. 2024');
    `;

    db.query(initSQL, (err) => {
        if (err) console.error("❌ Init Error:", err.message);
        else console.log("✅ Database Ready.");
    });
});

// --- HERO ROUTES ---

app.get('/hero', (req, res) => {
    db.query("SELECT * FROM site_settings WHERE id = 1", (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result[0]);
    });
});

app.post('/hero', (req, res) => {
    const { hero_headline, hero_subtext, hero_image, hero_tagline } = req.body;
    
    console.log("📝 Updating Hero:", req.body);

    const sql = "UPDATE site_settings SET hero_headline=?, hero_subtext=?, hero_image=?, hero_tagline=? WHERE id=1";
    db.query(sql, [hero_headline, hero_subtext, hero_image, hero_tagline], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Hero Updated" });
    });
});

// --- ARTICLE ROUTES ---
// (Standard Article Routes kept simple for brevity - they are unchanged)
app.get('/articles', (req, res) => {
    db.query("SELECT * FROM articles ORDER BY id DESC", (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

app.get('/articles/:id', (req, res) => {
    db.query("SELECT * FROM articles WHERE id = ?", [req.params.id], (err, results) => {
        if (err) return res.status(500).json(err);
        if (results.length === 0) return res.status(404).json({ error: "Not Found" });
        res.json(results[0]);
    });
});

app.post('/articles', (req, res) => {
    const { title, category, author, date, image, excerpt, content } = req.body;
    const sql = `INSERT INTO articles (title, category, author, date, image, excerpt, content) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.query(sql, [title, category, author, date, image, excerpt, content], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Published", id: result.insertId });
    });
});

app.put('/articles/:id', (req, res) => {
    const { title, category, author, image, excerpt, content } = req.body;
    const sql = `UPDATE articles SET title=?, category=?, author=?, image=?, excerpt=?, content=? WHERE id=?`;
    db.query(sql, [title, category, author, image, excerpt, content, req.params.id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Updated" });
    });
});

app.delete('/articles/:id', (req, res) => {
    db.query("DELETE FROM articles WHERE id = ?", [req.params.id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Deleted" });
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});