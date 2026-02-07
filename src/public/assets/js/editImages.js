document.addEventListener('DOMContentLoaded', () => {

    const MAX_SIZE = 2 * 1024 * 1024;
    const errorBox = document.getElementById('error');

    document.querySelectorAll('.image-input').forEach(input => {

        input.addEventListener('change', function () {

            const file = this.files[0];
            if (!file) return;

            errorBox.innerText = '';

            if (file.size > MAX_SIZE) {
                errorBox.innerText = 'Max image size is 2MB';
                this.value = '';
                return;
            }

            const wrapper = this.closest('.upload-box');
            const img = wrapper.querySelector('.preview-img');
            const text = wrapper.querySelector('.upload-text');

            const reader = new FileReader();
            reader.onload = e => {
                img.src = e.target.result;
                img.classList.remove('d-none');
                if(text) text.classList.add('d-none');
            };
            reader.readAsDataURL(file);
        });
    });

    // REMOVE BUTTON
    document.querySelectorAll('.remove-btn').forEach(btn=>{
        btn.addEventListener('click', function(e){
            e.preventDefault();
            e.stopPropagation();

            const index = this.dataset.index;
            const wrapper = this.closest('.upload-box');

            const img = wrapper.querySelector('.preview-img');
            const text = wrapper.querySelector('.upload-text');
            const fileInput = wrapper.querySelector('.image-input');
            const oldInput = wrapper.querySelector(`input[name="oldImages[${index}]"]`);

            img.src = '';
            img.classList.add('d-none');
            text.classList.remove('d-none');
            fileInput.value = '';

            // Mark old image removed
            oldInput.value = '';

            this.remove();
        });
    });

});
