// repositories/CompraRepository.js
import pool, { consulta } from "../database/conexao.js";

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

  // Registrar compra usando a Procedure registrar_compra (Requisito de Procedure)
  async registrar(p_produto_id, p_fornecedor_id, p_quantidade, p_preco_unitario) {
    try {
      const sql = "CALL registrar_compra($1, $2, $3, $4)";
      const valores = [p_produto_id, p_fornecedor_id, p_quantidade, p_preco_unitario];
      return consulta(sql, valores);
    } catch (error) {
      throw new Error("Erro ao registrar compra via Procedure: " + error.message);
    }
  }

  // Deletar compra e estornar estoque
  delete(id) {
    // 1. Buscar dados da compra
    return consulta("SELECT * FROM Compras WHERE CompraID = $1", [id])
      .then(rows => {
         if (!rows || rows.length === 0) throw new Error("Compra não encontrada");
         const compra = rows[0];

         // 2. Estornar estoque (Remover o que entrou)
         const sqlEstorno = "UPDATE Produtos SET Estoque = Estoque - $1 WHERE ProdutoID = $2";
         // Verifica se não vai ficar negativo? O CHECK no banco deve impedir
         return consulta(sqlEstorno, [compra.quantidade, compra.produtoid])
           .then(() => {
              // 3. Remover movimentação
              const sqlDelMov = "DELETE FROM MovimentacaoEstoque WHERE documento_referencia = $1";
              return consulta(sqlDelMov, [`COMPRA- ${id}`]); // Note o espaço extra no trigger original 'COMPRA- '
           })
           .then(() => {
              // 4. Deletar compra
              return consulta("DELETE FROM Compras WHERE CompraID = $1", [id]);
           });
      });
  }

  update(id, data) {
      const quantidade = parseInt(data.quantidade);
      const precoUnitario = parseFloat(data.precoUnitario);

      if (isNaN(quantidade) || quantidade <= 0) return Promise.reject(new Error("Quantidade inválida"));
      if (isNaN(precoUnitario) || precoUnitario < 0) return Promise.reject(new Error("Preço inválido"));
      
      return consulta("SELECT * FROM Compras WHERE CompraID = $1", [id])
        .then(rows => {
            if(!rows || !rows.length) throw new Error("Compra não encontrada");
            const compraAntiga = rows[0];
            
            const diffQtd = quantidade - compraAntiga.quantidade;
            // Compra: Se diff positivo, compramos mais -> Aumenta estoque
            
            let promiseEstoque = Promise.resolve();
            if(diffQtd !== 0) {
                const sqlUpdateEstoque = "UPDATE Produtos SET Estoque = Estoque + $1 WHERE ProdutoID = $2";
                promiseEstoque = consulta(sqlUpdateEstoque, [diffQtd, compraAntiga.produtoid]);
            }
            
            return promiseEstoque.then(() => {
                const valorTotal = quantidade * precoUnitario;
                const sqlUpdateCompra = `
                    UPDATE Compras
                    SET Quantidade = $1, PrecoUnitario = $2, ValorTotal = $3
                    WHERE CompraID = $4
                `;
                return consulta(sqlUpdateCompra, [quantidade, precoUnitario, valorTotal, id]);
            }).then(() => {
                 // Note o espaço extra no ID de referencia original
                 const sqlUpdateMov = "UPDATE MovimentacaoEstoque SET quantidade = $1 WHERE documento_referencia = $2";
                 return consulta(sqlUpdateMov, [quantidade, `COMPRA- ${id}`]);
            });
        });
  }
}

export default new CompraRepository();
