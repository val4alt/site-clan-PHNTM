const express = require('express');
const { createClient } = require('@supabase/supabase-client');
const app = express();
const PORT = process.env.PORT || 3000;

// Connexion à Supabase (Remplace avec TES clés entre les guillemets !)
const SUPABASE_URL = "https://discord.com/channels/@me/1518734940773290039/1524352183359897710";
const SUPABASE_KEY = "sb_secret_zO_11SIG_xIPryKEzDAbQg_a5nCnOKR";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

app.use(express.json());
app.use(express.static('public'));

// Récupérer les joueurs depuis la base de données
app.get('/api/players', async (req, res) => {
    const { data, error } = await supabase.from('players').select('*').order('id', { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
});

// Ajouter ou modifier un joueur
app.post('/api/players', async (req, res) => {
    const { pseudo, rank, note } = req.body;
    
    // On regarde si le joueur existe déjà
    const { data: existing } = await supabase.from('players').select('*').eq('pseudo', pseudo).single();

    if (existing) {
        // S'il existe, on le met à jour
        const { error } = await supabase.from('players').update({ rank, note }).eq('pseudo', pseudo);
        if (error) return res.status(500).json({ error: error.message });
    } else {
        // Sinon, on le crée
        const { error } = await supabase.from('players').insert([{ pseudo, rank, note }]);
        if (error) return res.status(500).json({ error: error.message });
    }
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
