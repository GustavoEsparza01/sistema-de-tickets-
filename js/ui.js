// ui.js

// Elementos del DOM
const currentUserSpan = document.getElementById('current-user');
const btnLogout = document.getElementById('btnLogout');
const sidebarItems = document.querySelectorAll('.sidebar-item');
const sections = document.querySelectorAll('.content-section');

// Obtener rol y usuario del localStorage
const userRole = localStorage.getItem('userRole') || 'empleado';
const userName = localStorage.getItem('currentUser') || 'Invitado';

// Mostrar nombre de usuario
currentUserSpan.textContent = userName;

// Función para ocultar elementos según el rol
function aplicarPermisosPorRol() {
    sidebarItems.forEach(item => {
        const rolesPermitidos = item.dataset.role;
        if (rolesPermitidos) {
            const rolesArray = rolesPermitidos.split(',');
            if (!rolesArray.includes(userRole)) {
                item.style.display = 'none';
            }
        }
    });
}

// Navegación entre secciones
function showSection(sectionId) {
    sections.forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
    
    sidebarItems.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.section === sectionId) {
            item.classList.add('active');
        }
    });

    // Al cambiar de sección, recargar los tickets correspondientes
    if (sectionId === 'my-tickets' || sectionId === 'all-tickets') {
        cargarTicketsDesdeDOM(sectionId);
    }
}

// Asignar eventos a los botones del menú
sidebarItems.forEach(item => {
    item.addEventListener('click', () => {
        const section = item.dataset.section;
        if (section) {
            showSection(section);
        }
    });
});

// Logout
btnLogout.addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
    window.location.href = 'login.html';
});

// ============================================
// FUNCIONES PARA MODALES
// ============================================
function abrirModal(modalId) {
    document.getElementById('modalOverlay').style.display = 'block';
    document.getElementById(modalId).style.display = 'block';
}

function cerrarModal(modalId) {
    document.getElementById('modalOverlay').style.display = 'none';
    document.getElementById(modalId).style.display = 'none';
}

function cerrarTodosModales() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
    document.getElementById('modalOverlay').style.display = 'none';
}

// ============================================
// FUNCIONES PARA TICKETS (técnico)
// ============================================

// Variable global para almacenar los tickets de cada sección
let ticketsData = {
    'my-tickets': [],
    'all-tickets': []
};

// Cargar tickets desde el HTML (solo una vez al inicio)
function cargarTicketsDesdeDOM(seccion) {
    const container = document.querySelector(`#${seccion} .tickets-list`);
    if (!container) return;

    // Si ya tenemos datos guardados, no volver a cargar
    if (ticketsData[seccion].length > 0) return;

    const items = container.querySelectorAll('.ticket-item');
    items.forEach(item => {
        const ticket = {
            id: item.querySelector('.ticket-id')?.textContent.replace('#TKT-', '') || '0',
            titulo: item.querySelector('.ticket-title')?.textContent || '',
            descripcion: item.querySelector('.ticket-description')?.textContent || '',
            categoria: item.querySelector('.ticket-category')?.textContent.trim() || '',
            prioridad: item.querySelector('.ticket-priority')?.textContent.trim() || '',
            estado: item.querySelector('.ticket-status')?.textContent.trim() || '',
            area: extraerMeta(item, 'building') || '',
            tipoSolicitud: extraerMeta(item, 'tasks') || '',
            solicitante: extraerMeta(item, 'user') || '',
            asignadoA: extraerMeta(item, 'user-cog') || '',
            fechaCreacion: extraerFecha(item)
        };
        ticketsData[seccion].push(ticket);
    });
}

function extraerMeta(item, iconClass) {
    const span = Array.from(item.querySelectorAll('.ticket-meta span')).find(s => 
        s.querySelector(`.fa-${iconClass}`)
    );
    return span ? span.textContent.replace(/[^:]*:/, '').trim() : '';
}

