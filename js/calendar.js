// =================================
// CALENDARIO DE RESERVAS
// =================================


const calendarGrid =
document.getElementById(
    "calendarGrid"
);


const monthLabel =
document.getElementById(
    "monthLabel"
);


const prevMonth =
document.getElementById(
    "prevMonth"
);


const nextMonth =
document.getElementById(
    "nextMonth"
);



// =================================
// VARIABLES
// =================================


let currentDate =
new Date();



window.selectedDate = "";



// =================================
// RENDER CALENDARIO
// =================================


function renderCalendar(){


if(!calendarGrid)
return;



calendarGrid.innerHTML = "";



const year =
currentDate.getFullYear();



const month =
currentDate.getMonth();




// nombre del mes

monthLabel.textContent =
currentDate.toLocaleDateString(
    "es-ES",
    {
        month:"long",
        year:"numeric"
    }
);




// primer día del mes

const firstDay =
new Date(
    year,
    month,
    1
)
.getDay();




// cantidad de días

const totalDays =
new Date(
    year,
    month + 1,
    0
)
.getDate();




// ajustar para iniciar lunes

const startDay =
firstDay === 0
?
6
:
firstDay - 1;




// =================================
// ESPACIOS VACÍOS
// =================================


for(
let i = 0;
i < startDay;
i++
){


const empty =
document.createElement(
"span"
);


calendarGrid.appendChild(
empty
);


}





// =================================
// CREAR DÍAS
// =================================


for(
let day = 1;
day <= totalDays;
day++
){



const button =
document.createElement(
"button"
);



button.type =
"button";



button.textContent =
day;



button.className =
"calendar-day";





const currentDay =
new Date(
    year,
    month,
    day
);



const today =
new Date();


today.setHours(
    0,
    0,
    0,
    0
);





// =================================
// BLOQUEAR FECHAS PASADAS
// =================================


if(currentDay < today){


button.disabled =
true;



button.classList.add(
"disabled"
);



}

else{



button.onclick = ()=>{


// quitar selección anterior

document
.querySelectorAll(
".calendar-day"
)
.forEach(btn=>{


btn.classList.remove(
"selected"
);


});




// marcar seleccionado

button.classList.add(
"selected"
);





// crear fecha correcta

const y =
currentDay.getFullYear();



const m =
String(
currentDay.getMonth()+1
)
.padStart(
2,
"0"
);



const d =
String(
currentDay.getDate()
)
.padStart(
2,
"0"
);




// enviar a booking.js

window.selectedDate =
`${y}-${m}-${d}`;



console.log(
"Fecha seleccionada:",
window.selectedDate
);



};



}




calendarGrid.appendChild(
button
);



}



}



// =================================
// CAMBIAR MES
// =================================


prevMonth?.addEventListener(
"click",
()=>{


currentDate.setMonth(
currentDate.getMonth()-1
);



renderCalendar();



});





nextMonth?.addEventListener(
"click",
()=>{


currentDate.setMonth(
currentDate.getMonth()+1
);



renderCalendar();



});





// =================================
// INICIALIZAR
// =================================


renderCalendar();