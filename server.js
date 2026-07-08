const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const app = express();
const PORT = process.env.PORT || 3000;

// Connexion à Supabase avec la nouvelle clé Publishable standard
const SUPABASE_URL = "https://mzgiyvcdlpjlmsmsesig.supabase.co"; 
const SUPABASE_KEY = "sb_publishable_cnU5IU4CYBAaQ1qrJdseKQ_dQ07IJY1"; 

// Initialisation avec les options requises pour les nouvelles clés Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
        persistSession: false,
        autoRefreshToken: false
    }
});

// Ton mot de passe secret pour le Mode Édition
const ADMIN_PASSWORD = "PHNTM"; 

app.use(express.json());
app.use(express.static('public'));

// Récupérer les joueurs
app.get('/api/players', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('players')
            .select('*')
            .order('id', { ascending: true });
            
        if (error) return res.status(500).json({ error: error.message });
        res.json(data || []);
    } catch (err) {
        res.status(500).json({ error: "Erreur serveur" });
    }
});

// Ajouter ou modifier un joueur
app.post('/api/players', async (req, res) => {
    const { pseudo, rank, note, password } = req.body;

    if (password !== ADMIN_PASSWORD) {
        return res.status(403).json({ success: false, error: "Clé d'administration incorrecte !" });
    }

    if (!pseudo) {
        return res.status(400).json({ success: false, error: "Le pseudo est requis." });
    }

    try {
        const { data: existing } = await supabase
            .from('players')
            .select('*')
            .eq('pseudo', pseudo)
            .maybeSingle(); // Plus robuste que single() s'il n'y a rien

        if (existing) {
            const { error } = await supabase
                .from('players')
                .update({ rank: rank.toUpperCase(), note })
                .eq('pseudo', pseudo);
                
            if (error) return res.status(500).json({ error: error.message });
        } else {
            const { error } = await supabase
                .from('players')
                .insert([{ pseudo, rank: rank.toUpperCase(), note }]);
                
            if (error) return res.status(500).json({ error: error.message });
        }
        
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Erreur bdd" });
    }
});

app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
