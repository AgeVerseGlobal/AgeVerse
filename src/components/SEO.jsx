import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_URL = "https://ageverseglobal.com";

const SITE_LOGO_URL = `${SITE_URL}/logo512.png`;
const SITE_OG_IMAGE_URL = `${SITE_URL}/branding/ageverse-og.jpg`;

const seoData = {
  "/": {
    title: "AgeVerseGlobal – Age, Date & Financial Calculators",
    description:
      "AgeVerseGlobal offers free online age, date, health, financial and everyday calculators with accurate and easy-to-use results.",
  },

  "/age-calculator": {
    title: "Age Calculator – Calculate Your Exact Age | AgeVerseGlobal",
    description:
      "Calculate your exact age in years, months and days with AgeVerseGlobal's free online Age Calculator.",
  },

  "/event-calculator": {
    title: "Event Calculator – Calculate Time Until an Event | AgeVerseGlobal",
    description:
      "Calculate the time remaining until weddings, parties, birthdays and other important events with AgeVerseGlobal.",
  },

  "/date-difference": {
    title: "Date Difference Calculator | AgeVerseGlobal",
    description:
      "Calculate the exact difference between two dates in years, months and days with AgeVerseGlobal.",
  },

  "/retirement-calculator": {
    title: "Retirement Calculator – Plan Your Retirement | AgeVerseGlobal",
    description:
      "Estimate your retirement timeline and plan your future with AgeVerseGlobal's free Retirement Calculator.",
  },

  "/health-profile": {
    title: "Health Profile Calculator | AgeVerseGlobal",
    description:
      "Check your BMI, health measurements and personalized wellness information with AgeVerseGlobal.",
  },

  "/pregnancy-calculator": {
    title: "Pregnancy Calculator – Due Date & Timeline | AgeVerseGlobal",
    description:
      "Estimate your pregnancy timeline and expected due date with AgeVerseGlobal's Pregnancy Calculator.",
  },

  "/utility/unit-converter": {
    title: "Unit Converter – Convert Units Online | AgeVerseGlobal",
    description:
      "Convert common units quickly and easily with AgeVerseGlobal's free online Unit Converter.",
  },

  "/utility/percentage-calculator": {
    title: "Percentage Calculator – Calculate Percentages | AgeVerseGlobal",
    description:
      "Calculate percentages quickly and accurately with AgeVerseGlobal's free Percentage Calculator.",
  },

  "/utility/gst-calculator": {
    title: "GST Calculator – Calculate GST Online | AgeVerseGlobal",
    description:
      "Calculate GST amount and final price easily with AgeVerseGlobal's free online GST Calculator.",
  },

  "/utility/emi-calculator": {
    title: "EMI Calculator – Calculate Loan EMI | AgeVerseGlobal",
    description:
      "Calculate your monthly loan EMI, interest and repayment details with AgeVerseGlobal's EMI Calculator.",
  },

  "/utility/discount-calculator": {
    title: "Discount Calculator – Calculate Discounts | AgeVerseGlobal",
    description:
      "Calculate discounts, savings and final prices quickly with AgeVerseGlobal's free Discount Calculator.",
  },

  "/utility/sip-calculator": {
    title: "SIP Calculator – Calculate SIP Returns | AgeVerseGlobal",
    description:
      "Estimate SIP investment growth and potential returns with AgeVerseGlobal's free SIP Calculator.",
  },

  "/utility/fd-calculator": {
    title: "FD Calculator – Calculate Fixed Deposit Returns | AgeVerseGlobal",
    description:
      "Calculate fixed deposit maturity amount and interest with AgeVerseGlobal's FD Calculator.",
  },

  "/utility/rd-calculator": {
    title: "RD Calculator – Calculate Recurring Deposit Returns | AgeVerseGlobal",
    description:
      "Calculate recurring deposit maturity amount and interest with AgeVerseGlobal's RD Calculator.",
  },

  "/dog-age-calculator": {
    title: "Dog Age Calculator – Calculate Dog's Age | AgeVerseGlobal",
    description:
      "Convert your dog's age into equivalent human age with AgeVerseGlobal's free Dog Age Calculator.",
  },

  "/about": {
    title: "About AgeVerseGlobal | Free Online Calculators",
    description:
      "Learn about AgeVerseGlobal and our collection of free, simple and easy-to-use online calculators.",
  },

  "/contact": {
    title: "Contact AgeVerseGlobal",
    description:
      "Contact AgeVerseGlobal for questions, feedback and suggestions about our free online calculators.",
  },

  "/privacy-policy": {
    title: "Privacy Policy | AgeVerseGlobal",
    description:
      "Read the AgeVerseGlobal Privacy Policy to understand how we handle information and protect user privacy.",
  },

  "/terms": {
    title: "Terms and Conditions | AgeVerseGlobal",
    description:
      "Read the AgeVerseGlobal Terms and Conditions for using our free online calculators and website.",
  },

  "/disclaimer": {
    title: "Disclaimer | AgeVerseGlobal",
    description:
      "Read the AgeVerseGlobal disclaimer regarding the use and informational nature of our online calculators.",
  },
};

