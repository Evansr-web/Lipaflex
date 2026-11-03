
"use strict";

const STORAGE_KEY = "lipaflex_demo_requests";

const form = document.getElementById("requestForm");
const list = document.getElementById("requestsList");

const totalCount = document.getElementById("totalCount");
const pendingCount = document.getElementById("pendingCount");
const completedCount = document.getElementById("completedCount");

const year = document.getElementById("year");

function readRequests() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const requests = saved ? JSON.parse(saved) : [];

    return Array.isArray(requests) ? requests : [];
  } catch (error) {
    console.error("Could not read saved requests:", error);
    return [];
  }
}

function saveRequests(requests) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(requests)
    );

    return true;
  } catch (error) {
    console.error("Could not save requests:", error);
    return false;
  }
}

function formatMoney(amount) {
  return new Intl.NumberFormat("en-KE").format(amount);
}

function createElement(tag, className, text) {
  const element = document.createElement(tag);

  if (className) {
    element.className = className;
  }

  if (text !== undefined) {
    element.textContent = text;
  }

  return element;
}

function render() {
  const requests = readRequests();

  totalCount.textContent = requests.length;

  pendingCount.textContent = requests.filter(
    request => request.status === "Pending"
  ).length;

  completedCount.textContent = requests.filter(
    request => request.status === "Completed"
  ).length;

  list.replaceChildren();

  if (requests.length === 0) {
    const empty = createElement("div", "empty-state");

    empty.append(
      createElement("span", "", "▤"),
      createElement("h3", "", "No requests yet"),
      createElement(
        "p",
        "",
        "Your submitted requests will appear here."
      )
    );

    list.appendChild(empty);
    return;
  }

  requests.slice().reverse().forEach(request => {
    const card = createElement("article", "request-card");
    const top = createElement("div", "request-top");

    const title = createElement("strong", "", request.type);
    const amount = createElement(
      "span",
      "amount",
      "KSh " + formatMoney(request.amount)
    );

    top.append(title, amount);

    const details = createElement("div", "request-meta");

    details.textContent =
      "Ref: " + request.reference +
      "\nRequest ID: " + request.id +
      "\n" + request.date;

    const statusClass = request.status.toLowerCase();

    const status = createElement(
      "span",
      "status " + statusClass,
      request.status
    );

    card.append(top, details, status);
    list.appendChild(card);
  });
}

function isValidKenyanPhone(phone) {
  const normalized = phone.replace(/[\s-]/g, "");

  return /^(?:0[17]\d{8}|254[17]\d{8}|\+254[17]\d{8})$/.test(
    normalized
  );
}

function generateRequestId() {
  return "LF-" +
    Date.now().toString(36).toUpperCase() +
    "-" +
    Math.random().toString(36).slice(2, 6).toUpperCase();
}

form.addEventListener("submit", event => {
  event.preventDefault();

  if (!form.reportValidity()) {
    return;
  }

  const data = new FormData(form);

  const name = String(data.get("customerName") || "").trim();
  const phone = String(data.get("phone") || "").trim();
  const type = String(data.get("billType") || "").trim();
  const reference = String(data.get("reference") || "").trim();
  const amount = Number(data.get("amount"));
  const notes = String(data.get("notes") || "").trim();

  if (!name || !reference || !type) {
    alert("Please complete all required fields.");
    return;
  }

  if (!isValidKenyanPhone(phone)) {
    alert("Please enter a valid Kenyan mobile number.");
    return;
  }

  if (!Number.isSafeInteger(amount) || amount < 1 || amount > 10000000) {
    alert("Please enter a valid amount in KSh.");
    return;
  }

  const request = {
    id: generateRequestId(),
    name,
    phone,
    type,
    reference,
    amount,
    notes,
    status: "Pending",
    date: new Date().toLocaleString("en-KE", {
      dateStyle: "medium",
      timeStyle: "short"
    })
  };

  const requests = readRequests();
  requests.push(request);

  if (!saveRequests(requests)) {
    alert("Unable to save your request. Please check your browser storage.");
    return;
  }

  form.reset();
  render();

  alert(
    "Demo request submitted successfully!\nRequest ID: " +
    request.id +
    "\nNo payment has been made."
  );
});

year.textContent = new Date().getFullYear();

render();
                  
