import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_URL = "https://age-verse-nu.vercel.app";
const seoData = {
  "/": {
    title: "AgeVerse – Age, Date & Financial Calculators",
    description:
      "AgeVerse offers free online age, date, health, financial and everyday calculators with accurate and easy-to-use results.",
  },

  "/age-calculator": {
    title: "Age Calculator – Calculate Your Exact Age | AgeVerse",
    description:
      "Calculate your exact age in years, months and days with AgeVerse's free online Age Calculator.",
  },

  "/event-calculator": {
    title: "Event Calculator – Calculate Time Until an Event | AgeVerse",
    description:
      "Calculate the time remaining until weddings, parties, birthdays and other important events with AgeVerse.",
  },

  "/date-difference": {
    title: "Date Difference Calculator | AgeVerse",
    description:
      "Calculate the exact difference between two dates in years, months and days with AgeVerse.",
  },

  "/retirement-calculator": {
    title: "Retirement Calculator – Plan Your Retirement | AgeVerse",
    description:
      "Estimate your retirement timeline and plan your future with AgeVerse's free Retirement Calculator.",
  },

  "/health-profile": {
    title: "Health Profile Calculator | AgeVerse",
    description:
      "Check your BMI, health measurements and personalized wellness information with AgeVerse.",
  },

  "/pregnancy-calculator": {
    title: "Pregnancy Calculator – Due Date & Timeline | AgeVerse",
    description:
      "Estimate your pregnancy timeline and expected due date with AgeVerse's Pregnancy Calculator.",
  },

  "/utility/unit-converter": {
    title: "Unit Converter – Convert Units Online | AgeVerse",
    description:
      "Convert common units quickly and easily with AgeVerse's free online Unit Converter.",
  },

  "/utility/percentage-calculator": {
    title: "Percentage Calculator – Calculate Percentages | AgeVerse",
    description:
      "Calculate percentages quickly and accurately with AgeVerse's free Percentage Calculator.",
  },

  "/utility/gst-calculator": {
    title: "GST Calculator – Calculate GST Online | AgeVerse",
    description:
      "Calculate GST amount and final price easily with AgeVerse's free online GST Calculator.",
  },

  "/utility/emi-calculator": {
    title: "EMI Calculator – Calculate Loan EMI | AgeVerse",
    description:
      "Calculate your monthly loan EMI, interest and repayment details with AgeVerse's EMI Calculator.",
  },

  "/utility/discount-calculator": {
    title: "Discount Calculator – Calculate Discounts | AgeVerse",
    description:
      "Calculate discounts, savings and final prices quickly with AgeVerse's free Discount Calculator.",
  },

  "/utility/sip-calculator": {
    title: "SIP Calculator – Calculate SIP Returns | AgeVerse",
    description:
      "Estimate SIP investment growth and potential returns with AgeVerse's free SIP Calculator.",
  },

  "/utility/fd-calculator": {
    title: "FD Calculator – Calculate Fixed Deposit Returns | AgeVerse",
    description:
      "Calculate fixed deposit maturity amount and interest with AgeVerse's FD Calculator.",
  },

  "/utility/rd-calculator": {
    title: "RD Calculator – Calculate Recurring Deposit Returns | AgeVerse",
    description:
      "Calculate recurring deposit maturity amount and interest with AgeVerse's RD Calculator.",
  },

  "/pet/dog-age-calculator": {
    title: "Dog Age Calculator – Calculate Dog's Age | AgeVerse",
    description:
      "Convert your dog's age into equivalent human age with AgeVerse's free Dog Age Calculator.",
  },
  "/about": {
  title: "About AgeVerse | Free Online Calculators",
  description:
    "Learn about AgeVerse and our collection of free, simple and easy-to-use online calculators.",
},

"/contact": {
  title: "Contact AgeVerse",
  description:
    "Contact AgeVerse for questions, feedback and suggestions about our free online calculators.",
},

"/privacy-policy": {
  title: "Privacy Policy | AgeVerse",
  description:
    "Read the AgeVerse Privacy Policy to understand how we handle information and protect user privacy.",
},

"/terms": {
  title: "Terms and Conditions | AgeVerse",
  description:
    "Read the AgeVerse Terms and Conditions for using our free online calculators and website.",
},

"/disclaimer": {
  title: "Disclaimer | AgeVerse",
  description:
    "Read the AgeVerse disclaimer regarding the use and informational nature of our online calculators.",
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


function setMetaProperty(property, content) {
  let meta = document.querySelector(`meta[property="${property}"]`);

  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("property", property);
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

export default function SEO() {
  const location = useLocation();

  useEffect(() => {
  const currentPath = location.pathname.replace(/\/+$/, "") || "/";
  const data = seoData[currentPath] || seoData["/"];

  document.title = data.title;

    setMetaDescription(data.description);

    const canonicalUrl =
      currentPath === "/"
        ? `${SITE_URL}/`
        : `${SITE_URL}${currentPath}`;

    setCanonical(canonicalUrl);
    setMetaProperty("og:title", data.title);
    setMetaProperty("og:description", data.description);
    setMetaProperty("og:url", canonicalUrl);
    setMetaProperty("og:type", "website");
    setMetaProperty("og:site_name", "AgeVerse");
}, [location.pathname]);

  return null;
}
