// firebase-booking.js

import { firebaseConfig, BUSINESS_WHATSAPP } from "./firebase-config.js";

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";

import {
  getFirestore,
  collection,
  doc,
  query,
  where,
  getDocs,
  runTransaction,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const TIMES = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM"
];

const CLOSED_TIMES = new Set(["12:00 PM", "05:00 PM"]);

const SERVICE_NAMES = {
  massages: "Masajes relajantes",
  facial: "Limpieza facial",
  nails: "Uñas",
  lashes: "Pestañas",
  hair: "Cabello"
};

const els = {
  serviceSelect: document.getElementById("serviceSelect"),
  formService: document.getElementById("formService"),
  prevMonth: document.getElementById("prevMonth"),
  nextMonth: document.getElementById("nextMonth"),
  monthLabel: document.getElementById("monthLabel"),
  calendarGrid: document.getElementById("calendarGrid"),
  timeGrid: document.getElementById("timeGrid"),
  form: document.getElementById("appointmentForm"),
  firstName: document.getElementById("firstName"),
  lastName: document.getElementById("lastName"),
  whatsapp: document.getElementById("whatsapp"),
  notes: document.getElementById("notes"),
  bookingSummary: document.getElementById("bookingSummary")
};

let viewDate = new Date();
viewDate.setDate(1);

let selectedDate = "";
let selectedTime = "";
let bookedTimes = new Set();

initBooking();

function initBooking() {
  if (!els.form || !els.calendarGrid || !els.timeGrid) {
    console.warn("No se encontró la sección de agenda en el HTML.");
    return;
  }

  resetInitialState();
  bindEvents();
  renderCalendar();
  renderTimes();
  updateSummary();
}

function resetInitialState() {
  selectedDate = "";
  selectedTime = "";
  bookedTimes = new Set();

  if (els.serviceSelect) els.serviceSelect.value = "";
  if (els.formService) els.formService.value = "";
}

function bindEvents() {
  els.prevMonth.addEventListener("click", () => {
    viewDate.setMonth(viewDate.getMonth() - 1);
    renderCalendar();
  });

  els.nextMonth.addEventListener("click", () => {
    viewDate.setMonth(viewDate.getMonth() + 1);
    renderCalendar();
  });

  els.serviceSelect.addEventListener("change", async () => {
    els.formService.value = els.serviceSelect.value;
    selectedTime = "";
    bookedTimes = new Set();

    if (selectedDate && getSelectedServiceCode()) {
      await loadBookedTimes();
    }

    renderTimes();
    updateSummary();
  });

  els.formService.addEventListener("change", async () => {
    els.serviceSelect.value = els.formService.value;
    selectedTime = "";
    bookedTimes = new Set();

    if (selectedDate && getSelectedServiceCode()) {
      await loadBookedTimes();
    }

    renderTimes();
    updateSummary();
  });

  els.timeGrid.addEventListener("click", (event) => {
    const button = event.target.closest("button");

    if (!button || button.disabled) return;

    selectedTime = button.dataset.time;
    renderTimes();
    updateSummary();
  });

  els.form.addEventListener("submit", handleSubmit);
}

function getSelectedServiceCode() {
  return els.formService.value || els.serviceSelect.value || "";
}

function getSelectedServiceName() {
  const code = getSelectedServiceCode();
  return SERVICE_NAMES[code] || "";
}

function renderCalendar() {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthText = new Intl.DateTimeFormat("es-CO", {
    month: "long",
    year: "numeric"
  }).format(viewDate);

  els.monthLabel.textContent = capitalize(monthText);
  els.calendarGrid.innerHTML = "";

  const firstDay = new Date(year, month, 1).getDay();
  const blankDays = (firstDay + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < blankDays; i++) {
    const empty = document.createElement("span");
    empty.className = "calendar-empty";
    els.calendarGrid.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateObj = new Date(year, month, day);
    const isoDate = toISODate(dateObj);

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = day;
    button.className = "calendar-day";

    if (isPastDate(dateObj)) {
      button.disabled = true;
      button.classList.add("is-disabled");
    }

    if (isoDate === selectedDate) {
      button.classList.add("is-selected");
    }

    button.addEventListener("click", async () => {
      selectedDate = isoDate;
      selectedTime = "";
      bookedTimes = new Set();

      renderCalendar();

      if (!getSelectedServiceCode()) {
        renderTimes();
        updateSummary();
        return;
      }

      setSummary("Cargando horarios disponibles...", "loading");

      await loadBookedTimes();

      renderTimes();
      updateSummary();
    });

    els.calendarGrid.appendChild(button);
  }
}

