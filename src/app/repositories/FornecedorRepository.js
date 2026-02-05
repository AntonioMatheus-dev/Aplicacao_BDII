import { consulta } from "../database/conexao.js";

class FornecedorRepository {
  // Buscar todos os fornecedores com dados da PessoaBase
  findAll() {
    const sql = `
      SELECT f.FornecedorID, p.PessoaID, p.NomeRazaoSocial, p.Documento AS CNPJ, p.Contato, 
            p.Observacao, f.DataCadastro,
            p.Contato AS Telefone, p.Observacao AS Email 
      FROM Fornecedor f
      JOIN PessoaBase p ON f.PessoaID = p.PessoaID
      ORDER BY p.NomeRazaoSocial;
    `;
    return consulta(sql, []);
  }

  // Buscar fornecedor por ID
  findById(id) {
    const sql = `
      SELECT f.FornecedorID, p.PessoaID, p.NomeRazaoSocial, p.Documento AS CNPJ, p.Contato, p.Observacao, f.DataCadastro
      FROM Fornecedor f
      JOIN PessoaBase p ON f.PessoaID = p.PessoaID
      WHERE f.FornecedorID = $1;
    `;
    return consulta(sql, [id]);
  }

  // Criar fornecedor novo (Transação PessoaBase -> Fornecedor)
  store(data) {
    const { nome, cnpj, email, telefone } = data;
    const contatoStr = `${telefone || ''} ${email || ''}`.trim();

    const sqlPessoa = `
      INSERT INTO PessoaBase (NomeRazaoSocial, Documento, Contato, Observacao)
      VALUES ($1, $2, $3, $4)
      RETURNING PessoaID;
    `;

    return consulta(sqlPessoa, [nome, cnpj, contatoStr, email])
      .then(result => {
        const pessoaId = result[0].pessoaid;
        const sqlFornecedor = `
          INSERT INTO Fornecedor (PessoaID, DataCadastro)
          VALUES ($1, NOW())
          RETURNING FornecedorID;
        `;
        return consulta(sqlFornecedor, [pessoaId]);
      });
  }

  promote(pessoaId) {
    const sqlCheck = "SELECT 1 FROM Fornecedor WHERE PessoaID = $1";
    return consulta(sqlCheck, [pessoaId]).then(rows => {
      if (rows && rows.length > 0) {
        throw new Error("Pessoa já é um fornecedor");
      }
      const sql = "INSERT INTO Fornecedor (PessoaID, DataCadastro) VALUES ($1, NOW()) RETURNING *";
      return consulta(sql, [pessoaId]);
    });
  }

  // Atualizar fornecedor
  update(id, data) {
    const { nome, cnpj, email, telefone } = data;
    const contatoStr = `${telefone || ''} ${email || ''}`.trim();

    const sql = `
      UPDATE PessoaBase 
      SET NomeRazaoSocial = $1, Documento = $2, Contato = $3, Observacao = $4
      WHERE PessoaID = (SELECT PessoaID FROM Fornecedor WHERE FornecedorID = $5)
      RETURNING PessoaID;
    `;
    
    return consulta(sql, [nome, cnpj, contatoStr, email, id]);
  }

  // Deletar fornecedor
  delete(id) {
    const sqlFind = "SELECT PessoaID FROM Fornecedor WHERE FornecedorID = $1";
    return consulta(sqlFind, [id])
      .then(rows => {
        if (!rows || rows.length === 0) {
          throw new Error("Fornecedor não encontrado");
        }
        const pessoaId = rows[0].pessoaid;
        const sqlDelete = "DELETE FROM PessoaBase WHERE PessoaID = $1 RETURNING *";
        return consulta(sqlDelete, [pessoaId]);
      });
  }
}

export default new FornecedorRepository();