function extraerFecha(item) {
    const span = Array.from(item.querySelectorAll('.ticket-meta span')).find(s => 
        s.querySelector('.fa-calendar')
    );
    if (span) {
        const fechaTexto = span.textContent.replace('Creado:', '').trim();
        // Convertir a formato YYYY-MM-DD para comparación
        const partes = fechaTexto.split(' ');
        if (partes.length >= 3) {
            const dia = partes[1];
            const mes = partes[0];
            const anio = partes[2];
            const meses = { 'Ene':1,'Feb':2,'Mar':3,'Abr':4,'May':5,'Jun':6,'Jul':7,'Ago':8,'Sep':9,'Oct':10,'Nov':11,'Dic':12 };
            return `${anio}-${meses[mes]?.toString().padStart(2,'0')}-${dia.padStart(2,'0')}`;
        }
    }
    return '';
}

// Renderizar tickets en una sección
function renderizarTickets(seccion, tickets) {
    const container = document.querySelector(`#${seccion} .tickets-list`);
    if (!container) return;
    container.innerHTML = '';
    if (tickets.length === 0) {
        container.innerHTML = '<p class="empty-state">No se encontraron tickets.</p>';
        return;
    }
    tickets.forEach(ticket => {
        // Crear el HTML del ticket (puedes adaptarlo según tu estructura)
        const html = `
            <div class="ticket-item">
                <div class="ticket-header">
                    <span class="ticket-id">#TKT-${ticket.id}</span>
                    <span class="ticket-category badge badge-${ticket.categoria}">
                        <i class="fas fa-tag"></i> ${ticket.categoria}
                    </span>
                    <span class="ticket-priority badge-priority ${ticket.prioridad}">${ticket.prioridad}</span>
                    <span class="ticket-status status-${ticket.estado.replace(' ', '-')}">${ticket.estado}</span>
                </div>
                <div class="ticket-body">
                    <h3 class="ticket-title">${ticket.titulo}</h3>
                    <p class="ticket-description">${ticket.descripcion}</p>
                    <div class="ticket-meta">
                        <span><i class="far fa-calendar"></i> ${ticket.fechaCreacion}</span>
                        <span><i class="fas fa-building"></i> ${ticket.area}</span>
                        <span><i class="fas fa-tasks"></i> ${ticket.tipoSolicitud}</span>
                        <span><i class="fas fa-user"></i> ${ticket.solicitante}</span>
                        ${ticket.asignadoA ? `<span><i class="fas fa-user-cog"></i> ${ticket.asignadoA}</span>` : ''}
                    </div>
                </div>
                <div class="ticket-actions">
                    <button class="btn btn-sm btn-primary" onclick="abrirModalCambiarEstado(${ticket.id})">
                        <i class="fas fa-exchange-alt"></i> Cambiar Estado
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="abrirModalComentario(${ticket.id})">
                        <i class="fas fa-comment"></i> Comentar
                    </button>
                    ${seccion === 'all-tickets' && !ticket.asignadoA ? `
                        <button class="btn btn-sm btn-success" onclick="alert('Asignarme ticket ${ticket.id}')">
                            <i class="fas fa-hand-pointer"></i> Asignarme
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
        container.innerHTML += html;
    });
}

// Búsqueda simple por texto (título o descripción)
function buscarTexto(seccion, texto) {
    const tickets = ticketsData[seccion];
    if (!texto) return tickets;
    return tickets.filter(t => 
        t.titulo.toLowerCase().includes(texto.toLowerCase()) ||
        t.descripcion.toLowerCase().includes(texto.toLowerCase())
    );
}

