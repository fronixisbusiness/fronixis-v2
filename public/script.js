document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  /* =========================================================
     FRONIXIS
     Global JavaScript
     Version: 2026-08
     ========================================================= */


  /* =========================================================
     1. LANGUAGE
     ========================================================= */

  const pageLanguage =
    document.documentElement.lang
      ?.toLowerCase()
      .split("-")[0] || "de";


  const translations = {
    de: {
      newsletterEmpty:
        "Bitte gib zuerst deine E-Mail-Adresse ein.",

      newsletterInvalid:
        "Bitte gib eine gültige E-Mail-Adresse ein.",

      newsletterSuccess:
        "Danke! Der Newsletter wird später mit einem echten E-Mail-Dienst verbunden.",

      analyticsError:
        "Google Analytics konnte nicht geladen werden.",

      storageError:
        "Cookie-Einstellungen konnten nicht gespeichert werden."
    },

    en: {
      newsletterEmpty:
        "Please enter your email address first.",

      newsletterInvalid:
        "Please enter a valid email address.",

      newsletterSuccess:
        "Thank you! The newsletter will be connected to a real email service later.",

      analyticsError:
        "Google Analytics could not be loaded.",

      storageError:
        "Cookie preferences could not be saved."
    },

    fr: {
      newsletterEmpty:
        "Veuillez d’abord saisir votre adresse e-mail.",

      newsletterInvalid:
        "Veuillez saisir une adresse e-mail valide.",

      newsletterSuccess:
        "Merci ! La newsletter sera connectée ultérieurement à un véritable service d’e-mailing.",

      analyticsError:
        "Google Analytics n’a pas pu être chargé.",

      storageError:
        "Les préférences de cookies n’ont pas pu être enregistrées."
    }
  };


  const text =
    translations[pageLanguage] ||
    translations.de;



  /* =========================================================
     2. NEWSLETTER
     ========================================================= */

  const newsletterForms =
    document.querySelectorAll(".newsletter-form");


  newsletterForms.forEach((newsletterForm) => {
    newsletterForm.addEventListener(
      "submit",
      (event) => {
        event.preventDefault();

        const emailInput =
          newsletterForm.querySelector(
            'input[type="email"]'
          );

        if (!emailInput) {
          return;
        }

        const email =
          emailInput.value.trim();

        if (!email) {
          alert(text.newsletterEmpty);

          emailInput.focus();

          return;
        }

        if (!emailInput.checkValidity()) {
          alert(text.newsletterInvalid);

          emailInput.focus();

          return;
        }

        alert(text.newsletterSuccess);

        emailInput.value = "";
      }
    );
  });



  /* =========================================================
     3. INTERNAL LINKS / SMOOTH SCROLL
     ========================================================= */

  const internalLinks =
    document.querySelectorAll('a[href^="#"]');


  internalLinks.forEach((link) => {
    link.addEventListener(
      "click",
      (event) => {
        const targetId =
          link.getAttribute("href");

        /*
         * Placeholder links such as href="#"
         * should not jump to the top.
         */
        if (
          !targetId ||
          targetId === "#"
        ) {
          event.preventDefault();

          return;
        }

        let elementId = "";

        try {
          elementId =
            decodeURIComponent(
              targetId.slice(1)
            );
        } catch {
          elementId =
            targetId.slice(1);
        }

        if (!elementId) {
          return;
        }

        const target =
          document.getElementById(
            elementId
          );

        /*
         * If the target does not exist,
         * use normal browser behaviour.
         */
        if (!target) {
          return;
        }

        event.preventDefault();

        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

        /*
         * Keep the anchor visible in the URL
         * without causing another jump.
         */
        try {
          history.replaceState(
            null,
            "",
            `#${encodeURIComponent(elementId)}`
          );
        } catch {
          // No action required.
        }
      }
    );
  });



  /* =========================================================
     4. COOKIE INTERFACE
     Supports both old and new Fronixis HTML.
     ========================================================= */

  const banner =
    document.querySelector(
      [
        "#cookie-banner",
        "#cookie-modal",
        ".cookie-modal"
      ].join(",")
    );


  const planetButton =
    document.querySelector(
      [
        "#cookie-planet",
        ".cookie-planet"
      ].join(",")
    );


  const openCookieButtons =
    document.querySelectorAll(
      [
        "#cookie-planet",
        ".cookie-planet",
        ".js-cookie-settings",
        "[data-open-cookie-settings]",
        "[data-cookie-settings]"
      ].join(",")
    );


  const closeButton =
    banner?.querySelector(
      [
        "#cookie-close",
        "[data-cookie-close]",
        ".cookie-modal-close"
      ].join(",")
    ) || null;


  const acceptButton =
    banner?.querySelector(
      [
        "#cookie-accept",
        "[data-consent-all]"
      ].join(",")
    ) || null;


  const rejectButton =
    banner?.querySelector(
      [
        "#cookie-reject",
        "[data-consent-necessary]"
      ].join(",")
    ) || null;


  const saveButton =
    banner?.querySelector(
      [
        "#cookie-save",
        "[data-consent-save]"
      ].join(",")
    ) || null;


  const analyticsToggle =
    banner?.querySelector(
      [
        "#cookie-analytics",
        "[data-consent-analytics]"
      ].join(",")
    ) || null;


  const marketingToggle =
    banner?.querySelector(
      [
        "#cookie-marketing",
        "[data-consent-marketing]"
      ].join(",")
    ) || null;


  const backdrop =
    banner?.querySelector(
      ".cookie-modal-backdrop"
    ) || null;


  /*
   * Pages without cookie UI can still use
   * newsletter and smooth-scroll features.
   */
  if (!banner) {
    return;
  }



  /* =========================================================
     5. COOKIE SETTINGS
     ========================================================= */

  const STORAGE_KEY =
    "fronixis-cookie-consent";


  /*
   * Increase this number only when the
   * consent model changes substantially.
   */
  const CONSENT_VERSION = 1;


  const GA_MEASUREMENT_ID =
    "G-KSM56XTJBP";


  let googleAnalyticsLoaded = false;

  let previouslyFocusedElement = null;



  /* =========================================================
     6. SAFE LOCAL STORAGE
     ========================================================= */

  const getStorageItem =
    (key) => {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        console.warn(
          text.storageError,
          error
        );

        return null;
      }
    };


  const setStorageItem =
    (key, value) => {
      try {
        localStorage.setItem(
          key,
          value
        );

        return true;
      } catch (error) {
        console.warn(
          text.storageError,
          error
        );

        return false;
      }
    };



  /* =========================================================
     7. GOOGLE ANALYTICS COOKIE CLEANUP
     ========================================================= */

  const expireCookie =
    (name, domain = "") => {
      const domainPart =
        domain
          ? `; domain=${domain}`
          : "";

      document.cookie =
        `${encodeURIComponent(name)}=` +
        `; Max-Age=0` +
        `; path=/` +
        `; SameSite=Lax` +
        domainPart;
    };


  const deleteAnalyticsCookie =
    (name) => {
      const hostname =
        window.location.hostname;

      expireCookie(name);

      if (!hostname) {
        return;
      }

      expireCookie(
        name,
        hostname
      );

      expireCookie(
        name,
        `.${hostname}`
      );

      /*
       * Also try the registrable Fronixis domain
       * when running on subdomains.
       */
      const hostnameParts =
        hostname.split(".")
          .filter(Boolean);

      if (hostnameParts.length >= 2) {
        const parentDomain =
          hostnameParts
            .slice(-2)
            .join(".");

        expireCookie(
          name,
          parentDomain
        );

        expireCookie(
          name,
          `.${parentDomain}`
        );
      }
    };


  const deleteGoogleAnalyticsCookies =
    () => {
      const cookies =
        document.cookie
          .split(";")
          .map(
            (cookie) =>
              cookie.trim()
          )
          .filter(Boolean);

      cookies.forEach((cookie) => {
        const separatorIndex =
          cookie.indexOf("=");

        const cookieName =
          separatorIndex >= 0
            ? cookie.slice(
                0,
                separatorIndex
              )
            : cookie;

        if (
          cookieName === "_ga" ||
          cookieName.startsWith("_ga_")
        ) {
          deleteAnalyticsCookie(
            cookieName
          );
        }
      });
    };



  /* =========================================================
     8. GOOGLE ANALYTICS
     Loads only after explicit analytics consent.
     ========================================================= */

  const ensureGtag =
    () => {
      window.dataLayer =
        window.dataLayer || [];

      if (
        typeof window.gtag !== "function"
      ) {
        window.gtag =
          function () {
            window.dataLayer.push(
              arguments
            );
          };
      }
    };


  const setGoogleConsent =
    (analyticsGranted) => {
      ensureGtag();

      window.gtag(
        "consent",
        "update",
        {
          analytics_storage:
            analyticsGranted
              ? "granted"
              : "denied",

          ad_storage:
            "denied",

          ad_user_data:
            "denied",

          ad_personalization:
            "denied"
        }
      );
    };


  const loadGoogleAnalytics =
    () => {
      window[
        `ga-disable-${GA_MEASUREMENT_ID}`
      ] = false;

      ensureGtag();

      window.gtag(
        "consent",
        "default",
        {
          analytics_storage:
            "granted",

          ad_storage:
            "denied",

          ad_user_data:
            "denied",

          ad_personalization:
            "denied"
        }
      );

      /*
       * Do not insert the external GA script twice.
       */
      if (
        document.querySelector(
          "script[data-fronixis-ga]"
        )
      ) {
        googleAnalyticsLoaded = true;

        setGoogleConsent(true);

        return;
      }

      window.gtag(
        "js",
        new Date()
      );

      window.gtag(
        "config",
        GA_MEASUREMENT_ID,
        {
          anonymize_ip: true,

          allow_google_signals:
            false,

          allow_ad_personalization_signals:
            false
        }
      );

      const script =
        document.createElement(
          "script"
        );

      script.async = true;

      script.src =
        "https://www.googletagmanager.com/gtag/js?id=" +
        encodeURIComponent(
          GA_MEASUREMENT_ID
        );

      script.dataset.fronixisGa =
        "true";

      script.addEventListener(
        "load",
        () => {
          googleAnalyticsLoaded =
            true;

          setGoogleConsent(true);
        }
      );

      script.addEventListener(
        "error",
        () => {
          console.error(
            text.analyticsError
          );

          googleAnalyticsLoaded =
            false;
        }
      );

      document.head.appendChild(
        script
      );
    };



  /* =========================================================
     9. DISABLE GOOGLE ANALYTICS
     ========================================================= */

  const disableGoogleAnalytics =
    ({
      removeCookies = false
    } = {}) => {
      window[
        `ga-disable-${GA_MEASUREMENT_ID}`
      ] = true;

      if (
        typeof window.gtag === "function"
      ) {
        setGoogleConsent(false);
      }

      if (removeCookies) {
        deleteGoogleAnalyticsCookies();
      }
    };



  /* =========================================================
     10. COOKIE MODAL HELPERS
     ========================================================= */

  const getFocusableElements =
    () => {
      return Array.from(
        banner.querySelectorAll(
          [
            "button:not([disabled])",
            "a[href]",
            "input:not([disabled])",
            "select:not([disabled])",
            "textarea:not([disabled])",
            '[tabindex]:not([tabindex="-1"])'
          ].join(",")
        )
      ).filter(
        (element) => {
          if (
            element.hidden ||
            element.getAttribute(
              "aria-hidden"
            ) === "true"
          ) {
            return false;
          }

          const style =
            window.getComputedStyle(
              element
            );

          return (
            style.display !== "none" &&
            style.visibility !== "hidden"
          );
        }
      );
    };


  const isBannerOpen =
    () => {
      return !banner.hidden;
    };


  const openBanner =
    () => {
      /*
       * Avoid overwriting the original focus
       * when the dialog is already open.
       */
      if (!isBannerOpen()) {
        previouslyFocusedElement =
          document.activeElement;
      }

      banner.hidden = false;

      banner.setAttribute(
        "aria-hidden",
        "false"
      );

      document.body.classList.add(
        "cookie-modal-open"
      );

      document.body.style.overflow =
        "hidden";

      window.requestAnimationFrame(
        () => {
          if (closeButton) {
            closeButton.focus();

            return;
          }

          const focusableElements =
            getFocusableElements();

          focusableElements[0]?.focus();
        }
      );
    };


  const closeBanner =
    () => {
      banner.hidden = true;

      banner.setAttribute(
        "aria-hidden",
        "true"
      );

      document.body.classList.remove(
        "cookie-modal-open"
      );

      document.body.style.overflow =
        "";

      if (
        previouslyFocusedElement instanceof
        HTMLElement
      ) {
        try {
          previouslyFocusedElement.focus();
        } catch {
          // No action required.
        }
      }

      previouslyFocusedElement = null;
    };



  /* =========================================================
     11. READ SAVED CONSENT
     ========================================================= */

  const getSavedConsent =
    () => {
      const rawConsent =
        getStorageItem(
          STORAGE_KEY
        );

      if (!rawConsent) {
        return null;
      }

      try {
        const saved =
          JSON.parse(
            rawConsent
          );

        if (
          !saved ||
          typeof saved !== "object" ||
          Array.isArray(saved)
        ) {
          return null;
        }

        if (
          saved.version !==
          CONSENT_VERSION
        ) {
          return null;
        }

        return {
          version:
            CONSENT_VERSION,

          necessary:
            true,

          analytics:
            saved.analytics === true,

          marketing:
            saved.marketing === true,

          updatedAt:
            typeof saved.updatedAt ===
            "string"
              ? saved.updatedAt
              : null
        };
      } catch {
        return null;
      }
    };



  /* =========================================================
     12. CONSENT EVENT
     ========================================================= */

  const dispatchConsentEvent =
    (consent) => {
      window.dispatchEvent(
        new CustomEvent(
          "fronixis-consent-updated",
          {
            detail: {
              necessary:
                true,

              analytics:
                consent.analytics ===
                true,

              marketing:
                consent.marketing ===
                true,

              /*
               * Future marketing integrations can
               * use this value.
               *
               * Normal outbound sponsored links
               * remain normal links; no additional
               * tracking script is injected here.
               */
              affiliate:
                consent.marketing ===
                true
            }
          }
        )
      );
    };



  /* =========================================================
     13. SAVE CONSENT
     ========================================================= */

  const saveConsent =
    (consent) => {
      const previousConsent =
        getSavedConsent();

      const normalizedConsent = {
        version:
          CONSENT_VERSION,

        necessary:
          true,

        analytics:
          consent.analytics === true,

        marketing:
          consent.marketing === true,

        updatedAt:
          new Date().toISOString()
      };

      setStorageItem(
        STORAGE_KEY,
        JSON.stringify(
          normalizedConsent
        )
      );

      if (
        normalizedConsent.analytics
      ) {
        loadGoogleAnalytics();
      } else {
        disableGoogleAnalytics({
          removeCookies:
            previousConsent?.analytics ===
            true
        });
      }

      dispatchConsentEvent(
        normalizedConsent
      );

      return normalizedConsent;
    };



  /* =========================================================
     14. APPLY CONSENT TO SWITCHES
     ========================================================= */

  const applySavedConsentToToggles =
    () => {
      const saved =
        getSavedConsent();

      if (!saved) {
        if (analyticsToggle) {
          analyticsToggle.checked =
            false;
        }

        if (marketingToggle) {
          marketingToggle.checked =
            false;
        }

        return false;
      }

      if (analyticsToggle) {
        analyticsToggle.checked =
          saved.analytics;
      }

      if (marketingToggle) {
        marketingToggle.checked =
          saved.marketing;
      }

      return true;
    };



  /* =========================================================
     15. OPEN COOKIE SETTINGS
     Supports:
     - #cookie-planet
     - .cookie-planet
     - .js-cookie-settings
     - [data-open-cookie-settings]
     - [data-cookie-settings]
     ========================================================= */

  const handleOpenCookieSettings =
    (event) => {
      event?.preventDefault();

      applySavedConsentToToggles();

      openBanner();
    };


  openCookieButtons.forEach(
    (button) => {
      button.addEventListener(
        "click",
        handleOpenCookieSettings
      );
    }
  );


  /*
   * Fallback:
   * If the old planet exists but for any reason
   * was not part of the NodeList above.
   */
  if (
    planetButton &&
    !Array.from(
      openCookieButtons
    ).includes(
      planetButton
    )
  ) {
    planetButton.addEventListener(
      "click",
      handleOpenCookieSettings
    );
  }



  /* =========================================================
     16. CLOSE BUTTON
     ========================================================= */

  closeButton?.addEventListener(
    "click",
    (event) => {
      event.preventDefault();

      closeBanner();
    }
  );



  /* =========================================================
     17. BACKDROP
     ========================================================= */

  backdrop?.addEventListener(
    "click",
    (event) => {
      event.preventDefault();

      closeBanner();
    }
  );


  /*
   * Compatibility for older modal structures
   * where the outer banner itself is the backdrop.
   */
  banner.addEventListener(
    "click",
    (event) => {
      if (
        event.target === banner
      ) {
        closeBanner();
      }
    }
  );



  /* =========================================================
     18. KEYBOARD / ACCESSIBILITY
     ========================================================= */

  document.addEventListener(
    "keydown",
    (event) => {
      if (!isBannerOpen()) {
        return;
      }

      /*
       * ESC closes the cookie dialog.
       */
      if (
        event.key === "Escape"
      ) {
        event.preventDefault();

        closeBanner();

        return;
      }

      /*
       * Keep keyboard focus inside
       * the open dialog.
       */
      if (
        event.key !== "Tab"
      ) {
        return;
      }

      const focusableElements =
        getFocusableElements();

      if (
        focusableElements.length === 0
      ) {
        event.preventDefault();

        return;
      }

      const firstElement =
        focusableElements[0];

      const lastElement =
        focusableElements[
          focusableElements.length - 1
        ];

      if (
        event.shiftKey &&
        document.activeElement ===
          firstElement
      ) {
        event.preventDefault();

        lastElement.focus();

        return;
      }

      if (
        !event.shiftKey &&
        document.activeElement ===
          lastElement
      ) {
        event.preventDefault();

        firstElement.focus();
      }
    }
  );



  /* =========================================================
     19. NECESSARY ONLY
     ========================================================= */

  rejectButton?.addEventListener(
    "click",
    (event) => {
      event.preventDefault();

      if (analyticsToggle) {
        analyticsToggle.checked =
          false;
      }

      if (marketingToggle) {
        marketingToggle.checked =
          false;
      }

      saveConsent({
        analytics:
          false,

        marketing:
          false
      });

      closeBanner();
    }
  );



  /* =========================================================
     20. SAVE SELECTION
     ========================================================= */

  saveButton?.addEventListener(
    "click",
    (event) => {
      event.preventDefault();

      saveConsent({
        analytics:
          analyticsToggle?.checked ===
          true,

        marketing:
          marketingToggle?.checked ===
          true
      });

      closeBanner();
    }
  );



  /* =========================================================
     21. ACCEPT ALL
     ========================================================= */

  acceptButton?.addEventListener(
    "click",
    (event) => {
      event.preventDefault();

      if (analyticsToggle) {
        analyticsToggle.checked =
          true;
      }

      if (marketingToggle) {
        marketingToggle.checked =
          true;
      }

      saveConsent({
        analytics:
          true,

        marketing:
          true
      });

      closeBanner();
    }
  );



  /* =========================================================
     22. INITIAL GOOGLE CONSENT STATE
     ========================================================= */

  /*
   * Analytics is disabled before
   * saved consent is evaluated.
   */
  window[
    `ga-disable-${GA_MEASUREMENT_ID}`
  ] = true;



  /* =========================================================
     23. INITIAL COOKIE STATE
     ========================================================= */

  const hasSavedConsent =
    applySavedConsentToToggles();


  const savedConsent =
    getSavedConsent();


  if (
    savedConsent?.analytics ===
    true
  ) {
    loadGoogleAnalytics();
  } else {
    disableGoogleAnalytics();
  }


  /*
   * Inform future integrations about
   * already saved consent.
   */
  if (savedConsent) {
    dispatchConsentEvent(
      savedConsent
    );
  }


  /*
   * First visit:
   * show consent dialog shortly after render.
   */
  if (!hasSavedConsent) {
    window.setTimeout(
      () => {
        openBanner();
      },
      350
    );
  } else {
    banner.hidden = true;

    banner.setAttribute(
      "aria-hidden",
      "true"
    );
  }



  /* =========================================================
     24. DEBUG-FRIENDLY SAFETY CHECK
     ========================================================= */

  /*
   * These warnings are only visible in the
   * browser console and help detect incomplete
   * cookie markup on future pages.
   */

  if (!closeButton) {
    console.warn(
      "Fronixis: Cookie close button was not found."
    );
  }

  if (!rejectButton) {
    console.warn(
      "Fronixis: 'Necessary only' cookie button was not found."
    );
  }

  if (!saveButton) {
    console.warn(
      "Fronixis: Cookie save button was not found."
    );
  }

  if (!acceptButton) {
    console.warn(
      "Fronixis: Cookie accept-all button was not found."
    );
  }

});
