/* =====================================================
   Student Mental Health Prediction – frontend logic
   ===================================================== */

// ---------- Configuration ----------
// Direct call to FastAPI. If you serve the frontend through serve.py
// (proxy mode, see README) change this to "/predict".
const API_URL = "http://127.0.0.1:2200/predict";
const REQUEST_TIMEOUT_MS = 20000;

// Scale used ONLY to draw the gauge and the colour band of the result.
// The score itself always comes from the backend. Change if your model uses a different range.
const SCORE_MIN = 0;
const SCORE_MAX = 10;

// Same list as `top_countries` in the FastAPI backend (excluding "Other")
const TOP_COUNTRIES = ["India", "USA", "Canada", "Australia", "UK", "Germany", "Mexico", "Turkey", "France"];

// ---------- Field definitions & validation ----------
const FIELDS = [
  { name: "age",                     type: "int",    min: 10, max: 100, label: "Age" },
  { name: "gender",                  type: "choice", label: "Gender" },
  { name: "country",                 type: "text",   label: "Country" },
  { name: "academic_level",          type: "choice", label: "Academic level" },
  { name: "most_used_platform",      type: "choice", label: "Most used platform" },
  { name: "purpose_of_use",          type: "choice", label: "Purpose of use" },
  { name: "avg_daily_usage_hours",   type: "float",  min: 0, max: 24, label: "Average daily usage" },
  { name: "daily_unlocks",           type: "int",    min: 0, max: Infinity, label: "Daily unlocks" }, // backend: ge=0 only
  { name: "study_hours",             type: "float",  min: 0, max: 24, label: "Study hours" },
  { name: "physical_activity_hours", type: "float",  min: 0, max: 2,  label: "Physical activity" },
  { name: "sleep_hours_per_night",   type: "float",  min: 0, max: 24, label: "Sleep hours" },
  { name: "stress_level",            type: "choice", label: "Stress level" },
];

// ---------- DOM references ----------
const form        = document.getElementById("predict-form");
const submitBtn   = document.getElementById("submit-btn");
const resetBtn    = document.getElementById("reset-btn");
const states = {
  idle:    document.getElementById("state-idle"),
  loading: document.getElementById("state-loading"),
  success: document.getElementById("state-success"),
  error:   document.getElementById("state-error"),
};
const scoreValue = document.getElementById("score-value");
const scoreScale = document.getElementById("score-scale");
const scoreBadge = document.getElementById("score-badge");
const scoreNote  = document.getElementById("score-note");
const gaugeFill  = document.getElementById("gauge-fill");
const errorTitle = document.getElementById("error-title");
const errorMsg   = document.getElementById("error-message");

const GAUGE_LENGTH = 2 * Math.PI * 52; // circumference of the SVG circle (r = 52)
scoreScale.textContent = `/ ${SCORE_MAX}`;

// ---------- UI state helpers ----------
function showState(name) {
  Object.entries(states).forEach(([key, el]) => (el.hidden = key !== name));
}

function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  submitBtn.classList.toggle("loading", isLoading);
  submitBtn.querySelector(".btn-label").textContent = isLoading
    ? "Predicting…"
    : "Predict Mental Health Score";
}

function showError(title, message) {
  errorTitle.textContent = title;
  errorMsg.textContent = message;
  showState("error");
}

// ---------- Validation ----------
function setFieldError(name, message) {
  const holder = form.querySelector(`[data-error-for="${name}"]`);
  if (!holder) return;
  holder.textContent = message || "";
  holder.closest(".field")?.classList.toggle("invalid", Boolean(message));
}

function readAndValidate() {
  const data = {};
  const errors = {};
  const fd = new FormData(form);

  for (const f of FIELDS) {
    const raw = (fd.get(f.name) ?? "").toString().trim();

    if (raw === "") {
      errors[f.name] = f.type === "choice" ? `Please select ${f.label.toLowerCase()}.` : `${f.label} is required.`;
      continue;
    }

    if (f.type === "int" || f.type === "float") {
      const num = Number(raw);
      if (!Number.isFinite(num)) {
        errors[f.name] = `${f.label} must be a number.`;
      } else if (f.type === "int" && !Number.isInteger(num)) {
        errors[f.name] = `${f.label} must be a whole number.`;
      } else if (num < f.min || num > f.max) {
        errors[f.name] = Number.isFinite(f.max)
          ? `${f.label} must be between ${f.min} and ${f.max}.`
          : `${f.label} must be ${f.min} or more.`;
      } else {
        data[f.name] = num;
      }
    } else if (f.name === "country") {
      // The backend groups only these exact spellings; anything else becomes "Other".
      // Match case-insensitively so "india" is sent as "India".
      data[f.name] = TOP_COUNTRIES.find((c) => c.toLowerCase() === raw.toLowerCase()) || raw;
    } else {
      data[f.name] = raw;
    }
  }

  return { data, errors };
}

function clearErrors() {
  FIELDS.forEach((f) => setFieldError(f.name, ""));
}

