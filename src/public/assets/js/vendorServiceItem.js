  window.addEventListener('DOMContentLoaded', () => {
    let product_id=0;
    let service_item_id=0;
    let edit_mode=false;
    // feature and mapping modal logic
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
                        <button 
                            class="btn btn-sm features_amenities_edit btn-info"
                            data-service-item-id="${item.product_feature_mapping_id}"
                             data-service-item-value="${item.feature_value}"
                            >
                            Edit
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

document.getElementById('addFeatureForm').addEventListener('submit', async function (e) {
    e.preventDefault(); // page reload roko

    const featureValue = document.getElementById('feature_input').value.trim();
     if (!featureValue) {
        alert('Feature is required');
        return;
    }

    try {
        const response = await fetch('/admin/add_service_feature', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                feature_value: featureValue,
                edit_mode:edit_mode,
                service_item_id:service_item_id,
                product_id: product_id // modal open pe set karo
            })
        });

        const result = await response.json();

        if (result.status) {
            document.getElementById('feature_input').value = '';
            document.getElementById('cancel_feature_btn').style.display = 'none';
             edit_mode=false;
             service_item_id=0;
            // list refresh
            renderServiceFeatures({
                itemId: product_id
            });
        } else {
            alert(result.message || 'Failed to add feature');
        }

    } catch (err) {
        console.error(err);
        alert('Something went wrong');
    }

});


// edit form
 document
  .getElementById('product_feature_mappings_div')
  .addEventListener('click', async function (e) {

    if (e.target.classList.contains('features_amenities_edit')) {
        const itemId = e.target.dataset.serviceItemId;
        edit_mode=true;
        service_item_id = itemId;
        console.log('itemValue:', itemId);
        document.getElementById('feature_input').value = e.target.dataset.serviceItemValue;
        document.getElementById('cancel_feature_btn').style.display = 'block';

         document
        .getElementById('cancel_feature_btn')
        .addEventListener('click', async function (e) {
            e.preventDefault();
            document.getElementById('feature_input').value = '';
            document.getElementById('cancel_feature_btn').style.display = 'none';
        });
    }
});
// feature and mapping modal logic
// edit form

