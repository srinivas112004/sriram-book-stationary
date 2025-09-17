document.addEventListener('DOMContentLoaded', () => {

  // --- Loading Screen ---
  const loadingScreen = document.createElement('div');
  loadingScreen.className = 'loading-screen';
  loadingScreen.innerHTML = `
    <div class="loading-spinner"></div>
    <div class="loading-text">Loading Amazing Experience...</div>
  `;
  document.body.appendChild(loadingScreen);

  // Hide loading screen after page loads
  window.addEventListener('load', () => {
    setTimeout(() => {
      loadingScreen.style.opacity = '0';
      setTimeout(() => {
        loadingScreen.remove();
      }, 500);
    }, 1500);
  });

  // --- Scroll Progress Indicator ---
  const scrollProgress = document.createElement('div');
  scrollProgress.className = 'scroll-progress';
  document.body.appendChild(scrollProgress);

  window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset;
    const docHeight = document.body.offsetHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    scrollProgress.style.width = scrollPercent + '%';
  });

  // --- Theme Switcher with Animation ---
  const themeToggle = document.getElementById('theme-toggle');
  const currentTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', currentTheme);

  themeToggle.addEventListener('click', () => {
    let newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    
    // Add transition effect
    document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Reset transition after animation
    setTimeout(() => {
      document.body.style.transition = '';
    }, 300);
  });

  // --- Header Style on Scroll ---
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 0) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  });

  // --- Enhanced Mobile Menu Toggle ---
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.main-nav');
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      menuToggle.classList.toggle('active');
      
      // Add hamburger animation
      const icon = menuToggle.querySelector('i');
      if (icon) {
        if (navLinks.classList.contains('active')) {
          icon.style.transform = 'rotate(90deg)';
        } else {
          icon.style.transform = 'rotate(0deg)';
        }
      }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!menuToggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('active');
        menuToggle.classList.remove('active');
        const icon = menuToggle.querySelector('i');
        if (icon) {
          icon.style.transform = 'rotate(0deg)';
        }
      }
    });
  }

  // --- Smooth Scroll for Anchor Links ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetEl = document.querySelector(this.getAttribute('href'));
      if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
      if (navLinks && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
      }
    });
  });

  // --- Enhanced Scroll Animations ---
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('show');
          
          // Add special effects based on element type
          if (entry.target.classList.contains('category-card')) {
            entry.target.style.animation = `slideInLeft 0.6s ease-out ${index * 0.1}s both`;
          } else if (entry.target.classList.contains('card')) {
            entry.target.style.animation = `bounceIn 0.8s ease-out ${index * 0.1}s both`;
          }
        }, index * 100); // Stagger animation
      }
    });
  }, observerOptions);

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // --- Particle System Removed ---

  // --- Dynamic Typing Effect ---
  function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.textContent = '';
    
    function type() {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(type, speed);
      }
    }
    type();
  }

  // --- Typing Effect Removed ---
  // --- Hero Stats Removed ---

  // --- Removed parallax effect to prevent background shaking ---

  // --- Dynamic Featured Products with Enhanced Animations ---
  const featuredProducts = [
    { icon: '📘', title: 'NCERT Textbooks', description: 'Complete set for all classes and subjects, CBSE compliant.', color: '#4facfe' },
    { icon: '🖊️', title: 'Pilot V5 Pens', description: 'Smooth, reliable, and premium writing experience.', color: '#f093fb' },
    { icon: '📒', title: 'Classmate Notebooks', description: 'Durable, stylish, and perfect for students.', color: '#667eea' },
    { icon: '🎨', title: 'Camel Art Supplies', description: 'Vibrant watercolors, crayons, and sketch pens.', color: '#764ba2' }
  ];
  
  const featuredContainer = document.getElementById('featured-cards-container');
  if (featuredContainer) {
    featuredProducts.forEach((product, index) => {
      const card = document.createElement('article');
      card.className = 'card reveal';
      card.style.setProperty('--card-color', product.color);
      card.innerHTML = `
        <div class="card-icon" style="background: linear-gradient(135deg, ${product.color}, ${product.color}dd);">${product.icon}</div>
        <div class="card-content">
          <h3>${product.title}</h3>
          <p>${product.description}</p>
        </div>
        <div class="follower-icon">${product.icon}</div>
      `;
      
      // Add hover effect with color
      card.addEventListener('mouseenter', () => {
        card.style.borderColor = product.color;
        card.style.boxShadow = `0 15px 30px ${product.color}40`;
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.borderColor = '';
        card.style.boxShadow = '';
      });
      
      featuredContainer.appendChild(card);
    });
    document.querySelectorAll('.featured .reveal').forEach(el => observer.observe(el));
  }

  // --- File Upload ---
  const dropArea = document.getElementById("drop-area");
  const fileElem = document.getElementById("fileElem");
  const filePreviewContainer = document.getElementById("file-preview-container");
  const sendBtn = document.getElementById("send-upload-btn");
  const customerNameInput = document.getElementById("customer-name");
  const customerPhoneInput = document.getElementById("customer-phone");

  let selectedFiles = [];

  const checkFormValidity = () => {
    if (!customerNameInput || !customerPhoneInput || !sendBtn) return;
    const name = customerNameInput.value.trim();
    const phone = customerPhoneInput.value.trim();
    sendBtn.disabled = !(selectedFiles.length > 0 && name !== "" && phone !== "");
  };

  const updateFileList = () => {
    if (!filePreviewContainer) return;
    filePreviewContainer.innerHTML = "";
    if (selectedFiles.length > 0) {
      selectedFiles.forEach((file, index) => {
        const fileItem = document.createElement("div");
        fileItem.className = "file-preview-item";
        fileItem.innerHTML = `
          <span>${file.name}</span>
          <button class="remove-file-btn" data-index="${index}" aria-label="Remove file">×</button>
        `;
        filePreviewContainer.appendChild(fileItem);
      });
    }
    checkFormValidity();
  };

  if (customerNameInput && customerPhoneInput) {
    customerNameInput.addEventListener('input', checkFormValidity);
    customerPhoneInput.addEventListener('input', checkFormValidity);
  }

  if (fileElem) {
    fileElem.addEventListener("change", (e) => {
      selectedFiles.push(...e.target.files);
      updateFileList();
    });
  }

  if (dropArea) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropArea.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
      }, false);
    });
    ['dragenter', 'dragover'].forEach(eventName => {
      dropArea.addEventListener(eventName, () => dropArea.classList.add('drag-over'), false);
    });
    ['dragleave', 'drop'].forEach(eventName => {
      dropArea.addEventListener(eventName, () => dropArea.classList.remove('drag-over'), false);
    });

    dropArea.addEventListener('drop', (e) => {
      selectedFiles.push(...e.dataTransfer.files);
      updateFileList();
    });
  }

  if (filePreviewContainer) {
    filePreviewContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('remove-file-btn')) {
        const indexToRemove = parseInt(e.target.getAttribute('data-index'));
        selectedFiles.splice(indexToRemove, 1);
        updateFileList();
      }
    });
  }

  if (sendBtn) {
    sendBtn.addEventListener('click', async () => {
      const name = customerNameInput.value.trim();
      const phone = customerPhoneInput.value.trim();

      if (selectedFiles.length === 0 || name === "" || phone === "") {
        alert("Please fill in your name, phone number, and select files to upload.");
        return;
      }

      const formData = new FormData();
      formData.append('name', name);
      formData.append('phone', phone);
      selectedFiles.forEach(file => {
        formData.append('files[]', file);
      });

      sendBtn.textContent = 'Uploading...';
      sendBtn.disabled = true;

      try {
        const response = await fetch('/upload', { method: 'POST', body: formData });
        const result = await response.json();

        if (result.success) {
          // ✅ Show success banner below button
          let successBanner = document.getElementById("success-banner");
          if (!successBanner) {
            successBanner = document.createElement("div");
            successBanner.id = "success-banner";
            successBanner.style.marginTop = "1rem";
            successBanner.style.padding = "0.75rem 1rem";
            successBanner.style.backgroundColor = "#d1fae5";
            successBanner.style.color = "#065f46";
            successBanner.style.borderRadius = "8px";
            successBanner.style.fontWeight = "600";
            successBanner.style.textAlign = "center";
            sendBtn.insertAdjacentElement("afterend", successBanner);
          }
          successBanner.textContent = "✅ Files sent successfully!";
          successBanner.style.display = "block";

          // Auto-hide after 5s
          setTimeout(() => {
            successBanner.style.display = "none";
          }, 5000);

          // Reset form
          selectedFiles = [];
          customerNameInput.value = '';
          customerPhoneInput.value = '';
          updateFileList();

        } else {
          throw new Error(result.message || 'Unknown error occurred.');
        }

      } catch (error) {
        console.error('Error uploading files:', error);
        alert(`Upload failed: ${error.message}`);
      } finally {
        sendBtn.textContent = 'Send';
        checkFormValidity();
      }
    });
  }

  // --- Flip Cards on Mobile ---
  const flipCards = document.querySelectorAll('.category-card');
  flipCards.forEach(card => {
    card.addEventListener('click', () => {
      const cardInner = card.querySelector('.category-card-inner');
      if (cardInner) cardInner.classList.toggle('is-flipped');
    });
  });

  // --- Enhanced Cursor Follower Animation ---
  function initializeCursorFollower() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
      const follower = card.querySelector('.follower-icon');
      if (!follower) return;
      
      // Set initial position
      follower.style.position = 'absolute';
      follower.style.pointerEvents = 'none';
      follower.style.fontSize = '2rem';
      follower.style.opacity = '0';
      follower.style.transition = 'opacity 0.3s ease';
      
      card.addEventListener('mouseenter', () => {
        follower.style.opacity = '1';
      });
      
      card.addEventListener('mouseleave', () => {
        follower.style.opacity = '0';
      });
      
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - 20;
        const y = e.clientY - rect.top - 20;
        follower.style.left = `${x}px`;
        follower.style.top = `${y}px`;
      });
    });
  }
  initializeCursorFollower();

  // --- Dynamic Loading States ---
  function addLoadingState(element, text = 'Loading...') {
    element.classList.add('loading');
    const originalText = element.textContent;
    element.textContent = text;
    return () => {
      element.classList.remove('loading');
      element.textContent = originalText;
    };
  }

  // --- Enhanced Touch Gestures for Mobile ---
  let touchStartY = 0;
  let touchEndY = 0;
  let touchStartX = 0;
  let touchEndX = 0;

  document.addEventListener('touchstart', e => {
    touchStartY = e.changedTouches[0].screenY;
    touchStartX = e.changedTouches[0].screenX;
  });

  document.addEventListener('touchend', e => {
    touchEndY = e.changedTouches[0].screenY;
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  });

  function handleSwipe() {
    const swipeThreshold = 50;
    const diffY = touchStartY - touchEndY;
    const diffX = touchStartX - touchEndX;
    
    if (Math.abs(diffY) > swipeThreshold) {
      if (diffY > 0) {
        // Swipe up - scroll to next section
        const currentSection = document.elementFromPoint(window.innerWidth/2, window.innerHeight/2);
        if (currentSection) {
          const nextSection = currentSection.closest('section')?.nextElementSibling;
          if (nextSection) {
            nextSection.scrollIntoView({ behavior: 'smooth' });
          }
        }
      } else {
        // Swipe down - scroll to previous section
        const currentSection = document.elementFromPoint(window.innerWidth/2, window.innerHeight/2);
        if (currentSection) {
          const prevSection = currentSection.closest('section')?.previousElementSibling;
          if (prevSection) {
            prevSection.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    }
    
    if (Math.abs(diffX) > swipeThreshold) {
      if (diffX > 0) {
        // Swipe left - could trigger menu or navigation
        console.log('Swipe left detected');
      } else {
        // Swipe right - could trigger menu or navigation
        console.log('Swipe right detected');
      }
    }
  }

  // --- Dynamic Counter Animation ---
  function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    function updateCounter() {
      start += increment;
      if (start < target) {
        element.textContent = Math.floor(start);
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = target;
      }
    }
    updateCounter();
  }

  // --- Interactive Button Effects ---
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      // Create ripple effect
      const ripple = document.createElement('span');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      ripple.style.position = 'absolute';
      ripple.style.borderRadius = '50%';
      ripple.style.background = 'rgba(255, 255, 255, 0.6)';
      ripple.style.transform = 'scale(0)';
      ripple.style.animation = 'ripple 0.6s linear';
      ripple.style.pointerEvents = 'none';
      
      this.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });

  // --- Floating Shapes Removed ---
  // --- Custom Cursor Effect Removed ---

  // --- Performance Optimization: Throttle scroll events ---
  function throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Removed throttled scroll handler that was causing background shaking

});
