const state = {
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
  country: "",

  includeBooks: false,
  includePersonal: false,
  includeCoop: false,
  coopInterest: "No",
  futureMealPlanInterest: "No",

  housingType: "None",         // None | OnCampus | OffCampus
  residence: "",
  mealPlan: "",
  offCampusType: "",
  currentOffCampusRent: 0,
  currentOffCampusFood: 0,

  scholarshipOffset: 0,
  selectedScholarshipKeys: [],
  partTimeIncome: 0,
  coopEarningsOffset: 0,
  familySupport: 0,

  fullName: "",
  email: "",

  matchedTuitionRecord: null,
  result: null,

  currencyCode: "",
  currencyRate: null,
  currencyLoading: false,
  currencyError: "",
  showStep2Error: false,
  step2ErrorMessage: ""
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

// CSS for alerts (injected once)
(function injectAlertStyles() {
  const styleId = "uog-alert-styles";
  if (document.getElementById(styleId)) return;
  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
    .uog-alert {
      border: 1px solid #d6d6d6;
      background: #fff;
      padding: 14px;
      margin: 14px 0;
    }
    .uog-alert-title {
      font-weight: 700;
      padding: 12px 14px;
      font-size: 15px;
    }
    .uog-alert-message {
      padding: 12px 14px 4px;
      font-size: 14px;
      line-height: 1.5;
      color: #2f3640;
    }
    .uog-alert-yellow .uog-alert-title {
      background: #ffc72c;
      color: #111;
    }
    .uog-alert-blue .uog-alert-title {
      background: #3178b8;
      color: #fff;
    }
    .uog-alert-green .uog-alert-title {
      background: #2f8132;
      color: #fff;
    }
    .uog-alert-red .uog-alert-title {
      background: #e51937;
      color: #fff;
    }
    .uog-alert-grey .uog-alert-title {
      background: #d9d9d9;
      color: #111;
    }
  `;
  document.head.appendChild(style);
})();

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
  await loadSupportedCurrencies();
  calculateEstimate();
  renderCurrentStep();
}

let SUPPORTED_CURRENCIES = [];

async function loadSupportedCurrencies() {
  try {
    const res = await fetch("https://api.frankfurter.dev/v1/currencies");
    if (!res.ok) throw new Error("Could not load supported currencies.");
    const data = await res.json();
    SUPPORTED_CURRENCIES = Object.keys(data);
  } catch (err) {
    console.warn("Could not load supported currencies:", err);
    SUPPORTED_CURRENCIES = [];
  }
}

async function loadData() {
  try {
    const res = await fetch("./data.json");
    if (!res.ok) throw new Error("Could not load data.json");
    state.data = await res.json();
  } catch (err) {
    console.error(err);
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
  const img = document.getElementById("welcomeImage");
  if (!img) return;

  img.addEventListener(
    "error",
    () => {
      img.style.display = "none";
    },
    { once: true }
  );
}

function deriveFutureResidency() {
  if (state.studentPhase !== "future") return;

  if (state.canadianCitizen === "Yes" || state.permanentResident === "Yes") {
    state.residencyType = "Domestic";
    state.province = "ON";
    state.country = "";
  }

  if (state.canadianCitizen === "No" && state.permanentResident === "No") {
    state.residencyType = "International";
    state.province = "INT";
  }
}

function updateChrome() {
  const stepTitles = {
    0: "Welcome",
    1: "Academic Profile",
    2: "Program",
    3: "Additional Costs & Funding",
    4: "Living",
    5: "Estimate Summary"
  };

  const stepSubtitles = {
    0: "Start your estimate.",
    1: "Tell us who you are so we can build the right estimate path.",
    2: "Choose your target year, campus, and program.",
    3: "Add extra costs and review funding information.",
    4: "Add housing and meal plan options if needed.",
    5: "Review your estimate and enter your details."
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
  const gryphImg = document.getElementById("sidebarGryphImg");
  const gryphText = document.getElementById("sidebarGryphText");

  const gryphMap = {
    0: { img: "gryph1.png", text: "Let’s get started" },
    1: { img: "gryph1.png", text: "Build your profile" },
    2: { img: "gryph2.png", text: "You’re making progress" },
    3: { img: "gryph3.png", text: "Halfway there" },
    4: { img: "gryph2.png", text: "Almost done" },
    5: { img: "gryph4.png", text: "Your estimate is ready" }
  };

  const gryph = gryphMap[state.currentStep] || gryphMap[0];

  if (gryphImg) gryphImg.src = `./${gryph.img}`;
  if (gryphText) gryphText.textContent = gryph.text;
  const runningTotal = document.getElementById("topRunningTotal");
  if (runningTotal) {
    const low = state.result?.low || 0;
    const high = state.result?.high || 0;
    runningTotal.textContent = formatRangeValue(low, high);
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
      state.currentStep = step;
      calculateEstimate();
      renderCurrentStep();
    };
  });
}
function renderGryph(step) {
  const gryphMap = {
    1: { img: "gryph1.png", text: "Let’s get started" },
    2: { img: "gryph2.png", text: "You’re making progress" },
    3: { img: "gryph3.png", text: "Halfway there" },
    4: { img: "gryph2.png", text: "Almost done" },
    5: { img: "gryph4.png", text: "Your estimate is ready" }
  };

  const g = gryphMap[step];
  if (!g) return "";

  return `
    <div class="gryph-assist">
      <img src="./${g.img}" />
      <p>${g.text}</p>
    </div>
  `;
}
function renderCurrentStep() {
  const container = document.getElementById("flowContainer");
  if (!container) return;

  if (!state.data) {
    container.innerHTML = `
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

function renderStep0() {
  return `
    <div class="step-container">
      <div class="step-header">
        <h2 class="step-title">Cost Estimator</h2>
        <p class="step-description">Build a personalized estimate in a few guided steps.</p>
      </div>

      <div class="welcome-screen">
        <img
          src="./image.png"
          alt="Cost Estimator Illustration"
          class="welcome-image"
          id="welcomeImage"
        />

        <p class="welcome-copy">
          Welcome to the UofG Cost Estimator. Let’s find out what your education may cost
          based on your path, tuition, housing, and funding choices.
        </p>

        <div class="choice-row welcome-choice-row">
          <div class="choice-card ${state.studentPhase === "future" ? "selected" : ""}" data-value="future">
            <h3>Future student</h3>
            <p>Best for prospective students and applicants planning ahead.</p>
          </div>

          <div class="choice-card ${state.studentPhase === "current" ? "selected" : ""}" data-value="current">
            <h3>Current or returning student</h3>
            <p>Best for students who already know their program and want a more tailored estimate.</p>
          </div>
        </div>

        <div class="step-actions welcome-actions">
          <button class="btn-primary btn-lg" id="startBtn" type="button">Get Started</button>
        </div>
      </div>
    </div>
  `;
}

function renderStep1() {
  return `
    <div class="step-container">
      <div class="step-header">
        <h2 class="step-title">Who are you?</h2>
        <p class="step-description">Choose your student path and study type so we can build the right estimate.</p>
      </div>
     

      <div class="step-content">
        <div class="form-stack">
      

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
                  <label for="canadianCitizen">Are you a Canadian citizen?</label>
                  <select id="canadianCitizen" class="step-dropdown">
                    <option value="">Select an option</option>
                    <option value="Yes" ${state.canadianCitizen === "Yes" ? "selected" : ""}>Yes</option>
                    <option value="No" ${state.canadianCitizen === "No" ? "selected" : ""}>No</option>
                  </select>
                </div>

                ${
                  state.canadianCitizen === "No"
                    ? `
                      <div class="form-group">
                        <label for="permanentResident">Are you a permanent resident of Canada?</label>
                        <select id="permanentResident" class="step-dropdown">
                          <option value="">Select an option</option>
                          <option value="Yes" ${state.permanentResident === "Yes" ? "selected" : ""}>Yes</option>
                          <option value="No" ${state.permanentResident === "No" ? "selected" : ""}>No</option>
                        </select>
                      </div>
                    `
                    : ""
                }
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
            <label for="level">
              ${state.studentPhase === "future" ? "What are you looking for?" : "Level"}
            </label>
            <select id="level" class="step-dropdown">
              <option value="">${state.studentPhase === "future" ? "Select an option" : "Select level"}</option>
              <option value="UG" ${state.level === "UG" ? "selected" : ""}>Undergraduate (Bachelor's degree)</option>
              <option value="GR" ${state.level === "GR" ? "selected" : ""}>Graduate (Master’s or PhD)</option>
            </select>
          </div>
          
          <div class="form-group" id="provinceGroup" style="display:${state.residencyType === "Domestic" ? "flex" : "none"};">
            <label for="province">Province status</label>
            <select id="province" class="step-dropdown">
              <option value="">Select province status</option>
              <option value="ON" ${state.province === "ON" ? "selected" : ""}>Ontario</option>
              <option value="Non-ON" ${state.province === "Non-ON" ? "selected" : ""}>Outside Ontario</option>
            </select>
          </div>
          ${
              state.studentPhase === "future"
                ? `<div style="margin-top:-5px;">
                    ${renderAlert(
                      "Program tip!",
                      "Choose Undergraduate if you're starting your first degree. Choose Graduate if you already have a degree.",
                      "blue"
                    )}
                  </div>`
                : ""
            }
          ${renderAlert(
            "Estimate notice!",
            "This estimator is a planning tool and does not replace official University of Guelph tuition, fee, housing, meal plan, scholarship, or funding information.",
            "yellow"
          )}
        </div>
      </div>

      <div class="step-footer">
        <div></div>
        <button class="btn-primary" id="nextStep1">Continue</button>
      </div>
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
  const countries = getAvailableCountries();

  if (state.campus && !campuses.includes(state.campus)) {
    state.campus = "";
    state.program = "";
    state.matchedTuitionRecord = null;
  }

  if (state.program && !programs.includes(state.program)) {
    state.program = "";
    state.matchedTuitionRecord = null;
  }

  const currentStudentYear = state.studentPhase === "current" ? state.cohortYear : "";

  return `
    <div class="step-container">
      <div class="step-header">
        <h2 class="step-title">Program and tuition details</h2>
        <p class="step-description">Choose your target year, campus, and program for your estimate.</p>
      </div>

      <div class="step-content">
        <div class="form-stack">
      
          ${
            state.studentPhase === "future"
              ? `
                <div class="form-group">
                  <label for="cohortYear">Select your expected start year?</label>
                  <select id="cohortYear" class="step-dropdown">
                    <option value="">Select target year</option>
                    ${cohortYears.map(y => `<option value="${escapeHtml(y)}" ${state.cohortYear === y ? "selected" : ""}>${escapeHtml(y)}</option>`).join("")}
                  </select>
                </div>
              `
              : `
                <div class="form-group">
                  <label>Year</label>
                  <div class="step-input" style="display:flex;align-items:center;">
                    ${escapeHtml(currentStudentYear || "Not available")}
                  </div>
                </div>
              `
          }

          ${
            state.studentPhase === "future" && state.residencyType === "International"
              ? `
                <div class="form-group">
                  <label for="country">Country</label>
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
              ${campuses.map(c => `<option value="${escapeHtml(c)}" ${state.campus === c ? "selected" : ""}>${escapeHtml(c)}</option>`).join("")}
            </select>
          </div>

          <div class="form-group">
            <label for="program">Select the program you are interested in</label>
            <select id="program" class="step-dropdown">
              <option value="">Select program</option>
              ${programs.map(p => `<option value="${escapeHtml(p)}" ${state.program === p ? "selected" : ""}>${escapeHtml(p)}</option>`).join("")}
            </select>
          </div>

          <div class="form-group">
            <label for="coopInterest">
              ${state.studentPhase === "future" ? "Are you interested in co-op?" : "Are you enrolled in co-op?"}
            </label>
            <select id="coopInterest" class="step-dropdown">
              <option value="No" ${state.coopInterest === "No" ? "selected" : ""}>No</option>
              <option value="Yes" ${state.coopInterest === "Yes" ? "selected" : ""}>Yes</option>
            </select>
          </div>

          ${renderAlert(
            "Data source notice",
            "The available options come directly from the tuition data for your selected study type, campus, and residency path.",
            "blue"
          )}
        </div>
      </div>

      <div class="step-footer">
        <button class="btn-secondary" id="backStep2">Back</button>
        <button class="btn-primary" id="nextStep2">Continue</button>
      </div>
    </div>
  `;
}

function renderStep3() {
  const scholarships =
    state.residencyType === "International"
      ? (state.data["Scholarships for Int"] || [])
      : (state.data["Scholarships for Dom"] || []);

  const scholarshipCards = scholarships.length
    ? scholarships.map(item => {
        const awardName = escapeHtml(item["Award Name"] || "Unnamed award");
        const amount = escapeHtml(item.Amount || "Amount not listed");
        const note = escapeHtml(item["Notes"] || item["Application Required"] || item["Eligibility"] || "");

        return `
          <div class="scholarship-card">
            <div class="scholarship-card-top">
              <h3>${awardName}</h3>
              <span class="scholarship-amount">${amount}</span>
            </div>
            ${note ? `<p class="scholarship-meta">${note}</p>` : ""}
          </div>
        `;
      }).join("")
    : `
      ${renderAlert("No scholarships found", "No scholarship or bursary entries were found for this residency type in the current data.", "grey")}
    `;

  return `
    <div class="step-container">
      <div class="step-header">
        <h2 class="step-title">Additional costs and funding</h2>
        <p class="step-description">
          ${
            state.studentPhase === "future"
              ? "Add optional costs and review possible funding opportunities."
              : "Add optional costs and enter funding you already have."
          }
        </p>
      </div>

      <div class="step-content">
        <div class="form-stack">
          <label class="checkbox-item">
            <input type="checkbox" id="includeBooks" ${state.includeBooks ? "checked" : ""} />
            <span>Include textbooks</span>
          </label>

          <label class="checkbox-item">
            <input type="checkbox" id="includePersonal" ${state.includePersonal ? "checked" : ""} />
            <span>Include personal expenses</span>
          </label>

          ${
            state.studentPhase === "future"
              ? `
                ${renderAlert(
                  "Scholarships & bursaries",
                  "Scholarships and bursaries will be shown in your final estimate summary for awareness.",
                  "blue"
                )}
              `
              : `
                <div class="form-group">
                  <h3>Scholarships and bursaries</h3>

                  <div class="scholarship-checkbox-list">
                    ${getScholarshipOptions().map(item => {
                      const selected = state.selectedScholarshipKeys.includes(item.__key);
                      const amount = item.Amount || "";
                      const category = item.Category || "";
                      const yearlyValue = getScholarshipYearlyValue(item);

                      return `
                        <label class="scholarship-option ${selected ? "selected" : ""}">
                          <input
                            type="checkbox"
                            name="selectedScholarships"
                            value="${escapeHtml(item.__key)}"
                            ${selected ? "checked" : ""}
                          />

                          <div class="scholarship-option-body">
                            <div class="scholarship-option-top">
                              <strong>${escapeHtml(item.__label)}</strong>
                              <span>${formatMoney(yearlyValue)} / year</span>
                            </div>

                            <div class="scholarship-option-meta">
                              ${category ? `${escapeHtml(category)} · ` : ""}
                              ${item["Application Required"] ? `Application required: ${escapeHtml(item["Application Required"])}` : ""}
                            </div>

                            ${amount ? `
                              <div class="scholarship-option-note">
                                Listed award amount: ${escapeHtml(amount)}
                              </div>
                            ` : ""}
                          </div>
                        </label>
                      `;
                    }).join("")}
                  </div>

                  ${renderAlert(
                    "Scholarship calculation",
                    "Renewable or multi-year awards are converted to an estimated yearly amount for this calculator.",
                    "grey"
                  )}
                </div>

                <div class="form-group">
                  <label for="partTimeIncome">Expected part-time income</label>
                  <input id="partTimeIncome" class="step-input" type="number" min="0" value="${escapeHtml(state.partTimeIncome)}" />
                </div>

                ${
                  state.coopInterest === "Yes"
                    ? `
                      <div class="form-group">
                        <label for="coopEarningsOffset">Expected co-op earnings</label>
                        <input id="coopEarningsOffset" class="step-input" type="number" min="0" value="${escapeHtml(state.coopEarningsOffset)}" />
                      </div>
                    `
                    : ""
                }

                <div class="form-group">
                  <label for="familySupport">Family support / savings</label>
                  <input id="familySupport" class="step-input" type="number" min="0" value="${escapeHtml(state.familySupport)}" />
                </div>

                ${renderAlert(
                  "Funding deduction",
                  "Selected scholarships, bursaries, and funding values are deducted from the final estimate for current or returning students.",
                  "yellow"
                )}
              `
          }
        </div>
      </div>
      
      <div class="step-footer">
        <button class="btn-secondary" id="backStep3">Back</button>

        <button class="btn-primary" id="nextStep3">Continue</button>
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
        <h2 class="step-title">Living costs</h2>
        <p class="step-description">Choose whether you want to include housing and meal plans in the estimate.</p>
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
                  <label for="futureMealPlanInterest">Would you like to include a meal plan estimate?</label>
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
                    ${onCampusOptions.map(item => `
                      <option value="${escapeHtml(item.value)}" ${state.residence === item.value ? "selected" : ""}>
                        ${escapeHtml(item.label)}
                      </option>
                    `).join("")}
                  </select>
                </div>

                <div class="form-group">
                  <label for="mealPlan">Meal plan</label>
                  <select id="mealPlan" class="step-dropdown">
                    <option value="">Select meal plan</option>
                    ${mealPlanOptions.map(item => `
                      <option value="${escapeHtml(item.value)}" ${state.mealPlan === item.value ? "selected" : ""}>
                        ${escapeHtml(item.label)}
                      </option>
                    `).join("")}
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
                  <input
                    id="currentOffCampusRent"
                    class="step-input"
                    type="number"
                    min="0"
                    value="${escapeHtml(state.currentOffCampusRent)}"
                    placeholder="Enter your yearly rent"
                  />
                </div>

                <div class="form-group">
                  <label for="currentOffCampusFood">Yearly food expense</label>
                  <input
                    id="currentOffCampusFood"
                    class="step-input"
                    type="number"
                    min="0"
                    value="${escapeHtml(state.currentOffCampusFood)}"
                    placeholder="Enter your yearly food expense"
                  />
                </div>
              `
              : ""
          }

          ${renderAlert(
            "Living cost notice",
            "Living costs are planning estimates and may vary by year, room choice, meal plan, and market conditions.",
            "yellow"
          )}
        </div>
      </div>

      <div class="step-footer">
        <button class="btn-secondary" id="backStep4">Back</button>
        <button class="btn-primary" id="nextStep4">Build estimate</button>
      </div>
    </div>
  `;
}

function renderStep5() {
  const result = state.result || emptyResult();

  return `
    <div class="step-container">
      <div class="step-header">
        <h2 class="step-title">Your estimate</h2>
        <p class="step-description">Review the estimate and provide your details.</p>
      </div>

      <div class="step-content">
        <div class="cost-summary">
          <div class="summary-item">
            <label>Estimated range</label>
            <div class="summary-value">${formatRangeValue(result.low, result.high)}</div>
            ${getConvertedRangeText(result.low, result.high)}
          </div>
        </div>

        <div class="cost-summary">
          ${renderBreakdownRows("Tuition and fees", result.tuition.items).join("")}
          ${renderBreakdownRows("Living costs", result.living.items).join("")}
          ${renderBreakdownRows("Extra costs", result.extras.items).join("")}
          ${
            state.studentPhase === "current"
              ? renderBreakdownRows("Funding and offsets", result.offsets.items, true).join("")
              : ""
          }
        </div>

        ${renderFutureFundingSummary()}

        <div class="form-stack" style="margin-top:20px;">
          <div class="form-group">
            <label for="fullName">Full name</label>
            <input id="fullName" class="step-input" type="text" value="${escapeHtml(state.fullName)}" placeholder="Enter your full name" />
          </div>

          <div class="form-group">
            <label for="email">Email address</label>
            <input id="email" class="step-input" type="email" value="${escapeHtml(state.email)}" placeholder="Enter your email address" />
          </div>
        </div>
      </div>

      <div class="step-footer" style="flex-wrap:wrap;">
        <button class="btn-secondary" id="backStep5">Back</button>
        <button class="btn-gold" id="downloadEstimateBtn">Download your estimate</button>
        <button class="btn-primary" id="emailEstimateBtn">Get your estimate by email</button>
      </div>
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

        if (state.canadianCitizen === "No" && !state.permanentResident) {
          markError(document.getElementById("permanentResident"), "Required");
          hasError = true;
        }
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
        if (!state.canadianCitizen) return alert("Please select whether you are a Canadian citizen.");

        if (state.canadianCitizen === "No" && !state.permanentResident) {
          return alert("Please select whether you are a permanent resident of Canada.");
        }

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

  if (SUPPORTED_CURRENCIES.length && !SUPPORTED_CURRENCIES.includes(currency)) {
    state.currencyError = `${currency} conversion is not supported yet.`;
    return;
  }

  try {
    state.currencyLoading = true;

    const url = `https://api.frankfurter.dev/v1/latest?base=CAD&symbols=${encodeURIComponent(currency)}`;
    const res = await fetch(url);

    if (!res.ok) throw new Error("Currency rate not available.");

    const data = await res.json();
    const rate = data?.rates?.[currency];

    if (!rate) throw new Error("Currency not supported.");

    state.currencyRate = Number(rate);
  } catch (err) {
    console.warn("Currency conversion unavailable:", err);
    state.currencyError = "Exchange estimate is not available for this currency yet.";
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
    return renderAlert(
      "Currency conversion available",
      `Approximate conversion available in ${escapeHtml(currency)}.`,
      "green"
    );
  }

  return "";
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
  const coopInterest = document.getElementById("coopInterest");
  const back = document.getElementById("backStep2");
  const next = document.getElementById("nextStep2");

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
    program.onchange = async e => {
      state.program = e.target.value;
      state.matchedTuitionRecord = null;
      clearErrors();
      updateRunningEstimate();
      await updateCurrencyConversion();
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

  const includeBooks = document.getElementById("includeBooks");
  const includePersonal = document.getElementById("includePersonal");
  const includeCoop = document.getElementById("includeCoop");
  const selectedScholarshipInputs = document.querySelectorAll('input[name="selectedScholarships"]');
  const partTimeIncome = document.getElementById("partTimeIncome");
  const coopEarningsOffset = document.getElementById("coopEarningsOffset");
  const familySupport = document.getElementById("familySupport");
  const back = document.getElementById("backStep3");
  const next = document.getElementById("nextStep3");

  if (includeBooks) {
    includeBooks.onchange = e => {
      state.includeBooks = e.target.checked;
      updateRunningEstimate();
    };
  }

  if (includePersonal) {
    includePersonal.onchange = e => {
      state.includePersonal = e.target.checked;
      updateRunningEstimate();
    };
  }

  if (includeCoop) {
    includeCoop.onchange = e => {
      state.includeCoop = e.target.checked;
      updateRunningEstimate();
    };
  }

  if (selectedScholarshipInputs.length) {
    selectedScholarshipInputs.forEach(input => {
      input.onchange = () => {
        state.selectedScholarshipKeys = Array.from(selectedScholarshipInputs)
          .filter(el => el.checked)
          .map(el => el.value);

        state.scholarshipOffset = getSelectedScholarshipTotal();
        updateRunningEstimate();
      };
    });
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

function bindStep5Events() {
  if (state.currentStep !== 5) return;

  const fullName = document.getElementById("fullName");
  const email = document.getElementById("email");
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

    if (!state.fullName.trim()) {
      markError(fullName, "Required");
      hasError = true;
    }

    if (!state.email.trim()) {
      markError(email, "Required");
      hasError = true;
    }

    return !hasError;
  }

  if (downloadBtn) {
    downloadBtn.onclick = async () => {
      if (!validateContactFields()) return;

      try {
        calculateEstimate();
        await generateEstimatePDF();
      } catch (error) {
        console.error("PDF generation failed:", error);
        markError(email, "PDF download failed. Please refresh and try again.");
      }
    };
  }

  if (emailBtn) {
    emailBtn.onclick = () => {
      if (!validateContactFields()) return;

      alert("Email flow can be wired next.");
    };
  }
}

function resetProgramPathState() {
  state.campus = "";
  state.cohortYear = "";
  state.program = "";
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
  return state.level === "UG" ? (state.data.UG_Tuition || []) : (state.data.GR_Tuition || []);
}

function getFilteredTuitionRows({ includeCampus = false, includeProgram = false, includeCohortForCurrent = true } = {}) {
  return getTuitionArray().filter(row => {
    const residencyMatch = normalize(row.Residency) === normalize(state.residencyType);

    const provinceValue = normalize(row.Province);
    const provinceMatch =
      state.residencyType === "International"
        ? provinceValue === "INT"
        : !state.province || provinceValue === normalize(state.province);

    const campusMatch = includeCampus ? normalize(row.Campus) === normalize(state.campus) : true;
    const programMatch = includeProgram ? normalize(row.Program) === normalize(state.program) : true;

    const cohortMatch =
      state.studentPhase === "current" && includeCohortForCurrent
        ? !state.cohortYear || normalize(row.CohortYear) === normalize(state.cohortYear)
        : true;

    return residencyMatch && provinceMatch && campusMatch && programMatch && cohortMatch;
  });
}

function getAvailableCampuses() {
  return [...new Set(
    getFilteredTuitionRows()
      .map(row => normalize(row.Campus))
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

    return Array.from({ length: 7 }, (_, i) => String(latestEnd + i));
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
    getFilteredTuitionRows({ includeCampus: !!state.campus })
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

function matchTuitionRecord() {
  const rows = getFilteredTuitionRows({
    includeCampus: true,
    includeProgram: true,
    includeCohortForCurrent: true
  });

  if (!rows.length) {
    state.matchedTuitionRecord = null;
    return;
  }

  if (state.studentPhase === "current") {
    state.matchedTuitionRecord = rows[0] || null;
    return;
  }

  const sorted = [...rows].sort((a, b) => compareCohortDesc(normalize(a.CohortYear), normalize(b.CohortYear)));

  const targetYear = Number(state.cohortYear);
  if (!targetYear) {
    state.matchedTuitionRecord = sorted[0] || null;
    return;
  }

  const exactOrNearest = sorted.find(row => {
    const range = parseCohortRange(row.CohortYear);
    return range ? range.end === targetYear || range.start === targetYear : false;
  });

  state.matchedTuitionRecord = exactOrNearest || sorted[0] || null;
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

  const fallTuition = toNumber(row.FallTuition);
  const winterTuition = toNumber(row.WinterTuition);

  const fallTotal = Math.max(fallTuition, toNumber(row.FallTuition_Compulsory));
  const winterTotal = Math.max(winterTuition, toNumber(row.WinterTuition_Compulsory));

  const items = [
    {
      label: "Fall tuition and fee estimate",
      low: fallTuition,
      high: fallTotal
    },
    {
      label: "Winter tuition and fee estimate",
      low: winterTuition,
      high: winterTotal
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

function getExtraCosts() {
  const items = [];

  if (state.includeBooks) {
    const value = parseAmountFromText(readField(state.data?.Textbooks?.[0] || {}, ["Txtbooks", "Textbooks"]));
    items.push({
      label: "Textbooks",
      low: value,
      high: value
    });
  }

  if (state.includePersonal) {
    const value = parseAmountFromText(readField(state.data?.["Personal Expenses"]?.[0] || {}, ["Personal Expenses"]));
    items.push({
      label: "Personal expenses",
      low: value,
      high: value
    });
  }

  if (state.includeCoop && state.coopInterest === "Yes") {
    const value = parseAmountFromText(readField(state.data?.["Co-op Cost"]?.[0] || {}, ["Co-op Cost"]));
    items.push({
      label: "Co-op fee estimate",
      low: value,
      high: value
    });
  }

  if (state.residencyType === "International") {
    const value = parseAmountFromText(readField(state.data?.["Health Insurance Int"]?.[0] || {}, ["Health Insurance"]));
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
  if (state.studentPhase !== "current") {
    return {
      items: [],
      total: 0
    };
  }

  const items = [];

  state.scholarshipOffset = getSelectedScholarshipTotal();

  if (state.scholarshipOffset > 0) {
    items.push({ label: "Scholarships and bursaries", value: state.scholarshipOffset });
  }

  if (state.partTimeIncome > 0) {
    items.push({ label: "Part-time income", value: state.partTimeIncome });
  }

  if (state.coopInterest === "Yes" && state.coopEarningsOffset > 0) {
    items.push({ label: "Co-op earnings", value: state.coopEarningsOffset });
  }

  if (state.familySupport > 0) {
    items.push({ label: "Family support / savings", value: state.familySupport });
  }

  return {
    items,
    total: items.reduce((sum, item) => sum + item.value, 0)
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
    const displayValue = isOffset
      ? `-${formatMoney(item.value)}`
      : item.low !== undefined && item.high !== undefined
        ? formatRangeValue(item.low, item.high)
        : formatMoney(item.value || 0);

    rows.push(`
      <div class="summary-item">
        <label>${escapeHtml(item.label)}</label>
        <div class="summary-value">${displayValue}</div>
      </div>
    `);
  });

  return rows;
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

function toNumber(value) {
  if (value === null || value === undefined || value === "") return 0;
  const cleaned = String(value).replace(/[^0-9.-]/g, "");
  return Number(cleaned) || 0;
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
