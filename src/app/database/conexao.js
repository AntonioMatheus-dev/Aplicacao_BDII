import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "mat.1127",
  database: process.env.DB_NAME || "Trabalho_estoque",
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