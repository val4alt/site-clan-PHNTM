const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const SUPABASE_URL = "https://mzgiyvcdlpjlmsmsesig.supabase.co"; 
const SUPABASE_KEY = "sb_publishable_cnU5IU4CYBAaQ1qrJdseKQ_dQ07IJY1"; 

app.use(express.json());
app.use(express.static('public'));

// 1. CHARGEMENT DES MEMBRES
app.get('/api/players', async (req, res) => {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/players`, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });
        if (!response.ok) return res.status(500).json({ error: "Erreur Supabase" });
        const data = await response.json();
        res.json(data || []);
    } catch (err) {
        res.status(500).json({ error: "Crash serveur" });
    }
});

// 2. ENREGISTREMENT SÉCURISÉ
app.post('/api/players', async (req, res) => {
    const { pseudo, rank, note, password } = req.body;

    if (password !== "PHNTM") {
        return res.status(403).json({ success: false, error: "Clé incorrecte !" });
    }

    try {
        // Envoi direct à l'API Supabase
        const response = await fetch(`${SUPABASE_URL}/rest/v1/players`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify({ pseudo, rank, note })
        });

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Erreur bdd" });
    }
});

app.listen(PORT, () => {
    console.log(`Serveur démarré`);
});
