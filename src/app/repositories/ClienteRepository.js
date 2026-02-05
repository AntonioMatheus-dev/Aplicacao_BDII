import { consulta } from "../database/conexao.js";

class ClienteRepository {
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
 
        const sqlCliente = `
          INSERT INTO Cliente (PessoaID, DataCadastro)
          VALUES ($1, NOW())
          RETURNING ClienteID;
        `;
        
        return consulta(sqlCliente, [pessoaId]);
      });
  }

  promote(pessoaId) {
    const sqlCheck = "SELECT 1 FROM Cliente WHERE PessoaID = $1";
    return consulta(sqlCheck, [pessoaId]).then(rows => {
      if (rows && rows.length > 0) {
        throw new Error("Pessoa já é um cliente");
      }
      const sql = "INSERT INTO Cliente (PessoaID, DataCadastro) VALUES ($1, NOW()) RETURNING *";
      return consulta(sql, [pessoaId]);
    });
  }


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
    const sqlFind = "SELECT PessoaID FROM Cliente WHERE ClienteID = $1";
    
    return consulta(sqlFind, [id])
      .then(rows => {
        if (!rows || rows.length === 0) {
           throw new Error("Cliente não encontrado");
        }
        const pessoaId = rows[0].pessoaid;
        
        // Deletar a PessoaBase (Cascade deve deletar o Cliente)
        const sqlDelete = "DELETE FROM PessoaBase WHERE PessoaID = $1 RETURNING *";
        return consulta(sqlDelete, [pessoaId]);
      });
  }
}

export default new ClienteRepository();
