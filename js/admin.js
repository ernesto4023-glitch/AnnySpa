import { db } from "./firebase-config.js";


import {

    collection,
    getDocs,
    doc,
    updateDoc,
    setDoc,
    getDoc

}

    from

    "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

let currentFilter = "all";


// =================================
// NAVEGACION
// =================================


const menuButtons =
    document.querySelectorAll(
        "aside button"
    );



const views =
    document.querySelectorAll(
        ".view"
    );



menuButtons.forEach(button => {


    button.addEventListener(
        "click",
        () => {


            views.forEach(view => {

                view.classList.remove("active");

            });



            const target =
                document.getElementById(
                    button.dataset.view
                );



            target.classList.add("active");



        });


});





// =================================
// DASHBOARD + CITAS
// =================================


async function loadAppointments() {


    const snapshot =
        await getDocs(
            collection(db, "appointments")
        );


    let total = 0;
    let pending = 0;
    let cancelled = 0;
    let confirmed = 0;
    let today = 0;


    const table =
        document.getElementById(
            "appointmentsList"
        );



    table.innerHTML = "";



    snapshot.forEach(item => {


        const data = item.data();



        total++;


        if (data.status === "confirmed") {
            confirmed++;
        }



        if (data.status === "pending") {
            pending++;
        }



        if (data.status === "cancelled") {
            cancelled++;
        }



        const todayDate =
            new Date()
                .toISOString()
                .split("T")[0];



        if (data.date === todayDate) {
            today++;
        }

        if (
            currentFilter !== "all" &&
            data.status !== currentFilter
        ) {

            return;

        }


        const phone =
            data.whatsapp || "";



        const message =
            encodeURIComponent(
                `Hola ${data.firstName}, te escribimos de Anny Beauty Studio.

Tu cita:

Servicio: ${data.service}

Fecha: ${data.date}

Hora: ${data.time}

Estado: ${data.status}
`
            );




        table.innerHTML += `


<tr>


<td>

${data.firstName || ""}
${data.lastName || ""}

</td>



<td>

${phone}

</td>



<td>

${data.service}

</td>



<td>

${data.date}

</td>



<td>

${data.time}

</td>



<td>


<select 
onchange="changeStatus('${item.id}',this.value,'${phone}','${data.firstName}')">


<option value="pending"
${data.status === "pending" ? "selected" : ""}>

Pendiente

</option>


<option value="confirmed"
${data.status === "confirmed" ? "selected" : ""}>

Confirmada

</option>


<option value="cancelled"
${data.status === "cancelled" ? "selected" : ""}>

Cancelada

</option>



</select>


</td>



<td>


<a 
class="whatsapp-btn"
target="_blank"
href="https://wa.me/57${phone}?text=${message}">

WhatsApp

</a>


</td>



</tr>


`;



    });

    document
        .getElementById("confirmedAppointments")
        .textContent = confirmed;


    document
        .getElementById("todayAppointments")
        .textContent = today;


    document
        .getElementById("totalAppointments")
        .textContent = total;


    document
        .getElementById("pendingAppointments")
        .textContent = pending;


    document
        .getElementById("cancelAppointments")
        .textContent = cancelled;

}


window.changeStatus = async (
    id,
    status,
    phone,
    name
) => {


    await updateDoc(

        doc(
            db,
            "appointments",
            id
        ),

        {
            status
        }

    );



    let message = "";



    if (status === "confirmed") {


        message =
            `Hola ${name} 💜

Tu cita en Anny Beauty Studio ha sido CONFIRMADA.

Te esperamos:
Gracias por elegirnos ✨`;


    }



    if (status === "cancelled") {


        message =
            `Hola ${name}.

Tu cita en Anny Beauty Studio ha sido CANCELADA.

Si deseas reagendar puedes escribirnos.`;



    }



    if (status !== "pending") {


        window.open(

            "https://wa.me/57" +
            phone +
            "?text=" +
            encodeURIComponent(message),

            "_blank"

        );


    }





    loadAppointments();


};





// =================================
// HORARIOS DINAMICOS
// =================================


let schedule = {};



