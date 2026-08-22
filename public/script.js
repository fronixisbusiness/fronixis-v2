document.addEventListener("DOMContentLoaded", () => {
  "use strict";


  /* =========================================================
     FRONIXIS
     Global JavaScript
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
         * should not jump to the top of the page.
         */
        if (
          !targetId ||
          targetId === "#"
        ) {
          event.preventDefault();

          return;
        }


        const elementId =
          decodeURIComponent(
            targetId.slice(1)
          );


        const target =
          document.getElementById(
            elementId
          );


        /*
         * If the element does not exist,
         * leave the browser's default behaviour untouched.
         */
        if (!target) {
          return;
        }


        event.preventDefault();


        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

      }
    );

  });



  /* =========================================================
     4. COOKIE ELEMENTS
     ========================================================= */

  const banner =
    document.getElementById(
      "cookie-banner"
    );


  const planetButton =
    document.getElementById(
      "cookie-planet"
    );


  const closeButton =
    document.getElementById(
      "cookie-close"
    );


  const acceptButton =
    document.getElementById(
      "cookie-accept"
    );


  const rejectButton =
    document.getElementById(
      "cookie-reject"
    );


  const saveButton =
    document.getElementById(
      "cookie-save"
    );


  const analyticsToggle =
    document.getElementById(
      "cookie-analytics"
    );


  const marketingToggle =
    document.getElementById(
      "cookie-marketing"
    );


  /*
   * Pages without a cookie interface
   * can still use newsletter and smooth-scroll code.
   */
  if (
    !banner ||
    !planetButton
  ) {
    return;
  }



  /* =========================================================
     5. COOKIE SETTINGS
     ========================================================= */

  const STORAGE_KEY =
    "fronixis-cookie-consent";


  /*
   * Increase this number if the consent model
   * changes substantially in the future.
   */
  const CONSENT_VERSION = 1;


  const GA_MEASUREMENT_ID =
    "G-KSM56XTJBP";


  let googleAnalyticsLoaded = false;


  let previouslyFocusedElement = null;



  /* =========================================================
     6. SAFE LOCAL STORAGE
     ========================================================= */

  const getStorageItem = (key) => {

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


  const setStorageItem = (
    key,
    value
  ) => {

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
     7. GOOGLE ANALYTICS COOKIES
     ========================================================= */

  const deleteAnalyticsCookie = (
    name
  ) => {

    const hostname =
      window.location.hostname;


    const cookieBase =
      `${encodeURIComponent(name)}=; Max-Age=0; path=/; SameSite=Lax`;


    /*
     * Current host
     */
    document.cookie =
      cookieBase;


    /*
     * Exact domain
     */
    if (hostname) {

      document.cookie =
        `${cookieBase}; domain=${hostname}`;


      /*
       * Parent-style domain
       */
      document.cookie =
        `${cookieBase}; domain=.${hostname}`;

    }

  };


  const deleteGoogleAnalyticsCookies =
    () => {

      const cookies =
        document.cookie
          .split(";")
          .map((cookie) =>
            cookie.trim()
          );


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
          cookieName.startsWith(
            "_ga_"
          )
        ) {

          deleteAnalyticsCookie(
            cookieName
          );

        }

      });

    };



  /* =========================================================
     8. GOOGLE ANALYTICS
     Loads only after analytics consent.
     ========================================================= */

  const loadGoogleAnalytics =
    () => {

      /*
       * Explicitly enable measurement again
       * in case consent was previously revoked.
       */
      window[
        `ga-disable-${GA_MEASUREMENT_ID}`
      ] = false;


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


      /*
       * Consent is granted here because this
       * function is called only after an
       * explicit analytics consent.
       */
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
       * If the external GA library has already
       * been added, we do not add it twice.
       */
      if (
        document.querySelector(
          "script[data-fronixis-ga]"
        )
      ) {

        googleAnalyticsLoaded = true;


        window.gtag(
          "consent",
          "update",
          {
            analytics_storage:
              "granted"
          }
        );


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

        window.gtag(
          "consent",
          "update",
          {
            analytics_storage:
              "denied",

            ad_storage:
              "denied",

            ad_user_data:
              "denied",

            ad_personalization:
              "denied"
          }
        );

      }


      if (removeCookies) {

        deleteGoogleAnalyticsCookies();

      }

    };



  /* =========================================================
     10. COOKIE MODAL
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
        (element) =>
          !element.hidden
      );

    };


  const openBanner =
    () => {

      previouslyFocusedElement =
        document.activeElement;


      banner.hidden = false;


      document.body.classList.add(
        "cookie-modal-open"
      );


      /*
       * Prevent background scrolling.
       */
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


      document.body.classList.remove(
        "cookie-modal-open"
      );


      document.body.style.overflow =
        "";


      if (
        previouslyFocusedElement instanceof
        HTMLElement
      ) {

        previouslyFocusedElement.focus();

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
          typeof saved !==
            "object" ||
          Array.isArray(saved)
        ) {

          return null;

        }


        /*
         * If we change the consent structure later,
         * users are asked again.
         */
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
            saved.analytics ===
            true,

          marketing:
            saved.marketing ===
            true,

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
     12. DISPATCH CONSENT EVENT
     ========================================================= */

  const dispatchConsentEvent =
    (consent) => {

      window.dispatchEvent(
        new CustomEvent(
          "fronixis-consent-updated",
          {
            detail: {
              necessary: true,

              analytics:
                consent.analytics ===
                true,

              marketing:
                consent.marketing ===
                true,

              /*
               * Affiliate tracking currently follows
               * the marketing consent category.
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
          consent.analytics ===
          true,

        marketing:
          consent.marketing ===
          true,

        updatedAt:
          new Date().toISOString()
      };


      setStorageItem(
        STORAGE_KEY,
        JSON.stringify(
          normalizedConsent
        )
      );


      /*
       * ANALYTICS
       */
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


      /*
       * Other tools can listen to this event.
       */
      dispatchConsentEvent(
        normalizedConsent
      );


      return normalizedConsent;

    };



  /* =========================================================
     14. APPLY SAVED CONSENT TO TOGGLES
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
     15. COOKIE PLANET
     ========================================================= */

  planetButton.addEventListener(
    "click",
    () => {

      applySavedConsentToToggles();

      openBanner();

    }
  );



  /* =========================================================
     16. CLOSE BUTTON
     ========================================================= */

  closeButton?.addEventListener(
    "click",
    () => {

      closeBanner();

    }
  );



  /* =========================================================
     17. CLICK ON BACKDROP
     ========================================================= */

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

      if (banner.hidden) {
        return;
      }


      /*
       * ESC closes the dialog.
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
       * the cookie dialog.
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
    () => {

      if (analyticsToggle) {

        analyticsToggle.checked =
          false;

      }


      if (marketingToggle) {

        marketingToggle.checked =
          false;

      }


      saveConsent({
        analytics: false,
        marketing: false
      });


      closeBanner();

    }
  );



  /* =========================================================
     20. SAVE SELECTION
     ========================================================= */

  saveButton?.addEventListener(
    "click",
    () => {

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
    () => {

      if (analyticsToggle) {

        analyticsToggle.checked =
          true;

      }


      if (marketingToggle) {

        marketingToggle.checked =
          true;

      }


      saveConsent({
        analytics: true,
        marketing: true
      });


      closeBanner();

    }
  );



  /* =========================================================
     22. INITIAL STATE
     ========================================================= */

  /*
   * Analytics is disabled before saved consent
   * is evaluated.
   */
  window[
    `ga-disable-${GA_MEASUREMENT_ID}`
  ] = true;


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
   * Inform future marketing / affiliate integrations
   * about already stored consent.
   */
  if (savedConsent) {

    dispatchConsentEvent(
      savedConsent
    );

  }


  /*
   * First visit:
   * show consent dialog after the page has rendered.
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

  }

});
