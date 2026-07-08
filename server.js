const express = require('express');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Val2008*";

app.use(express.json());
app.use(express.static('public'));

const DATA_FILE = './data.json';

// Initialisation : crée le fichier avec des exemples si absent
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([
        { pseudo: "Coco", rank: "Phantom", note: "Mouvement, Aim et Save parfait" },
    ]));
}

app.get('/api/players', (req, res) => {
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        res.json(JSON.parse(data || '[]'));
    });
});

app.post('/api/players', (req, res) => {
    const { pseudo, rank, note, password } = req.body;
    if (password !== ADMIN_PASSWORD) return res.status(403).json({ error: "Clé incorrecte !" });

    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        let players = JSON.parse(data || '[]');
        const index = players.findIndex(p => p.pseudo.toLowerCase() === pseudo.toLowerCase());
        if (index !== -1) players[index] = { pseudo, rank, note };
        else players.push({ pseudo, rank, note });
        
        fs.writeFile(DATA_FILE, JSON.stringify(players), () => res.json({ success: true }));
    });
});

app.delete('/api/players/:pseudo', (req, res) => {
    const { password } = req.body;
    if (password !== ADMIN_PASSWORD) return res.status(403).json({ error: "Clé incorrecte !" });

    const pseudo = req.params.pseudo;

    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        let players = JSON.parse(data || '[]');
        const filtered = players.filter(p => p.pseudo.toLowerCase() !== pseudo.toLowerCase());

        if (filtered.length === players.length) {
            return res.status(404).json({ error: "Joueur introuvable" });
        }

        fs.writeFile(DATA_FILE, JSON.stringify(filtered), () => res.json({ success: true }));
    });
});

app.listen(PORT, () => console.log(`Serveur actif sur le port ${PORT}`));
