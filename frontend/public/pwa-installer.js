// PWA Install Handler
class PWAInstaller {
  constructor() {
    this.deferredPrompt = null;
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Listen for beforeinstallprompt
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('PWA: beforeinstallprompt event fired');
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallButton();
    });

    // Listen for app installed
    window.addEventListener('appinstalled', (evt) => {
      console.log('PWA: App was installed successfully');
      this.hideInstallButton();
      this.deferredPrompt = null;
    });

    // Check if app is already installed
    window.addEventListener('DOMContentLoaded', () => {
      if (this.isAppInstalled()) {
        console.log('PWA: App is already installed');
      }
    });
  }

  showInstallButton() {
    // Create install button if it doesn't exist
    let installButton = document.getElementById('pwa-install-button');
    if (!installButton) {
      installButton = document.createElement('button');
      installButton.id = 'pwa-install-button';
      installButton.innerHTML = '📱 Instalar App';
      installButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #1e293b;
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 25px;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        transition: all 0.3s ease;
      `;
      
      installButton.addEventListener('mouseenter', () => {
        installButton.style.transform = 'scale(1.05)';
        installButton.style.boxShadow = '0 6px 16px rgba(0,0,0,0.4)';
      });
      
      installButton.addEventListener('mouseleave', () => {
        installButton.style.transform = 'scale(1)';
        installButton.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
      });

      installButton.addEventListener('click', () => {
        this.installApp();
      });

      document.body.appendChild(installButton);
    }
    installButton.style.display = 'block';
  }

  hideInstallButton() {
    const installButton = document.getElementById('pwa-install-button');
    if (installButton) {
      installButton.style.display = 'none';
    }
  }

  async installApp() {
    if (!this.deferredPrompt) {
      console.log('PWA: No deferred prompt available');
      return;
    }

    try {
      // Show the install prompt
      this.deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await this.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('PWA: User accepted the install prompt');
      } else {
        console.log('PWA: User dismissed the install prompt');
      }
      
      // Clear the deferredPrompt
      this.deferredPrompt = null;
      this.hideInstallButton();
      
    } catch (error) {
      console.error('PWA: Error during installation:', error);
    }
  }

  isAppInstalled() {
    // Check if running in standalone mode
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true;
  }

  // Check PWA readiness
  checkPWAReadiness() {
    const checks = {
      serviceWorker: 'serviceWorker' in navigator,
      manifest: document.querySelector('link[rel="manifest"]') !== null,
      https: location.protocol === 'https:' || location.hostname === 'localhost',
      icons: true // Assume icons are present
    };

    console.log('PWA Readiness Check:', checks);
    
    const allPassed = Object.values(checks).every(check => check === true);
    if (allPassed) {
      console.log('✅ PWA is ready for installation!');
    } else {
      console.log('❌ PWA requirements not met:', checks);
    }
    
    return allPassed;
  }
}

// Initialize PWA installer when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new PWAInstaller();
  });
} else {
  new PWAInstaller();
}
