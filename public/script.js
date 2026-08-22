document.addEventListener("DOMContentLoaded", () => {
  /* =========================================================
     NEWSLETTER
  ========================================================= */

  const newsletterForm = document.querySelector(".newsletter-form");

  if (newsletterForm) {
    newsletterForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const emailInput = newsletterForm.querySelector('input[type="email"]');
      const email = emailInput?.value.trim() || "";

      if (!email) {
        alert("Bitte gib zuerst deine E-Mail-Adresse ein.");
        return;
      }

      alert(
        "Danke! Der Newsletter wird später mit einem echten E-Mail-Dienst verbunden."
      );

      emailInput.value = "";
    });
  }


  /* =========================================================
     INTERNE LINKS / SMOOTH SCROLL
  ========================================================= */

  const internalLinks = document.querySelectorAll('a[href^="#"]');

  internalLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");

      if (!targetId || targetId === "#") {
        event.preventDefault();
        return;
      }

      const elementId = targetId.slice(1);
      const target = document.getElementById(elementId);

      if (!target) return;

      event.preventDefault();

      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  });


  /* =========================================================
     COOKIE CONSENT
  ========================================================= */

  const banner = document.getElementById("cookie-banner");
  const planetButton = document.getElementById("cookie-planet");
  const closeButton = document.getElementById("cookie-close");

  const acceptButton = document.getElementById("cookie-accept");
  const rejectButton = document.getElementById("cookie-reject");
  const saveButton = document.getElementById("cookie-save");

  const analyticsToggle = document.getElementById("cookie-analytics");
  const marketingToggle = document.getElementById("cookie-marketing");

  if (!banner || !planetButton) return;


  /* =========================================================
     EINSTELLUNGEN
  ========================================================= */

  const STORAGE_KEY = "fronixis-cookie-consent";
  const GA_MEASUREMENT_ID = "G-KSM56XTJBP";

  let googleAnalyticsLoaded = false;


  /* =========================================================
     GOOGLE ANALYTICS
     Wird ausschließlich nach Analyse-Einwilligung geladen.
  ========================================================= */

  const loadGoogleAnalytics = () => {
    if (googleAnalyticsLoaded) return;

    if (document.querySelector("script[data-fronixis-ga]")) {
      googleAnalyticsLoaded = true;
      return;
    }

    // GA wieder aktivieren, falls zuvor widerrufen
    window[`ga-disable-${GA_MEASUREMENT_ID}`] = false;

    window.dataLayer = window.dataLayer || [];

    window.gtag = function () {
      window.dataLayer.push(arguments);
    };

    window.gtag("consent", "default", {
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied"
    });

    window.gtag("js", new Date());

    window.gtag("config", GA_MEASUREMENT_ID, {
      anonymize_ip: true
    });

    const script = document.createElement("script");

    script.async = true;

    script.src =
      "https://www.googletagmanager.com/gtag/js?id=" +
      encodeURIComponent(GA_MEASUREMENT_ID);

    script.dataset.fronixisGa = "true";

    script.addEventListener("load", () => {
      googleAnalyticsLoaded = true;
    });

    script.addEventListener("error", () => {
      console.error("Google Analytics konnte nicht geladen werden.");
      googleAnalyticsLoaded = false;
    });

    document.head.appendChild(script);
  };


  const disableGoogleAnalytics = () => {
    window[`ga-disable-${GA_MEASUREMENT_ID}`] = true;

    if (typeof window.gtag === "function") {
      window.gtag("consent", "update", {
        analytics_storage: "denied"
      });
    }
  };


  /* =========================================================
     COOKIE MODAL
  ========================================================= */

  const openBanner = () => {
    banner.hidden = false;
    document.body.classList.add("cookie-modal-open");
  };

  const closeBanner = () => {
    banner.hidden = true;
    document.body.classList.remove("cookie-modal-open");
  };


  /* =========================================================
     CONSENT LESEN
  ========================================================= */

  const getSavedConsent = () => {
    try {
      const rawConsent = localStorage.getItem(STORAGE_KEY);

      if (!rawConsent) return null;

      const saved = JSON.parse(rawConsent);

      if (
        !saved ||
        typeof saved !== "object" ||
        Array.isArray(saved)
      ) {
        return null;
      }

      return {
        necessary: true,
        analytics: saved.analytics === true,
        marketing: saved.marketing === true,
        updatedAt: saved.updatedAt || null
      };
    } catch {
      return null;
    }
  };


  /* =========================================================
     CONSENT SPEICHERN
  ========================================================= */

  const saveConsent = (consent) => {
    const normalizedConsent = {
      necessary: true,
      analytics: consent.analytics === true,
      marketing: consent.marketing === true,
      updatedAt: new Date().toISOString()
    };

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(normalizedConsent)
      );
    } catch (error) {
      console.error(
        "Cookie-Einstellungen konnten nicht gespeichert werden.",
        error
      );
    }

    window.dispatchEvent(
      new CustomEvent("fronixis-consent-updated", {
        detail: {
          necessary: true,
          analytics: normalizedConsent.analytics,
          marketing: normalizedConsent.marketing,
          affiliate: normalizedConsent.marketing
        }
      })
    );

    if (normalizedConsent.analytics) {
      loadGoogleAnalytics();
    } else {
      disableGoogleAnalytics();
    }
  };


  /* =========================================================
     GESPEICHERTE EINSTELLUNGEN AUF SCHALTER ÜBERTRAGEN
  ========================================================= */

  const applySavedConsentToToggles = () => {
    const saved = getSavedConsent();

    if (!saved) return false;

    if (analyticsToggle) {
      analyticsToggle.checked = saved.analytics;
    }

    if (marketingToggle) {
      marketingToggle.checked = saved.marketing;
    }

    return true;
  };


  /* =========================================================
     PLANET
  ========================================================= */

  planetButton.addEventListener("click", () => {
    applySavedConsentToToggles();
    openBanner();
  });


  /* =========================================================
     SCHLIESSEN
  ========================================================= */

  closeButton?.addEventListener("click", () => {
    closeBanner();
  });

  banner.addEventListener("click", (event) => {
    if (event.target === banner) {
      closeBanner();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !banner.hidden) {
      closeBanner();
    }
  });


  /* =========================================================
     NUR NOTWENDIGE
  ========================================================= */

  rejectButton?.addEventListener("click", () => {
    if (analyticsToggle) {
      analyticsToggle.checked = false;
    }

    if (marketingToggle) {
      marketingToggle.checked = false;
    }

    saveConsent({
      analytics: false,
      marketing: false
    });

    closeBanner();
  });


  /* =========================================================
     AUSWAHL SPEICHERN
  ========================================================= */

  saveButton?.addEventListener("click", () => {
    saveConsent({
      analytics: analyticsToggle?.checked === true,
      marketing: marketingToggle?.checked === true
    });

    closeBanner();
  });


  /* =========================================================
     ALLE AKZEPTIEREN
  ========================================================= */

  acceptButton?.addEventListener("click", () => {
    if (analyticsToggle) {
      analyticsToggle.checked = true;
    }

    if (marketingToggle) {
      marketingToggle.checked = true;
    }

    saveConsent({
      analytics: true,
      marketing: true
    });

    closeBanner();
  });


  /* =========================================================
     STARTZUSTAND
  ========================================================= */

  // Standardmäßig Analytics deaktivieren.
  window[`ga-disable-${GA_MEASUREMENT_ID}`] = true;

  const hasSavedConsent = applySavedConsentToToggles();
  const savedConsent = getSavedConsent();

  if (savedConsent?.analytics === true) {
    loadGoogleAnalytics();
  } else {
    disableGoogleAnalytics();
  }

  if (!hasSavedConsent) {
    setTimeout(() => {
      openBanner();
    }, 350);
  } else {
    closeBanner();
  }
});