function setMetaDescription(description) {
  let meta = document.querySelector('meta[name="description"]');

  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "description");
    document.head.appendChild(meta);
  }

  meta.setAttribute("content", description);
}

function setMetaRobots(content) {
  let meta = document.querySelector('meta[name="robots"]');

  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "robots");
    document.head.appendChild(meta);
  }

  meta.setAttribute("content", content);
}

function setMetaProperty(property, content) {
  let meta = document.querySelector(`meta[property="${property}"]`);

  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("property", property);
    document.head.appendChild(meta);
  }

  meta.setAttribute("content", content);
}

function setMetaName(name, content) {
  let meta = document.querySelector(`meta[name="${name}"]`);

  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", name);
    document.head.appendChild(meta);
  }

  meta.setAttribute("content", content);
}

function setCanonical(url) {
  let canonical = document.querySelector('link[rel="canonical"]');

  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }

  canonical.setAttribute("href", url);
}

function setJsonLd(id, data) {
  let script = document.getElementById(id);

  if (!script) {
    script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    document.head.appendChild(script);
  }

  script.textContent = JSON.stringify(data);
}

export default function SEO() {
  const location = useLocation();

  useEffect(() => {
    const currentPath =
      location.pathname.replace(/\/+$/, "") || "/";

    const data = seoData[currentPath];

    const isNotFound = !data;

    if (isNotFound) {
      document.title = "Page Not Found | AgeVerseGlobal";

      setMetaDescription(
        "The page you are looking for does not exist or may have been moved."
      );

      setMetaRobots("noindex, follow");

      setCanonical(`${SITE_URL}${currentPath}`);

      setMetaProperty(
        "og:title",
        "Page Not Found | AgeVerseGlobal"
      );

      setMetaProperty(
        "og:description",
        "The page you are looking for does not exist or may have been moved."
      );

      setMetaProperty(
        "og:url",
        `${SITE_URL}${currentPath}`
      );

      setMetaProperty("og:type", "website");
      setMetaProperty("og:site_name", "AgeVerseGlobal");
      setMetaProperty("og:image", SITE_OG_IMAGE_URL);
      setMetaProperty("og:image:alt", "AgeVerseGlobal logo");

      setMetaName("twitter:card", "summary_large_image");
      setMetaName(
        "twitter:title",
        "Page Not Found | AgeVerseGlobal"
      );

      setMetaName(
        "twitter:description",
        "The page you are looking for does not exist or may have been moved."
      );

      setMetaName("twitter:image", SITE_OG_IMAGE_URL);

      return;
    }

    document.title = data.title;

    setMetaDescription(data.description);

    setMetaRobots("index, follow");

    const canonicalUrl =
      currentPath === "/"
        ? `${SITE_URL}/`
        : `${SITE_URL}${currentPath}`;

    setCanonical(canonicalUrl);

    setMetaProperty("og:title", data.title);
    setMetaProperty("og:description", data.description);
    setMetaProperty("og:url", canonicalUrl);
    setMetaProperty("og:type", "website");
    setMetaProperty("og:site_name", "AgeVerseGlobal");
    setMetaProperty("og:image", SITE_OG_IMAGE_URL);
    setMetaProperty("og:image:alt", "AgeVerseGlobal logo");

    setMetaName("twitter:card", "summary_large_image");
    setMetaName("twitter:title", data.title);
    setMetaName("twitter:description", data.description);
    setMetaName("twitter:image", SITE_OG_IMAGE_URL);

    setJsonLd("ageverse-website-schema", {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "AgeVerseGlobal",
      url: `${SITE_URL}/`,
      description:
        "Free online age, date, health, financial and everyday calculators.",
    });

    setJsonLd("ageverse-organization-schema", {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "AgeVerseGlobal",
      url: `${SITE_URL}/`,
      logo: SITE_LOGO_URL,
    });
  }, [location.pathname]);

  return null;
}