document.getElementById("browseImages").addEventListener("click", function () {
  document.getElementById("image").click();
});

document.getElementById("image").addEventListener("change", function () {
  const label = this.previousElementSibling;
  const files = Array.from(this.files)
    .map((file) => file.name)
    .join(", ");
  label.textContent = files ? files : "Choose image(s)...";
});