// ---------- Result rendering ----------
function bandFor(score) {
  const ratio = (score - SCORE_MIN) / (SCORE_MAX - SCORE_MIN);
  if (ratio >= 0.7) return { cls: "good",     label: "Higher score",     color: "#16a34a" };
  if (ratio >= 0.4) return { cls: "moderate", label: "Moderate score",   color: "#d97706" };
  return               { cls: "low",      label: "Lower score",      color: "#dc2626" };
}

function animateNumber(el, to, duration = 1200) {
  const start = performance.now();
  const tick = (now) => {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = (to * eased).toFixed(2);
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = Number(to).toFixed(2);
  };
  requestAnimationFrame(tick);
}

function showResult(score) {
  const band = bandFor(score);
  const ratio = Math.min(Math.max((score - SCORE_MIN) / (SCORE_MAX - SCORE_MIN), 0), 1);

  showState("success");
  scoreBadge.className = `badge ${band.cls}`;
  scoreBadge.textContent = band.label;
  scoreNote.textContent =
    "Score returned by the trained model for the details you entered.";
  gaugeFill.style.setProperty("--gauge-color", band.color);

  // Reset then animate the ring
  gaugeFill.style.transition = "none";
  gaugeFill.style.strokeDashoffset = GAUGE_LENGTH;
  void gaugeFill.getBoundingClientRect(); // force reflow
  gaugeFill.style.transition = "";
  gaugeFill.style.strokeDashoffset = GAUGE_LENGTH * (1 - ratio);

  animateNumber(scoreValue, score);
}

// ---------- API call ----------
function formatApiError(status, body) {
  // FastAPI validation errors: { detail: [ { loc: [...], msg: "..." } ] }
  if (body && Array.isArray(body.detail)) {
    return body.detail
      .map((d) => `${(d.loc || []).filter((p) => p !== "body").join(".") || "input"}: ${d.msg}`)
      .join("\n");
  }
  if (body && typeof body.detail === "string") return body.detail;
  return `The server responded with status ${status}.`;
}

async function requestPrediction(payload) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    let body = null;
    try { body = await response.json(); } catch { /* non-JSON response */ }

    if (!response.ok) {
      const err = new Error(formatApiError(response.status, body));
      err.kind = response.status === 422 ? "validation" : "server";
      throw err;
    }

    const score = Number(body?.predicted_mental_health_score);
    if (!Number.isFinite(score)) {
      const err = new Error("The backend response did not contain a valid 'predicted_mental_health_score'.");
      err.kind = "server";
      throw err;
    }
    return score;
  } catch (err) {
    if (err.name === "AbortError") {
      const e = new Error("The request timed out. Please check that the backend is running and try again.");
      e.kind = "timeout";
      throw e;
    }
    if (err instanceof TypeError) {
      // fetch() rejects with TypeError on network failure / CORS block
      const e = new Error(
        `Could not reach the backend at ${API_URL}.\n` +
        "• Make sure FastAPI is running on port 2200.\n" +
        "• If the server is running, this may be a CORS issue (see README)."
      );
      e.kind = "network";
      throw e;
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

// ---------- Event handlers ----------
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearErrors();

  const { data, errors } = readAndValidate();
  const errorNames = Object.keys(errors);

  if (errorNames.length) {
    errorNames.forEach((name) => setFieldError(name, errors[name]));
    form.querySelector(".invalid")?.scrollIntoView({ behavior: "smooth", block: "center" });
    showError("Please check your input", "Some fields are missing or out of range. Fix the highlighted fields and try again.");
    return;
  }

  // Exact payload shape expected by the backend
  const payload = {
    age: data.age,
    gender: data.gender,
    country: data.country,
    academic_level: data.academic_level,
    most_used_platform: data.most_used_platform,
    purpose_of_use: data.purpose_of_use,
    avg_daily_usage_hours: data.avg_daily_usage_hours,
    daily_unlocks: data.daily_unlocks,
    study_hours: data.study_hours,
    physical_activity_hours: data.physical_activity_hours,
    sleep_hours_per_night: data.sleep_hours_per_night,
    stress_level: data.stress_level,
  };

  setLoading(true);
  showState("loading");
  if (window.matchMedia("(max-width: 960px)").matches) {
    document.getElementById("result-card").scrollIntoView({ behavior: "smooth", block: "center" });
  }

  try {
    const score = await requestPrediction(payload);
    showResult(score);
  } catch (err) {
    const titles = {
      network: "Backend unavailable",
      timeout: "Request timed out",
      validation: "Backend rejected the input",
      server: "Prediction failed",
    };
    showError(titles[err.kind] || "Something went wrong", err.message);
  } finally {
    setLoading(false);
  }
});

form.addEventListener("reset", () => {
  clearErrors();
  setLoading(false);
  showState("idle");
});

// Clear a field's error as soon as the user edits it
form.addEventListener("input", (e) => e.target.name && setFieldError(e.target.name, ""));
form.addEventListener("change", (e) => e.target.name && setFieldError(e.target.name, ""));
