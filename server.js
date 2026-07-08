const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const app = express();
const PORT = process.env.PORT || 3000;

// Connexion à Supabase
const SUPABASE_URL = "https://mzgiyvcdlpjlmsmsesig.supabase.co"; 
const SUPABASE_KEY = "sb_publishable_cnU5IU4CYBAaQ1qrJdseKQ_dQ07IJY1"; // Ta clé publique anon
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Ton mot de passe secret pour le Mode Édition (Tu peux le changer ici)
const ADMIN_PASSWORD = "Val2008*"; 

app.use(express.json());
app.use(express.static('public'));

// Récupérer les joueurs depuis la base de données
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

// Ajouter ou modifier un joueur (Sécurisé par mot de passe)
app.post('/api/players', async (req, res) => {
    const { pseudo, rank, note, password } = req.body;

    // Vérification du mot de passe admin
    if (password !== ADMIN_PASSWORD) {
        return res.status(403).json({ success: false, error: "Clé d'administration incorrecte !" });
    }

    if (!pseudo) {
        return res.status(400).json({ success: false, error: "Le pseudo est requis." });
    }

    try {
        // On regarde si le joueur existe déjà
        const { data: existing } = await supabase
            .from('players')
            .select('*')
            .eq('pseudo', pseudo)
            .single();

        if (existing) {
            // S'il existe, on le met à jour
            const { error } = await supabase
                .from('players')
                .update({ rank: rank.toUpperCase(), note })
                .eq('pseudo', pseudo);
                
            if (error) return res.status(500).json({ error: error.message });
        } else {
            // Sinon, on le crée
            const { error } = await supabase
                .from('players')
                .insert([{ pseudo, rank: rank.toUpperCase(), note }]);
                
            if (error) return res.status(500).json({ error: error.message });
        }
        
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Erreur lors de la communication avec la base de données" });
    }
});

app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
