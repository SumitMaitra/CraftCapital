document.addEventListener('DOMContentLoaded', () => {
  // Mobile Nav Toggle
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', isOpen);
      hamburger.textContent = isOpen ? '✕' : '☰';
    });
    // Close nav when a link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.textContent = '☰';
      });
    });
  }

  // Smooth Scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth'
        });
        // Close mobile nav if open
        if (navLinks.classList.contains('active')) {
          navLinks.classList.remove('active');
        }
      }
    });
  });

  // Intersection Observer for Scroll Animations
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('slide-up');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.card, .hero-content, .section-title').forEach(el => {
    el.style.opacity = '0'; // Initial state before animation
    observer.observe(el);
  });

  // Product Filtering Logic
  const filterForm = document.getElementById('product-filters');
  const productGrid = document.querySelector('.product-grid');
  
  if (filterForm && productGrid) {
    filterForm.addEventListener('change', (e) => {
      // In a real app, this would fetch filtered data or filter DOM elements
      console.log('Filters updated:', e.target.name, e.target.value);
      // Simulate filtering by adding a loader then fading in products
      productGrid.style.opacity = '0.5';
      setTimeout(() => {
        productGrid.style.opacity = '1';
      }, 300);
    });
  }

  // Digest Archive Filtering
  const digestSearch = document.getElementById('digest-search');
  if (digestSearch) {
    digestSearch.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const issues = document.querySelectorAll('.issue-card');
      
      issues.forEach(issue => {
        const title = issue.querySelector('h3').textContent.toLowerCase();
        if (title.includes(query)) {
          issue.style.display = 'block';
        } else {
          issue.style.display = 'none';
        }
      });
    });
  }

  // Form Validation Helpers
  const forms = document.querySelectorAll('form.needs-validation');
  forms.forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }
      form.classList.add('was-validated');
    }, false);
  });

  // Testimonial Slider (Basic Implementation)
  const testimonials = document.querySelectorAll('.testimonial-slide');
  let currentSlide = 0;
  
  if (testimonials.length > 0) {
    // Hide all but first
    testimonials.forEach((slide, idx) => {
      if (idx !== 0) slide.style.display = 'none';
    });

    // Auto rotate every 5 seconds
    setInterval(() => {
      testimonials[currentSlide].style.display = 'none';
      currentSlide = (currentSlide + 1) % testimonials.length;
      testimonials[currentSlide].style.display = 'block';
      testimonials[currentSlide].classList.add('fade-in');
    }, 5000);
  }
});

