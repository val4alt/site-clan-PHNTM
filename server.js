const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const app = express();
const PORT = process.env.PORT || 3000;

// On garde uniquement l'initialisation de base qui marchait au tout début
const supabase = createClient(
    "https://mzgiyvcdlpjlmsmsesig.supabase.co", 
    "sb_publishable_cnU5IU4CYBAaQ1qrJdseKQ_dQ07IJY1"
);

app.use(express.json());
app.use(express.static('public'));

// Récupération classique
app.get('/api/players', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('players')
            .select('*');
        if (error) return res.status(500).json({ error: error.message });
        res.json(data || []);
    } catch (err) {
        res.status(500).json({ error: "Erreur" });
    }
});

// L'ancienne méthode d'enregistrement directe et fonctionnelle
app.post('/api/players', async (req, res) => {
    const { pseudo, rank, note, password } = req.body;

    // Vérification simple du mot de passe
    if (password !== "PHNTM") {
        return res.status(403).json({ success: false, error: "Clé incorrecte !" });
    }

    try {
        // Enregistrement direct comme dans ton tout premier script
        const { data, error } = await supabase
            .from('players')
            .insert([{ pseudo, rank, note }]);

        if (error) {
            // Si le joueur existe déjà, on fait une mise à jour simple
            const { error: updError } = await supabase
                .from('players')
                .update({ rank, note })
                .eq('pseudo', pseudo);
                
            if (updError) return res.status(500).json({ error: updError.message });
        }
        
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Erreur" });
    }
});

app.listen(PORT, () => {
    console.log(`Serveur en ligne sur le port ${PORT}`);
});
