const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Informations de ton projet Supabase
const SUPABASE_URL = "https://mzgiyvcdlpjlmsmsesig.supabase.co"; 
const SUPABASE_KEY = "sb_publishable_cnU5IU4CYBAaQ1qrJdseKQ_dQ07IJY1"; 

// Mot de passe pour le Mode Édition
const ADMIN_PASSWORD = "Val2008*"; 

app.use(express.json());
app.use(express.static('public'));

// 1. RECUPERER LES JOUEURS
app.get('/api/players', async (req, res) => {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/players?order=id.asc`, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) throw new Error("Erreur Supabase API");
        const data = await response.json();
        res.json(data || []);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Impossible de charger les données" });
    }
});

// 2. AJOUTER OU MODIFIER UN JOUEUR
app.post('/api/players', async (req, res) => {
    const { pseudo, rank, note, password } = req.body;

    if (password !== ADMIN_PASSWORD) {
        return res.status(403).json({ success: false, error: "Clé d'administration incorrecte !" });
    }

    if (!pseudo) {
        return res.status(400).json({ success: false, error: "Le pseudo est requis." });
    }

    try {
        // On vérifie d'abord si le joueur existe
        const checkRes = await fetch(`${SUPABASE_URL}/rest/v1/players?pseudo=eq.${encodeURIComponent(pseudo)}`, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });
        
        const existing = await checkRes.json();

        if (existing && existing.length > 0) {
            // S'il existe, on UPDATE
            const updateRes = await fetch(`${SUPABASE_URL}/rest/v1/players?pseudo=eq.${encodeURIComponent(pseudo)}`, {
                method: 'PATCH',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({ rank: rank.toUpperCase(), note })
            });
            if (!updateRes.ok) throw new Error("Échec de la mise à jour");
        } else {
            // Sinon, on INSERT
            const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/players`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({ pseudo, rank: rank.toUpperCase(), note })
            });
            if (!insertRes.ok) throw new Error("Échec de l'insertion");
        }

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur lors de l'enregistrement" });
    }
});

app.listen(PORT, () => {
    console.log(`Serveur actif sur le port ${PORT}`);
});