// Búsqueda avanzada con filtros
function buscarAvanzado(seccion, filtros) {
    let tickets = ticketsData[seccion];
    if (filtros.palabras) {
        tickets = tickets.filter(t => 
            t.titulo.toLowerCase().includes(filtros.palabras.toLowerCase()) ||
            t.descripcion.toLowerCase().includes(filtros.palabras.toLowerCase())
        );
    }
    if (filtros.area) tickets = tickets.filter(t => t.area === filtros.area);
    if (filtros.tipo) tickets = tickets.filter(t => t.tipoSolicitud === filtros.tipo);
    if (filtros.prioridad) tickets = tickets.filter(t => t.prioridad === filtros.prioridad);
    if (filtros.estado) tickets = tickets.filter(t => t.estado === filtros.estado);
    if (filtros.fechaDesde) {
        const desde = new Date(filtros.fechaDesde);
        tickets = tickets.filter(t => new Date(t.fechaCreacion) >= desde);
    }
    if (filtros.fechaHasta) {
        const hasta = new Date(filtros.fechaHasta);
        hasta.setDate(hasta.getDate() + 1);
        tickets = tickets.filter(t => new Date(t.fechaCreacion) <= hasta);
    }
    return tickets;
}

// Función para el botón de búsqueda simple (en la barra de controles)
function buscarSimple(seccion) {
    const input = document.querySelector(`#${seccion} .search-controls input`);
    if (!input) return;
    const texto = input.value;
    const filtrados = buscarTexto(seccion, texto);
    renderizarTickets(seccion, filtrados);
}

// Función para aplicar filtros rápidos (estado, prioridad, etc.)
function aplicarFiltrosRapidos(seccion) {
    let tickets = ticketsData[seccion];
    const estadoSelect = document.querySelector(`#${seccion} select[id*="status"]`);
    const prioridadSelect = document.querySelector(`#${seccion} select[id*="priority"]`);
    const asignadoSelect = document.querySelector(`#${seccion} select[id*="assigned"]`); // solo en all-tickets

    if (estadoSelect && estadoSelect.value) {
        tickets = tickets.filter(t => t.estado === estadoSelect.value);
    }
    if (prioridadSelect && prioridadSelect.value) {
        tickets = tickets.filter(t => t.prioridad === prioridadSelect.value);
    }
    if (asignadoSelect && seccion === 'all-tickets') {
        const val = asignadoSelect.value;
        if (val === 'asignados') {
            tickets = tickets.filter(t => t.asignadoA === userName);
        } else if (val === 'no-asignados') {
            tickets = tickets.filter(t => !t.asignadoA);
        }
    }
    renderizarTickets(seccion, tickets);
}

// Búsqueda avanzada desde el modal
function buscarTickets() {
    const seccionActiva = document.querySelector('.content-section.active')?.id;
    if (!seccionActiva || (seccionActiva !== 'my-tickets' && seccionActiva !== 'all-tickets')) {
        alert('Esta búsqueda solo está disponible en las secciones de tickets.');
        cerrarModal('modalBuscar');
        return;
    }

    const filtros = {
        palabras: document.getElementById('buscar-palabras')?.value,
        area: document.getElementById('buscar-area')?.value,
        tipo: document.getElementById('buscar-tipo')?.value,
        prioridad: document.getElementById('buscar-prioridad')?.value,
        estado: document.getElementById('buscar-estado')?.value,
        fechaDesde: document.getElementById('buscar-fecha-desde')?.value,
        fechaHasta: document.getElementById('buscar-fecha-hasta')?.value
    };

    const ticketsFiltrados = buscarAvanzado(seccionActiva, filtros);
    renderizarTickets(seccionActiva, ticketsFiltrados);
    cerrarModal('modalBuscar');
}

// ============================================
// FUNCIONES PARA MODALES DE ESTADO Y COMENTARIOS
// ============================================
function abrirModalCambiarEstado(ticketId) {
    document.getElementById('estado-ticket-id').value = ticketId;
    abrirModal('modalCambiarEstado');
}

function guardarCambioEstado() {
    const ticketId = document.getElementById('estado-ticket-id').value;
    const nuevoEstado = document.getElementById('nuevo-estado').value;
    alert(`✅ Estado del ticket ${ticketId} cambiado a: ${nuevoEstado} (simulado)`);
    cerrarModal('modalCambiarEstado');
}

function abrirModalComentario(ticketId) {
    document.getElementById('comentario-ticket-id').value = ticketId;
    document.getElementById('comentario-texto').value = '';
    abrirModal('modalComentar');
}

