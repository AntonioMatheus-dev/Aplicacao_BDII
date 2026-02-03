# Relatório de Desenvolvimento da Aplicação

## Contextualização

 Escopo da Aplicação
A aplicação desenvolvida consiste em um Sistema de Gerenciamento de Vendas e Estoque voltado para pequenos comércios. O objetivo principal é facilitar o controle de produtos, a realização de vendas e o monitoramento do fluxo de estoque, dados de clientes e fornecedores.

**Problema e Contexto:**  
Pequenos negócios muitas vezes carecem de ferramentas acessíveis para controlar a entrada e saída de mercadorias e registrar vendas de forma consistente. Este sistema visa resolver esse problema mantendo uma base de dados íntegra e oferecendo uma interface web simples para operação.

**Funcionalidades:**
*   **Gestão de Produtos:** Cadastro, atualização (CRUD), listagem e controle de preços.
*   **Gestão de Vendas:** Registro de vendas utilizando **Stored Procedures** para garantir a consistência dos dados (baixa de estoque automática).
*   **Controle de Estoque:** Monitoramento de movimentações (entradas e saídas) e alertas de estoque baixo via **Functions**.
*   **Gestão de Entidades:** Cadastro de Clientes, Fornecedores e Pessoas.

**Plataforma:** Aplicação Web (Client-Server).

**Tecnologias Utilizadas:**
*   **Linguagem de Programação (Backend):** JavaScript (Node.js).
*   **Framework Web:** Express.js (para criação da API e rotas).
*   **Banco de Dados:** PostgreSQL (Relacional).
*   **Frontend:** HTML5, CSS3, JavaScript (Vanilla).
*   **Driver de Banco:** pg (node-postgres).

---

## Diagramas

### Diagrama ER (Esquema Relacional)
*(Sugestão: Insira aqui a imagem do seu Diagrama Entidade-Relacionamento exportado da ferramenta de modelagem)*
![Diagrama ER](link_para_imagem_der.png)

### Diagrama de Casos de Uso (UML)
*(Sugestão: Insira aqui a imagem do Diagrama de Casos de Uso mostrando os atores - Ex: Vendedor, Gerente - e suas ações - Ex: Realizar Venda, Cadastrar Produto)*
![Diagrama de Casos de Uso](link_para_imagem_uml.png)

---

## SQL

Abaixo estão os códigos SQL utilizados ou simulados conforme a lógica da aplicação.

### Procedures

**Descrição:** Procedimentos armazenados para registrar transações complexas de Venda e Compra. Eles centralizam a lógica de inserção nas tabelas de histórico e movimentação de estoque.

#### Registrar Venda
```sql
CREATE OR REPLACE PROCEDURE registrar_venda(
    p_produto_id INT,
    p_cliente_id INT,
    p_quantidade INT,
    p_preco_unitario DECIMAL
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_venda_id INT;
    v_valor_total DECIMAL(12,2);
    v_estoque_atual INT;
    v_temp INT;
BEGIN
    -- Validações de entrada
    IF p_quantidade IS NULL OR p_quantidade <= 0 THEN
        RAISE EXCEPTION 'Quantidade inválida (%). Deve ser > 0', p_quantidade;
    END IF;

    -- Registro da Venda
    v_valor_total := p_preco_unitario * p_quantidade;

    INSERT INTO Vendas (ProdutoID, ClienteID, DataVenda, Quantidade, PrecoUnitario, ValorTotal)
    VALUES (p_produto_id, p_cliente_id, NOW(), p_quantidade, p_preco_unitario, v_valor_total)
    RETURNING VendaID INTO v_venda_id;

    -- Registro da Movimentação (Aciona a Trigger de Estoque)
    INSERT INTO MovimentacaoEstoque (produto_id, tipo, quantidade, documento_referencia, pessoa_id)
    VALUES (p_produto_id, 'SAIDA', p_quantidade, 'VENDA-' || v_venda_id, 
           (SELECT PessoaID FROM Cliente WHERE ClienteID = p_cliente_id));

    -- Atualização do Preço de Venda Sugerido
    UPDATE Produtos SET PrecoVenda = p_preco_unitario WHERE ProdutoID = p_produto_id;
END;
$$;
```

#### Registrar Compra
```sql
CREATE OR REPLACE PROCEDURE registrar_compra(
    p_produto_id INT,
    p_fornecedor_id INT,
    p_quantidade INT,
    p_preco_unitario DECIMAL
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_compra_id INT;
    v_valor_total DECIMAL(12,2);
BEGIN
    INSERT INTO Compras (ProdutoID, FornecedorID, DataCompra, Quantidade, PrecoUnitario, ValorTotal)
    VALUES (p_produto_id, p_fornecedor_id, NOW(), p_quantidade, p_preco_unitario, p_preco_unitario * p_quantidade)
    RETURNING CompraID INTO v_compra_id;

    INSERT INTO MovimentacaoEstoque (produto_id, tipo, quantidade, documento_referencia, pessoa_id)
    VALUES (p_produto_id, 'ENTRADA', p_quantidade, 'COMPRA- ' || v_compra_id, 
           (SELECT PessoaID FROM Fornecedor WHERE FornecedorID = p_fornecedor_id));

    UPDATE Produtos SET PrecoCusto = p_preco_unitario WHERE ProdutoID = p_produto_id;
END;
$$;
```

