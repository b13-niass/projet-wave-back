// config/db.ts
import { Pool } from 'pg';

// Charger les variables d'environnement
const { DATABASE_URL } = process.env;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL n'est pas définie dans le fichier .env");
}

// Créer une nouvelle instance de Pool
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Pour les connexions sécurisées sur Neon (si nécessaire)
  },
});

// Vérifier la connexion
pool.connect()
  .then(client => {
    console.log("Connecté à la base de données PostgreSQL sur Neon");
    client.release();
  })
  .catch(err => console.error("Erreur de connexion à la base de données : ", err));

export default pool;