// meta data modal logic
async function renderServiceMetaData({
    itemId,
}) {
    try {
            const response = await fetch('/admin/service_meta_list', {
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
                    <th>Meta Data</th>
                    <th>Status</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
    `;

    if (data.data.length == 0) {
        tableHtml += `
            <tr>
                <td colspan="4" class="text-center">No Meta Data found</td>
            </tr>
        `;
    } else {
        data.data.forEach((item, index) => {
            tableHtml += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${item.meta_data}</td>
                    <td>
                        ${item.is_active == 1
                            ? '<span class="badge bg-success">Active</span>' 
                            : '<span class="badge bg-danger">Inactive</span>'}
                    </td>
                    <td>
                     <button 
                            class="btn btn-sm meta_visibilty ${item.visibility == 1 ? 'btn-success' : 'btn-danger'}"
                            data-service-item-id="${item.product_meta_data_auto_id}"
                           
                            >
                            ${item.visibility == 1 ? 'Hide' : 'Show'}
                        </button>
                        <button 
                            class="btn btn-sm meta_disbaled ${item.is_active == 1 ? 'btn-success' : 'btn-danger'}"
                            data-service-item-id="${item.product_meta_data_auto_id}"
                           
                            >
                            ${item.is_active == 1 ? 'Deactivate' : 'Activate'}
                        </button>
                        <button 
                            class="btn btn-sm meta_data_edit btn-info"
                            data-service-item-id="${item.product_meta_data_auto_id}"
                             data-service-item-value="${item.meta_data}"
                            >
                            Edit
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
document.getElementById('product_meta_data_mappings_div').innerHTML = tableHtml;
            }
        } catch (err) {
           document.getElementById('product_meta_data_mappings_div').innerHTML = '<div class="alert alert-danger">Something went wrong</div';
           
        }
}

   const meta_data_exampleModal = document.getElementById('meta_data_exampleModal');
    const meta_data_exampleModalins = new bootstrap.Modal(meta_data_exampleModal);

    // 2. Filter Button ka listener
    const openBtnsmetaData = document.getElementsByClassName('features_meta_data');
for (let btn of openBtnsmetaData) {
  btn.addEventListener('click', async function () {
        const itemId = btn.dataset.serviceItemId
        product_id=itemId;
            renderServiceMetaData({
            itemId: itemId
            });
    meta_data_exampleModalins.show();
  });
}
const meta_mapping_close_modal = document.getElementById('meta_mapping_close_modal');
   meta_mapping_close_modal.addEventListener('click', async function () {
     meta_data_exampleModalins.hide();
   })
   document.getElementById('addMetaForm').addEventListener('submit', async function (e) {
    e.preventDefault(); // page reload roko

    const featureValue = document.getElementById('meta_data_input').value.trim();
     if (!featureValue) {
        alert('Meta Data is required');
        return;
    }

    try {
        const response = await fetch('/admin/add_service_meta_data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                feature_value: featureValue,
                edit_mode:edit_mode,
                service_item_id:service_item_id,
                product_id: product_id // modal open pe set karo
            })
        });

        const result = await response.json();

        if (result.status) {
            document.getElementById('meta_data_input').value = '';
            document.getElementById('cancel_meta_data_btn').style.display = 'none';
             edit_mode=false;
             service_item_id=0;
            // list refresh
            renderServiceMetaData({
                itemId: product_id
            });
        } else {
            alert(result.message || 'Failed to add meta data');
        }

    } catch (err) {
        console.error(err);
        alert('Something went wrong');
    }

});


   document
  .getElementById('product_meta_data_mappings_div')
  .addEventListener('click', async function (e) {

    if (e.target.classList.contains('meta_disbaled')) {
        const itemId = e.target.dataset.serviceItemId;
        console.log('itemId btn clicked:', itemId);
         const response = await fetch('/admin/service_meta_data_status_change', {
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
                    renderServiceMetaData({
                    itemId: product_id
                    });
              }

        // yaha API call / status change logic
    }
});

 document
  .getElementById('product_meta_data_mappings_div')
  .addEventListener('click', async function (e) {

    if (e.target.classList.contains('meta_data_edit')) {
        const itemId = e.target.dataset.serviceItemId;
        edit_mode=true;
        service_item_id = itemId;
        console.log('itemValue:', itemId);
        document.getElementById('meta_data_input').value = e.target.dataset.serviceItemValue;
        document.getElementById('cancel_meta_data_btn').style.display = 'block';

         document
        .getElementById('cancel_meta_data_btn')
        .addEventListener('click', async function (e) {
            e.preventDefault();
            document.getElementById('meta_data_input').value = '';
            document.getElementById('cancel_meta_data_btn').style.display = 'none';
        });
    }
});


   document
  .getElementById('product_meta_data_mappings_div')
  .addEventListener('click', async function (e) {

    if (e.target.classList.contains('meta_visibilty')) {
        const itemId = e.target.dataset.serviceItemId;
        console.log('itemId btn clicked:', itemId);
         const response = await fetch('/admin/service_meta_data_visibility_change', {
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
                    renderServiceMetaData({
                    itemId: product_id
                    });
              }

        // yaha API call / status change logic
    }
});
// meta data modal logic



// details data modal logic
async function renderServiceDetailsData({
    itemId,
}) {
    try {
            const response = await fetch('/admin/service_details_list', {
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
                    <th>Specification</th>
                    <th>Specification Value</th>
                    <th>Status</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
    `;

    if (data.data.length == 0) {
        tableHtml += `
            <tr>
                <td colspan="4" class="text-center">No Meta Data found</td>
            </tr>
        `;
    } else {
        data.data.forEach((item, index) => {
            tableHtml += `
                <tr>
                    <td>${index + 1}</td>
                     <td>${item.specification.specification_name}</td>
                    <td>${item.specification_value}</td>
                    <td>
                        ${item.is_active == 1
                            ? '<span class="badge bg-success">Active</span>' 
                            : '<span class="badge bg-danger">Inactive</span>'}
                    </td>
                    <td>
                        <button 
                            class="btn btn-sm details_disbaled ${item.is_active == 1 ? 'btn-success' : 'btn-danger'}"
                            data-service-item-id="${item.product_specification_mapping_id}"
                           
                            >
                            ${item.is_active == 1 ? 'Deactivate' : 'Activate'}
                        </button>
                        <button 
                            class="btn btn-sm details_data_edit btn-info"
                            data-service-item-id="${item.product_specification_mapping_id}"
                             data-service-item-value="${item.specification_value}"
                              data-service-item-specification="${item.specification_auto_id}"
                            >
                            Edit
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
document.getElementById('product_details_data_mappings_div').innerHTML = tableHtml;
            }
        } catch (err) {
           document.getElementById('product_details_data_mappings_div').innerHTML = '<div class="alert alert-danger">Something went wrong</div';
           
        }
}
 const details_data_exampleModal = document.getElementById('details_data_exampleModal');
    const details_data_exampleModalIn = new bootstrap.Modal(details_data_exampleModal);

    // 2. Filter Button ka listener
    const features_other_details_data = document.getElementsByClassName('features_other_details_data');
for (let btn of features_other_details_data) {
  btn.addEventListener('click', async function () {
        const itemId = btn.dataset.serviceItemId
        product_id=itemId;
            renderServiceDetailsData({
            itemId: itemId
            });
    details_data_exampleModalIn.show();
  });
}
const detials_mapping_close_modal = document.getElementById('detials_mapping_close_modal');
   detials_mapping_close_modal.addEventListener('click', async function () {
     details_data_exampleModalIn.hide();
   })

     document
  .getElementById('product_details_data_mappings_div')
  .addEventListener('click', async function (e) {

    if (e.target.classList.contains('details_disbaled')) {
        const itemId = e.target.dataset.serviceItemId;
        console.log('itemId btn clicked:', itemId);
         const response = await fetch('/admin/service_details_data_status_change', {
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
                    renderServiceDetailsData({
                    itemId: product_id
                    });
              }

        // yaha API call / status change logic
    }
});

 document.getElementById('addDetailsForm').addEventListener('submit', async function (e) {
    e.preventDefault(); // page reload roko

    const details_data_input_value = document.getElementById('details_data_input').value.trim();
     if (!details_data_input_value) {
        alert('Meta Details is required');
        return;
    }
    const sepecificatoin = document.getElementById('sepecificatoin').value.trim();
     if (!sepecificatoin) {
        alert('Sepecificatoin Data is required');
        return;
    }

    try {
        const response = await fetch('/admin/add_service_details_data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                feature_value: details_data_input_value,
                 sepecificatoin: sepecificatoin,
                edit_mode:edit_mode,
                service_item_id:service_item_id,
                product_id: product_id // modal open pe set karo
            })
        });

        const result = await response.json();

        if (result.status) {
            document.getElementById('details_data_input').value = '';
            document.getElementById('sepecificatoin').value = '';
            document.getElementById('cancel_details_data_btn').style.display = 'none';
            edit_mode=false;
            service_item_id=0;
            // list refresh
            renderServiceDetailsData({
                itemId: product_id
            });
        } else {
            alert(result.message || 'Failed to add meta data');
        }

    } catch (err) {
        console.error(err);
        alert('Something went wrong');
    }

});

document
  .getElementById('product_details_data_mappings_div')
  .addEventListener('click', async function (e) {

    if (e.target.classList.contains('details_data_edit')) {
        const itemId = e.target.dataset.serviceItemId;
        edit_mode=true;
        service_item_id = itemId;
        console.log('itemValue:', itemId);
        document.getElementById('details_data_input').value = e.target.dataset.serviceItemValue;
         document.getElementById('sepecificatoin').value = e.target.dataset.serviceItemSpecification;
        document.getElementById('cancel_details_data_btn').style.display = 'block';

         document
        .getElementById('cancel_details_data_btn')
        .addEventListener('click', async function (e) {
            e.preventDefault();
            document.getElementById('details_data_input').value = '';
             document.getElementById('sepecificatoin').value = '';
            document.getElementById('cancel_details_data_btn').style.display = 'none';
        });
    }
});
// details data modal logic


  });