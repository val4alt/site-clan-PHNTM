const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

let playersDatabase = [
    { pseudo: "Coco", rank: "Phantom", note: "Mouvement, Aim et Save parfait" }
];

// 1. CHARGEMENT DES MEMBRES
app.get('/api/players', (req, res) => {
    res.json(playersDatabase);
});

// 2. ENREGISTREMENT OU MODIFICATION
app.post('/api/players', (req, res) => {
    const { pseudo, rank, note, password } = req.body;

    if (password !== "PHNTM") {
        return res.status(403).json({ success: false, error: "Clé incorrecte !" });
    }

    if (!pseudo) {
        return res.status(400).json({ success: false, error: "Le pseudo est requis." });
    }

    const index = playersDatabase.findIndex(p => p.pseudo.toLowerCase() === pseudo.toLowerCase());

    if (index !== -1) {
        playersDatabase[index] = { pseudo, rank, note };
    } else {
        playersDatabase.push({ pseudo, rank, note });
    }

    res.json({ success: true });
});

// 3. SUPPRESSION D'UN MEMBRE
app.delete('/api/players', (req, res) => {
    const { pseudo, password } = req.body;

    if (password !== "PHNTM") {
        return res.status(403).json({ success: false, error: "Clé incorrecte !" });
    }

    playersDatabase = playersDatabase.filter(p => p.pseudo.toLowerCase() !== pseudo.toLowerCase());
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Serveur actif sur le port ${PORT}`);
});
