  window.addEventListener('DOMContentLoaded', () => {
      const qrModal = document.getElementById('qrModal');
    const qrModalEl = new bootstrap.Modal(qrModal);

    // 2. Filter Button ka listener
    const openBtns = document.getElementsByClassName('qr_code_print');

for (let btn of openBtns) {
  btn.addEventListener('click', async function () {
      // dataset se value nikaalte waqt camelCase ka dhyaan rakhein
      // 'data-service-item-id' banta hai 'serviceItemId'
      const itemId = btn.dataset.serviceItemId;
      
      // Sahi tarika print karne ka:

      try {
            // 1. API Call karein
            const response = await fetch(`/admin/generate-qr/${itemId}/0`);
            const data = await response.json();

            if (data.status) {
                   const printWrapper = document.querySelector('#print-wrapper'); 

    // Sirf EK baar design inject karein modal ke liye
    printWrapper.innerHTML = `
        <div class="a5-card-design">${data.data}</div>
    `;

    qrModalEl.show();
            }else{
                 alert(data.msg);
            }
        } catch (error) {
            console.error("Error fetching QR:", error);
            alert("QR Code could not be generated");
        }
      console.log("item ID is:", itemId); 
      
      // Ya Template Literal use karein:
      // console.log(`Item ID: ${itemId}`);
  });
}
 const qr_code_print_f = document.getElementsByClassName('qr_code_print_f');

for (let btn of qr_code_print_f) {
  btn.addEventListener('click', async function () {
      // dataset se value nikaalte waqt camelCase ka dhyaan rakhein
      // 'data-service-item-id' banta hai 'serviceItemId'
      const itemId = btn.dataset.serviceItemId;
      
      // Sahi tarika print karne ka:

      try {
            // 1. API Call karein
            const response = await fetch(`/admin/generate-qr/${itemId}/1`);
            const data = await response.json();

            if (data.status) {
                const modalBody = document.querySelector('#qrModal .modal-body'); 

                // 2. Pura HTML (CSS + Card) yahan inject karein
                modalBody.innerHTML = data.data;

                // const qrContainer = document.getElementById('qrcode');
                // qrContainer.innerHTML = `<img src="${data.data}" style="width: 150px; height: 150px;" />`;

                   qrModalEl.show();
            }else{
                 alert(data.msg);
            }
        } catch (error) {
            console.error("Error fetching QR:", error);
            alert("QR Code could not be generated");
        }
      console.log("item ID is:", itemId); 
      
      // Ya Template Literal use karein:
      // console.log(`Item ID: ${itemId}`);
  });
}
document.getElementById('downloadCardBtn').addEventListener('click', function() {
    // Check karein ki library loaded hai ya nahi
    if (typeof html2canvas === 'undefined') {
        alert("Library abhi tak load nahi hui hai. Please page refresh karein.");
        return;
    }

    const element = document.getElementById('printableArea');
    html2canvas(element, { scale: 2 }).then(canvas => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL("image/png");
        link.download = 'LocalTravelStay.png';
        link.click();
    });
})

  });
