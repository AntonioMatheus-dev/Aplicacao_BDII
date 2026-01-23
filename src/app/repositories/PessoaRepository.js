// repositories/PessoaRepository.js
import { consulta } from "../database/conexao.js";

class PessoaRepository {
  // Buscar todas as pessoas
  findAll() {
    return consulta("SELECT * FROM PessoaBase");
  }

  // Buscar pessoa por ID
  findById(id) {
    return consulta("SELECT * FROM PessoaBase WHERE PessoaID = $1", [id]);
  }

  // Criar pessoa
  store(data) {
    const { nome, email, tipo } = data;
    return consulta(
      "INSERT INTO PessoaBase (NomeRazaoSocial, Email, Tipo) VALUES ($1, $2, $3) RETURNING *",
      [nome, email, tipo]
    );
  }

  // Atualizar pessoa
  update(id, data) {
    const { nome, email, tipo } = data;
    return consulta(
      "UPDATE PessoaBase SET NomeRazaoSocial = $1, Email = $2, Tipo = $3 WHERE PessoaID = $4 RETURNING *",
      [nome, email, tipo, id]
    );
  }

  // Deletar pessoa
  delete(id) {
    return consulta("DELETE FROM PessoaBase WHERE PessoaID = $1 RETURNING *", [id]);
  }
}

export default new PessoaRepository();
