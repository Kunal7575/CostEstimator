const feedbackFormLink = "https://forms.cloud.microsoft/r/ZemQx8yRbg";
const state = {
  osapFunding: 0,
  data: null,
  currentStep: 0,

  studentPhase: "",            // future | current
  residencyType: "",           // Domestic | International
  province: "",                // ON | Non-ON | INT
  livingInCanada: "",
  canadianCitizen: "",
  permanentResident: "",
  level: "",                   // UG | GR
  campus: "",
  cohortYear: "",
  program: "",
  major: "",
  country: "",

  includeBooks: false,
  includePersonal: false,
  includeCoop: false,
  includePartTimeEarnings: false,
  includeCoopEarnings: false,
  coopInterest: "Yes",
  futureMealPlanInterest: "No",

  housingType: "None",         // None | OnCampus | OffCampus
  residence: "",
  mealPlan: "",
  offCampusType: "",
  currentOffCampusRent: 0,
  currentOffCampusFood: 0,

  otherScholarshipOffset: 0,
  scholarshipOffset: 0,
  selectedScholarshipKeys: [],
  partTimeIncome: 0,
  coopEarningsOffset: 0,
  familySupport: 0,
  
  fullName: "",
  email: "",
  marketingConsent: false,

  matchedTuitionRecord: null,
  result: null,

  booksAmount: 0,
  personalAmount: 0,
  partTimeHoursPerWeek: 10,
  partTimeHourlyRate: 20,
  coopWeeklyEarnings: 2500,
  coopWeeks: 16,

  currencyCode: "",
  currencyRate: null,
  currencyLoading: false,
  currencyError: "",
  showStep2Error: false,
  step2ErrorMessage: "",
  dataLoadError: false
};

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
  bindScrollTop();
  await loadData();
  calculateEstimate();
  renderCurrentStep();
}

let SUPPORTED_CURRENCIES = [];



