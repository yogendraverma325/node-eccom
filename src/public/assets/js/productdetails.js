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

    const mainImgContainer = document.querySelector('.main-img');
const mainImg = document.getElementById('current');

mainImgContainer.addEventListener('mousemove', (e) => {
    // Calculate mouse position percentage inside the container
    const x = e.clientX - e.target.offsetLeft;
    const y = e.clientY - e.target.offsetTop;
    
    const xPercent = (x / mainImgContainer.offsetWidth) * 100;
    const yPercent = (y / mainImgContainer.offsetHeight) * 100;
    
    // Move the zoom focus to where the mouse is
    mainImg.style.transformOrigin = `${xPercent}% ${yPercent}%`;
});

mainImgContainer.addEventListener('mouseleave', () => {
    mainImg.style.transformOrigin = 'center center';
});
  });