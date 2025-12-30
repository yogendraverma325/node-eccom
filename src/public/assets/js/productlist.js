
window.addEventListener('DOMContentLoaded', () => {
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
  });