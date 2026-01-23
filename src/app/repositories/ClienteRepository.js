// repositories/ClienteRepository.js
import { consulta } from "../database/conexao.js";

class ClienteRepository {
  // Buscar todos os clientes com dados da PessoaBase
  findAll() {
    const sql = `
      SELECT c.ClienteID, p.PessoaID, p.NomeRazaoSocial, p.Documento, p.Contato, 
             p.Observacao, c.DataCadastro
      FROM Cliente c
      JOIN PessoaBase p ON c.PessoaID = p.PessoaID
      ORDER BY p.NomeRazaoSocial;
    `;
    return consulta(sql, []);
  }

  // Buscar cliente por ID
  findById(id) {
    const sql = `
      SELECT c.ClienteID, p.PessoaID, p.NomeRazaoSocial, p.Documento, p.Contato, 
             p.Observacao, c.DataCadastro
      FROM Cliente c
      JOIN PessoaBase p ON c.PessoaID = p.PessoaID
      WHERE c.ClienteID = $1;
    `;
    return consulta(sql, [id]);
  }

  store(data) {
    const { nomerazaosocial, documento, contato, observacao } = data;
    const sqlPessoa = `
      INSERT INTO PessoaBase (NomeRazaoSocial, Documento, Contato, Observacao)
      VALUES ($1, $2, $3, $4)
      RETURNING PessoaID;
    `;
    
    return consulta(sqlPessoa, [nomerazaosocial, documento, contato, observacao])
      .then(result => {
        const pessoaId = result[0].pessoaid;
        
        // Insere na tabela Cliente
        const sqlCliente = `
          INSERT INTO Cliente (PessoaID, DataCadastro)
          VALUES ($1, NOW())
          RETURNING ClienteID;
        `;
        
        return consulta(sqlCliente, [pessoaId]);
      });
  }

  // Atualizar cliente
  update(id, data) {
    const { nomerazaosocial, documento, contato, observacao } = data;
    
    const sql = `
      UPDATE PessoaBase 
      SET NomeRazaoSocial = $1, Documento = $2, Contato = $3, Observacao = $4
      WHERE PessoaID = (SELECT PessoaID FROM Cliente WHERE ClienteID = $1)
      RETURNING PessoaID;
    `;
    
    return consulta(sql, [nomerazaosocial, documento, contato, observacao, id]);
  }


  
  delete(id) {
    const sql = `
      DELETE FROM Cliente 
      WHERE ClienteID = $1
      RETURNING ClienteID;
    `;
    return consulta(sql, [id]);
  }
}

export default new ClienteRepository();
