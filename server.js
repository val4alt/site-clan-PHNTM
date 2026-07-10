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

app.listen(PORT, () => console.log(`Serveur actif sur le port ${PORT}`));
