const state = {
  data: null,
  currentStep: 0,

  studentPhase: "",            // future | current
  residencyType: "",           // Domestic | International
  province: "",                // ON | Non-ON | INT

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
  result: null
};

document.addEventListener("DOMContentLoaded", init);

async function init() {
  bindScrollTop();
  await loadData();
  renderCurrentStep();
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
    if (window.scrollY > 250) btn.classList.add("show");
    else btn.classList.remove("show");
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

  if (state.currentStep === 0) {
    if (topStatusCard) topStatusCard.style.display = "none";
    if (progressInline) progressInline.style.display = "none";
  } else {
    if (topStatusCard) topStatusCard.style.display = "flex";
    if (progressInline) progressInline.style.display = "flex";
  }

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
  if (progressText) progressText.textContent = `${Math.max(0, 100 - progressPct)}% left`;

  const runningTotal = document.getElementById("topRunningTotal");
  if (runningTotal) {
    const low = state.result ? state.result.low : 0;
    const high = state.result ? state.result.high : 0;
    runningTotal.textContent = formatRangeValue(low, high);
  }

  document.querySelectorAll(".stepper-item").forEach(item => {
    const step = Number(item.dataset.step);
    item.classList.remove("active", "done");

    if (state.currentStep > 0) {
      if (step === state.currentStep) item.classList.add("active");
      if (step < state.currentStep) item.classList.add("done");
    }

    item.onclick = () => {
      if (step <= 0 || step > 5) return;
      state.currentStep = step;
      renderCurrentStep();
    };
  });
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

  if (state.currentStep === 0) container.innerHTML = renderStep0();
  if (state.currentStep === 1) container.innerHTML = renderStep1();
  if (state.currentStep === 2) container.innerHTML = renderStep2();
  if (state.currentStep === 3) container.innerHTML = renderStep3();
  if (state.currentStep === 4) container.innerHTML = renderStep4();
  if (state.currentStep === 5) container.innerHTML = renderStep5();

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
          <button class="btn-primary btn-lg" id="startBtn" type="button">
            ${state.studentPhase ? "Get Started" : "Get Started"}
          </button>
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
          <div class="form-group">
            <label for="studentPhase">Student type</label>
            <select id="studentPhase" class="step-dropdown">
              <option value="">Select student type</option>
              <option value="future" ${state.studentPhase === "future" ? "selected" : ""}>Future student</option>
              <option value="current" ${state.studentPhase === "current" ? "selected" : ""}>Current / returning student</option>
            </select>
          </div>

          <div class="form-group">
            <label for="residencyType">Residency type</label>
            <select id="residencyType" class="step-dropdown">
              <option value="">Select residency type</option>
              <option value="Domestic" ${state.residencyType === "Domestic" ? "selected" : ""}>Domestic</option>
              <option value="International" ${state.residencyType === "International" ? "selected" : ""}>International</option>
            </select>
          </div>

          <div class="form-group">
            <label for="level">
              ${state.studentPhase === "future" ? "What are you looking for?" : "Level"}
            </label>
            <select id="level" class="step-dropdown">
              <option value="">
                ${state.studentPhase === "future" ? "Select an option" : "Select level"}
              </option>
              <option value="UG" ${state.level === "UG" ? "selected" : ""}>Undergraduate</option>
              <option value="GR" ${state.level === "GR" ? "selected" : ""}>Graduate</option>
            </select>
          </div>

          <div
            class="form-group"
            id="provinceGroup"
            style="display: ${state.residencyType === "Domestic" ? "flex" : "none"};"
          >
            <label for="province">Province status</label>
            <select id="province" class="step-dropdown">
              <option value="">Select province status</option>
              <option value="ON" ${state.province === "ON" ? "selected" : ""}>Ontario</option>
              <option value="Non-ON" ${state.province === "Non-ON" ? "selected" : ""}>Outside Ontario</option>
            </select>
          </div>

          <div class="section-note">
            This estimator is a planning tool based on the data currently loaded.
          </div>
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

  if (state.program && !programs.includes(state.program)) {
    state.program = "";
    state.matchedTuitionRecord = null;
  }

  const currentStudentYear =
    state.studentPhase === "current"
      ? state.cohortYear
      : "";

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
                  <label for="cohortYear">Target year</label>
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
            <label for="program">What program interests you</label>
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

          <div class="section-note">
            The available options come directly from the tuition data for your selected student path, campus, and study type.
          </div>
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
        const note = escapeHtml(
          item["Notes"] ||
          item["Application Required"] ||
          item["Eligibility"] ||
          ""
        );

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
      <div class="section-note">
        No scholarship or bursary entries were found for this residency type in the current data.
      </div>
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
                <div class="scholarship-panel">
                  <div class="scholarship-panel-header">
                    <h3>Available scholarships and bursaries</h3>
                    <p>
                      These are possible funding options for ${
                        state.residencyType === "International" ? "international" : "domestic"
                      } students. They are shown for awareness only and are not deducted automatically.
                    </p>
                  </div>

                  <div class="scholarship-list">
                    ${scholarshipCards}
                  </div>
                </div>

                <div class="section-note">
                  Funding is shown here for awareness only and is not automatically deducted from the estimate.
                </div>
              `
              : `
                <div class="form-group">
                  <h1>Scholarships and bursaries</h1>

                  <div class="scholarship-checkbox-list">
                    ${getScholarshipOptions().map(item => {
                      const selected = state.selectedScholarshipKeys.includes(item.__key);
                      const amount = item.Amount || "";
                      const category = item.Category || "";
                      const yearlyValue = getScholarshipYearlyValue(item);

                      return `
                        <label class="checkbox-item" style="align-items:flex-start;">
                          <input
                            type="checkbox"
                            name="selectedScholarships"
                            value="${escapeHtml(item.__key)}"
                            ${selected ? "checked" : ""}
                          />
                          <span>
                            <strong>${escapeHtml(item.__label)}</strong>
                            ${amount ? `<div>${escapeHtml(amount)}</div>` : ""}
                            ${category ? `<div>${escapeHtml(category)}</div>` : ""}
                            <div style="font-size:12px;opacity:0.8;">
                              Estimated yearly deduction: ${formatMoney(yearlyValue)}
                            </div>
                          </span>
                        </label>
                      `;
                    }).join("")}
                  </div>

                  <div class="section-note" style="margin-top:10px;">
                    Renewable or multi-year awards are converted to an estimated yearly amount for this calculator.
                  </div>

                  <div class="section-note" style="margin-top:8px;">
                    Scholarship and bursary deduction selected: <strong>${formatMoney(getSelectedScholarshipTotal())}</strong>
                  </div>
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

                <div class="section-note">
                  Selected scholarships, bursaries, and funding values are deducted from the final estimate for current or returning students.
                </div>
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
            isFutureStudent
              ? `
                <div class="form-group">
                  <label for="futureMealPlanInterest">Would you like to include a meal plan estimate?</label>
                  <select id="futureMealPlanInterest" class="step-dropdown">
                    <option value="No" ${state.futureMealPlanInterest === "No" ? "selected" : ""}>No</option>
                    <option value="Yes" ${state.futureMealPlanInterest === "Yes" ? "selected" : ""}>Yes</option>
                  </select>
                </div>
              `
              : `
                ${
                  state.housingType === "OnCampus"
                    ? `
                      <div class="form-group">
                        <label for="residence">Residence</label>
                        <select id="residence" class="step-dropdown">
                          <option value="">Select residence</option>
                          ${(state.data["On_campus_Living_Costs"] || []).map(item => {
                            const value = `${normalize(item.ResidenceArea)} | ${normalize(item.RoomType)}`;
                            const label = `${normalize(item.ResidenceArea)} - ${normalize(item.RoomType)} (${formatMoney(toNumber(item.Cost))}/year)`;
                            return `<option value="${escapeHtml(value)}" ${state.residence === value ? "selected" : ""}>${escapeHtml(label)}</option>`;
                          }).join("")}
                        </select>
                      </div>

                      <div class="form-group">
                        <label for="mealPlan">Meal plan</label>
                        <select id="mealPlan" class="step-dropdown">
                          <option value="">Select meal plan</option>
                          ${(state.data["Meal_Plan"] || []).map(item => {
                            const value = normalize(item["Meal Plan Size"]);
                            const label = `${normalize(item["Meal Plan Size"])} (${formatMoney(toNumber(item["Total cost per year"]))}/year)`;
                            return `<option value="${escapeHtml(value)}" ${state.mealPlan === value ? "selected" : ""}>${escapeHtml(label)}</option>`;
                          }).join("")}
                        </select>
                      </div>
                    `
                    : ""
                }

                ${
                  state.housingType === "OffCampus"
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
              `
          }

          <div class="section-note">
            Living costs are shown as planning estimates and may vary by year, room choice, and market conditions.
          </div>
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
          </div>
        </div>

        <div class="cost-summary">
          ${renderBreakdownRows("Tuition and fees", result.tuition.items).join("")}
          ${renderBreakdownRows("Living costs", result.living.items).join("")}
          ${renderBreakdownRows("Extra costs", result.extras.items).join("")}
          ${renderBreakdownRows("Funding and offsets", result.offsets.items, true).join("")}
        </div>

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
  if (state.currentStep === 0) {
    const cards = document.querySelectorAll(".choice-card");
    const startBtn = document.getElementById("startBtn");

    cards.forEach(card => {
      card.onclick = () => {
        const selectedValue = card.getAttribute("data-value");

        cards.forEach(c => c.classList.remove("selected"));
        card.classList.add("selected");

        state.studentPhase = selectedValue || "";
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

  if (state.currentStep === 1) {
    const studentPhase = document.getElementById("studentPhase");
    const residencyType = document.getElementById("residencyType");
    const level = document.getElementById("level");
    const province = document.getElementById("province");
    const provinceGroup = document.getElementById("provinceGroup");
    const nextBtn = document.getElementById("nextStep1");

    if (studentPhase) {
      studentPhase.onchange = e => {
        state.studentPhase = e.target.value;

        state.coopInterest = "No";
        state.includeCoop = false;
        state.coopEarningsOffset = 0;
        state.selectedScholarshipKeys = [];
        state.scholarshipOffset = 0;
        state.country = "";

        if (state.studentPhase !== "future") {
          state.futureMealPlanInterest = "No";
        }

        renderCurrentStep();
      };
    }

    if (residencyType) {
      residencyType.onchange = e => {
        state.residencyType = e.target.value;
        state.campus = "";
        state.program = "";
        state.cohortYear = "";
        state.country = "";
        state.matchedTuitionRecord = null;
        state.selectedScholarshipKeys = [];
        state.scholarshipOffset = 0;

        if (state.residencyType === "Domestic") {
          if (provinceGroup) provinceGroup.style.display = "flex";
        } else {
          state.province = "INT";
          if (province) province.value = "";
          if (provinceGroup) provinceGroup.style.display = "none";
        }
      };
    }

    if (level) {
      level.onchange = e => {
        state.level = e.target.value;
        state.campus = "";
        state.program = "";
        state.cohortYear = "";
        state.country = "";
        state.matchedTuitionRecord = null;
        state.selectedScholarshipKeys = [];
        state.scholarshipOffset = 0;
      };
    }

    if (province) {
      province.onchange = e => {
        state.province = e.target.value;
      };
    }

    if (nextBtn) {
      nextBtn.onclick = () => {
        if (!state.studentPhase) return alert("Please select student type.");
        if (!state.residencyType) return alert("Please select residency type.");
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

  if (state.currentStep === 2) {
    const cohortYear = document.getElementById("cohortYear");
    const country = document.getElementById("country");
    const campus = document.getElementById("campus");
    const program = document.getElementById("program");
    const coopInterest = document.getElementById("coopInterest");
    const back = document.getElementById("backStep2");
    const next = document.getElementById("nextStep2");

    if (country) {
      country.onchange = e => {
        state.country = e.target.value;
      };
    }

    if (state.studentPhase === "current") {
      const latestYear = getLatestCurrentCohortYear();
      if (latestYear) {
        state.cohortYear = latestYear;
      }
      state.matchedTuitionRecord = null;
    }

    if (cohortYear) {
      cohortYear.onchange = e => {
        state.cohortYear = e.target.value;
        state.matchedTuitionRecord = null;
      };
    }

    if (coopInterest) {
      coopInterest.onchange = e => {
        state.coopInterest = e.target.value;
        state.includeCoop = e.target.value === "Yes";

        if (state.coopInterest !== "Yes") {
          state.coopEarningsOffset = 0;
        }

        updateRunningEstimate();
        renderCurrentStep();
      };
    }

    if (campus) {
      campus.onchange = e => {
        state.campus = e.target.value;
        state.program = "";
        state.matchedTuitionRecord = null;
        updateRunningEstimate();
        renderCurrentStep();
      };
    }

    if (program) {
      program.onchange = e => {
        state.program = e.target.value;
        state.matchedTuitionRecord = null;
        matchTuitionRecord();
        updateRunningEstimate();
      };
    }

    if (back) {
      back.onclick = () => {
        state.currentStep = 1;
        renderCurrentStep();
      };
    }

    if (next) {
      next.onclick = () => {
        if (state.studentPhase === "current") {
          state.cohortYear = getLatestCurrentCohortYear();
        }

        if (country) state.country = country.value;
        if (campus) state.campus = campus.value;
        if (program) state.program = program.value;
        if (coopInterest) {
          state.coopInterest = coopInterest.value;
          state.includeCoop = coopInterest.value === "Yes";
        }

        if (
          state.studentPhase === "future" &&
          state.residencyType === "International" &&
          !state.country
        ) {
          return alert("Please select your country.");
        }

        state.matchedTuitionRecord = null;

        if (!state.cohortYear) {
          return alert(
            state.studentPhase === "future"
              ? "Please select target year."
              : "Year data is unavailable."
          );
        }

        if (!state.campus) return alert("Please select campus.");
        if (!state.program) return alert("Please select a program.");

        matchTuitionRecord();

        if (!state.matchedTuitionRecord) {
          console.log("No match found for:", {
            studentPhase: state.studentPhase,
            residencyType: state.residencyType,
            province: state.province,
            level: state.level,
            campus: state.campus,
            cohortYear: state.cohortYear,
            program: state.program,
            country: state.country
          });
          return alert("No tuition record matched this selection.");
        }

        updateRunningEstimate();
        state.currentStep = 3;
        renderCurrentStep();
      };
    }
  }

  if (state.currentStep === 3) {
    const includeBooks = document.getElementById("includeBooks");
    const includePersonal = document.getElementById("includePersonal");
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

    if (selectedScholarshipInputs.length) {
      selectedScholarshipInputs.forEach(input => {
        input.onchange = () => {
          state.selectedScholarshipKeys = Array.from(selectedScholarshipInputs)
            .filter(el => el.checked)
            .map(el => el.value);

          state.scholarshipOffset = getSelectedScholarshipTotal();
          updateRunningEstimate();
          renderCurrentStep();
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

  if (state.currentStep === 4) {
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
        calculateEstimate();
        renderCurrentStep();
      };
    }

    if (housingType) {
      housingType.onchange = e => {
        state.housingType = e.target.value;

        if (state.housingType !== "OnCampus") {
          state.residence = "";
          state.mealPlan = "";
        }

        if (state.housingType !== "OffCampus") {
          state.offCampusType = "";
          state.currentOffCampusRent = 0;
          state.currentOffCampusFood = 0;
        }

        if (state.housingType === "None") {
          state.futureMealPlanInterest = "No";
        }

        calculateEstimate();
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
            if (!state.currentOffCampusRent) {
              return alert("Please enter your yearly rent.");
            }

            if (!state.currentOffCampusFood) {
              return alert("Please enter your yearly food expense.");
            }
          }
        }

        calculateEstimate();
        state.currentStep = 5;
        renderCurrentStep();
      };
    }
  }

  if (state.currentStep === 5) {
    const fullName = document.getElementById("fullName");
    const email = document.getElementById("email");
    const back = document.getElementById("backStep5");
    const downloadBtn = document.getElementById("downloadEstimateBtn");
    const emailBtn = document.getElementById("emailEstimateBtn");

    if (fullName) {
      fullName.oninput = e => {
        state.fullName = e.target.value;
      };
    }

    if (email) {
      email.oninput = e => {
        state.email = e.target.value;
      };
    }

    if (back) {
      back.onclick = () => {
        state.currentStep = 4;
        renderCurrentStep();
      };
    }

    if (downloadBtn) {
      downloadBtn.onclick = async () => {
        try {
          calculateEstimate();

          if (!state.fullName.trim()) {
            alert("Please enter your full name.");
            return;
          }

          if (!state.email.trim()) {
            alert("Please enter your email address.");
            return;
          }

          await generateEstimatePDF();
        } catch (error) {
          console.error("PDF generation failed:", error);
          alert("PDF download failed. Please refresh and try again.");
        }
      };
    }

    if (emailBtn) {
      emailBtn.onclick = () => {
        if (!state.fullName.trim()) return alert("Please enter your full name.");
        if (!state.email.trim()) return alert("Please enter your email address.");
        alert("Email flow can be wired next.");
      };
    }
  }
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

function getAvailableCampuses() {
  return [...new Set(
    getTuitionArray()
      .filter(row => {
        const residencyMatch = normalize(row.Residency) === normalize(state.residencyType);
        const provinceMatch =
          state.residencyType === "International"
            ? normalize(row.Province) === "INT"
            : !state.province || normalize(row.Province) === normalize(state.province);
        return residencyMatch && provinceMatch;
      })
      .map(row => normalize(row.Campus))
      .filter(Boolean)
  )];
}

function getAvailableCohortYears() {
  const rows = getTuitionArray().filter(row => {
    const residencyMatch = normalize(row.Residency) === normalize(state.residencyType);
    const provinceMatch =
      state.residencyType === "International"
        ? normalize(row.Province) === "INT"
        : !state.province || normalize(row.Province) === normalize(state.province);

    return residencyMatch && provinceMatch;
  });

  if (state.studentPhase === "future") {
    const endYears = rows
      .map(row => {
        const cohort = normalize(row.CohortYear);
        const match = cohort.match(/(\d{4})\s*-\s*(\d{4})/);
        return match ? Number(match[2]) : 0;
      })
      .filter(Boolean);

    const latestYear = endYears.length ? Math.max(...endYears) : new Date().getFullYear();

    return Array.from({ length: 7 }, (_, i) => String(latestYear + i));
  }

  return [...new Set(
    rows
      .map(row => normalize(row.CohortYear))
      .filter(Boolean)
  )];
}

function getLatestCurrentCohortYear() {
  const rows = getTuitionArray().filter(row => {
    const residencyMatch = normalize(row.Residency) === normalize(state.residencyType);
    const provinceMatch =
      state.residencyType === "International"
        ? normalize(row.Province) === "INT"
        : !state.province || normalize(row.Province) === normalize(state.province);

    return residencyMatch && provinceMatch;
  });

  const cohortYears = [...new Set(
    rows.map(row => normalize(row.CohortYear)).filter(Boolean)
  )];

  if (!cohortYears.length) return "";

  const sorted = cohortYears.sort((a, b) => {
    const aMatch = a.match(/(\d{4})\s*-\s*(\d{4})/);
    const bMatch = b.match(/(\d{4})\s*-\s*(\d{4})/);

    const aEnd = aMatch ? Number(aMatch[2]) : 0;
    const bEnd = bMatch ? Number(bMatch[2]) : 0;

    return bEnd - aEnd;
  });

  return sorted[0] || "";
}

function getAvailableCountries() {
  return [...new Set(
    (state.data?.["Country List"] || [])
      .map(item => normalize(item.Country))
      .filter(Boolean)
  )].sort((a, b) => a.localeCompare(b));
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
  if (!matches || !matches.length) return [];
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

  if (combined.includes("over 4 years")) {
    return Math.round(maxAmount / 4);
  }

  if (combined.includes("total")) {
    return Math.round(maxAmount / 4);
  }

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

function getAvailablePrograms() {
  return [...new Set(
    getTuitionArray()
      .filter(row => {
        const residencyMatch = normalize(row.Residency) === normalize(state.residencyType);
        const provinceMatch =
          state.residencyType === "International"
            ? normalize(row.Province) === "INT"
            : !state.province || normalize(row.Province) === normalize(state.province);

        const campusMatch =
          !state.campus || normalize(row.Campus) === normalize(state.campus);

        const cohortMatch =
          state.studentPhase === "future"
            ? true
            : !state.cohortYear || normalize(row.CohortYear) === normalize(state.cohortYear);

        return residencyMatch && provinceMatch && campusMatch && cohortMatch;
      })
      .map(row => normalize(row.Program))
      .filter(Boolean)
  )];
}

function getTuitionArray() {
  if (!state.data) return [];
  return state.level === "UG" ? (state.data.UG_Tuition || []) : (state.data.GR_Tuition || []);
}

function matchTuitionRecord() {
  const rows = getTuitionArray();

  let filtered = rows.filter(row => {
    const residencyMatch = normalize(row.Residency) === normalize(state.residencyType);
    const campusMatch = normalize(row.Campus) === normalize(state.campus);
    const programMatch = normalize(row.Program) === normalize(state.program);
    const cohortMatch =
      state.studentPhase === "future"
        ? true
        : !state.cohortYear || normalize(row.CohortYear) === normalize(state.cohortYear);

    return residencyMatch && campusMatch && programMatch && cohortMatch;
  });

  if (state.residencyType === "Domestic") {
    filtered = filtered.filter(row => normalize(row.Province) === normalize(state.province));
  }

  if (state.residencyType === "International") {
    filtered = filtered.filter(row => normalize(row.Province) === "INT");
  }

  state.matchedTuitionRecord = filtered[0] || null;
}

function getTuitionCosts() {
  const row = state.matchedTuitionRecord;
  if (!row) {
    return {
      items: [],
      low: 0,
      high: 0
    };
  }

  const fallTuition = toNumber(row.FallTuition);
  const winterTuition = toNumber(row.WinterTuition);

  const fallTotal = toNumber(row.FallTuition_Compulsory);
  const winterTotal = toNumber(row.WinterTuition_Compulsory);

  const buffer = 1000;

  const items = [
    {
      label: "Fall tuition estimate",
      low: fallTuition,
      high: fallTotal + buffer
    },
    {
      label: "Winter tuition estimate",
      low: winterTuition,
      high: winterTotal + buffer
    }
  ];

  return {
    items,
    low: items.reduce((sum, item) => sum + item.low, 0),
    high: items.reduce((sum, item) => sum + item.high, 0)
  };
}

function getLivingCosts() {
  const items = [];
  let low = 0;
  let high = 0;

  if (!state.housingType || state.housingType === "None") {
    return { items, low, high };
  }

  const isFutureStudent = state.studentPhase === "future";

  if (isFutureStudent) {
    if (state.housingType === "OnCampus") {
      const rows = state.data["On_campus_Living_Costs"] || [];

      const totals = rows
        .map(item => toNumber(item.Cost) + toNumber(item.Deposit))
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
      const rows = state.data["Off_campus_Living_Costs"] || [];

      const groupedByType = {};
      rows.forEach(item => {
        const type = normalize(item["RoomType                "]);
        const total = toNumber(item[" TotalTermCost"]);
        if (!type || !total) return;

        if (!groupedByType[type]) groupedByType[type] = 0;
        groupedByType[type] += total;
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
      const mealPlans = state.data["Meal_Plan"] || [];
      const totals = mealPlans
        .map(item => toNumber(item["Total cost per year"]))
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
    const residence = (state.data["On_campus_Living_Costs"] || []).find(item => {
      const key = `${normalize(item.ResidenceArea)} | ${normalize(item.RoomType)}`;
      return key === state.residence;
    });

    const meal = (state.data["Meal_Plan"] || []).find(item =>
      normalize(item["Meal Plan Size"]) === normalize(state.mealPlan)
    );

    const residenceCost = residence ? toNumber(residence.Cost) + toNumber(residence.Deposit) : 0;
    const mealCost = meal ? toNumber(meal["Total cost per year"]) : 0;
    const total = residenceCost + mealCost;

    if (residence) {
      items.push({
        label: `Residence: ${normalize(residence.ResidenceArea)} - ${normalize(residence.RoomType)}`,
        low: residenceCost,
        high: residenceCost + 1000
      });
    }

    if (meal) {
      items.push({
        label: `Meal plan: ${normalize(meal["Meal Plan Size"])}`,
        low: mealCost,
        high: mealCost
      });
    }

    low = total;
    high = total + 1000;
  }

  if (state.housingType === "OffCampus") {
    const rent = toNumber(state.currentOffCampusRent);
    const food = toNumber(state.currentOffCampusFood);
    const total = rent + food;

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

    low = total;
    high = total;
  }

  return { items, low, high };
}

function getExtraCosts() {
  const items = [];

  if (state.includeBooks) {
    const value = parseAmountFromText(state.data?.Textbooks?.[0]?.Txtbooks || "");
    items.push({
      label: "Textbooks",
      low: value,
      high: value
    });
  }

  if (state.includePersonal) {
    const value = parseAmountFromText(state.data?.["Personal Expenses"]?.[0]?.["Personal Expenses"] || "");
    items.push({
      label: "Personal expenses",
      low: value,
      high: value
    });
  }

  if (state.includeCoop) {
    const value = parseAmountFromText(state.data?.["Co-op Cost"]?.[0]?.["Co-op Cost"] || "");
    items.push({
      label: "Co-op fee estimate",
      low: value,
      high: value
    });
  }

  if (state.residencyType === "International") {
    const value = parseAmountFromText(state.data?.["Health Insurance Int"]?.[0]?.["Health Insurance"] || "");
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

function parseRangeFromText(text) {
  const nums = String(text || "").replace(/,/g, "").match(/(\d+(\.\d+)?)/g);
  if (!nums || !nums.length) return { min: 0, mid: 0, max: 0 };

  if (nums.length === 1) {
    const val = Number(nums[0]) || 0;
    return { min: val, mid: val, max: val };
  }

  const min = Number(nums[0]) || 0;
  const max = Number(nums[1]) || min;
  return { min, mid: Math.round((min + max) / 2), max };
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
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0
  }).format(Number(value) || 0);
}

function formatRangeValue(low, high) {
  const safeLow = Number(low) || 0;
  const safeHigh = Number(high) || 0;

  if (safeLow === safeHigh) {
    return formatMoney(safeLow);
  }

  return `${formatMoney(safeLow)} - ${formatMoney(safeHigh)}`;
}

function escapeHtml(str) {
  return String(str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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
  doc.rect(left, y, fullWidth, 18, "FD");

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

  y += 28;

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
  doc.text(state.mealPlan || "None", 138, line4);

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
