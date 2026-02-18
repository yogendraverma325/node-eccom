  window.addEventListener('DOMContentLoaded', () => {

    const mainImg = document.querySelector('.main-img');
const img = document.getElementById('current');

mainImg.addEventListener('mousemove', (e) => {
    // Container ki position nikalna
    const { left, top, width, height } = mainImg.getBoundingClientRect();
    
    // Mouse ki position percentage mein nikalna
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;

    // Zoom ka origin wahi rakhein jahan mouse hai
    img.style.transformOrigin = `${x}% ${y}%`;
});

// Mouse hatne par origin center kar dein
mainImg.addEventListener('mouseleave', () => {
    img.style.transformOrigin = 'center center';
    img.style.transition = 'transform 0.3s ease'; // Wapas aate waqt smooth ho
});

    const scrollBtn = document.getElementById('scrollToScope');
    
    if (scrollBtn) {
        scrollBtn.addEventListener('click', function() {
            // Jahan scroll karna hai, us div ki ID yahan likhein
            const targetDiv = document.getElementById('target-spec-div'); 
            
            if (targetDiv) {
                targetDiv.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }
        });
    }
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