function guardarComentario() {
    const ticketId = document.getElementById('comentario-ticket-id').value;
    const comentario = document.getElementById('comentario-texto').value;
    if (!comentario.trim()) {
        alert('El comentario no puede estar vacío');
        return;
    }
    alert(`✅ Comentario agregado al ticket ${ticketId}: "${comentario}" (simulado)`);
    cerrarModal('modalComentar');
}

// ============================================
// FUNCIONES DE DEMO (modales anteriores)
// ============================================
function enviarTicketModal() {
    alert('Ticket creado (simulado) desde el modal');
    cerrarModal('modalNuevoTicket');
}

// ============================================
// MANEJO DE ARCHIVOS ADJUNTOS Y EVENTOS INICIALES
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('ticket-attachments');
    const fileList = document.getElementById('file-list');
    if (fileInput && fileList) {
        fileInput.addEventListener('change', function() {
            fileList.innerHTML = '';
            if (this.files.length > 0) {
                const list = document.createElement('ul');
                list.className = 'file-list-items';
                Array.from(this.files).forEach((file, index) => {
                    const listItem = document.createElement('li');
                    listItem.className = 'file-list-item';
                    listItem.innerHTML = `<span class="file-name">${file.name}</span> <span class="file-size">${(file.size/1024).toFixed(2)} KB</span> <button class="remove-file-btn" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>`;
                    list.appendChild(listItem);
                });
                fileList.appendChild(list);
            }
        });
    }

    const ticketForm = document.getElementById('ticketForm');
    if (ticketForm) {
        ticketForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Ticket enviado (simulado) desde el formulario principal');
        });
    }

    // Asignar eventos a los botones de búsqueda simple y filtros
    // Para la sección my-tickets
    const btnFiltrarMy = document.querySelector('#my-tickets .btn-secondary');
    if (btnFiltrarMy) {
        btnFiltrarMy.addEventListener('click', () => aplicarFiltrosRapidos('my-tickets'));
    }
    const btnBuscarMy = document.querySelector('#my-tickets .search-controls .btn-primary');
    if (btnBuscarMy) {
        btnBuscarMy.addEventListener('click', (e) => {
            e.preventDefault();
            abrirModal('modalBuscar');
        });
    }
    // Búsqueda simple por input (opcional, podríamos agregar un botón "Buscar" en la lupa)
    const inputMy = document.querySelector('#my-tickets .search-controls input');
    if (inputMy) {
        inputMy.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') buscarSimple('my-tickets');
        });
    }

    // Para la sección all-tickets
    const btnFiltrarAll = document.querySelector('#all-tickets .btn-secondary');
    if (btnFiltrarAll) {
        btnFiltrarAll.addEventListener('click', () => aplicarFiltrosRapidos('all-tickets'));
    }
    const btnBuscarAll = document.querySelector('#all-tickets .search-controls .btn-primary');
    if (btnBuscarAll) {
        btnBuscarAll.addEventListener('click', (e) => {
            e.preventDefault();
            abrirModal('modalBuscar');
        });
    }
    const inputAll = document.querySelector('#all-tickets .search-controls input');
    if (inputAll) {
        inputAll.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') buscarSimple('all-tickets');
        });
    }

    // Cerrar modales con tecla ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            cerrarTodosModales();
        }
    });

    // Inicializar permisos y cargar datos
    aplicarPermisosPorRol();
    cargarTicketsDesdeDOM('my-tickets');
    cargarTicketsDesdeDOM('all-tickets');
    showSection('dashboard');
});

// Exponer funciones globalmente
window.showSection = showSection;
window.abrirModal = abrirModal;
window.cerrarModal = cerrarModal;
window.cerrarTodosModales = cerrarTodosModales;
window.enviarTicketModal = enviarTicketModal;
window.buscarTickets = buscarTickets;
window.abrirModalCambiarEstado = abrirModalCambiarEstado;
window.guardarCambioEstado = guardarCambioEstado;
window.abrirModalComentario = abrirModalComentario;
window.guardarComentario = guardarComentario;
window.buscarSimple = buscarSimple;