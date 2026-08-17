const feedbackFormLink = "https://forms.cloud.microsoft/r/ZemQx8yRbg";
const coopSalaryGuideLink =
  "https://www.uoguelph.ca/experiential-learning/employers-partners/co-op-salary-guide";

const osapLink =
  "https://osap.gov.on.ca/AidEstimator2627Web/enterapp/enter.xhtml";

const federalStudentAidEstimatorLink =
  "https://certification.esdc.gc.ca/lea-mcl/eafe-sfae/eafe-sfae-h.4m.2@-eng.jsp";

const provincialTerritorialStudentAidLink =
  "https://www.canada.ca/en/services/benefits/education/student-aid.html";

const undergraduateAwardSearchLink =
  "https://www.uoguelph.ca/regweb/studentfinance/apps/awards";

const graduateAwardSearchLink =
  "https://www.uoguelph.ca/regweb/studentfinance/apps/grawards";

const internationalFundingTipsLink =
  "https://www.uoguelph.ca/admission/undergraduate/international/funding/student-tips/";



const COMPULSORY_FEE_RANGE_ALLOWANCE = 500;
const state = {
  osapFunding: 0,
  nonOntarioAidFunding: 0,
  data: null,
  currentStep: 0,

  studentPhase: "",            // future | current
  residencyType: "",           // Domestic | International
  province: "",                // ON | Non-ON | INT
  canadaRegion: "",             // ON | Non-ON, used only for current location in Canada
  livingInCanada: "",
  canadianCitizen: "",
  permanentResident: "",
  level: "",                   // UG | GR
  campus: "",
  cohortYear: "",
  currentStartTerm: "",
  program: "",
  major: "",
  classification: "",
  country: "",
  estimateScope: "full",

  includeBooks: false,
  includePersonal: false,
  includeCoop: false,
  includePartTimeEarnings: false,
  includeCoopEarnings: false,
  coopInterest: "Yes",
  futureMealPlanInterest: "No",
  
  housingType: "",            // None | OnCampus | OffCampus
  residence: "",
  roomType: "",
  mealPlan: "",
  offCampusType: "",
  currentOffCampusRent: null,
  currentOffCampusFood: 0,

  otherScholarshipOffset: 0,
  scholarshipOffset: 0,
  selectedScholarshipKeys: [],
  partTimeIncome: 0,
  coopEarningsOffset: 0,
  familySupport: 0,
  
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  email: "",
  marketingConsent: false,

  matchedTuitionRecord: null,
  result: null,

  booksAmount: 0,
  personalAmount: 0,
  partTimeHoursPerWeek: 10,
  partTimeHourlyRate: 20,
  coopHourlyRate: null,
  coopHoursPerWeek: 40,

  currencyCode: "",
  currencyRate: null,
  currencyLoading: false,
  currencyError: "",
  showStep2Error: false,
  step2ErrorMessage: "",
  dataLoadError: false
};
const INITIAL_ESTIMATOR_STATE =
  JSON.parse(
    JSON.stringify(state)
  );

const ESTIMATOR_SESSION_STORAGE_KEY =
  "uofg-cost-estimator-state";

const ESTIMATOR_SESSION_STORAGE_VERSION = 1;

/*
  Only non-sensitive estimator choices are saved. Personal contact fields,
  loaded JSON, calculated records and temporary error states are deliberately
  excluded from browser storage.
*/
const ESTIMATOR_PERSISTED_STATE_KEYS =
  Object.freeze([
    "osapFunding",
    "nonOntarioAidFunding",
    "currentStep",
    "studentPhase",
    "residencyType",
    "province",
    "canadaRegion",
    "livingInCanada",
    "canadianCitizen",
    "permanentResident",
    "level",
    "campus",
    "cohortYear",
    "currentStartTerm",
    "program",
    "major",
    "classification",
    "country",
    "estimateScope",
    "includeBooks",
    "includePersonal",
    "includeCoop",
    "includePartTimeEarnings",
    "includeCoopEarnings",
    "coopInterest",
    "futureMealPlanInterest",
    "housingType",
    "residence",
    "roomType",
    "mealPlan",
    "offCampusType",
    "currentOffCampusRent",
    "currentOffCampusFood",
    "otherScholarshipOffset",
    "scholarshipOffset",
    "selectedScholarshipKeys",
    "partTimeIncome",
    "coopEarningsOffset",
    "familySupport",
    "booksAmount",
    "personalAmount",
    "partTimeHoursPerWeek",
    "partTimeHourlyRate",
    "coopHourlyRate",
    "coopHoursPerWeek",
    "currencyCode",
    "currencyRate"
  ]);

const ESTIMATOR_NULLABLE_NUMBER_KEYS =
  new Set([
    "currentOffCampusRent",
    "coopHourlyRate",
    "currencyRate"
  ]);

function isCompatiblePersistedValue(
  key,
  value
) {
  if (key === "currentStep") {
    return (
      Number.isInteger(value) &&
      value >= 0 &&
      value <= 5
    );
  }

  if (
    ESTIMATOR_NULLABLE_NUMBER_KEYS.has(key)
  ) {
    return (
      value === null ||
      (
        typeof value === "number" &&
        Number.isFinite(value)
      )
    );
  }

  const initialValue =
    INITIAL_ESTIMATOR_STATE[key];

  if (Array.isArray(initialValue)) {
    return (
      Array.isArray(value) &&
      value.every(item =>
        typeof item === "string"
      )
    );
  }

  if (typeof initialValue === "number") {
    return (
      typeof value === "number" &&
      Number.isFinite(value)
    );
  }

  return typeof value === typeof initialValue;
}

function getPersistableEstimatorState() {
  return ESTIMATOR_PERSISTED_STATE_KEYS.reduce(
    (savedState, key) => {
      const value = state[key];

      savedState[key] =
        Array.isArray(value)
          ? [...value]
          : value;

      return savedState;
    },
    {}
  );
}

function saveEstimatorSession() {
  try {
    sessionStorage.setItem(
      ESTIMATOR_SESSION_STORAGE_KEY,
      JSON.stringify({
        version:
          ESTIMATOR_SESSION_STORAGE_VERSION,
        savedAt: new Date().toISOString(),
        state: getPersistableEstimatorState()
      })
    );
  } catch (error) {
    console.warn(
      "Estimator progress could not be saved:",
      error
    );
  }
}

function restoreEstimatorSession() {
  try {
    const savedValue =
      sessionStorage.getItem(
        ESTIMATOR_SESSION_STORAGE_KEY
      );

    if (!savedValue) {
      return false;
    }

    const savedPayload =
      JSON.parse(savedValue);

    if (
      savedPayload?.version !==
        ESTIMATOR_SESSION_STORAGE_VERSION ||
      !savedPayload.state ||
      typeof savedPayload.state !== "object"
    ) {
      sessionStorage.removeItem(
        ESTIMATOR_SESSION_STORAGE_KEY
      );

      return false;
    }

    const restoredState = {};

    ESTIMATOR_PERSISTED_STATE_KEYS.forEach(
      key => {
        if (
          Object.prototype.hasOwnProperty.call(
            savedPayload.state,
            key
          ) &&
          isCompatiblePersistedValue(
            key,
            savedPayload.state[key]
          )
        ) {
          restoredState[key] =
            savedPayload.state[key];
        }
      }
    );

    Object.assign(
      state,
      restoredState
    );

    /*
      Never restore personally identifying or derived information.
    */
    state.firstName = "";
    state.lastName = "";
    state.dateOfBirth = "";
    state.email = "";
    state.marketingConsent = false;
    state.matchedTuitionRecord = null;
    state.result = null;
    state.currencyLoading = false;
    state.currencyError = "";
    state.showStep2Error = false;
    state.step2ErrorMessage = "";

    return true;
  } catch (error) {
    console.warn(
      "Estimator progress could not be restored:",
      error
    );

    try {
      sessionStorage.removeItem(
        ESTIMATOR_SESSION_STORAGE_KEY
      );
    } catch (storageError) {
      console.warn(
        "Invalid estimator progress could not be cleared:",
        storageError
      );
    }

    return false;
  }
}

