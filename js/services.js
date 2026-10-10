const serviceSelect =
document.getElementById("serviceSelect");


const formService =
document.getElementById("formService");


const servicesContainer =
document.getElementById("servicesContainer");



let services = [];




async function loadServices(){


try{


const response =
await fetch("./data/services.json");


services =
await response.json();



renderServices();



fillSelects();



}

catch(error){

console.error(
"Error cargando servicios:",
error
);

}


}





function renderServices(){


if(!servicesContainer)
return;



servicesContainer.innerHTML="";



services.forEach(service=>{


servicesContainer.innerHTML += `

<article class="service-card">


<img 
src="${service.image}"
alt="${service.name}"
>


<h3>
${service.name}
</h3>


<p>
$${service.price.toLocaleString()}
</p>


<button 
type="button"
class="reserve-service"
data-id="${service.id}">

Reservar

</button>


</article>

`;



});



document
.querySelectorAll(".reserve-service")
.forEach(button=>{


button.onclick=()=>{


const id =
button.dataset.id;



selectService(id);



document
.getElementById("agenda")
?.scrollIntoView({
behavior:"smooth"
});



};



});



}





function fillSelects(){


if(!serviceSelect || !formService)
return;



services.forEach(service=>{


const option =
document.createElement("option");


option.value =
service.id;


option.textContent =
`${service.name} - $${service.price.toLocaleString()}`;



serviceSelect.appendChild(option);



const clone =
option.cloneNode(true);


formService.appendChild(clone);



});


}




function selectService(id){


serviceSelect.value=id;


formService.value=id;


}



serviceSelect?.addEventListener(
"change",
()=>{


formService.value =
serviceSelect.value;


});




loadServices();