# Plano de Implementação: Autenticação e Isolamento de Dados

Este documento descreve as etapas necessárias para resolver o problema de compartilhamento de dados entre dispositivos, garantindo que cada usuário veja apenas suas próprias informações.

## 1. O Problema Atual
Atualmente, a aplicação utiliza um banco de dados global sem distinção de usuários. Qualquer dado salvo (produtos, vendas, clientes) fica visível para qualquer dispositivo conectado ao banco de dados.

## 2. Solução Proposta
Implementar um sistema de **Autenticação (Login)** e **Multi-tenancy (Isolamento)**. Cada registro no banco terá um "dono" (UsuarioID).

## 3. Roteiro de Implementação (Roadmap)

### Passo 1: Alterações no Banco de Dados (`setup.sql`)
1. Criar a tabela de `Usuarios`.
2. Adicionar a coluna `UsuarioID` nas tabelas:
   - `Produtos`
   - `Vendas`
   - `Compras`
   - `Cliente`
   - `Fornecedor`
   - `PessoaBase`
   - `MovimentacaoEstoque`

### Passo 2: Backend (Node.js)
1. **Novas Rotas:** Criar rotas de `/auth/register` e `/auth/login`.
2. **Segurança:** Utilizar `bcryptjs` para criptografar as senhas no banco.
3. **Sessão/Token:** Implementar `jsonwebtoken` (JWT) para manter o usuário logado.
4. **Middleware de Proteção:** Criar um script que verifica se o usuário está logado antes de permitir acesso às rotas da API.

### Passo 3: Repositórios e Consultas
Alterar todos os métodos nos arquivos dentro de `src/app/repositories/` para incluir o filtro do usuário.
- Exemplo: `SELECT * FROM Produtos WHERE UsuarioID = $1`.

### Passo 4: Frontend
1. Criar uma tela de Login e uma de Cadastro.
2. Armazenar o Token JWT no `localStorage` do navegador.
3. Enviar o Token em todas as requisições para o servidor.

---

## Exemplo de Mudança no SQL

```sql
-- Criar tabela de usuários
CREATE TABLE Usuarios (
    UsuarioID SERIAL PRIMARY KEY,
    Username VARCHAR(50) UNIQUE NOT NULL,
    Senha VARCHAR(255) NOT NULL,
    DataCadastro TIMESTAMP DEFAULT NOW()
);

-- Exemplo de como vincular um produto a um usuário
ALTER TABLE Produtos ADD COLUMN UsuarioID INT REFERENCES Usuarios(UsuarioID);
```

Este plano serve como guia para as próximas evoluções do sistema.
