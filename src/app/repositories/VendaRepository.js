// repositories/VendaRepository.js
import { consulta } from "../database/conexao.js";

class VendaRepository {
  // Buscar todas as vendas com detalhes
  findAll() {
    const sql = `
      SELECT v.VendaID, v.DataVenda, v.Quantidade, v.PrecoUnitario, v.ValorTotal,
             p.ProdutoID, p.NomeProduto, p.Categoria,
             c.ClienteID, pb.NomeRazaoSocial AS NomeCliente
      FROM Vendas v
      JOIN Produtos p ON p.ProdutoID = v.ProdutoID
      JOIN Cliente c ON c.ClienteID = v.ClienteID
      JOIN PessoaBase pb ON c.PessoaID = pb.PessoaID
      ORDER BY v.DataVenda DESC;
    `;
    return consulta(sql, []);
  }

  // Buscar venda por ID
  findById(id) {
    return consulta("SELECT * FROM Vendas WHERE VendaID = $1", [id]);
  }

  // Registrar venda usando a PROCEDURE
  registrar(p_produto_id, p_cliente_id, p_quantidade, p_preco_unitario) {
    const sql = "CALL registrar_venda($1, $2, $3, $4)";
    return consulta(sql, [p_produto_id, p_cliente_id, p_quantidade, p_preco_unitario], 
      "Erro ao registrar venda");
  }
}

export default new VendaRepository();
