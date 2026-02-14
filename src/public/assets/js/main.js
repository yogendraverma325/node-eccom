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
   // Function jo check karegi ki cookie exist karti hai ya nahi
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

if ("geolocation" in navigator) {
    navigator.geolocation.watchPosition(
        (position) => {
            const location = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            };

            const cookieName = "userLocation";
            const hasCookie = getCookie(cookieName);

            // Cookie save karein (Seconds mein: 100 years)
            document.cookie = `${cookieName}=${encodeURIComponent(JSON.stringify(location))}; path=/; max-age=${100 * 365 * 24 * 60 * 60}`;

            // AGAR pehle se cookie nahi thi, iska matlab user ne abhi permission di hai
            if (!hasCookie) {
                console.log("✅ First time location received. Reloading...");
                window.location.reload();
            } else {
        
            }
        },
        (error) => {
             handleLocationError(error);
            console.error("❌ Geolocation error:", error.message);
        },
        {
            enableHighAccuracy: true, // Behtar accuracy ke liye
            maximumAge: 0,            // Cache location use na kare
            timeout: 5000             // 5 seconds timeout
        }
    );
} else {
    console.error("❌ Geolocation not supported.");
}
  

   
 });
// 1. Function: Location mangne aur Cookie save karne ke liye
async function requestLocation() {
     const myModal = new bootstrap.Modal(document.getElementById('locationModal'));
    
    console.log("Checking permissions...");

    // 1. Check Permission Status
    if (navigator.permissions) {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        console.log("result.state",result.state)
        
        if (result.state === 'denied') {
          myModal.show(); // Bootstrap modal open karein
            return;
        }
         if (result.state === 'granted') {
              window.location.reload();
              return;
         }
    }

    // 2. Agar Denied nahi hai, tabhi popup aayega
    navigator.geolocation.watchPosition(
        (position) => {
            console.log("Location received!");
            const location = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            };

            const hasCookie = document.cookie.includes("userLocation=");
            document.cookie = `userLocation=${encodeURIComponent(JSON.stringify(location))}; path=/; max-age=${100 * 365 * 24 * 60 * 60}; path=/`;

            if (!hasCookie) {
                window.location.reload();
            }
        },
        (error) => {
            console.log("Error code:", error.code, "Message:", error.message);
            if (error.code === 1) { // PERMISSION_DENIED
                alert("Location access denied. Please enable it from settings.");
            }
        },
        { enableHighAccuracy: true, timeout: 10000 }
    );
}

function handleLocationError(error){
    const overlay = document.getElementById('location-overlay');
   
    if(overlay){
        const messageElement = document.getElementById('location-message');
        overlay.style.display = 'flex'; // UI dikhao
        if (error.code === error.PERMISSION_DENIED) {
        messageElement.innerHTML = `
        <strong>Oops! Location is Blocked.</strong><br>
        To view nearby services, please enable location access in your browser settings and refresh the page.
        `;
        } else {
        messageElement.innerText = "Location access zaroori hai services dikhane ke liye.";
        }
    }


}
    const searchBtn = document.getElementById('enable-location-btn');
    if(searchBtn){
    searchBtn.addEventListener('click', () => {
    requestLocation();
    });
    }

        const reloadBUtton =document.getElementById('reloadModal');
        if(reloadBUtton){
        reloadBUtton.addEventListener('click', () => {
        window.location.reload();
        });
        }
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