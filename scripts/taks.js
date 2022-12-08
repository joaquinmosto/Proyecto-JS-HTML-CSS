// SEGURIDAD: Si no se encuentra en localStorage info del usuario
// no lo deja acceder a la página, redirigiendo al login inmediatamente.
let token = localStorage.getItem('jwt')
if(  ! token ) {
  location.replace('index.html');
}


/* ------ comienzan las funcionalidades una vez que carga el documento ------ */
window.addEventListener('load', function () {

  /* ---------------- variables globales y llamado a funciones ---------------- */
  const userName = document.querySelector('.user-info p')
  const btnCerrarSesion = document.querySelector('#closeApp');
  const formCrearTarea = document.querySelector('.nueva-tarea');
  const tareasPendientes = document.querySelector('.tareas-pendientes');
  const tareasTerminadas = this.document.querySelector('.tareas-terminadas');
  
  const url = 'http://todo-api.ctd.academy:3000/v1';
  
  //console.log(userName, btnCerrarSesion);

  obtenerNombreUsuario();
  consultarTareas();
  /* -------------------------------------------------------------------------- */
  /*                          FUNCIÓN 1 - Cerrar sesión                         */
  /* -------------------------------------------------------------------------- */
  // Elimina el jwt y voy al index.html
  btnCerrarSesion.addEventListener('click', function () {
    if( confirm('¿Desar Salir de la APP?')){
      localStorage.clear();
      location.replace('index.html');
    }

  });

  /* -------------------------------------------------------------------------- */
  /*                 FUNCIÓN 2 - Obtener nombre de usuario [GET]                */
  /* -------------------------------------------------------------------------- */

  function obtenerNombreUsuario() {
    console.log('GetMe');
    const endPoint = `${url}/users/getMe`;
    const config = {
      method: 'GET',
      headers: {
        authorization: token,
        'Content-type': 'application/json',
      }
    }

    fetch(endPoint, config).then( response => {  return response.json() })
    .then( respJSON => {
      //console.log( respJSON);
      user = respJSON;
      userName.textContent = respJSON.firstName;

    }).catch( error => {
      alert('upss tenemos un error :(');
    })

  };


  /* -------------------------------------------------------------------------- */
  /*                 FUNCIÓN 3 - Obtener listado de tareas [GET]                */
  /* -------------------------------------------------------------------------- */

  function consultarTareas() {
    
    const endPoint = `${url}/tasks`;
    const config = {
      method: 'GET',
      headers: {
        authorization: token,
        'Content-type': 'application/json',
      }
    }

    fetch(endPoint, config).then( response => response.json() )
    .then( respJSON => {
      // si se recibe correctamente paso el listado para renderizar
      renderizarTareas(respJSON);
    }).catch( error => {
      alert('upss tenemos un error la consultar las tareas :(');
      console.error(error);
    })

  };


  /* -------------------------------------------------------------------------- */
  /*                    FUNCIÓN 4 - Crear nueva tarea [POST]                    */
  /* -------------------------------------------------------------------------- */

  formCrearTarea.addEventListener('submit', function (event) {
    // evito que recargue la pagina con el envio del form
    event.preventDefault();
    // creo los datos para el POST
    const endPoint = `${url}/tasks`;
    const tarea = document.querySelector('#nuevaTarea');
    const datos = {
      description: tarea.value,
      completed: false,
    };

    const config = {
      method: 'POST',
      headers: {
        authorization: token,
        'Content-type': 'application/json',
      },
      body: JSON.stringify(datos),
    }
    // Hago el fetch para crear la tarea
    fetch(endPoint, config).then( response => response.json() )
    .then( respJSON => {
      console.log( respJSON);
      // si se crea "correctamente" vuelvo a consultar las tareas para que renderize la nueva
      consultarTareas();
      // limpio el formulario
      formCrearTarea.reset()
    }).catch( error => {
      alert('upss tenemos un error la consultar las tareas :(');
      console.error(error);
    })

  });


  /* -------------------------------------------------------------------------- */
  /*                  FUNCIÓN 5 - Renderizar tareas en pantalla                 */
  /* -------------------------------------------------------------------------- */
  function renderizarTareas(listado) {

    console.log(listado)

    console.log('tasks', listado);
    tareasPendientes.innerHTML = '';
    tareasTerminadas.innerHTML = '';
    // recorro el listado recibido y "renderizo" (envio el html al navegador)
    listado.forEach(task => {

        const fecha =  new Date( task.createdAt).toLocaleString();

        if( task.completed == false ){
          tareasPendientes.innerHTML +=  // html
            `<li class="tarea">
              <button type="button" title="Completar tarea" class="change" id="${task.id}"> <i class="fa-regular fa-circle"> </i> </button>
              <div class="descripcion">
                <p class="nombre">${task.description}</p>
                <p class="timestamp">${fecha}</p>
              </div>
            </li>`;
        } else {
          tareasTerminadas.innerHTML += // html
              `<li class="tarea">
                <div class="hecha">
                  <i class="fa-regular fa-circle-check"></i>
                </div>
                <div class="descripcion">
                  <p class="nombre">${task.description}</p>
                  <div class="cambios-estados">
                    <button type="button" title="Cambiar estado" class="change incompleta" id="${task.id}" ><i class="fa-solid fa-rotate-left"></i></button>
                    <button type="button" title="Eliminar tarea" class="borrar" id="${task.id}"><i class="fa-regular fa-trash-can"></i></button>
                  </div>
                </div>
              </li>`
        }

    });

    // Cuando se rederizo los tareas selecciono todos los botones "delete" y agrego el listener
    const btnDelets = document.querySelectorAll('.borrar');
        
    btnDelets.forEach(btn => {
      btn.addEventListener('click', function (e) {
        botonBorrarTarea(e.target.id);
        
      })
    });
    // Selecciono todos los botones de cambio de estado (check verde) y agrego el listener
    const btnCompleted = document.querySelectorAll('.change');
    

    btnCompleted.forEach(btn => {
      btn.addEventListener('click', function (e) {
        
        //llamo a la funcion de cambio de estado enviando el elemento HTML 
        // (boton completo) en el que se hizo click
        botonesCambioEstado(e.target);
        
      })
    });

  };

  /* -------------------------------------------------------------------------- */
  /*                  FUNCIÓN 6 - Cambiar estado de tarea [PUT]                 */
  /* -------------------------------------------------------------------------- */
  function botonesCambioEstado(boton) {

    // preparo los datos para el PUT
    let data;
    if(boton.classList.contains('incompleta')){
      // cambiar completed = false
      data = {"completed" : false}
    }else{
      // cambiar completed = true
      data = {"completed" : true}
    }
    

    const endPoint = `${url}/tasks/${boton.id}`;
    const config = {
      method: 'PUT',
      headers: {
        authorization: token,
        'Content-type': 'application/json'

      },
      body: JSON.stringify(data),
    }

    fetch( endPoint, config ).then( response => {
        if(  response.ok == false){
          alert('Ups algo salio mal');
          return;
        }
        response.json();
      })
      .then( resJSON => {
        // si todo salió bien llamo a consultar tareas para que vuelva a renderizar todas las tareas
        consultarTareas();
      })
      .catch( error => {
        console.error('ERROR' , error);
      })

  }


  /* -------------------------------------------------------------------------- */
  /*                     FUNCIÓN 7 - Eliminar tarea [DELETE]                    */
  /* -------------------------------------------------------------------------- */
  function botonBorrarTarea(id) {
   
    console.log('eliminado tarea', id);

    const endPoint = `${url}/tasks/${id}`;
    const config = {
      method: 'DELETE',
      headers: {
        authorization: token,
        'Content-type': 'application/json'
      }
    }

    fetch( endPoint, config ).then( response => {
        if(  response.ok == false){
          alert('Ups algo salio mal');
          return;
        }
        console.log(response);
        response.json();
      })
      .then( resJSON => {
        console.log(resJSON);
        consultarTareas();
      })
      .catch( error => {
        console.error('ERROR' , error);
      })

  };

});