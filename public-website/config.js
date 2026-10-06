window.AMCORE_CONFIG = {
  company: {
    name: "Amcore Limited",
    phone: "07879 321514",
    phoneE164: "+447879321514",
    email: "info@amcorelimited.co.uk",
    companyNumber: "15524141",
    base: "Middlesbrough, North East England",
    serviceArea: "United Kingdom"
  },
  quote: {
    vatRate: 0.20,
    standardPipeMetres: 3,
    additionalPipePerMetre: 55,
    electricalAllowance: 180,
    complexAccessAllowance: 350,
    priceBandLow: 0.94,
    priceBandHigh: 1.14
  },
  coverage: {
    fastTrackOutwardPrefixes: ["TS", "DL", "DH", "SR", "NE", "YO"],
    specialistLogisticsPrefixes: ["BT", "IM", "JE", "GY", "ZE", "HS"]
  },
  crm: {
    // Production: point this at a server-side endpoint such as /api/lead.
    // Do not place CRM private API keys in browser JavaScript.
    endpoint: "",
    provider: "webhook"
  },
  tracking: {
    googleTagId: "",   // e.g. G-XXXXXXXXXX or AW-XXXXXXXXX
    metaPixelId: ""    // e.g. 123456789012345
  },
  finance: {
    // Keep false until Amcore's FCA status / principal relationship and lender-approved wording are verified.
    enabled: false,
    statusText: "Finance options will only be displayed once the relevant authorisation or appointed-representative arrangements and approved wording are verified."
  },
  accreditations: {
    // Add only verified entries, for example { name, registerUrl, registrationNumber, verifiedOn }.
    verified: []
  }
};