function generateHours(start, end, interval) {


    let result = [];



    let current =
        new Date(
            `2000-01-01T${start}`
        );



    let finish =
        new Date(
            `2000-01-01T${end}`
        );



    while (current < finish) {


        let hours =
            current.getHours()
                .toString()
                .padStart(2, "0");


        let minutes =
            current.getMinutes()
                .toString()
                .padStart(2, "0");



        let hour24 =
            `${hours}:${minutes}`;



        let display =
            formatHour(hour24);



        result.push(display);



        current.setMinutes(
            current.getMinutes() + interval
        );



    }



    return result;


}





function formatHour(time) {


    let [hour, minute] =
        time.split(":");



    let h =
        parseInt(hour);



    let ampm =
        h >= 12
            ?
            "PM"
            :
            "AM";



    h =
        h % 12 || 12;



    return `${h}:${minute} ${ampm}`;


}





async function generateSchedule() {



    const interval =
        Number(
            document.getElementById(
                "interval"
            ).value
        );



    const morning =
        generateHours(

            morningStart.value,

            morningEnd.value,

            interval

        );



    const afternoon =
        generateHours(

            afternoonStart.value,

            afternoonEnd.value,

            interval

        );



    schedule = {};



    [
        ...morning,
        ...afternoon
    ]
        .forEach(hour => {


            schedule[hour] = true;


        });



    await setDoc(

        doc(
            db,
            "settings",
            "schedule"
        ),

        {

            schedule,

            config: {

                interval,

                morningStart:
                    morningStart.value,

                morningEnd:
                    morningEnd.value,

                afternoonStart:
                    afternoonStart.value,

                afternoonEnd:
                    afternoonEnd.value

            }

        }

    );



    renderSchedule();


}







async function loadSchedule() {



    const reference =
        doc(
            db,
            "settings",
            "schedule"
        );



    const snapshot =
        await getDoc(reference);



    if (snapshot.exists()) {


        const data =
            snapshot.data();



        schedule =
            data.schedule || {};



    }



    renderSchedule();



}





async function toggleHour(hour) {



    schedule[hour] =
        !schedule[hour];



    await setDoc(

        doc(
            db,
            "settings",
            "schedule"
        ),

        {

            schedule

        },

        {
            merge: true
        }

    );



    renderSchedule();


}






function renderSchedule() {



    const morning =
        document.getElementById(
            "morning"
        );



    const afternoon =
        document.getElementById(
            "afternoon"
        );



    if (!morning || !afternoon)
        return;



    morning.innerHTML = "";

    afternoon.innerHTML = "";



    Object.keys(schedule)
        .forEach(hour => {


            const button =
                document.createElement(
                    "button"
                );



            button.textContent =
                hour +
                (
                    schedule[hour]
                        ?
                        " 🟢"
                        :
                        " 🔴"
                );



            button.className =
                schedule[hour]
                    ?
                    "green"
                    :
                    "red";



            button.onclick =
                () => toggleHour(hour);



            if (
                hour.includes("AM")
            ) {

                morning.appendChild(button);

            }

            else {

                afternoon.appendChild(button);

            }



        });



}






document
    .getElementById(
        "generateSchedule"
    )
    ?.addEventListener(
        "click",
        generateSchedule
    );


document
    .querySelectorAll(".filters button")
    .forEach(button => {


        button.onclick = () => {


            currentFilter =
                button.dataset.filter;


            loadAppointments();


        };


    });


// ===============================
// MODAL HORARIOS
// ===============================


const scheduleModal =
    document.getElementById(
        "scheduleModal"
    );



document
    .getElementById(
        "openScheduleModal"
    )
    .onclick = () => {


        scheduleModal.classList.add(
            "active"
        );


    };



document
    .getElementById(
        "closeScheduleModal"
    )
    .onclick = () => {


        scheduleModal.classList.remove(
            "active"
        );


    };



scheduleModal.onclick = (e) => {


    if (e.target === scheduleModal) {

        scheduleModal.classList.remove(
            "active"
        );

    }


};


// =================================
// INICIO
// =================================


loadAppointments();

loadSchedule();