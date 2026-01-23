// repositories/FornecedorRepository.js
import { consulta } from "../database/conexao.js";

class FornecedorRepository {
  // Buscar todos os fornecedores
  findAll() {
    return consulta("SELECT * FROM Fornecedor");
  }

  // Buscar fornecedor por ID
  findById(id) {
    return consulta("SELECT * FROM Fornecedor WHERE FornecedorID = $1", [id]);
  }

  // Criar fornecedor novo
  store(data) {
    const { nome, cnpj, email, telefone } = data;
    return consulta(
      "INSERT INTO Fornecedor (NomeRazaoSocial, CNPJ, Email, Telefone) VALUES ($1, $2, $3, $4) RETURNING *",
      [nome, cnpj, email, telefone]
    );
  }

  // Atualizar fornecedor
  update(id, data) {
    const { nome, cnpj, email, telefone } = data;
    return consulta(
      "UPDATE Fornecedor SET NomeRazaoSocial = $1, CNPJ = $2, Email = $3, Telefone = $4 WHERE FornecedorID = $5 RETURNING *",
      [nome, cnpj, email, telefone, id]
    );
  }

  // Deletar fornecedor
  delete(id) {
    return consulta("DELETE FROM Fornecedor WHERE FornecedorID = $1 RETURNING *", [id]);
  }
}

export default new FornecedorRepository();
