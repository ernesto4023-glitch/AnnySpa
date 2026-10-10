import {

collection,
addDoc

}

from

"https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";


import {

db

}

from

"./firebase-config.js";




// =================================
// VARIABLES DE RESERVA
// =================================


window.selectedDate = "";

window.selectedTime = "";




// =================================
// SELECCIONAR HORARIO
// =================================


const timeButtons =
document.querySelectorAll(
"#timeGrid button"
);



timeButtons.forEach(button=>{


button.addEventListener(
"click",
()=>{


timeButtons.forEach(btn=>{

btn.classList.remove(
"selected"
);

});



button.classList.add(
"selected"
);



window.selectedTime =
button.dataset.time;



console.log(
"Hora seleccionada:",
window.selectedTime
);



});


});

// =================================
// FECHA DEL CALENDARIO
// =================================


// aquí conectaremos tu calendario actual
// cuando me pases esa función



// =================================
// FORMULARIO
// =================================


const appointmentForm =
document.getElementById(
"appointmentForm"
);



appointmentForm?.addEventListener(
"submit",
async(e)=>{


e.preventDefault();





if(!window.selectedDate){


alert(
"Selecciona una fecha"
);


return;


}




if(!window.selectedTime){


alert(
"Selecciona un horario"
);


return;


}




const appointment = {


firstName:
document.getElementById(
"firstName"
).value,



lastName:
document.getElementById(
"lastName"
).value,



whatsapp:
document.getElementById(
"whatsapp"
).value,



service:
document.getElementById(
"formService"
).value,




date:
window.selectedDate,



time:
window.selectedTime,



notes:
document.getElementById(
"notes"
).value,



status:
"pending",


createdAt:
new Date()


};




try{


await addDoc(

collection(
db,
"appointments"
),

appointment

);



alert(
"Tu cita fue enviada correctamente 💜"
);



appointmentForm.reset();



window.selectedTime="";

window.selectedDate="";



}


catch(error){


console.error(
error
);


alert(
"Ocurrió un error al reservar"
);



}



});