function renderTimes() {
  els.timeGrid.innerHTML = "";

  const serviceCode = getSelectedServiceCode();

  if (!serviceCode || !selectedDate) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "empty-times-message";
    emptyMessage.textContent = "Selecciona un servicio y una fecha para ver los horarios disponibles.";
    els.timeGrid.appendChild(emptyMessage);
    return;
  }

  TIMES.forEach((time) => {
    const isClosed = CLOSED_TIMES.has(time);
    const isBooked = bookedTimes.has(time);

    const button = document.createElement("button");
    button.type = "button";
    button.dataset.time = time;
    button.textContent = time;

    if (selectedTime === time) {
      button.classList.add("selected");
    }

    if (isBooked) {
      button.classList.add("occupied");
      button.textContent = `${time} Ocupado`;
      button.title = "Horario ocupado";
      button.disabled = true;
    }

    if (isClosed) {
      button.classList.add("disabled-time");
      button.title = "Horario no disponible";
      button.disabled = true;
    }

    els.timeGrid.appendChild(button);
  });
}

async function loadBookedTimes() {
  bookedTimes = new Set();

  const serviceCode = getSelectedServiceCode();

  if (!selectedDate || !serviceCode) return;

  try {
    const slotsRef = collection(db, "bookedSlots");

    const q = query(
      slotsRef,
      where("date", "==", selectedDate),
      where("serviceCode", "==", serviceCode)
    );

    const snapshot = await getDocs(q);

    snapshot.forEach((docSnap) => {
      const slot = docSnap.data();
      bookedTimes.add(slot.time);
    });

    console.log("Horarios ocupados cargados:", Array.from(bookedTimes));
  } catch (error) {
    console.error("Error cargando horarios ocupados:", error);
    setSummary("No se pudieron cargar los horarios ocupados. Revisa Firebase.", "error");
  }
}

async function handleSubmit(event) {
  event.preventDefault();

  const submitButton = els.form.querySelector('button[type="submit"]');

  const firstName = els.firstName.value.trim();
  const lastName = els.lastName.value.trim();
  const whatsapp = els.whatsapp.value.trim();
  const serviceCode = getSelectedServiceCode();
  const service = getSelectedServiceName();
  const notes = els.notes.value.trim();

  if (!serviceCode) {
    setSummary("Selecciona un servicio antes de confirmar.", "error");
    return;
  }

  if (!selectedDate || !selectedTime) {
    setSummary("Selecciona una fecha y un horario antes de confirmar.", "error");
    return;
  }

  if (!firstName || !lastName || !whatsapp) {
    setSummary("Completa nombre, apellido y WhatsApp.", "error");
    return;
  }

  const slotId = createSlotId({
    date: selectedDate,
    serviceCode,
    time: selectedTime
  });

  try {
    submitButton.disabled = true;
    submitButton.innerHTML = 'Registrando cita <span aria-hidden="true">...</span>';

    setSummary("Registrando tu cita...", "loading");

    const result = await saveAppointmentWithSlot({
      slotId,
      firstName,
      lastName,
      whatsapp,
      service,
      serviceCode,
      date: selectedDate,
      time: selectedTime,
      notes
    });

    const appointmentForWhatsApp = {
      appointmentId: result.appointmentId,
      slotId,
      fullName: `${firstName} ${lastName}`,
      firstName,
      lastName,
      whatsapp,
      service,
      serviceCode,
      date: selectedDate,
      readableDate: formatReadableDate(selectedDate),
      time: selectedTime,
      notes,
      source: "Anny Beauty Studio Website",
      createdAt: new Date().toISOString()
    };

    openBusinessWhatsApp(appointmentForWhatsApp);

    selectedTime = "";

    await loadBookedTimes();
    renderTimes();

    setSummary(
      `Cita registrada correctamente para ${formatReadableDate(selectedDate)}. El horario ya quedó bloqueado.`,
      "success"
    );

    els.form.reset();
    els.serviceSelect.value = "";
    els.formService.value = "";
    selectedDate = "";
    selectedTime = "";
    bookedTimes = new Set();

    renderCalendar();
    renderTimes();
  } catch (error) {
    console.error("Error registrando la cita:", error);

    if (error.message === "slot-taken") {
      setSummary("Ese horario acaba de ser reservado. Elige otro horario.", "error");
      await loadBookedTimes();
      renderTimes();
    } else {
      setSummary("No se pudo registrar la cita. Revisa la consola del navegador.", "error");
    }
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = 'Confirmar cita <span aria-hidden="true">✓</span>';
  }
}

