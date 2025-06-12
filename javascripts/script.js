// 16-bit Game Portfolio JavaScript
class GamePortfolio {
  constructor() {
    this.currentScreen = 'about';
    this.gameTime = 0;
    this.init();
  }

  init() {
    this.setupNavigation();
    this.startGameClock();
    this.setupAnimations();
    this.setupSoundEffects();
    this.setupFormHandling();
    this.setupKeyboardControls();
    this.setupProjectModal();
  }

  setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');

    navButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        this.playSound('click');
        const targetScreen = e.target.dataset.screen;
        this.switchScreen(targetScreen);
        this.updateActiveButton(e.target);
      });
    });

    // Set initial active button
    const aboutBtn = document.querySelector('[data-screen="about"]');
    if (aboutBtn) {
      aboutBtn.classList.add('active');
    }
  }

  switchScreen(screenName) {
    // Hide all screens
    const allScreens = document.querySelectorAll('.screen');
    allScreens.forEach(screen => {
      screen.classList.remove('active');
    });

    // Show target screen
    const targetScreen = document.getElementById(`${screenName}-screen`);
    if (targetScreen) {
      targetScreen.classList.add('active');
      this.currentScreen = screenName;
      this.animateScreenTransition(targetScreen);
    }
  }

  updateActiveButton(clickedButton) {
    // Remove active class from all buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.remove('active');
    });

    // Add active class to clicked button
    clickedButton.classList.add('active');
  }

  animateScreenTransition(screen) {
    // Add entrance animation
    screen.style.opacity = '0';
    screen.style.transform = 'translateX(20px)';

    setTimeout(() => {
      screen.style.transition = 'all 0.5s ease-in-out';
      screen.style.opacity = '1';
      screen.style.transform = 'translateX(0)';
    }, 50);

    // Animate skill bars if on skills screen
    if (this.currentScreen === 'skills') {
      this.animateSkillBars();
    }

    // Trigger typing animation for dialogue text in the current screen
    if (this.currentScreen === 'about') {
      this.triggerTypingForScreen(screen);
    }
  }

  animateSkillBars() {
    const skillFills = document.querySelectorAll('.skill-fill');
    skillFills.forEach((fill, index) => {
      const targetWidth = fill.style.width;
      fill.style.width = '0%';

      setTimeout(() => {
        fill.style.transition = 'width 1s ease-out';
        fill.style.width = targetWidth;
      }, index * 100);
    });
  }

  startGameClock() {
    const timeElement = document.getElementById('game-time');

    setInterval(() => {
      this.gameTime++;
      const minutes = Math.floor(this.gameTime / 60);
      const seconds = this.gameTime % 60;

      const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      timeElement.textContent = formattedTime;
    }, 1000);
  }

  setupAnimations() {
    // Parallax effect for background
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      const backgrounds = document.querySelector('.game-container');
      backgrounds.style.transform = `translateY(${scrolled * 0.1}px)`;
    });

    // Hover effects for interactive elements
    this.setupHoverEffects();

    // Typing animation for dialogue text
    this.setupTypingAnimation();
  }

  setupHoverEffects() {
    // Quest items hover effect
    const questItems = document.querySelectorAll('.quest-item');
    questItems.forEach(item => {
      item.addEventListener('mouseenter', () => {
        this.playSound('hover');
        item.style.transform = 'translateX(5px) scale(1.02)';
      });

      item.addEventListener('mouseleave', () => {
        item.style.transform = 'translateX(0) scale(1)';
      });
    });

    // Inventory items hover effect
    const inventoryItems = document.querySelectorAll('.inventory-item');
    inventoryItems.forEach(item => {
      item.addEventListener('mouseenter', () => {
        this.playSound('hover');
      });
    });

    // Navigation buttons hover effect
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(button => {
      button.addEventListener('mouseenter', () => {
        this.playSound('hover');
      });
    });
  }

  setupTypingAnimation() {
    const dialogueTexts = document.querySelectorAll('.dialogue-text p');

    // Intersection Observer for typing animation
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('typed')) {
          // Add a small delay to ensure audio context is ready
          setTimeout(() => {
            this.typeText(entry.target);
          }, 100);
          entry.target.classList.add('typed');
        }
      });
    });

    dialogueTexts.forEach(text => {
      observer.observe(text);
    });
  }

  triggerTypingForScreen(screen) {
    // Find dialogue text elements in the current screen that haven't been typed yet
    const dialogueTexts = screen.querySelectorAll('.dialogue-text p:not(.typed)');

    dialogueTexts.forEach((text, index) => {
      // Add a delay between each paragraph
      setTimeout(() => {
        this.typeText(text);
        text.classList.add('typed');
      }, index * 1000); // 1 second delay between paragraphs
    });
  }

  typeText(element) {
    const text = element.textContent;
    element.textContent = '';
    element.style.borderRight = '2px solid var(--primary-color)';

    let index = 0;
    const typeInterval = setInterval(() => {
      if (index < text.length) {
        element.textContent += text.charAt(index);
        index++;

        // Random typing sound
        if (Math.random() > 0.7) {
          this.playSound('type');
        }
      } else {
        clearInterval(typeInterval);
        element.style.borderRight = 'none';
      }
    }, 50);
  }

  setupSoundEffects() {
    // Create audio context for Web Audio API
    this.audioContext = null;

    // Initialize audio context on first user interaction
    const initAudio = () => {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        console.log('🔊 Audio context initialized');
      }
    };

    // Try to initialize on various user interactions
    document.addEventListener('click', initAudio, { once: true });
    document.addEventListener('keydown', initAudio, { once: true });
    document.addEventListener('touchstart', initAudio, { once: true });
  }

  playSound(type) {
    if (!this.audioContext) {
      // Try to initialize audio context if it's not ready
      try {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        console.log('Audio context not available:', e);
        return;
      }
    }

    // Check if audio context is in suspended state (common on mobile)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume().then(() => {
        this.generateSound(type);
      });
    } else {
      this.generateSound(type);
    }
  }

  generateSound(type) {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Different sounds for different actions
    switch (type) {
      case 'click':
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
        break;

      case 'hover':
        oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.05);
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.05);
        break;

      case 'type':
        oscillator.frequency.setValueAtTime(1000 + Math.random() * 200, this.audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.03, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.02);
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.02);
        break;
    }
  }

  setupFormHandling() {
    const form = document.querySelector('.pixel-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleFormSubmission(form);
      });
    }
  }

  handleFormSubmission(form) {
    this.playSound('click');

    // Get form data
    const name = form.querySelector('input[type="text"]').value;
    const email = form.querySelector('input[type="email"]').value;
    const message = form.querySelector('textarea').value;

    // Simple validation
    if (!name || !email || !message) {
      this.showMessage('Please fill in all fields!', 'error');
      return;
    }

    // Simulate form submission
    this.showMessage('Message sent! Quest completed!', 'success');

    // Reset form
    form.reset();
  }

  showMessage(text, type = 'info') {
    // Create message element
    const message = document.createElement('div');
    message.className = `game-message ${type}`;
    message.textContent = text;

    // Style the message
    Object.assign(message.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: type === 'error' ? 'var(--danger-color)' : 'var(--primary-color)',
      color: 'var(--bg-dark)',
      padding: '10px 15px',
      border: '2px solid var(--text-light)',
      borderRadius: '4px',
      fontFamily: 'inherit',
      fontSize: '8px',
      zIndex: '1000',
      animation: 'slideInRight 0.5s ease-out',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)'
    });

    document.body.appendChild(message);

    // Remove message after 3 seconds
    setTimeout(() => {
      message.style.animation = 'slideOutRight 0.5s ease-in';
      setTimeout(() => {
        document.body.removeChild(message);
      }, 500);
    }, 3000);
  }

  setupKeyboardControls() {
    document.addEventListener('keydown', (e) => {
      switch (e.key) {
        case '1':
          this.switchScreen('about');
          this.updateActiveButton(document.querySelector('[data-screen="about"]'));
          break;
        case '2':
          this.switchScreen('skills');
          this.updateActiveButton(document.querySelector('[data-screen="skills"]'));
          break;
        case '3':
          this.switchScreen('experience');
          this.updateActiveButton(document.querySelector('[data-screen="experience"]'));
          break;
        case '4':
          this.switchScreen('projects');
          this.updateActiveButton(document.querySelector('[data-screen="projects"]'));
          break;
        case '5':
          this.switchScreen('contact');
          this.updateActiveButton(document.querySelector('[data-screen="contact"]'));
          break;
        case 'Escape':
          this.switchScreen('about');
          this.updateActiveButton(document.querySelector('[data-screen="about"]'));
          break;
      }
    });
  }

  // Easter eggs and special effects
  setupEasterEggs() {
    let konamiCode = [];
    const targetSequence = [
      'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
      'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
      'KeyB', 'KeyA'
    ];

    document.addEventListener('keydown', (e) => {
      konamiCode.push(e.code);

      if (konamiCode.length > targetSequence.length) {
        konamiCode = konamiCode.slice(-targetSequence.length);
      }

      if (konamiCode.join(',') === targetSequence.join(',')) {
        this.activateKonamiCode();
        konamiCode = [];
      }
    });
  }

  activateKonamiCode() {
    // Special rainbow effect
    document.body.style.filter = 'hue-rotate(0deg)';
    let hue = 0;

    const rainbowInterval = setInterval(() => {
      hue = (hue + 10) % 360;
      document.body.style.filter = `hue-rotate(${hue}deg)`;
    }, 100);

    this.showMessage('🎮 KONAMI CODE ACTIVATED! RAINBOW MODE! 🌈', 'success');

    setTimeout(() => {
      clearInterval(rainbowInterval);
      document.body.style.filter = 'none';
    }, 5000);
  }

  setupProjectModal() {
    // Project data
    this.projects = {
      eureka: {
        title: 'EUREKA PLATFORM',
        icon: '🌐',
        description: 'Digital research platform built with Ruby on Rails for UCSF. Enables technology-driven research for investigators with advanced UI and the Eureka Editor tool.',
        technologies: 'Ruby on Rails 6, Bootstrap 4, Hotwire (Turbo and Stimulus)',
        languages: 'Ruby, JavaScript, HTML/HAML, CSS',
        collaborators: 'Eureka Tech Team',
        images: ['covid19_landing.png']
      },
      graphinator: {
        title: 'GRAPHINATOR',
        icon: '📊',
        description: 'Complete bandwidth and latency monitoring system using distributed Shinken architecture, Graphite and MySQL for storage, Node.js and Socket.io for real-time graphs.',
        technologies: 'AWS (VPC, EC2, RDS), Shinken, Graphite, MySQL, Node.js, Socket.io',
        languages: 'Ruby, JavaScript, HTML, CSS',
        collaborators: 'Ricardo Roman, Ruben Gomez',
        images: ['graphi_login.png', 'graphi_dash.png', 'graphi_graph.png', 'graphi_agg.png']
      },
      devpower: {
        title: 'DEVPOWER',
        icon: '🚀',
        description: 'Development planning tool built in NetSuite. Allows planning and tracking development projects with Projects, Sprints, Stories and Issues, integrated with NetSuite modules.',
        technologies: 'NetSuite SuiteScript 2.0, jQuery, Bootstrap',
        languages: 'JavaScript, HTML, CSS',
        collaborators: 'Ivan Burrola (Supervisor)',
        images: ['devpower.png', 'devpower2.PNG', 'devpower3.png', 'devpower4.png', 'devpower5.png', 'devpower6.png', 'devpower7.png', 'devpower8.png']
      },
      scrubbinator: {
        title: 'SCRUBBINATOR',
        icon: '🛡️',
        description: 'Software Defined Networking system using ExaBGP and ERCO as backend. Allows routing subnetwork traffic through DDoS mitigation appliance via web interface.',
        technologies: 'KVM, BGP, BIRD, ExaBGP, ERCO, Ubuntu Server, MariaDB, Ruby on Rails',
        languages: 'Ruby, JavaScript, HTML, CSS',
        collaborators: 'Ricardo Roman, Efrain Martinez (Network Operations Engineer)',
        images: ['scrubi_login.png', 'scrubi_dash.png']
      },
      services: {
        title: 'CUSTOMER PORTAL',
        icon: '👥',
        description: 'Customer portal allowing service consumption monitoring (bandwidth graphs, real-time graphs) and DDoS mitigation routing through Scrubbinator API.',
        technologies: 'AWS (VPC, RDS), Google Cloud Platform, REST API, MariaDB, Ruby on Rails, Node.js',
        languages: 'Ruby, JavaScript, HTML, CSS',
        collaborators: 'Ricardo Roman, Ruben Gomez',
        images: ['service_login.png', 'service_dash.png', 'customer_graph.PNG']
      },
      econferences: {
        title: 'ECONFERENCES',
        icon: '📞',
        description: 'Application managing Asterisk Conference Bridges in Integrix Enswitch solution using AMI (Asterisk Manager Interface) to control conference elements.',
        technologies: 'AWS (VPC, EC2), MySQL, Asterisk AMI, Redis, WebSockets, Ruby on Rails 5',
        languages: 'Ruby, Perl, JavaScript, HTML, CSS',
        collaborators: 'Julio Ramirez (Voice Engineer)',
        images: ['econfe_login.png', 'econfe_actions.png']
      },
      op5: {
        title: 'OP5 MONITORING SYSTEM',
        icon: '📊',
        description: 'Deployed distributed environment of op5 Monitor for 4500 hosts and 30k+ services. Migrated from underperforming Nagios system to improve performance and distributed architecture.',
        technologies: 'AWS (VPC, EC2), CentOS 6.9, op5 Monitor, Merlin Distributed Monitoring, SSL',
        languages: 'Configuration Management, System Administration',
        collaborators: 'Ruben Gomez, Jon Cavanaugh, Jesus Vazquez',
        images: ['op5_deployment.png']
      },
      yarinator: {
        title: 'YARINATOR (YET ANOTHER RANCID)',
        icon: '🔧',
        description: 'Network configuration backup system that gets config files from network equipment using SNMP protocols and commits them to GitLab. Helps with troubleshooting and faster equipment setup after outages.',
        technologies: 'KVM, Ubuntu Server 14.04, REST API, MariaDB, Ruby on Rails, GitLab, SNMP',
        languages: 'Ruby, JavaScript, HTML, CSS',
        collaborators: 'Ruben Gomez, Luis Valdez, Daisy Alba, Jorge Velazquez (NetOps Engineer)',
        images: ['yar_login.png', 'yar_file.png']
      }
    };

    this.currentProject = null;
    this.currentImageIndex = 0;
    this.modal = document.getElementById('project-modal');

    // Setup click handlers for inventory items
    document.querySelectorAll('.inventory-item').forEach(item => {
      item.addEventListener('click', (e) => {
        this.playSound('click');
        const projectKey = e.currentTarget.dataset.project;
        if (projectKey && this.projects[projectKey]) {
          this.openProjectModal(projectKey);
        }
      });
    });

    // Setup modal close handlers
    document.querySelector('.modal-close').addEventListener('click', () => {
      this.playSound('click');
      this.closeProjectModal();
    });

    document.querySelector('.modal-overlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) {
        this.closeProjectModal();
      }
    });

    // Setup gallery navigation
    document.getElementById('prev-image').addEventListener('click', () => {
      this.playSound('click');
      this.previousImage();
    });

    document.getElementById('next-image').addEventListener('click', () => {
      this.playSound('click');
      this.nextImage();
    });

    // Keyboard navigation for modal
    document.addEventListener('keydown', (e) => {
      if (this.modal.style.display === 'block') {
        switch (e.key) {
          case 'Escape':
            this.closeProjectModal();
            break;
          case 'ArrowLeft':
            this.previousImage();
            break;
          case 'ArrowRight':
            this.nextImage();
            break;
        }
      }
    });
  }

  openProjectModal(projectKey) {
    const project = this.projects[projectKey];
    this.currentProject = project;
    this.currentImageIndex = 0;

    // Update modal content
    document.getElementById('modal-title').textContent = 'PROJECT DETAILS';
    document.getElementById('modal-icon').textContent = project.icon;
    document.getElementById('modal-project-title').textContent = project.title;
    document.getElementById('modal-description').textContent = project.description;
    document.getElementById('modal-technologies').textContent = project.technologies;
    document.getElementById('modal-languages').textContent = project.languages;
    document.getElementById('modal-collaborators').textContent = project.collaborators;

    // Update tech tags
    const techContainer = document.getElementById('modal-tech');
    techContainer.innerHTML = '';
    const techs = project.technologies.split(', ').slice(0, 4); // Show first 4 technologies
    techs.forEach(tech => {
      const tag = document.createElement('span');
      tag.className = 'tag';
      tag.textContent = tech.length > 12 ? tech.substring(0, 12) + '...' : tech;
      techContainer.appendChild(tag);
    });

    // Setup image gallery
    this.setupImageGallery(project.images);

    // Show modal
    this.modal.style.display = 'block';
    this.modal.classList.remove('closing');

    // Add modal-open class to body to prevent scrolling
    document.body.style.overflow = 'hidden';
  }

  closeProjectModal() {
    this.modal.classList.add('closing');
    setTimeout(() => {
      this.modal.style.display = 'none';
      this.modal.classList.remove('closing');
      document.body.style.overflow = '';
    }, 300);
  }

  setupImageGallery(images) {
    const galleryTrack = document.getElementById('gallery-track');
    const imageCounter = document.getElementById('image-counter');
    const prevBtn = document.getElementById('prev-image');
    const nextBtn = document.getElementById('next-image');

    // Clear existing images
    galleryTrack.innerHTML = '';

    // Add images
    images.forEach((imageName, index) => {
      const imageContainer = document.createElement('div');
      imageContainer.className = 'gallery-image';
      
      const img = document.createElement('img');
      img.src = `./images/portfolio/${imageName}`;
      img.alt = `${this.currentProject.title} Screenshot ${index + 1}`;
      img.loading = 'lazy';
      
      // Add error handling for missing images
      img.onerror = () => {
        img.style.display = 'none';
        imageContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 300px; color: var(--text-medium);">
            <div style="font-size: 48px; margin-bottom: 10px;">📷</div>
            <div style="font-size: 12px;">IMAGE NOT FOUND</div>
            <div style="font-size: 10px; margin-top: 5px;">${imageName}</div>
          </div>
        `;
      };

      imageContainer.appendChild(img);
      galleryTrack.appendChild(imageContainer);
    });

    // Update counter and navigation
    this.updateGalleryNavigation();
  }

  updateGalleryNavigation() {
    const galleryTrack = document.getElementById('gallery-track');
    const imageCounter = document.getElementById('image-counter');
    const prevBtn = document.getElementById('prev-image');
    const nextBtn = document.getElementById('next-image');
    
    const totalImages = galleryTrack.children.length;
    
    // Update counter
    imageCounter.textContent = `${this.currentImageIndex + 1} / ${totalImages}`;
    
    // Update button states
    prevBtn.disabled = this.currentImageIndex === 0;
    nextBtn.disabled = this.currentImageIndex === totalImages - 1;
    
    // Update track position
    const translateX = -this.currentImageIndex * 100;
    galleryTrack.style.transform = `translateX(${translateX}%)`;
  }

  previousImage() {
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
      this.updateGalleryNavigation();
    }
  }

  nextImage() {
    const totalImages = document.getElementById('gallery-track').children.length;
    if (this.currentImageIndex < totalImages - 1) {
      this.currentImageIndex++;
      this.updateGalleryNavigation();
    }
  }
}

// CSS animations for messages
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }

  .nav-btn.active {
    background: var(--primary-color) !important;
    color: var(--bg-dark) !important;
    box-shadow: 0 0 15px rgba(0, 255, 0, 0.8);
  }
`;
document.head.appendChild(style);

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const game = new GamePortfolio();

  // Setup easter eggs
  game.setupEasterEggs();

  // Trigger typing animation for the initial About screen after a short delay
  setTimeout(() => {
    const aboutScreen = document.getElementById('about-screen');
    if (aboutScreen && aboutScreen.classList.contains('active')) {
      game.triggerTypingForScreen(aboutScreen);
    }
  }, 500);

  // Console message for developers
  console.log(`
🎮 SERGIO'S PORTFOLIO v2.0 - 32-BIT EDITION 🎮

╔══════════════════════════════════════╗
║  Welcome to the retro gaming zone!   ║
║                                      ║
║  Keyboard shortcuts:                 ║
║  • 1-5: Navigate sections           ║
║  • ESC: Return to About             ║
║  • Try the Konami Code! ↑↑↓↓←→←→BA  ║
╚══════════════════════════════════════╝

Built with ❤️ and lots of pixels by Sergio Gonzalez
  `);
});

// Preload critical animations
window.addEventListener('load', () => {
  // Preload hover states
  const elements = document.querySelectorAll('.nav-btn, .quest-item, .inventory-item');
  elements.forEach(el => {
    el.style.transition = 'all 0.3s ease';
  });

  // Start background animations
  document.querySelector('.game-container').style.animation = 'backgroundPulse 2s ease-in-out infinite';
});
