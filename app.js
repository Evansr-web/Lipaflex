
"use strict";

const STORAGE_KEY = "lipaflex_demo_requests";

const form = document.getElementById("requestForm");
const list = document.getElementById("requestsList");
const totalCount = document.getElementById("totalCount");
const pendingCount = document.getElementById("pendingCount");
const completedCount = document.getElementById("completedCount");
const year = document.getElementById("year");

let requests = [];

function loadRequests() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    requests = Array.isArray(saved) ? saved : [];
  } catch {
    requests = [];
  }
}

function saveRequests() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
}

function formatAmount(amount) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES"
  }).format(amount);
}

function updateDashboard() {
  totalCount.textContent = requests.length;

  pendingCount.textContent = requests.filter(
    request => request.status === "Pending"
  ).length;

  completedCount.textContent = requests.filter(
    request => request.status === "Completed"
  ).length;
}

function renderRequests() {
  list.replaceChildren();

  if (requests.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "No requests yet. Submit your first bill request!";
    list.appendChild(empty);
  }

  requests.forEach(request => {
    const card = document.createElement("article");
    card.className = "request-card";

    const heading = document.createElement("h3");
    heading.textContent = request.billType;

    const amount = document.createElement("p");
    amount.textContent = formatAmount(request.amount);

    const reference = document.createElement("p");
    reference.textContent = "Reference: " + request.reference;

    const status = document.createElement("p");
    status.textContent = "Status: " + request.status;

    const customer = document.createElement("p");
    customer.textContent = "Customer: " + request.customerName;

    card.append(heading, amount, reference, status, customer);
    list.appendChild(card);
  });

  updateDashboard();
}

form.addEventListener("submit", function(event) {
  event.preventDefault();

  const customerName = document.getElementById("customerName").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const billType = document.getElementById("billType").value;
  const reference = document.getElementById("reference").value.trim();
  const amount = Number(document.getElementById("amount").value);
  const notes = document.getElementById("notes").value.trim();

  const cleanPhone = phone.replace(/[\s-]/g, "");

  const validPhone = /^(?:0[17]\d{8}|254[17]\d{8}|\+254[17]\d{8})$/.test(cleanPhone);

  if (!validPhone) {
    alert("Please enter a valid Kenyan phone number.");
    return;
  }

  if (!customerName || !billType || !reference || !Number.isFinite(amount) || amount <= 0) {
    alert("Please fill in all required fields correctly.");
    return;
  }

  const request = {
    id: Date.now().toString(),
    customerName,
    phone: cleanPhone,
    billType,
    reference,
    amount,
    notes,
    status: "Pending",
    date: new Date().toISOString()
  };

  requests.unshift(request);
  saveRequests();
  renderRequests();
  form.reset();

  alert("Your bill request has been submitted! No payment has been made yet.");
});

year.textContent = new Date().getFullYear();

loadRequests();
renderRequests();
