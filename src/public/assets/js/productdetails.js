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
    // open modal
    const bookingModal = document.getElementById('bookingModal');
     const closebookingModal = document.getElementById('ClosebookingModal');
    bookingModal.addEventListener('click', async () => {
      $('#exampleModal').modal('show')
      // exampleModal
    });
    closebookingModal.addEventListener('click', async () => {
    $('#exampleModal').modal('hide')
    // exampleModal
  });
    // open modal
  });