document.addEventListener('DOMContentLoaded', () => {
    const forms = document.querySelectorAll( 'form[data-loading]' );

    forms.forEach(form => {
        form.addEventListener('submit', () => {
            const button = form.querySelector( 'button[type="submit"], input[type="submit"]' );
            if (!button) return;
            button.disabled = true;
            button.classList.add('is-loading')

            if (button.tagName === 'BUTTON') {
                const loadingText = button.dataset.loadingText || 'Please wait...'
                button.innerHTML = `
                    <span class="spinner"></span>
                    <span>${loadingText}</span>
                `
            } else { button.value = 'Please wait...' }
        })
    })
})