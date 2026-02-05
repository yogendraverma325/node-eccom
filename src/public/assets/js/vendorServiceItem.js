  window.addEventListener('DOMContentLoaded', () => {
    let product_id=0;
     const myModalEl = document.getElementById('fearure_mapping_exampleModal');
    const filterModal = new bootstrap.Modal(myModalEl);

    // 2. Filter Button ka listener
    const openBtns = document.getElementsByClassName('features_amenities');

for (let btn of openBtns) {
  btn.addEventListener('click', async function () {
        const itemId = btn.dataset.serviceItemId
        product_id=itemId
        renderServiceFeatures({
        itemId: itemId
        });
    filterModal.show();
  });
}

  const fearure_mapping_close_modal = document.getElementById('fearure_mapping_close_modal');
   fearure_mapping_close_modal.addEventListener('click', async function () {
     filterModal.hide();
   });

async function renderServiceFeatures({
    itemId,
}) {
    try {
            const response = await fetch('/admin/service_feature_list', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                service_item_id: itemId,
                })
            });

            const data = await response.json();
            
            if(data.status==true){
               
                 let tableHtml = `
        <table class="table table-bordered table-striped">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Feature</th>
                    <th>Status</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
    `;

    if (data.data.length == 0) {
        tableHtml += `
            <tr>
                <td colspan="4" class="text-center">No features found</td>
            </tr>
        `;
    } else {
        data.data.forEach((item, index) => {
            tableHtml += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${item.feature_value}</td>
                    <td>
                        ${item.is_active == 1
                            ? '<span class="badge bg-success">Active</span>' 
                            : '<span class="badge bg-danger">Inactive</span>'}
                    </td>
                    <td>
                        <button 
                            class="btn btn-sm features_amenities_disbaled ${item.is_active == 1 ? 'btn-success' : 'btn-danger'}"
                            data-service-item-id="${item.product_feature_mapping_id}"
                            >
                            ${item.is_active == 1 ? 'Deactivate' : 'Activate'}
                        </button>
                    </td>
                </tr>
            `;
        });
    }

    tableHtml += `
            </tbody>
        </table>
    `;
document.getElementById('product_feature_mappings_div').innerHTML = tableHtml;
            }
        } catch (err) {
           document.getElementById('product_feature_mappings_div').innerHTML = '<div class="alert alert-danger">Something went wrong</div';
           
        }
}
   document
  .getElementById('product_feature_mappings_div')
  .addEventListener('click', async function (e) {

    if (e.target.classList.contains('features_amenities_disbaled')) {
        const itemId = e.target.dataset.serviceItemId;
        console.log('itemId btn clicked:', itemId);
         const response = await fetch('/admin/service_feature_status_change', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                service_item_id: itemId,
                })
            });

            const data = await response.json();
              if(data.status==true){
                    renderServiceFeatures({
                    itemId: product_id
                    });
              }

        // yaha API call / status change logic
    }
});

//     // open modal
  });