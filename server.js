const express = require('express');
const Datastore = require('nedb-promises');
const path = require('path');

const app = express();
const db = Datastore.create({ filename: 'players.db', autoload: true });

// 🔒 CHANGE TON MOT DE PASSE ICI :
const ADMIN_PASSWORD = "Val2008*";

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Récupérer tous les joueurs
app.get('/api/players', async (req, res) => {
    try {
        const players = await db.find({});
        res.json(players);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Ajouter ou modifier un joueur (Vérification du mot de passe)
app.post('/api/players', async (req, res) => {
    const { password, name, rank, note, id } = req.body;
    
    if (password !== ADMIN_PASSWORD) {
        return res.status(403).json({ error: "Mot de passe incorrect !" });
    }

    try {
        if (id) {
            // Modification
            await db.update({ _id: id }, { name, rank, note });
            res.json({ success: true, message: "Joueur modifié !" });
        } else {
            // Ajout
            const newPlayer = await db.insert({ name, rank, note });
            res.json({ success: true, player: newPlayer });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Supprimer un joueur (Vérification du mot de passe)
app.post('/api/players/delete', async (req, res) => {
    const { password, id } = req.body;
    if (password !== ADMIN_PASSWORD) return res.status(403).json({ error: "Refusé" });

    try {
        await db.remove({ _id: id }, {});
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(3000, () => console.log('🚀 Serveur lancé sur http://localhost:3000'));