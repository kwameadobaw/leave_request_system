// Main JavaScript file for common functionality

// Utility functions
const utils = {
  // Format date to readable format
  formatDate: function (dateString) {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  },

  // Calculate days between two dates
  calculateDays: function (startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  },

  // Show notification
  showNotification: function (message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
            <i class="fas fa-${
              type === "success"
                ? "check-circle"
                : type === "error"
                ? "exclamation-circle"
                : "info-circle"
            }"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

    // Add styles if not already present
    if (!document.querySelector("#notification-styles")) {
      const styles = document.createElement("style");
      styles.id = "notification-styles";
      styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 1rem 1.5rem;
                    border-radius: 8px;
                    color: white;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    z-index: 1000;
                    animation: slideInRight 0.3s ease;
                    max-width: 400px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }
                .notification-success { background: #10b981; }
                .notification-error { background: #ef4444; }
                .notification-info { background: #3b82f6; }
                .notification-close {
                    background: none;
                    border: none;
                    color: white;
                    cursor: pointer;
                    margin-left: auto;
                    padding: 0.25rem;
                }
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
      document.head.appendChild(styles);
    }

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 5000);
  },

  // Confirm dialog
  confirm: function (message, callback) {
    if (confirm(message)) {
      callback();
    }
  },

  // Loading state
  setLoading: function (element, loading = true) {
    if (loading) {
      element.disabled = true;
      element.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    } else {
      element.disabled = false;
      element.innerHTML = element.dataset.originalText || "Submit";
    }
  },
};

// Form validation
const validation = {
  // Validate date range
  validateDateRange: function (startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return "Start date cannot be in the past";
    }

    if (end < start) {
      return "End date cannot be before start date";
    }

    return null;
  },

  // Validate required fields
  validateRequired: function (fields) {
    for (const field of fields) {
      if (!field.value.trim()) {
        return `${field.dataset.label || field.name} is required`;
      }
    }
    return null;
  },
};

// Animation helpers
const animations = {
  // Fade in element
  fadeIn: function (element, duration = 300) {
    element.style.opacity = "0";
    element.style.display = "block";

    let start = null;
    function animate(timestamp) {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const opacity = Math.min(progress / duration, 1);

      element.style.opacity = opacity;

      if (progress < duration) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  },

  // Slide down element
  slideDown: function (element, duration = 300) {
    element.style.height = "0";
    element.style.overflow = "hidden";
    element.style.display = "block";

    const targetHeight = element.scrollHeight;

    let start = null;
    function animate(timestamp) {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const height = Math.min(
        (progress / duration) * targetHeight,
        targetHeight
      );

      element.style.height = height + "px";

      if (progress < duration) {
        requestAnimationFrame(animate);
      } else {
        element.style.height = "auto";
        element.style.overflow = "visible";
      }
    }

    requestAnimationFrame(animate);
  },
};

// Initialize common functionality when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  // Auto-hide flash messages after 5 seconds
  const flashMessages = document.querySelectorAll(".alert");
  flashMessages.forEach((message) => {
    setTimeout(() => {
      message.style.transition = "opacity 0.3s ease";
      message.style.opacity = "0";
      setTimeout(() => {
        if (message.parentElement) {
          message.remove();
        }
      }, 300);
    }, 5000);
  });

  // Add click animation to buttons
  const buttons = document.querySelectorAll("button, .btn");
  buttons.forEach((button) => {
    button.addEventListener("click", function (e) {
      const ripple = document.createElement("span");
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;

      if (!document.querySelector("#ripple-styles")) {
        const styles = document.createElement("style");
        styles.id = "ripple-styles";
        styles.textContent = `
                    @keyframes ripple {
                        to {
                            transform: scale(4);
                            opacity: 0;
                        }
                    }
                    button, .btn {
                        position: relative;
                        overflow: hidden;
                    }
                `;
        document.head.appendChild(styles);
      }

      this.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });

  // Add smooth scrolling to anchor links
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  anchorLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });

  // Add loading states to forms
  const forms = document.querySelectorAll("form");
  forms.forEach((form) => {
    form.addEventListener("submit", function () {
      const submitBtn = this.querySelector('button[type="submit"]');
      if (submitBtn && !submitBtn.dataset.originalText) {
        submitBtn.dataset.originalText = submitBtn.innerHTML;
        utils.setLoading(submitBtn, true);
      }
    });
  });
});

// Export utilities for use in other scripts
window.utils = utils;
window.validation = validation;
window.animations = animations;
