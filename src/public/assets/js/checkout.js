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
     if (window.history.replaceState) {
    window.history.replaceState(null, null, window.location.href);
  }
     
  });