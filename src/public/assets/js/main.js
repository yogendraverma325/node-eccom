/*
Template Name: ShopGrids - Bootstrap 5 eCommerce HTML Template.
Author: GrayGrids
*/

(function () {

  function generateUUID() {
    // Standard UUID v4 generator
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0,
        v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
  
    window.addEventListener('DOMContentLoaded', () => {

        

//   password toggle
        const toggles = document.querySelectorAll('.toggle-password');

        toggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const inputId = toggle.getAttribute('data-target');
            const input = document.getElementById(inputId);

            if (input.type === 'password') {
                input.type = 'text';
                toggle.textContent = '👁️'; // open eye
            } else {
                input.type = 'password';
                toggle.textContent = '👁️‍🗨️'; // closed eye
            }
        });
        });
//   password toggle

        // user menu
        var userMenus = document.querySelectorAll('.user-menu');

    userMenus.forEach(function (menu) {
        var icon = menu.querySelector('.user-icon');

        icon.addEventListener('click', function (e) {
            e.stopPropagation();

            // close other menus
            userMenus.forEach(function (m) {
                if (m !== menu) {
                    m.classList.remove('active');
                }
            });

            // toggle current
            menu.classList.toggle('active');
        });
    });

    // click outside close
    document.addEventListener('click', function () {
        userMenus.forEach(function (menu) {
            menu.classList.remove('active');
        });
    });
        //user menu
   

 

     


     // global search
     const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');

    searchBtn.addEventListener('click', () => {
        const keyword = searchInput.value.trim();
        if (!keyword) return;
        const url = new URL(window.location.origin + '/products');
        // search param add
        url.searchParams.set('search', keyword);

        // pagination reset
        url.searchParams.set('page', 1);
        window.location.href = url.toString();
    });

    // ENTER key support
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchBtn.click();
        }
    });
    // global search

      if (!document.cookie.split('; ').find(row => row.startsWith('userCart='))) {
        document.cookie = `userCart=${generateUUID()}; path=/; max-age=${100 * 365 * 24 * 60 * 60}`;
      }
   if ("geolocation" in navigator) {
     navigator.geolocation.watchPosition(
       (position) => {
         const location = {
           latitude: position.coords.latitude,
           longitude: position.coords.longitude,
         };

         // Save location as a cookie
         document.cookie = `userLocation=${encodeURIComponent(JSON.stringify(location))}; path=/; max-age=${100 * 365 * 24 * 60 * 60 * 1000}`;
       },
       (error) => {
         console.error("❌ Geolocation error:", error.message);
       }
     );
   } else {
     console.error("❌ Geolocation not supported by this browser.");
   }
  

   
 });
    //===== Prealoder

    window.onload = function () {
        window.setTimeout(fadeout, 500);
    }
    setTimeout(() => {
      const flashDiv = document.querySelector('.flash-message');
      if (flashDiv) {
        flashDiv.style.animation = 'fadeOut 0.5s forwards';
        setTimeout(() => flashDiv.remove(), 500);  // Remove after animation ends
      }
    }, 3000);  // Wait 3 seconds before fading out
     function closeFlash() {
    const flashDiv = document.querySelector('.flash-message');
      if (flashDiv) {
        flashDiv.style.animation = 'fadeOut 0.5s forwards';
        setTimeout(() => flashDiv.remove(), 500);  // Remove after animation ends
      }
  }
    function fadeout() {
        document.querySelector('.preloader').style.opacity = '0';
        document.querySelector('.preloader').style.display = 'none';
    }


    /*=====================================
    Sticky
    ======================================= */
    window.onscroll = function () {
        var header_navbar = document.querySelector(".navbar-area");
        var sticky = header_navbar.offsetTop;

        // show or hide the back-top-top button
        var backToTo = document.querySelector(".scroll-top");
        if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
            backToTo.style.display = "flex";
        } else {
            backToTo.style.display = "none";
        }
    };

    //===== mobile-menu-btn
    let navbarToggler = document.querySelector(".mobile-menu-btn");
    navbarToggler.addEventListener('click', function () {
        navbarToggler.classList.toggle("active");
    });


})();