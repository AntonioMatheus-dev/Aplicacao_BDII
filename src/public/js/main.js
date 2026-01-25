// Router Logic
const routes = {
    dashboard: 'views/dashboard.html',
    produtos: 'views/produtos.html',
    estoque: 'views/estoque.html',
    compras: 'views/compras.html',
    vendas: 'views/vendas.html',
    clientes: 'views/clientes.html',
    fornecedores: 'views/fornecedores.html',
    pessoas: 'views/pessoas.html'
};

const app = {
    contentArea: null,

    init: () => {
        app.contentArea = document.getElementById('content-area');
        app.setupNavigation();
        app.setupModals();

        app.loadView('dashboard');
    },

    setupNavigation: () => {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                if(!item.dataset.target) return;
                e.preventDefault();
                
                document.querySelector('.nav-item.active')?.classList.remove('active');
                item.classList.add('active');
                
                app.loadView(item.dataset.target);
            });
        });
    },

    loadView: async (viewName) => {
        if (!routes[viewName]) return;
        
        app.contentArea.innerHTML = '<div class="loading"><i class="fa-solid fa-spinner fa-spin"></i> Carregando...</div>';

        try {
            const response = await fetch(routes[viewName]);
            if(!response.ok) throw new Error(`View ${viewName} not found`);
            const html = await response.text();
            
            app.contentArea.innerHTML = html;
            
            // Trigger specific view logic
            app.handleViewLoaded(viewName);

        } catch (error) {
            console.error('Error loading view:', error);
            app.contentArea.innerHTML = '<div class="error">Erro ao carregar a página.</div>';
        }
    },

    handleViewLoaded: (viewName) => {
        // Logic mapping
        if (viewName === 'dashboard') {
            // Dashboard specific generic stats?
        } else if (['produtos', 'clientes', 'fornecedores', 'vendas', 'estoque', 'compras', 'pessoas'].includes(viewName)) {
            app.loadData(viewName);
        }
    },

    // Data Loading Logic (Refactored from previous main.js)
    apiRoutes: {
        produtos: '/produtos',
        clientes: '/clientes',
        vendas: '/vendas',
        compras: '/compras',
        estoque: '/produtos/estoque-baixo?limite=10', // Default
        fornecedores: '/fornecedores',
        pessoas: '/pessoas'
    },

    loadData: async (section, customUrl = null) => {
        let containerName = `table-${section}`;
        let container = document.querySelector(`#${containerName} tbody`);
        if (!container) container = document.getElementById(`${section}-content`);
        if(!container) return; // Silent fail if no container

        const isTable = container.tagName === 'TBODY';
        if(!isTable) {
            container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-spinner fa-spin"></i></div>';
        } else {
            container.innerHTML = '<tr><td colspan="10" style="text-align:center;">Carregando...</td></tr>';
        }

        try {
            const url = customUrl || app.apiRoutes[section];
            const response = await fetch(url);
            const data = await response.json();
            app.renderData(section, data, container);
        } catch (error) {
            console.error(error);
            container.innerHTML = isTable ? '<tr><td colspan="10" style="text-align:center;color:red">Erro</td></tr>' : 'Erro';
        }
    },

    renderData: (section, data, container) => {
        if (!Array.isArray(data) || data.length === 0) {
            container.innerHTML = '<tr><td colspan="10" style="text-align:center;">Nenhum registro.</td></tr>';
            return;
        }

        let html = '';
        if (section === 'produtos') {
            html = data.map(p => `
                <tr>
                    <td>#${p.produtoid}</td>
                    <td>${p.nomeproduto}</td>
                    <td>${p.categoria}</td>
                    <td>R$ ${p.precovenda}</td>
                    <td>${p.estoque}</td>
                    <td>
                        <button class="icon-btn" onclick="app.editItem('produto', ${p.produtoid})"><i class="fa-solid fa-pen"></i></button>
                        <button class="icon-btn" style="color:red" onclick="app.deleteItem('produto', ${p.produtoid})"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `).join('');
        } else if (section === 'clientes') {
            html = data.map(c => `
                <tr>
                    <td>#${c.clienteid}</td>
                    <td>${c.nomerazaosocial}</td>
                    <td>${c.documento}</td>
                    <td>${c.contato || '-'}</td>
                    <td>
                        <button class="icon-btn" onclick="app.editItem('cliente', ${c.clienteid})"><i class="fa-solid fa-pen"></i></button>
                        <button class="icon-btn" style="color:red" onclick="app.deleteItem('cliente', ${c.clienteid})"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `).join('');
        } else if (section === 'fornecedores') {
            html = data.map(f => `
                <tr>
                    <td>#${f.fornecedorid}</td>
                    <td>${f.nomerazaosocial}</td>
                    <td>${f.cnpj}</td>
                    <td>${f.email || '-'}</td>
                    <td>${f.telefone || '-'}</td>
                    <td>
                        <button class="icon-btn" onclick="app.editItem('fornecedor', ${f.fornecedorid})"><i class="fa-solid fa-pen"></i></button>
                        <button class="icon-btn" style="color:red" onclick="app.deleteItem('fornecedor', ${f.fornecedorid})"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `).join('');
        } else if (section === 'vendas') {
            html = data.map(v => `
                <tr>
                    <td>#${v.vendaid}</td>
                    <td>${new Date(v.datavenda).toLocaleDateString()}</td>
                    <td>${v.nomecliente || v.clienteid}</td>
                    <td>${v.nomeproduto || v.produtoid}</td>
                    <td>${v.quantidade}</td>
                    <td>R$ ${v.valortotal}</td>
                </tr>
            `).join('');

        } else if (section === 'estoque') {
            html = data.map(e => `
                <tr>
                    <td>#${e.produto_id}</td>
                    <td>${e.nome_produto}</td>
                    <td>${e.estoque}</td>
                    <td><span style="color:red; font-weight:bold">${e.status_estoque || 'BAIXO'}</span></td>
                </tr>
            `).join('');
        } else if (section === 'compras') {
            html = data.map(c => `
                <tr>
                    <td>#${c.compraid}</td>
                    <td>${new Date(c.datacompra).toLocaleDateString()}</td>
                    <td>${c.nomeproduto || c.produtoid}</td>
                    <td>${c.nomefornecedor || c.fornecedorid}</td>
                    <td>${c.quantidade}</td>
                    <td>R$ ${c.valortotal}</td>
                </tr>
            `).join('');
        } else if (section === 'pessoas') {
            html = data.map(p => `
                <tr>
                    <td>#${p.pessoaid}</td>
                    <td>${p.nomerazaosocial}</td>
                    <td>${p.documento || '-'}</td>
                    <td>${p.contato || '-'}</td>
                    <td>${p.observacao || '-'}</td>
                    <td>
                        <button class="icon-btn" onclick="app.editItem('pessoa', ${p.pessoaid})"><i class="fa-solid fa-pen"></i></button>
                        <button class="icon-btn" style="color:red" onclick="app.deleteItem('pessoa', ${p.pessoaid})"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `).join('');
        }
        
        container.innerHTML = html;
    },

    // ACTIONS
    loadEstoqueBaixo: () => {
        const limite = document.getElementById('estoque-limite').value || 10;
        app.loadData('estoque', `/produtos/estoque-baixo?limite=${limite}`);
    },

    deleteItem: async (type, id) => {
        if(!confirm('Tem certeza que deseja excluir?')) return;
        
        // Fix pluralization for API routes if needed, relying on simple mapping for now
        // Mapping types to API route keys in app.apiRoutes if they don't match directly
        let apiPath = type;
        if(type === 'cliente') apiPath = 'clientes';
        if(type === 'fornecedor') apiPath = 'fornecedores';
        if(type === 'produto') apiPath = 'produtos';
        if(type === 'pessoa') apiPath = 'pessoas';
        if(type === 'venda') apiPath = 'vendas';
        if(type === 'compra') apiPath = 'compras';

        try {
            await fetch(`/${apiPath}/${id}`, { method: 'DELETE' });
            // Refresh current view
            const currentView = document.querySelector('.nav-item.active')?.dataset.target || 'dashboard';
            app.loadData(currentView);
        } catch(e) { alert('Erro ao deletar'); console.error(e); }
    },

    // MODALS
    currentModalType: null,
    currentEditId: null, // Track if we are editing
    
    setupModals: () => {
        const closeModals = document.querySelectorAll('.close-modal');
        closeModals.forEach(btn => btn.addEventListener('click', () => {
             document.querySelector('.modal-overlay').classList.remove('active');
        }));
    },

    openModal: (type, data = null) => {
        app.currentModalType = type;
        if(!data) app.currentEditId = null; // Clear edit ID if opening new
        const modal = document.getElementById('generic-modal');
        const title = document.getElementById('modal-title');
        const body = document.getElementById('modal-body');
        const saveBtn = document.getElementById('modal-save');
        
        const newSaveBtn = saveBtn.cloneNode(true);
        saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
        newSaveBtn.addEventListener('click', () => app.saveData(type));

        modal.classList.add('active');
        
        // Build Forms
        if (type === 'produto') {
            title.textContent = app.currentEditId ? 'Editar Produto' : 'Novo Produto';
            body.innerHTML = `
                <div class="form-group"><label>Nome</label><input type="text" name="nomeProduto" required value="${data?.nomeproduto || ''}"></div>
                <div class="form-group"><label>Categoria</label><input type="text" name="categoria" value="${data?.categoria || ''}"></div>
                <div class="form-group"><label>Preço Venda</label><input type="number" name="precoVenda" step="0.01" value="${data?.precovenda || ''}"></div>
                <div class="form-group"><label>Preço Custo</label><input type="number" name="precoCusto" step="0.01" value="${data?.precocusto || ''}"></div>
                <div class="form-group"><label>Estoque</label><input type="number" name="estoque" value="${data?.estoque || ''}"></div>
            `;
        } else if (type === 'cliente') {
            title.textContent = app.currentEditId ? 'Editar Cliente' : 'Novo Cliente';
            body.innerHTML = `
                <div class="form-group"><label>Nome/Razão</label><input type="text" name="nomerazaosocial" required value="${data?.nomerazaosocial || ''}"></div>
                <div class="form-group"><label>Documento</label><input type="text" name="documento" value="${data?.documento || ''}"></div>
                <div class="form-group"><label>Contato</label><input type="text" name="contato" value="${data?.contato || ''}"></div>
                <div class="form-group"><label>Observação</label><input type="text" name="observacao" value="${data?.observacao || ''}"></div>
            `;
        } else if (type === 'fornecedor') {
             title.textContent = app.currentEditId ? 'Editar Fornecedor' : 'Novo Fornecedor';
             body.innerHTML = `
                <div class="form-group"><label>Nome/Razão</label><input type="text" name="nome" required value="${data?.nomerazaosocial || ''}"></div>
                <div class="form-group"><label>CNPJ</label><input type="text" name="cnpj" value="${data?.documento || data?.cnpj || ''}"></div>
                <div class="form-group"><label>Email</label><input type="email" name="email" value="${data?.observacao || data?.email || ''}"></div>
                <div class="form-group"><label>Telefone</label><input type="text" name="telefone" value="${data?.contato || data?.telefone || ''}"></div>
            `;
        } else if (type === 'pessoa') {
             title.textContent = app.currentEditId ? 'Editar Pessoa' : 'Nova Pessoa';
             body.innerHTML = `
                <div class="form-group"><label>Nome/Razão</label><input type="text" name="nomerazaosocial" required value="${data?.nomerazaosocial || ''}"></div>
                <div class="form-group"><label>Documento</label><input type="text" name="documento" value="${data?.documento || ''}"></div>
                <div class="form-group"><label>Contato</label><input type="text" name="contato" value="${data?.contato || ''}"></div>
                <div class="form-group"><label>Observação</label><input type="text" name="observacao" value="${data?.observacao || ''}"></div>
            `;
        } else if (type === 'venda') {
            title.textContent = 'Nova Venda';
            body.innerHTML = 'Carregando...';
            app.loadSaleOptions(body);
        } else if (type === 'compra') {
            title.textContent = 'Nova Compra';
            body.innerHTML = 'Carregando...';
            app.loadCompraOptions(body);
        }
    },

    loadSaleOptions: async (container) => {
        const [prods, clis] = await Promise.all([
            fetch('/produtos').then(r=>r.json()),
            fetch('/clientes').then(r=>r.json())
        ]);
        
        const prodOpt = prods.map(p => `<option value="${p.produtoid}" data-price="${p.precovenda}">${p.nomeproduto} - R$${p.precovenda}</option>`).join('');
        const cliOpt = clis.map(c => `<option value="${c.clienteid}">${c.nomerazaosocial}</option>`).join('');

        container.innerHTML = `
            <div class="form-group"><label>Cliente</label><select name="clienteId">${cliOpt}</select></div>
            <div class="form-group"><label>Produto</label><select name="produtoId" onchange="app.updatePrice(this, 'venda')"> <option>Selecione</option>${prodOpt}</select></div>
            <div class="form-group"><label>Qtd</label><input type="number" id="v-qtd" name="quantidade" value="1" onchange="app.calcTotal('venda')"></div>
            <div class="form-group"><label>Preço Unit.</label><input type="number" id="v-price" name="precoUnitario" readonly></div>
            <div class="form-group"><label>Total: <span id="v-total">0.00</span></label></div>
        `;
    },

    loadCompraOptions: async (container) => {
        const [prods, forns] = await Promise.all([
            fetch('/produtos').then(r=>r.json()),
            fetch('/fornecedores').then(r=>r.json())
        ]);
        
        // For purchase, price might be pre-filled with cost price, but editable
        const prodOpt = prods.map(p => `<option value="${p.produtoid}" data-price="${p.precocusto || 0}">${p.nomeproduto}</option>`).join('');
        const fornOpt = forns.map(f => `<option value="${f.fornecedorid}">${f.nomerazaosocial}</option>`).join('');

        container.innerHTML = `
            <div class="form-group"><label>Fornecedor</label><select name="fornecedorId">${fornOpt}</select></div>
            <div class="form-group"><label>Produto</label><select name="produtoId" onchange="app.updatePrice(this, 'compra')"> <option>Selecione</option>${prodOpt}</select></div>
            <div class="form-group"><label>Qtd</label><input type="number" id="c-qtd" name="quantidade" value="1" onchange="app.calcTotal('compra')"></div>
            <div class="form-group"><label>Preço Unit. (Custo)</label><input type="number" id="c-price" name="precoUnitario" step="0.01" onchange="app.calcTotal('compra')"></div>
            <div class="form-group"><label>Total: <span id="c-total">0.00</span></label></div>
        `;
    },

    editItem: async (type, id) => {
        // Map type to API endpoint
        let apiPath = type;
        if(type === 'cliente') apiPath = 'clientes';
        if(type === 'fornecedor') apiPath = 'fornecedores';
        if(type === 'produto') apiPath = 'produtos';
        if(type === 'pessoa') apiPath = 'pessoas';

        try {
            const res = await fetch(`/${apiPath}/${id}`);
            if(!res.ok) throw new Error('Falha ao buscar dados');
            const data = await res.json();
            
            app.currentEditId = id;
            app.openModal(type, data); // Pass data to populate form
        } catch(e) {
            console.error(e);
            alert('Erro ao carregar dados para edição');
        }
    },

    updatePrice: (sel, type) => {
        const opt = sel.options[sel.selectedIndex];
        const price = opt.getAttribute('data-price');
        const priceInput = document.getElementById(type === 'venda' ? 'v-price' : 'c-price');
        priceInput.value = price;
        app.calcTotal(type);
    },

    calcTotal: (type) => {
        const prefix = type === 'venda' ? 'v' : 'c';
        const q = document.getElementById(`${prefix}-qtd`).value || 0;
        const p = document.getElementById(`${prefix}-price`).value || 0;
        document.getElementById(`${prefix}-total`).innerText = (q*p).toFixed(2);
    },

    saveData: async (type) => {
        const data = {};
        document.querySelectorAll('#modal-body [name]').forEach(i => data[i.name] = i.value);
        
        let url = app.apiRoutes[type + 's'];
        if(type === 'fornecedor') url = app.apiRoutes.fornecedores;
        
        let method = 'POST';
        if (app.currentEditId) {
             method = 'PUT';
             url += `/${app.currentEditId}`;
        }
        
        try {
            await fetch(url, { method: method, headers:{'Content-Type':'application/json'}, body:JSON.stringify(data)});
            document.querySelector('.modal-overlay').classList.remove('active');
            alert('Salvo!');
            
            // Refresh logic - generic
            const activePage = document.querySelector('.nav-item.active')?.dataset.target;
            if(activePage) app.loadData(activePage);
            
            app.currentEditId = null; // Reset
        } catch(e) { alert('Erro'); }
    }
};

window.app = app;
document.addEventListener('DOMContentLoaded', app.init);
