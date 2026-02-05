import pool, { consulta } from "../database/conexao.js";

class VendaRepository {
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

  findById(id) {
    return consulta("SELECT * FROM Vendas WHERE VendaID = $1", [id]);
  }
// PROCEDURE
  async registrar(p_produto_id, p_cliente_id, p_quantidade, p_preco_unitario) {
    const sql = "CALL registrar_venda($1, $2, $3, $4)";
    const valores = [p_produto_id, p_cliente_id, p_quantidade, p_preco_unitario];
    return consulta(sql, valores);
  }

  delete(id) {
    return consulta("SELECT * FROM Vendas WHERE VendaID = $1", [id])
      .then(rows => {
        if (!rows || rows.length === 0) throw new Error("Venda não encontrada");
        const venda = rows[0];
        
        const sqlEstorno = "UPDATE Produtos SET Estoque = Estoque + $1 WHERE ProdutoID = $2";
        return consulta(sqlEstorno, [venda.quantidade, venda.produtoid])
          .then(() => {
             const sqlDelMov = "DELETE FROM MovimentacaoEstoque WHERE documento_referencia = $1";
             return consulta(sqlDelMov, [`VENDA-${id}`]);
          })
          .then(() => {
             return consulta("DELETE FROM Vendas WHERE VendaID = $1", [id]);
          });
      });
  }

  update(id, data) {
    const quantidade = parseInt(data.quantidade);
    const precoUnitario = parseFloat(data.precoUnitario);
    
    if (isNaN(quantidade) || quantidade <= 0) return Promise.reject(new Error("Quantidade inválida"));
    if (isNaN(precoUnitario) || precoUnitario < 0) return Promise.reject(new Error("Preço inválido"));

    return consulta("SELECT * FROM Vendas WHERE VendaID = $1", [id])
      .then(rows => {
        if (!rows || rows.length === 0) throw new Error("Venda não encontrada");
        const vendaAntiga = rows[0];
        
        const diffQtd = quantidade - vendaAntiga.quantidade;
        
        let promiseEstoque = Promise.resolve();
        
        if (diffQtd !== 0) {
             const sqlUpdateEstoque = "UPDATE Produtos SET Estoque = Estoque - $1 WHERE ProdutoID = $2";
             promiseEstoque = consulta(sqlUpdateEstoque, [diffQtd, vendaAntiga.produtoid]);
        }
        
        return promiseEstoque.then(() => {
             const valorTotal = quantidade * precoUnitario;
             const sqlUpdateVenda = `
                UPDATE Vendas 
                SET Quantidade = $1, PrecoUnitario = $2, ValorTotal = $3
                WHERE VendaID = $4
             `;
             return consulta(sqlUpdateVenda, [quantidade, precoUnitario, valorTotal, id]);
        }).then(() => {
             const sqlUpdateMov = "UPDATE MovimentacaoEstoque SET quantidade = $1 WHERE documento_referencia = $2";
             return consulta(sqlUpdateMov, [quantidade, `VENDA-${id}`]); 
        });
      });
  }
}

export default new VendaRepository();