async function saveAppointmentWithSlot(data) {
  let appointmentId = "";

  await runTransaction(db, async (transaction) => {
    const slotRef = doc(db, "bookedSlots", data.slotId);
    const slotSnap = await transaction.get(slotRef);

    if (slotSnap.exists()) {
      throw new Error("slot-taken");
    }

    const appointmentRef = doc(collection(db, "appointments"));
    appointmentId = appointmentRef.id;

    transaction.set(slotRef, {
      date: data.date,
      time: data.time,
      service: data.service,
      serviceCode: data.serviceCode,
      appointmentId,
      createdAt: serverTimestamp()
    });

    transaction.set(appointmentRef, {
      appointmentId,
      slotId: data.slotId,
      firstName: data.firstName,
      lastName: data.lastName,
      fullName: `${data.firstName} ${data.lastName}`,
      whatsapp: data.whatsapp,
      service: data.service,
      serviceCode: data.serviceCode,
      date: data.date,
      time: data.time,
      notes: data.notes,
      status: "pending",
      source: "web",
      createdAt: serverTimestamp()
    });
  });

  return { appointmentId };
}

function openBusinessWhatsApp(appointment) {
  if (!BUSINESS_WHATSAPP) return;

  const message = `
Hola, quiero confirmar mi cita en Anny Beauty Studio 💜

Nombre: ${appointment.fullName}
WhatsApp: ${appointment.whatsapp}
Servicio: ${appointment.service}
Fecha: ${appointment.readableDate}
Hora: ${appointment.time}
Observaciones: ${appointment.notes || "Sin observaciones"}

Mi cita quedó registrada desde la página web.
`;

  const encodedMessage = encodeURIComponent(message.trim());
  const whatsappUrl = `https://wa.me/${BUSINESS_WHATSAPP}?text=${encodedMessage}`;

  window.open(whatsappUrl, "_blank");
}

function updateSummary() {
  const service = getSelectedServiceName();

  if (!service && !selectedDate && !selectedTime) {
    setSummary("Selecciona un servicio, una fecha y un horario para continuar.");
    return;
  }

  if (!service) {
    setSummary("Primero selecciona un servicio para continuar.");
    return;
  }

  if (!selectedDate) {
    setSummary(`Servicio: ${service}. Ahora selecciona una fecha.`);
    return;
  }

  if (!selectedTime) {
    setSummary(
      `Servicio: ${service}. Fecha: ${formatReadableDate(selectedDate)}. Ahora elige un horario.`
    );
    return;
  }

  setSummary(`Cita: ${service}, ${formatReadableDate(selectedDate)} a las ${selectedTime}.`);
}

function setSummary(message, type = "") {
  els.bookingSummary.textContent = message;

  els.bookingSummary.classList.remove(
    "form-note-success",
    "form-note-error",
    "form-note-loading"
  );

  if (type === "success") {
    els.bookingSummary.classList.add("form-note-success");
  }

  if (type === "error") {
    els.bookingSummary.classList.add("form-note-error");
  }

  if (type === "loading") {
    els.bookingSummary.classList.add("form-note-loading");
  }
}

function createSlotId({ date, serviceCode, time }) {
  const cleanTime = time
    .toLowerCase()
    .replaceAll(":", "")
    .replaceAll(" ", "");

  return `${date}_${serviceCode}_${cleanTime}`;
}

function toISODate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isPastDate(date) {
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const cleanDate = new Date(date);
  cleanDate.setHours(0, 0, 0, 0);

  return cleanDate < today;
}

function formatReadableDate(isoDate) {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return new Intl.DateTimeFormat("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}