function bindEstimatorSessionPersistence() {
  document.addEventListener(
    "input",
    saveEstimatorSession
  );

  document.addEventListener(
    "change",
    saveEstimatorSession
  );

  window.addEventListener(
    "pagehide",
    saveEstimatorSession
  );
}
// ======================
// HELPER FUNCTIONS
// ======================
function escapeHtml(str) {
  return String(str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
function getAwardSearchDetails() {
  if (state.level === "GR") {
    return {
      link: graduateAwardSearchLink,
      label:
        "University of Guelph Graduate Award Search"
    };
  }

  return {
    link: undergraduateAwardSearchLink,
    label:
      "University of Guelph Undergraduate Award Search"
  };
}
function renderAlert(title, message = "", color = "yellow") {
  return `
    <div class="uog-alert uog-alert-${color}">
      <div class="uog-alert-title">
        <span class="uog-alert-icon">!</span>
        <span>${escapeHtml(title)}</span>
      </div>
      ${message ? `<div class="uog-alert-message">${escapeHtml(message)}</div>` : ""}
    </div>
  `;
}


const COUNTRY_CURRENCY = {
  Afghanistan: "AFN",
  Albania: "ALL",
  Algeria: "DZD",
  Andorra: "EUR",
  Angola: "AOA",
  "Antigua and Barbuda": "XCD",
  Argentina: "ARS",
  Armenia: "AMD",
  Australia: "AUD",
  Austria: "EUR",
  Azerbaijan: "AZN",
  Bahamas: "BSD",
  Bahrain: "BHD",
  Bangladesh: "BDT",
  Barbados: "BBD",
  Belarus: "BYN",
  Belgium: "EUR",
  Belize: "BZD",
  Benin: "XOF",
  Bhutan: "BTN",
  Bolivia: "BOB",
  "Bosnia and Herzegovina": "BAM",
  Botswana: "BWP",
  Brazil: "BRL",
  Brunei: "BND",
  Bulgaria: "BGN",
  "Burkina Faso": "XOF",
  Burundi: "BIF",
  "Cabo Verde": "CVE",
  Cambodia: "KHR",
  Cameroon: "XAF",
  Canada: "CAD",
  "Central African Republic": "XAF",
  Chad: "XAF",
  Chile: "CLP",
  China: "CNY",
  Colombia: "COP",
  Comoros: "KMF",
  "Congo (Democratic Republic of the)": "CDF",
  "Congo (Republic of the)": "XAF",
  "Costa Rica": "CRC",
  Croatia: "EUR",
  Cuba: "CUP",
  Cyprus: "EUR",
  Czechia: "CZK",
  Denmark: "DKK",
  Djibouti: "DJF",
  Dominica: "XCD",
  "Dominican Republic": "DOP",
  Ecuador: "USD",
  Egypt: "EGP",
  "El Salvador": "USD",
  "Equatorial Guinea": "XAF",
  Eritrea: "ERN",
  Estonia: "EUR",
  Eswatini: "SZL",
  Ethiopia: "ETB",
  Fiji: "FJD",
  Finland: "EUR",
  France: "EUR",
  Gabon: "XAF",
  Gambia: "GMD",
  Georgia: "GEL",
  Germany: "EUR",
  Ghana: "GHS",
  Greece: "EUR",
  Grenada: "XCD",
  Guatemala: "GTQ",
  Guinea: "GNF",
  "Guinea-Bissau": "XOF",
  Guyana: "GYD",
  Haiti: "HTG",
  "Holy See (Vatican City)": "EUR",
  Honduras: "HNL",
  Hungary: "HUF",
  Iceland: "ISK",
  India: "INR",
  Indonesia: "IDR",
  Iran: "IRR",
  Iraq: "IQD",
  Ireland: "EUR",
  Israel: "ILS",
  Italy: "EUR",
  "Ivory Coast": "XOF",
  Jamaica: "JMD",
  Japan: "JPY",
  Jordan: "JOD",
  Kazakhstan: "KZT",
  Kenya: "KES",
  Kiribati: "AUD",
  "Korea (North)": "KPW",
  "Korea (South)": "KRW",
  Kuwait: "KWD",
  Kyrgyzstan: "KGS",
  Laos: "LAK",
  Latvia: "EUR",
  Lebanon: "LBP",
  Lesotho: "LSL",
  Liberia: "LRD",
  Libya: "LYD",
  Liechtenstein: "CHF",
  Lithuania: "EUR",
  Luxembourg: "EUR",
  Madagascar: "MGA",
  Malawi: "MWK",
  Malaysia: "MYR",
  Maldives: "MVR",
  Mali: "XOF",
  Malta: "EUR",
  "Marshall Islands": "USD",
  Mauritania: "MRU",
  Mauritius: "MUR",
  Mexico: "MXN",
  Micronesia: "USD",
  Moldova: "MDL",
  Monaco: "EUR",
  Mongolia: "MNT",
  Montenegro: "EUR",
  Morocco: "MAD",
  Mozambique: "MZN",
  Myanmar: "MMK",
  Namibia: "NAD",
  Nauru: "AUD",
  Nepal: "NPR",
  Netherlands: "EUR",
  "New Zealand": "NZD",
  Nicaragua: "NIO",
  Niger: "XOF",
  Nigeria: "NGN",
  "North Macedonia": "MKD",
  Norway: "NOK",
  Oman: "OMR",
  Pakistan: "PKR",
  Palestine: "ILS",
  Palau: "USD",
  Panama: "USD",
  "Papua New Guinea": "PGK",
  Paraguay: "PYG",
  Peru: "PEN",
  Philippines: "PHP",
  Poland: "PLN",
  Portugal: "EUR",
  Qatar: "QAR",
  Romania: "RON",
  Russia: "RUB",
  Rwanda: "RWF",
  "Saint Kitts and Nevis": "XCD",
  "Saint Lucia": "XCD",
  "Saint Vincent and the Grenadines": "XCD",
  Samoa: "WST",
  "San Marino": "EUR",
  "Sao Tome and Principe": "STN",
  "Saudi Arabia": "SAR",
  Senegal: "XOF",
  Serbia: "RSD",
  Seychelles: "SCR",
  "Sierra Leone": "SLE",
  Singapore: "SGD",
  Slovakia: "EUR",
  Slovenia: "EUR",
  "Solomon Islands": "SBD",
  Somalia: "SOS",
  "South Africa": "ZAR",
  "South Sudan": "SSP",
  Spain: "EUR",
  "Sri Lanka": "LKR",
  Sudan: "SDG",
  Suriname: "SRD",
  Sweden: "SEK",
  Switzerland: "CHF",
  Syria: "SYP",
  Taiwan: "TWD",
  Tajikistan: "TJS",
  Tanzania: "TZS",
  Thailand: "THB",
  "Timor-Leste": "USD",
  Togo: "XOF",
  Tonga: "TOP",
  "Trinidad and Tobago": "TTD",
  Tunisia: "TND",
  Turkey: "TRY",
  Turkmenistan: "TMT",
  Tuvalu: "AUD",
  Uganda: "UGX",
  Ukraine: "UAH",
  "United Arab Emirates": "AED",
  "United Kingdom": "GBP",
  "United States": "USD",
  Uruguay: "UYU",
  Uzbekistan: "UZS",
  Vanuatu: "VUV",
  Venezuela: "VES",
  Vietnam: "VND",
  Yemen: "YER",
  Zambia: "ZMW",
  Zimbabwe: "ZWL"
};

document.addEventListener("DOMContentLoaded", init);

async function init() {
  injectEstimatorStyles();
  bindScrollTop();
  bindEstimatorSessionPersistence();
  await loadData();
  restoreEstimatorSession();
  calculateEstimate();
  renderCurrentStep();
}

function injectEstimatorStyles() {
  if (document.getElementById("estimatorDynamicStyles")) {
    return;
  }

  const style = document.createElement("style");
  style.id = "estimatorDynamicStyles";
  style.textContent = `
    #backStep5,
    #startAgainBtn {
      width: 180px;
      min-height: 48px;
      justify-content: center;
    }

    .coop-earnings-section {
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid #d6d6d6;
    }

    @media (max-width: 700px) {
      #backStep5,
      #startAgainBtn {
        width: 100%;
      }
    }
  `;

  document.head.appendChild(style);
}

let SUPPORTED_CURRENCIES = [];



async function loadData() {
  try {
    const res = await fetch(
      "./data.json",
      {
        cache: "no-store"
      }
    );
    if (!res.ok) throw new Error("Could not load data.json");
    state.data = await res.json();
    state.dataLoadError = false;
  } catch (err) {
    console.error(err);
    state.dataLoadError = true;
    const container = document.getElementById("flowContainer");
    if (container) {
      container.innerHTML = `
        <div class="step-container">
          <div class="step-header">
            <h2 class="step-title">Unable to load data</h2>
            <p class="step-description">Make sure <strong>data.json</strong> is in the same folder as index.html and app.js.</p>
            <hr class="divider">
          </div>
        </div>
      `;
    }
  }
}

function getAvailableGraduateClassifications() {
  if (state.level !== "GR") {
    return [];
  }

  const rows = getFilteredTuitionRows({
    includeClassification: false
  });

  const classifications = [
    ...new Map(
      rows
        .map(row => normalize(row.Classification))
        .filter(Boolean)
        .map(classification => [
          normalizeKey(classification),
          classification
        ])
    ).values()
  ];

  const preferredOrder = [
    "Graduate Diploma",
    "Masters",
    "Doctor of Philosophy (PhD)",
    "Doctor of Veterinary Science (PhD)"
  ].map(normalizeKey);

  return classifications.sort(
    (classificationA, classificationB) => {
      const indexA = preferredOrder.indexOf(
        normalizeKey(classificationA)
      );

      const indexB = preferredOrder.indexOf(
        normalizeKey(classificationB)
      );

      const orderA =
        indexA === -1
          ? Number.MAX_SAFE_INTEGER
          : indexA;

      const orderB =
        indexB === -1
          ? Number.MAX_SAFE_INTEGER
          : indexB;

      return (
        orderA - orderB ||
        classificationA.localeCompare(
          classificationB
        )
      );
    }
  );
}

function getAvailableProgramGroups() {
  /*
    Graduate students must choose a classification before
    program options become available.
  */
  if (
    state.level === "GR" &&
    !state.classification
  ) {
    return [];
  }

  const rows = getFilteredTuitionRows();
  const groupedPrograms = new Map();

  rows.forEach(row => {
    const program = normalize(row.Program);
    const major = normalize(row.Major);

    if (!program) return;

    if (!groupedPrograms.has(program)) {
      groupedPrograms.set(program, new Map());
    }

    const programChoices =
      groupedPrograms.get(program);

    const optionLabel =
      major || program;

    const optionKey =
      `${program}|||${major}`;

    if (!programChoices.has(optionKey)) {
      programChoices.set(optionKey, {
        program,
        major,
        label: optionLabel
      });
    }
  });

  return [...groupedPrograms.entries()]
    .sort(([programA], [programB]) =>
      programA.localeCompare(programB)
    )
    .map(([program, choices]) => ({
      program,

      choices: [...choices.values()].sort(
        (choiceA, choiceB) =>
          choiceA.label.localeCompare(
            choiceB.label
          )
      )
    }));
}

function bindScrollTop() {
  const btn = document.getElementById("scrollTopBtn");
  if (!btn) return;

  window.addEventListener("scroll", () => {
    btn.classList.toggle("show", window.scrollY > 250);
  });

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

let lastRenderedStep = null;

function scrollToEstimatorTop(
  behavior = "smooth"
) {
  const estimator = document.querySelector(
    ".estimator-shell"
  );

  if (!estimator) return;

  const top =
    estimator.getBoundingClientRect().top +
    window.scrollY -
    16;

  window.scrollTo({
    top: Math.max(0, top),
    behavior
  });
}

function setupWelcomeImage() {
  return;
}


function deriveFutureResidency() {
  if (state.studentPhase !== "future") return;

  if (state.canadianCitizen === "Yes") {
    state.residencyType = "Domestic";

    /*
      Canadian citizen or permanent resident living in Canada:
      use their selected Ontario / outside Ontario value.

      Canadian citizen or permanent resident living outside Canada:
      use Non-ON for domestic tuition matching.
    */
    state.province =
      state.livingInCanada === "Yes"
        ? state.canadaRegion
        : "Non-ON";
  } else if (state.canadianCitizen === "No") {
    state.residencyType = "International";

    state.province = "INT";
  } else {
    state.residencyType = "";
    state.province = "";
  }

  if (state.livingInCanada === "Yes") {
    state.country = "";
    state.currencyCode = "";
    state.currencyRate = null;
    state.currencyError = "";
  }

  if (state.livingInCanada === "No") {
    state.canadaRegion = "";
  }

  state.permanentResident = "";
}

function updateChrome() {
  const stepTitles = {
    0: "Welcome",
    1: "Academic profile",
    2: "Program and tuition",
    3: "Additional and living costs",
    4: "Funding and earnings",
    5: "Estimate summary"
  };

  const stepSubtitles = {
    0: "Start your estimate.",
    1: "Choose the student and residency path that applies to you.",
    2: "Select the year, campus and program for the estimate.",
    3: "Review textbooks, personal expenses, housing and food costs.",
    4:
      state.studentPhase === "current"
        ? "Add your funding and earnings that may help offset your costs."
        : "Add potential funding and earnings that may help offset your costs.",
    5: "Review the estimate and choose how to save it."
  };
  const scholarshipResourceLink =
    [...document.querySelectorAll(
      ".global-resources-links a"
    )].find(link =>
      link.textContent.trim() ===
      "Scholarships & Funding"
    );

  if (scholarshipResourceLink) {
    scholarshipResourceLink.href =
      state.level === "GR"
        ? graduateAwardSearchLink
        : undergraduateAwardSearchLink;
  }
  const topStatusCard = document.getElementById("topStatusCard");
  const progressInline = document.getElementById("progressInline");
  const showChrome = state.currentStep > 0;

  const osapResourceLink = [...document.querySelectorAll(".global-resources-links a")]
    .find(link => link.textContent.trim() === "OSAP Aid Estimator");

  if (osapResourceLink) {
    osapResourceLink.href = osapLink;
    osapResourceLink.hidden = false;
  }

  if (topStatusCard) topStatusCard.style.display = showChrome ? "flex" : "none";
  if (progressInline) progressInline.style.display = showChrome ? "flex" : "none";

  const statusEyebrow = document.getElementById("statusEyebrow");
  const statusTitle = document.getElementById("statusTitle");
  const statusSubtitle = document.getElementById("statusSubtitle");

  const tuitionOnly = state.estimateScope === "tuition-only";

  const visibleSteps = tuitionOnly
    ? [1, 2, 5]
    : [1, 2, 3, 4, 5];

  const currentVisiblePosition = Math.max(
    1,
    visibleSteps.indexOf(state.currentStep) + 1
  );

  if (statusEyebrow) {
    statusEyebrow.textContent = tuitionOnly
      ? `Step ${currentVisiblePosition} of ${visibleSteps.length}`
      : `Step ${state.currentStep} of 5`;
  }
  if (statusTitle) statusTitle.textContent = stepTitles[state.currentStep] || "";
  if (statusSubtitle) statusSubtitle.textContent = stepSubtitles[state.currentStep] || "";

  const progressPct = Math.round(
    (currentVisiblePosition / visibleSteps.length) * 100
  );

  const progressFill = document.getElementById("progressInlineFill");
  const progressText = document.getElementById("progressInlineText");

  if (progressFill) progressFill.style.width = `${progressPct}%`;
  if (progressText) progressText.textContent = `${progressPct}% complete`;

  const runningTotal = document.getElementById("topRunningTotal");
  if (runningTotal) {
    const low = state.result?.low || 0;
    const high = state.result?.high || 0;
    if (state.currentStep === 5) {
        document.getElementById("topRunningTotal").parentElement.style.display = "none";
    } else {
        document.getElementById("topRunningTotal").parentElement.style.display = "block";
        runningTotal.textContent = formatRangeValue(low, high);
    }
  }

  document.querySelectorAll(".stepper-item").forEach(item => {
    const step = Number(item.dataset.step);

    const isSkippedStep =
      tuitionOnly &&
      (step === 3 || step === 4);

    item.style.display = isSkippedStep ? "none" : "";

    if (isSkippedStep) {
      item.onclick = null;
      return;
    }

    const stepNumber = item.querySelector(".stepper-num");

    if (stepNumber) {
      if (tuitionOnly) {
        const visiblePosition = visibleSteps.indexOf(step) + 1;

        if (visiblePosition > 0) {
          stepNumber.textContent = visiblePosition;
        }
      } else {
        stepNumber.textContent = step;
      }
    }

    item.classList.remove("active", "done");

    if (showChrome) {
      if (step === state.currentStep) item.classList.add("active");
      if (step < state.currentStep) item.classList.add("done");
    }

    item.onclick = () => {
      if (step < 1 || step > 5) return;
      if (step > state.currentStep) {
        alert("Please complete the current step before moving forward.");
        return;
      }
      state.currentStep = step;
      calculateEstimate();
      renderCurrentStep();
    };
  });
}

function renderGryph() {
  return "";
}

function renderCurrentStep() {
  const container = document.getElementById("flowContainer");
  if (!container) return;

  const shouldScrollToEstimatorTop =
    lastRenderedStep !== null &&
    lastRenderedStep !== state.currentStep;

  if (!state.data) {
    container.innerHTML = state.dataLoadError ? `
      <div class="step-container">
        <div class="step-header">
          <p class="section-kicker">Data unavailable</p>
          <h2 class="step-title">Unable to load estimator data</h2>
          <p class="step-description">Make sure <strong>data.json</strong> is in the same folder as this HTML file and app.js.</p>
        </div>
      </div>
    ` : `
      <div class="step-container">
        <div class="loading-spinner"></div>
      </div>
    `;
    return;
  }

  calculateEstimate();

  let html = "";
  switch (state.currentStep) {
    case 0:
      html = renderStep0();
      break;
    case 1:
      html = renderStep1();
      break;
    case 2:
      html = renderStep2();
      break;
    case 3:
      html = renderStep3();
      break;
    case 4:
      html = renderStep4();
      break;
    case 5:
      html = renderStep5();
      break;
    default:
      state.currentStep = 0;
      html = renderStep0();
      break;
  }

  container.innerHTML = html;
  bindRenderedEvents();

  if (state.currentStep === 5) {
    bindResidenceAccordion();
  }

  setupWelcomeImage();
  updateChrome();
  saveEstimatorSession();

  lastRenderedStep = state.currentStep;

  if (shouldScrollToEstimatorTop) {
    window.requestAnimationFrame(() => {
      scrollToEstimatorTop();
    });
  }
}
function renderHelpfulResourcesFooter() {
  return `
    <div class="resources-footer">
      <div class="resources-footer-inner">
        <div>
          <p class="resources-footer-kicker">Helpful resources</p>
          <h3 class="resources-footer-title">Additional planning information</h3>
          <p class="resources-footer-text">
            The information below is provided for planning purposes only and is subject to change.
          </p>
        </div>

        <div class="resources-footer-links">
          <a
            href="https://www.uoguelph.ca/registrar/enrolment-records/immigration-status"
            target="_blank"
            rel="noopener"
          >
            Immigration Status
          </a>

          <a
            href="#"
            target="_blank"
            rel="noopener"
          >
            Scholarships & Funding
          </a>
        </div>
      </div>
    </div>
  `;
}
function renderStep0() {
  return `
    <div class="step-container contenthub-intro">
      <div class="step-header">
        <p class="section-kicker">
          Planning tool
        </p>

        <h2 class="step-title">
          Cost Estimator
        </h2>

        <p class="step-description">
          Select the option that best describes you
          to begin your estimate.
        </p>
      </div>

      <div class="step-content">
        <div class="choice-row welcome-choice-row">
          <button
            class="choice-card"
            data-value="future"
            type="button"
          >
            <span class="choice-card-title">
              Future student
            </span>

            <span class="choice-card-text">
              For prospective students and applicants
              planning ahead.
            </span>
          </button>

          <button
            class="choice-card"
            data-value="current"
            type="button"
          >
            <span class="choice-card-title">
              Current or returning student
            </span>

            <span class="choice-card-text">
              For students who already know their program
              and want a more specific estimate.
            </span>
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderStep1() {
  const countries = getAvailableCountries();

  return `
    <div class="step-container">
      <div class="step-header">
        <p class="section-kicker">Academic profile</p>
        <h2 class="step-title">Tell us about your student path</h2>

        <p class="step-description">
          These answers help determine the correct tuition and fee pathway.
        </p>
      </div>

      <div class="step-content">
        <div class="form-stack">

          <div class="form-group">
            <label for="studentPhase">
              Student type <span class="required-star">*</span>
            </label>

            <select id="studentPhase" class="step-dropdown">
              <option value="">Select student type</option>

              <option
                value="future"
                ${state.studentPhase === "future" ? "selected" : ""}
              >
                Future student
              </option>

              <option
                value="current"
                ${state.studentPhase === "current" ? "selected" : ""}
              >
                Current / returning student
              </option>
            </select>
          </div>

          ${
            state.studentPhase === "future"
              ? `
                <div class="form-group">
                  <label for="livingInCanada">
                    Are you currently living in Canada?
                    <span class="required-star">*</span>
                  </label>

                  <select id="livingInCanada" class="step-dropdown">
                    <option value="">Select an option</option>

                    <option
                      value="Yes"
                      ${state.livingInCanada === "Yes" ? "selected" : ""}
                    >
                      Yes
                    </option>

                    <option
                      value="No"
                      ${state.livingInCanada === "No" ? "selected" : ""}
                    >
                      No
                    </option>
                  </select>
                </div>

                ${
                  state.livingInCanada === "Yes"
                    ? `
                      <div class="form-group">
                        <label for="canadaRegion">
                          I am applying from
                          <span class="required-star">*</span>
                        </label>

                        <select id="canadaRegion" class="step-dropdown">
                          <option value="">Select an option</option>

                          <option
                            value="ON"
                            ${state.canadaRegion === "ON" ? "selected" : ""}
                          >
                            Ontario
                          </option>

                          <option
                            value="Non-ON"
                            ${state.canadaRegion === "Non-ON" ? "selected" : ""}
                          >
                            Outside Ontario
                          </option>
                        </select>
                      </div>
                    `
                    : ""
                }

                ${
                  state.livingInCanada === "No"
                    ? `
                      <div class="form-group">
                        <label for="country">
                          I am applying from
                          <span class="required-star">*</span>
                        </label>

                        <select id="country" class="step-dropdown">
                          <option value="">Select country</option>

                          ${countries.map(country => `
                            <option
                              value="${escapeHtml(country)}"
                              ${state.country === country ? "selected" : ""}
                            >
                              ${escapeHtml(country)}
                            </option>
                          `).join("")}
                        </select>
                      </div>
                    `
                    : ""
                }

                <div class="form-group">
                  <label for="canadianCitizen">
                    Are you a Canadian citizen or permanent resident of Canada?
                    <span class="required-star">*</span>
                  </label>

                  <select id="canadianCitizen" class="step-dropdown">
                    <option value="">Select an option</option>

                    <option
                      value="Yes"
                      ${state.canadianCitizen === "Yes" ? "selected" : ""}
                    >
                      Yes
                    </option>

                    <option
                      value="No"
                      ${state.canadianCitizen === "No" ? "selected" : ""}
                    >
                      No
                    </option>
                  </select>

                  <p class="form-help-text">
                    Review the
                    <a
                      href="https://www.uoguelph.ca/registrar/enrolment-records/immigration-status"
                      target="_blank"
                      rel="noopener"
                    >
                      University of Guelph immigration status information
                    </a>
                    before making your selection.
                  </p>
                </div>
              `
              : `
                <div class="form-group">
                  <label for="residencyType">
                    Residency type <span class="required-star">*</span>
                  </label>

                  <select id="residencyType" class="step-dropdown">
                    <option value="">Select residency type</option>

                    <option
                      value="Domestic"
                      ${state.residencyType === "Domestic" ? "selected" : ""}
                    >
                      Domestic
                    </option>

                    <option
                      value="International"
                      ${state.residencyType === "International" ? "selected" : ""}
                    >
                      International
                    </option>
                  </select>
                </div>

                ${
                  state.residencyType === "Domestic"
                    ? `
                      <div class="form-group">
                        <label for="province">
                          I am applying from
                          <span class="required-star">*</span>
                        </label>

                        <select id="province" class="step-dropdown">
                          <option value="">Select an option</option>

                          <option
                            value="ON"
                            ${state.province === "ON" ? "selected" : ""}
                          >
                            Ontario
                          </option>

                          <option
                            value="Non-ON"
                            ${state.province === "Non-ON" ? "selected" : ""}
                          >
                            Outside Ontario
                          </option>
                        </select>
                      </div>
                    `
                    : ""
                }
              `
          }

          <div class="form-group">
            <label for="level">
              ${state.studentPhase === "future" ? "Study level" : "Level"}
              <span class="required-star">*</span>
            </label>

            <select id="level" class="step-dropdown">
              <option value="">Select level</option>

              <option
                value="UG"
                ${state.level === "UG" ? "selected" : ""}
              >
                Undergraduate
              </option>

              <option
                value="GR"
                ${state.level === "GR" ? "selected" : ""}
              >
                Graduate
              </option>
            </select>
          </div>

        </div>
      </div>

      <div class="step-footer">
        <div></div>

        <button class="btn-primary" id="nextStep1" type="button">
          Continue
        </button>
      </div>
    </div>
  `;
}
function isExternalCampusSelected() {
  return (
    state.campus === "University of Guelph-Humber" ||
    state.campus === "Ridgetown Campus"
  );
}

function getExternalCampusFeeLink() {
  if (state.campus === "University of Guelph-Humber") {
    return "https://www.uoguelph.ca/registrar/finances-fees/tuition-fees/guelph-humber-undergrad";
  }

  if (state.campus === "Ridgetown Campus") {
    return "https://www.uoguelph.ca/registrar/finances-fees/tuition-fees/ridgetown-dip-undergrad";
  }

  return "";
}

function renderExternalCampusNotice() {
  if (!isExternalCampusSelected()) return "";

  const link = getExternalCampusFeeLink();

  return `

    <div class="uog-alert uog-alert-yellow">
      <div class="uog-alert-title">
        <span class="uog-alert-icon">!</span>
        <span>Use official campus fee information</span>
      </div>

      <div class="uog-alert-message">
        Tuition and fee information for ${escapeHtml(state.campus)} is handled separately. 
        Please use the official tuition and fees page for the most accurate information.

        <div style="margin-top: 1.2rem;">
          <a
            class="btn-primary"
            href="${escapeHtml(link)}"
            target="_blank"
            rel="noopener"
            style="display:inline-flex; align-items:center; text-decoration:none;"
          >
            View official tuition and fees
          </a>
        </div>
      </div>
    </div>
  `;
}
function renderExternalCampusStopScreen() {
  if (!isExternalCampusSelected()) return "";

  const link = getExternalCampusFeeLink();

  return `
    <div class="external-campus-card">
      <p class="section-kicker">Official tuition information</p>

      <h2 class="step-title">${escapeHtml(state.campus)}</h2>

      <p class="step-description">
        Tuition and fees for this campus are maintained separately from this estimator.
        Please continue using the official tuition and fees page below.
      </p>

      <a
        class="uog-btn uog-btn-primary external-campus-link"
        href="${escapeHtml(link)}"
        target="_blank"
        rel="noopener"
      >
        Continue to official tuition and fees
      </a>
    </div>
  `;
}
function isMandatoryCoopProgram() {
  const program = normalizeKey(state.program);

  if (!program) return false;

  return (
    program.includes("engineering") ||
    program === "beng" ||
    program === "b eng" ||
    program.includes("bachelor of engineering")
  );
}

function renderStep2() {
  const campuses =
    getAvailableCampuses();

  const cohortYears =
    getAvailableCohortYears();

  const currentStartTerms =
    getCurrentStartTermOptions();

  const isUG =
    state.level === "UG";

  const isGraduate =
    state.level === "GR";

  const graduateClassifications =
    getAvailableGraduateClassifications();

  /*
    Graduate programs currently use only the
    University of Guelph campus.
  */
  if (isGraduate) {
    state.campus = state.program
      ? "University of Guelph"
      : "";
  }

  const programGroups =
    getAvailableProgramGroups();

  /*
    External-campus stopping screens apply only
    to undergraduate students.
  */
  const externalCampusSelected =
    isUG &&
    isExternalCampusSelected();

  const isFutureGraduate =
    state.studentPhase === "future" &&
    isGraduate;
  const showUndergraduateWinterWarning =
    state.studentPhase === "future" &&
    state.level === "UG" &&
    normalizeKey(
      state.cohortYear
    ).startsWith("winter");
  const selectedProgramValue =
    state.program
      ? `${state.program}|||${state.major || ""}`
      : "";

  const selectedProgramExists =
    programGroups.some(group =>
      group.choices.some(choice =>
        choice.program === state.program &&
        choice.major === (state.major || "")
      )
    );

  if (
    state.campus &&
    !campuses.includes(state.campus)
  ) {
    state.campus = "";
    state.program = "";
    state.major = "";
    state.matchedTuitionRecord = null;
  }

  if (
    state.program &&
    !selectedProgramExists
  ) {
    state.program = "";
    state.major = "";
    state.matchedTuitionRecord = null;

    if (isGraduate) {
      state.campus = "";
    }
  }

  const coopStatus =
    getFutureProgramCoopStatus();

  const mandatoryCoop =
    isUG &&
    isMandatoryCoopProgram();

  if (mandatoryCoop) {
    state.coopInterest = "Yes";
    state.includeCoop = true;
  } else if (
    state.program &&
    coopStatus !== "Yes"
  ) {
    state.coopInterest = "No";
    state.includeCoop = false;
    state.includeCoopEarnings = false;
  }

  const latestApprovedCohort =
    getLatestApprovedTuitionCohort();

  const selectedStartYearMatch =
    String(
      state.cohortYear || ""
    ).match(/\b(\d{4})\b/);

  const selectedStartYear =
    selectedStartYearMatch
      ? Number(selectedStartYearMatch[1])
      : null;

  const firstUnapprovedYear =
    latestApprovedCohort
      ? latestApprovedCohort.end + 1
      : null;

  const showFutureTuitionWarning =
    state.studentPhase === "future" &&
    latestApprovedCohort &&
    Number.isFinite(selectedStartYear) &&
    selectedStartYear >
      latestApprovedCohort.end;

  return `
    <div class="step-container">
      <div class="step-header">
        <p class="section-kicker">
          Program and tuition
        </p>

        <h2 class="step-title">
          Select your program details
        </h2>

        <p class="step-description">
          ${
            state.studentPhase === "current"
              ? "Tell us when you began your current program, then choose the program details that apply to you."
              : isGraduate
              ? "Choose your expected start term, graduate program type and program."
              : "Choose the campus and program used to match tuition data."
          }
        </p>
      </div>

      <div class="step-content">
        <div class="form-stack">

          ${
            state.studentPhase === "future"
              ? `
                <div class="form-group">
                  <label for="cohortYear">
                    Expected start term

                    <span class="required-star">
                      *
                    </span>
                  </label>

                  <select
                    id="cohortYear"
                    class="step-dropdown"
                  >
                    <option value="">
                      Select target term
                    </option>

                    ${cohortYears.map(option => `
                      <option
                        value="${escapeHtml(option.value)}"
                        ${
                          state.cohortYear === option.value
                            ? "selected"
                            : ""
                        }
                      >
                        ${escapeHtml(option.label)}
                      </option>
                    `).join("")}
                  </select>

                  ${
                    showFutureTuitionWarning
                      ? `
                        <p class="form-help-text">
                          Tuition information is currently
                          available for the
                          ${escapeHtml(latestApprovedCohort.raw)}
                          cohort.

                          ${
                            isFutureGraduate
                              ? `
                                Graduate estimates for
                                ${escapeHtml(firstUnapprovedYear)}
                                or later use the most recent
                                approved tuition information.
                              `
                              : `
                                Estimates for Fall
                                ${escapeHtml(firstUnapprovedYear)}
                                or later use the most recent
                                approved tuition information.
                              `
                          }
                        </p>
                      `
                      : ""
                  }
                  ${
                    showUndergraduateWinterWarning
                      ? `
                        <p class="form-help-text">
                          <strong>Winter start availability:</strong>
                          Not all undergraduate programs accept students
                          starting in the Winter term. Some programs are
                          available for Fall entry only. Please confirm that
                          your selected program offers Winter admission.
                          You can
                          <a
                            href="https://www.uoguelph.ca/programs/undergraduate"
                            target="_blank"
                            rel="noopener"
                          >
                            explore undergraduate programs
                          </a>
                          on the University of Guelph website.
                        </p>
                      `
                      : ""
                  }
                </div>
              `
              : `
                <div class="form-group">
                  <label for="currentStartTerm">
                    When did you begin your current program at the University of Guelph?

                    <span class="required-star">
                      *
                    </span>
                  </label>

                  <select
                    id="currentStartTerm"
                    class="step-dropdown"
                  >
                    <option value="">
                      Select your start term
                    </option>

                    ${currentStartTerms.map(option => `
                      <option
                        value="${escapeHtml(option.value)}"
                        ${
                          state.currentStartTerm === option.value
                            ? "selected"
                            : ""
                        }
                      >
                        ${escapeHtml(option.label)}
                      </option>
                    `).join("")}
                  </select>

                  <p class="form-help-text">
                    Select the term when you first began your current program. This is used to match the correct tuition cohort.
                  </p>
                </div>
              `
          }

          ${
            isGraduate
              ? `
                <div class="form-group">
                  <label for="classification">
                    What type of graduate program
                    are you interested in?

                    <span class="required-star">
                      *
                    </span>
                  </label>

                  <select
                    id="classification"
                    class="step-dropdown"
                  >
                    <option value="">
                      Select graduate program type
                    </option>

                    ${graduateClassifications.map(
                      classification => {
                        const displayLabel =
                          classification === "Masters"
                            ? "Master’s"
                            : classification ===
                              "Doctoral/PHD"
                              ? "Doctoral / PhD"
                              : classification;

                        return `
                          <option
                            value="${escapeHtml(classification)}"
                            ${
                              state.classification ===
                              classification
                                ? "selected"
                                : ""
                            }
                          >
                            ${escapeHtml(displayLabel)}
                          </option>
                        `;
                      }
                    ).join("")}
                  </select>
                </div>
              `
              : ""
          }

          ${
            isUG
              ? renderCampusChoices()
              : ""
          }

          ${
            externalCampusSelected
              ? renderExternalCampusStopScreen()
              : (
                  isUG
                    ? state.campus
                    : state.classification
                )
                ? `
                  <div class="form-group">
                    <label for="program">
                      Program

                      <span class="required-star">
                        *
                      </span>
                    </label>

                    <select
                      id="program"
                      class="step-dropdown"
                    >
                      <option value="">
                        ${
                          isGraduate
                            ? "Select graduate program"
                            : "Select program or major"
                        }
                      </option>

                      ${programGroups.map(group => {
                        /*
                          When a graduate program has only
                          one choice, display one normal option.
                        */
                        if (
                          isGraduate &&
                          group.choices.length === 1
                        ) {
                          const choice =
                            group.choices[0];

                          const choiceValue =
                            `${choice.program}|||${choice.major}`;

                          return `
                            <option
                              value="${escapeHtml(choiceValue)}"
                              ${
                                selectedProgramValue ===
                                choiceValue
                                  ? "selected"
                                  : ""
                              }
                            >
                              ${escapeHtml(group.program)}
                            </option>
                          `;
                        }

                        /*
                          Keep grouped formatting when a
                          program contains multiple choices.
                        */
                        return `
                          <optgroup
                            label="${escapeHtml(group.program)}"
                          >
                            ${group.choices.map(choice => {
                              const choiceValue =
                                `${choice.program}|||${choice.major}`;

                              return `
                                <option
                                  value="${escapeHtml(choiceValue)}"
                                  ${
                                    selectedProgramValue ===
                                    choiceValue
                                      ? "selected"
                                      : ""
                                  }
                                >
                                  ${escapeHtml(choice.label)}
                                </option>
                              `;
                            }).join("")}
                          </optgroup>
                        `;
                      }).join("")}
                    </select>

                    <p class="form-help-text">
                      ${
                        isGraduate
                          ? `
                            Select the graduate program
                            that best matches your intended
                            area of study.
                          `
                          : `
                            Programs are organized by degree.
                            Select your major from the
                            applicable section.
                          `
                      }
                    </p>
                  </div>

                  ${
                    state.program
                      ? `
                        ${
                          isGraduate
                            ? renderCampusChoices()
                            : ""
                        }

                        ${
                          mandatoryCoop
                            ? `
                              <div class="form-group">
                                <label>
                                  Co-op requirement
                                </label>

                                <div class="readonly-field">
                                  Yes, co-op is required
                                </div>

                                <p class="form-help-text">
                                  Co-op is mandatory for this
                                  engineering program and is
                                  automatically included in
                                  your estimate.
                                </p>
                              </div>
                            `
                            : coopStatus === "Yes"
                              ? `
                                <div class="form-group">
                                  <label for="coopInterest">
                                    ${
                                      state.studentPhase ===
                                      "future"
                                        ? "Interested in co-op?"
                                        : "Enrolled in co-op?"
                                    }
                                  </label>

                                  <select
                                    id="coopInterest"
                                    class="step-dropdown"
                                  >
                                    <option
                                      value="Yes"
                                      ${
                                        state.coopInterest ===
                                        "Yes"
                                          ? "selected"
                                          : ""
                                      }
                                    >

                                      Yes
                                    </option>

                                    <option
                                      value="No"
                                      ${
                                        state.coopInterest ===
                                        "No"
                                          ? "selected"
                                          : ""
                                      }
                                    >
                                      No
                                    </option>
                                  </select>
                                </div>
                              `
                              : ""
                        }

                        <div class="estimate-scope-section">
                          <div class="estimate-scope-heading">
                            <h3 class="subsection-title">
                              What would you like to estimate?
                            </h3>

                            <p class="form-help-text">
                              You can calculate tuition and
                              compulsory fees only or include
                              living expenses and potential
                              funding.
                            </p>
                          </div>

                          <div class="estimate-scope-options">
                            <button
                              type="button"
                              class="estimate-scope-card ${
                                state.estimateScope === "full"
                                  ? "selected"
                                  : ""
                              }"
                              data-estimate-scope="full"
                              aria-pressed="${
                                state.estimateScope === "full"
                              }"
                            >
                              <span
                                class="estimate-scope-radio"
                              ></span>

                              <span
                                class="estimate-scope-content"
                              >
                                <strong>
                                  Full cost estimate
                                </strong>

                                <span>
                                  Continue through the
                                  calculator to include living
                                  expenses and ways to fund
                                  your education.
                                </span>
                              </span>
                            </button>

                            <button
                              type="button"
                              class="estimate-scope-card ${
                                state.estimateScope ===
                                "tuition-only"
                                  ? "selected"
                                  : ""
                              }"
                              data-estimate-scope="tuition-only"
                              aria-pressed="${
                                state.estimateScope ===
                                "tuition-only"
                              }"
                            >
                              <span
                                class="estimate-scope-radio"
                              ></span>

                              <span
                                class="estimate-scope-content"
                              >
                                <strong>
                                  Tuition only
                                </strong>

                                <span>
                                  Skip the remaining calculator
                                  steps and go directly to your
                                  tuition and compulsory-fee
                                  estimate.
                                </span>
                              </span>
                            </button>
                          </div>
                        </div>
                      `
                      : ""
                  }
                `
                : ""
          }

        </div>
      </div>

      <div class="step-footer">
        <button
          class="btn-secondary"
          id="backStep2"
          type="button"
        >
          Back
        </button>

        ${
          externalCampusSelected
            ? ""
            : `
              <button
                class="btn-primary"
                id="nextStep2"
                type="button"
              >
                ${
                  state.estimateScope === "tuition-only"
                    ? "Skip to estimate summary"
                    : "Continue to costs and funding"
                }
              </button>
            `
        }
      </div>
    </div>
  `;
}

function renderInfoIcon(title, message) {
  const tooltipId = `tooltip-${Math.random().toString(36).slice(2, 9)}`;

  return `
    <span class="info-wrap">
      <button
        type="button"
        class="info-btn"
        aria-label="More information about ${escapeHtml(title)}"
        data-tooltip-id="${tooltipId}"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 
          10-4.48 10-10S17.52 2 12 2zm0 17c-.55 
          0-1-.45-1-1v-6c0-.55.45-1 1-1s1 
          .45 1 1v6c0 .55-.45 1-1 1zm0-10c-.83 
          0-1.5-.67-1.5-1.5S11.17 6 12 
          6s1.5.67 1.5 1.5S12.83 9 12 9z"></path>
        </svg>

        <div class="info-tooltip" id="${tooltipId}" style="display:none;">
          <div class="info-tooltip-title">${escapeHtml(title)}</div>
          <div>${escapeHtml(message)}</div>
        </div>
      </button>
    </span>
  `;
}
function getJsonCost(sectionName, fieldName, fallbackAmount = 0) {
  const record = state.data?.[sectionName]?.[0] || {};
  const rawValue = normalize(readField(record, [fieldName]));

  let period = "per year";

  if (/semester/i.test(rawValue)) {
    period = "per semester";
  } else if (/week/i.test(rawValue)) {
    period = "per week";
  } else if (/year/i.test(rawValue)) {
    period = "per year";
  }

  return {
    rawValue,
    amount: parseAmountFromText(rawValue) || fallbackAmount,
    period
  };
}

function renderMoneyInput({
  id,
  value,
  placeholder = "",
  min = 0,
  max = ""
}) {
  return `
    <div class="money-input-wrap">
      <span class="money-input-prefix" aria-hidden="true">$</span>

      <input
        id="${escapeHtml(id)}"
        class="step-input money-input"
        type="number"
        min="${escapeHtml(min)}"
        ${max !== "" ? `max="${escapeHtml(max)}"` : ""}
        step="5"
        value="${escapeHtml(value)}"
        placeholder="${escapeHtml(placeholder)}"
      />
    </div>
  `;
}
function getResidenceAreas() {
  return [...new Set(
    (state.data?.["On_campus_Living_Costs"] || [])
      .map(item =>
        normalize(
          readField(item, [
            "ResidenceArea",
            "Residence Area"
          ])
        )
      )
      .filter(Boolean)
  )].sort((a, b) => a.localeCompare(b));
}

function getRoomOptionsForResidence(residenceArea) {
  if (!residenceArea) return [];

  return (state.data?.["On_campus_Living_Costs"] || [])
    .filter(item => {
      const area = normalize(
        readField(item, [
          "ResidenceArea",
          "Residence Area"
        ])
      );

      return normalizeKey(area) === normalizeKey(residenceArea);
    })
    .map(item => {
      const roomType = normalize(
        readField(item, [
          "RoomType",
          "Room Type"
        ])
      );

      /*
        Cost already includes Fall, Winter and the deposit
        in the supplied JSON.
      */
      const yearlyCost = toNumber(
        readField(item, ["Cost"])
      );

      return {
        value: roomType,
        label: `${roomType} (${formatMoney(yearlyCost)}/year)`,
        yearlyCost
      };
    })
    .filter(option => option.value)
    .sort((a, b) => a.yearlyCost - b.yearlyCost);
}

function getGraduateRoomTypes() {
  const rows =
    state.data?.["On_campus_Living_Costs"] || [];

  return [...new Set(
    rows
      .map(item =>
        normalize(
          readField(item, [
            "RoomType",
            "Room Type"
          ])
        )
      )
      .filter(Boolean)
  )].sort((roomA, roomB) =>
    roomA.localeCompare(roomB)
  );
}

function getGraduateResidencesForRoomType(
  selectedRoomType
) {
  if (!selectedRoomType) {
    return [];
  }

  const rows =
    state.data?.["On_campus_Living_Costs"] || [];

  const residences = new Map();

  rows
    .filter(item => {
      const roomType = normalize(
        readField(item, [
          "RoomType",
          "Room Type"
        ])
      );

      return (
        normalizeKey(roomType) ===
        normalizeKey(selectedRoomType)
      );
    })
    .forEach(item => {
      const residenceArea = normalize(
        readField(item, [
          "ResidenceArea",
          "Residence Area"
        ])
      );

      const yearlyCost = toNumber(
        readField(item, ["Cost"])
      );

      if (!residenceArea) {
        return;
      }

      residences.set(
        normalizeKey(residenceArea),
        {
          value: residenceArea,
          label:
            `${residenceArea} (${formatMoney(yearlyCost)}/year)`,
          yearlyCost
        }
      );
    });

  return [...residences.values()]
    .sort((optionA, optionB) =>
      optionA.value.localeCompare(
        optionB.value
      )
    );
}

function selectedResidenceRequiresMealPlan() {
  const residence = normalizeKey(state.residence);
  const roomType = normalizeKey(state.roomType);

  if (!residence || !roomType) return false;

  /*
    All room types in these residence areas have access
    to kitchen facilities.
  */
  const optionalMealPlanResidences = [
    "east residences",
    "east village townhouses",
    "west village",
    "university houses"
  ];

  if (optionalMealPlanResidences.includes(residence)) {
    return false;
  }

  /*
    Only apartment room types in North and South Residence
    are exempt from the mandatory meal plan.
  */
  const isNorthOrSouth =
    residence === "north residence" ||
    residence === "south residence";

  const isExemptApartment =
    roomType === "one-person apartment" ||
    roomType === "two-bedroom apartment";

  if (isNorthOrSouth && isExemptApartment) {
    return false;
  }

  return true;
}
function renderGraduateExpenseGuide() {
  /*
    Display this informational table only
    for graduate students.
  */
  if (state.level !== "GR") {
    return "";
  }

  const rows = (
    state.data?.["Off_campus_Living_Costs"] || []
  ).filter(item => {
    const expense = normalize(
      readField(item, ["Expense"])
    );

    /*
      Exclude the off-campus housing amount.
    */
    return (
      normalizeKey(expense) !==
      normalizeKey(
        "Off-campus housing (shared)"
      )
    );
  });

  if (!rows.length) {
    return "";
  }

  return `
    <details
      class="housing-guide-card graduate-expense-guide"
    >
      <summary>
        <span class="housing-guide-summary-title">
          View typical graduate living expenses
        </span>

        <span class="housing-guide-summary-note">
          Planning information
        </span>
      </summary>

      <div class="housing-guide-body">
        <p
          class="form-help-text graduate-expense-guide-note"
        >
          These amounts are provided as a general
          planning guide. They are not automatically
          added to your estimate.
        </p>

        <div class="off-campus-cost-table">
          <div class="off-campus-cost-header">
            <span>
              Expense
            </span>

            <span>
              Cost by semester
            </span>

            <span>
              Cost by year
            </span>
          </div>

          ${rows.map(item => {
            const expense = readField(
              item,
              ["Expense"]
            );

            const semesterCost = readField(
              item,
              ["Costs by Semester"]
            );

            const yearlyCost = readField(
              item,
              ["Costs by Year"]
            );

            return `
              <div class="off-campus-cost-row">
                <span class="off-campus-expense-name">
                  ${escapeHtml(expense)}
                </span>

                <span class="off-campus-semester-cost">
                  ${escapeHtml(
                    semesterCost ||
                    "Not available"
                  )}
                </span>

                <strong class="off-campus-yearly-cost">
                  ${escapeHtml(
                    yearlyCost ||
                    "Not available"
                  )}
                </strong>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    </details>
  `;
}

function renderOnCampusHousingFields() {
  if (
    state.housingType !== "OnCampus"
  ) {
    return "";
  }

  const isGraduate =
    state.level === "GR";

  const isCurrentStudent =
    state.studentPhase === "current";

  const residenceInformationLink =
    getInformationLink(
      "On_campus_Living_Costs",
      "https://www.uoguelph.ca/housing/fees-deposits"
    );

  /*
    Graduate order:
    Room type, followed by available residences.
  */
  if (isGraduate) {
    const roomTypes =
      getGraduateRoomTypes();

    const availableResidences =
      getGraduateResidencesForRoomType(
        state.roomType
      );

    return `
      <div class="form-group">
        <label for="roomType">
          ${
            isCurrentStudent
              ? "Which room type do you live in?"
              : "Which room type would you prefer?"
          }
          <span class="required-star">*</span>
        </label>

        <select
          id="roomType"
          class="step-dropdown"
        >
          <option value="">
            Select a room type
          </option>

          ${roomTypes.map(roomType => `
            <option
              value="${escapeHtml(roomType)}"
              ${
                state.roomType === roomType
                  ? "selected"
                  : ""
              }
            >
              ${escapeHtml(roomType)}
            </option>
          `).join("")}
        </select>

        <p class="form-help-text">
          Select a room type to view the
          residences where it is available.
        </p>
      </div>

      ${
        state.roomType
          ? `
            <div class="form-group">
              <label for="residence">
                ${
                  isCurrentStudent
                    ? "Which residence do you live in?"
                    : "Which residence would you prefer?"
                }
                <span class="required-star">*</span>
              </label>

              <select
                id="residence"
                class="step-dropdown"
              >
                <option value="">
                  Select an available residence
                </option>

                ${availableResidences.map(option => `
                  <option
                    value="${escapeHtml(option.value)}"
                    ${
                      state.residence === option.value
                        ? "selected"
                        : ""
                    }
                  >
                    ${escapeHtml(option.label)}
                  </option>
                `).join("")}
              </select>

              <p class="form-help-text">
                These residences offer the selected
                room type. Review current
                <a
                  href="${escapeHtml(residenceInformationLink)}"
                  target="_blank"
                  rel="noopener"
                >
                  residence fees and deposits
                </a>.
              </p>
            </div>
          `
          : ""
      }
    `;
  }

  /*
    Existing undergraduate order:
    Residence, followed by room type.
  */
  const residenceAreas =
    getResidenceAreas();

  const roomOptions =
    getRoomOptionsForResidence(
      state.residence
    );

  return `
    <div class="form-group">
      <label for="residence">
        ${
          isCurrentStudent
            ? "Which residence do you live in?"
            : "Which residence would you prefer?"
        }
        <span class="required-star">*</span>
      </label>

      <select
        id="residence"
        class="step-dropdown"
      >
        <option value="">
          Select a residence
        </option>

        ${residenceAreas.map(area => `
          <option
            value="${escapeHtml(area)}"
            ${
              state.residence === area
                ? "selected"
                : ""
            }
          >
            ${escapeHtml(area)}
          </option>
        `).join("")}
      </select>

      <p class="form-help-text">
        Review current
        <a
          href="${escapeHtml(residenceInformationLink)}"
          target="_blank"
          rel="noopener"
        >
          residence fees and deposits
        </a>.
      </p>
    </div>

    ${
      state.residence
        ? `
          <div class="form-group">
            <label for="roomType">
              ${
                isCurrentStudent
                  ? "Which room type do you live in?"
                  : "Which room type would you prefer?"
              }
              <span class="required-star">*</span>
            </label>


            <select
              id="roomType"
              class="step-dropdown"
            >
              <option value="">
                Select a room type
              </option>

              ${roomOptions.map(option => `
                <option
                  value="${escapeHtml(option.value)}"
                  ${
                    state.roomType === option.value
                      ? "selected"
                      : ""
                  }
                >
                  ${escapeHtml(option.label)}
                </option>
              `).join("")}
            </select>

            <p class="form-help-text">
              The displayed amount is the
              yearly residence cost from the
              available planning data.
            </p>
          </div>
        `
        : ""
    }
  `;
}
function renderStep3() {
  const isCurrentStudent =
    state.studentPhase === "current";

  const textbooks = getJsonCost(
    "Textbooks",
    "Textbooks",
    1400
  );

  const personalExpenses = getJsonCost(
    "Personal Expenses",
    "Personal Expenses",
    2500
  );

  if (!state.booksAmount) {
    state.booksAmount = textbooks.amount;
  }

  if (!state.personalAmount) {
    state.personalAmount = personalExpenses.amount;
  }
  const averageMonthlyRent =
    getAverageMonthlyOffCampusRent();

  if (
    state.housingType === "OffCampus" &&
    state.currentOffCampusRent === null
  ) {
    state.currentOffCampusRent =
      averageMonthlyRent;
  }

  const residenceAreas = getResidenceAreas();

  const roomOptions =
    getRoomOptionsForResidence(state.residence);

  const mealPlanOptions =
    getMealPlanOptions();

  const isOnCampus =
    state.housingType === "OnCampus";

  const isOffCampus =
    state.housingType === "OffCampus";

  const mealPlanRequired =
    isOnCampus &&
    selectedResidenceRequiresMealPlan();

  const showMealPlanSelection =
    (
      isOnCampus &&
      state.residence &&
      state.roomType
    ) ||
    (
      isOffCampus &&
      state.futureMealPlanInterest === "Yes"
    );

  const residenceInformationLink =
    getInformationLink(
      "On_campus_Living_Costs",
      "https://www.uoguelph.ca/housing/fees-deposits"
    );

  const mealPlanInformationLink =
    getInformationLink(
      "Meal_Plan",
      "https://www.uoguelph.ca/hospitality-services/campus-meal-plans"
    );

  return `
    <div class="step-container">
      <div class="step-header">
        <p class="section-kicker">
          Additional and living costs
        </p>

        <h2 class="step-title">
          ${
            isCurrentStudent
              ? "Add your expenses"
              : "Add your estimated expenses"
          }
        </h2>

        <p class="step-description">
          ${
            isCurrentStudent
              ? "Review your textbooks, personal expenses, residence and meal-plan costs before adding your funding."
              : "Review textbooks, personal expenses, residence and meal-plan costs before adding potential funding."
          }
        </p>
      </div>

      <div class="step-content">
        <div class="form-stack">

          <div class="form-group">
            <label for="booksAmount">
              ${isCurrentStudent ? "Textbooks and supplies" : "Estimated textbooks and supplies"}
              (${escapeHtml(textbooks.period)})
            </label>

            ${renderMoneyInput({
              id: "booksAmount",
              value: state.booksAmount
            })}

            <p class="form-help-text">
              The default amount is taken from the yearly
              textbooks estimate.
            </p>
          </div>

          <div class="form-group">
            <label for="personalAmount">
              ${isCurrentStudent ? "Personal expenses" : "Estimated personal expenses"}
              (${escapeHtml(personalExpenses.period)})
            </label>

            ${renderMoneyInput({
              id: "personalAmount",
              value: state.personalAmount
            })}

            <p class="form-help-text">
              The default amount is taken from the yearly
              personal-expense estimate.
            </p>
          </div>

          ${renderGraduateExpenseGuide()}

          <div class="form-group">
            <h3 class="subsection-title">
              Residence and meal plan
            </h3>

            <label for="housingType">
              ${
                isCurrentStudent
                  ? "Do you live on campus or off campus?"
                  : "Do you plan to live on campus or off campus?"
              }
              <span class="required-star">*</span>
            </label>

            <select
              id="housingType"
              class="step-dropdown"
            >
              <option value="">
                ${isCurrentStudent ? "Select where you live" : "Select where you plan to live"}
              </option>

              <option
                value="OnCampus"
                ${
                  state.housingType === "OnCampus"
                    ? "selected"
                    : ""
                }
              >
                On campus
              </option>

              <option
                value="OffCampus"
                ${
                  state.housingType === "OffCampus"
                    ? "selected"
                    : ""
                }
              >
                Off campus
              </option>
            </select>

            ${
              state.studentPhase === "future"
                ? `
                  <p class="form-help-text">
                    Explore
                    <a
                      href="https://www.uoguelph.ca/housing/apply"
                      target="_blank"
                      rel="noopener"
                    >
                      residence eligibility on the Student Housing website
                    </a>.
                  </p>
                `
                : ""
            }
          </div>

          ${renderOnCampusHousingFields()}

          ${
            isOffCampus
              ? `
                <div class="form-group">
                  <label for="currentOffCampusRent">
                    ${isCurrentStudent ? "Monthly off-campus rent" : "Estimated monthly off-campus rent"}
                  </label>

                  ${renderMoneyInput({
                    id: "currentOffCampusRent",
                    value: state.currentOffCampusRent,
                    placeholder: isCurrentStudent
                      ? "Enter your monthly rent"
                      : "Enter estimated monthly rent"
                  })}

                

                  

                  <p class="form-help-text">
                    Rental prices in the City of Guelph vary
                    based on the size of the unit, the number
                    of bedrooms, amenities, and whether utilities
                    such as heat and hydro are included.
                  </p>
                </div>

                <div class="form-group">
                  <label for="futureMealPlanInterest">
                    ${
                      isCurrentStudent
                        ? "Do you have a meal plan?"
                        : "Would you like to include a meal plan?"
                    }
                    <span class="required-star">*</span>
                  </label>

                  <select
                    id="futureMealPlanInterest"
                    class="step-dropdown"
                  >
                    <option value="">
                      Select Yes or No
                    </option>

                    <option
                      value="Yes"
                      ${
                        state.futureMealPlanInterest === "Yes"
                          ? "selected"
                          : ""
                      }
                    >
                      Yes
                    </option>

                    <option
                      value="No"
                      ${
                        state.futureMealPlanInterest === "No"
                          ? "selected"
                          : ""
                      }
                    >
                      No
                    </option>
                  </select>

                  <p class="form-help-text">
                    Students living off campus can also purchase
                    an Ultra meal plan. Explore additional meal-plan
                    options on the
                    <a
                      href="${escapeHtml(mealPlanInformationLink)}"
                      target="_blank"
                      rel="noopener"
                    >
                      Hospitality Services website
                    </a>.
                  </p>
                </div>
              `
              : ""
          }

          ${
            showMealPlanSelection
              ? `
                <div class="form-group">
                  <label for="mealPlan">
                    ${
                      isCurrentStudent
                        ? "What meal plan do you have?"
                        : "What is your meal-plan preference?"
                    }
                    <span class="required-star">*</span>
                  </label>

                  <select
                    id="mealPlan"
                    class="step-dropdown"
                  >
                    <option value="">
                      ${isCurrentStudent ? "Select your meal plan" : "Select a meal-plan preference"}
                    </option>

                    ${
                      isOnCampus && !mealPlanRequired
                        ? `
                          <option
                            value="None"
                            ${
                              state.mealPlan === "None"
                                ? "selected"
                                : ""
                            }
                          >
                            No meal plan
                          </option>
                        `
                        : ""
                    }

                    ${mealPlanOptions.map(option => `
                      <option
                        value="${escapeHtml(option.value)}"
                        ${
                          state.mealPlan === option.value
                            ? "selected"
                            : ""
                        }
                      >
                        ${escapeHtml(option.label)}
                      </option>
                    `).join("")}
                  </select>

                  <p class="form-help-text">
                    ${
                      isOnCampus && mealPlanRequired
                        ? `
                          A meal plan is required for this residence
                          and room type because kitchen access is not
                          included.
                        `
                        : isOnCampus
                          ? `
                            A meal plan is optional for this residence
                            and room type because kitchen access is
                            available.
                          `
                          : `
                            ${
                              isCurrentStudent
                                ? "Select the meal plan you currently have."
                                : "Select the meal plan you would like to include in your estimate."
                            }
                          `
                    }

                    Review the
                    <a
                      href="${escapeHtml(mealPlanInformationLink)}"
                      target="_blank"
                      rel="noopener"
                    >
                      University of Guelph campus meal plans
                    </a>
                    for more information.
                  </p>
                </div>
              `
              : ""
          }

        </div>
      </div>

      <div class="step-footer">
        <button
          class="btn-secondary"
          id="backStep3"
          type="button"
        >
          Back
        </button>

        <button
          class="btn-primary"
          id="nextStep3"
          type="button"
        >
          Continue to funding
        </button>
      </div>
    </div>
  `;
}
function getOffCampusRentalRows() {
  return (
    state.data?.[
      "Off_campus_Living_Costs_Rental"
    ] || []
  );
}

function getAverageMonthlyOffCampusRent() {
  const monthlyRents =
    getOffCampusRentalRows()
      .map(item =>
        toNumber(
          readField(item, [
            "Monthly Rent",
            "MonthlyRent"
          ])
        )
      )
      .filter(amount =>
        Number.isFinite(amount) &&
        amount > 0
      );

  if (!monthlyRents.length) {
    return 0;
  }

  const total =
    monthlyRents.reduce(
      (sum, amount) =>
        sum + amount,
      0
    );

  return Math.round(
    (total / monthlyRents.length) * 100
  ) / 100;
}

function getOffCampusRentalMonths() {
  /*
    All graduate students use 12 months,
    including Summer-only programs.

    All undergraduate students use 8 months.
  */
  return state.level === "GR"
    ? 12
    : 8;
}




function renderStep4() {
  const isCurrentStudent =
    state.studentPhase === "current";

  const isOntarioDomestic =
    state.residencyType === "Domestic" &&
    state.province === "ON";

  const isNonOntarioDomestic =
    state.residencyType === "Domestic" &&
    state.province === "Non-ON";

  const isInternational =
    state.residencyType === "International";

  const fundingSectionTitle =
    isOntarioDomestic
      ? "OSAP and scholarships"
      : isNonOntarioDomestic
        ? "Student financial assistance and scholarships"
        : "Scholarships and bursaries";

  const fundingSectionDescription =
    isOntarioDomestic
      ? (
          isCurrentStudent
            ? "Add your OSAP funding, University of Guelph scholarships, bursaries and other awards."
            : "Add anticipated OSAP funding, University of Guelph scholarships, bursaries and other awards."
        )
      : isNonOntarioDomestic
        ? "Review federal, provincial or territorial student financial assistance and add your University of Guelph scholarships and bursaries."
        : "Add University of Guelph scholarships, bursaries and other awards that may help with your costs.";

  /*
    Keep Ontario OSAP and outside-Ontario student assistance
    separate so a value cannot carry into the wrong residency path.
  */
  if (!isOntarioDomestic) {
    state.osapFunding = 0;
  }

  if (!isNonOntarioDomestic) {
    state.nonOntarioAidFunding = 0;
  }

  const awardSearchDetails =
    getAwardSearchDetails();
  const defaultPartTimeRate = parseAmountFromText(
    readField(
      state.data?.["Part-Time_earnings"]?.[0] || {},
      ["Part-Time_earnings"]
    )
  ) || 20;

  const coopRange = parseRangeFromText(
    readField(
      state.data?.["Co-op Cost"]?.[0] || {},
      ["Coop Earnings", "Co-op Earnings"]
    )
  );
  const coopWeeklyMidpoint =
    coopRange.low > 0 && coopRange.high > 0
      ? Math.round((coopRange.low + coopRange.high) / 2)
      : 0;

  const DEFAULT_COOP_HOURS_PER_WEEK = 40;

  const coopHourlyMidpoint =
    coopWeeklyMidpoint > 0
      ? Math.round(
          (
            coopWeeklyMidpoint /
            DEFAULT_COOP_HOURS_PER_WEEK
          ) * 100
        ) / 100
      : 0;

  if (state.coopHourlyRate === null) {
    state.coopHourlyRate = coopHourlyMidpoint;
  }

  if (!state.coopHoursPerWeek) {
    state.coopHoursPerWeek =
      DEFAULT_COOP_HOURS_PER_WEEK;
  }
  if (!state.osapFunding) {
    state.osapFunding = 0;
  }

  if (state.studentPhase === "future") {
    if (!state.partTimeHoursPerWeek) {
      state.partTimeHoursPerWeek = 10;
    }

    if (!state.partTimeHourlyRate) {
      state.partTimeHourlyRate = defaultPartTimeRate;
    }
  }

  return `
    <div class="step-container">
      <div class="step-header">
        <p class="section-kicker">Funding and earnings</p>

        <h2 class="step-title">
          ${isCurrentStudent ? "Add your funding and earnings" : "Add potential funding"}
        </h2>

        <p class="step-description">
          ${
            isCurrentStudent
              ? "Include your employment earnings, government assistance, scholarships and other funding that help offset your costs."
              : "Include anticipated employment earnings, government assistance, scholarships and other funding that may help offset your costs."
          }
        </p>
      </div>

      <div class="step-content">
        <div class="form-stack">

          <div class="form-group">
            <h3 class="subsection-title">
              Employment earnings
            </h3>

            <p class="form-help-text">
              ${
                isCurrentStudent
                  ? "Add your earnings from part-time employment or co-op work terms."
                  : "Add potential earnings from part-time employment or co-op work terms."
              }
            </p>
          </div>

          ${
            state.studentPhase === "future"
              ? `
                <div class="form-group">
                  <h4 class="funding-group-title">
                    Potential part-time earnings
                  </h4>

                  <label for="partTimeHoursPerWeek">
                    Hours per week
                  </label>

                  <input
                    id="partTimeHoursPerWeek"
                    class="step-input"
                    type="number"
                    min="0"
                    value="${escapeHtml(state.partTimeHoursPerWeek)}"
                  />


                  <p class="form-help-text">
                    Part-time earnings are calculated using 12 working weeks
                    per semester across Fall and Winter, for 24 weeks in total.
                  </p>
                </div>

                <div class="form-group">
                  <label for="partTimeHourlyRate">
                    Hourly rate (CAD)
                  </label>

                  ${renderMoneyInput({
                    id: "partTimeHourlyRate",
                    value: state.partTimeHourlyRate
                  })}
                </div>
              `
              : `
                <div class="form-group">
                  <label for="partTimeIncome">
                    Yearly part-time income (CAD)
                  </label>

                  ${renderMoneyInput({
                    id: "partTimeIncome",
                    value: state.partTimeIncome,
                    placeholder: "Enter your yearly part-time income"
                  })}
                </div>
              `
          }

          ${
            state.coopInterest === "Yes"
              ? `
                <div class="form-group coop-earnings-section">
                  <h4 class="funding-group-title">
                    ${isCurrentStudent ? "Co-op earnings" : "Potential co-op earnings"}
                  </h4>

                  <p class="form-help-text">
                    This estimate uses one 16-week co-op work term. The hourly
                    wage is pre-filled using the midpoint of the earnings range
                    in the planning data, but you can adjust it.
                  </p>

                  <p class="form-help-text">
                    Review the
                    <a
                      href="${coopSalaryGuideLink}"
                      target="_blank"
                      rel="noopener"
                    >
                      University of Guelph Co-op Salary Guide
                    </a>
                    for more information.
                  </p>

                  ${
                    coopRange.low || coopRange.high
                      ? `
                        <p class="form-help-text">
                          Suggested weekly earnings range:
                          ${formatRangeValue(coopRange.low, coopRange.high)}.
                        </p>
                      `
                      : ""
                  }
                </div>

                <div class="form-group">
                  <label for="coopHourlyRate">
                    ${isCurrentStudent ? "Hourly co-op wage (CAD)" : "Estimated hourly co-op wage (CAD)"}
                  </label>

                  ${renderMoneyInput({
                    id: "coopHourlyRate",
                    value: state.coopHourlyRate,
                    placeholder: isCurrentStudent
                      ? "Enter your hourly wage"
                      : "Enter your estimated hourly wage"
                  })}
                </div>

                <div class="form-group">
                  <label for="coopHoursPerWeek">
                    ${isCurrentStudent ? "Hours per week" : "Expected hours per week"}
                  </label>

                  <input
                    id="coopHoursPerWeek"
                    class="step-input"
                    type="number"
                    min="0"
                    max="80"
                    step="1"
                    value="${escapeHtml(
                      state.coopHoursPerWeek
                    )}"
                  />

                  <p class="form-help-text">
                    ${
                      isCurrentStudent
                        ? "Co-op earnings are calculated using your hourly wage and weekly hours across one 16-week co-op work term."
                        : "Potential earnings are calculated using your hourly wage and expected weekly hours across one 16-week co-op work term. For future students, this amount is shown for planning only and is not deducted from the final estimate."
                    }
                  </p>
                </div>
              `
              : ""
          }

          <div class="form-group funding-section-heading">
            <h3 class="subsection-title">
              ${escapeHtml(fundingSectionTitle)}
            </h3>

            <p class="form-help-text">
              ${escapeHtml(fundingSectionDescription)}
            </p>
          </div>

          ${
            isOntarioDomestic
              ? `
                <div class="form-group">
                  <label for="osapFunding">
                    ${isCurrentStudent ? "OSAP funding (CAD)" : "Anticipated OSAP funding (CAD)"}
                  </label>

                  ${renderMoneyInput({
                    id: "osapFunding",
                    value: state.osapFunding,
                    placeholder: isCurrentStudent
                      ? "Enter your OSAP funding"
                      : "Enter anticipated OSAP funding"
                  })}

                  <p class="form-help-text">
                    Use the
                    <a
                      href="${osapLink}"
                      target="_blank"
                      rel="noopener"
                    >
                      OSAP website and aid estimator
                    </a>
                    to estimate the amount you may receive.
                  </p>
                </div>
              `
              : ""
          }

          ${
            isNonOntarioDomestic
              ? `
                <div class="international-funding-tip">
                  <h3>Student financial assistance outside Ontario</h3>

                  <p>
                    Use the federal estimator to explore federal student
                    financial assistance. Provincial and territorial student-aid
                    programs vary by where you live, so also review the program
                    for your home province or territory.
                  </p>

                  <p>
                    <a
                      href="${federalStudentAidEstimatorLink}"
                      target="_blank"
                      rel="noopener"
                    >
                      Federal Student Financial Assistance Estimator
                    </a>
                  </p>

                  <p>
                    <a
                      href="${provincialTerritorialStudentAidLink}"
                      target="_blank"
                      rel="noopener"
                    >
                      Provincial and territorial student aid information
                    </a>
                  </p>
                </div>

                <div class="form-group">
                  <label for="nonOntarioAidFunding">
                    ${
                      isCurrentStudent
                        ? "Student financial assistance amount (CAD)"
                        : "Anticipated student financial assistance (CAD)"
                    }
                  </label>

                  ${renderMoneyInput({
                    id: "nonOntarioAidFunding",
                    value: state.nonOntarioAidFunding,
                    placeholder: isCurrentStudent
                      ? "Enter your student financial assistance amount"
                      : "Enter the amount you calculated"
                  })}

                  <p class="form-help-text">
                    ${
                      isCurrentStudent
                        ? "Enter the federal, provincial or territorial student assistance amount you receive or expect to receive."
                        : "Enter the federal, provincial or territorial student assistance amount you calculated using the resources above."
                    }
                  </p>
                </div>
              `
              : ""
          }

          <div class="form-group">
            <label for="otherScholarshipOffset">
              ${isCurrentStudent ? "Scholarships and bursaries (CAD)" : "Anticipated scholarships and bursaries (CAD)"}
            </label>

            ${renderMoneyInput({
              id: "otherScholarshipOffset",
              value: state.otherScholarshipOffset,
              placeholder: isCurrentStudent
                ? "Enter your yearly scholarships and bursaries"
                : "Enter anticipated yearly scholarships and bursaries"
            })}

            <p class="form-help-text">
              ${
                isCurrentStudent
                  ? "Include your University of Guelph scholarships, bursaries and other awards."
                  : "Include anticipated University of Guelph scholarships, bursaries and other awards."
              }
              Browse the
              <a
                href="${escapeHtml(awardSearchDetails.link)}"
                target="_blank"
                rel="noopener"
              >
                ${escapeHtml(awardSearchDetails.label)}
              </a>
              to explore available funding.
            </p>
          </div>

          ${
            state.studentPhase === "current"
              ? `
                <div class="form-group">
                  <label for="familySupport">
                    Family support or savings (CAD)
                  </label>

                  ${renderMoneyInput({
                    id: "familySupport",
                    value: state.familySupport,
                    placeholder: "Enter family support, savings or other funding"
                  })}
                </div>
              `
              : ""
          }

          ${
            isInternational
              ? `
                <div class="international-funding-tip">
                  <h3>Looking for more ways to fund your education?</h3>

                  <p>
                    Check out more tips and strategies for planning and funding
                    your University of Guelph education.
                  </p>

                  <a
                    href="${internationalFundingTipsLink}"
                    target="_blank"
                    rel="noopener"
                  >
                    Explore international student funding tips
                  </a>
                </div>
              `
              : ""
          }



        </div>
      </div>

      <div class="step-footer">
        <button
          class="btn-secondary"
          id="backStep4"
          type="button"
        >
          Back
        </button>

        <button
          class="btn-primary"
          id="nextStep4"
          type="button"
        >
          Build estimate
        </button>
      </div>
    </div>
  `;
}
function renderOffCampusExpenseGuide() {
  const rows =
    state.data?.["Off_campus_Living_Costs"] || [];

  if (!rows.length) return "";

  return `
    <details class="housing-guide-card off-campus-guide">
      <summary>
        <span class="housing-guide-summary-title">
          Typical off-campus living costs
        </span>

        <span class="housing-guide-summary-note">
          Planning information
        </span>
      </summary>

      <div class="housing-guide-body">
        <p class="form-help-text off-campus-guide-note">
          These typical costs are provided for planning purposes
          and are not automatically added to the estimate above.
        </p>

        <div class="off-campus-cost-table">
          <div class="off-campus-cost-header">
            <span>Expense</span>
            <span>Semester</span>
            <span>Year</span>
          </div>

          ${rows.map(item => {
            const expense = readField(
              item,
              ["Expense"]
            );

            const semesterCost = readField(
              item,
              ["Costs by Semester"]
            );

            const yearlyCost = readField(
              item,
              ["Costs by Year"]
            );

            return `
              <div class="off-campus-cost-row">
                <span class="off-campus-expense-name">
                  ${escapeHtml(expense)}
                </span>

                <span class="off-campus-semester-cost">
                  ${escapeHtml(
                    semesterCost || "Not available"
                  )}
                </span>

                <strong class="off-campus-yearly-cost">
                  ${escapeHtml(
                    yearlyCost || "Not available"
                  )}
                </strong>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    </details>
  `;
}
function renderFeedbackCard() {
  return `
    <div class="feedback-card">
      <div class="feedback-card-icon">💬</div>

      <div class="feedback-card-content">
        <h3>Help us make this tool better!</h3>
        <p>Your feedback helps us improve the estimator for future students.</p>
      </div>

      <a
        class="feedback-card-link"
        href="${escapeHtml(feedbackFormLink)}"
        target="_blank"
        rel="noopener"
      >
        Share feedback 
      </a>
    </div>
  `;
}

function getOnCampusResidenceGroups() {
  const rows =
    state.data?.["On_campus_Living_Costs"] || [];

  const groups = new Map();

  rows.forEach(item => {
    const residenceArea = normalize(
      readField(item, [
        "ResidenceArea",
        "Residence Area"
      ])
    );

    const roomType = normalize(
      readField(item, [
        "RoomType",
        "Room Type"
      ])
    );

    const deposit = toNumber(
      readField(item, ["Deposit"])
    );

    const fallCost = toNumber(
      readField(item, [
        "Fall Term",
        "FallTerm"
      ])
    );

    const winterCost = toNumber(
      readField(item, [
        "Winter Term",
        "WinterTerm"
      ])
    );

    const yearlyCost = toNumber(
      readField(item, ["Cost"])
    );

    if (!residenceArea || !roomType || yearlyCost <= 0) {
      return;
    }

    if (!groups.has(residenceArea)) {
      groups.set(residenceArea, []);
    }

    groups.get(residenceArea).push({
      roomType,
      deposit,
      fallCost,
      winterCost,
      yearlyCost
    });
  });

  return [...groups.entries()]
    .map(([residenceArea, options]) => {
      options.sort(
        (a, b) => a.yearlyCost - b.yearlyCost
      );

      const yearlyCosts = options
        .map(option => option.yearlyCost)
        .filter(value => value > 0);

      return {
        residenceArea,
        options,
        low: Math.min(...yearlyCosts),
        high: Math.max(...yearlyCosts)
      };
    })
    .sort((a, b) =>
      a.residenceArea.localeCompare(b.residenceArea)
    );
}

function renderOnCampusResidenceGuide() {
  const groups = getOnCampusResidenceGroups();

  if (!groups.length) return "";

  return `
    <details class="housing-guide-card">
      <summary>
        <span class="housing-guide-summary-title">
          On-campus residence cost guide
        </span>

        <span class="housing-guide-summary-note">
          ${groups.length} residence areas
        </span>
      </summary>

      <div class="housing-guide-body">
        <p class="form-help-text">
          Expand a residence to compare available room types.
          Amounts below are planning estimates.
        </p>

        <div class="housing-guide-table housing-guide-header">
          <span>Residence</span>
          <span>Yearly range</span>
        </div>

        <div class="residence-group-list">
          ${groups.map(group => `
            <details class="residence-group">
              <summary>
                <span class="residence-summary-left">
                  <span class="residence-expand-icon"></span>

                  <span class="residence-name">
                    ${escapeHtml(group.residenceArea)}
                  </span>
                </span>

                <strong class="residence-range">
                  ${formatRangeValue(
                    group.low,
                    group.high
                  )}
                </strong>
              </summary>

              <div class="residence-option-table">
                <div class="residence-option-header">
                  <span>Room type</span>
                  <span>Fall</span>
                  <span>Winter</span>
                  <span>Yearly</span>
                </div>

                ${group.options.map(option => `
                  <div class="residence-option-row">
                    <span>
                      ${escapeHtml(option.roomType)}
                    </span>

                    <span>
                      ${formatMoney(option.fallCost)}
                    </span>

                    <span>
                      ${formatMoney(option.winterCost)}
                    </span>

                    <strong>
                      ${formatMoney(option.yearlyCost)}
                    </strong>
                  </div>
                `).join("")}
              </div>
            </details>
          `).join("")}
        </div>

        <p class="form-help-text housing-guide-deposit-note">
          A residence deposit may also apply. Deposit amounts are
          not included in the room prices shown above unless already
          included in the source data.
        </p>
      </div>
    </details>
  `;
}


function renderMealPlanGuide() {
  const rows =
    state.data?.["Meal_Plan"] || [];

  const plans = rows
    .map(item => {
      const name = normalize(
        readField(item, [
          "Meal Plan Size",
          "MealPlanSize"
        ])
      );

      const fallCost = toNumber(
        readField(item, [
          "Semesterly cost (Fall)",
          "Semester cost (Fall)",
          "Fall Term",
          "Fall cost",
          "Fall Cost"
        ])
      );

      const winterCost = toNumber(
        readField(item, [
          "Semesterly cost (Winter)",

          "Semester cost (Winter)",
          "Winter Term",
          "Winter cost",
          "Winter Cost"
        ])
      );

      const yearlyCost = toNumber(
        readField(item, [
          "Total cost per year",
          "TotalCostPerYear"
        ])
      );

      if (!name || yearlyCost <= 0) {
        return null;
      }

      return {
        name,
        fallCost,
        winterCost,
        yearlyCost
      };
    })
    .filter(Boolean)
    .sort((a, b) =>
      a.yearlyCost - b.yearlyCost
    );

  if (!plans.length) return "";

  return `
    <details class="housing-guide-card meal-plan-guide-card">
      <summary>
        <span class="housing-guide-summary-title">
          Meal plan cost guide
        </span>

        <span class="housing-guide-summary-note">
          ${plans.length} options
        </span>
      </summary>

      <div class="housing-guide-body">
        <p class="form-help-text">
          Compare available meal plans and their estimated costs.
        </p>

        <div class="meal-plan-table">
          <div class="meal-plan-header">
            <span>Meal plan</span>
            <span>Fall</span>
            <span>Winter</span>
            <span>Yearly</span>
          </div>

          ${plans.map(plan => `
            <div class="meal-plan-row">
              <span>
                ${escapeHtml(plan.name)}
              </span>

              <span>
                ${formatMoney(plan.fallCost)}
              </span>

              <span>
                ${formatMoney(plan.winterCost)}
              </span>

              <strong>
                ${formatMoney(plan.yearlyCost)}
              </strong>
            </div>
          `).join("")}
        </div>
      </div>
    </details>
  `;
}

function renderStep5() {
  const result = state.result || emptyResult();
  const periodDetails =
    getEstimatePeriodDetails();
  const showOnCampusGuide =
    state.housingType === "OnCampus";

  const showMealPlanGuide =
    Boolean(state.mealPlan) &&
    state.mealPlan !== "None";

  return `
    <div class="step-container">

      <div class="step-header">
        <p class="section-kicker">
          ${escapeHtml(
            periodDetails.summaryKicker
          )}
        </p>

        <h2 class="step-title">
          Review your estimate
        </h2>

        <p class="step-description">
          ${escapeHtml(
            periodDetails.description
          )}

          ${
            state.level === "GR" &&
            !isGraduateSummerOnlyProgram()
              ? `
                Tuition and compulsory fees include
                all three graduate semesters.
              `
              : ""
          }
        </p>
      </div>

      <div class="step-content">

        

        <div class="estimate-total-card">
          <span class="estimate-total-label">
            ${escapeHtml(
              periodDetails.totalLabel
            )}
          </span>

          <strong>
            ${formatRangeValue(result.low, result.high)}
          </strong>

          ${getConvertedRangeText(result.low, result.high)}
        </div>

        <div class="cost-summary">

          ${renderBreakdownRows(
            "Tuition and compulsory fees",
            result.tuition.items,
            false,
            state.major
              ? `${state.major} (${state.program})`
              : state.program || ""
          ).join("")}

          ${renderBreakdownRows(
            "Living costs",
            result.living.items
          ).join("")}

          ${renderBreakdownRows(
            "Extra costs",
            result.extras.items
          ).join("")}

          ${renderBreakdownRows(
            "Funding and offsets",
            result.offsets.items,
            true
          ).join("")}

        </div>

        

        ${renderFutureEarningsSummary()}

        <div class="cost-summary cost-chart-card">
          <div class="summary-section-heading">
            <h3>Estimated cost breakdown</h3>

            <p>
              Percentage of estimated costs by category
            </p>
          </div>

          <div class="cost-chart-layout">
            <div
              class="cost-chart-legend"
              id="costBreakdownLegend"
              aria-label="Cost breakdown categories"
            ></div>

            <div class="cost-chart-canvas">
              <canvas id="costBreakdownChart"></canvas>
            </div>
          </div>

          <p
            class="form-help-text"
            id="largestCostDriverText"
          ></p>
        </div>

        ${
          state.studentPhase === "future"
            ? renderFutureContactSection()
            : ""
        }

      </div>

      <div
        class="step-footer"
        style="flex-wrap:wrap;"
      >
        <button
          class="btn-secondary"
          id="backStep5"
          type="button"
        >
          Back
        </button>
        <button
          class="btn-secondary"
          id="startAgainBtn"
          type="button"
        >
          Start again
        </button>
        <button
          class="btn-gold"
          id="downloadEstimateBtn"
          type="button"
        >
          Download estimate
        </button>

        ${
          state.studentPhase === "future"
            ? `
              <button
                class="btn-primary"
                id="emailEstimateBtn"
                type="button"
              >
                Get estimate by email
              </button>
            `
            : ""
        }
      </div>

      ${renderFeedbackCard()}

    </div>
  `;
}

let costBreakdownChart = null;

function getCostBreakdownChartData() {
  const result = state.result || emptyResult();
  const rows = [];

  function addItems(items) {
    items.forEach(item => {
      const value =
        item.low !== undefined && item.high !== undefined
          ? (Number(item.low) + Number(item.high)) / 2
          : Number(item.value) || 0;

      if (value > 0) {
        rows.push({
          label: item.label,
          value
        });
      }
    });
  }

  addItems(result.tuition.items || []);
  addItems(result.living.items || []);
  addItems(result.extras.items || []);

  return rows;
}

const pieBorderPlugin = {
  id: "pieBorder",
  afterDraw(chart) {
    const meta = chart.getDatasetMeta(0);
    if (!meta.data.length) return;

    const arc = meta.data[0];
    const { ctx } = chart;

    ctx.save();
    ctx.beginPath();
    ctx.arc(arc.x, arc.y, arc.outerRadius + 2, 0, Math.PI * 2);
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#000000";
    ctx.stroke();
    ctx.restore();
  }
};

function renderCostBreakdownChart() {
  const canvas =
    document.getElementById("costBreakdownChart");

  const legendContainer =
    document.getElementById("costBreakdownLegend");

  if (
    !canvas ||
    !legendContainer ||
    typeof Chart === "undefined"
  ) {
    return;
  }

  const rows = getCostBreakdownChartData();

  if (!rows.length) {
    legendContainer.innerHTML = "";
    return;
  }

  const labels =
    rows.map(row => row.label);

  const values =
    rows.map(row => row.value);

  const total = values.reduce(
    (sum, value) => sum + value,
    0
  );

  const uogColors = [
    "#e51937",
    "#ffc429",
    "#187bb4",
    "#318738",
    "#000000",
    "#555555",
    "#b3142c",
    "#135f8b",
    "#27682c"
  ];

  legendContainer.innerHTML = `
    <ul class="cost-chart-legend-list">
      ${rows.map((row, index) => `
        <li class="cost-chart-legend-item">
          <span
            class="cost-chart-legend-colour"
            style="background-color:${
              uogColors[index % uogColors.length]
            };"
            aria-hidden="true"
          ></span>

          <span>
            ${escapeHtml(row.label)}
          </span>
        </li>
      `).join("")}
    </ul>
  `;

  const largest = rows.reduce(
    (max, row) =>
      row.value > max.value ? row : max,
    rows[0]
  );

  const driverText =
    document.getElementById(
      "largestCostDriverText"
    );

  if (driverText && total > 0) {
    const percentage =
      (
        (largest.value / total) *
        100
      ).toFixed(1);

    driverText.textContent =
      `Largest cost driver: ${largest.label} at ` +
      `${formatMoney(largest.value)} ` +
      `(${percentage}% of estimated costs).`;
  }

  if (costBreakdownChart) {
    costBreakdownChart.destroy();
  }

  costBreakdownChart = new Chart(canvas, {
    type: "doughnut",

    data: {
      labels,

      datasets: [
        {
          data: values,
          backgroundColor: uogColors,
          borderColor: "#ffffff",
          borderWidth: 2
        }
      ]
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "58%",

      layout: {
        padding: 8
      },

      plugins: {
        /*
          The accessible HTML legend is rendered above,
          so the canvas legend is disabled.
        */
        legend: {
          display: false
        },

        tooltip: {
          callbacks: {
            label(context) {
              const value =
                context.raw || 0;

              const percentage =
                total > 0
                  ? (
                      (value / total) *
                      100
                    ).toFixed(1)
                  : 0;

              return (
                `${context.label}: ` +
                `${formatMoney(value)} ` +
                `(${percentage}%)`
              );
            }
          }
        }
      }
    }
  });
}




function renderFutureEarningsSummary() {
  if (
    state.studentPhase !== "future" ||
    state.coopInterest !== "Yes"
  ) {
    return "";
  }

  const hourlyRate =
    toNumber(state.coopHourlyRate);

  const hoursPerWeek =
    toNumber(state.coopHoursPerWeek);

  const COOP_WEEKS_PER_WORK_TERM = 16;

  const workTermEarnings =
    hourlyRate *
    hoursPerWeek *
    COOP_WEEKS_PER_WORK_TERM;

  if (workTermEarnings <= 0) {
    return "";
  }

  return `
    <div class="cost-summary potential-coop-summary">
      <div class="summary-section-heading">
        <h3>
          Potential co-op earnings
        </h3>

        <p>
          Estimated earnings for one 16-week work term
        </p>
      </div>

      <div class="summary-item">
        <div class="summary-item-label">
          <span>
            Potential co-op earnings
          </span>

          <small>
            Based on
            ${formatMoney(hourlyRate)}
            per hour and
            ${escapeHtml(hoursPerWeek)}
            hours per week
          </small>
        </div>

        <div class="potential-coop-value">
          ${formatMoney(workTermEarnings)}
        </div>
      </div>

      <p class="coop-not-included-note">
        This potential income is shown for planning
        only and is not included in your final estimate.

        <a
          href="${coopSalaryGuideLink}"
          target="_blank"
          rel="noopener"
        >
          View the University of Guelph Co-op Salary Guide.
        </a>
      </p>
    </div>
  `;
}
function bindRenderedEvents() {
  bindStep0Events();
  bindStep1Events();
  bindStep2Events();
  bindStep3Events();
  bindStep4Events();
  bindStep5Events();
}
function bindCampusCarouselEvents() {
  const carousel = document.querySelector("[data-carousel]");
  if (!carousel) return;

  const slides = Array.from(carousel.querySelectorAll("[data-carousel-slide]"));
  const prevBtn = carousel.querySelector("[data-carousel-prev]");
  const nextBtn = carousel.querySelector("[data-carousel-next]");

  if (!slides.length) return;

  let currentIndex = slides.findIndex(slide => slide.classList.contains("active"));
  if (currentIndex < 0) currentIndex = 0;

  function showSlide(index) {
    currentIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("active", slideIndex === currentIndex);
    });
  }

  if (prevBtn) {
    prevBtn.onclick = () => {
      showSlide(currentIndex - 1);
    };
  }

  if (nextBtn) {
    nextBtn.onclick = () => {
      showSlide(currentIndex + 1);
    };
  }

  if (slides.length <= 1) {
    if (prevBtn) prevBtn.style.display = "none";
    if (nextBtn) nextBtn.style.display = "none";
  }
}
function bindStep0Events() {
  if (state.currentStep !== 0) {
    return;
  }

  const cards = document.querySelectorAll(
    ".welcome-choice-row [data-value]"
  );

  cards.forEach(card => {
    card.onclick = () => {
      const selectedValue =
        card.dataset.value || "";

      if (
        selectedValue !== "future" &&
        selectedValue !== "current"
      ) {
        return;
      }

      state.studentPhase =
        selectedValue;

      state.currentStep = 1;

      renderCurrentStep();
    };
  });
}

function bindStep1Events() {
  if (state.currentStep !== 1) return;

  const studentPhase = document.getElementById("studentPhase");
  const livingInCanada = document.getElementById("livingInCanada");
  const canadaRegion = document.getElementById("canadaRegion");
  const country = document.getElementById("country");
  const canadianCitizen = document.getElementById("canadianCitizen");
  const residencyType = document.getElementById("residencyType");
  const province = document.getElementById("province");
  const level = document.getElementById("level");
  const nextBtn = document.getElementById("nextStep1");

  if (studentPhase) {
    studentPhase.onchange = e => {
      state.studentPhase = e.target.value;

      state.livingInCanada = "";
      state.canadaRegion = "";
      state.country = "";
      state.canadianCitizen = "";
      state.residencyType = "";
      state.province = "";
      state.level = "";

      state.currencyCode = "";
      state.currencyRate = null;
      state.currencyError = "";

      resetProgramPathState();
      resetFundingSelections();
      renderCurrentStep();
    };
  }

  if (livingInCanada) {
    livingInCanada.onchange = e => {
      state.livingInCanada = e.target.value;

      state.canadaRegion = "";
      state.country = "";
      state.currencyCode = "";
      state.currencyRate = null;
      state.currencyError = "";

      deriveFutureResidency();
      resetProgramPathState();
      clearErrors();
      renderCurrentStep();
    };
  }

  if (canadaRegion) {
    canadaRegion.onchange = e => {
      state.canadaRegion = e.target.value;

      deriveFutureResidency();
      resetProgramPathState();
      clearErrors();
    };
  }

  if (country) {
    country.onchange = async e => {
      state.country = e.target.value;

      clearErrors();

      if (state.country) {
        await updateCurrencyConversion();
      }
    };
  }

  if (canadianCitizen) {
    canadianCitizen.onchange = e => {
      state.canadianCitizen = e.target.value;

      deriveFutureResidency();
      resetProgramPathState();
      resetFundingSelections();
      clearErrors();
    };
  }

  if (residencyType) {
    residencyType.onchange = e => {
      state.residencyType = e.target.value;

      if (state.residencyType === "International") {
        state.province = "INT";
      } else {
        state.province = "";
      }

      resetProgramPathState();
      resetFundingSelections();
      clearErrors();
      renderCurrentStep();
    };
  }

  if (province) {
    province.onchange = e => {
      state.province = e.target.value;

      resetProgramPathState();
      clearErrors();
    };
  }

  if (level) {
    level.onchange = e => {
      state.level = e.target.value;

      resetProgramPathState();
      clearErrors();

      if (state.level === "GR") {
        state.campus = "University of Guelph";
      }
    };
  }

  if (nextBtn) {
    nextBtn.onclick = async () => {
      clearErrors();

      /*
        Read every visible field directly before validation.
        This prevents the dropdown from displaying a value while
        the matching state value is still empty.
      */
      if (studentPhase) {
        state.studentPhase = studentPhase.value;
      }

      if (livingInCanada) {
        state.livingInCanada = livingInCanada.value;
      }

      if (canadaRegion) {
        state.canadaRegion = canadaRegion.value;
      }

      if (country) {
        state.country = country.value;
      }

      if (canadianCitizen) {
        state.canadianCitizen = canadianCitizen.value;
      }

      if (residencyType) {
        state.residencyType = residencyType.value;
      }

      if (province) {
        state.province = province.value;
      }

      if (level) {
        state.level = level.value;
      }

      let hasError = false;

      if (!state.studentPhase) {
        markError(studentPhase, "Required");
        hasError = true;
      }

      if (state.studentPhase === "future") {
        if (!state.livingInCanada) {
          markError(livingInCanada, "Required");
          hasError = true;
        }

        if (
          state.livingInCanada === "Yes" &&
          !state.canadaRegion
        ) {
          markError(canadaRegion, "Required");
          hasError = true;
        }

        if (
          state.livingInCanada === "No" &&
          !state.country
        ) {
          markError(country, "Required");
          hasError = true;
        }

        if (!state.canadianCitizen) {
          markError(canadianCitizen, "Required");
          hasError = true;
        }

        deriveFutureResidency();
      }

      if (state.studentPhase === "current") {
        if (!state.residencyType) {
          markError(residencyType, "Required");
          hasError = true;
        }

        if (
          state.residencyType === "Domestic" &&
          !state.province
        ) {
          markError(province, "Required");
          hasError = true;
        }

        if (state.residencyType === "International") {
          state.province = "INT";
        }

      }

      if (!state.level) {
        markError(level, "Required");
        hasError = true;
      }

      if (hasError) return;

      if (
        state.studentPhase === "future" &&
        state.livingInCanada === "No" &&
        state.country
      ) {
        await updateCurrencyConversion();
      }

      resetProgramPathState();

      state.currentStep = 2;
      renderCurrentStep();
    };
  }
}

function getSelectedCurrencyCode() {
  if (!state.country) return "";
  return COUNTRY_CURRENCY[state.country] || "";
}


async function updateCurrencyConversion() {
  const currency = getSelectedCurrencyCode();

  state.currencyCode = currency;
  state.currencyRate = null;
  state.currencyError = "";

  if (!currency || currency === "CAD") return;

  try {
    state.currencyLoading = true;

    const res = await fetch(
      "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/cad.json"
    );

    if (!res.ok) {
      throw new Error("Currency data unavailable.");
    }

    const data = await res.json();

    const rates = data?.cad || {};

    const rate = rates[currency.toLowerCase()];

    if (!rate) {
      throw new Error("Currency not supported.");
    }

    state.currencyRate = Number(rate);

  } catch (err) {
    console.warn("Currency conversion unavailable:", err);
    state.currencyError =
      "Exchange estimate is not available for this currency yet.";
  } finally {
    state.currencyLoading = false;
  }
}
function renderCurrencyBadge() {
  if (!state.country) return "";

  const currency = getSelectedCurrencyCode();

  if (!currency) {
    return renderAlert(
      "Currency conversion unavailable",
      "Currency conversion is not available for this country yet. Estimate will remain in CAD.",
      "blue"
    );
  }

  if (currency === "CAD") {
    return renderAlert(
      "Currency",
      "Estimate will be shown in CAD.",
      "grey"
    );
  }

  if (state.currencyLoading) {
    return renderAlert(
      "Loading exchange rate",
      `Loading ${escapeHtml(currency)} exchange estimate...`,
      "grey"
    );
  }

  if (state.currencyError) {
    return renderAlert(
      "Currency conversion unavailable",
      `${escapeHtml(state.currencyError)} Estimate will remain in CAD.`,
      "red"
    );
  }

  if (state.currencyRate) {
    return `
      <div class="currency-badge">
        Approximate estimate available in ${escapeHtml(currency)}
      </div>
    `;
  }

  return "";
}

function renderCampusChoices() {
  const isGraduate =
    state.level === "GR";

  const campusChoices = [
    {
      value: "University of Guelph",
      title: "University of Guelph",
      image: "./UGD_img/UOFG1.jpg"
    },
    {
      value: "Ridgetown Campus",
      title: "Ridgetown Campus",
      image: "./Ridegtown_img/Rgd3.jpg"
    },
    {
      value: "University of Guelph-Humber",
      title: "University of Guelph-Humber",
      image: "./Gh_img/GH1.jpg"
    }
  ];

  return `
    <div class="form-group">
      <div class="campus-choice-heading">
        Campus <span class="required-star">*</span>
      </div>

      <p class="form-help-text">
        ${
          isGraduate
            ? "Graduate tuition information is currently available for the University of Guelph campus."
            : "Select the campus you are interested in attending."
        }
      </p>

      <div
        id="campusChoices"
        class="campus-choice-grid"
        role="radiogroup"
        aria-label="Select a campus"
      >
        ${campusChoices.map(campus => {
          const isAvailable =
            !isGraduate ||
            campus.value ===
              "University of Guelph";

          const isSelected =
            state.campus === campus.value;

          return `
            <button
              type="button"
              class="
                campus-choice-card
                ${isSelected ? "selected" : ""}
                ${!isAvailable ? "unavailable" : ""}
              "
              data-campus-value="${escapeHtml(campus.value)}"
              role="radio"
              aria-checked="${isSelected}"
              aria-disabled="${!isAvailable}"
              ${!isAvailable ? "disabled" : ""}
            >
              <span class="campus-choice-title">
                ${escapeHtml(campus.title)}
              </span>

              <span class="campus-choice-image-wrap">
                <img
                  class="campus-choice-image"
                  src="${escapeHtml(campus.image)}"
                  alt="${escapeHtml(campus.title)} campus"
                />
              </span>

              ${
                !isAvailable
                  ? `
                    <span class="campus-unavailable-text">
                      Not currently available
                    </span>
                  `
                  : ""
              }
            </button>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

function markError(el, message = "") {
  if (!el) return;

  el.classList.add("input-error");

  // remove old error text if exists
  const existing = el.parentElement.querySelector(".error-text");
  if (existing) existing.remove();

  if (message) {
    const msg = document.createElement("div");
    msg.className = "error-text";
    msg.innerText = message;
    el.parentElement.appendChild(msg);
  }
}

function clearErrors() {
  document.querySelectorAll(".input-error").forEach(el => {
    el.classList.remove("input-error");
  });

  document.querySelectorAll(".error-text").forEach(el => el.remove());
}
function formatCurrency(value, currency) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
    currencyDisplay: "code",
    maximumFractionDigits: 0
  }).format(Number(value) || 0);
}

function getConvertedRangeText(low, high) {
  if (!state.currencyCode || state.currencyCode === "CAD" || !state.currencyRate) {
    return "";
  }

  const convertedLow = low * state.currencyRate;
  const convertedHigh = high * state.currencyRate;

  const text =
    convertedLow === convertedHigh
      ? formatCurrency(convertedLow, state.currencyCode)
      : `${formatCurrency(convertedLow, state.currencyCode)} - ${formatCurrency(convertedHigh, state.currencyCode)}`;

  return `
    <div style="font-size:14px; margin-top:6px; opacity:0.8;">
      Approx. ${text} ${escapeHtml(state.currencyCode)}
    </div>
  `;
}

function bindStep2Events() {
  if (state.currentStep !== 2) {
    return;
  }

  const cohortYear =
    document.getElementById("cohortYear");

  const currentStartTerm =
    document.getElementById("currentStartTerm");

  const classification =
    document.getElementById("classification");

  const campusChoices =
    document.getElementById("campusChoices");

  const campusChoiceButtons =
    document.querySelectorAll(
      "[data-campus-value]"
    );

  const program =
    document.getElementById("program");

  const coopInterest =
    document.getElementById("coopInterest");

  const estimateScopeButtons =
    document.querySelectorAll(
      "[data-estimate-scope]"
    );

  const back =
    document.getElementById("backStep2");

  const next =
    document.getElementById("nextStep2");

  /*
    Save a selected program and its optional major.
  */
  function applyProgramSelection(
    selectedValue
  ) {
    state.program = "";
    state.major = "";
    state.matchedTuitionRecord = null;

    state.coopInterest = "No";
    state.includeCoop = false;
    state.includeCoopEarnings = false;
    state.coopEarningsOffset = 0;

    if (!selectedValue) {
      if (state.level === "GR") {
        state.campus = "";
      }

      return;
    }

    const separatorIndex =
      selectedValue.indexOf("|||");

    if (separatorIndex >= 0) {
      state.program =
        selectedValue
          .slice(0, separatorIndex)
          .trim();

      state.major =
        selectedValue
          .slice(separatorIndex + 3)
          .trim();
    } else {
      state.program =
        selectedValue.trim();

      state.major = "";
    }

    /*
      Graduate programs currently use only
      the University of Guelph campus.
    */
    if (
      state.level === "GR" &&
      state.program
    ) {
      state.campus =
        "University of Guelph";
    }
  }

  /*
    Expected start year or graduate start term.
  */
  if (cohortYear) {
    cohortYear.onchange = event => {
      state.cohortYear =
        event.target.value;

      state.matchedTuitionRecord = null;

      clearErrors();
      renderCurrentStep();
    };
  }

  /*
    Current students choose a readable start term such as Fall 2021.
    The option also carries its underlying cohort (2021-2022), which
    is what the tuition matching logic already uses.
  */
  if (currentStartTerm) {
    currentStartTerm.onchange = event => {
      const selectedValue =
        event.target.value;

      state.currentStartTerm =
        selectedValue;

      const selectedOption =
        getCurrentStartTermOptions()
          .find(option =>
            option.value === selectedValue
          );

      state.cohortYear =
        selectedOption?.cohortYear || "";

      state.program = "";
      state.major = "";
      state.classification = "";
      state.campus = "";
      state.matchedTuitionRecord = null;

      state.coopInterest = "No";
      state.includeCoop = false;
      state.includeCoopEarnings = false;
      state.coopEarningsOffset = 0;

      clearErrors();
      renderCurrentStep();
    };
  }

  /*
    Graduate classification.
  */
  if (classification) {
    classification.onchange = event => {
      state.classification =
        event.target.value;

      /*
        Clear the old program when moving from
        Master’s to Doctoral / PhD or Diploma.
      */
      state.program = "";
      state.major = "";
      state.campus = "";
      state.matchedTuitionRecord = null;

      state.coopInterest = "No";
      state.includeCoop = false;
      state.includeCoopEarnings = false;
      state.coopEarningsOffset = 0;

      clearErrors();

      /*
        Re-render the program dropdown using the
        newly selected classification.
      */
      renderCurrentStep();
    };
  }

  /*
    Campus selection.
  */
  campusChoiceButtons.forEach(button => {
    button.onclick = () => {
      if (button.disabled) {
        return;
      }

      /*
        Clicking the graduate Guelph campus
        must not clear the graduate program.
      */
      if (state.level === "GR") {
        state.campus =
          "University of Guelph";

        clearErrors();
        return;
      }

      /*
        Existing undergraduate behaviour.
      */
      state.campus =
        button.dataset.campusValue || "";

      state.program = "";
      state.major = "";
      state.matchedTuitionRecord = null;

      state.coopInterest = "No";
      state.includeCoop = false;
      state.includeCoopEarnings = false;
      state.coopEarningsOffset = 0;

      clearErrors();
      renderCurrentStep();
    };
  });

  /*
    Program selection.
  */
  if (program) {
    program.onchange = event => {
      applyProgramSelection(
        event.target.value
      );

      clearErrors();

      const coopStatus =
        getFutureProgramCoopStatus();

      const mandatoryCoop =
        state.level === "UG" &&
        isMandatoryCoopProgram();

      if (
        mandatoryCoop ||
        coopStatus === "Yes"
      ) {
        state.coopInterest = "Yes";
        state.includeCoop = true;
      } else {
        state.coopInterest = "No";
        state.includeCoop = false;
        state.includeCoopEarnings = false;
      }

      renderCurrentStep();
    };
  }

  /*
    Co-op selection.
  */
  if (coopInterest) {
    coopInterest.onchange = event => {
      state.coopInterest =
        event.target.value;

      state.includeCoop =
        state.coopInterest === "Yes";

      if (
        state.coopInterest !== "Yes"
      ) {
        state.coopEarningsOffset = 0;
        state.includeCoopEarnings = false;
      }

      updateRunningEstimate();
    };
  }

  /*
    Full estimate or tuition-only estimate.
  */
  estimateScopeButtons.forEach(button => {
    button.onclick = () => {
      const selectedScope =
        button.dataset.estimateScope;

      if (
        selectedScope !== "full" &&
        selectedScope !== "tuition-only"
      ) {
        return;
      }

      state.estimateScope =
        selectedScope;

      if (
        state.estimateScope ===
        "tuition-only"
      ) {
        state.booksAmount = 0;
        state.personalAmount = 0;
        state.osapFunding = 0;
        state.nonOntarioAidFunding = 0;
        state.otherScholarshipOffset = 0;
        state.scholarshipOffset = 0;
        state.selectedScholarshipKeys = [];
        state.partTimeIncome = 0;
        state.includePartTimeEarnings = false;
        state.includeCoopEarnings = false;
        state.coopEarningsOffset = 0;
        state.familySupport = 0;

        state.housingType = "";
        state.residence = "";
        state.roomType = "";
        state.mealPlan = "";
        state.futureMealPlanInterest = "";

        state.offCampusType = "";
        state.currentOffCampusRent = null;
        state.currentOffCampusFood = 0;
      }

      calculateEstimate();
      renderCurrentStep();
    };
  });

  /*
    Back button.
  */
  if (back) {
    back.onclick = () => {
      clearErrors();

      state.currentStep = 1;
      renderCurrentStep();
    };
  }

  /*
    Continue button and validation.
  */
  if (next) {
    next.onclick = () => {
      clearErrors();

      /*
        Synchronize visible fields with state before
        validating. This provides additional protection
        if the browser did not fire a change event.
      */
      if (cohortYear) {
        state.cohortYear =
          cohortYear.value;
      }

      if (currentStartTerm) {
        state.currentStartTerm =
          currentStartTerm.value;

        const selectedOption =
          getCurrentStartTermOptions()
            .find(option =>
              option.value ===
              state.currentStartTerm
            );

        state.cohortYear =
          selectedOption?.cohortYear || "";
      }

      if (classification) {
        state.classification =
          classification.value;
      }

      if (
        program &&
        program.value &&
        !state.program
      ) {
        applyProgramSelection(
          program.value
        );
      }

      let hasError = false;

      if (
        state.studentPhase === "current" &&
        !state.currentStartTerm
      ) {
        markError(
          currentStartTerm,
          "Please select when you began your current program."
        );

        hasError = true;
      }

      if (
        state.studentPhase === "future" &&
        !state.cohortYear
      ) {
        markError(
          cohortYear,
          "Please select an expected start year or term."
        );

        hasError = true;
      }

      if (
        state.level === "GR" &&
        !state.classification
      ) {
        markError(
          classification,
          "Please select a graduate program type."
        );

        hasError = true;
      }

      if (!state.program) {
        markError(
          program,
          "Please select a program."
        );

        hasError = true;
      }

      /*
        Automatically confirm Guelph campus for
        graduate students.
      */
      if (
        state.level === "GR" &&
        state.program
      ) {
        state.campus =
          "University of Guelph";
      }

      if (!state.campus) {
        markError(
          campusChoices,
          "Please select a campus."
        );

        hasError = true;
      }

      if (hasError) {
        return;
      }

      matchTuitionRecord();

      if (!state.matchedTuitionRecord) {
        markError(
          program,
          "No tuition record matched this selection. Please try a different program or classification."
        );

        return;
      }

      calculateEstimate();

      state.currentStep =
        state.estimateScope ===
        "tuition-only"
          ? 5
          : 3;

      renderCurrentStep();
    };
  }
}


function bindStep3Events() {
  if (state.currentStep !== 3) {
    return;
  }

  const booksAmount =
    document.getElementById("booksAmount");

  const personalAmount =
    document.getElementById("personalAmount");

  const currentOffCampusRent =
    document.getElementById(
      "currentOffCampusRent"
    );

  const housingType =
    document.getElementById("housingType");

  const residence =
    document.getElementById("residence");

  const roomType =
    document.getElementById("roomType");

  const futureMealPlanInterest =
    document.getElementById(
      "futureMealPlanInterest"
    );

  const mealPlan =
    document.getElementById("mealPlan");

  const back =
    document.getElementById("backStep3");

  const next =
    document.getElementById("nextStep3");

  if (booksAmount) {
    booksAmount.oninput = event => {
      state.booksAmount =
        toNumber(event.target.value);

      updateRunningEstimate();
    };
  }

  if (currentOffCampusRent) {
    currentOffCampusRent.oninput =
      event => {
        state.currentOffCampusRent =
          toNumber(event.target.value);

        updateRunningEstimate();
      };
  }

  if (housingType) {
    housingType.onchange = event => {
      state.housingType =
        event.target.value;

      state.residence = "";
      state.roomType = "";
      state.mealPlan = "";
      state.futureMealPlanInterest = "";

      if (
        state.housingType === "OffCampus"
      ) {
        state.currentOffCampusRent =
          getAverageMonthlyOffCampusRent();
      } else {
        state.currentOffCampusRent =
          null;
      }

      renderCurrentStep();
    };
  }

  if (roomType) {
    roomType.onchange = event => {

      state.roomType =
        event.target.value;

      /*
        Graduate students select room type first,
        so changing it clears the residence.
      */
      if (state.level === "GR") {
        state.residence = "";
      }

      state.mealPlan = "";

      renderCurrentStep();
    };
  }

  if (residence) {
    residence.onchange = event => {
      state.residence =
        event.target.value;

      /*
        Undergraduate students select residence
        first, so changing it clears the room type.

        Graduate students keep their room type.
      */
      if (state.level === "UG") {
        state.roomType = "";
      }

      state.mealPlan = "";

      renderCurrentStep();
    };
  }

  if (futureMealPlanInterest) {
    futureMealPlanInterest.onchange =
      event => {
        state.futureMealPlanInterest =
          event.target.value;

        if (
          state.futureMealPlanInterest !==
          "Yes"
        ) {
          state.mealPlan = "";
        }

        renderCurrentStep();
      };
  }

  if (mealPlan) {
    mealPlan.onchange = event => {
      state.mealPlan =
        event.target.value;

      updateRunningEstimate();
    };
  }

  if (back) {
    back.onclick = () => {
      state.currentStep = 2;
      renderCurrentStep();
    };
  }

  if (next) {
    next.onclick = () => {
      clearErrors();

      if (!state.housingType) {
        markError(
          housingType,
          "Please select where you plan to live."
        );

        return;
      }

      if (
        state.housingType === "OnCampus"
      ) {
        /*
          Graduate validation follows the
          room-type-first order.
        */
        if (
          state.level === "GR" &&
          !state.roomType
        ) {
          markError(
            roomType,
            "Please select a room type."
          );

          return;
        }

        if (!state.residence) {
          markError(
            residence,
            "Please select a residence."
          );

          return;
        }

        /*
          Undergraduate students select the
          room type after residence.
        */
        if (
          state.level === "UG" &&
          !state.roomType
        ) {
          markError(
            roomType,
            "Please select a room type."
          );

          return;
        }

        if (!state.mealPlan) {
          markError(
            mealPlan,
            "Please select a meal-plan preference."
          );

          return;
        }

        if (
          selectedResidenceRequiresMealPlan() &&
          state.mealPlan === "None"
        ) {
          markError(
            mealPlan,
            "A meal plan is required for this residence and room type."
          );

          return;
        }
      }

      if (
        state.housingType === "OffCampus"
      ) {
        if (
          toNumber(
            state.currentOffCampusRent
          ) <= 0
        ) {
          markError(
            currentOffCampusRent,
            "Please enter your estimated monthly rent."
          );

          return;
        }

        if (
          !state.futureMealPlanInterest
        ) {
          markError(
            futureMealPlanInterest,
            "Please select Yes or No."
          );

          return;
        }

        if (
          state.futureMealPlanInterest ===
            "Yes" &&
          !state.mealPlan
        ) {
          markError(
            mealPlan,
            "Please select a meal plan."
          );

          return;
        }
      }

      calculateEstimate();

      state.currentStep = 4;
      renderCurrentStep();
    };
  }
}

function bindStep4Events() {
  if (state.currentStep !== 4) return;

  const osapFunding =
    document.getElementById("osapFunding");

  const nonOntarioAidFunding =
    document.getElementById("nonOntarioAidFunding");

  const partTimeHoursPerWeek =
    document.getElementById("partTimeHoursPerWeek");

  const partTimeHourlyRate =
    document.getElementById("partTimeHourlyRate");

  const partTimeIncome =
    document.getElementById("partTimeIncome");
    
  const coopHourlyRate =
    document.getElementById("coopHourlyRate");

  const coopHoursPerWeek =
    document.getElementById("coopHoursPerWeek");

  const otherScholarshipOffset =
    document.getElementById("otherScholarshipOffset");

  const familySupport =
    document.getElementById("familySupport");

  const back =
    document.getElementById("backStep4");

  const next =
    document.getElementById("nextStep4");

  if (osapFunding) {
    osapFunding.oninput = event => {
      state.osapFunding = toNumber(event.target.value);
      updateRunningEstimate();
    };
  }

  if (nonOntarioAidFunding) {
    nonOntarioAidFunding.oninput = event => {
      state.nonOntarioAidFunding =
        toNumber(event.target.value);
      updateRunningEstimate();
    };
  }

  if (partTimeHoursPerWeek) {
    partTimeHoursPerWeek.oninput = event => {
      state.partTimeHoursPerWeek = toNumber(event.target.value);
      updateRunningEstimate();
    };
  }

  if (partTimeHourlyRate) {
    partTimeHourlyRate.oninput = event => {
      state.partTimeHourlyRate = toNumber(event.target.value);
      updateRunningEstimate();
    };
  }

  if (partTimeIncome) {
    partTimeIncome.oninput = event => {
      state.partTimeIncome = toNumber(event.target.value);
      updateRunningEstimate();
    };
  }

  if (coopHourlyRate) {
    coopHourlyRate.oninput = event => {
      state.coopHourlyRate = toNumber(event.target.value);
      updateRunningEstimate();
    };
  }

  if (coopHoursPerWeek) {
    coopHoursPerWeek.oninput = event => {
      state.coopHoursPerWeek = toNumber(event.target.value);
      updateRunningEstimate();
    };
  }

  if (otherScholarshipOffset) {
    otherScholarshipOffset.oninput = event => {
      state.otherScholarshipOffset = toNumber(event.target.value);
      updateRunningEstimate();
    };
  }

  if (familySupport) {
    familySupport.oninput = event => {
      state.familySupport = toNumber(event.target.value);
      updateRunningEstimate();
    };
  }

  if (back) {
    back.onclick = () => {
      state.currentStep = 3;
      renderCurrentStep();
    };
  }

  if (next) {
    next.onclick = () => {
      calculateEstimate();
      state.currentStep = 5;
      renderCurrentStep();
    };
  }
}
function renderFutureContactSection() {

  return `
    <div class="future-contact-section">
      <h3 class="subsection-title">
        Would you like the estimate emailed to you?
      </h3>

      <p class="form-help-text">
        Please provide the following information
        to download your estimate or have it emailed
        to you.
      </p>

      <p class="form-help-text">
        We may also send information about:
      </p>

      <ul class="future-contact-list">
        <li>Programs and admissions</li>
        <li>Scholarships and financial aid</li>
        <li>
          Events, campus life and student opportunities
        </li>
      </ul>

      <div class="form-group">
        <label for="firstName">
          First name
          <span class="required-star">*</span>
        </label>

        <input
          id="firstName"
          class="step-input"
          type="text"
          autocomplete="given-name"
          value="${escapeHtml(state.firstName)}"
          placeholder="Enter your first name"
        />
     "
 </div>

      <div class="form-group">
        <label for="lastName">
          Last name
          <span class="required-star">*</span>
        </label>

        <input
          id="lastName"
          class="step-input"
          type="text"
          autocomplete="family-name"
          value="${escapeHtml(state.lastName)}"
          placeholder="Enter your last name"
        />
      </div>

      <div class="form-group">
        <label for="dateOfBirth">
          Date of birth
          <span class="required-star">*</span>
        </label>

        <div class="dob-field-wrap">
          <input
            id="dateOfBirth"
            class="step-input"
            type="text"
            autocomplete="bday"
            inputmode="numeric"
            value="${escapeHtml(state.dateOfBirth)}"
            placeholder="MM/DD/YYYY"
          />
        </div>

        <p class="form-help-text">
          Select your date of birth from the calendar.
        </p>
      </div>

      <div class="form-group">
        <label for="email">
          Email address
          <span class="required-star">*</span>
        </label>

        <input
          id="email"
          class="step-input"
          type="email"
          autocomplete="email"
          value="${escapeHtml(state.email)}"
          placeholder="Enter your email address"
        />
      </div>

      <div class="uog-alert uog-alert-grey">
        <div class="uog-alert-title">
          <span class="uog-alert-icon">
            !
          </span>

          <span>
            Consent notice
          </span>
        </div>

        <div class="uog-alert-message">
          By downloading or requesting your estimate,
          you consent to the University of Guelph using
          the information provided to send your estimate
          and communicate with you about programs,
          admissions, scholarships, events and related
          opportunities. You may unsubscribe at any time.
        </div>
      </div>
    </div>
  `;
}


function resetEstimator() {
  const loadedData =
    state.data;

  const existingDataLoadError =
    state.dataLoadError;

  /*
    Restore every estimator selection to its
    original value while preserving loaded JSON.
  */
  Object.assign(
    state,
    JSON.parse(
      JSON.stringify(
        INITIAL_ESTIMATOR_STATE
      )
    )
  );

  state.data =
    loadedData;

  state.dataLoadError =
    existingDataLoadError;

  /*
    Remove only estimator-specific saved state.
    Do not clear unrelated storage belonging to
    other University components.
  */
  try {
    localStorage.removeItem(
      "uofg-cost-estimator-state"
    );

    sessionStorage.removeItem(
      ESTIMATOR_SESSION_STORAGE_KEY
    );
  } catch (error) {
    console.warn(
      "Estimator storage could not be cleared:",
      error
    );
  }

  if (costBreakdownChart) {
    costBreakdownChart.destroy();
    costBreakdownChart = null;
  }

  clearErrors();

  state.currentStep = 0;

  calculateEstimate();
  renderCurrentStep();
}
function bindStep5Events() {
  if (state.currentStep !== 5) {
    return;
  }

  renderCostBreakdownChart();

  const firstName =
    document.getElementById(
      "firstName"
    );

  const lastName =
    document.getElementById(
      "lastName"
    );

  const dateOfBirth =
    document.getElementById(
      "dateOfBirth"
    );

  const email =
    document.getElementById(
      "email"
    );

  const back =
    document.getElementById(
      "backStep5"
    );

  const startAgainBtn =
    document.getElementById(
      "startAgainBtn"
    );

  const downloadBtn =
    document.getElementById(
      "downloadEstimateBtn"
    );

  const emailBtn =
    document.getElementById(
      "emailEstimateBtn"
    );

  if (firstName) {
    firstName.oninput = event => {
      state.firstName =
        event.target.value;

      clearErrors();
    };
  }

  if (lastName) {
    lastName.oninput = event => {
      state.lastName =
        event.target.value;

      clearErrors();
    };
  }

  let dateOfBirthErrorTarget =
    dateOfBirth;

  if (
    dateOfBirth &&
    typeof window.flatpickr === "function"
  ) {
    const dateOfBirthPicker =
      window.flatpickr(
        dateOfBirth,
        {
          dateFormat: "Y-m-d",
          altInput: true,
          altFormat: "m/d/Y",

          maxDate: "today",
          disableMobile: true,
          allowInput: true,
          clickOpens: true,
          monthSelectorType: "static",

          /*
            Keep the field empty, but open the
            calendar at January 1, 2000.
          */
          onReady(
            selectedDates,
            dateString,
            instance
          ) {
            if (!state.dateOfBirth) {
              instance.jumpToDate(
                "2000-01-01"
              );
            }
          },

          onOpen(
            selectedDates,
            dateString,
            instance
          ) {
            if (!state.dateOfBirth) {
              instance.jumpToDate(
                "2000-01-01"
              );
            }
          },

          onChange(
            selectedDates,
            dateString
          ) {
            state.dateOfBirth =
              dateString;

            clearErrors();
          }
        }
      );

    dateOfBirthErrorTarget =
      dateOfBirthPicker.altInput ||
      dateOfBirth;

    const dateOfBirthDisplayInput =
      dateOfBirthPicker.altInput;

    if (dateOfBirthDisplayInput) {
      dateOfBirthDisplayInput.inputMode =
        "numeric";

      dateOfBirthDisplayInput.placeholder =
        "MM/DD/YYYY";

      dateOfBirthDisplayInput.maxLength = 10;

      dateOfBirthDisplayInput.setAttribute(
        "aria-label",
        "Date of birth in month, day and year format"
      );

      dateOfBirthDisplayInput.addEventListener(
        "input",
        event => {
          /*
            Keep only numbers and automatically add
            the two date separators.
          */
          const digits =
            event.target.value
              .replace(/\D/g, "")
              .slice(0, 8);

          let formattedDate = digits;

          if (digits.length > 2) {
            formattedDate =
              `${digits.slice(0, 2)}/${digits.slice(2)}`;
          }

          if (digits.length > 4) {
            formattedDate =
              `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
          }

          event.target.value =
            formattedDate;

          /*
            Wait until the complete MM/DD/YYYY value
            has been entered.
          */
          if (digits.length !== 8) {
            state.dateOfBirth = "";
            return;
          }

          const month =
            Number(digits.slice(0, 2));

          const day =
            Number(digits.slice(2, 4));

          const year =
            Number(digits.slice(4, 8));

          const selectedDate =
            new Date(
              year,
              month - 1,
              day
            );

          const today = new Date();

          today.setHours(
            23,
            59,
            59,
            999
          );

          /*
            Confirm that the date exists. This catches
            values such as February 31.
          */
          const isValidDate =
            month >= 1 &&
            month <= 12 &&
            day >= 1 &&
            selectedDate.getFullYear() === year &&
            selectedDate.getMonth() === month - 1 &&
            selectedDate.getDate() === day &&
            selectedDate <= today;

          if (!isValidDate) {
            state.dateOfBirth = "";
            return;
          }

          const isoDate =
            `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

          state.dateOfBirth =
            isoDate;

          /*
            Select the typed date and move the
            calendar to the matching month and year.
          */
          dateOfBirthPicker.setDate(
            isoDate,
            false,
            "Y-m-d"
          );

          dateOfBirthPicker.jumpToDate(
            isoDate
          );

          clearErrors();
        }
      );
    }
  }

  if (email) {
    email.oninput = event => {
      state.email =
        event.target.value;

      clearErrors();
    };
  }

  if (back) {
    back.onclick = () => {
      clearErrors();

      state.currentStep =
        state.estimateScope ===
          "tuition-only"
          ? 2
          : 4;

      renderCurrentStep();
    };
  }

  if (startAgainBtn) {
    startAgainBtn.onclick = () => {
      const shouldRestart =
        window.confirm(
          "Start a new estimate? Your current selections will be cleared."
        );

      if (!shouldRestart) {
        return;
      }

      resetEstimator();
    };
  }

  function validateContactFields() {
    clearErrors();

    let hasError = false;

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!state.firstName.trim()) {
      markError(
        firstName,
        "Please enter your first name."
      );

      hasError = true;
    }

    if (!state.lastName.trim()) {
      markError(
        lastName,
        "Please enter your last name."
      );

      hasError = true;
    }

    if (!state.dateOfBirth) {
      markError(
        dateOfBirthErrorTarget,
        "Please enter your date of birth."
      );

      hasError = true;
    } else {
      const selectedDate =
        new Date(
          `${state.dateOfBirth}T00:00:00`
        );

      const today =
        new Date();

      if (
        Number.isNaN(
          selectedDate.getTime()
        ) ||
        selectedDate > today
      ) {
        markError(
          dateOfBirthErrorTarget,
          "Please enter a valid date of birth."
        );

        hasError = true;
      }
    }

    if (!state.email.trim()) {
      markError(
        email,
        "Please enter your email address."
      );

      hasError = true;
    } else if (
      !emailPattern.test(
        state.email.trim()
      )
    ) {
      markError(
        email,
        "Please enter a valid email address."
      );

      hasError = true;
    }

    return !hasError;
  }

  if (downloadBtn) {
    downloadBtn.onclick = async () => {
      if (
        state.studentPhase === "future" &&
        !validateContactFields()
      ) {
        return;
      }

      try {
        calculateEstimate();

        if (

          state.studentPhase === "future"
        ) {
          await saveFutureStudentLead(
            "Downloaded copy"
          );
        }

        await generateEstimatePDF();
      } catch (error) {
        console.error(
          "Download/save failed:",
          error
        );

        markError(
          email,
          "Download failed. Please refresh and try again."
        );
      }
    };
  }

  if (emailBtn) {
    emailBtn.onclick = async () => {
      if (!validateContactFields()) {
        return;
      }

      try {
        calculateEstimate();

        await sendEstimateEmail();

        alert(
          "Your estimate has been emailed successfully."
        );
      } catch (error) {
        console.error(
          "Email failed:",
          error
        );

        markError(
          email,
          "Email failed. Please refresh and try again."
        );
      }
    };
  }
}
async function saveFutureStudentLead(emailStatus = "Downloaded copy") {
  const payload = {
    studentName:
      `${state.firstName.trim()} ${state.lastName.trim()}`.trim(),

    firstName: state.firstName.trim(),
    lastName: state.lastName.trim(),
    dateOfBirth: state.dateOfBirth,
    studentEmail: state.email.trim(),
    residency: state.residencyType,
    level: state.level,
    province: state.residencyType === "Domestic" ? state.province : "INT",
    cohortYear: state.cohortYear,
    program: state.program,
    major: state.major || "",
    coopInterest: state.coopInterest,
    osapFunding:
      state.residencyType === "Domestic" &&
      state.province === "ON"
        ? Number(state.osapFunding) || 0
        : 0,
    housing: state.housingType,
    includeMealPlan: state.futureMealPlanInterest,
    emailStatus: emailStatus
  };

  const response = await fetch("https://defaultbe62a12b2cad49a1a5fa85f4f3156a.7d.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/5d659c8475fd4b61a77ccaae4e6cc35f/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=2x7e1hQTmjfH9_Qh5nAD7GCNv0FBdAl3v_aZ0M6HPCc", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("Power Automate save failed.");
  }

  return response.json();
}
async function sendEstimateEmail() {
  calculateEstimate();
  const result = state.result || emptyResult();

  const payload = {
    studentName:
      `${state.firstName.trim()} ${state.lastName.trim()}`.trim(),

    firstName: state.firstName.trim(),
    lastName: state.lastName.trim(),
    dateOfBirth: state.dateOfBirth,
    studentEmail: state.email.trim(),
    residency: state.residencyType,
    level: state.level,
    province: state.residencyType === "Domestic" ? state.province : "INT",
    cohortYear: state.cohortYear,
    program: state.program,
    major: state.major || "",
    coopInterest: state.coopInterest,
    osapFunding:
      state.residencyType === "Domestic" &&
      state.province === "ON"
        ? Number(state.osapFunding) || 0
        : 0,
    housing: state.housingType,
    includeMealPlan: state.futureMealPlanInterest,
    emailStatus: "Sent",

    estimateRange: formatRangeValue(result.low, result.high),
    summaryRowsHtml: buildEmailSummaryRows(result)
  };

  const response = await fetch("https://defaultbe62a12b2cad49a1a5fa85f4f3156a.7d.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/e9e2e002a99646c1b0f01ff7542b17b4/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=XSSTo_9jUavHCg_UTlvYFUn7QqCWcz6VzUc8oP-Lg20", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("Email Power Automate flow failed.");
  }

  return response.json();
}
function buildEmailSummaryRows(result) {
  const rows = [];

  function addSection(title, items, isOffset = false) {
    if (!items || !items.length) return;

    rows.push(`
      <tr>
        <td colspan="2" style="padding:12px;border:1px solid #e5e7eb;font-weight:700;background:#f5f5f5;">
          ${escapeHtml(title)}
        </td>
      </tr>
    `);

    items.forEach(item => {
      const value =
        item.low !== undefined && item.high !== undefined
          ? formatRangeValue(item.low, item.high)
          : formatMoney(item.value || 0);

      rows.push(`
        <tr>
          <td style="padding:10px 12px;border:1px solid #e5e7eb;">
            ${escapeHtml(item.label)}
          </td>
          <td style="padding:10px 12px;border:1px solid #e5e7eb;text-align:right;font-weight:700;color:${isOffset ? "#b3142c" : "#318738"};">
            ${isOffset ? "-" : ""}${value}
          </td>
        </tr>
      `);
    });
  }

  addSection("Tuition and fees", result.tuition.items);
  addSection("Living costs", result.living.items);
  addSection("Extra costs", result.extras.items);
  addSection("Funding and offsets", result.offsets.items, true);

  rows.push(`
    <tr>
      <td style="padding:12px;border:1px solid #318738;background:#318738;color:#ffffff;font-weight:700;">
        ${escapeHtml(
          getEstimatePeriodDetails().totalLabel
        )}
      </td>
      <td style="padding:12px;border:1px solid #318738;background:#318738;color:#ffffff;font-weight:700;text-align:right;">
        ${formatRangeValue(result.low, result.high)}
      </td>
    </tr>
  `);

  return rows.join("");
}
function resetProgramPathState() {
  /*
    Only reset Screen 3 and later selections.

    Do not reset:
    - livingInCanada
    - canadaRegion
    - country
    - canadianCitizen
    - residencyType
    - province
    - level
  */

  state.campus = "";
  state.cohortYear = "";
  state.currentStartTerm = "";
  state.program = "";
  state.major = "";
  state.classification = "";

  state.coopInterest = "No";
  state.includeCoop = false;
  state.includeCoopEarnings = false;
  state.matchedTuitionRecord = null;

  state.housingType = "";
  state.residence = "";
  state.roomType = "";
  state.mealPlan = "";
  state.futureMealPlanInterest = "";

  /*
    Clear older off-campus amount values in case
    they were entered before the interface changed.
  */
  state.offCampusType = "";
  state.currentOffCampusRent = null;
  state.currentOffCampusFood = 0;
}

function resetFundingSelections() {
  state.osapFunding = 0;
  state.nonOntarioAidFunding = 0;
  state.selectedScholarshipKeys = [];
  state.scholarshipOffset = 0;
  state.partTimeIncome = 0;
  state.coopEarningsOffset = 0;
  state.familySupport = 0;
}

function updateRunningEstimate() {
  calculateEstimate();
  updateChrome();
}

function calculateEstimate() {
  const tuition = getTuitionCosts();
  const tuitionOnly = state.estimateScope === "tuition-only";

  const living = tuitionOnly
    ? { items: [], low: 0, high: 0 }
    : getLivingCosts();

  const extras = tuitionOnly
    ? { items: [], low: 0, high: 0 }
    : getExtraCosts();

  const offsets = tuitionOnly
    ? { items: [], total: 0 }
    : getOffsets();

  const low = Math.max(
    0,
    tuition.low +
    living.low +
    extras.low -
    offsets.total
  );

  const high = Math.max(
    0,
    tuition.high +
    living.high +
    extras.high -
    offsets.total
  );

  state.result = {
    tuition,
    living,
    extras,
    offsets,
    low,
    high
  };
}

function emptyResult() {
  return {
    tuition: { items: [], low: 0, high: 0 },
    living: { items: [], low: 0, high: 0 },
    extras: { items: [], low: 0, high: 0 },
    offsets: { items: [], total: 0 },
    low: 0,
    high: 0
  };
}
function getTuitionArray() {
  if (!state.data) return [];

  /*
    Current / returning students use the combined historical
    tuition table so every available cohort can be selected.

    Future students continue using the existing UG_Tuition and
    GR_Tuition sections exactly as before.
  */
  if (state.studentPhase === "current") {
    const expectedStudentLevel =
      state.level === "UG"
        ? "undergrad"
        : state.level === "GR"
          ? "grad"
          : "";

    return (
      state.data.Current_Students_GR_UG || []
    ).filter(row =>
      normalizeKey(row.StudentLevel) ===
      expectedStudentLevel
    );
  }

  return state.level === "UG"
    ? (state.data.UG_Tuition || [])
    : (state.data.GR_Tuition || []);
}

function getFilteredTuitionRows({
  includeProgram = false,
  includeMajor = false,
  includeCohortForCurrent = true,
  includeClassification = true
} = {}) {
  return getTuitionArray().filter(row => {
    const residencyMatch =
      normalizeKey(row.Residency) ===
      normalizeKey(state.residencyType);

    const provinceValue =
      normalizeKey(row.Province);

    /*
      Graduate tuition data contains Ontario domestic
      records but does not contain separate Non-ON records.

      Therefore, all domestic graduate students use
      the Ontario graduate tuition record.
    */
    const effectiveProvince =
      state.level === "GR" &&
      state.residencyType === "Domestic"
        ? "ON"
        : state.province;

    let provinceMatch = true;

    if (
      state.residencyType === "International"
    ) {
      provinceMatch =
        provinceValue === "int" ||
        provinceValue === "international";
    } else {
      provinceMatch =
        !effectiveProvince ||
        provinceValue ===
          normalizeKey(effectiveProvince);
    }

    const classificationMatch =
      state.level === "GR" &&
      includeClassification &&
      state.classification
        ? normalizeKey(row.Classification) ===
          normalizeKey(state.classification)
        : true;

    const programMatch =
      includeProgram
        ? normalizeKey(row.Program) ===
          normalizeKey(state.program)
        : true;

    const majorMatch =
      includeMajor &&
      state.major
        ? normalizeKey(row.Major) ===
          normalizeKey(state.major)
        : true;

    const cohortMatch =
      state.studentPhase === "current" &&
      includeCohortForCurrent
        ? !state.cohortYear ||
          normalizeKey(row.CohortYear) ===
            normalizeKey(state.cohortYear)
        : true;

    return (
      residencyMatch &&
      provinceMatch &&
      classificationMatch &&
      programMatch &&
      majorMatch &&
      cohortMatch
    );
  });
}


function getAvailableCampuses() {
  return [
    "University of Guelph",
    "University of Guelph-Humber",
    "Ridgetown Campus"
  ];
}
function getAvailableMajors() {
  if (state.level !== "UG" || !state.program) return [];

  const rows = getFilteredTuitionRows({ includeProgram: true });

  return [...new Set(
    rows
      .map(row => normalize(row.Major))
      .filter(Boolean)
  )].sort((a, b) => a.localeCompare(b));
}

function getAvailableCohortYears() {
  const rows =
    getFilteredTuitionRows();

  if (state.studentPhase === "future") {
    const cohortRanges = rows
      .map(row =>
        parseCohortRange(
          normalize(row.CohortYear)
        )
      )
      .filter(Boolean);

    if (!cohortRanges.length) {
      return [];
    }

    const latestCohort =
      cohortRanges.reduce(
        (latest, current) => {
          return current.end > latest.end
            ? current
            : latest;
        }
      );

    const firstExpectedStartYear =
      latestCohort.end;

    const NUMBER_OF_YEARS = 5;

    /*
      Graduate students:
      Winter, Summer and Fall.
    */
    const graduateTerms = [
      {
        name: "Winter",
        months: "January - April"
      },
      {
        name: "Summer",
        months: "May - August"
      },
      {
        name: "Fall",
        months: "September - December"
      }
    ];

    /*
      Undergraduate students:
      Winter and Fall only.
    */
    const undergraduateTerms = [
      {
        name: "Winter",
        months: "January - April"
      },
      {
        name: "Fall",
        months: "September - December"
      }
    ];

    const applicableTerms =
      state.level === "GR"
        ? graduateTerms
        : undergraduateTerms;

    return Array.from(
      {
        length: NUMBER_OF_YEARS
      },
      (_, index) =>
        firstExpectedStartYear + index
    ).flatMap(year =>
      applicableTerms.map(term => ({
        value:
          `${term.name} ${year}`,

        label:
          `${term.name} ${year} (${term.months})`,

        year,
        term: term.name,

        isFutureEstimate:
          year > latestCohort.end
      }))
    );
  }

  /*
    Current or returning students continue
    using the available cohort years.
  */
  return [
    ...new Set(
      rows
        .map(row =>
          normalize(row.CohortYear)
        )
        .filter(Boolean)
    )
  ].sort(
    (yearA, yearB) =>
      compareCohortDesc(
        yearA,
        yearB
      )
  );
}

function getCurrentStartTermOptions() {
  if (state.studentPhase !== "current") {
    return [];
  }

  /*
    Do not filter by the currently selected cohort here. The purpose
    of this list is to expose every cohort contained in the current-
    student JSON data for the chosen level and residency pathway.
  */
  const rows = getFilteredTuitionRows({
    includeCohortForCurrent: false
  });

  const cohortRanges = [
    ...new Map(
      rows
        .map(row => parseCohortRange(row.CohortYear))
        .filter(Boolean)
        .map(range => [range.raw, range])
    ).values()
  ].sort((a, b) => a.start - b.start);

  if (!cohortRanges.length) {
    return [];
  }

  /*
    Current students should not be offered a start term from the
    newest tuition-data year itself. Keep the newest selectable
    calendar year one year behind the newest cohort start year.

    Example: if the newest cohort is 2026-2027, the dropdown stops
    at Fall 2025 (September - December). This advances automatically
    when newer cohort data is added to the JSON.
  */
  const latestDataStartYear = Math.max(
    ...cohortRanges.map(range => range.start)
  );

  const currentStudentCutoffYear =
    latestDataStartYear - 1;

  return cohortRanges.flatMap(range => {
    const options = [
      {
        term: "Fall",
        year: range.start,
        months: "September - December"
      },
      {
        term: "Winter",
        year: range.end,
        months: "January - April"
      }
    ];

    /*
      Graduate students may also begin in Summer. Undergraduate
      students intentionally receive only Fall and Winter choices.
    */
    if (state.level === "GR") {
      options.push({
        term: "Summer",
        year: range.end,
        months: "May - August"
      });
    }

    return options
      .filter(option =>
        option.year <= currentStudentCutoffYear
      )
      .map(option => ({
        value:
          `${option.term}|||${range.raw}`,
        label:
          `${option.term} ${option.year} (${option.months})`,
        term: option.term,
        year: option.year,
        cohortYear: range.raw
      }));
  });
}


function getLatestCurrentCohortYear() {
  const cohortYears = getAvailableCohortYears();
  return cohortYears[0] || "";
}

function getAvailableCountries() {
  return [...new Set(
    (state.data?.["Country List"] || [])
      .map(item => normalize(item.Country))
      .filter(Boolean)
  )].sort((a, b) => a.localeCompare(b));
}

function getAvailablePrograms() {
  return [...new Set(
    getFilteredTuitionRows()
      .map(row => normalize(row.Program))
      .filter(Boolean)
  )].sort((a, b) => a.localeCompare(b));
}

function parseCohortRange(value) {
  const text = normalize(value);
  const match = text.match(/(\d{4})\s*-\s*(\d{4})/);
  if (!match) return null;
  return {
    start: Number(match[1]),
    end: Number(match[2]),
    raw: text
  };
}

function compareCohortDesc(a, b) {
  const ra = parseCohortRange(a);
  const rb = parseCohortRange(b);
  const ae = ra ? ra.end : 0;
  const be = rb ? rb.end : 0;
  return be - ae;
}

function getLatestApprovedTuitionCohort() {
  const cohortRanges = getFilteredTuitionRows()
    .map(row => parseCohortRange(row.CohortYear))
    .filter(Boolean);

  if (!cohortRanges.length) return null;

  return cohortRanges.reduce((latest, current) => {
    return current.end > latest.end
      ? current
      : latest;
  });
}

function getFutureProgramCoopStatus() {
  if (!state.program) {
    return "";
  }

  const rows = getFilteredTuitionRows({
    includeProgram: true,
    includeMajor: true
  });

  const match = rows.find(row => {
    const programMatch =
      normalizeKey(row.Program) ===
      normalizeKey(state.program);

    if (state.major) {
      return (
        programMatch &&
        normalizeKey(row.Major) ===
          normalizeKey(state.major)
      );
    }

    return programMatch;
  });

  return normalize(
    readField(match || {}, [
      "Coop Included",
      "Coop_included",
      "coop_included",
      "Co-op Included",
      "Co-op"
    ])
  );
}
function matchTuitionRecord() {
  const rows = getFilteredTuitionRows({
    includeProgram: true,
    includeMajor: true,
    includeCohortForCurrent: true
  });

  if (!rows.length) {
    state.matchedTuitionRecord = null;
    return;
  }

  /*
    Future students use the newest approved
    tuition record available in data.json.
  */
  if (state.studentPhase === "future") {
    const sortedRows = [...rows].sort(
      (rowA, rowB) => {
        const cohortA =
          parseCohortRange(
            rowA.CohortYear
          );

        const cohortB =
          parseCohortRange(
            rowB.CohortYear
          );

        const endYearA =
          cohortA
            ? cohortA.end
            : 0;

        const endYearB =
          cohortB
            ? cohortB.end
            : 0;

        return endYearB - endYearA;
      }
    );

    state.matchedTuitionRecord =
      sortedRows[0] || null;

    return;
  }

  state.matchedTuitionRecord =

    rows[0] || null;
}

function getScholarshipOptions() {
  const source = state.residencyType === "International"
    ? (state.data["Scholarships for Int"] || [])
    : (state.data["Scholarships for Dom"] || []);

  return source.map((item, index) => ({
    ...item,
    __key: `${state.residencyType || "Unknown"}__${index}`,
    __label: item["Award Name"] || `Award ${index + 1}`
  }));
}

function extractMoneyValues(text) {
  const cleaned = String(text || "").replace(/,/g, "");
  const matches = cleaned.match(/(\d+(\.\d+)?)/g);
  if (!matches) return [];
  return matches.map(Number).filter(v => !isNaN(v));
}

function getScholarshipYearlyValue(item) {
  const amountText = String(item?.Amount || "");
  const notesText = String(item?.Notes || "");
  const combined = `${amountText} ${notesText}`.toLowerCase();

  if (combined.includes("varies")) return 0;

  const yearlyMatch =
    notesText.match(/\$?\s*([\d,]+(\.\d+)?)\s*\/\s*year/i) ||
    notesText.match(/\$?\s*([\d,]+(\.\d+)?)\s*per\s*year/i);

  if (yearlyMatch) {
    return toNumber(yearlyMatch[1]);
  }

  const amountValues = extractMoneyValues(amountText);
  if (!amountValues.length) return 0;

  const maxAmount = Math.max(...amountValues);

  if (combined.includes("over 4 years")) return Math.round(maxAmount / 4);
  if (combined.includes("total")) return Math.round(maxAmount / 4);

  return maxAmount;
}

function getSelectedScholarshipTotal() {
  const options = getScholarshipOptions();

  return state.selectedScholarshipKeys.reduce((sum, key) => {
    const match = options.find(item => item.__key === key);
    if (!match) return sum;
    return sum + getScholarshipYearlyValue(match);
  }, 0);
}
function isGraduateSummerOnlyProgram() {
  if (state.level !== "GR") {
    return false;
  }

  const programText = normalizeKey(
    [
      state.program,
      state.major,
      state.matchedTuitionRecord?.Program,
      state.matchedTuitionRecord?.Major
    ]
      .filter(Boolean)
      .join(" ")
  );

  return programText.includes(
    "summer only"
  );
}

function getEstimatePeriodDetails() {
  /*
    Undergraduate:
    Fall and Winter.
  */
  if (state.level !== "GR") {
    return {
      terms: ["Fall", "Winter"],
      label: "Fall and Winter",
      shortLabel: "Fall & Winter",
      semesterCount: 2,
      summaryKicker:
        "Estimate summary for 2 academic semesters (Fall & Winter)",
      totalLabel:
        "Estimated range for 2 academic semesters (Fall & Winter)",
      description:
        "This is your two-semester estimate for Fall and Winter."
    };
  }

  /*
    Summer-only graduate programs:
    Summer only.
  */
  if (isGraduateSummerOnlyProgram()) {
    return {
      terms: ["Summer"],
      label: "Summer only",
      shortLabel: "Summer",
      semesterCount: 1,
      summaryKicker:
        "Estimate summary for the Summer semester",
      totalLabel:
        "Estimated range for the Summer semester",
      description:
        "This graduate estimate includes the Summer semester only."
    };
  }

  /*
    All other graduate programs:
    Fall, Winter and Summer.
  */
  return {
    terms: [
      "Fall",
      "Winter",
      "Summer"
    ],
    label:
      "Fall, Winter and Summer",
    shortLabel:
      "Fall, Winter & Summer",
    semesterCount: 3,
    summaryKicker:
      "Estimate summary for 3 academic semesters (Fall, Winter & Summer)",
    totalLabel:
      "Estimated range for 3 academic semesters (Fall, Winter & Summer)",
    description:
      "This graduate estimate includes Fall, Winter and Summer."
  };
}
function getTuitionCosts() {
  const row =
    state.matchedTuitionRecord;

  if (!row) {
    return {
      items: [],
      low: 0,
      high: 0
    };
  }

  const periodDetails =
    getEstimatePeriodDetails();

  const termAmounts = {
    Fall: {
      tuition: toNumber(
        row.FallTuition
      ),

      compulsoryFees: toNumber(
        row.FallCompulsoryFees
      )
    },

    Winter: {
      tuition: toNumber(
        row.WinterTuition
      ),

      compulsoryFees: toNumber(
        row.WinterCompulsoryFees
      )
    },

    Summer: {
      tuition: toNumber(
        row.SummerTuition
      ),

      compulsoryFees: toNumber(
        row.SummerCompulsoryFees
      )
    }
  };

  /*
    Add only the applicable terms.

    Undergraduate:
    Fall + Winter

    Graduate:
    Fall + Winter + Summer

    Summer-only graduate:
    Summer
  */
  const totalTuition =
    periodDetails.terms.reduce(
      (total, term) => {
        return (
          total +
          termAmounts[term].tuition
        );
      },
      0
    );

  const totalCompulsoryFees =
    periodDetails.terms.reduce(
      (total, term) => {
        return (
          total +
          termAmounts[term]
            .compulsoryFees
        );
      },
      0
    );

  /*
    Maintain the existing $500 possible
    compulsory-fee variation.
  */
  const maximumCompulsoryFees =
    totalCompulsoryFees > 0
      ? totalCompulsoryFees +
        COMPULSORY_FEE_RANGE_ALLOWANCE
      : 0;

  const items = [
    {
      label:
        `Total tuition for ${periodDetails.label}`,

      low: totalTuition,
      high: totalTuition
    },

    {
      label:
        `Total compulsory fees for ${periodDetails.label}`,

      low: totalCompulsoryFees,
      high: maximumCompulsoryFees,

      helpLink:
        "https://www.uoguelph.ca/registrar/finances-fees/tuition-fees#compulsory-fee-descriptions-guelph-campus",

      helpLinkText:
        "Learn what compulsory fees include"
    }
  ];

  return {
    items,

    low:
      totalTuition +
      totalCompulsoryFees,

    high:
      totalTuition +
      maximumCompulsoryFees
  };
}

function getOnCampusResidenceOptions() {
  return (state.data?.["On_campus_Living_Costs"] || [])
    .map(item => {
      const area = normalize(readField(item, ["ResidenceArea", "Residence Area"]));
      const room = normalize(readField(item, ["RoomType", "Room Type"]));
      const cost = toNumber(readField(item, ["Cost"]));
      const deposit = toNumber(readField(item, ["Deposit"]));
      const total = cost + deposit;

      if (!area && !room) return null;

      return {
        value: `${area} | ${room}`,
        label: `${area} - ${room} (${formatMoney(total)}/year)`
      };
    })
    .filter(Boolean);
}

function getMealPlanOptions() {
  return (state.data?.["Meal_Plan"] || [])
    .map(item => {
      const size = normalize(readField(item, ["Meal Plan Size", "MealPlanSize"]));
      const total = toNumber(readField(item, ["Total cost per year", "TotalCostPerYear"]));

      if (!size) return null;

      return {
        value: size,
        label: `${size} (${formatMoney(total)}/year)`
      };
    })
    .filter(Boolean);
}

function getLivingCosts() {
  const items = [];

  /*
    On-campus residence cost.
  */
  if (
    state.housingType === "OnCampus" &&
    state.residence &&
    state.roomType
  ) {
    const residenceRecord = (
      state.data?.[
        "On_campus_Living_Costs"
      ] || []
    ).find(item => {
      const residenceArea =
        normalize(
          readField(item, [
            "ResidenceArea",
            "Residence Area"
          ])
        );

      const roomType =
        normalize(
          readField(item, [
            "RoomType",
            "Room Type"
          ])
        );

      return (
        normalizeKey(residenceArea) ===
          normalizeKey(state.residence) &&
        normalizeKey(roomType) ===
          normalizeKey(state.roomType)
      );
    });

    if (residenceRecord) {
      const residenceCost =
        toNumber(
          readField(
            residenceRecord,
            ["Cost"]
          )
        );

      items.push({
        label:
          `Residence: ${state.residence} - ${state.roomType}`,

        low: residenceCost,
        high: residenceCost
      });
    }
  }

  /*
    Off-campus rent.

    Undergraduate:
    Monthly rent multiplied by 8 months.

    Graduate:
    Monthly rent multiplied by 12 months.
  */
  if (
    state.housingType === "OffCampus"
  ) {
    const monthlyRent =
      toNumber(
        state.currentOffCampusRent
      );

    const rentalMonths =
      getOffCampusRentalMonths();

    const totalRent =
      monthlyRent * rentalMonths;

    if (totalRent > 0) {
      items.push({
        label:
          `Off-campus rent: ${rentalMonths} months at ${formatMoney(monthlyRent)} per month`,

        low: totalRent,
        high: totalRent
      });
    }
  }

  /*
    Meal-plan cost.
  */
  const shouldIncludeMealPlan =
    state.mealPlan &&
    state.mealPlan !== "None" &&
    (
      state.housingType === "OnCampus" ||
      (
        state.housingType === "OffCampus" &&
        state.futureMealPlanInterest === "Yes"
      )
    );

  if (shouldIncludeMealPlan) {
    const mealPlanRecord = (
      state.data?.["Meal_Plan"] || []
    ).find(item => {
      const planName =
        normalize(
          readField(item, [
            "Meal Plan Size",
            "MealPlanSize"
          ])
        );

      return (
        normalizeKey(planName) ===
        normalizeKey(state.mealPlan)
      );
    });

    if (mealPlanRecord) {
      const mealPlanCost =
        toNumber(
          readField(mealPlanRecord, [
            "Total cost per year",
            "TotalCostPerYear"
          ])
        );

      items.push({
        label:
          `Meal plan: ${state.mealPlan}`,

        low: mealPlanCost,
        high: mealPlanCost
      });
    }
  }

  return {
    items,

    low: items.reduce(
      (sum, item) =>
        sum + item.low,
      0
    ),

    high: items.reduce(
      (sum, item) =>
        sum + item.high,
      0
    )
  };
}
function getInformationLink(sheetName, fallbackLink = "") {
  const dataSections = Object.values(state.data || {});

  for (const section of dataSections) {
    if (!Array.isArray(section)) continue;

    const match = section.find(item => {
      return normalizeKey(
        readField(item, ["Sheet Name"])
      ) === normalizeKey(sheetName);
    });

    if (match) {
      const link = normalize(
        readField(match, ["Information Link"])
      );

      if (link) return link;
    }
  }

  return fallbackLink;
}
function getExtraCosts() {
  const items = [];

  if (toNumber(state.booksAmount) > 0) {
    items.push({
      label: "Textbooks / supplies, yearly estimate",
      low: toNumber(state.booksAmount),
      high: toNumber(state.booksAmount)
    });
  }

  if (toNumber(state.personalAmount) > 0) {
    items.push({
      label: "Personal expenses, yearly estimate",
      low: toNumber(state.personalAmount),
      high: toNumber(state.personalAmount)
    });
  }

  if (state.includeCoop && state.coopInterest === "Yes") {
    const semesterFee = parseAmountFromText(
      readField(state.data?.["Co-op Cost"]?.[0] || {}, ["Co-op Cost"])
    );

    const twoSemesterFee = semesterFee * 2;

    items.push({
      label: "Co-op fee estimate, Fall and Winter",
      low: twoSemesterFee,
      high: twoSemesterFee
    });
  }

  if (state.residencyType === "International") {
    const value = parseAmountFromText(
      readField(state.data?.["Health Insurance Int"]?.[0] || {}, ["Health Insurance"])
    );

    items.push({
      label: "Mandatory health insurance",
      low: value,
      high: value
    });
  }

  return {
    items,
    low: items.reduce((sum, item) => sum + item.low, 0),
    high: items.reduce((sum, item) => sum + item.high, 0)
  };
}

function getOffsets() {
  const items = [];

  if (
    state.residencyType === "Domestic" &&
    state.province === "ON" &&
    toNumber(state.osapFunding) > 0
  ) {
    items.push({
      label:
        state.studentPhase === "current"
          ? "OSAP funding"
          : "Anticipated OSAP funding",
      value: toNumber(state.osapFunding)
    });
  }

  if (
    state.residencyType === "Domestic" &&
    state.province === "Non-ON" &&
    toNumber(state.nonOntarioAidFunding) > 0
  ) {
    items.push({
      label:
        state.studentPhase === "current"
          ? "Student financial assistance"
          : "Anticipated student financial assistance",
      value: toNumber(
        state.nonOntarioAidFunding
      )
    });
  }

  if (toNumber(state.otherScholarshipOffset) > 0) {
    items.push({
      label:
        state.studentPhase === "current"
          ? "Scholarships and bursaries"
          : "Anticipated scholarships and bursaries",
      value: toNumber(
        state.otherScholarshipOffset
      )
    });
  }

  /*
    Future-student part-time earnings are included
    as an offset, but future-student co-op earnings
    are shown for planning only.
  */
  if (state.studentPhase === "future") {
    const PART_TIME_WEEKS_PER_SEMESTER = 12;

    const periodDetails =
      getEstimatePeriodDetails();

    const academicSemesters =
      periodDetails.semesterCount;

    const partTimeEarnings =
      toNumber(
        state.partTimeHoursPerWeek
      ) *
      toNumber(
        state.partTimeHourlyRate
      ) *
      PART_TIME_WEEKS_PER_SEMESTER *
      academicSemesters;

    if (partTimeEarnings > 0) {
      items.push({
        label:
          `Estimated part-time earnings, 12 weeks per semester for ${periodDetails.label}`,
        value: partTimeEarnings
      });
    }
  }

  if (
    state.studentPhase === "current" &&
    toNumber(state.partTimeIncome) > 0
  ) {
    items.push({
      label: "Yearly part-time income",
      value: toNumber(state.partTimeIncome)
    });
  }

  /*
    Only current-student co-op earnings are deducted.

    Future-student co-op earnings are displayed
    separately in yellow and are not added here.
  */
  if (
    state.studentPhase === "current" &&
    state.coopInterest === "Yes"
  ) {
    const COOP_WEEKS_PER_WORK_TERM = 16;

    const coopEarnings =
      toNumber(state.coopHourlyRate) *
      toNumber(state.coopHoursPerWeek) *
      COOP_WEEKS_PER_WORK_TERM;

    if (coopEarnings > 0) {
      items.push({
        label:
          "Estimated co-op earnings for one 16-week work term",
        value: coopEarnings
      });
    }
  }

  if (
    state.studentPhase === "current" &&
    toNumber(state.familySupport) > 0
  ) {
    items.push({
      label: "Family support / savings",
      value: toNumber(state.familySupport)
    });
  }

  return {
    items,
    total: items.reduce(
      (sum, item) => sum + item.value,
      0
    )
  };
}

function renderBreakdownRows(
  title,
  items,
  isOffset = false,
  subtitle = ""
) {
  /*
    Remove rows whose value is entirely zero.
  */
  const visibleItems =
    (items || []).filter(item => {
      if (
        item.low !== undefined &&
        item.high !== undefined
      ) {
        return (
          toNumber(item.low) !== 0 ||
          toNumber(item.high) !== 0
        );
      }

      return toNumber(item.value) !== 0;
    });

  /*
    Do not display the section heading when
    there are no non-zero rows.
  */
  if (!visibleItems.length) {
    return [];
  }

  const rows = [];

  rows.push(`
    <div class="summary-section-heading">
      <h3>
        ${escapeHtml(title)}
      </h3>

      ${
        subtitle
          ? `
            <p>
              ${escapeHtml(subtitle)}
            </p>
          `
          : ""
      }
    </div>
  `);

  visibleItems.forEach(item => {
    let displayValue;
    let valueClass =
      "summary-value";

    if (item.notDeducted) {
      displayValue =
        item.low !== undefined &&
        item.high !== undefined
          ? formatRangeValue(
              item.low,
              item.high
            )
          : formatMoney(
              item.value || 0
            );

      valueClass =
        "summary-value-awareness";
    } else if (isOffset) {
      displayValue =
        `-${formatMoney(item.value)}`;

      valueClass =
        "summary-value-offset";
    } else if (
      item.low !== undefined &&
      item.high !== undefined
    ) {
      displayValue =
        formatRangeValue(
          item.low,
          item.high
        );
    } else {
      displayValue =
        formatMoney(item.value || 0);
    }

    rows.push(`
      <div class="summary-item">
        <div class="summary-item-label">
          <span>
            ${escapeHtml(item.label)}
          </span>

          ${
            item.helpLink
              ? `
                <small>
                  <a
                    href="${escapeHtml(item.helpLink)}"
                    target="_blank"
                    rel="noopener"
                  >
                    ${escapeHtml(
                      item.helpLinkText ||
                      "Learn more"
                    )}
                  </a>
                </small>
              `
              : ""
          }
        </div>

        <div class="${valueClass}">
          ${displayValue}
        </div>
      </div>
    `);
  });

  return rows;
}
function bindResidenceAccordion() {
  const residenceGroups = document.querySelectorAll(
    ".residence-group"
  );

  residenceGroups.forEach(group => {
    group.addEventListener("toggle", () => {
      if (!group.open) return;

      residenceGroups.forEach(otherGroup => {
        if (otherGroup !== group) {
          otherGroup.open = false;
        }
      });
    });
  });
}

function renderOSAPInfo() {
  if (state.residencyType !== "Domestic" || state.province !== "ON") {
    return "";
  }

  return `
    <div class="cost-summary" style="margin-top:20px;">
      <div class="summary-item">
        <label><strong>Ontario Student Assistance Program (OSAP)</strong></label>
        <div></div>
      </div>

      <div style="font-size:13px; line-height:1.55; color:#444;">
        <p>
          OSAP may be available to eligible Ontario students in the form of grants and loans.
          Grants do not need to be repaid and loans are interest-free while students are in full-time studies.
        </p>


        <p>
          OSAP can help with education-related costs such as tuition, books, supplies and basic living expenses.
          It is meant to supplement student and family resources, not replace them.
        </p>

        <div style="
          margin-top:14px;
          padding:14px;
          border:1px solid #d6d6d6;
          border-radius:10px;
          background:#f8f8f8;
        ">
          <strong style="display:block; margin-bottom:6px; color:#333;">
            Planning reminder
          </strong>

          Students should start a new OSAP application each school year and apply early so funding can be processed before fee deadlines.
        </div>

        <div style="
          margin-top:14px;
          padding:14px;
          border-left:5px solid var(--uog-yellow);
          background:#fff9e6;
        ">
          <strong>Note:</strong>
          This estimator does not calculate OSAP funding amounts. Students should apply through OSAP to receive their official assessment.
        </div>
      </div>
    </div>
  `;
}
function renderFutureFundingSummary() {
  if (state.studentPhase !== "future") return "";

  const scholarships =
    state.residencyType === "International"
      ? (state.data["Scholarships for Int"] || [])
      : (state.data["Scholarships for Dom"] || []);

  if (!scholarships.length) return "";

  return `
    <div class="cost-summary" style="margin-top:20px;">
      <div class="summary-item">
        <label><strong>Available funding options</strong></label>
        <div></div>
      </div>

      <div style="font-size:13px; opacity:0.8; margin-bottom:10px;">
        These are possible scholarships and bursaries for ${state.residencyType.toLowerCase()} students. 
        They are shown for awareness only and are not deducted from this estimate.
      </div>

      ${scholarships.map(item => `
        <div class="summary-item">
          <label>
            <strong>${escapeHtml(item["Award Name"] || "Funding option")}</strong>
            <div style="font-size:12px; opacity:0.8;">
              ${escapeHtml(item.Notes || item.Category || "")}
            </div>
          </label>
          <div class="summary-value">${escapeHtml(item.Amount || "Amount varies")}</div>
        </div>
      `).join("")}
    </div>
  `;
}

function readField(obj, keys = []) {
  if (!obj || typeof obj !== "object") return "";
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      return obj[key];
    }
  }

  const normalizedKeys = Object.keys(obj);
  for (const desired of keys) {
    const match = normalizedKeys.find(k => normalize(k) === normalize(desired));
    if (match) return obj[match];
  }

  return "";
}

function normalize(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function normalizeKey(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function toNumber(value) {
  if (value === null || value === undefined || value === "") return 0;
  const cleaned = String(value).replace(/[^0-9.-]/g, "");
  return Number(cleaned) || 0;
}
function parseRangeFromText(text) {
  const values = extractMoneyValues(text);

  if (!values.length) {
    return { low: 0, high: 0 };
  }

  return {
    low: Math.min(...values),
    high: Math.max(...values)
  };
}
function parseAmountFromText(text) {
  const cleaned = String(text || "").replace(/,/g, "");
  const matches = cleaned.match(/(\d+(\.\d+)?)/g);
  if (!matches || !matches.length) return 0;
  return Number(matches[0]) || 0;
}

function formatMoney(value) {
  const formatted =
    new Intl.NumberFormat(
      "en-CA",
      {
        style: "currency",
        currency: "CAD",
        currencyDisplay: "code",
        maximumFractionDigits: 0
      }
    ).format(Number(value) || 0);

  return formatted.replace(
    /^CAD\s*/,
    "CAD "
  );
}

function formatDollarAmount(value) {
  const amount = Number(value) || 0;

  return `$${amount.toLocaleString(
    "en-CA",
    {
      maximumFractionDigits: 0
    }
  )}`;
}

function formatRangeValue(low, high) {
  const safeLow = Number(low) || 0;
  const safeHigh = Number(high) || 0;

  if (safeLow === safeHigh) {
    return formatMoney(safeLow);
  }

  return `${formatMoney(safeLow)} - ${formatMoney(safeHigh)}`;
}

function safeFileNamePart(value, fallback = "Estimate") {
  const cleaned = String(value || fallback)
    .replace(/[^\w\- ]+/g, "")
    .trim();
  return cleaned ? cleaned.replace(/\s+/g, "_") : fallback;
}

function todayDisplay() {
  return new Date().toLocaleString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function drawBrandDivider(doc, x, y, width) {
  const redWidth = width * 0.35;
  const goldWidth = width * 0.30;

  doc.setLineWidth(1.5);

  doc.setDrawColor(229, 25, 55);
  doc.line(x, y, x + redWidth, y);

  doc.setDrawColor(255, 196, 41);
  doc.line(x + redWidth, y, x + redWidth + goldWidth, y);

  doc.setDrawColor(0, 0, 0);
  doc.line(x + redWidth + goldWidth, y, x + width, y);
}
function ensurePDFSpace(
  doc,
  currentY,
  requiredHeight,
  topMargin = 20,
  bottomMargin = 18
) {
  const pageHeight =
    doc.internal.pageSize.getHeight();

  if (
    currentY + requiredHeight >
    pageHeight - bottomMargin
  ) {
    doc.addPage();

    doc.setFillColor(255, 255, 255);
    doc.rect(
      0,
      0,
      doc.internal.pageSize.getWidth(),
      pageHeight,
      "F"
    );

    return topMargin;
  }

  return currentY;
}

function getPDFItemValue(
  item,
  isOffset = false
) {
  if (item.displayValue) {
    return item.displayValue;
  }

  if (isOffset) {
    return `-${formatMoney(item.value || 0)}`;
  }

  if (
    item.low !== undefined &&
    item.high !== undefined
  ) {
    return formatRangeValue(
      item.low,
      item.high
    );
  }

  return formatMoney(item.value || 0);
}

function drawPDFBreakdownSection(
  doc,
  title,
  items,
  startY,
  options = {}
) {
  const {
    isOffset = false,
    emptyText = "None added",
    valueColor = [44, 52, 64]
  } = options;

  const pageWidth =
    doc.internal.pageSize.getWidth();

  const left = 16;
  const right = pageWidth - 16;
  const fullWidth = right - left;

  let y = ensurePDFSpace(
    doc,
    startY,
    20
  );

  const drawHeading = () => {
    doc.setFillColor(248, 248, 248);
    doc.rect(
      left,
      y,
      fullWidth,
      11,
      "F"
    );

    doc.setDrawColor(229, 25, 55);
    doc.setLineWidth(0.5);
    doc.line(
      left,
      y + 11,
      right,
      y + 11
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(44, 52, 64);

    doc.text(
      title,
      left + 4,
      y + 7
    );

    y += 15;
  };

  drawHeading();

  const safeItems =
    items && items.length
      ? items
      : [
          {
            label: emptyText,
            low: 0,
            high: 0
          }
        ];

  safeItems.forEach(item => {
    const labelLines =
      doc.splitTextToSize(
        String(item.label || ""),
        120
      );

    const hasHelpLink =
      Boolean(item.helpLink);

    const rowHeight = Math.max(
      9,
      labelLines.length * 4 +
      (hasHelpLink ? 6 : 3)
    );

    const nextY = ensurePDFSpace(
      doc,
      y,
      rowHeight + 4
    );

    if (nextY !== y) {
      y = nextY;
      drawHeading();
    }

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(9);
    doc.setTextColor(70, 70, 70);

    doc.text(
      labelLines,
      left + 4,
      y + 4
    );

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setTextColor(
      valueColor[0],
      valueColor[1],
      valueColor[2]
    );

    doc.text(
      getPDFItemValue(
        item,
        isOffset
      ),
      right - 4,
      y + 4,
      {
        align: "right"
      }
    );

    if (hasHelpLink) {
      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(7.5);
      doc.setTextColor(24, 123, 180);

      doc.textWithLink(
        item.helpLinkText ||
          "Learn more",
        left + 4,
        y + labelLines.length * 4 + 4,
        {
          url: item.helpLink
        }
      );
    }

    doc.setDrawColor(225, 225, 225);
    doc.setLineWidth(0.2);

    doc.line(
      left + 4,
      y + rowHeight,
      right - 4,
      y + rowHeight
    );

    y += rowHeight + 2;
  });

  return y + 5;
}

function getCostBreakdownChartImage() {
  const canvas =
    document.getElementById(
      "costBreakdownChart"
    );

  if (!canvas) {
    return "";
  }

  try {
    if (costBreakdownChart) {
      costBreakdownChart.stop();
      costBreakdownChart.update("none");
    }

    return canvas.toDataURL(
      "image/png",
      1
    );
  } catch (error) {
    console.warn(
      "The cost breakdown chart could not be captured:",
      error
    );

    return "";
  }
}

function drawPDFCostChart(
  doc,
  startY,
  chartImageData
) {
  const rows =
    getCostBreakdownChartData();

  if (
    !rows.length ||
    !chartImageData
  ) {
    return startY;
  }

  const pageWidth =
    doc.internal.pageSize.getWidth();

  const left = 16;
  const right = pageWidth - 16;

  const colors = [
    [229, 25, 55],
    [255, 196, 41],
    [24, 123, 180],
    [49, 135, 56],
    [0, 0, 0],
    [85, 85, 85],
    [179, 20, 44],
    [19, 95, 139],
    [39, 104, 44]
  ];

  const total = rows.reduce(
    (sum, row) => sum + row.value,
    0
  );

  const preparedRows = rows.map(row => {
    const labelLines =
      doc.splitTextToSize(
        row.label,
        82
      );

    return {
      ...row,
      labelLines,
      percentage:
        total > 0
          ? (
              (row.value / total) *
              100
            ).toFixed(1)
          : "0.0",
      height:
        labelLines.length * 3.7 + 6
    };
  });

  const legendHeight =
    preparedRows.reduce(
      (sum, row) => sum + row.height,
      0
    );

  const chartSize = 68;

  const contentHeight =
    Math.max(
      legendHeight,
      chartSize
    );

  let y = ensurePDFSpace(
    doc,
    startY,
    contentHeight + 25
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(12);
  doc.setTextColor(44, 52, 64);

  doc.text(
    "Estimated Cost Breakdown",
    left,
    y
  );

  y += 6;

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);

  doc.text(
    "Estimated costs by category",
    left,
    y
  );

  y += 9;

  /*
    Legend with category, value and percentage.
  */
  let legendY = y + 1;

  preparedRows.forEach(
    (row, index) => {
      const color =
        colors[index % colors.length];

      doc.setFillColor(
        color[0],
        color[1],
        color[2]
      );

      doc.rect(
        left,
        legendY - 3,
        4,
        4,
        "F"
      );

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(7.5);
      doc.setTextColor(44, 52, 64);

      doc.text(
        row.labelLines,
        left + 7,
        legendY
      );

      const valueY =
        legendY +
        row.labelLines.length * 3.7;

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(7.2);
      doc.setTextColor(90, 90, 90);

      doc.text(
        `${formatMoney(row.value)} (${row.percentage}%)`,
        left + 7,
        valueY
      );

      legendY += row.height;
    }
  );

  /*
    Doughnut chart.
  */
  try {
    doc.addImage(
      chartImageData,
      "PNG",
      right - chartSize,
      y,
      chartSize,
      chartSize
    );
  } catch (error) {
    console.warn(
      "The doughnut chart could not be added to the PDF:",
      error
    );
  }

  /*
    Total represented by the doughnut chart.
  */
  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(8);
  doc.setTextColor(44, 52, 64);

  doc.text(
    `Total costs shown: ${formatMoney(total)}`,
    right - chartSize / 2,
    y + chartSize + 6,
    {
      align: "center"
    }
  );

  return (
    y +
    Math.max(
      contentHeight,
      chartSize + 7
    ) +
    9
  );
}
function addEstimatePDFFooters(doc) {
  const pageCount =
    doc.getNumberOfPages();

  const pageWidth =
    doc.internal.pageSize.getWidth();

  const pageHeight =
    doc.internal.pageSize.getHeight();

  const left = 16;
  const right = pageWidth - 16;
  const fullWidth = right - left;

  const disclaimer =
    "This document is an estimate only and does not replace official tuition, fee, housing, meal plan, scholarship or funding information published by the University of Guelph.";

  for (
    let pageNumber = 1;
    pageNumber <= pageCount;
    pageNumber += 1
  ) {
    doc.setPage(pageNumber);

    /*
      Cover the reserved footer area so the
      footer remains clean and readable.
    */
    doc.setFillColor(255, 255, 255);

    doc.rect(
      left,
      pageHeight - 17,
      fullWidth,
      13,
      "F"
    );

    doc.setDrawColor(225, 225, 225);
    doc.setLineWidth(0.2);

    doc.line(
      left,
      pageHeight - 17,
      right,
      pageHeight - 17
    );

    doc.setFont(
      "helvetica",
      "italic"
    );

    doc.setFontSize(6.8);
    doc.setTextColor(100, 100, 100);

    const disclaimerLines =
      doc.splitTextToSize(
        disclaimer,
        fullWidth - 22
      );

    doc.text(
      disclaimerLines,
      left,
      pageHeight - 12
    );

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);

    doc.text(
      `Page ${pageNumber} of ${pageCount}`,
      right,
      pageHeight - 9,
      {
        align: "right"
      }
    );
  }

  /*
    Return to the final page before saving.
  */
  doc.setPage(pageCount);
}
function finishEstimatePDF(
  doc,
  startY = 24,
  chartImageData = ""
) {
  const pageWidth =
    doc.internal.pageSize.getWidth();

  const pageHeight =
    doc.internal.pageSize.getHeight();

  const left = 16;
  const right = pageWidth - 16;
  const fullWidth = right - left;

  let y = startY;

  const result =
    state.result || emptyResult();
  const periodDetails =
    getEstimatePeriodDetails();
  const residenceSelection =
    state.housingType === "OnCampus"
      ? state.residence || "Not selected"
      : state.housingType === "OffCampus"
        ? "Off campus"
        : "Not selected";

  const roomTypeSelection =
    state.housingType === "OnCampus"
      ? state.roomType || "Not selected"
      : "None";

  const mealPlanSelection =
    state.mealPlan &&
    state.mealPlan !== "None"
      ? state.mealPlan
      : "None";

  /*
    Main heading
  */
  doc.setTextColor(44, 52, 64);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);

  doc.text(
    "Cost Estimate Summary",
    left,
    y
  );

  y += 6;

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);

  doc.text(
    `Generated: ${todayDisplay()}`,
    left,
    y
  );

  y += 8;

  drawBrandDivider(
    doc,
    left,
    y,
    fullWidth
  );

  y += 10;

  /*
    Estimated total
  */
  doc.setFillColor(248, 248, 248);
  doc.setDrawColor(205, 205, 205);
  doc.setLineWidth(0.6);

  doc.rect(
    left,
    y,
    fullWidth,
    25,
    "FD"
  );

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(9);
  doc.setTextColor(90, 90, 90);

  doc.text(
    periodDetails.totalLabel,
    left + 4,
    y + 10
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(12);
  doc.setTextColor(44, 52, 64);

  doc.text(
    formatRangeValue(
      result.low,
      result.high
    ),
    right - 4,
    y + 10,
    {
      align: "right"
    }
  );

  if (
    state.currencyCode &&
    state.currencyCode !== "CAD" &&
    state.currencyRate
  ) {
    const convertedLow =
      result.low * state.currencyRate;

    const convertedHigh =
      result.high * state.currencyRate;

    const convertedText =
      convertedLow === convertedHigh
        ? formatCurrency(
            convertedLow,
            state.currencyCode
          )
        : `${
            formatCurrency(
              convertedLow,
              state.currencyCode
            )
          } - ${
            formatCurrency(
              convertedHigh,
              state.currencyCode
            )
          }`;

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);

    doc.text(
      `Approx. ${convertedText}`,
      right - 4,
      y + 17,
      {
        align: "right"
      }
    );
  }

  y += 34;

  /*
    Student selections
  */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(44, 52, 64);

  doc.text(
    "Student Selections",
    left,
    y
  );

  y += 7;

  const leftSelections = [
    ["Student type", state.studentPhase || "N/A"],
    ["Residency", state.residencyType || "N/A"],
    ["Level", state.level || "N/A"],
    ["Province", state.province || "N/A"],
    ["Program", state.program || "N/A"],
    ["Major", state.major || "N/A"]
  ];

  const rightSelections = [
    ["Campus", state.campus || "N/A"],
    ["Cohort", state.cohortYear || "N/A"],
    ["Residence", residenceSelection],
    ["Room type", roomTypeSelection],
    ["Meal plan", mealPlanSelection],
    [
      "Co-op",
      state.coopInterest === "Yes"
        ? "Yes"
        : "No"
    ]
  ];

  const selectionBoxHeight = 49;

  doc.setFillColor(248, 248, 248);
  doc.setDrawColor(220, 220, 220);

  doc.rect(
    left,
    y,
    fullWidth,
    selectionBoxHeight,
    "FD"
  );

  leftSelections.forEach(
    ([label, value], index) => {
      const lineY =
        y + 7 + index * 7;

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(8.5);
      doc.setTextColor(100, 100, 100);

      doc.text(
        `${label}:`,

        left + 4,
        lineY
      );

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setTextColor(44, 52, 64);

      doc.text(
        String(value).slice(0, 35),
        left + 32,
        lineY
      );
    }
  );

  rightSelections.forEach(
    ([label, value], index) => {
      const lineY =
        y + 7 + index * 7;

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(8.5);
      doc.setTextColor(100, 100, 100);

      doc.text(
        `${label}:`,
        110,
        lineY
      );

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setTextColor(44, 52, 64);

      doc.text(
        String(value).slice(0, 30),
        138,
        lineY
      );
    }
  );

  y += selectionBoxHeight + 12;

  /*
    Detailed estimate
  */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(44, 52, 64);

  doc.text(
    "Detailed Estimate",
    left,
    y
  );

  y += 8;

  y = drawPDFBreakdownSection(
    doc,
    "Tuition and Compulsory Fees",
    result.tuition.items,
    y
  );

  y = drawPDFBreakdownSection(
    doc,
    "Living Costs",
    result.living.items,
    y
  );

  y = drawPDFBreakdownSection(
    doc,
    "Extra Costs",
    result.extras.items,
    y
  );

  y = drawPDFBreakdownSection(
    doc,
    "Funding and Offsets",
    result.offsets.items,
    y,
    {
      isOffset: true
    }
  );

  /*
    Potential co-op earnings for future students.
    This amount is not part of the final total.
  */
  if (
    state.studentPhase === "future" &&
    state.coopInterest === "Yes"
  ) {
    const hourlyRate =
      toNumber(state.coopHourlyRate);

    const hoursPerWeek =
      toNumber(state.coopHoursPerWeek);

    const potentialCoopEarnings =
      hourlyRate *
      hoursPerWeek *
      16;

    if (potentialCoopEarnings > 0) {
      y = drawPDFBreakdownSection(
        doc,
        "Potential Co-op Earnings",
        [
          {
            label:
              `Estimated earnings for one 16-week work term, based on ${formatMoney(hourlyRate)} per hour and ${hoursPerWeek} hours per week`,
            displayValue:
              formatMoney(
                potentialCoopEarnings
              )
          }
        ],
        y,
        {
          valueColor: [138, 98, 0]
        }
      );

      y = ensurePDFSpace(
        doc,
        y,
        18
      );

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(8);
      doc.setTextColor(90, 90, 90);

      const coopNote =
        "This potential income is shown for planning only and is not included in the final estimate.";

      const coopNoteLines =
        doc.splitTextToSize(
          coopNote,
          fullWidth
        );

      doc.text(
        coopNoteLines,
        left,
        y
      );

      y += coopNoteLines.length * 4 + 2;

      doc.setTextColor(24, 123, 180);

      doc.textWithLink(
        "View the University of Guelph Co-op Salary Guide",
        left,
        y,
        {
          url: coopSalaryGuideLink
        }
      );

      y += 9;
    }
  }

  /*
    Pie chart
  */
  y = drawPDFCostChart(
    doc,
    y,
    chartImageData
  );

 
  
  /*
  Add the disclaimer and page numbers to the
  existing pages without creating a new page.
*/
  addEstimatePDFFooters(doc);

  const fileName =
    `UofG_Cost_Estimate_${
      safeFileNamePart(
        state.program,
        "Student"
      )
    }.pdf`;

  doc.save(fileName);
}

async function loadImageAsDataUrl(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load image: ${response.status} ${response.statusText}`);
  }

  const blob = await response.blob();

  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function generateEstimatePDF() {
  calculateEstimate();

  const { jsPDF } =
    window.jspdf || {};

  if (!jsPDF) {
    throw new Error(
      "jsPDF is not loaded."
    );
  }

  /*
    Capture the currently rendered doughnut chart.
  */
  const chartImageData =
    getCostBreakdownChartImage();

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth =
    doc.internal.pageSize.getWidth();

  const pageHeight =
    doc.internal.pageSize.getHeight();

  const left = 16;

  doc.setFillColor(255, 255, 255);

  doc.rect(
    0,
    0,
    pageWidth,
    pageHeight,
    "F"
  );

  const logo = new Image();

  let imageLoaded = false;
  let contentStartY = 24;

  try {
    const imageDataUrl =
      await loadImageAsDataUrl(
        "./image.png"
      );

    logo.src = imageDataUrl;

    await new Promise(
      (resolve, reject) => {
        logo.onload = resolve;
        logo.onerror = reject;
      }
    );

    imageLoaded = true;
  } catch (error) {
    console.warn(
      "image.png could not be loaded for PDF:",
      error
    );
  }

  if (imageLoaded) {
    try {
      const imageWidth =
        logo.naturalWidth || 1;

      const imageHeight =
        logo.naturalHeight || 1;

      const maxWidth =
        pageWidth - 32;

      const maxHeight = 18;

      const ratio = Math.min(
        maxWidth / imageWidth,
        maxHeight / imageHeight
      );

      const finalWidth =
        imageWidth * ratio;

      const finalHeight =
        imageHeight * ratio;

      const x = left;
      const imageY = 8;

      doc.addImage(
        logo,
        "PNG",
        x,
        imageY,
        finalWidth,
        finalHeight
      );

      contentStartY =
        imageY + finalHeight + 12;
    } catch (error) {
      console.warn(
        "Logo could not be added to PDF:",
        error
      );
    }
  }

  finishEstimatePDF(
    doc,
    contentStartY,
    chartImageData
  );
}

