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

// Abrir modal para cambiar estado
function abrirModalCambiarEstado(ticketId) {
    document.getElementById('estado-ticket-id').value = ticketId;
    abrirModal('modalCambiarEstado');
}

// Guardar cambio de estado (simulado)
function guardarCambioEstado() {
    const ticketId = document.getElementById('estado-ticket-id').value;
    const nuevoEstado = document.getElementById('nuevo-estado').value;
    alert(`✅ Estado del ticket ${ticketId} cambiado a: ${nuevoEstado} (simulado)`);
    cerrarModal('modalCambiarEstado');
}

// Abrir modal para comentar
function abrirModalComentario(ticketId) {
    document.getElementById('comentario-ticket-id').value = ticketId;
    document.getElementById('comentario-texto').value = '';
    abrirModal('modalComentar');
}

// Guardar comentario (simulado)
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

function buscarTickets() {
    alert('Búsqueda avanzada aplicada (simulada)');
    cerrarModal('modalBuscar');
}

// ============================================
// MANEJO DE ARCHIVOS ADJUNTOS
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

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            cerrarTodosModales();
        }
    });

    aplicarPermisosPorRol();
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