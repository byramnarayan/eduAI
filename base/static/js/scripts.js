// Improved mobile menu handling

document.getElementById("menu-toggle").addEventListener("click", function () {
  const menu = document.getElementById("menu");
  menu.classList.toggle("hidden");

  // Close menu when clicking outside
  document.addEventListener("click", function closeMenu(e) {
    if (!menu.contains(e.target) && e.target.id !== "menu-toggle") {
      menu.classList.add("hidden");
      document.removeEventListener("click", closeMenu);
    }
  });
});
