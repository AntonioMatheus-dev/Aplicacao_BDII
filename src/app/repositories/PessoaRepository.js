import { consulta } from "../database/conexao.js";

class PessoaRepository {
  // Buscar todas as pessoas
  findAll() {
    const sql = `
      SELECT p.*, 
             CASE WHEN c.ClienteID IS NOT NULL THEN true ELSE false END as e_cliente,
             CASE WHEN f.FornecedorID IS NOT NULL THEN true ELSE false END as e_fornecedor
      FROM PessoaBase p
      LEFT JOIN Cliente c ON p.PessoaID = c.PessoaID
      LEFT JOIN Fornecedor f ON p.PessoaID = f.PessoaID
      ORDER BY p.NomeRazaoSocial;
    `;
    return consulta(sql);
  }


  findById(id) {
    return consulta("SELECT * FROM PessoaBase WHERE PessoaID = $1", [id]);
  }

  store(data) {
    const { nomerazaosocial, documento, contato, observacao } = data;
    return consulta(
      "INSERT INTO PessoaBase (NomeRazaoSocial, Documento, Contato, Observacao) VALUES ($1, $2, $3, $4) RETURNING *",
      [nomerazaosocial, documento, contato, observacao]
    );
  }

  update(id, data) {
    const { nomerazaosocial, documento, contato, observacao } = data;
    return consulta(
      "UPDATE PessoaBase SET NomeRazaoSocial = $1, Documento = $2, Contato = $3, Observacao = $4 WHERE PessoaID = $5 RETURNING *",
      [nomerazaosocial, documento, contato, observacao, id]
    );
  }

  delete(id) {
    return consulta("DELETE FROM PessoaBase WHERE PessoaID = $1 RETURNING *", [id]);
  }
}

export default new PessoaRepository();
