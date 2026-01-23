// src/server.js
import app from "./app.js";
import conexao from "./app/database/conexao.js";

const PORT = process.env.PORT || 8080;

conexao.connect((err) => {
  if (err) {
    console.error("Erro ao conectar no banco:", err.stack);
    process.exit(1);
  }
  console.log("Conectado ao PostgreSQL");
  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
});
