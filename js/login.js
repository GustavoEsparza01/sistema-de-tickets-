// login.js
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    if (!email || !password || !role) {
        alert('Por favor completa todos los campos');
        return;
    }

    // Simular autenticación exitosa
    let userName = '';
    switch (role) {
        case 'empleado':
            userName = 'Juan Pérez (Empleado)';
            break;
        case 'tecnico':
            userName = 'Carlos Rodríguez (Técnico)';
            break;
        case 'admin':
            userName = 'Ana García (Administradora)';
            break;
        default:
            userName = 'Usuario';
    }

    // Guardar en localStorage
    localStorage.setItem('currentUser', userName);
    localStorage.setItem('userRole', role);

    // Redirigir al dashboard
    window.location.href = 'index.html';
});