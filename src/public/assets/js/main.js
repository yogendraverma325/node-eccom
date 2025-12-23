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
    // coupon application 
    const applyBtn = document.getElementById('applyCouponBtn');
    const couponInput = document.getElementById('couponCode');
    const discountInput = document.getElementById('discountAmount');
    const finalTotalInput = document.getElementById('finalTotal');
    applyBtn.addEventListener('click', function () {
        const code = couponInput.value.trim();

        if (!code) {
            alert('Please enter coupon code');
            return;
        }
        console.log("code",code)

        fetch('/apply-coupon', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ couponCode: code })
        })
        .then(res => res.json())
        .then(data => {
            if (data.status) {
                document.querySelector('.discountAmount').innerText = data.data.discount;
                document.querySelector('.finalTotal').innerText = data.data.finalTotal;
                alert(data.message);
            } else {
                alert(data.message);
            }
        })
        .catch(err => {
            console.error(err);
            alert('Something went wrong, please try again');
        });
    });
    couponInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') applyBtn.click();
    });
    // coupon application 

    // city list fetch
    $('#state').on('change', function () {
      $('#pincode').html('<option value="">Select Pincode</option>');
      $('#city').html('<option value="">Select City</option>');
        const stateId = $(this).val();

        // City reset
        $('#city').html('<option value="">Select City</option>');

        if (!stateId) {
            return;
        }

        $.ajax({
            url: '/get-cities',
            method: 'GET',
            data: { stateId },
            success: function (res) {
                if (res.status && res.data.length > 0) {
                    res.data.forEach(city => {
                        $('#city').append(
                            `<option value="${city.cityId}">${city.cityName}</option>`
                        );
                    });
                } else {
                    // No data
                    $('#city').html('<option value="">No cities found</option>');
                }
            },
            error: function () {
                // Error case
                $('#city').html('<option value="">Select City</option>');
            }
        });
    });
    // city list fetch

    // city change pincode list fetch
     $('#city').on('change', function () {
      $('#pincode').html('<option value="">Select Pincode</option>');
        const cityId = $(this).val();

        if (!cityId) {
            return;
        }

        $.ajax({
            url: '/get-pincodes',
            method: 'GET',
            data: { cityId },
            success: function (res) {
             if (res.status && res.data.length > 0) {
                    res.data.forEach(city => {
                        $('#pincode').append(
                            `<option value="${city.pincodeId}">${city.pincode}</option>`
                        );
                    });
                } else {
                    // No data
                    $('#pincode').html('<option value="">No Pincode found</option>');
                }
            },
            error: function () {
                // Error case
                $('#pincode').html('<option value="">Select Pincode</option>');
            }
        });
    });
    // city change pincode list fetch


       // product details page image change to main div
    const currentImg = document.getElementById("current");
    const thumbnails = document.querySelectorAll(".prodimage");
    thumbnails.forEach((img) => {
    img.addEventListener("click", function () {
    currentImg.src = this.src;
    });
    });
    // product details page image change to main div

     // product list page changed done
    const sortingSelect = document.getElementById("sorting");
    if (!sortingSelect) return;

    sortingSelect.addEventListener("change", function () {
        const sortValue = this.value;
        const url = new URL(window.location.href);

        if (sortValue) {
            url.searchParams.set("sort", sortValue);
        } else {
            url.searchParams.delete("sort");
        }

        url.searchParams.set("page", 1);
        console.log("url",url)
        window.location.href = url.toString();
    });
     // product list page changed done


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