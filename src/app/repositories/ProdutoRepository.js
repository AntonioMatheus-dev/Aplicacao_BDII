// repositories/ProdutoRepository.js
import { consulta } from "../database/conexao.js";

class ProdutoRepository {
  create(params) {
    const sql = `
      INSERT INTO Produtos (NomeProduto, Categoria, PrecoVenda, Estoque, PrecoCusto)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    return consulta(sql, params, "Não foi possível cadastrar produto");
  }

  findAll() {
    const sql = "SELECT * FROM Produtos ORDER BY NomeProduto;";
    return consulta(sql, [], "Não foi possível listar produtos");
  }

  findById(id) {
    const sql = "SELECT * FROM Produtos WHERE ProdutoID = $1;";
    return consulta(sql, [id], "Produto não encontrado");
  }

  update(params) {
    const sql = `
      UPDATE Produtos 
      SET NomeProduto = $1, Categoria = $2, PrecoVenda = $3, PrecoCusto = $4
      WHERE ProdutoID = $5
      RETURNING *;
    `;
    return consulta(sql, params, "Não foi possível atualizar produto");
  }

  delete(id) {
    const sql = "DELETE FROM Produtos WHERE ProdutoID = $1;";
    return consulta(sql, [id], "Não foi possível apagar produto");
  }

  // Usa a FUNCTION que você criou
  verificarEstoqueBaixo(limite) {
    const sql = "SELECT * FROM verificar_estoque_baixo($1);";
    return consulta(sql, [limite], "Erro ao verificar estoque");
  }
}

export default new ProdutoRepository();
