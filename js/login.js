const mostratContrasenia = (contrasenia, ojoLogin) =>{
    const input = document.getElementById(contrasenia),
          iconoOjo = document.getElementById(ojoLogin)
 
    iconoOjo.addEventListener('click', () =>{
       
       if(input.type === 'password'){
          input.type = 'text'
 
          iconoOjo.classList.add('ri-eye-line')
          iconoOjo.classList.remove('ri-eye-off-line')
       } else{
          input.type = 'password'

          iconoOjo.classList.remove('ri-eye-line')
          iconoOjo.classList.add('ri-eye-off-line')
       }
    })
 }
 mostratContrasenia('contrasenia','ojoLogin')

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-email').value;
    const password = document.getElementById('contrasenia').value;

    try {
        const response = await fetch('http://localhost:3000/usuario');
        const users = await response.json();
        const user = users.find(u => u.usuario_login === username && u.usuario_pass === password);

        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
            window.location.href = 'menu.html';
        } else {
            document.getElementById('error-message').innerText = 'Usuario o Password incorrecto';
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

