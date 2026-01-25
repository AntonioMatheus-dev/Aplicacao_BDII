// repositories/FornecedorRepository.js
import { consulta } from "../database/conexao.js";

class FornecedorRepository {
  // Buscar todos os fornecedores com dados da PessoaBase
  findAll() {
    const sql = `
      SELECT f.FornecedorID, p.PessoaID, p.NomeRazaoSocial, p.Documento AS CNPJ, p.Contato, 
             p.Observacao, f.DataCadastro,
             -- Map specific fields if needed, e.g. email/telefone might be in Contact or separate if schema allowed.
             -- Based on provided schema: PessoaBase has (NomeRazaoSocial, Documento, Contato, Observacao).
             -- Fornecedor has no extra fields locally besides IDs/Dates.
             p.Contato AS Telefone, -- Assuming Contact field holds phone/email combined or specific
             p.Observacao AS Email -- Or matching how user data is stored
      FROM Fornecedor f
      JOIN PessoaBase p ON f.PessoaID = p.PessoaID
      ORDER BY p.NomeRazaoSocial;
    `;
    return consulta(sql, []);
  }

  // Buscar fornecedor por ID
  findById(id) {
    const sql = `
      SELECT f.FornecedorID, p.PessoaID, p.NomeRazaoSocial, p.Documento AS CNPJ, p.Contato, 
             p.Observacao, f.DataCadastro
      FROM Fornecedor f
      JOIN PessoaBase p ON f.PessoaID = p.PessoaID
      WHERE f.FornecedorID = $1;
    `;
    return consulta(sql, [id]);
  }

  // Criar fornecedor novo (Transação PessoaBase -> Fornecedor)
  store(data) {
    const { nome, cnpj, email, telefone } = data;
    // Map frontend fields (nome, cnpj, email, telefone) to DB fields (NomeRazaoSocial, Documento, Contato, Observacao)
    // We'll combine email/telefone into Contato or Observacao if schema doesn't match perfectly, 
    // but user schema only showed (Nome, Doc, Contato, Obs).
    // Let's assume Contato = Telefone, Observacao = Email for now or combine string.
    
    // Better strategy: Contato = `Tel: ${telefone} | Email: ${email}`
    const contatoStr = `${telefone || ''} ${email || ''}`.trim();

    const sqlPessoa = `
      INSERT INTO PessoaBase (NomeRazaoSocial, Documento, Contato, Observacao)
      VALUES ($1, $2, $3, $4)
      RETURNING PessoaID;
    `;

    return consulta(sqlPessoa, [nome, cnpj, contatoStr, email]) // Passing email as Obs for now
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
    // Primeiro buscamos o PessoaID associado a este fornecedor
    const sqlFind = "SELECT PessoaID FROM Fornecedor WHERE FornecedorID = $1";
    
    return consulta(sqlFind, [id])
      .then(rows => {
        if (!rows || rows.length === 0) {
          throw new Error("Fornecedor não encontrado");
        }
        const pessoaId = rows[0].pessoaid;
        
        // Deletamos a PessoaBase. 
        // Assumindo que o banco está configurado com ON DELETE CASCADE na FK do Fornecedor,
        // isso deletará também o registro na tabela Fornecedor automatically.
        // Se não tiver CASCADE, precisariamos deletar o Fornecedor antes.
        // Mas a lógica correta para "remover o cadastro completo" é remover a Pessoa.
        const sqlDelete = "DELETE FROM PessoaBase WHERE PessoaID = $1 RETURNING *";
        return consulta(sqlDelete, [pessoaId]);
      });
  }
}

export default new FornecedorRepository();
