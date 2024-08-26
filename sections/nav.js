document.addEventListener('DOMContentLoaded', function() {
    const menus = document.querySelectorAll('#windows-menu, #leptop-menu, #Software-menu, #tools-menu');
    const submenus = document.querySelectorAll('#windows-submenu, #leptop-submenu, #Software-submenu, #tools-submenu');
    

    function closeAllSubmenus() {
        submenus.forEach(submenu => submenu.classList.remove('show'));
    }

    menus.forEach(menu => {
        menu.addEventListener('click', function(event) {

            event.preventDefault(); 

            // Previne o comportamento padrão do link
            const submenu = document.getElementById(menu.id.replace('-menu', '-submenu'));
            
            if (!submenu.classList.contains('show')) {
                closeAllSubmenus(); // Fecha todos os submenus
            }
            
            submenu.classList.toggle('show'); // Alterna a exibição do submenu correspondente
        });
    });
    

const verArr = this.querySelector('#sair');
   
verArr.addEventListener('click', function() {
    // Remove o token de autenticação do armazenamento local
    localStorage.removeItem('authToken');
    
    // Redireciona o usuário para a página de login
    window.location.href = 'login.html'; // Substitua 'login.html' pelo URL da sua página de login
});

});


