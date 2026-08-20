document.addEventListener("DOMContentLoaded", () => {
  const newsletterForm = document.querySelector(".newsletter-form");

  if (newsletterForm) {
    newsletterForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const emailInput = newsletterForm.querySelector('input[type="email"]');
      const email = emailInput ? emailInput.value.trim() : "";

      if (!email) {
        alert("Bitte gib zuerst deine E-Mail-Adresse ein.");
        return;
      }

      alert("Danke! Der Newsletter wird später mit einem echten E-Mail-Dienst verbunden.");

      if (emailInput) {
        emailInput.value = "";
      }
    });
  }

  const internalLinks = document.querySelectorAll('a[href^="#"]');

  internalLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");

      if (!targetId || targetId === "#") {
        event.preventDefault();
        return;
      }

      const target = document.querySelector(targetId);

      if (target) {
        event.preventDefault();

        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    });
  });
});

// COOKIE CONSENT

document.addEventListener("DOMContentLoaded", () => {
  const banner = document.getElementById("cookie-banner");
  const acceptButton = document.getElementById("cookie-accept");
  const rejectButton = document.getElementById("cookie-reject");
  const settingsButton = document.getElementById("cookie-settings");

  if (!banner) return;

  const savedConsent = localStorage.getItem("fronixis-cookie-consent");

  if (savedConsent) {
    banner.hidden = true;
  } else {
    banner.hidden = false;
  }

  acceptButton?.addEventListener("click", () => {
    localStorage.setItem("fronixis-cookie-consent", "all");
    banner.hidden = true;

    window.dispatchEvent(
      new CustomEvent("fronixis-consent-updated", {
        detail: { analytics: true, marketing: true, affiliate: true }
      })
    );
  });

  rejectButton?.addEventListener("click", () => {
    localStorage.setItem("fronixis-cookie-consent", "necessary");
    banner.hidden = true;

    window.dispatchEvent(
      new CustomEvent("fronixis-consent-updated", {
        detail: { analytics: false, marketing: false, affiliate: false }
      })
    );
  });

  settingsButton?.addEventListener("click", () => {
    alert(
      "Individuelle Cookie-Einstellungen ergänzen wir im nächsten Schritt. Bis dahin kannst du entweder nur notwendige Technologien oder alle Technologien auswählen."
    );
  });
});
