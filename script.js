const form = document.querySelector("#signup-form");
const confirmation = document.querySelector("#confirmation");
const confirmationCopy = document.querySelector("#confirmation-copy");
const resetButton = document.querySelector("#reset-form");
const agreement = document.querySelector(".agreement");
const agreementError = document.querySelector(".agreement-error");

function markField(field, isValid) {
  const group = field.closest(".field-group");
  if (!group) return;
  group.classList.toggle("is-invalid", !isValid);
}

function validateForm() {
  if (!form) return false;

  let isValid = true;
  const requiredFields = form.querySelectorAll("input[required]:not([type='checkbox'])");

  requiredFields.forEach((field) => {
    const fieldIsValid = field.value.trim().length > 0;
    markField(field, fieldIsValid);
    isValid = fieldIsValid && isValid;
  });

  const paymentAgreement = document.querySelector("#payment-agreement");
  const paymentChecked = paymentAgreement ? paymentAgreement.checked : false;
  if (agreement) agreement.classList.toggle("is-invalid", !paymentChecked);
  if (agreementError) agreementError.classList.toggle("is-visible", !paymentChecked);
  isValid = paymentChecked && isValid;

  return isValid;
}

if (form) {
  form.addEventListener("input", (event) => {
    if (event.target.matches("input[required]:not([type='checkbox'])")) {
      markField(event.target, event.target.value.trim().length > 0);
    }
  });
}

if (form) {
  form.addEventListener("change", (event) => {
    if (event.target.id === "payment-agreement") {
      if (agreement) agreement.classList.toggle("is-invalid", !event.target.checked);
      if (agreementError) agreementError.classList.toggle("is-visible", !event.target.checked);
    }
  });
}

if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const data = new FormData(form);
    const name = data.get("residentName").trim();
    const unit = data.get("unitNumber").trim();
    const phone = data.get("phoneNumber").trim();

    confirmationCopy.textContent = `${name} in unit ${unit} has been added for the next scheduled same-day interior treatment. The contact phone number on file is ${phone}, and payment is $40 by cash or check payable to ORKIN at service time.`;
    confirmation.hidden = false;
    form.hidden = true;
    confirmation.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

if (resetButton) {
  resetButton.addEventListener("click", () => {
    form.reset();
    form.hidden = false;
    confirmation.hidden = true;
    form.querySelectorAll(".is-invalid").forEach((element) => element.classList.remove("is-invalid"));
    if (agreementError) agreementError.classList.remove("is-visible");
  });
}
