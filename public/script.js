document.addEventListener('DOMContentLoaded', () => {
    // Menu toggle functionality
    const menuBtn = document.getElementById('menuBtn');
    const closeBtn = document.getElementById('closeBtn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');

    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            sidebar.classList.add('open');
            overlay.classList.add('open');
            document.body.style.overflow = 'hidden';
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('open');
            document.body.style.overflow = 'auto';
        });
    }

    if (overlay) {
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('open');
            document.body.style.overflow = 'auto';
        });
    }

    // Função para ativar abas (NOVA)
    function activateTab(tabId) {
        // Esconde todos os conteúdos de tab
        document.querySelectorAll('.services-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Remove classe active de todos os botões de tab
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Mostra o conteúdo da tab selecionada
        const selectedTabContent = document.getElementById(`${tabId}-tab`);
        if (selectedTabContent) {
            selectedTabContent.classList.add('active');
        }
        
        // Ativa o botão da tab no cabeçalho
        const selectedTabButton = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
        if (selectedTabButton) {
            selectedTabButton.classList.add('active');
        }
        
        // Rolagem suave para a seção de serviços
        const servicesSection = document.getElementById('services');
        if (servicesSection) {
            window.scrollTo({
                top: servicesSection.offsetTop - 20, // Ajuste para a navbar fixa
                behavior: 'smooth'
            });
        }
        
        // Atualiza URL com hash e parâmetro 'tab'
        const url = new URL(window.location.href);
        url.hash = 'services';
        url.searchParams.set('tab', tabId);
        window.history.pushState({}, '', url); // Usa pushState para não recarregar a página
        
        // Salva no localStorage
        localStorage.setItem('activeTab', tabId);
    }

    // Smooth scroll para links do menu lateral (MODIFICADO)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            // Ignora links que são para as abas de serviço, pois eles são tratados pela activateTab
            if (href.startsWith('#services') && this.hasAttribute('data-tab')) {
                return; 
            }

            e.preventDefault();
            
            if (sidebar) sidebar.classList.remove('open');
            if (overlay) overlay.classList.remove('open');
            document.body.style.overflow = 'auto';
            
            const targetId = href.substring(1); // Remove o '#'
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 20, // Ajuste para a navbar fixa
                    behavior: 'smooth'
                });
            }
        });
    });

    // Handle scrolling and tab activation after navigation (NOVO)
    window.addEventListener('load', () => {
        const urlParams = new URLSearchParams(window.location.search);
        const urlTab = urlParams.get('tab');
        const currentHash = window.location.hash;

        if (currentHash === '#services') {
            const defaultTab = 'activities'; // Aba padrão se nenhuma for especificada
            const activeTab = urlTab || localStorage.getItem('activeTab') || defaultTab;
            
            if (['activities', 'materials'].includes(activeTab)) {
                activateTab(activeTab);
            } else {
                activateTab(defaultTab);
            }
        } else {
            // Se não estiver na seção de serviços, garante que a aba padrão esteja ativa
            // e remove o parâmetro 'tab' da URL se existir
            const url = new URL(window.location.href);
            if (url.searchParams.has('tab')) {
                url.searchParams.delete('tab');
                window.history.replaceState({}, '', url);
            }
            // Garante que a aba de atividades esteja ativa por padrão se a seção de serviços for a primeira a ser vista
            // ou se não houver hash na URL
            const servicesSection = document.getElementById('services');
            if (servicesSection && servicesSection.getBoundingClientRect().top < window.innerHeight && servicesSection.getBoundingClientRect().bottom > 0) {
                 // Se a seção de serviços estiver visível na carga inicial, ative a aba padrão
                 activateTab('activities');
            }
        }
    });

    // Profile dropdown toggle
    const profileBtn = document.getElementById('profileBtn');
    const profileDropdown = document.getElementById('profileDropdown');
    if (profileBtn) {
        profileBtn.addEventListener('click', () => {
            if (profileDropdown) profileDropdown.classList.toggle('hidden');
        });
        document.addEventListener('click', (e) => {
            if (profileBtn && profileDropdown && !profileBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
                profileDropdown.classList.add('hidden');
            }
        });
    }

    // Services tab switching (mantido para os botões internos da seção)
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            activateTab(tabId); // Usa a função unificada
        });
    });

    // JavaScript para verificar respostas
    document.querySelectorAll('.check-answer').forEach(button => {
        button.addEventListener('click', function() {
            const form = this.closest('.question-form');
            const selected = form.querySelector('input[type="radio"]:checked');
            const correct = form.getAttribute('data-correct');
            const feedback = form.querySelector('.feedback');
            
            if (!selected) {
                feedback.textContent = 'Por favor, selecione uma alternativa.';
                feedback.className = 'feedback mt-2 text-sm text-red-600';
                return;
            }
            
            if (selected.value === correct) {
                feedback.textContent = 'Correto! A resposta é ' + correct + '.';
                feedback.className = 'feedback mt-2 text-sm text-green-600';
            } else {
                feedback.textContent = 'Errado! A resposta correta é ' + correct + '.';
                feedback.className = 'feedback mt-2 text-sm text-red-600';
            }
        });
    });

    // Cadastro (só se o formulário existir)
    const formCadastro = document.getElementById('formCadastro');
    if (formCadastro) {
        formCadastro.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const nome = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const senha = document.getElementById('registerPassword').value;
            const confirmarSenha = document.getElementById('confirmPassword').value;
            
            // Verificar se as senhas coincidem
            if (senha !== confirmarSenha) {
                alert('As senhas não coincidem!');
                return;
            }
            
            // Verificar se os termos foram aceitos
            const terms = document.getElementById('terms');
            if (terms && !terms.checked) {
                alert('Você deve aceitar os termos!');
                return;
            }
            
            // Enviar para o backend
            const response = await fetch('/cadastro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, email, senha })
            });
            
            const result = await response.json();
            alert(result.message || result.error);
            if (response.ok) window.location.href = 'login.html';
        });
    }

    // Login (só se o formulário existir)
    const formLogin = document.getElementById('formLogin');
    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const senha = document.getElementById('loginPassword').value;
            
            // Enviar para o backend
            const response = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha })
            });
            
            const result = await response.json();
            alert(result.message || result.error);
            if (response.ok) {
                // Armazenar sessão simples
                localStorage.setItem('usuario', JSON.stringify(result.usuario));
                window.location.href = 'index.html'; // Redirecionar para home ou perfil
            }
        });
    }
});

// Rota para atualizar perfil
app.post('/atualizar-perfil', async (req, res) => {
  const { nome, dob, gender, email } = req.body;
  try {
    await pool.query('UPDATE usuarios SET nome = $1 WHERE email = $2', [nome, email]);
    // Adicione mais campos se quiser (ex.: dob, gender) – crie colunas na tabela
    res.json({ message: 'Perfil atualizado!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar' });
  }
});

const profileBtn = document.getElementById('profileBtn');
if (profileBtn) {
  profileBtn.addEventListener('click', () => {
    if (!localStorage.getItem('usuario')) {
      alert('Faça login primeiro!');
      window.location.href = 'login.html';
    } else {
      document.getElementById('profileDropdown').classList.toggle('hidden');
    }
  });
}
