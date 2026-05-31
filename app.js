const merchantRoutes = [
  {
    merchant: "Namecheap",
    category: "domains",
    tokens: ["namecheap"],
    route: "USD virtual card partner",
    provider: "Geegpay-backed card route",
    confidence: 0.74,
    evidence: "Nigerian local Mastercard failed on Namecheap; Geegpay was cited as the workaround.",
  },
  {
    merchant: "Canva Pro",
    category: "SaaS",
    tokens: ["canva"],
    route: "USD virtual card partner",
    provider: "Geegpay-backed card route",
    confidence: 0.74,
    evidence: "Nigerian local Mastercard failed on Canva Pro; Geegpay was cited as the workaround.",
  },
  {
    merchant: "Google Cloud Platform",
    category: "cloud",
    tokens: ["cloud.google", "console.cloud.google", "gcp"],
    route: "Assisted USD card route",
    provider: "PathPay routing partner",
    confidence: 0.9,
    evidence: "GCP reportedly rejected Nigerian cards, virtual cards, and UBA Africard.",
  },
  {
    merchant: "Google One",
    category: "SaaS",
    tokens: ["one.google", "google one"],
    route: "Subscription card route",
    provider: "Kuda / Providus / Cardtonic candidate",
    confidence: 0.94,
    evidence: "OPay renewal failed after international transactions stopped; comments suggested alternatives.",
  },
  {
    merchant: "Amazon",
    category: "ecommerce",
    tokens: ["amazon", "amzn"],
    route: "Gift-card or assisted card route",
    provider: "PathPay ecommerce route",
    confidence: 0.58,
    evidence: "Nigerian users reported virtual card trouble buying from Amazon.",
  },
  {
    merchant: "Facebook Ads Manager",
    category: "ads",
    tokens: ["business.facebook", "adsmanager", "facebook.com/ads", "meta.com"],
    route: "Ad-spend virtual card route",
    provider: "Geegpay-backed ad route",
    confidence: 0.71,
    evidence: "Naira card was rejected with payment declined or suspicious activity.",
  },
];

const steps = [
  ["Paste checkout URL", "PathPay reads the merchant and purchase context."],
  ["Analyze route", "Compatibility memory chooses the safest available rail."],
  ["Deposit USDT", "User funds the purchase in stablecoins."],
  ["Escrow funds", "Smart contract locks funds until execution completes."],
  ["Execute purchase", "PathPay pays the merchant through the selected route."],
  ["Confirm delivery", "User receives transaction and merchant confirmation."],
];

const state = {
  activeStep: 0,
  merchant: null,
  amount: 18,
  country: "Nigeria",
  txHash: "",
  escrowAddress: "0xPATH...0000",
};

const $ = (id) => document.getElementById(id);

function normalize(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9.]+/g, " ");
}

function detectMerchant(url) {
  const normalized = normalize(url);
  const match = merchantRoutes.find((route) =>
    route.tokens.some((token) => normalized.includes(token)),
  );

  if (match) return match;

  let host = "Unknown merchant";
  try {
    host = new URL(url).hostname.replace(/^www\./, "").split(".")[0];
  } catch {
    host = String(url || "Unknown merchant").slice(0, 24);
  }

  const readable = host.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  return {
    merchant: readable,
    category: "unknown",
    route: "Manual assisted checkout route",
    provider: "PathPay operator route",
    confidence: 0.42,
    evidence: "No exact merchant memory yet; PathPay falls back to manual assisted routing.",
  };
}

function confidenceLabel(score) {
  if (score >= 0.78) return "High";
  if (score >= 0.58) return "Medium";
  return "Low";
}

