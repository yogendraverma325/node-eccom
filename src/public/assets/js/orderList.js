  window.addEventListener('DOMContentLoaded', () => {
        // product list page changed done
        const orderStatus = document.getElementById("orderStatus");
        if (!orderStatus) return;

        orderStatus.addEventListener("change", function () {
            const sortValue = this.value;
            const url = new URL(window.location.href);

            if (sortValue) {
                url.searchParams.set("order_status", sortValue);
            } else {
                url.searchParams.delete("order_status");
            }

            url.searchParams.set("page", 1);
            window.location.href = url.toString();
        });
            // product list page changed done

            // order cancel
             const modalEl = document.getElementById("cancelOrderModal");
    const modal = new bootstrap.Modal(modalEl);

    const orderIdInput = document.getElementById("cancelOrderId");
    const reasonInput = document.getElementById("cancelReason");
    const messageInput = document.getElementById("cancelMessage");

    // Open modal
    document.querySelectorAll(".cancel-order-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            console.log("btn.dataset.orderId",btn.dataset.orderId)
            orderIdInput.value = btn.dataset.orderId;
            reasonInput.value = "";
            messageInput.value = "";
            modal.show();
        });
    });
    // order cancel
    
  });