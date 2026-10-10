// script.js

// ===============================
// MENÚ MÓVIL
// ===============================

const menuButton = document.querySelector(".menu-toggle");
const navPanel = document.querySelector(".nav-panel");
const navLinks = document.querySelectorAll(".nav-links a");

menuButton?.addEventListener("click", () => {
  const isOpen = navPanel?.classList.toggle("open");

  menuButton.classList.toggle("open", Boolean(isOpen));
  menuButton.setAttribute("aria-expanded", String(Boolean(isOpen)));
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    navPanel?.classList.remove("open");
    menuButton?.classList.remove("open");
    menuButton?.setAttribute("aria-expanded", "false");
  });
});

// ===============================
// NAVBAR ACTIVO AL HACER SCROLL
// ===============================

const sections = document.querySelectorAll("main section[id], header[id]");

if (sections.length > 0 && navLinks.length > 0) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const id = entry.target.getAttribute("id");

        navLinks.forEach((link) => {
          link.classList.toggle(
            "active",
            link.getAttribute("href") === `#${id}`
          );
        });
      });
    },
    {
      rootMargin: "-40% 0px -52% 0px",
      threshold: 0
    }
  );

  sections.forEach((section) => sectionObserver.observe(section));
}

// ===============================
// ANIMACIONES REVEAL
// ===============================

const revealElements = document.querySelectorAll(".reveal");

if (revealElements.length > 0) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.16
    }
  );

  revealElements.forEach((element) => revealObserver.observe(element));
}

// ===============================
// CARRUSEL DE OPINIONES
// ===============================

const reviews = [
  {
    name: "Carolina Rojas",
    avatar: "https://api.dicebear.com/8.x/adventurer/svg?seed=Carolina",
    text: "La mejor experiencia que he tenido. El servicio es excepcional y el ambiente es relajante."
  },
  {
    name: "Daniela M.",
    avatar: "https://api.dicebear.com/8.x/adventurer/svg?seed=Daniela",
    text: "Me encantó el tratamiento facial, mi piel nunca había estado tan luminosa."
  },
  {
    name: "Valentina P.",
    avatar: "https://api.dicebear.com/8.x/adventurer/svg?seed=Valentina",
    text: "Profesionales increíbles, siempre salgo feliz con los resultados."
  }
];

let reviewIndex = 0;

const reviewAvatar = document.getElementById("reviewAvatar");
const reviewText = document.getElementById("reviewText");
const reviewName = document.getElementById("reviewName");
const prevReview = document.getElementById("prevReview");
const nextReview = document.getElementById("nextReview");

function renderReview() {
  if (!reviewAvatar || !reviewText || !reviewName) return;

  const review = reviews[reviewIndex];

  reviewAvatar.src = review.avatar;
  reviewAvatar.alt = `Foto de ${review.name}`;
  reviewText.textContent = review.text;
  reviewName.textContent = review.name;
}

prevReview?.addEventListener("click", () => {
  reviewIndex = (reviewIndex - 1 + reviews.length) % reviews.length;
  renderReview();
});

nextReview?.addEventListener("click", () => {
  reviewIndex = (reviewIndex + 1) % reviews.length;
  renderReview();
});

if (reviewAvatar && reviewText && reviewName) {
  renderReview();

  setInterval(() => {
    reviewIndex = (reviewIndex + 1) % reviews.length;
    renderReview();
  }, 5200);
}

