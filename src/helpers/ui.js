export const view = {
  current: 'server',
  available: ['server', 'login', 'dashboard'],

  show(name) {
    if (!this.available.includes(name)) {
      console.warn(`Invalid view name: ${name}`);
      return;
    }

    this.available.forEach(view => {
      const element = document.getElementById(`${view}View`);
      if (element) {
        element.classList.toggle('active', view === name);
      }
    });

    this.current = name;
  },

  getCurrent() {
    return this.current;
  }
};

export const ui = {
  showError(message, containerId) {
    const container = document.getElementById(containerId);
    if (container) {
      container.textContent = message;
      container.classList.add('show');
    }
  },

  hideError(elementId) {
    const errorElement = document.getElementById(elementId);
    errorElement.classList.remove('show');
  },

  clearInput(elementId) {
    const inputElement = document.getElementById(elementId);
    inputElement.value = "";
  },

  toggleLoading(button) {
      const spinner = button.querySelector('#spinner');

      const isLoading = button.dataset.loading === 'true';

      button.disabled = !isLoading;
      spinner.classList.toggle('hidden', isLoading);

      button.dataset.loading = !isLoading;
  }
};
