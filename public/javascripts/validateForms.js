(() => {
  "use strict";

  const forms = document.querySelectorAll(".validated-form");

  Array.from(forms).forEach((form) => {
    form.addEventListener(
      "submit",
      (event) => {
        const password = form.querySelector("#password").value;
        const repeatPassword = form.querySelector("#form3Example4cd").value;

        if (password !== repeatPassword) {
          // If passwords don't match, set a custom validation error
          const repeatPasswordInput = form.querySelector("#form3Example4cd");
          repeatPasswordInput.setCustomValidity("Passwords do not match.");
        } else {
          // If passwords match, reset any custom validation from previous checks
          const repeatPasswordInput = form.querySelector("#form3Example4cd");
          repeatPasswordInput.setCustomValidity("");
        }

        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }

        form.classList.add("was-validated");
      },
      false
    );
  });
})();
