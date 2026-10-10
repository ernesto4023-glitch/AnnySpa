import {
doc,
getDoc
}
from
"https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";


import {
db
}
from "./firebase-config.js";



const timeGrid =
document.getElementById(
"timeGrid"
);



window.selectedTime = "";



async function loadSchedule(){


if(!timeGrid)
return;



const ref =
doc(
db,
"settings",
"schedule"
);



const snap =
await getDoc(ref);



if(!snap.exists())
return;



const data =
snap.data();



const schedule =
data.schedule;



timeGrid.innerHTML="";



Object.keys(schedule)
.sort()
.forEach(hour=>{


const available =
schedule[hour];



const button =
document.createElement(
"button"
);



button.type="button";

button.textContent =
hour;



if(!available){


button.disabled=true;

button.className="disabled";


}else{


button.className="available";



button.onclick=()=>{


document
.querySelectorAll("#timeGrid button")
.forEach(btn=>{

btn.classList.remove(
"selected"
);

});



button.classList.add(
"selected"
);



window.selectedTime =
hour;


};



}



timeGrid.appendChild(
button
);



});



}



loadSchedule();