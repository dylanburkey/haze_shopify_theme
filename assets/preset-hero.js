/**
 * Hero Section JavaScript
 * Zebra Skimmers Theme
 * 
 * Features:
 * - Animated stat counters with easing
 * - 3D parallax effect on showcase
 * - Video modal with YouTube/Vimeo support
 * - Intersection Observer for performance
 * - Keyboard accessibility
 * - Reduced motion support
 */

(function() {
  'use strict';

  /**
   * Hero Section Class
   * Manages all hero section functionality
   */
  class HeroSection {
    constructor(section) {
      this.section = section;
      this.sectionId = section.dataset.sectionId;
      
      // Elements
      this.statsContainer = section.querySelector('[data-hero-stats]');
      this.statValues = section.querySelectorAll('.hero__stat-value[data-count]');
      this.showcase = section.querySelector('[data-hero-showcase]');
      this.mediaWrapper = section.querySelector('[data-hero-media]');
      this.videoBtn = section.querySelector('[data-hero-video-btn]');
      this.videoModal = document.querySelector(`#hero-video-modal-${this.sectionId}`);
      
      // State
      this.statsAnimated = false;
      this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      // Bind methods
      this.handleStatsIntersection = this.handleStatsIntersection.bind(this);
      this.handleShowcaseMouseMove = this.handleShowcaseMouseMove.bind(this);
      this.handleShowcaseMouseLeave = this.handleShowcaseMouseLeave.bind(this);
      this.openVideoModal = this.openVideoModal.bind(this);
      this.closeVideoModal = this.closeVideoModal.bind(this);
      this.handleKeyDown = this.handleKeyDown.bind(this);
      
      this.init();
    }

    init() {
      this.setupStatsObserver();
      this.setupParallax();
      this.setupVideoModal();
    }

    /**
     * Stats Counter Animation
     */
    setupStatsObserver() {
      if (!this.statsContainer || this.statValues.length === 0) return;

      // If reduced motion is preferred, show final values immediately
      if (this.prefersReducedMotion) {
        this.showFinalStats();
        return;
      }

      // Use Intersection Observer for performance
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(this.handleStatsIntersection, {
          threshold: 0.5,
          rootMargin: '0px'
        });
        observer.observe(this.statsContainer);
      } else {
        // Fallback for older browsers
        this.animateStats();
      }
    }

    handleStatsIntersection(entries, observer) {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.statsAnimated) {
          this.animateStats();
          this.statsAnimated = true;
          observer.unobserve(entry.target);
        }
      });
    }

    animateStats() {
      this.statValues.forEach(stat => {
        const target = parseInt(stat.dataset.count, 10);
        const suffix = stat.dataset.suffix || '';
        const duration = 2000;
        
        this.animateCounter(stat, target, suffix, duration);
      });
    }

    animateCounter(element, target, suffix, duration) {
      const startTime = performance.now();
      const startValue = 0;

      const easeOutQuart = (x) => 1 - Math.pow(1 - x, 4);

      const update = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutQuart(progress);
        const current = Math.floor(easedProgress * target);

        element.textContent = this.formatNumber(current) + suffix;

        if (progress < 1) {
          requestAnimationFrame(update);
        }
      };

      requestAnimationFrame(update);
    }

    formatNumber(num) {
      // Format large numbers with K suffix if needed
      if (num >= 1000) {
        return num.toLocaleString();
      }
      return num.toString();
    }

    showFinalStats() {
      this.statValues.forEach(stat => {
        const target = parseInt(stat.dataset.count, 10);
        const suffix = stat.dataset.suffix || '';
        stat.textContent = this.formatNumber(target) + suffix;
      });
    }

    /**
     * 3D Parallax Effect
     */
    setupParallax() {
      if (!this.showcase || !this.mediaWrapper || this.prefersReducedMotion) return;
      
      // Only enable on larger screens
      if (window.innerWidth < 1024) return;

      this.mediaWrapper.addEventListener('mousemove', this.handleShowcaseMouseMove);
      this.mediaWrapper.addEventListener('mouseleave', this.handleShowcaseMouseLeave);
    }

    handleShowcaseMouseMove(e) {
      const rect = this.mediaWrapper.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      const rotateY = x * -10;
      const rotateX = y * 10;

      this.showcase.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
    }

    handleShowcaseMouseLeave() {
      this.showcase.style.transform = 'rotateY(-5deg) rotateX(2deg)';
    }

    /**
     * Video Modal
     */
    setupVideoModal() {
      if (!this.videoBtn || !this.videoModal) return;

      this.videoPlayer = this.videoModal.querySelector('[data-hero-video-player]');
      this.closeButtons = this.videoModal.querySelectorAll('[data-hero-video-close]');
      this.videoUrl = this.videoBtn.dataset.videoUrl;

      // Open modal
      this.videoBtn.addEventListener('click', this.openVideoModal);

      // Close modal
      this.closeButtons.forEach(btn => {
        btn.addEventListener('click', this.closeVideoModal);
      });

      // Keyboard events
      document.addEventListener('keydown', this.handleKeyDown);
    }

    openVideoModal(e) {
      e.preventDefault();
      
      if (!this.videoUrl) return;

      // Create iframe
      const iframe = this.createVideoIframe(this.videoUrl);
      this.videoPlayer.innerHTML = '';
      this.videoPlayer.appendChild(iframe);

      // Show modal
      this.videoModal.classList.add('is-open');
      this.videoModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      // Focus management
      this.previousFocus = document.activeElement;
      const closeBtn = this.videoModal.querySelector('.hero__video-modal-close');
      if (closeBtn) closeBtn.focus();
    }

    closeVideoModal() {
      // Hide modal
      this.videoModal.classList.remove('is-open');
      this.videoModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';

      // Remove iframe to stop video
      this.videoPlayer.innerHTML = '';

      // Restore focus
      if (this.previousFocus) {
        this.previousFocus.focus();
      }
    }

    handleKeyDown(e) {
      if (!this.videoModal.classList.contains('is-open')) return;

      if (e.key === 'Escape') {
        this.closeVideoModal();
      }

      // Trap focus within modal
      if (e.key === 'Tab') {
        const focusableElements = this.videoModal.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            lastFocusable.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            firstFocusable.focus();
            e.preventDefault();
          }
        }
      }
    }

    createVideoIframe(url) {
      const iframe = document.createElement('iframe');
      iframe.setAttribute('allowfullscreen', '');
      iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
      iframe.setAttribute('loading', 'lazy');

      // Parse URL and create embed URL
      const embedUrl = this.getEmbedUrl(url);
      if (embedUrl) {
        iframe.src = embedUrl;
      }

      return iframe;
    }

    getEmbedUrl(url) {
      // YouTube
      const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      if (youtubeMatch) {
        return `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1&rel=0`;
      }

      // Vimeo
      const vimeoMatch = url.match(/(?:vimeo\.com\/)(\d+)/);
      if (vimeoMatch) {
        return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
      }

      return null;
    }

    /**
     * Cleanup
     */
    destroy() {
      if (this.mediaWrapper) {
        this.mediaWrapper.removeEventListener('mousemove', this.handleShowcaseMouseMove);
        this.mediaWrapper.removeEventListener('mouseleave', this.handleShowcaseMouseLeave);
      }

      if (this.videoBtn) {
        this.videoBtn.removeEventListener('click', this.openVideoModal);
      }

      if (this.closeButtons) {
        this.closeButtons.forEach(btn => {
          btn.removeEventListener('click', this.closeVideoModal);
        });
      }

      document.removeEventListener('keydown', this.handleKeyDown);
    }
  }

  /**
   * Initialize Hero Sections
   */
  function initHeroSections() {
    const heroSections = document.querySelectorAll('[data-section-type="hero"]');
    
    heroSections.forEach(section => {
      new HeroSection(section);
    });
  }

  /**
   * Shopify Section Events
   * Handle theme editor events for live preview
   */
  if (window.Shopify && window.Shopify.designMode) {
    document.addEventListener('shopify:section:load', function(event) {
      if (event.target.querySelector('[data-section-type="hero"]')) {
        initHeroSections();
      }
    });

    document.addEventListener('shopify:section:unload', function(event) {
      const heroSection = event.target.querySelector('[data-section-type="hero"]');
      if (heroSection && heroSection._heroInstance) {
        heroSection._heroInstance.destroy();
      }
    });

    document.addEventListener('shopify:section:reorder', function() {
      initHeroSections();
    });
  }

  /**
   * Initialize on DOM Ready
   */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroSections);
  } else {
    initHeroSections();
  }

})();
