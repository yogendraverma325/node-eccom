
window.addEventListener('DOMContentLoaded', () => {

        const bookingmodalbtn = document.getElementsByClassName('booking-modal-btn');

        for (let btn of bookingmodalbtn) {
        btn.addEventListener('click', function () {

            const phone = btn.dataset.phone;
            const email = btn.dataset.email;
            const address = btn.dataset.address;
            
            const b_phonecontainer = document.getElementById('b_phone');
            b_phonecontainer.innerHTML = phone;
            const b_emailcontainer = document.getElementById('b_email');
            b_emailcontainer.innerHTML = email;
            const b_addresscontainer = document.getElementById('b_address');
            b_addresscontainer.innerHTML = address;

        $('#exampleModal').modal('show')
        });
        }
    
  const closebookingModal = document.getElementById('ClosebookingModal');
    closebookingModal.addEventListener('click', async () => {
    $('#exampleModal').modal('hide')
    // exampleModal
  });
    // open modal

    // clear filters
     // 3. Apply Button ka listener
    const clearFilterBtn = document.getElementById('clearFilterBtn');
    if (clearFilterBtn) {
        clearFilterBtn.addEventListener('click', function () {
              const url = new URL(window.location.href);
                url.searchParams.delete("rating");
                url.searchParams.delete("price");
                url.searchParams.set("page", 1);
            window.location.href = url.toString();
        });
    }
    // clear fitlers
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


    //  filters section
    const myModalEl = document.getElementById('filterModal');
    const filterModal = new bootstrap.Modal(myModalEl);

    // 2. Filter Button ka listener
    const openBtns = document.getElementsByClassName('openFilterBtn');

for (let btn of openBtns) {
  btn.addEventListener('click', function () {
    filterModal.show();
  });
}

    // 3. Apply Button ka listener
    const applyBtn = document.getElementById('applyFilterBtn');
    if (applyBtn) {
        applyBtn.addEventListener('click', function () {
            let filterApplied=false
              const url = new URL(window.location.href);
            const princeRange = document.querySelector('input[name="priceRange"]:checked');
            const rating = document.querySelector('input[name="rating"]:checked');
            if (princeRange) {
                filterApplied=true;
             url.searchParams.set("price", princeRange.value);
            // Ab aap isse fetch ya window.location mein use kar sakte hain
            // window.location.href = `/search?minPrice=${minVal}&maxPrice=${maxVal}`;
            }
            if(rating){
                 filterApplied=true;
            const ratingValue = rating.value;
             url.searchParams.set("rating", ratingValue);
            }
            url.searchParams.set("page", 1);
            if( filterApplied){
                window.location.href = url.toString();
            }
           
        });
    }
    
    // 4. Modal events (Optional: Agar khulne ya band hone par kuch karna ho)
    myModalEl.addEventListener('shown.bs.modal', function () {
        console.log('Modal is now visible');
    });
    // filters section


    const sections = 4;
    const container = document.getElementById('dynamicPriceFilters');
    const priceData = document.getElementById('price-data');
    const min = parseInt(priceData.getAttribute('data-min')) || 0;
    const max = parseInt(priceData.getAttribute('data-max')) || 0;
    const pricemin = parseInt(priceData.getAttribute('data-pricemin')) || null;
    const pricemax = parseInt(priceData.getAttribute('data-pricemax')) || null;
    let priceRange=''
if(pricemin && pricemax){
priceRange=pricemin+'-'+pricemax;
}
    
    // Har section ka gap calculate karein (approx 1225)
    const step = (max - min) / sections;

    let htmlContent = '';

    for (let i = 0; i < sections; i++) {
        let currentMin = Math.round(min + (i * step));
        let currentMax = Math.round(min + ((i + 1) * step));
        
        // Unique ID har radio button ke liye
        const id = `priceRange${i}`;
        const rangeValue = `${currentMin}-${currentMax}`;

        htmlContent += `
            <div class="form-check mb-2">
                <input class="form-check-input" type="radio" name="priceRange" id="${id}" value="${rangeValue}" ${priceRange == rangeValue ? "checked" : ""}>
                <label class="form-check-label" for="${id}">
                     <i class="fa fa-rupee"></i> ${currentMin} -  <i class="fa fa-rupee"></i>${currentMax}
                </label>
            </div>
        `;
    }

    container.innerHTML += htmlContent;
  });