async function loadData() {
  try {
    const res = await fetch("./data.json");
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

function setupWelcomeImage() {
  return;
}


function deriveFutureResidency() {
  if (state.studentPhase !== "future") return;

  if (state.canadianCitizen === "Yes") {
    state.residencyType = "Domestic";
    state.country = "";

    if (state.province === "INT") {
      state.province = "";
    }
  }

  if (state.canadianCitizen === "No") {
    state.residencyType = "International";
    state.province = "INT";
    state.country = state.country || "";
  }

  state.permanentResident = "";
}

function updateChrome() {
  const stepTitles = {
    0: "Welcome",
    1: "Academic profile",
    2: "Program and tuition",
    3: "Additional costs and funding",
    4: "Living costs",
    5: "Estimate summary"
  };

  const stepSubtitles = {
    0: "Start your estimate.",
    1: "Choose the student and residency path that applies to you.",
    2: "Select the year, campus, and program for the estimate.",
    3: "Add optional costs and funding information.",
    4: "Include housing and meal plan costs if applicable.",
    5: "Review the estimate and choose how to save it."
  };

  const topStatusCard = document.getElementById("topStatusCard");
  const progressInline = document.getElementById("progressInline");
  const showChrome = state.currentStep > 0;

  if (topStatusCard) topStatusCard.style.display = showChrome ? "flex" : "none";
  if (progressInline) progressInline.style.display = showChrome ? "flex" : "none";

  const statusEyebrow = document.getElementById("statusEyebrow");
  const statusTitle = document.getElementById("statusTitle");
  const statusSubtitle = document.getElementById("statusSubtitle");

  if (statusEyebrow) statusEyebrow.textContent = `Step ${state.currentStep} of 5`;
  if (statusTitle) statusTitle.textContent = stepTitles[state.currentStep] || "";
  if (statusSubtitle) statusSubtitle.textContent = stepSubtitles[state.currentStep] || "";

  const progressPct = Math.round((state.currentStep / 5) * 100);
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
  setupWelcomeImage();
  updateChrome();
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
        <p class="section-kicker">Planning tool</p>
        <h2 class="step-title">Cost Estimator</h2>
        <p class="step-description">
          Use this tool to build an estimated cost range based on student type, program,
          living costs, and optional expenses.
        </p>
      </div>

      <div class="step-content">
        ${renderAlert(
          "Estimate notice",
          "This estimator is for planning purposes only and does not replace official University of Guelph tuition, fee, housing, meal plan, scholarship, or funding information.",
          "yellow"
        )}

        <div class="choice-row welcome-choice-row">
          <button class="choice-card ${state.studentPhase === "future" ? "selected" : ""}" data-value="future" type="button">
            <span class="choice-card-title">Future student</span>
            <span class="choice-card-text">For prospective students and applicants planning ahead.</span>
          </button>

          <button class="choice-card ${state.studentPhase === "current" ? "selected" : ""}" data-value="current" type="button">
            <span class="choice-card-title">Current or returning student</span>
            <span class="choice-card-text">For students who already know their program and want a more specific estimate.</span>
          </button>
        </div>

        <div class="step-actions welcome-actions">
          <button class="btn-primary btn-lg" id="startBtn" type="button">
            Start estimate
          </button>
        </div>

        
  `;
}


function renderStep1() {
  return `
    <div class="step-container">
      <div class="step-header">
        <p class="section-kicker">Academic profile</p>
        <h2 class="step-title">Tell us about your student path</h2>
        <p class="step-description">These answers help determine the correct tuition and fee pathway.</p>
      </div>

      <div class="step-content">
        <div class="form-stack">
          <div class="form-group">
            <label for="studentPhase">Student type</label>
            <select id="studentPhase" class="step-dropdown">
              <option value="">Select student type</option>
              <option value="future" ${state.studentPhase === "future" ? "selected" : ""}>Future student</option>
              <option value="current" ${state.studentPhase === "current" ? "selected" : ""}>Current / returning student</option>
            </select>
          </div>

          ${
            state.studentPhase === "future"
              ? `
                <div class="form-group">
                  <label for="livingInCanada">Are you currently living in Canada?</label>
                  <select id="livingInCanada" class="step-dropdown">
                    <option value="">Select an option</option>
                    <option value="Yes" ${state.livingInCanada === "Yes" ? "selected" : ""}>Yes</option>
                    <option value="No" ${state.livingInCanada === "No" ? "selected" : ""}>No</option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="canadianCitizen">Are you a Canadian citizen or permanent resident of Canada?</label>
                  <select id="canadianCitizen" class="step-dropdown">
                    <option value="">Select an option</option>
                    <option value="Yes" ${state.canadianCitizen === "Yes" ? "selected" : ""}>Yes</option>
                    <option value="No" ${state.canadianCitizen === "No" ? "selected" : ""}>No</option>
                  </select>
                </div>
              `
              : `
                <div class="form-group">
                  <label for="residencyType">Residency type</label>
                  <select id="residencyType" class="step-dropdown">
                    <option value="">Select residency type</option>
                    <option value="Domestic" ${state.residencyType === "Domestic" ? "selected" : ""}>Domestic</option>
                    <option value="International" ${state.residencyType === "International" ? "selected" : ""}>International</option>
                  </select>
                </div>
              `
          }

          <div class="form-group">
            <label for="level">${state.studentPhase === "future" ? "Study level" : "Level"}</label>
            <select id="level" class="step-dropdown">
              <option value="">Select level</option>
              <option value="UG" ${state.level === "UG" ? "selected" : ""}>Undergraduate</option>
              <option value="GR" ${state.level === "GR" ? "selected" : ""}>Graduate</option>
            </select>
          </div>

          ${
            state.residencyType === "Domestic"
              ? `
                <div class="form-group" id="provinceGroup">
                  <label for="province">I am applying from</label>
                  <select id="province" class="step-dropdown">
                    <option value="">Select province</option>
                    <option value="ON" ${state.province === "ON" ? "selected" : ""}>Ontario</option>
                    <option value="Non-ON" ${state.province === "Non-ON" ? "selected" : ""}>Outside Ontario</option>
                  </select>
                </div>
              `
              : ""
          }

          
        </div>
      </div>

      <div class="step-footer">
        <div></div>
        <button class="btn-primary" id="nextStep1" type="button">Continue</button>
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


function renderStep2() {
  if (state.studentPhase === "current" && !state.cohortYear) {
    state.cohortYear = getLatestCurrentCohortYear();
  }

  const campuses = getAvailableCampuses();
  const cohortYears = getAvailableCohortYears();
  const programs = getAvailablePrograms().sort((a, b) => a.localeCompare(b));
  const majors = getAvailableMajors();
  const programHasMajors = majors.length > 0;
  const countries = getAvailableCountries();

  const externalCampusSelected = isExternalCampusSelected();

  const coopStatus = getFutureProgramCoopStatus();
  const isUG = state.level === "UG";
  const coopDisabled = isUG && state.major && coopStatus !== "Yes";

  if (isUG && state.major && coopStatus === "Yes" && !state.coopInterest) {
    state.coopInterest = "Yes";
    state.includeCoop = true;
  }

  if (coopDisabled) {
    state.coopInterest = "No";
    state.includeCoop = false;
    state.includeCoopEarnings = false;
  }

  if (state.campus && !campuses.includes(state.campus)) {
    state.campus = "";
    state.program = "";
    state.major = "";
    state.matchedTuitionRecord = null;
  }

  if (state.program && !programs.includes(state.program)) {
    state.program = "";
    state.major = "";
    state.matchedTuitionRecord = null;
  }

  if (state.major && !majors.includes(state.major)) {
    state.major = "";
    state.matchedTuitionRecord = null;
  }

  const currentStudentYear =
    state.studentPhase === "current" ? state.cohortYear : "";

  return `
    <div class="step-container">
      <div class="step-header">
        <p class="section-kicker">Program and tuition</p>
        <h2 class="step-title">Select your program details</h2>
        <p class="step-description">
          Choose the campus, program, and major used to match tuition data.
        </p>
      </div>

      <div class="step-content">
        <div class="form-stack">

          ${
            state.studentPhase === "future"
              ? `
                <div class="form-group">
                  <label for="cohortYear">Expected start year</label>
                  <select id="cohortYear" class="step-dropdown">
                    <option value="">Select target year</option>
                    ${cohortYears.map(y => `
                      <option value="${escapeHtml(y)}" ${state.cohortYear === y ? "selected" : ""}>
                        ${escapeHtml(y)}
                      </option>
                    `).join("")}
                  </select>
                </div>
              `
              : `
                <div class="form-group">
                  <label>Year</label>
                  <div class="readonly-field">
                    ${escapeHtml(currentStudentYear || "Not available")}
                  </div>
                </div>
              `
          }

          ${
            state.studentPhase === "future" &&
            state.residencyType === "International"
              ? `
                <div class="form-group">
                  <label for="country">Country you are applying from</label>
                  <select id="country" class="step-dropdown">
                    <option value="">Select country</option>
                    ${countries.map(country => `
                      <option value="${escapeHtml(country)}" ${state.country === country ? "selected" : ""}>
                        ${escapeHtml(country)}
                      </option>
                    `).join("")}
                  </select>
                  ${renderCurrencyBadge()}
                </div>
              `
              : ""
          }

          <div class="form-group">
            <label for="campus">Campus</label>
            <select id="campus" class="step-dropdown">
              <option value="">Select campus</option>
              ${campuses.map(c => `
                <option value="${escapeHtml(c)}" ${state.campus === c ? "selected" : ""}>
                  ${escapeHtml(c)}
                </option>
              `).join("")}
            </select>
          </div>

          ${
            externalCampusSelected
              ? renderExternalCampusStopScreen()
              : `
                <div class="form-group">
                  <label for="program">Program</label>
                  <select id="program" class="step-dropdown">
                    <option value="">Select program</option>
                    ${programs.map(p => `
                      <option value="${escapeHtml(p)}" ${state.program === p ? "selected" : ""}>
                        ${escapeHtml(p)}
                      </option>
                    `).join("")}
                  </select>
                </div>

                ${
                  isUG && state.program && programHasMajors
                    ? `
                      <div class="form-group">
                        <label for="major">Major</label>
                        <select id="major" class="step-dropdown">
                          <option value="">Select major</option>
                          ${majors.map(m => `
                            <option value="${escapeHtml(m)}" ${state.major === m ? "selected" : ""}>
                              ${escapeHtml(m)}
                            </option>
                          `).join("")}
                        </select>
                      </div>
                    `
                    : ""
                }

                ${
                  state.program && (!isUG || !programHasMajors || state.major)
                    ? `
                      <div class="form-group">
                        <label for="coopInterest">
                          ${state.studentPhase === "future" ? "Interested in co-op?" : "Enrolled in co-op?"}
                        </label>
                        <select id="coopInterest" class="step-dropdown" ${coopDisabled ? "disabled" : ""}>
                          <option value="Yes" ${state.coopInterest === "Yes" ? "selected" : ""}>Yes</option>
                          <option value="No" ${state.coopInterest === "No" ? "selected" : ""}>No</option>
                        </select>
                      </div>
                    `
                    : ""
                }

                ${renderCampusGallery()}

                ${
                  isUG &&
                  state.program &&
                  programHasMajors &&
                  state.major &&
                  coopStatus === "No"
                    ? renderAlert(
                        "Co-op not available",
                        "Co-op is not listed as available for this major, so the co-op option has been turned off.",
                        "red"
                      )
                    : ""
                }
              `
          }

          ${
            state.studentPhase === "future"
              ? `
                <p class="small-estimate-notice">
                  Costs are based on the most recent available information and are estimates only. Amounts are subject to change.
                </p>
              `
              : ""
          }

        </div>
      </div>

      <div class="step-footer">
        <button class="btn-secondary" id="backStep2" type="button">Back</button>

        ${
          externalCampusSelected
            ? ""
            : `
              <button class="btn-primary" id="nextStep2" type="button">
                Continue
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
function renderStep3() {
  const defaultPartTimeRate = parseAmountFromText(
    readField(state.data?.["Part-Time_earnings"]?.[0] || {}, ["Part-Time_earnings"])
  ) || 20;

  const defaultBooks = parseAmountFromText(
    readField(state.data?.Textbooks?.[0] || {}, ["Txtbooks", "Textbooks"])
  ) || 1400;

  const defaultPersonal = parseAmountFromText(
    readField(state.data?.["Personal Expenses"]?.[0] || {}, ["Personal Expenses"])
  ) || 2500;

  const coopRange = parseRangeFromText(
    readField(state.data?.["Co-op Cost"]?.[0] || {}, ["Coop Earnings", "Co-op Earnings"])
  );

  if (!state.booksAmount) state.booksAmount = defaultBooks;
  if (!state.personalAmount) state.personalAmount = defaultPersonal;
  if (!state.osapFunding) state.osapFunding = 0;

  if (state.studentPhase === "future") {
    if (!state.partTimeHoursPerWeek) state.partTimeHoursPerWeek = 10;
    if (!state.partTimeHourlyRate) state.partTimeHourlyRate = defaultPartTimeRate;
    if (!state.coopWeeklyEarnings) state.coopWeeklyEarnings = coopRange.high || 2500;
    if (!state.coopWeeks) state.coopWeeks = 16;
  }

  return `
    <div class="step-container">
      <div class="step-header">
        <p class="section-kicker">Additional costs and funding</p>
        <h2 class="step-title">Add optional costs and funding</h2>
        <p class="step-description">
          ${
            state.studentPhase === "future"
              ? "Review and adjust estimated expenses and potential funding."
              : "Review and adjust estimated expenses and funding."
          }
        </p>
      </div>

      <div class="step-content">
        <div class="form-stack">

          <div class="form-group">
            <label for="booksAmount">Estimated textbooks / supplies</label>
            <input
              id="booksAmount"
              class="step-input"
              type="number"
              min="0"
              value="${escapeHtml(state.booksAmount)}"
            />
          </div>

          <div class="form-group">
            <label for="personalAmount">Estimated personal expenses</label>
            <input
              id="personalAmount"
              class="step-input"
              type="number"
              min="0"
              value="${escapeHtml(state.personalAmount)}"
            />
          </div>

          ${
            state.studentPhase === "future"
              ? `
                <div class="form-group">
                  <h3 class="subsection-title">Potential part-time earnings</h3>

                  <label for="partTimeHoursPerWeek">Hours per week</label>
                  <input
                    id="partTimeHoursPerWeek"
                    class="step-input"
                    type="number"
                    min="0"
                    value="${escapeHtml(state.partTimeHoursPerWeek)}"
                  />
                </div>

                <div class="form-group">
                  <label for="partTimeHourlyRate">Hourly rate</label>
                  <input
                    id="partTimeHourlyRate"
                    class="step-input"
                    type="number"
                    min="0"
                    value="${escapeHtml(state.partTimeHourlyRate)}"
                  />
                </div>

                ${
                  state.coopInterest === "Yes"
                    ? `
                      <div class="form-group">
                        <h3 class="subsection-title">Potential co-op earnings</h3>

                        <label for="coopWeeklyEarnings">Estimated weekly co-op earnings</label>
                        <input
                          id="coopWeeklyEarnings"
                          class="step-input"
                          type="number"
                          min="0"
                          value="${escapeHtml(state.coopWeeklyEarnings)}"
                        />

                        <p class="form-help-text">
                          Suggested range: ${formatRangeValue(coopRange.low, coopRange.high)} per week.
                          Use the Co-op Salary Guide in the helpful resources section below.
                        </p>
                      </div>

                      <div class="form-group">
                        <label for="coopWeeks">Estimated co-op weeks</label>
                        <input
                          id="coopWeeks"
                          class="step-input"
                          type="number"
                          min="0"
                          value="${escapeHtml(state.coopWeeks)}"
                        />
                      </div>
                    `
                    : ""
                }

                ${
                  state.residencyType === "Domestic"
                    ? `
                      <div class="form-group">
                        <label for="osapFunding">Estimated OSAP funding</label>
                        <input
                          id="osapFunding"
                          class="step-input"
                          type="number"
                          min="0"
                          value="${escapeHtml(state.osapFunding)}"
                          placeholder="Enter estimated OSAP funding"
                        />
                        <p class="form-help-text">
                          Use the OSAP Aid Estimator in the helpful resources section below.
                        </p>
                      </div>
                    `
                    : ""
                }

                ${renderAlert(
                  "Planning estimate",
                  "These values are pre-filled using available planning data, but you can adjust them based on your situation.",
                  "grey"
                )}

                ${renderSuccessStories()}
              `
              : `
                <div class="form-group">
                  <label for="partTimeIncome">Expected part-time income</label>
                  <input
                    id="partTimeIncome"
                    class="step-input"
                    type="number"
                    min="0"
                    value="${escapeHtml(state.partTimeIncome)}"
                    placeholder="Enter expected yearly part-time income"
                  />
                </div>

                ${
                  state.residencyType === "Domestic"
                    ? `
                      <div class="form-group">
                        <label for="osapFunding">Estimated OSAP funding</label>
                        <input
                          id="osapFunding"
                          class="step-input"
                          type="number"
                          min="0"
                          value="${escapeHtml(state.osapFunding)}"
                          placeholder="Enter estimated OSAP funding"
                        />
                        <p class="form-help-text">
                          Use the OSAP Aid Estimator in the helpful resources section below.
                        </p>
                      </div>
                    `
                    : ""
                }

                <div class="form-group">
                  <label for="otherScholarshipOffset">Scholarships and bursaries (yearly total)</label>
                  <input
                    id="otherScholarshipOffset"
                    class="step-input"
                    type="number"
                    min="0"
                    value="${escapeHtml(state.otherScholarshipOffset)}"
                    placeholder="Enter total yearly scholarships and bursaries"
                  />
                </div>

                ${
                  state.coopInterest === "Yes"
                    ? `
                      <div class="form-group">
                        <label for="coopEarningsOffset">Expected co-op earnings</label>
                        <input
                          id="coopEarningsOffset"
                          class="step-input"
                          type="number"
                          min="0"
                          value="${escapeHtml(state.coopEarningsOffset)}"
                          placeholder="Enter expected co-op earnings"
                        />
                        <p class="form-help-text">
                          See the Co-op Salary Guide in the helpful resources section below.
                        </p>
                      </div>
                    `
                    : ""
                }

                <div class="form-group">
                  <label for="familySupport">Family support / savings</label>
                  <input
                    id="familySupport"
                    class="step-input"
                    type="number"
                    min="0"
                    value="${escapeHtml(state.familySupport)}"
                    placeholder="Enter support from family, savings, or other funding"
                  />
                </div>
              `
          }
        </div>
      </div>

      <div class="step-footer">
        <button class="btn-secondary" id="backStep3" type="button">Back</button>
        <button class="btn-primary" id="nextStep3" type="button">Continue</button>
      </div>
    </div>
  `;
}

function renderStep4() {
  const isFutureStudent = state.studentPhase === "future";
  const onCampusOptions = getOnCampusResidenceOptions();
  const mealPlanOptions = getMealPlanOptions();

  return `
    <div class="step-container">
      <div class="step-header">
        <p class="section-kicker">Living costs</p>
        <h2 class="step-title">Add living cost assumptions</h2>
        <p class="step-description">Choose whether to include housing and meal plan estimates.</p>
      </div>

      <div class="step-content">
        <div class="form-stack">
          <div class="form-group">
            <label for="housingType">Housing</label>
            <select id="housingType" class="step-dropdown">
              <option value="None" ${state.housingType === "None" ? "selected" : ""}>None</option>
              <option value="OnCampus" ${state.housingType === "OnCampus" ? "selected" : ""}>On-campus</option>
              <option value="OffCampus" ${state.housingType === "OffCampus" ? "selected" : ""}>Off-campus</option>
            </select>
          </div>

          ${
            isFutureStudent && state.housingType !== "OnCampus"
              ? `
                <div class="form-group">
                  <label for="futureMealPlanInterest">Include a meal plan estimate?</label>
                  <select id="futureMealPlanInterest" class="step-dropdown">
                    <option value="No" ${state.futureMealPlanInterest === "No" ? "selected" : ""}>No</option>
                    <option value="Yes" ${state.futureMealPlanInterest === "Yes" ? "selected" : ""}>Yes</option>
                  </select>
                </div>
              `
              : ""
          }

          ${
            !isFutureStudent && state.housingType === "OnCampus"
              ? `
                <div class="form-group">
                  <label for="residence">Residence</label>
                  <select id="residence" class="step-dropdown">
                    <option value="">Select residence</option>
                    ${onCampusOptions.map(item => `<option value="${escapeHtml(item.value)}" ${state.residence === item.value ? "selected" : ""}>${escapeHtml(item.label)}</option>`).join("")}
                  </select>
                </div>

                <div class="form-group">
                  <label for="mealPlan">Meal plan</label>
                  <select id="mealPlan" class="step-dropdown">
                    <option value="">Select meal plan</option>
                    ${mealPlanOptions.map(item => `<option value="${escapeHtml(item.value)}" ${state.mealPlan === item.value ? "selected" : ""}>${escapeHtml(item.label)}</option>`).join("")}
                  </select>
                </div>
              `
              : ""
          }

          ${
            !isFutureStudent && state.housingType === "OffCampus"
              ? `
                <div class="form-group">
                  <label for="currentOffCampusRent">Yearly rent</label>
                  <input id="currentOffCampusRent" class="step-input" type="number" min="0" value="${escapeHtml(state.currentOffCampusRent)}" placeholder="Enter yearly rent" />
                </div>

                <div class="form-group">
                  <label for="currentOffCampusFood">Yearly food expense</label>
                  <input id="currentOffCampusFood" class="step-input" type="number" min="0" value="${escapeHtml(state.currentOffCampusFood)}" placeholder="Enter yearly food expense" />
                </div>
              `
              : ""
          }

          ${renderAlert("Living cost notice", "Living costs are planning estimates and may vary by year, room choice, meal plan, and market conditions.", "yellow")}
        </div>
      </div>

      <div class="step-footer">
        <button class="btn-secondary" id="backStep4" type="button">Back</button>
        <button class="btn-primary" id="nextStep4" type="button">Build estimate</button>
      </div>
    </div>
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

function renderStep5() {
  const result = state.result || emptyResult();

  return `
    <div class="step-container">
      <div class="step-header">
        <p class="section-kicker">Estimate summary for 2 academic semesters (Fall & Winter)</p>
        <h2 class="step-title">Review your estimate</h2>
        <p class="step-description">
          This is your two-semester estimate for Fall and Winter. It is not a full academic-year estimate.
        </p>
      </div>

      <div class="step-content">

        <div class="estimate-total-card">
          <span class="estimate-total-label">Estimated range for 2 academic semesters (Fall & Winter)</span>
          <strong>${formatRangeValue(result.low, result.high)}</strong>
          ${getConvertedRangeText(result.low, result.high)}
        </div>

        <div class="cost-summary">
          ${renderBreakdownRows(
            state.major
              ? `${state.major} (${state.program})`
              : state.program || "Tuition and fees",
            result.tuition.items
          ).join("")}
          ${renderBreakdownRows("Living costs", result.living.items).join("")}
          ${renderBreakdownRows("Extra costs", result.extras.items).join("")}
          ${renderBreakdownRows(
            "Funding and offsets",
            result.offsets.items,
            true
          ).join("")}
        </div>

        <div class="cost-summary">
          <div class="summary-item">
            <label><strong>Estimated cost breakdown</strong></label>
            <div></div>
          </div>

          <div style="height:360px;">
            <canvas id="costBreakdownChart"></canvas>
          </div>

          <p
            class="form-help-text"
            id="largestCostDriverText"
            style="margin-top:1.2rem;"
          ></p>
        </div>

        ${renderFutureEarningsSummary()}

        ${
          state.studentPhase === "future"
            ? `
              <div class="future-contact-section">

                <h3 class="subsection-title">
                  Would you like the estimate emailed to you?
                </h3>

                <p class="form-help-text">
                  To download your estimate or have it emailed to you,
                  please provide your name and email address.
                </p>

                <p class="form-help-text">
                  We may also send information about:
                </p>

                <ul class="future-contact-list">
                  <li>Programs and admissions</li>
                  <li>Scholarships and financial aid</li>
                  <li>Events, campus life, and student opportunities</li>
                </ul>

                <div class="form-group">
                  <label for="fullName">
                    Full name <span class="required-star">*</span>
                  </label>

                  <input
                    id="fullName"
                    class="step-input"
                    type="text"
                    value="${escapeHtml(state.fullName)}"
                    placeholder="Enter your full name"
                  />
                </div>

                <div class="form-group">
                  <label for="email">
                    Email address <span class="required-star">*</span>
                  </label>

                  <input
                    id="email"
                    class="step-input"
                    type="email"
                    value="${escapeHtml(state.email)}"
                    placeholder="Enter your email address"
                  />
                </div>

                <div class="uog-alert uog-alert-grey">
                  <div class="uog-alert-title">
                    <span class="uog-alert-icon">!</span>
                    <span>Consent notice</span>
                  </div>

                  <div class="uog-alert-message">
                    By downloading or requesting your estimate, you consent to
                    the University of Guelph using the information provided to
                    send your estimate and communicate with you about programs,
                    admissions, scholarships, events, and related opportunities.
                    You may unsubscribe at any time.
                  </div>
                </div>

              </div>
            `
            : ""
        }

      </div>

      <div class="step-footer" style="flex-wrap:wrap;">
        <button
          class="btn-secondary"
          id="backStep5"
          type="button"
        >
          Back
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
      const value = item.low !== undefined && item.high !== undefined
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
  const canvas = document.getElementById("costBreakdownChart");
  if (!canvas || typeof Chart === "undefined") return;

  const rows = getCostBreakdownChartData();
  if (!rows.length) return;

  const labels = rows.map(row => row.label);
  const values = rows.map(row => row.value);
  const total = values.reduce((sum, value) => sum + value, 0);

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

  const largest = rows.reduce((max, row) => {
    return row.value > max.value ? row : max;
  }, rows[0]);

  const driverText = document.getElementById("largestCostDriverText");

  if (driverText && total > 0) {
    const percent = ((largest.value / total) * 100).toFixed(1);
    driverText.textContent =
      `Largest cost driver: ${largest.label} at ${formatMoney(largest.value)} (${percent}% of estimated costs).`;
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
          borderWidth: 3
        }
      ]
    },
    plugins: [pieBorderPlugin],
    options: {
      responsive: true,
      maintainAspectRatio: false,
      // cutout: "70%",
      layout: {
        padding: 14
      },
      plugins: {
        legend: {
          position: "left",
          align: "center",
          labels: {
            boxWidth: 18,
            boxHeight: 18,
            padding: 14,
            color: "#000000",
            font: {
              size: 12,
              weight: "600"
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const value = context.raw || 0;
              const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
              return `${context.label}: ${formatMoney(value)} (${percent}%)`;
            }
          }
        }
      }
    }
  });
}

