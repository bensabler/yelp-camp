// An Immediately Invoked Function Expression (IIFE) that wraps the entire code.
// This ensures that the JavaScript variables/functions are contained and don't pollute the global scope.
(() => {
  // Use the "strict" directive to catch common coding errors and prevent the use of potentially problematic features of JavaScript.
  "use strict";

  // Select all elements with the class "validated-form".
  // These are the forms that we want to apply custom validation to.
  const forms = document.querySelectorAll(".validated-form");

  // Convert the NodeList of forms into an Array, and iterate over each form element.
  Array.from(forms).forEach((form) => {
    // Add a submit event listener to each form.
    form.addEventListener(
      "submit",
      (event) => {
        // Get the password and repeat password values from the current form.
        const password = form.querySelector("#password").value;
        const repeatPassword = form.querySelector("#form3Example4cd").value;

        // Check if the password and repeat password values match.
        if (password !== repeatPassword) {
          // If the passwords don't match, set a custom validation error message on the repeat password input.
          const repeatPasswordInput = form.querySelector("#form3Example4cd");
          repeatPasswordInput.setCustomValidity("Passwords do not match.");
        } else {
          // If the passwords do match, reset any custom validation message set from previous checks.
          const repeatPasswordInput = form.querySelector("#form3Example4cd");
          repeatPasswordInput.setCustomValidity("");
        }

        // Check if the form is valid.
        if (!form.checkValidity()) {
          // If the form is not valid, prevent it from submitting and stop further event propagation.
          event.preventDefault();
          event.stopPropagation();
        }

        // Add the "was-validated" class to the form.
        // This Bootstrap class will style the form inputs to indicate whether they are valid or not.
        form.classList.add("was-validated");
      },
      false // Use event capturing (the third parameter) set to false, meaning we're using event bubbling.
    );
  });
})();
