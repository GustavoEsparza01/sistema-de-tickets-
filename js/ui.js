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

// URL de la API (JSON Server)
const API_URL = 'http://localhost:3000';

// Función para ocultar elementos según el rol
function aplicarPermisosPorRol() {
    sidebarItems.forEach(item => {
        const rolesPermitidos = item.dataset.role;
        if (rolesPermitidos) {
            const rolesArray = rolesPermitidos.split(',');
            if (!rolesArray.includes(userRole)) {
                item.style.display = 'none';
            } else {
                item.style.display = '';
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

    // Cargar datos según la sección
    if (sectionId === 'my-created-tickets') {
        cargarMisTickets();
    } else if (sectionId === 'my-assignments') {
        cargarMisAsignaciones();
    } else if (sectionId === 'all-tickets') {
        cargarTodosTickets();
    } else if (sectionId === 'dashboard') {
        cargarEstadisticasDashboard();
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
// FUNCIONES PARA CARGAR TICKETS DESDE JSON SERVER
// ============================================

function mostrarNotificacion(mensaje, tipo = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${tipo}`;
    toast.textContent = mensaje;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Renderizar tickets en un contenedor
function renderizarTickets(containerId, tickets, esAsignaciones = false) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    if (tickets.length === 0) {
        container.innerHTML = '<p class="empty-state">No se encontraron tickets.</p>';
        return;
    }
    tickets.forEach(ticket => {
        let botones = '';
        if (esAsignaciones) {
            // Vista para técnico (mis asignaciones o todos los tickets)
            botones = `
                <button class="btn btn-sm btn-primary" onclick="abrirModalCambiarEstado(${ticket.id})">
                    <i class="fas fa-exchange-alt"></i> Cambiar Estado
                </button>
                <button class="btn btn-sm btn-secondary" onclick="abrirModalComentario(${ticket.id})">
                    <i class="fas fa-comment"></i> Comentar
                </button>
                ${!ticket.asignadoA ? `
                    <button class="btn btn-sm btn-success" onclick="asignarmeTicket(${ticket.id})">
                        <i class="fas fa-hand-pointer"></i> Asignarme
                    </button>
                ` : ''}
            `;
        } else {
            // Vista para empleado (mis tickets)
            botones = `
                <button class="btn btn-sm btn-primary" onclick="abrirModalCambiarEstado(${ticket.id})">
                    <i class="fas fa-exchange-alt"></i> Cambiar Estado
                </button>
                <button class="btn btn-sm btn-secondary" onclick="abrirModalComentario(${ticket.id})">
                    <i class="fas fa-comment"></i> Comentar
                </button>
            `;
        }

        const html = `
            <div class="ticket-item">
                <div class="ticket-header">
                    <span class="ticket-id">#TKT-${ticket.id}</span>
                    <span class="ticket-category badge badge-${ticket.categoria}">
                        <i class="fas fa-tag"></i> ${ticket.categoria}
                    </span>
                    <span class="ticket-priority badge-priority ${ticket.prioridad}">${ticket.prioridad}</span>
                    <span class="ticket-status status-${ticket.estado.replace('_', '-')}">${ticket.estado}</span>
                </div>
                <div class="ticket-body">
                    <h3 class="ticket-title">${ticket.titulo}</h3>
                    <p class="ticket-description">${ticket.descripcion}</p>
                    <div class="ticket-meta">
                        <span><i class="far fa-calendar"></i> ${new Date(ticket.fechaCreacion).toLocaleDateString()}</span>
                        <span><i class="fas fa-building"></i> ${ticket.area}</span>
                        <span><i class="fas fa-tasks"></i> ${ticket.tipoSolicitud}</span>
                        <span><i class="fas fa-user"></i> ${ticket.solicitante || 'N/A'}</span>
                        ${ticket.asignadoA ? `<span><i class="fas fa-user-cog"></i> ${ticket.asignadoA}</span>` : ''}
                    </div>
                </div>
                <div class="ticket-actions">
                    ${botones}
                </div>
            </div>
        `;
        container.innerHTML += html;
    });
}

// Cargar Mis Tickets (empleado) - tickets creados por el usuario actual
async function cargarMisTickets() {
    try {
        const response = await fetch(`${API_URL}/tickets?solicitante=${encodeURIComponent(userName)}`);
        const tickets = await response.json();
        renderizarTickets('my-created-tickets-list', tickets, false);
    } catch (error) {
        console.error('Error al cargar mis tickets:', error);
        mostrarNotificacion('Error al cargar tickets', 'error');
    }
}

// Cargar Mis Asignaciones (técnico) - tickets donde asignadoA = userName
async function cargarMisAsignaciones() {
    try {
        const response = await fetch(`${API_URL}/tickets?asignadoA=${encodeURIComponent(userName)}`);
        const tickets = await response.json();
        renderizarTickets('my-assignments-list', tickets, true);
    } catch (error) {
        console.error('Error al cargar asignaciones:', error);
        mostrarNotificacion('Error al cargar asignaciones', 'error');
    }
}

// Cargar Todos los Tickets (técnico/admin)
async function cargarTodosTickets() {
    try {
        const response = await fetch(`${API_URL}/tickets`);
        const tickets = await response.json();
        renderizarTickets('all-tickets-list', tickets, true);
    } catch (error) {
        console.error('Error al cargar todos los tickets:', error);
        mostrarNotificacion('Error al cargar tickets', 'error');
    }
}

// Cargar estadísticas del dashboard
async function cargarEstadisticasDashboard() {
    try {
        const res = await fetch(`${API_URL}/tickets`);
        const tickets = await res.json();
        let misAbiertos, enProgreso, resueltosHoy, tiempoPromedio;
        if (userRole === 'empleado') {
            misAbiertos = tickets.filter(t => t.solicitante === userName && t.estado === 'abierto').length;
            enProgreso = tickets.filter(t => t.solicitante === userName && t.estado === 'en_progreso').length;
            resueltosHoy = tickets.filter(t => t.solicitante === userName && t.estado === 'resuelto' && new Date(t.fechaCreacion).toDateString() === new Date().toDateString()).length;
        } else {
            misAbiertos = tickets.filter(t => t.asignadoA === userName && t.estado === 'abierto').length;
            enProgreso = tickets.filter(t => t.asignadoA === userName && t.estado === 'en_progreso').length;
            resueltosHoy = tickets.filter(t => t.asignadoA === userName && t.estado === 'resuelto' && new Date(t.fechaCreacion).toDateString() === new Date().toDateString()).length;
        }
        tiempoPromedio = '2.5h';

        document.querySelector('#dashboard .stat-card:nth-child(1) .stat-number').textContent = misAbiertos;
        document.querySelector('#dashboard .stat-card:nth-child(2) .stat-number').textContent = enProgreso;
        document.querySelector('#dashboard .stat-card:nth-child(3) .stat-number').textContent = resueltosHoy;
        document.querySelector('#dashboard .stat-card:nth-child(4) .stat-number').textContent = tiempoPromedio;
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
    }
}

// ============================================
// FUNCIONES PARA ACCIONES SOBRE TICKETS
// ============================================

async function crearTicket(datos) {
    try {
        const response = await fetch(`${API_URL}/tickets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        if (response.ok) {
            mostrarNotificacion('✅ Ticket creado con éxito');
            return true;
        } else {
            mostrarNotificacion('❌ Error al crear el ticket', 'error');
            return false;
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('Error de conexión', 'error');
        return false;
    }
}

async function guardarCambioEstado() {
    const ticketId = document.getElementById('estado-ticket-id').value;
    const nuevoEstado = document.getElementById('nuevo-estado').value;
    try {
        const response = await fetch(`${API_URL}/tickets/${ticketId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: nuevoEstado })
        });
        if (response.ok) {
            mostrarNotificacion('✅ Estado actualizado');
            cerrarModal('modalCambiarEstado');
            const activeSection = document.querySelector('.content-section.active').id;
            if (activeSection === 'my-created-tickets') cargarMisTickets();
            else if (activeSection === 'my-assignments') cargarMisAsignaciones();
            else if (activeSection === 'all-tickets') cargarTodosTickets();
        } else {
            mostrarNotificacion('❌ Error al actualizar', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('Error de conexión', 'error');
    }
}

async function guardarComentario() {
    const ticketId = document.getElementById('comentario-ticket-id').value;
    const contenido = document.getElementById('comentario-texto').value;
    if (!contenido.trim()) {
        mostrarNotificacion('El comentario no puede estar vacío', 'error');
        return;
    }
    const comentario = {
        ticketId: parseInt(ticketId),
        usuario: userName,
        contenido,
        fecha: new Date().toISOString()
    };
    try {
        const response = await fetch(`${API_URL}/comentarios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(comentario)
        });
        if (response.ok) {
            mostrarNotificacion('✅ Comentario agregado');
            cerrarModal('modalComentar');
        } else {
            mostrarNotificacion('❌ Error al agregar comentario', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('Error de conexión', 'error');
    }
}

async function asignarmeTicket(ticketId) {
    try {
        const response = await fetch(`${API_URL}/tickets/${ticketId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ asignadoA: userName })
        });
        if (response.ok) {
            mostrarNotificacion('✅ Ticket asignado a ti');
            const activeSection = document.querySelector('.content-section.active').id;
            if (activeSection === 'my-assignments') cargarMisAsignaciones();
            else if (activeSection === 'all-tickets') cargarTodosTickets();
        } else {
            mostrarNotificacion('❌ Error al asignar', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('Error de conexión', 'error');
    }
}

// ============================================
// BÚSQUEDA AVANZADA
// ============================================
async function buscarTickets() {
    const seccionActiva = document.querySelector('.content-section.active')?.id;
    if (!seccionActiva || !['my-created-tickets', 'my-assignments', 'all-tickets'].includes(seccionActiva)) {
        mostrarNotificacion('Esta búsqueda solo está disponible en secciones de tickets', 'error');
        cerrarModal('modalBuscar');
        return;
    }

    const palabras = document.getElementById('buscar-palabras').value;
    const area = document.getElementById('buscar-area').value;
    const tipo = document.getElementById('buscar-tipo').value;
    const prioridad = document.getElementById('buscar-prioridad').value;
    const estado = document.getElementById('buscar-estado').value;
    const fechaDesde = document.getElementById('buscar-fecha-desde').value;
    const fechaHasta = document.getElementById('buscar-fecha-hasta').value;

    const params = new URLSearchParams();
    if (palabras) params.append('q', palabras);
    if (area) params.append('area', area);
    if (tipo) params.append('tipoSolicitud', tipo);
    if (prioridad) params.append('prioridad', prioridad);
    if (estado) params.append('estado', estado);

    try {
        const response = await fetch(`${API_URL}/tickets?${params.toString()}`);
        let tickets = await response.json();

        if (fechaDesde) {
            const desde = new Date(fechaDesde);
            tickets = tickets.filter(t => new Date(t.fechaCreacion) >= desde);
        }
        if (fechaHasta) {
            const hasta = new Date(fechaHasta);
            hasta.setDate(hasta.getDate() + 1);
            tickets = tickets.filter(t => new Date(t.fechaCreacion) <= hasta);
        }

        if (seccionActiva === 'my-created-tickets') {
            tickets = tickets.filter(t => t.solicitante === userName);
        } else if (seccionActiva === 'my-assignments') {
            tickets = tickets.filter(t => t.asignadoA === userName);
        }

        const containerId = seccionActiva === 'my-created-tickets' ? 'my-created-tickets-list' : (seccionActiva === 'my-assignments' ? 'my-assignments-list' : 'all-tickets-list');
        const esAsignaciones = (seccionActiva !== 'my-created-tickets');
        renderizarTickets(containerId, tickets, esAsignaciones);
        cerrarModal('modalBuscar');
    } catch (error) {
        console.error('Error en búsqueda:', error);
        mostrarNotificacion('Error en la búsqueda', 'error');
    }
}

// Filtros rápidos
async function aplicarFiltrosRapidos(seccion) {
    let estadoVal = '', prioridadVal = '';
    if (seccion === 'my-created-tickets') {
        estadoVal = document.getElementById('filter-status-created')?.value;
        prioridadVal = document.getElementById('filter-priority-created')?.value;
    } else if (seccion === 'my-assignments') {
        estadoVal = document.getElementById('filter-status-assignments')?.value;
        prioridadVal = document.getElementById('filter-priority-assignments')?.value;
    } else if (seccion === 'all-tickets') {
        estadoVal = document.getElementById('filter-status-all')?.value;
        prioridadVal = document.getElementById('filter-priority-all')?.value;
    }

    const params = new URLSearchParams();
    if (estadoVal) params.append('estado', estadoVal);
    if (prioridadVal) params.append('prioridad', prioridadVal);

    try {
        const response = await fetch(`${API_URL}/tickets?${params.toString()}`);
        let tickets = await response.json();

        if (seccion === 'my-created-tickets') {
            tickets = tickets.filter(t => t.solicitante === userName);
        } else if (seccion === 'my-assignments') {
            tickets = tickets.filter(t => t.asignadoA === userName);
        } else if (seccion === 'all-tickets') {
            const asignadoSelect = document.getElementById('filter-assigned');
            if (asignadoSelect) {
                if (asignadoSelect.value === 'asignados') {
                    tickets = tickets.filter(t => t.asignadoA === userName);
                } else if (asignadoSelect.value === 'no-asignados') {
                    tickets = tickets.filter(t => !t.asignadoA);
                }
            }
        }

        const containerId = seccion === 'my-created-tickets' ? 'my-created-tickets-list' : (seccion === 'my-assignments' ? 'my-assignments-list' : 'all-tickets-list');
        const esAsignaciones = (seccion !== 'my-created-tickets');
        renderizarTickets(containerId, tickets, esAsignaciones);
    } catch (error) {
        console.error('Error al filtrar:', error);
        mostrarNotificacion('Error al filtrar', 'error');
    }
}

// ============================================
// FUNCIONES DE MODALES
// ============================================
function abrirModalCambiarEstado(ticketId) {
    document.getElementById('estado-ticket-id').value = ticketId;
    abrirModal('modalCambiarEstado');
}

function abrirModalComentario(ticketId) {
    document.getElementById('comentario-ticket-id').value = ticketId;
    document.getElementById('comentario-texto').value = '';
    abrirModal('modalComentar');
}

function enviarTicketModal() {
    const titulo = document.getElementById('modal-titulo').value;
    const categoria = document.getElementById('modal-categoria').value;
    const prioridad = document.getElementById('modal-prioridad').value;
    const descripcion = document.getElementById('modal-descripcion').value;
    const area = document.getElementById('modal-area').value;
    const tipo = document.getElementById('modal-tipo').value;

    if (!titulo || !descripcion || !categoria || !prioridad || !area || !tipo) {
        mostrarNotificacion('Por favor completa todos los campos', 'error');
        return;
    }

    const nuevoTicket = {
        titulo,
        descripcion,
        categoria,
        prioridad,
        area,
        tipoSolicitud: tipo,
        estado: 'abierto',
        fechaCreacion: new Date().toISOString(),
        solicitante: userName,
        asignadoA: null
    };

    crearTicket(nuevoTicket).then(exito => {
        if (exito) {
            cerrarModal('modalNuevoTicket');
            if (document.getElementById('my-created-tickets').classList.contains('active')) {
                cargarMisTickets();
            } else {
                showSection('my-created-tickets');
            }
        }
    });
}

// ============================================
// INICIALIZACIÓN
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
                Array.from(this.files).forEach(file => {
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
        ticketForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const ticketData = {
                titulo: document.getElementById('ticket-title').value,
                descripcion: document.getElementById('ticket-description').value,
                categoria: document.getElementById('ticket-category').value,
                prioridad: document.getElementById('ticket-priority').value,
                area: document.getElementById('ticket-area').value,
                tipoSolicitud: document.getElementById('ticket-tipo').value,
                estado: 'abierto',
                fechaCreacion: new Date().toISOString(),
                solicitante: userName,
                asignadoA: null
            };
            if (await crearTicket(ticketData)) {
                ticketForm.reset();
                showSection('my-created-tickets');
            }
        });
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            cerrarTodosModales();
        }
    });

    aplicarPermisosPorRol();
    showSection('dashboard');
});

// Exponer funciones globales
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
window.asignarmeTicket = asignarmeTicket;
window.aplicarFiltrosRapidos = aplicarFiltrosRapidos;