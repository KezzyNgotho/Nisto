// Simple toast implementation to replace sonner
class ToastManager {
  constructor() {
    this.toasts = [];
    this.container = null;
    this.init();
  }

  init() {
    // Create toast container if it doesn't exist
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        pointer-events: none;
      `;
      document.body.appendChild(this.container);
    }
  }

  show(message, type = 'info', duration = 4000) {
    const toast = document.createElement('div');
    const toastId = Date.now() + Math.random();
    
    const colors = {
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6'
    };

    toast.style.cssText = `
      background: ${colors[type] || colors.info};
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      pointer-events: auto;
      cursor: pointer;
      transform: translateX(100%);
      transition: transform 0.3s ease-in-out;
      max-width: 300px;
      word-wrap: break-word;
    `;

    toast.textContent = message;
    toast.dataset.toastId = toastId;

    // Add click to dismiss
    toast.addEventListener('click', () => {
      this.remove(toastId);
    });

    this.container.appendChild(toast);

    // Animate in
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 10);

    // Auto remove
    setTimeout(() => {
      this.remove(toastId);
    }, duration);

    this.toasts.push({ id: toastId, element: toast });
  }

  remove(toastId) {
    const toastIndex = this.toasts.findIndex(t => t.id === toastId);
    if (toastIndex === -1) return;

    const toast = this.toasts[toastIndex];
    toast.element.style.transform = 'translateX(100%)';
    
    setTimeout(() => {
      if (toast.element.parentNode) {
        toast.element.parentNode.removeChild(toast.element);
      }
      this.toasts.splice(toastIndex, 1);
    }, 300);
  }

  success(message, duration) {
    this.show(message, 'success', duration);
  }

  error(message, duration) {
    this.show(message, 'error', duration);
  }

  warning(message, duration) {
    this.show(message, 'warning', duration);
  }

  info(message, duration) {
    this.show(message, 'info', duration);
  }
}

// Create singleton instance
const toastManager = new ToastManager();

// Export toast functions that match sonner API
export const toast = {
  success: (message, options) => toastManager.success(message, options?.duration),
  error: (message, options) => toastManager.error(message, options?.duration),
  warning: (message, options) => toastManager.warning(message, options?.duration),
  info: (message, options) => toastManager.info(message, options?.duration),
  // Default toast
  (message, options) => toastManager.show(message, 'info', options?.duration)
};

export default toast;
