window.addEventListener('load', function () {
    /* ---------------------- obtenemos variables globales ---------------------- */
    const inputNombre = document.querySelector('#inputNombre');
    const inputApellido = document.querySelector('#inputApellido');
    const inputEmail = document.querySelector('#inputEmail');
    const inputPassword = document.querySelector('#inputPassword');
    const inputPasswordRepetida = document.querySelector('#inputPasswordRepetida');
    const form = document.querySelector('form');

    /* -------------------------------------------------------------------------- */
    /*            FUNCIÓN 1: Escuchamos el submit y preparamos el envío           */
    /* -------------------------------------------------------------------------- */
    form.addEventListener('submit', function (event) {
        event.preventDefault();

        if(inputNombre.value && inputApellido.value && inputEmail.value && inputPassword.value && inputPasswordRepetida.value){
            let data = {
                firstName: inputNombre.value,
                lastName: inputApellido.value,
                email: inputEmail.value,
                password: inputPassword.value
            };
            realizarRegister(data)

        }else{
            alert('El formulario tiene campos vacios');
        }

    });

    /* -------------------------------------------------------------------------- */
    /*                    FUNCIÓN 2: Realizar el signup [POST]                    */
    /* -------------------------------------------------------------------------- */
     function realizarRegister(data) {
       
        let endpoint = 'http://todo-api.ctd.academy:3000/v1/users';
        
        let settings = {
            "method": "POST",
            "headers":{ "content-type" : "application/json" },
            "body": JSON.stringify(data)
        };

        fetch(endpoint,settings).then(response =>{
            console.log(response)
            return response.json();
        }).then(info => {
            console.log(info.jwt)
            localStorage.setItem('jwt', info.jwt);
            
            location.replace('index.html');

        }).catch(error =>{
            console.log('Error:  '+ error);
        })
    };
});