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
  const planetButton = document.getElementById("cookie-planet");
  const closeButton = document.getElementById("cookie-close");

  const acceptButton = document.getElementById("cookie-accept");
  const rejectButton = document.getElementById("cookie-reject");
  const saveButton = document.getElementById("cookie-save");

  const analyticsToggle = document.getElementById("cookie-analytics");
  const marketingToggle = document.getElementById("cookie-marketing");

  if (!banner || !planetButton) return;

  const STORAGE_KEY = "fronixis-cookie-consent";
  const GA_MEASUREMENT_ID = "G-KSM56XTJBP";
let googleAnalyticsLoaded = false;

const loadGoogleAnalytics = () => {
  if (googleAnalyticsLoaded) return;

  if (document.querySelector('script[data-fronixis-ga]')) {
    googleAnalyticsLoaded = true;
    return;
  }

  window.dataLayer = window.dataLayer || [];

  window.gtag = function () {
    dataLayer.push(arguments);
  };

  gtag("consent", "default", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied"
  });

  gtag("js", new Date());
  gtag("config", GA_MEASUREMENT_ID);

  const script = document.createElement("script");
  script.async = true;
  script.src =
    "https://www.googletagmanager.com/gtag/js?id=" +
    encodeURIComponent(GA_MEASUREMENT_ID);

  script.dataset.fronixisGa = "true";

  document.head.appendChild(script);

  googleAnalyticsLoaded = true;
};

  const openBanner = () => {
    banner.hidden = false;
    document.body.classList.add("cookie-modal-open");
  };

  const closeBanner = () => {
    banner.hidden = true;
    document.body.classList.remove("cookie-modal-open");
  };

  const getSavedConsent = () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY));
    } catch {
      return null;
    }
  };

  const saveConsent = (consent) => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        necessary: true,
        analytics: !!consent.analytics,
        marketing: !!consent.marketing,
        updatedAt: new Date().toISOString()
      })
    );

    window.dispatchEvent(
      new CustomEvent("fronixis-consent-updated", {
        detail: {
          necessary: true,
          analytics: !!consent.analytics,
          marketing: !!consent.marketing,
          affiliate: !!consent.marketing
        }
      })
    );
  };
  if (consent.analytics) {
  loadGoogleAnalytics();
} else if (window.gtag) {
  gtag("consent", "update", {
    analytics_storage: "denied"
  });
}

  const applySavedConsentToToggles = () => {
    const saved = getSavedConsent();

    if (!saved) return false;

    if (analyticsToggle) {
      analyticsToggle.checked = !!saved.analytics;
    }

    if (marketingToggle) {
      marketingToggle.checked = !!saved.marketing;
    }

    return true;
  };

  planetButton.addEventListener("click", () => {
    applySavedConsentToToggles();
    openBanner();
  });

  closeButton?.addEventListener("click", () => {
    closeBanner();
  });

  rejectButton?.addEventListener("click", () => {
    if (analyticsToggle) analyticsToggle.checked = false;
    if (marketingToggle) marketingToggle.checked = false;

    saveConsent({
      analytics: false,
      marketing: false
    });

    closeBanner();
  });

  saveButton?.addEventListener("click", () => {
    saveConsent({
      analytics: analyticsToggle?.checked || false,
      marketing: marketingToggle?.checked || false
    });

    closeBanner();
  });

  acceptButton?.addEventListener("click", () => {
    if (analyticsToggle) analyticsToggle.checked = true;
    if (marketingToggle) marketingToggle.checked = true;

    saveConsent({
      analytics: true,
      marketing: true
    });

    closeBanner();
  });

  banner.addEventListener("click", (event) => {
    if (event.target === banner) {
      closeBanner();
    }
  });

const hasSavedConsent = applySavedConsentToToggles();

const savedConsent = getSavedConsent();

if (savedConsent?.analytics) {
  loadGoogleAnalytics();
}

if (!hasSavedConsent) {
  setTimeout(() => {
    openBanner();
  }, 350);
} else {
  closeBanner();
}