function getCostBreakdownChartData() {
  const result = state.result || emptyResult();

  const rows = [];

  function addItems(items) {
    items.forEach(item => {
      const value = item.low !== undefined && item.high !== undefined
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

function renderCostBreakdownChart() {
  const canvas = document.getElementById("costBreakdownChart");
  if (!canvas || typeof Chart === "undefined") return;

  const rows = getCostBreakdownChartData();
  if (!rows.length) return;

  const labels = rows.map(row => row.label);
  const values = rows.map(row => row.value);
  const total = values.reduce((sum, value) => sum + value, 0);

  const uogColors = [
    "#e51937", // UofG red
    "#ffc429", // UofG yellow
    "#187bb4", // UofG blue
    "#318738", // UofG green
    "#000000", // black
    "#555555", // body copy
    "#b3142c", // red focus
    "#135f8b", // blue focus
    "#27682c"  // green focus
  ];

  const largest = rows.reduce((max, row) => {
    return row.value > max.value ? row : max;
  }, rows[0]);

  const driverText = document.getElementById("largestCostDriverText");
  if (driverText && total > 0) {
    const percent = ((largest.value / total) * 100).toFixed(1);
    driverText.textContent = `Largest cost driver: ${largest.label} at ${formatMoney(largest.value)} (${percent}% of estimated costs).`;
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
      // cutout: "70%",
      layout: {
        padding: 10
      },
      plugins: {
        legend: {
          position: "left",
          align: "center",
          labels: {
            boxWidth: 18,
            boxHeight: 18,
            padding: 14,
            color: "#333333",
            font: {
              size: 12,
              weight: "600"
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const value = context.raw || 0;
              const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
              return `${context.label}: ${formatMoney(value)} (${percent}%)`;
            }
          }
        }
      }
    }
  });
}
function renderFutureEarningsSummary() {
  if (state.studentPhase !== "future") return "";

  const rows = [];

  if (state.includePartTimeEarnings) {
    const partTimeText = readField(
      state.data?.["Part-Time_earnings"]?.[0] || {},
      ["Part-Time_earnings", "Part-Time earnings", "Part Time Earnings"]
    );

    const range = parseRangeFromText(partTimeText);

    if (range.low > 0 || range.high > 0) {
      rows.push({
        label: "Potential part-time earnings",
        value: `${formatRangeValue(range.low, range.high)} / year`
      });
    }
  }

  if (state.includeCoopEarnings && state.coopInterest === "Yes") {
    const coopText = readField(
      state.data?.["Co-op Cost"]?.[0] || {},
      ["Coop Earnings", "Co-op Earnings"]
    );

    const range = parseRangeFromText(coopText);

    if (range.low > 0 || range.high > 0) {
      rows.push({
        label: "Potential co-op earnings",
        value: `${formatRangeValue(range.low, range.high)} / week`
      });
    }
  }

  if (!rows.length) return "";

  return `
    <div class="cost-summary" style="margin-top:20px;">
      <div class="summary-item">
        <label><strong>Potential earnings</strong></label>
        <div></div>
      </div>

      <div style="font-size:13px; opacity:0.8; margin-bottom:10px;">
        These amounts are shown for planning awareness only and are not deducted from your estimated total.
      </div>

      ${rows.map(row => `
        <div class="summary-item">
          <label>${escapeHtml(row.label)}</label>
          <div class="summary-value">${row.value}</div>
        </div>
      `).join("")}
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
  const livingInCanada = document.getElementById("livingInCanada");
  const canadianCitizen = document.getElementById("canadianCitizen");
  const permanentResident = document.getElementById("permanentResident");
  if (livingInCanada) {
    livingInCanada.onchange = e => {
      state.livingInCanada = e.target.value;
      resetProgramPathState();
      renderCurrentStep();
    };
  }

  if (canadianCitizen) {
    canadianCitizen.onchange = e => {
      state.canadianCitizen = e.target.value;

      if (state.canadianCitizen === "Yes") {
        state.permanentResident = "";
      }

      deriveFutureResidency();
      resetProgramPathState();
      renderCurrentStep();
    };
  }

  if (permanentResident) {
    permanentResident.onchange = e => {
      state.permanentResident = e.target.value;
      deriveFutureResidency();
      resetProgramPathState();
      renderCurrentStep();
    };
  }
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
  if (state.currentStep !== 0) return;

  const cards = document.querySelectorAll(".choice-card");
  const startBtn = document.getElementById("startBtn");

  cards.forEach(card => {
    card.onclick = () => {
      const selectedValue = card.getAttribute("data-value") || "";
      cards.forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      state.studentPhase = selectedValue;
    };
  });

  if (startBtn) {
    startBtn.onclick = () => {
      if (!state.studentPhase) state.studentPhase = "future";
      state.currentStep = 1;
      renderCurrentStep();
    };
  }
}

function bindStep1Events() {
  if (state.currentStep !== 1) return;

  const studentPhase = document.getElementById("studentPhase");
  const residencyType = document.getElementById("residencyType");
  const level = document.getElementById("level");
  const province = document.getElementById("province");
  const provinceGroup = document.getElementById("provinceGroup");
  const nextBtn = document.getElementById("nextStep1");

  if (studentPhase) {
    studentPhase.onchange = e => {
      const newValue = e.target.value;
      if (newValue !== state.studentPhase) {
        state.studentPhase = newValue;
        resetProgramPathState();
        if (state.studentPhase !== "future") {
          state.futureMealPlanInterest = "No";
          state.country = "";
        }
        renderCurrentStep();
      }
    };
  }

  if (residencyType) {
    residencyType.onchange = e => {
      const newValue = e.target.value;
      if (newValue !== state.residencyType) {
        state.residencyType = newValue;
        resetProgramPathState();
        resetFundingSelections();

        if (state.residencyType === "Domestic") {
          state.province = "";
          if (provinceGroup) provinceGroup.style.display = "flex";
        } else {
          state.province = "INT";
          if (provinceGroup) provinceGroup.style.display = "none";
        }

        renderCurrentStep();
      }
    };
  }

  if (level) {
    level.onchange = e => {
      const newValue = e.target.value;

      if (newValue !== state.level) {
        state.level = newValue;
        resetProgramPathState();

        if (state.level === "GR") {
          state.campus = "University of Guelph";
        }

        renderCurrentStep();
      }
    };
  }

  if (province) {
    province.onchange = e => {
      state.province = e.target.value;
    };
  }

  if (nextBtn) {
    nextBtn.onclick = () => {
      clearErrors();

      let hasError = false;

      if (!state.studentPhase) {
        markError(document.getElementById("studentPhase"), "Required");
        hasError = true;
      }

      if (state.studentPhase === "future") {
        if (!state.livingInCanada) {
          markError(document.getElementById("livingInCanada"), "Required");
          hasError = true;
        }

        if (!state.canadianCitizen) {
          markError(document.getElementById("canadianCitizen"), "Required");
          hasError = true;
        }

        // if (state.canadianCitizen === "No" && !state.permanentResident) {
        //   markError(document.getElementById("permanentResident"), "Required");
        //   hasError = true;
        // }
      }

      if (!state.residencyType) {
        markError(document.getElementById("residencyType"), "Required");
        hasError = true;
      }

      if (!state.level) {
        markError(document.getElementById("level"), "Required");
        hasError = true;
      }

      if (state.residencyType === "Domestic" && !state.province) {
        markError(document.getElementById("province"), "Required");
        hasError = true;
      }

      if (hasError) return;
      if (state.studentPhase === "future") {
        if (!state.livingInCanada) return alert("Please select whether you are currently living in Canada.");
        if (!state.canadianCitizen) {
          return alert("Please select whether you are a Canadian citizen or permanent resident of Canada.");
        }

        // if (state.canadianCitizen === "No" && !state.permanentResident) {
        //   return alert("Please select whether you are a permanent resident of Canada.");
        // }

        deriveFutureResidency();
      }
      if (!state.residencyType) return alert("Please complete your residency information.");
      if (!state.level) {
        return alert(
          state.studentPhase === "future"
            ? "Please select what you are looking for."
            : "Please select level."
        );
      }

      if (state.residencyType === "Domestic" && !state.province) {
        return alert("Please select province status.");
      }

      if (state.residencyType === "International") {
        state.province = "INT";
      }

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

function renderCampusGallery() {
  if (!state.campus) return "";

  const campusImages = {
    "University of Guelph": {
      title: "University of Guelph",
      folder: "./UGD_img/",
      images: ["UOFG1.jpg"]
    },
    "University of Guelph-Humber": {
      title: "University of Guelph-Humber",
      folder: "./Gh_img/",
      images: ["GH1.jpg"]
    },
    "Ridgetown Campus": {
      title: "Ridgetown Campus",
      folder: "./Ridegtown_img/",
      images: ["Rgd3.jpg"]
    }
  };

  const campus = campusImages[state.campus];
  if (!campus) return "";

  return `
    <div class="campus-preview-card">
      <div class="campus-preview-copy">
        <p class="campus-preview-kicker">Campus preview</p>
        <h1 class="campus-preview-title">${escapeHtml(campus.title)}</h1>
        
      </div>

      <div class="campus-preview-image-wrap">
        <img
          class="campus-preview-image"
          src="${escapeHtml(campus.folder + campus.images[0])}"
          alt="${escapeHtml(campus.title)} campus preview"
        />
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
  if (state.currentStep !== 2) return;

  const cohortYear = document.getElementById("cohortYear");
  const country = document.getElementById("country");
  const campus = document.getElementById("campus");
  const program = document.getElementById("program");
  const major = document.getElementById("major");
  const coopInterest = document.getElementById("coopInterest");
  const back = document.getElementById("backStep2");
  const next = document.getElementById("nextStep2");
  if (major) {
    major.onchange = e => {
      state.major = e.target.value;
      state.matchedTuitionRecord = null;
      clearErrors();

      const coopStatus = getFutureProgramCoopStatus();

      if (coopStatus !== "Yes") {
        state.coopInterest = "No";
        state.includeCoop = false;
        state.includeCoopEarnings = false;

        
      }

      renderCurrentStep();
    };
  }
  if (cohortYear) {
    cohortYear.onchange = e => {
      state.cohortYear = e.target.value;
      state.matchedTuitionRecord = null;
      clearErrors();
    };
  }

  if (country) {
    country.onchange = async e => {
      state.country = e.target.value;
      state.matchedTuitionRecord = null;
      clearErrors();
      await updateCurrencyConversion();
      renderCurrentStep();
    };
  }

  if (campus) {
    campus.onchange = e => {
      state.campus = e.target.value;
      state.program = "";
      state.matchedTuitionRecord = null;
      clearErrors();
      renderCurrentStep();
    };
  }

  if (program) {
    program.onchange = e => {
      state.program = e.target.value;
      state.major = "";
      state.matchedTuitionRecord = null;
      state.coopInterest = "No";
      state.includeCoop = false;
      clearErrors();
      renderCurrentStep();
    };
  }

  if (coopInterest) {
    coopInterest.onchange = e => {
      state.coopInterest = e.target.value;
      state.includeCoop = state.coopInterest === "Yes";

      if (state.coopInterest !== "Yes") {
        state.coopEarningsOffset = 0;
      }

      updateRunningEstimate();
    };
  }

  if (back) {
    back.onclick = () => {
      clearErrors();
      state.currentStep = 1;
      renderCurrentStep();
    };
  }

  if (next) {
    next.onclick = () => {
      clearErrors();

      let hasError = false;

      if (state.studentPhase === "current") {
        state.cohortYear = getLatestCurrentCohortYear();
      }

      if (state.studentPhase === "future" && !state.cohortYear) {
        markError(document.getElementById("cohortYear"), "Required");
        hasError = true;
      }

      if (
        state.studentPhase === "future" &&
        state.residencyType === "International" &&
        !state.country
      ) {
        markError(document.getElementById("country"), "Required");
        hasError = true;
      }

      if (!state.campus) {
        markError(document.getElementById("campus"), "Required");
        hasError = true;
      }

      if (!state.program) {
        markError(document.getElementById("program"), "Required");
        hasError = true;
      }
      if (state.level === "UG" && getAvailableMajors().length > 0 && !state.major) {
        markError(document.getElementById("major"), "Required");
        hasError = true;
      }

      if (hasError) return;

      matchTuitionRecord();

      if (!state.matchedTuitionRecord) {
        markError(
          document.getElementById("program"),
          "No tuition record matched this selection. Please try a different program, campus, or year."
        );
        return;
      }

      calculateEstimate();
      state.currentStep = 3;
      renderCurrentStep();
    };
  }
}

function bindStep3Events() {
  if (state.currentStep !== 3) return;

  const booksAmount = document.getElementById("booksAmount");
  const personalAmount = document.getElementById("personalAmount");
  const osapFunding = document.getElementById("osapFunding");

  const partTimeHoursPerWeek = document.getElementById("partTimeHoursPerWeek");
  const partTimeHourlyRate = document.getElementById("partTimeHourlyRate");
  const coopWeeklyEarnings = document.getElementById("coopWeeklyEarnings");
  const coopWeeks = document.getElementById("coopWeeks");

  const otherScholarshipOffset = document.getElementById("otherScholarshipOffset");
  const partTimeIncome = document.getElementById("partTimeIncome");
  const coopEarningsOffset = document.getElementById("coopEarningsOffset");
  const familySupport = document.getElementById("familySupport");

  const back = document.getElementById("backStep3");
  const next = document.getElementById("nextStep3");

  if (booksAmount) {
    booksAmount.oninput = e => {
      state.booksAmount = toNumber(e.target.value);
      updateRunningEstimate();
    };
  }

  if (personalAmount) {
    personalAmount.oninput = e => {
      state.personalAmount = toNumber(e.target.value);
      updateRunningEstimate();
    };
  }

  if (osapFunding) {
    osapFunding.oninput = e => {
      state.osapFunding = toNumber(e.target.value);
      updateRunningEstimate();
    };
  }

  if (partTimeHoursPerWeek) {
    partTimeHoursPerWeek.oninput = e => {
      state.partTimeHoursPerWeek = toNumber(e.target.value);
      updateRunningEstimate();
    };
  }

  if (partTimeHourlyRate) {
    partTimeHourlyRate.oninput = e => {
      state.partTimeHourlyRate = toNumber(e.target.value);
      updateRunningEstimate();
    };
  }

  if (coopWeeklyEarnings) {
    coopWeeklyEarnings.oninput = e => {
      state.coopWeeklyEarnings = toNumber(e.target.value);
      updateRunningEstimate();
    };
  }

  if (coopWeeks) {
    coopWeeks.oninput = e => {
      state.coopWeeks = toNumber(e.target.value);
      updateRunningEstimate();
    };
  }

  if (otherScholarshipOffset) {
    otherScholarshipOffset.oninput = e => {
      state.otherScholarshipOffset = toNumber(e.target.value);
      updateRunningEstimate();
    };
  }

  if (partTimeIncome) {
    partTimeIncome.oninput = e => {
      state.partTimeIncome = toNumber(e.target.value);
      updateRunningEstimate();
    };
  }

  if (coopEarningsOffset) {
    coopEarningsOffset.oninput = e => {
      state.coopEarningsOffset = toNumber(e.target.value);
      updateRunningEstimate();
    };
  }

  if (familySupport) {
    familySupport.oninput = e => {
      state.familySupport = toNumber(e.target.value);
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
      calculateEstimate();
      state.currentStep = 4;
      renderCurrentStep();
    };
  }
}

function bindStep4Events() {
  if (state.currentStep !== 4) return;

  const housingType = document.getElementById("housingType");
  const residence = document.getElementById("residence");
  const mealPlan = document.getElementById("mealPlan");
  const currentOffCampusRent = document.getElementById("currentOffCampusRent");
  const currentOffCampusFood = document.getElementById("currentOffCampusFood");
  const futureMealPlanInterest = document.getElementById("futureMealPlanInterest");
  const back = document.getElementById("backStep4");
  const next = document.getElementById("nextStep4");

  if (futureMealPlanInterest) {
    futureMealPlanInterest.onchange = e => {
      state.futureMealPlanInterest = e.target.value;
      updateRunningEstimate();
    };
  }

  if (housingType) {
    housingType.onchange = e => {
      state.housingType = e.target.value;

      if (state.studentPhase === "future" && state.housingType === "OnCampus") {
        state.futureMealPlanInterest = "Yes";
      }

      if (state.housingType !== "OnCampus") {
        state.residence = "";
        state.mealPlan = "";
      }

      if (state.housingType !== "OffCampus") {
        state.currentOffCampusRent = 0;
        state.currentOffCampusFood = 0;
      }

      renderCurrentStep();
    };
  }

  if (residence) {
    residence.onchange = e => {
      state.residence = e.target.value;
      updateRunningEstimate();
    };
  }

  if (mealPlan) {
    mealPlan.onchange = e => {
      state.mealPlan = e.target.value;
      updateRunningEstimate();
    };
  }

  if (currentOffCampusRent) {
    currentOffCampusRent.oninput = e => {
      state.currentOffCampusRent = toNumber(e.target.value);
      updateRunningEstimate();
    };
  }

  if (currentOffCampusFood) {
    currentOffCampusFood.oninput = e => {
      state.currentOffCampusFood = toNumber(e.target.value);
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
      if (state.studentPhase !== "future") {
        if (state.housingType === "OnCampus") {
          if (!state.residence) return alert("Please select residence.");
          if (!state.mealPlan) return alert("Please select meal plan.");
        }

        if (state.housingType === "OffCampus") {
          if (toNumber(state.currentOffCampusRent) <= 0) return alert("Please enter your yearly rent.");
          if (toNumber(state.currentOffCampusFood) < 0) return alert("Please enter a valid yearly food expense.");
        }
      }

      calculateEstimate();
      state.currentStep = 5;
      renderCurrentStep();
    };
  }
}
function renderFutureContactSection() {
  return `
    <div class="future-contact-section">
      <h3 class="subsection-title">Would you like the estimate emailed to you?</h3>

      <p class="form-help-text">
        Please provide your name and email address to download your estimate or have it emailed to you.
        We may also send information about:
      </p>

      <ul class="future-contact-list">
        <li>Programs and admissions</li>
        <li>Scholarships and financial aid</li>
        <li>Events, campus life, and student opportunities</li>
      </ul>

      <div class="form-group">
        <label for="fullName">Full name <span class="required-star">*</span></label>
        <input
          id="fullName"
          class="step-input"
          type="text"
          value="${escapeHtml(state.fullName)}"
          placeholder="Enter your full name"
        />
      </div>

      <div class="form-group">
        <label for="email">Email address <span class="required-star">*</span></label>
        <input
          id="email"
          class="step-input"
          type="email"
          value="${escapeHtml(state.email)}"
          placeholder="Enter your email address"
        />
      </div>

      <p class="consent-text">
        By requesting your estimate, you agree that the University of Guelph may contact you
        regarding programs, admissions, scholarships, events, and related opportunities.
        You may unsubscribe at any time.
      </p>
    </div>
  `;
}

function renderCurrentStudentDownloadNotice() {
  return `
    <div class="uog-alert uog-alert-grey">
      <div class="uog-alert-title">
        <span class="uog-alert-icon">!</span>
        <span>Download your estimate</span>
      </div>

      <div class="uog-alert-message">
        Current or returning students can download this estimate without providing a name or email address.
      </div>
    </div>
  `;
}
function bindStep5Events() {
  if (state.currentStep !== 5) return;

  renderCostBreakdownChart();

  const fullName = document.getElementById("fullName");
  const email = document.getElementById("email");
  const marketingConsent = document.getElementById("marketingConsent");
  const back = document.getElementById("backStep5");
  const downloadBtn = document.getElementById("downloadEstimateBtn");
  const emailBtn = document.getElementById("emailEstimateBtn");

  if (fullName) {
    fullName.oninput = e => {
      state.fullName = e.target.value;
      clearErrors();
    };
  }

  if (email) {
    email.oninput = e => {
      state.email = e.target.value;
      clearErrors();
    };
  }

  if (marketingConsent) {
    marketingConsent.onchange = e => {
      state.marketingConsent = e.target.checked;
    };
  }

  if (back) {
    back.onclick = () => {
      clearErrors();
      state.currentStep = 4;
      renderCurrentStep();
    };
  }

  function validateContactFields() {
    clearErrors();

    let hasError = false;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!state.fullName.trim()) {
      markError(fullName, "Required");
      hasError = true;
    }

    if (!state.email.trim()) {
      markError(email, "Required");
      hasError = true;
    } else if (!emailPattern.test(state.email.trim())) {
      markError(email, "Please enter a valid email address.");
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

        if (state.studentPhase === "future") {
          await saveFutureStudentLead("Downloaded copy");
        }

        await generateEstimatePDF();
      } catch (error) {
        console.error("Download/save failed:", error);
        markError(email, "Download failed. Please refresh and try again.");
      }
    };
  }

  if (emailBtn) {
    emailBtn.onclick = async () => {
      if (!validateContactFields()) return;

      try {
        calculateEstimate();
        await sendEstimateEmail();
        alert("Your estimate has been emailed successfully.");
      } catch (error) {
        console.error("Email failed:", error);
        markError(email, "Email failed. Please refresh and try again.");
      }
    };
  }
}
async function saveFutureStudentLead(emailStatus = "Downloaded copy") {
  const payload = {
    studentName: state.fullName.trim(),
    studentEmail: state.email.trim(),
    residency: state.residencyType,
    level: state.level,
    province: state.residencyType === "Domestic" ? state.province : "INT",
    cohortYear: state.cohortYear,
    program: state.program,
    major: state.major || "",
    coopInterest: state.coopInterest,
    osapFunding: Number(state.osapFunding) || 0,
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
    studentName: state.fullName.trim(),
    studentEmail: state.email.trim(),
    residency: state.residencyType,
    level: state.level,
    province: state.residencyType === "Domestic" ? state.province : "INT",
    cohortYear: state.cohortYear,
    program: state.program,
    major: state.major || "",
    coopInterest: state.coopInterest,
    osapFunding: Number(state.osapFunding) || 0,
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
        Estimated range for 2 academic semesters
      </td>
      <td style="padding:12px;border:1px solid #318738;background:#318738;color:#ffffff;font-weight:700;text-align:right;">
        ${formatRangeValue(result.low, result.high)}
      </td>
    </tr>
  `);

  return rows.join("");
}
function resetProgramPathState() {
  state.campus = "";
  state.cohortYear = "";
  state.program = "";
  state.major = "";
  state.country = "";
  state.coopInterest = "No";
  state.includeCoop = false;
  state.matchedTuitionRecord = null;
  state.housingType = "None";
  state.residence = "";
  state.mealPlan = "";
  state.currentOffCampusRent = 0;
  state.currentOffCampusFood = 0;
}

function resetFundingSelections() {
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
  const living = getLivingCosts();
  const extras = getExtraCosts();
  const offsets = getOffsets();

  const low = Math.max(0, tuition.low + living.low + extras.low - offsets.total);
  const high = Math.max(0, tuition.high + living.high + extras.high - offsets.total);

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

  return state.level === "UG"
    ? (state.data.UG_Tuition || [])
    : (state.data.GR_Tuition || []);
}
function getFilteredTuitionRows({
  includeProgram = false,
  includeMajor = false,
  includeCohortForCurrent = true
} = {}) {
  return getTuitionArray().filter(row => {
    const residencyMatch =
      normalizeKey(row.Residency) === normalizeKey(state.residencyType);

    const provinceValue = normalizeKey(row.Province);

    let provinceMatch = true;

    if (state.residencyType === "International") {
      provinceMatch =
        provinceValue === "int" ||
        provinceValue === "international";
    } else {
      provinceMatch =
        !state.province ||
        provinceValue === normalizeKey(state.province);
    }

    const programMatch = includeProgram
      ? normalizeKey(row.Program) === normalizeKey(state.program)
      : true;

    const majorMatch = includeMajor && state.level === "UG"
      ? normalizeKey(row.Major) === normalizeKey(state.major)
      : true;

    const cohortMatch =
      state.studentPhase === "current" && includeCohortForCurrent
        ? !state.cohortYear || normalizeKey(row.CohortYear) === normalizeKey(state.cohortYear)
        : true;

    return residencyMatch && provinceMatch && programMatch && majorMatch && cohortMatch;
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
  const rows = getFilteredTuitionRows();

  if (state.studentPhase === "future") {
    const years = rows
      .map(row => parseCohortRange(normalize(row.CohortYear)))
      .filter(Boolean)
      .map(range => range.end);

    const latestEnd = years.length ? Math.max(...years) : new Date().getFullYear();

    return Array.from({ length: 5 }, (_, i) => String(latestEnd + i));
  }

  return [...new Set(
    rows.map(row => normalize(row.CohortYear)).filter(Boolean)
  )].sort((a, b) => compareCohortDesc(a, b));
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
function getFutureProgramCoopStatus() {
  if (!state.program) return "";

  const rows = getFilteredTuitionRows({
    includeProgram: true,
    includeMajor: state.level === "UG"
  });

  const match = rows.find(row => {
    const programMatch = normalizeKey(row.Program) === normalizeKey(state.program);

    if (state.level === "UG") {
      return programMatch && normalizeKey(row.Major) === normalizeKey(state.major);
    }

    return programMatch;
  });

  return normalize(
    readField(match || {}, [
      "Coop Included",
      "Coop_included",
      "coop_included",
      "Co-op Included",
      "Coop Included",
      "Co-op"
    ])
  );
}
function matchTuitionRecord() {
  const rows = getFilteredTuitionRows({
    includeProgram: true,
    includeMajor: state.level === "UG",
    includeCohortForCurrent: true
  });

  if (!rows.length) {
    state.matchedTuitionRecord = null;
    return;
  }

  state.matchedTuitionRecord = rows[0] || null;
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

function getTuitionCosts() {
  const row = state.matchedTuitionRecord;

  if (!row) {
    return { items: [], low: 0, high: 0 };
  }

  const TUITION_BUFFER = 1000;

  const fallTuition = toNumber(row.FallTuition);
  const winterTuition = toNumber(row.WinterTuition);

  const fallCompulsoryFees = toNumber(row.FallCompulsoryFees);
  const winterCompulsoryFees = toNumber(row.WinterCompulsoryFees);

  const items = [
    {
      label: "Fall tuition estimate",
      low: fallTuition,
      high: fallTuition + TUITION_BUFFER
    },
    {
      label: "Fall compulsory fees",
      low: fallCompulsoryFees,
      high: fallCompulsoryFees
    },
    {
      label: "Winter tuition estimate",
      low: winterTuition,
      high: winterTuition + TUITION_BUFFER
    },
    {
      label: "Winter compulsory fees",
      low: winterCompulsoryFees,
      high: winterCompulsoryFees
    }
  ];

  return {
    items,
    low: items.reduce((sum, item) => sum + item.low, 0),
    high: items.reduce((sum, item) => sum + item.high, 0)
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
  let low = 0;
  let high = 0;

  if (state.housingType === "None") {
    if (state.studentPhase === "future" && state.futureMealPlanInterest === "Yes") {
      const mealPlans = state.data?.["Meal_Plan"] || [];
      const totals = mealPlans
        .map(item => toNumber(readField(item, ["Total cost per year", "TotalCostPerYear"])))
        .filter(v => v > 0);

      if (totals.length) {
        const mealLow = Math.min(...totals);
        const mealHigh = Math.max(...totals);
        items.push({
          label: "Yearly meal plan estimate",
          low: mealLow,
          high: mealHigh
        });
        low += mealLow;
        high += mealHigh;
      }
    }

    return { items, low, high };
  }

  const isFutureStudent = state.studentPhase === "future";

  if (isFutureStudent) {
    if (state.housingType === "OnCampus") {
      const rows = state.data?.["On_campus_Living_Costs"] || [];
      const totals = rows
        .map(item => toNumber(readField(item, ["Cost"])) + toNumber(readField(item, ["Deposit"])))
        .filter(v => v > 0);

      if (totals.length) {
        const housingLow = Math.min(...totals);
        const housingHigh = Math.max(...totals);

        items.push({
          label: "On-campus yearly housing estimate",
          low: housingLow,
          high: housingHigh
        });

        low += housingLow;
        high += housingHigh;
      }
    }

    if (state.housingType === "OffCampus") {
      const rows = state.data?.["Off_campus_Living_Costs"] || [];

      const groupedByType = {};
      rows.forEach(item => {
        const type = normalize(
          readField(item, [
            "RoomType                ",
            "RoomType",
            "Room Type",
            "Accommodation Type",
            "Type"
          ])
        );

        const total = toNumber(
          readField(item, [
            " TotalTermCost",
            "TotalTermCost",
            "Total Term Cost",
            "Yearly Cost",
            "Cost"
          ])
        );

        if (!type || total <= 0) return;
        groupedByType[type] = (groupedByType[type] || 0) + total;
      });

      const yearlyTotals = Object.values(groupedByType).filter(v => v > 0);

      if (yearlyTotals.length) {
        const housingLow = Math.min(...yearlyTotals);
        const housingHigh = Math.max(...yearlyTotals);

        items.push({
          label: "Off-campus yearly housing estimate",
          low: housingLow,
          high: housingHigh
        });

        low += housingLow;
        high += housingHigh;
      }
    }

    if (state.futureMealPlanInterest === "Yes") {
      const mealPlans = state.data?.["Meal_Plan"] || [];
      const totals = mealPlans
        .map(item => toNumber(readField(item, ["Total cost per year", "TotalCostPerYear"])))
        .filter(v => v > 0);

      if (totals.length) {
        const mealLow = Math.min(...totals);
        const mealHigh = Math.max(...totals);

        items.push({
          label: "Yearly meal plan estimate",
          low: mealLow,
          high: mealHigh
        });

        low += mealLow;
        high += mealHigh;
      }
    }

    return { items, low, high };
  }

  if (state.housingType === "OnCampus") {
    const residence = (state.data?.["On_campus_Living_Costs"] || []).find(item => {
      const area = normalize(readField(item, ["ResidenceArea", "Residence Area"]));
      const room = normalize(readField(item, ["RoomType", "Room Type"]));
      return `${area} | ${room}` === state.residence;
    });

    const meal = (state.data?.["Meal_Plan"] || []).find(item => {
      const size = normalize(readField(item, ["Meal Plan Size", "MealPlanSize"]));
      return size === normalize(state.mealPlan);
    });

    const residenceCost = residence
      ? toNumber(readField(residence, ["Cost"])) + toNumber(readField(residence, ["Deposit"]))
      : 0;

    const mealCost = meal
      ? toNumber(readField(meal, ["Total cost per year", "TotalCostPerYear"]))
      : 0;

    if (residence) {
      const area = normalize(readField(residence, ["ResidenceArea", "Residence Area"]));
      const room = normalize(readField(residence, ["RoomType", "Room Type"]));
      items.push({
        label: `Residence: ${area} - ${room}`,
        low: residenceCost,
        high: residenceCost
      });
    }

    if (meal) {
      const size = normalize(readField(meal, ["Meal Plan Size", "MealPlanSize"]));
      items.push({
        label: `Meal plan: ${size}`,
        low: mealCost,
        high: mealCost
      });
    }

    low = items.reduce((sum, item) => sum + item.low, 0);
    high = items.reduce((sum, item) => sum + item.high, 0);
  }

  if (state.housingType === "OffCampus") {
    const rent = toNumber(state.currentOffCampusRent);
    const food = toNumber(state.currentOffCampusFood);

    if (rent > 0) {
      items.push({
        label: "Yearly rent",
        low: rent,
        high: rent
      });
    }

    if (food > 0) {
      items.push({
        label: "Yearly food expense",
        low: food,
        high: food
      });
    }

    low = items.reduce((sum, item) => sum + item.low, 0);
    high = items.reduce((sum, item) => sum + item.high, 0);
  }

  return { items, low, high };
}
function renderSuccessStories() {
  if (state.studentPhase !== "future" || state.residencyType !== "International") {
    return "";
  }

  const stories = state.data?.SuccessStory || [];
  if (!stories.length) return "";

  const imageMap = {
    JUNTIAN: "Juntian.png",
    JIYA: "Jiya.png"
  };

  return `
    <div class="form-group">
      <h3 class="subsection-title">Student funding examples</h3>

      <div class="success-story-grid">
        ${stories.map(item => {
          const name = normalize(item["Name "] || item.Name || "Student");
          const image = imageMap[name.toUpperCase()] || "";

          return `
            <div class="success-story-card">
              ${image ? `<img src="./${escapeHtml(image)}" alt="${escapeHtml(name)} success story" />` : ""}

              <div>
                <h3>Meet ${escapeHtml(name)}</h3>

                <p class="success-story-meta">
                  Program: ${escapeHtml(item.Program || "N/A")}<br>
                  Home Country: ${escapeHtml(item["Home Country"] || "N/A")}
                </p>

                <div class="success-story-text">
                  ${escapeHtml(item.Story || "")}
                </div>

                <div class="success-story-total">
                  Total Funding + Earnings: ${escapeHtml(item["Total Funding + Earnings:"] || "")}
                </div>
              </div>
            </div>
          `;
        }).join("")}
      </div>

      ${renderAlert(
        "Funding example notice",
        "These examples are illustrative only. Actual funding may vary based on eligibility, renewal terms, and employment wages.",
        "grey"
      )}
    </div>
  `;
}
function getExtraCosts() {
  const items = [];

  if (toNumber(state.booksAmount) > 0) {
    items.push({
      label: "Textbooks / supplies",
      low: toNumber(state.booksAmount),
      high: toNumber(state.booksAmount)
    });
  }

  if (toNumber(state.personalAmount) > 0) {
    items.push({
      label: "Personal expenses",
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

  if (state.residencyType === "Domestic" && toNumber(state.osapFunding) > 0) {
    items.push({
      label: "Estimated OSAP funding",
      value: toNumber(state.osapFunding)
    });
  }

  if (state.studentPhase === "future") {
    const partTimeEarnings =
      toNumber(state.partTimeHoursPerWeek) *
      toNumber(state.partTimeHourlyRate) *
      32;

    if (partTimeEarnings > 0) {
      items.push({
        label: "Estimated part-time earnings, two academic semesters (Fall & Winter)",
        value: partTimeEarnings
      });
    }

    const coopEarnings =
      state.coopInterest === "Yes"
        ? toNumber(state.coopWeeklyEarnings) * toNumber(state.coopWeeks)
        : 0;

    if (coopEarnings > 0) {
      items.push({
        label:
          state.residencyType === "Domestic"
            ? "Estimated co-op earnings (not deducted from final estimate)"
            : "Estimated co-op earnings",
        value: coopEarnings,
        notDeducted: state.residencyType === "Domestic"
      });
    }
  }

  if (state.studentPhase === "current") {
    if (toNumber(state.partTimeIncome) > 0) {
      items.push({
        label: "Part-time income",
        value: toNumber(state.partTimeIncome)
      });
    }

    if (toNumber(state.otherScholarshipOffset) > 0) {
      items.push({
        label: "Scholarships and bursaries, Fall and Winter total",
        value: toNumber(state.otherScholarshipOffset)
      });
    }

    // Do not deduct co-op earnings for domestic students
    if (
      state.coopInterest === "Yes" &&
      toNumber(state.coopEarningsOffset) > 0
    ) {
      items.push({
        label:
          state.residencyType === "Domestic"
            ? `Co-op earnings: ${formatMoney(state.coopEarningsOffset)} (not deducted from final estimate)`
            : "Co-op earnings",
        value: state.residencyType === "Domestic" ? 0 : toNumber(state.coopEarningsOffset)
      });
    }

    if (toNumber(state.familySupport) > 0) {
      items.push({
        label: "Family support / savings",
        value: toNumber(state.familySupport)
      });
    }
  }

  return {
    items,
    total: items.reduce((sum, item) => {
      if (item.notDeducted) return sum;
      return sum + item.value;
    }, 0)
  };
}

function renderBreakdownRows(title, items, isOffset = false) {
  const rows = [];

  rows.push(`
    <div class="summary-item">
      <label><strong>${escapeHtml(title)}</strong></label>
      <div></div>
    </div>
  `);

  if (!items.length) {
    rows.push(`
      <div class="summary-item">
        <label>None added</label>
        <div class="summary-value">${formatMoney(0)}</div>
      </div>
    `);
    return rows;
  }

  items.forEach(item => {
    let displayValue;

    if (item.notDeducted) {
      displayValue = formatMoney(item.value);
    } else if (isOffset) {
      displayValue = `-${formatMoney(item.value)}`;
    } else if (item.low !== undefined && item.high !== undefined) {
      displayValue = formatRangeValue(item.low, item.high);
    } else {
      displayValue = formatMoney(item.value || 0);
    }

    rows.push(`
      <div class="summary-item">
        <label>${escapeHtml(item.label)}</label>
        <div class="summary-value">${displayValue}</div>
      </div>
    `);
  });

  return rows;
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
          Grants do not need to be repaid, and loans are interest-free while students are in full-time studies.
        </p>

        <p>
          OSAP can help with education-related costs such as tuition, books, supplies, and basic living expenses.
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
  const formatted = new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    currencyDisplay: "code",
    maximumFractionDigits: 0
  }).format(Number(value) || 0);

  return formatted.replace("CAD", "CAD ");
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

function finishEstimatePDF(doc, startY = 24) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const left = 16;
  const right = pageWidth - 16;
  const fullWidth = right - left;

  let y = startY;

  doc.setTextColor(44, 52, 64);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Cost Estimate Summary", left, y);

  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text(`Generated: ${todayDisplay()}`, left, y);

  y += 8;
  drawBrandDivider(doc, left, y, fullWidth);
  y += 10;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.8);
  doc.rect(left, y, fullWidth, 24, "FD");

  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Estimated total range", left + 4, y + 11);
  doc.text(
    formatRangeValue(state.result?.low || 0, state.result?.high || 0),
    right - 4,
    y + 11,
    { align: "right" }
  );
  if (state.currencyCode && state.currencyCode !== "CAD" && state.currencyRate) {
    const convertedLow = (state.result?.low || 0) * state.currencyRate;
    const convertedHigh = (state.result?.high || 0) * state.currencyRate;

    const convertedText =
      convertedLow === convertedHigh
        ? formatCurrency(convertedLow, state.currencyCode)
        : `${formatCurrency(convertedLow, state.currencyCode)} - ${formatCurrency(convertedHigh, state.currencyCode)}`;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Approx. ${convertedText}`,
      right - 4,
      y + 16,
      { align: "right" }
    );
  }

  y += 34;

  doc.setTextColor(44, 52, 64);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Student Selections", left, y);
  y += 7;

  doc.setFillColor(248, 248, 248);
  doc.setDrawColor(220, 220, 220);
  doc.rect(left, y, fullWidth, 42, "FD");

  doc.setFontSize(9);

  const line1 = y + 7;
  const line2 = y + 14;
  const line3 = y + 21;
  const line4 = y + 28;
  const line5 = y + 35;

  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");
  doc.text("Student type:", left + 4, line1);
  doc.text("Residency:", left + 4, line2);
  doc.text("Level:", left + 4, line3);
  doc.text("Province:", left + 4, line4);
  doc.text("Program:", left + 4, line5);

  doc.setTextColor(44, 52, 64);
  doc.setFont("helvetica", "bold");
  doc.text(state.studentPhase || "N/A", left + 32, line1);
  doc.text(state.residencyType || "N/A", left + 32, line2);
  doc.text(state.level || "N/A", left + 32, line3);
  doc.text(state.province || "N/A", left + 32, line4);

  const programText = (state.program || "N/A").slice(0, 42);
  doc.text(programText, left + 32, line5);

  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");
  doc.text("Campus:", 110, line1);
  doc.text("Cohort:", 110, line2);
  doc.text("Housing:", 110, line3);
  doc.text("Meal plan:", 110, line4);

  doc.setTextColor(44, 52, 64);
  doc.setFont("helvetica", "bold");
  doc.text(state.campus || "N/A", 138, line1);
  doc.text(state.cohortYear || "N/A", 138, line2);
  doc.text(state.housingType || "None", 138, line3);
  doc.text(state.mealPlan || (state.futureMealPlanInterest === "Yes" ? "Estimated" : "None"), 138, line4);

  y += 52;

  doc.setTextColor(44, 52, 64);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Estimate Breakdown", left, y);
  y += 7;

  const rows = [
    ["Tuition range", formatRangeValue(state.result?.tuition?.low || 0, state.result?.tuition?.high || 0)],
    ["Living range", formatRangeValue(state.result?.living?.low || 0, state.result?.living?.high || 0)],
    ["Extra costs", formatRangeValue(state.result?.extras?.low || 0, state.result?.extras?.high || 0)],
    ["Funding / offsets", "-" + formatMoney(state.result?.offsets?.total || 0)],
    ["Estimated total range", formatRangeValue(state.result?.low || 0, state.result?.high || 0)]
  ];

  const rowHeight = 7;
  const tableHeight = rows.length * rowHeight + 4;

  doc.setFillColor(248, 248, 248);
  doc.setDrawColor(220, 220, 220);
  doc.rect(left, y, fullWidth, tableHeight, "FD");

  let rowY = y + 5;

  rows.forEach(row => {
    doc.setFontSize(9);
    doc.setTextColor(70, 70, 70);
    doc.setFont("helvetica", "normal");
    doc.text(row[0], left + 4, rowY);
    doc.text(row[1], right - 4, rowY, { align: "right" });
    rowY += rowHeight;
  });

  y += tableHeight + 12;
  
  if (state.studentPhase === "future") {
    const scholarships =
      state.residencyType === "International"
        ? (state.data["Scholarships for Int"] || [])
        : (state.data["Scholarships for Dom"] || []);

    if (scholarships.length) {
      if (y > pageHeight - 70) {
        doc.addPage();
        y = 20;
      }

      doc.setTextColor(44, 52, 64);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Available Funding Options", left, y);
      y += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);

      const fundingNote =
        `Possible scholarships and bursaries for ${state.residencyType.toLowerCase()} students. These are shown for awareness only and are not deducted from the estimate.`;

      doc.text(doc.splitTextToSize(fundingNote, fullWidth), left, y);
      y += 10;

      scholarships.slice(0, 8).forEach(item => {
        if (y > pageHeight - 20) {
          doc.addPage();
          y = 20;
        }

        const name = item["Award Name"] || "Funding option";
        const amount = item.Amount || "Amount varies";
        const note = item.Notes || item.Category || "";

        doc.setFont("helvetica", "bold");
        doc.setTextColor(44, 52, 64);
        doc.text(doc.splitTextToSize(name, 105), left, y);

        doc.setFont("helvetica", "normal");
        doc.text(amount, right - 4, y, { align: "right" });

        y += 5;

        if (note) {
          doc.setTextColor(100, 100, 100);
          doc.setFontSize(8);
          doc.text(doc.splitTextToSize(note, fullWidth), left, y);
          y += 5;
        }

        y += 2;
      });

      y += 5;
    }
  }

  if (y > pageHeight - 20) {
    doc.addPage();
    y = 20;
  }

  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);

  const note =
    "This document is an estimate only and does not replace official tuition, fee, housing, meal plan, scholarship, or funding information published by the University of Guelph.";

  const noteLines = doc.splitTextToSize(note, fullWidth);
  doc.text(noteLines, left, y);

  const fileName = `UofG_Cost_Estimate_${safeFileNamePart(state.program, "Student")}.pdf`;
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

  const { jsPDF } = window.jspdf || {};
  if (!jsPDF) {
    throw new Error("jsPDF is not loaded.");
  }

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const left = 16;

  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  const logo = new Image();
  let imageLoaded = false;
  let contentStartY = 24;

  try {
    const imageDataUrl = await loadImageAsDataUrl("./image.png");
    logo.src = imageDataUrl;

    await new Promise((resolve, reject) => {
      logo.onload = resolve;
      logo.onerror = reject;
    });

    imageLoaded = true;
  } catch (error) {
    console.warn("image.png could not be loaded for PDF:", error);
  }

  if (imageLoaded) {
    try {
      const imgW = logo.naturalWidth || 1;
      const imgH = logo.naturalHeight || 1;
      const maxWidth = pageWidth - 32;
      const maxHeight = 18;
      const ratio = Math.min(maxWidth / imgW, maxHeight / imgH);
      const finalW = imgW * ratio;
      const finalH = imgH * ratio;
      const x = left;
      const y = 8;

      doc.addImage(logo, "PNG", x, y, finalW, finalH);
      contentStartY = y + finalH + 12;
    } catch (error) {
      console.warn("Logo could not be added to PDF:", error);
    }
  }

  finishEstimatePDF(doc, contentStartY);
}
