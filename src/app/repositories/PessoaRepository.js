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
    const { nomerazaosocial, documento, contato, observacao } = data;
    return consulta(
      "INSERT INTO PessoaBase (NomeRazaoSocial, Documento, Contato, Observacao) VALUES ($1, $2, $3, $4) RETURNING *",
      [nomerazaosocial, documento, contato, observacao]
    );
  }

  // Atualizar pessoa
  update(id, data) {
    const { nomerazaosocial, documento, contato, observacao } = data;
    return consulta(
      "UPDATE PessoaBase SET NomeRazaoSocial = $1, Documento = $2, Contato = $3, Observacao = $4 WHERE PessoaID = $5 RETURNING *",
      [nomerazaosocial, documento, contato, observacao, id]
    );
  }

  // Deletar pessoa
  delete(id) {
    return consulta("DELETE FROM PessoaBase WHERE PessoaID = $1 RETURNING *", [id]);
  }
}

export default new PessoaRepository();
