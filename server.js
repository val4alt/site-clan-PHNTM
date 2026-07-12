const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Val2008*";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("⚠️  SUPABASE_URL et SUPABASE_ANON_KEY doivent être définies dans les variables d'environnement !");
}

const supabase = createClient(supabaseUrl, supabaseKey);

app.use(express.json());
app.use(express.static('public'));

app.get('/api/players', async (req, res) => {
    const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('id', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

app.post('/api/players', async (req, res) => {
    const { pseudo, rank, note, password } = req.body;
    if (password !== ADMIN_PASSWORD) return res.status(403).json({ error: "Clé incorrecte !" });
    if (!pseudo) return res.status(400).json({ error: "Pseudo requis" });

    const { data: existing, error: findError } = await supabase
        .from('players')
        .select('id')
        .ilike('pseudo', pseudo)
        .maybeSingle();

    if (findError) return res.status(500).json({ error: findError.message });

    if (existing) {
        const { error } = await supabase
            .from('players')
            .update({ pseudo, rank, note })
            .eq('id', existing.id);
        if (error) return res.status(500).json({ error: error.message });
    } else {
        const { error } = await supabase
            .from('players')
            .insert([{ pseudo, rank, note }]);
        if (error) return res.status(500).json({ error: error.message });
    }

    res.json({ success: true });
});

app.delete('/api/players/:pseudo', async (req, res) => {
    const { password } = req.body;
    if (password !== ADMIN_PASSWORD) return res.status(403).json({ error: "Clé incorrecte !" });

    const pseudo = req.params.pseudo;

    const { data, error } = await supabase
        .from('players')
        .delete()
        .ilike('pseudo', pseudo)
        .select();

    if (error) return res.status(500).json({ error: error.message });
    if (!data || data.length === 0) return res.status(404).json({ error: "Joueur introuvable" });

    res.json({ success: true });
});

app.get('/api/combats', async (req, res) => {
    const { data, error } = await supabase
        .from('combats')
        .select('*')
        .order('combat_date', { ascending: false })
        .order('id', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

app.post('/api/combats', async (req, res) => {
    const { combat_date, player1, player2, score1, score2, password } = req.body;
    if (password !== ADMIN_PASSWORD) return res.status(403).json({ error: "Clé incorrecte !" });
    if (!combat_date || !player1 || !player2) return res.status(400).json({ error: "Champs manquants" });

    const { error } = await supabase
        .from('combats')
        .insert([{
            combat_date,
            player1,
            player2,
            score1: (score1 === '' || score1 === undefined || score1 === null) ? null : score1,
            score2: (score2 === '' || score2 === undefined || score2 === null) ? null : score2
        }]);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
});

app.delete('/api/combats/:id', async (req, res) => {
    const { password } = req.body;
    if (password !== ADMIN_PASSWORD) return res.status(403).json({ error: "Clé incorrecte !" });

    const { error } = await supabase
        .from('combats')
        .delete()
        .eq('id', req.params.id);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
});

app.listen(PORT, () => console.log(`Serveur actif sur le port ${PORT}`));
