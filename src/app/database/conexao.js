import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false 
});

pool.on("error", (err) => {
  console.error("Erro não esperado no pool:", err);
});

export const consulta = (sql, valores = [], menssagemReject) => {
  return new Promise((resolve, reject) => {
    pool.query(sql, valores, (erro, result) => {
      if (erro) return reject(menssagemReject || erro.message);
      const row = result.rows;
      return resolve(row);
    });
  });
};

export default pool;