### Function
**Descrição:** Função que lista todos os produtos com estoque baixo ou esgotado, retornando o status formatado.

```sql
CREATE OR REPLACE FUNCTION verificar_estoque_baixo(limite INT)
RETURNS TABLE (
    produto_id INT,
    nome_produto VARCHAR(150),
    estoque INT,
    status_estoque VARCHAR(20)
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.ProdutoID, p.NomeProduto, p.Estoque,
        (CASE 
            WHEN p.Estoque = 0 THEN 'ESGOTADO'
            WHEN p.Estoque <= limite THEN 'BAIXO ESTOQUE'
        END)::VARCHAR(20)
    FROM Produtos p
    WHERE p.Estoque <= limite
    ORDER BY p.Estoque ASC;
END;
$$;
```

### Trigger
**Descrição:** Trigger responsável por atualizar automaticamente o estoque na tabela `Produtos` sempre que houver uma inserção na tabela `MovimentacaoEstoque`. Ela valida o tipo de movimento e se há estoque suficiente antes de efetivar a transação.

```sql
CREATE OR REPLACE FUNCTION atualizar_estoque_produto()
RETURNS TRIGGER AS $$
DECLARE
    variacao INT;
    novo_estoque INT;
BEGIN
    IF NEW.tipo IN ('ENTRADA','AJUSTE') THEN
        variacao := NEW.quantidade;
    ELSIF NEW.tipo = 'SAIDA' THEN
        variacao := - NEW.quantidade;
    ELSE
        RAISE EXCEPTION 'Tipo de movimentação inválido: %', NEW.tipo;
    END IF;

    UPDATE Produtos
    SET Estoque = Produtos.Estoque + variacao
    WHERE ProdutoID = NEW.produto_id
    RETURNING Estoque INTO novo_estoque;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Produto ID(%) não encontrado ao atualizar estoque', NEW.produto_id;
    END IF;


    IF novo_estoque < 0 THEN
        RAISE EXCEPTION 'Estoque insuficiente para o produto ID % (tentativa de reduzir %). Estoque = %',
            NEW.produto_id, NEW.quantidade, novo_estoque - variacao;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER tg_atualizar_estoque
AFTER INSERT ON MovimentacaoEstoque
FOR EACH ROW
EXECUTE FUNCTION atualizar_estoque_produto();
```

### Create (Inserção)
Exemplo de inserção de um novo Produto:
```sql
INSERT INTO Produtos (NomeProduto, Categoria, PrecoVenda, Estoque, PrecoCusto)
VALUES ('Camiseta Básica M', 'Vestuário', 49.90, 100, 25.00);
```

### Read (Leitura)
Exemplo de consulta para buscar uma venda específica pelo ID:
```sql
SELECT * FROM Vendas WHERE VendaID = 10;
```

### Update (Atualização)
Exemplo de atualização do estoque de um produto (ex: reposição):
```sql
UPDATE Produtos 
SET Estoque = Estoque + 50
WHERE ProdutoID = 5;
```

### Delete (Exclusão)
Exemplo de exclusão lógica ou física de um registro (ex: removendo uma movimentação incorreta):
```sql
DELETE FROM MovimentacaoEstoque 
WHERE documento_referencia = 'VENDA-10';
```

---

## Tabelas

*(Sugestão: Substitua os textos abaixo por prints reais do seu banco de dados populado)*

### Tabela: Produtos
![Tabela Produtos](link_para_print_produtos.png)
*(Exibe colunas: ProdutoID, NomeProduto, Categoria, Estoque, ...)*

### Tabela: Vendas
![Tabela Vendas](link_para_print_vendas.png)
*(Exibe colunas: VendaID, DataVenda, ValorTotal, ...)*

### Tabela: Clientes
![Tabela Clientes](link_para_print_clientes.png)
*(Exibe colunas: ClienteID, PessoaID, ...)*

---

## Aplicação

*(Sugestão: Insira aqui prints das telas da aplicação rodando no navegador)*

### Tela de Vendas
![Tela de Vendas](link_para_print_tela_vendas.png)

### Tela de Listagem de Produtos
![Tela de Produtos](link_para_print_tela_produtos.png)

---

## Considerações Finais

O desenvolvimento deste projeto permitiu a aplicação prática dos conceitos de Banco de Dados Relacionais integrados a uma aplicação moderna em Node.js.
*   **Aprendizados:** Foi possível compreender a importância de delegar lógicas complexas para o banco de dados (via Stored Procedures e Triggers) para garantir a integridade, especialmente em operações críticas como vendas e controle de estoque.
*   **Dificuldades:** A integração assíncrona do Node.js com o PostgreSQL exigiu atenção no tratamento de Promises e na captura de erros vindos do banco.
*   **Conclusão:** A arquitetura MVC utilizada no backend facilitou a organização do código e a separação entre as regras de negócio da aplicação e as regras de negócio do banco de dados (SQL).

---

## Referências

1.  **PostgreSQL Documentation**. Disponível em: https://www.postgresql.org/docs/
2.  **Node-postgres (pg) - Documentation**. Disponível em: https://node-postgres.com/
3.  **Express.js Guide**. Disponível em: https://expressjs.com/
