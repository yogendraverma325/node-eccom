/*
Template Name: ShopGrids - Bootstrap 5 eCommerce HTML Template.
Author: GrayGrids
*/

(function () {
    window.addEventListener('DOMContentLoaded', () => {
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