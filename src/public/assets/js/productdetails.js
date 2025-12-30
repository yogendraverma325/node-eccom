  window.addEventListener('DOMContentLoaded', () => {
 // product details page image change to main div
    const currentImg = document.getElementById("current");
    const thumbnails = document.querySelectorAll(".prodimage");
    thumbnails.forEach((img) => {
    img.addEventListener("click", function () {
    currentImg.src = this.src;
    });
    });
    // product details page image change to main div
  });