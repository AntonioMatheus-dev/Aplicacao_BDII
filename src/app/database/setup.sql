
CREATE TABLE IF NOT EXISTS PessoaBase (
    PessoaID SERIAL PRIMARY KEY,
    NomeRazaoSocial VARCHAR(255) NOT NULL,
    Documento VARCHAR(50) UNIQUE,
    Contato VARCHAR(100),
    Observacao TEXT
);

CREATE TABLE IF NOT EXISTS Cliente (
    ClienteID SERIAL PRIMARY KEY,
    PessoaID INT NOT NULL REFERENCES PessoaBase(PessoaID) ON DELETE CASCADE,
    DataCadastro TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS Fornecedor (
    FornecedorID SERIAL PRIMARY KEY,
    PessoaID INT NOT NULL REFERENCES PessoaBase(PessoaID) ON DELETE CASCADE,
    DataCadastro TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS Produtos (
    ProdutoID SERIAL PRIMARY KEY,
    NomeProduto VARCHAR(150) NOT NULL,
    Categoria VARCHAR(100),
    PrecoVenda DECIMAL(10,2) NOT NULL DEFAULT 0.00,  
    Estoque INT NOT NULL CHECK (Estoque >= 0) DEFAULT 0,
    PrecoCusto DECIMAL(10,2) DEFAULT 0.00,           
    DataCadastro TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS Compras (
    CompraID SERIAL PRIMARY KEY,
    ProdutoID INT NOT NULL REFERENCES Produtos(ProdutoID),
    FornecedorID INT NOT NULL REFERENCES Fornecedor(FornecedorID),
    DataCompra TIMESTAMP NOT NULL DEFAULT NOW(),
    Quantidade INT NOT NULL CHECK (Quantidade > 0),
    PrecoUnitario DECIMAL(10,2) NOT NULL,
    ValorTotal DECIMAL(12,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS Vendas (
    VendaID SERIAL PRIMARY KEY,
    ProdutoID INT NOT NULL REFERENCES Produtos(ProdutoID),
    ClienteID INT NOT NULL REFERENCES Cliente(ClienteID),
    DataVenda TIMESTAMP NOT NULL DEFAULT NOW(),
    Quantidade INT NOT NULL CHECK (Quantidade > 0),
    PrecoUnitario DECIMAL(10,2) NOT NULL,
    ValorTotal DECIMAL(12,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS MovimentacaoEstoque (
    mov_id SERIAL PRIMARY KEY,
    produto_id INT NOT NULL REFERENCES Produtos(ProdutoID),
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('ENTRADA','SAIDA','AJUSTE')),
    quantidade INT NOT NULL CHECK (quantidade > 0),
    documento_referencia VARCHAR(100) NOT NULL,
    pessoa_id INT NOT NULL REFERENCES PessoaBase(PessoaID),
    data_movimentacao TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Trigger Function
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

-- Trigger
DROP TRIGGER IF EXISTS tg_atualizar_estoque ON MovimentacaoEstoque;
CREATE TRIGGER tg_atualizar_estoque
AFTER INSERT ON MovimentacaoEstoque
FOR EACH ROW
EXECUTE FUNCTION atualizar_estoque_produto();

-- Procedure: Registrar Compra
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
    v_temp INT;
BEGIN
    IF p_quantidade IS NULL OR p_quantidade <= 0 THEN
        RAISE EXCEPTION 'Quantidade inválida (%). Deve ser > 0', p_quantidade;
    END IF;

    IF p_preco_unitario IS NULL OR p_preco_unitario <= 0 THEN
        RAISE EXCEPTION 'Preço unitário inválido (%). Deve ser > 0', p_preco_unitario;
    END IF;

    SELECT 1 INTO v_temp FROM Produtos WHERE ProdutoID = p_produto_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Produto ID(%) não existe', p_produto_id;
    END IF;

    SELECT 1 INTO v_temp FROM Fornecedor WHERE FornecedorID = p_fornecedor_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Fornecedor % não existe', p_fornecedor_id;
    END IF;

    v_valor_total := p_preco_unitario * p_quantidade;

    INSERT INTO Compras (ProdutoID, FornecedorID, DataCompra, Quantidade, PrecoUnitario, ValorTotal)
    VALUES (p_produto_id, p_fornecedor_id, NOW(), p_quantidade, p_preco_unitario, v_valor_total)
    RETURNING CompraID INTO v_compra_id;

    INSERT INTO MovimentacaoEstoque (produto_id, tipo, quantidade, documento_referencia, pessoa_id)
    VALUES (p_produto_id,'ENTRADA', p_quantidade, 'COMPRA- ' || v_compra_id,(SELECT PessoaID FROM Fornecedor WHERE FornecedorID = p_fornecedor_id));

    UPDATE Produtos
    SET PrecoCusto = p_preco_unitario
    WHERE ProdutoID = p_produto_id;
END;
$$;

-- Procedure: Registrar Venda
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
    IF p_quantidade IS NULL OR p_quantidade <= 0 THEN
        RAISE EXCEPTION 'Quantidade inválida (%). Deve ser > 0', p_quantidade;
    END IF;
    IF p_preco_unitario IS NULL OR p_preco_unitario <= 0 THEN
        RAISE EXCEPTION 'Preço unitário inválido (%). Deve ser > 0', p_preco_unitario;
    END IF;

    SELECT Estoque INTO v_estoque_atual FROM Produtos WHERE ProdutoID = p_produto_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Produto % não existe', p_produto_id;
    END IF;

    SELECT 1 INTO v_temp FROM Cliente WHERE ClienteID = p_cliente_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Cliente % não existe', p_cliente_id;
    END IF;

    IF v_estoque_atual < p_quantidade THEN
        RAISE EXCEPTION 'Estoque insuficiente: disponível %, solicitado %', v_estoque_atual, p_quantidade;
    END IF;

    v_valor_total := p_preco_unitario * p_quantidade;

    INSERT INTO Vendas (ProdutoID, ClienteID, DataVenda, Quantidade, PrecoUnitario, ValorTotal)
    VALUES (p_produto_id, p_cliente_id, NOW(), p_quantidade, p_preco_unitario, v_valor_total)
    RETURNING VendaID INTO v_venda_id;

    INSERT INTO MovimentacaoEstoque (produto_id, tipo, quantidade, documento_referencia, pessoa_id)
    VALUES (p_produto_id, 'SAIDA', p_quantidade, 'VENDA-' || v_venda_id, (SELECT PessoaID FROM Cliente WHERE ClienteID = p_cliente_id));

    UPDATE Produtos
    SET PrecoVenda = p_preco_unitario
    WHERE ProdutoID = p_produto_id;
END;
$$;

-- Function: Verificar Estoque Baixo
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
        p.ProdutoID,
        p.NomeProduto,
        p.Estoque,
        (
            CASE 
                WHEN p.Estoque = 0 THEN 'ESGOTADO'
                WHEN p.Estoque <=limite THEN 'BAIXO ESTOQUE'
            END)::VARCHAR(20)

    FROM Produtos p
    WHERE p.Estoque <= limite
    ORDER BY p.Estoque ASC;
END;
$$;
