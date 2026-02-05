
import "dotenv/config"; 
import app from "./app.js";
import conexao from "./app/database/conexao.js";

const PORT = process.env.PORT || 8080;

conexao.connect((err, client, release) => {
  if (err) {
    console.error("Erro ao conectar no banco:", err.stack);
    // Não mata o processo, tenta reconectar ou segue (opcional, mas melhor avisar)
    process.exit(1); 
  }
  
  // Se conectou, libera a conexão imediatamente para não travar o pool
  release();
  
  console.log("Conectado ao PostgreSQL");
  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
});
