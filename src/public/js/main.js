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
    currentData: [],
    currentSection: '',

    init: () => {
        app.contentArea = document.getElementById('content-area');
        app.setupNavigation();
        app.setupModals();
        app.setupMobileMenu();
        app.setupSearch();
        app.loadView('dashboard');
    },

    setupMobileMenu: () => {
        const toggle = document.getElementById('menu-toggle');
        const sidebar = document.querySelector('.sidebar');
        
        if (toggle && sidebar) {
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                sidebar.classList.toggle('mobile-active');
            });

            document.addEventListener('click', (e) => {
                if (!sidebar.contains(e.target) && sidebar.classList.contains('mobile-active')) {
                    sidebar.classList.remove('mobile-active');
                }
            });
        }
    },

    setupNavigation: () => {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                if(!item.dataset.target) return;
                e.preventDefault();
                
                document.querySelector('.nav-item.active')?.classList.remove('active');
                item.classList.add('active');
                document.querySelector('.sidebar').classList.remove('mobile-active');
                
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
            
            app.handleViewLoaded(viewName);

        } catch (error) {
            console.error('Error loading view:', error);
            app.contentArea.innerHTML = '<div class="error">Erro ao carregar a página.</div>';
        }
    },

    handleViewLoaded: (viewName) => {
        if (viewName === 'dashboard') {
            app.loadData('dashboard', '/produtos/movimentacoes');
        } else if (['produtos', 'clientes', 'fornecedores', 'vendas', 'estoque', 'compras', 'pessoas'].includes(viewName)) {
            app.loadData(viewName);
        }
    },

    apiRoutes: {
        produtos: '/produtos',
        clientes: '/clientes',
        vendas: '/vendas',
        compras: '/compras',
        estoque: '/produtos/estoque-baixo?limite=10', 
        fornecedores: '/fornecedores',
        pessoas: '/pessoas'
    },

    loadData: async (section, customUrl = null) => {
        let containerName = `table-${section}`;
        let container = document.querySelector(`#${containerName} tbody`);
        if (!container) container = document.getElementById(`${section}-content`);
        if(!container) return; 

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
            
            // Save state for filtering
            app.currentData = data;
            app.currentSection = section;
            
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
                        <button class="icon-btn" onclick="app.viewHistory(${p.produtoid})" title="Histórico"><i class="fa-solid fa-clock-rotate-left"></i></button>
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
                    <td>
                        <button class="icon-btn" onclick="app.editItem('venda', ${v.vendaid})"><i class="fa-solid fa-pen"></i></button>
                        <button class="icon-btn" style="color:red" onclick="app.deleteItem('venda', ${v.vendaid})"><i class="fa-solid fa-trash"></i></button>
                    </td>
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
                    <td>
                        <button class="icon-btn" onclick="app.editItem('compra', ${c.compraid})"><i class="fa-solid fa-pen"></i></button>
                        <button class="icon-btn" style="color:red" onclick="app.deleteItem('compra', ${c.compraid})"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `).join('');
        } else if (section === 'pessoas') {
            html = data.map(p => {
                const badgeCliente = p.e_cliente ? '<span class="badge success" title="Cliente">C</span>' : '';
                const badgeFornecedor = p.e_fornecedor ? '<span class="badge info" title="Fornecedor">F</span>' : '';
                
                return `
                <tr>
                    <td>#${p.pessoaid} ${badgeCliente} ${badgeFornecedor}</td>
                    <td>${p.nomerazaosocial}</td>
                    <td>${p.documento || '-'}</td>
                    <td>${p.contato || '-'}</td>
                    <td>${p.observacao || '-'}</td>
                    <td>
                        <button class="icon-btn" title="Editar" onclick="app.editItem('pessoa', ${p.pessoaid})"><i class="fa-solid fa-pen"></i></button>
                        
                        <button class="icon-btn" title="Definir como Cliente" 
                                style="color: ${p.e_cliente ? '#ccc' : 'inherit'}"
                                onclick="${p.e_cliente ? "alert('Já é cliente')" : `app.promoteTo('cliente', ${p.pessoaid})`}">
                            <i class="fa-solid fa-user-tie"></i>
                        </button>

                        <button class="icon-btn" title="Definir como Fornecedor" 
                                style="color: ${p.e_fornecedor ? '#ccc' : 'inherit'}"
                                onclick="${p.e_fornecedor ? "alert('Já é fornecedor')" : `app.promoteTo('fornecedor', ${p.pessoaid})`}">
                            <i class="fa-solid fa-truck"></i>
                        </button>

                        <button class="icon-btn" title="Excluir" style="color:red" onclick="app.deleteItem('pessoa', ${p.pessoaid})"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
                `;
            }).join('');
        } else if (section === 'dashboard') {
             html = data.map(m => `
                <tr>
                    <td>${new Date(m.data_movimentacao).toLocaleString()}</td>
                    <td>${m.nomeproduto}</td>
                    <td><span class="badge ${m.tipo === 'ENTRADA' ? 'success' : (m.tipo ==='SAIDA' ? 'danger' : 'warning')}">${m.tipo}</span></td>
                    <td>${m.quantidade}</td>
                    <td>${m.nomerazaosocial}</td>
                    <td>${m.documento_referencia}</td>
                </tr>
            `).join('');
        }
        
        container.innerHTML = html;
    },

    setupSearch: () => {
        const searchInput = document.getElementById('global-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                app.filterData(term);
            });
        }
    },

    filterData: (term) => {
        if (!app.currentData || !app.currentSection) return;

        let containerName = `table-${app.currentSection}`;
        let container = document.querySelector(`#${containerName} tbody`);
        if (!container) container = document.getElementById(`${app.currentSection}-content`);
        if (!container) return;

        // Limpa o termo de busca (remove # e espaços extras)
        const cleanTerm = term.replace('#', '').trim().toLowerCase();

        // Volta ao original se o termo estiver vazio
        if (!cleanTerm) {
            app.renderData(app.currentSection, app.currentData, container);
            return;
        }

        const filtered = app.currentData.filter(item => {
            // Verifica todos os valores do objeto
            return Object.entries(item).some(([key, val]) => {
                if (val === null || val === undefined) return false;
                
                const keyLower = key.toLowerCase();
                const stringVal = String(val).toLowerCase();
                
                // Se for uma busca puramente numérica (provável busca por ID)
                if (!isNaN(cleanTerm) && cleanTerm !== "") {
                    // Ignora campos de estoque, quantidade e preços
                    if (keyLower.includes('estoque') || 
                        keyLower.includes('quantidade') || 
                        keyLower.includes('preco') || 
                        keyLower.includes('total') ||
                        keyLower.includes('unitario')) {
                        return false; 
                    }
                    
                    // Se for o ID exato, retorna verdadeiro
                    if (keyLower.includes('id') && stringVal === cleanTerm) return true;
                }

                // Para buscas de texto (ou se o termo estiver contido no valor)
                return stringVal.includes(cleanTerm);
            });
        });

        app.renderData(app.currentSection, filtered, container);
    },


    loadEstoqueBaixo: () => {
        const limite = document.getElementById('estoque-limite').value || 10;
        app.loadData('estoque', `/produtos/estoque-baixo?limite=${limite}`);
    },

    deleteItem: async (type, id) => {
        if(!confirm('Tem certeza que deseja excluir?')) return;
        

        let apiPath = type;
        if(type === 'cliente') apiPath = 'clientes';
        if(type === 'fornecedor') apiPath = 'fornecedores';
        if(type === 'produto') apiPath = 'produtos';
        if(type === 'pessoa') apiPath = 'pessoas';
        if(type === 'venda') apiPath = 'vendas';
        if(type === 'compra') apiPath = 'compras';

        try {
            await fetch(`/${apiPath}/${id}`, { method: 'DELETE' });
            const currentView = document.querySelector('.nav-item.active')?.dataset.target || 'dashboard';
            app.loadData(currentView);
        } catch(e) { alert('Erro ao deletar'); console.error(e); }
    },

    
    currentModalType: null,
    currentEditId: null, 

    setupModals: () => {
        const closeModals = document.querySelectorAll('.close-modal');
        closeModals.forEach(btn => btn.addEventListener('click', () => {
             document.querySelector('.modal-overlay').classList.remove('active');
        }));
    },

    openModal: (type, data = null) => {
        app.currentModalType = type;
        if(!data) app.currentEditId = null; 
        const modal = document.getElementById('generic-modal');
        const title = document.getElementById('modal-title');
        const body = document.getElementById('modal-body');
        const saveBtn = document.getElementById('modal-save');
        
        const newSaveBtn = saveBtn.cloneNode(true);
        saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
        newSaveBtn.style.display = 'block';
        newSaveBtn.addEventListener('click', () => app.saveData(type));

        modal.classList.add('active');
        
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
            title.textContent = app.currentEditId ? 'Editar Venda' : 'Nova Venda';
            body.innerHTML = 'Carregando...';
            app.loadSaleOptions(body, data);
        } else if (type === 'compra') {
            title.textContent = app.currentEditId ? 'Editar Compra' : 'Nova Compra';
            body.innerHTML = 'Carregando...';
            app.loadCompraOptions(body, data);
        }
    },

    loadSaleOptions: async (container, dataToFill = null) => {
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

        if(dataToFill) {
            container.querySelector('[name="clienteId"]').value = dataToFill.clienteid;
            container.querySelector('[name="produtoId"]').value = dataToFill.produtoid;
            container.querySelector('[name="quantidade"]').value = dataToFill.quantidade;
            container.querySelector('[name="precoUnitario"]').value = dataToFill.precounitario;
            app.calcTotal('venda');
        }
    },

    loadCompraOptions: async (container, dataToFill = null) => {
        const [prods, forns] = await Promise.all([
            fetch('/produtos').then(r=>r.json()),
            fetch('/fornecedores').then(r=>r.json())
        ]);
        

        const prodOpt = prods.map(p => `<option value="${p.produtoid}" data-price="${p.precocusto || 0}">${p.nomeproduto}</option>`).join('');
        const fornOpt = forns.map(f => `<option value="${f.fornecedorid}">${f.nomerazaosocial}</option>`).join('');

        container.innerHTML = `
            <div class="form-group"><label>Fornecedor</label><select name="fornecedorId">${fornOpt}</select></div>
            <div class="form-group"><label>Produto</label><select name="produtoId" onchange="app.updatePrice(this, 'compra')"> <option>Selecione</option>${prodOpt}</select></div>
            <div class="form-group"><label>Qtd</label><input type="number" id="c-qtd" name="quantidade" value="1" onchange="app.calcTotal('compra')"></div>
            <div class="form-group"><label>Preço Unit. (Custo)</label><input type="number" id="c-price" name="precoUnitario" step="0.01" onchange="app.calcTotal('compra')"></div>
            <div class="form-group"><label>Total: <span id="c-total">0.00</span></label></div>
        `;

        if(dataToFill) {
            container.querySelector('[name="fornecedorId"]').value = dataToFill.fornecedorid;
            container.querySelector('[name="produtoId"]').value = dataToFill.produtoid;
            container.querySelector('[name="quantidade"]').value = dataToFill.quantidade;
            container.querySelector('[name="precoUnitario"]').value = dataToFill.precounitario;
            app.calcTotal('compra');
        }
    },

    editItem: async (type, id) => {
    
        let apiPath = type;
        if(type === 'cliente') apiPath = 'clientes';
        if(type === 'fornecedor') apiPath = 'fornecedores';
        if(type === 'produto') apiPath = 'produtos';
        if(type === 'pessoa') apiPath = 'pessoas';
        if(type === 'venda') apiPath = 'vendas';
        if(type === 'compra') apiPath = 'compras';

        try {
            const res = await fetch(`/${apiPath}/${id}`);
            if(!res.ok) throw new Error('Falha ao buscar dados');
            const data = await res.json();
            
            app.currentEditId = id;
            app.openModal(type, data); 
        } catch(e) {
            console.error(e);
            alert('Erro ao carregar dados para edição');
        }
    },

    viewHistory: async (id) => {
        try {
             const res = await fetch(`/produtos/${id}/historico`);
             
             const modal = document.getElementById('generic-modal');
             const title = document.getElementById('modal-title');
             const body = document.getElementById('modal-body');
             const saveBtn = document.getElementById('modal-save');
             
             
             saveBtn.style.display = 'none';

             title.textContent = 'Histórico de Movimentação';
             body.innerHTML = '<div class="loading">Carregando...</div>';
             modal.classList.add('active');

             if(!res.ok) {
                 if(res.status === 404) {
                     body.innerHTML = '<p>Nenhuma movimentação encontrada.</p>';
                 } else {
                     throw new Error('Erro ao buscar histórico');
                 }
                 return;
             }

             const data = await res.json();
             const moves = data.movimentacoes;

             let html = `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Tipo</th>
                            <th>Qtd</th>
                            <th>Ref</th>
                        </tr>
                    </thead>
                    <tbody>
             `;
             
             html += moves.map(m => `
                <tr>
                    <td>${new Date(m.data_movimentacao).toLocaleString()}</td>
                    <td><span class="badge ${m.tipo === 'ENTRADA' ? 'success' : 'danger'}">${m.tipo}</span></td>
                    <td>${m.quantidade}</td>
                    <td>${m.documento_referencia || '-'}</td>
                </tr>
             `).join('');

             html += '</tbody></table>';
             body.innerHTML = html;

             const closeBtns = modal.querySelectorAll('.close-modal');
             const restoreBtn = () => { saveBtn.style.display = 'block'; };
             closeBtns.forEach(btn => btn.addEventListener('click', restoreBtn, { once: true }));

        } catch(e) {
            console.error(e);
            document.getElementById('modal-body').innerHTML = '<p class="error">Erro ao carregar histórico.</p>';
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
        
        // --- NOVO: Comparação de dados para evitar duplicados ---
        if (type === 'pessoa' && !app.currentEditId) {
            try {
                const response = await fetch('/pessoas');
                const pessoasExistentes = await response.json();
                
                const jaExiste = pessoasExistentes.find(p => 
                    p.documento && data.documento && 
                    p.documento.trim() === data.documento.trim()
                );

                if (jaExiste) {
                    alert(`❌ Atenção: Já existe uma pessoa cadastrada com o documento "${data.documento}" (${jaExiste.nomerazaosocial}).`);
                    return; // Interrompe o salvamento
                }
            } catch (e) {
                console.error("Erro ao validar duplicados:", e);
            }
        }
        // --------------------------------------------------------

        let url = app.apiRoutes[type + 's'];
        if(type === 'fornecedor') url = app.apiRoutes.fornecedores;
        
        let method = 'POST';
        if (app.currentEditId) {
             method = 'PUT';
             url += `/${app.currentEditId}`;
        }
        
        try {
            const response = await fetch(url, { method: method, headers:{'Content-Type':'application/json'}, body:JSON.stringify(data)});
            const result = await response.json();

            if (!response.ok) {
                app.handleError(result);
                return;
            }

            document.querySelector('.modal-overlay').classList.remove('active');
            alert('Salvo com sucesso!');
            
            const activePage = document.querySelector('.nav-item.active')?.dataset.target;
            if(activePage) app.loadData(activePage);
            
            app.currentEditId = null; 
        } catch(e) { 
            console.error(e);
            alert('Erro crítico de conexão. Verifique se o servidor está rodando.'); 
        }
    },

    promoteTo: async (role, pessoaId) => {
        const confirmMsg = role === 'cliente' ? 'Deseja definir esta pessoa como CLIENTE?' : 'Deseja definir esta pessoa como FORNECEDOR?';
        if (!confirm(confirmMsg)) return;

        const url = role === 'cliente' ? '/clientes/promote' : '/fornecedores/promote';
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pessoaId })
            });

            const result = await response.json();
            if (response.ok) {
                alert(result.message || 'Promovido com sucesso!');
                app.loadData('pessoas'); // Recarrega para atualizar os ícones
            } else {
                app.handleError(result);
            }
        } catch (e) {
            console.error(e);
            alert('Erro ao tentar promover pessoa.');
        }
    },

    handleError: (result) => {
        console.error('Erro detalhado:', result);
        
        let errorMsg = "";
        if (result.error) {
            errorMsg = typeof result.error === 'object' ? (result.error.message || JSON.stringify(result.error)) : String(result.error);
        } else if (result.message) {
            errorMsg = String(result.message);
        } else {
            errorMsg = JSON.stringify(result);
        }

        const msgLower = errorMsg.toLowerCase();

        // 1. Erro de Documento Duplicado (CPF/CNPJ)
        // Busca agressiva por qualquer menção a duplicado + documento ou o nome da tabela
        if (
            msgLower.includes('pessoabase') && (msgLower.includes('duplic') || msgLower.includes('unique') || msgLower.includes('unicidade')) 
            || (msgLower.includes('chave') && msgLower.includes('documento'))
        ) {
            alert('❌ Erro: Este CPF/CNPJ já está cadastrado no sistema.');
        } 
        // 2. Erro de Estoque
        else if (msgLower.includes('estoque') || msgLower.includes('stock')) {
            alert('⚠️ Atenção: Estoque insuficiente ou erro na movimentação.');
        } 
        // 3. Pessoa já promovida
        else if (msgLower.includes('cliente') && msgLower.includes('já')) {
            alert('ℹ️ Esta pessoa já está cadastrada como Cliente.');
        } 
        else if (msgLower.includes('fornecedor') && msgLower.includes('already')) {
            alert('ℹ️ Esta pessoa já está cadastrada como Fornecedor.');
        }
        // 4. Erro Genérico (Mostra a mensagem amigável se possível)
        else {
            alert('Erro no Sistema: ' + errorMsg);
        }
    }
};

window.app = app;
document.addEventListener('DOMContentLoaded', app.init);
