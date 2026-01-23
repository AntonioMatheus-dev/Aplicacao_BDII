// repositories/CompraRepository.js
import { consulta } from "../database/conexao.js";

class CompraRepository {
  // Buscar todas as compras com detalhes
  findAll() {
    const sql = `
      SELECT c.CompraID, c.DataCompra, c.Quantidade, c.PrecoUnitario, c.ValorTotal,
             p.ProdutoID, p.NomeProduto, p.Categoria,
             f.FornecedorID, pb.NomeRazaoSocial AS NomeFornecedor
      FROM Compras c
      JOIN Produtos p ON c.ProdutoID = p.ProdutoID
      JOIN Fornecedor f ON c.FornecedorID = f.FornecedorID
      JOIN PessoaBase pb ON f.PessoaID = pb.PessoaID
      ORDER BY c.DataCompra DESC;
    `;
    return consulta(sql, []);
  }



  
  findById(id) {
    return consulta("SELECT * FROM Compras WHERE CompraID = $1", [id]);
  }

  // Registrar compra usando a PROCEDURE
  registrar(p_produto_id, p_fornecedor_id, p_quantidade, p_preco_unitario) {
    const sql = "CALL registrar_compra($1, $2, $3, $4)";
    return consulta(sql, [p_produto_id, p_fornecedor_id, p_quantidade, p_preco_unitario], 
      "Erro ao registrar compra");
  }
}

export default new CompraRepository();