function shortHash(prefix) {
  const chars = "abcdef0123456789";
  let out = prefix;
  for (let i = 0; i < 10; i += 1) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function setStep(step) {
  state.activeStep = step;
  render();
}

function renderSteps() {
  $("steps").innerHTML = steps
    .map(([title, body], index) => {
      const status = index < state.activeStep ? "done" : index === state.activeStep ? "active" : "";
      return `
        <article class="step ${status}">
          <div class="step-number">${index + 1}</div>
          <div>
            <strong>${title}</strong>
            <p>${body}</p>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderRouteDetails() {
  const merchant = state.merchant;
  $("routeDetails").innerHTML = `
    <div class="detail">
      <span>Payment rail</span>
      <strong>${merchant.route}</strong>
    </div>
    <div class="detail">
      <span>Provider</span>
      <strong>${merchant.provider}</strong>
    </div>
    <div class="detail">
      <span>Merchant category</span>
      <strong>${merchant.category}</strong>
    </div>
    <div class="detail">
      <span>Reason</span>
      <strong>${merchant.evidence}</strong>
    </div>
  `;
}

function renderConfirmation() {
  if (state.activeStep < 5) {
    $("confirmationBadge").textContent = "No purchase yet";
    $("confirmation").className = "confirmation-empty";
    $("confirmation").textContent = "Run the demo flow to see the purchase confirmation.";
    return;
  }

  $("confirmationBadge").textContent = "Confirmed";
  $("confirmation").className = "receipt";
  $("confirmation").innerHTML = `
    <div class="receipt-success">Purchase executed and merchant payment confirmed.</div>
    <div class="receipt-grid">
      <div>
        <span>Merchant</span>
        <strong>${state.merchant.merchant}</strong>
      </div>
      <div>
        <span>User paid</span>
        <strong>${state.amount.toFixed(2)} USDT</strong>
      </div>
      <div>
        <span>Execution route</span>
        <strong>${state.merchant.provider}</strong>
      </div>
      <div>
        <span>Reference</span>
        <strong>PP-${Date.now().toString().slice(-7)}</strong>
      </div>
    </div>
  `;
}

function render() {
  const merchant = state.merchant;
  const confidence = confidenceLabel(merchant.confidence);

  $("merchantName").textContent = merchant.merchant;
  $("merchantShort").textContent = merchant.merchant;
  $("userCountry").textContent = state.country;
  $("depositAmount").textContent = `${state.amount.toFixed(2)} USDT`;
  $("confidenceScore").textContent = confidence;
  $("routeBadge").textContent = confidence;
  $("flowStatus").textContent = steps[state.activeStep][0];

  $("escrowState").textContent =
    state.activeStep >= 4 ? "Released" : state.activeStep >= 3 ? "Locked" : "Waiting";
  $("contractStatus").textContent =
    state.activeStep >= 5
      ? "Released to route"
      : state.activeStep >= 3
        ? "Funds locked"
        : state.activeStep >= 2
          ? "Deposit received"
          : "Awaiting deposit";
  $("escrowAddress").textContent = state.escrowAddress;
  $("txHash").textContent = state.txHash || "Not created";

  $("depositButton").disabled = state.activeStep < 1 || state.activeStep >= 2;
  $("escrowButton").disabled = state.activeStep < 2 || state.activeStep >= 3;
  $("executeButton").disabled = state.activeStep < 3 || state.activeStep >= 5;

  renderSteps();
  renderRouteDetails();
  renderConfirmation();
}

function analyzePurchase(event) {
  event.preventDefault();
  state.merchant = detectMerchant($("checkoutUrl").value);
  state.amount = Number($("amount").value || 0);
  state.country = $("country").value;
  state.txHash = "";
  state.escrowAddress = shortHash("0xPATH");
  setStep(1);
}

function boot() {
  state.merchant = detectMerchant($("checkoutUrl").value);
  render();

  $("checkoutForm").addEventListener("submit", analyzePurchase);
  $("depositButton").addEventListener("click", () => {
    state.txHash = shortHash("0xdep");
    setStep(2);
  });
  $("escrowButton").addEventListener("click", () => {
    state.txHash = shortHash("0xesc");
    setStep(3);
  });
  $("executeButton").addEventListener("click", () => {
    state.txHash = shortHash("0xpay");
    setStep(5);
  });
}

boot();
