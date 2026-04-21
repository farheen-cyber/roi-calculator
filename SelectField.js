/**
 * SelectField - Accessible custom select component
 * Wraps native <select> with styled custom dropdown UI
 * Maintains full keyboard accessibility (Tab, Arrow keys, Enter, Escape)
 */
export class SelectField {
  constructor(selectElement) {
    this.select = selectElement;
    this.wrapper = selectElement.parentElement;
    this.display = this.wrapper.querySelector('.select-display');
    this.dropdown = this.wrapper.querySelector('.select-dropdown');
    this.options = this.wrapper.querySelectorAll('[role="option"]');
    this.isOpen = false;

    this.init();
  }

  init() {
    // Update display when native select changes (via code or user interaction)
    this.select.addEventListener('change', () => {
      this.updateDisplay();
      this.closeDropdown();
    });

    // Toggle dropdown on display click
    this.display.addEventListener('click', (e) => {
      e.stopPropagation();
      this.isOpen ? this.closeDropdown() : this.openDropdown();
    });

    // Handle option clicks
    this.options.forEach((option) => {
      option.addEventListener('click', (e) => {
        e.stopPropagation();
        this.select.value = option.dataset.value;
        this.select.dispatchEvent(new Event('change', { bubbles: true }));
      });

      // Handle option hover
      option.addEventListener('mouseenter', () => {
        this.options.forEach((o) => o.setAttribute('aria-selected', 'false'));
        option.setAttribute('aria-selected', 'true');
      });
    });

    // Close on outside click
    document.addEventListener('click', () => {
      this.closeDropdown();
    });

    // Keyboard navigation
    this.select.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.openDropdown();
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.closeDropdown();
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        this.closeDropdown();
      }
      if (e.key === 'Enter' && this.isOpen) {
        e.preventDefault();
        const selected = this.dropdown.querySelector('[aria-selected="true"]');
        if (selected) {
          this.select.value = selected.dataset.value;
          this.select.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    });

    // Initialize display label
    this.updateDisplay();
  }

  updateDisplay() {
    const selected = this.select.querySelector('option:checked');
    if (selected) {
      this.display.querySelector('.select-label').textContent = selected.textContent;
    }
  }

  openDropdown() {
    this.isOpen = true;
    this.dropdown.classList.add('open');

    // Set initial selected option
    const currentValue = this.select.value;
    const selected = this.dropdown.querySelector(`[data-value="${currentValue}"]`);
    if (selected) {
      this.options.forEach((o) => o.setAttribute('aria-selected', 'false'));
      selected.setAttribute('aria-selected', 'true');
    }
  }

  closeDropdown() {
    this.isOpen = false;
    this.dropdown.classList.remove('open');
    this.options.forEach((o) => o.setAttribute('aria-selected', 'false'));
  }
}
