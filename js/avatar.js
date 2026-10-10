// =================================
// AVATAR ADMIN
// =================================


// ELEMENTOS

const avatar =
document.getElementById(
"assistantAvatar"
);


const bubble =
document.getElementById(
"assistantBubble"
);


const text =
document.getElementById(
"assistantText"
);


const closeButton =
document.getElementById(
"closeAssistant"
);




// =================================
// ESTADOS
// =================================


const STATES = {


SALUDANDO:{
image:"./assets/avatar/saludo.png"
},


ESPERANDO:{
image:"./assets/avatar/esperando.png"
},


COMENTANDO:{
image:"./assets/avatar/comentando.png"
},


FELICITANDO:{
image:"./assets/avatar/felicitando.png"
},


SECRETO:{
image:"./assets/avatar/secreto.png"
}


};





let currentState =
STATES.ESPERANDO;





// =================================
// CAMBIAR AVATAR
// =================================


function changeAvatar(state){


if(!avatar)
return;



avatar.src =
state.image;



currentState =
state;


}







// =================================
// MAQUINA DE ESCRIBIR
// =================================


function typeText(message){


if(!text)
return;



text.textContent="";


let index=0;



const timer =
setInterval(()=>{


text.textContent +=
message[index];


index++;



if(index >= message.length){


clearInterval(timer);


}


},40);



}







// =================================
// MOSTRAR MENSAJE
// =================================


function showMessage(
    message,
    state,
    finishState = null,
    time = 5000
){


changeAvatar(
    state
);



bubble.classList.add(
    "active"
);



typeText(
    message
);



// cuando termina el mensaje

if(finishState){


setTimeout(()=>{


changeAvatar(
    finishState
);



typeText(
    "..."
);



},time);


}



}







// =================================
// CERRAR BURBUJA
// =================================


closeButton?.addEventListener(
"click",
()=>{


bubble.classList.remove(
"active"
);



changeAvatar(
STATES.ESPERANDO
);



}
);








// =================================
// PRIMER INICIO
// =================================


function startAvatar(){



const firstTime =
localStorage.getItem(
"adminVisited"
);





if(!firstTime){


showMessage(

`Hola Cariño 👋💜

Soy tu asistente digital.

Te acompañaré dentro del panel administrativo para ayudarte con tus citas, horarios y organización del negocio.

Aún me están desarrollando pero pronto estaré 100% lista para ayudarte ✨`

,

STATES.SALUDANDO,

STATES.ESPERANDO,

8000

);



localStorage.setItem(
"adminVisited",
"true"
);



}


else{


showMessage(

`Hola querida 💜

Me alegra que estés aquí.

No olvides que eres hermosa y serás la mejor siempre ✨`

,

STATES.FELICITANDO,

STATES.ESPERANDO,

7000

);



}



}






// =================================
// CLICK EN AVATAR
// =================================


avatar?.addEventListener(
"click",
()=>{


showMessage(

`Te podre ayudar a revisar:

📅 Citas pendientes

⏰ Horarios disponibles

📊 Estado del negocio

💜 Organización del panel`

,

STATES.COMENTANDO

);

showMessage(

`Solo espera y veras que seremos grandes amigas`

,

STATES.SECRETO


);



}

);







// INICIAR

setTimeout(
startAvatar,
1000
);