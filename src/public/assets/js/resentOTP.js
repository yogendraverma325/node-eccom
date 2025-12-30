  window.addEventListener('DOMContentLoaded', () => {
//resend OTP
        const resendBtn = document.getElementById('resendOtpBtn');
        const otpMessage = document.getElementById('otpMessage');
        resendBtn.addEventListener('click', async () => {
        resendBtn.disabled = true;
        otpMessage.textContent = 'Generating new OTP...';

        try {
            const response = await fetch('/user/resendOTP', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            otpMessage.textContent = data.message
        } catch (err) {
            // console.error(err);
            otpMessage.textContent = 'Something went wrong, please try again.';
        } finally {
            setTimeout(() => {
                resendBtn.disabled = false;
                otpMessage.textContent = '';
            }, 3000); // enable button after 3 seconds
        }
    });
        //resend OTP
  });