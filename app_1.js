// App Data
const appData = {
  recentDetections: [
    { location: "Lake Superior", date: "2025-09-22", size: "45", type: "PET", count: "127" },
    { location: "Thames River", date: "2025-09-21", size: "78", type: "PE", count: "89" },
    { location: "Pacific Ocean", date: "2025-09-20", size: "23", type: "PP", count: "234" },
    { location: "Mediterranean", date: "2025-09-19", size: "56", type: "PVC", count: "156" },
    { location: "Atlantic Ocean", date: "2025-09-18", size: "67", type: "PS", count: "98" }
  ],
  chartData: {
    timeSeriesLabels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    timeSeriesData: [145, 178, 203, 167, 189, 221],
    sizeDistribution: {
      labels: ["10-25μm", "25-50μm", "50-75μm", "75-100μm"],
      data: [34, 45, 67, 23]
    },
    materialTypes: {
      labels: ["PET", "PE", "PP", "PVC", "PS"],
      data: [127, 89, 234, 156, 98]
    }
  }
};

// Global state
let currentPage = 'home';
let isLoggedIn = false;
let bluetoothConnected = false;
let charts = {};

// Page Navigation
function navigateTo(page) {
  console.log(`Navigating to: ${page}, isLoggedIn: ${isLoggedIn}`);
  
  // Check dashboard access - must be logged in
  if (page === 'dashboard' && !isLoggedIn) {
    console.log('Dashboard access denied - redirecting to login');
    navigateTo('login');
    showNotification('Please login to access the dashboard', 'info');
    return;
  }
  
  // Hide all pages
  document.querySelectorAll('.page-content').forEach(el => {
    el.classList.remove('active');
    el.classList.add('hidden');
  });
  
  // Hide main content for dashboard and login
  const main = document.querySelector('main');
  const header = document.querySelector('.header');
  const footer = document.querySelector('.footer');
  
  if (page === 'dashboard' || page === 'login') {
    main.style.display = 'none';
    footer.style.display = 'none';
    document.getElementById(page + 'Page').classList.remove('hidden');
    document.getElementById(page + 'Page').classList.add('active');
    
    if (page === 'dashboard') {
      initDashboard();
    }
  } else if (page === 'contact') {
    // Handle contact navigation by scrolling to footer
    main.style.display = 'block';
    footer.style.display = 'block';
    setTimeout(() => {
      footer.scrollIntoView({ behavior: 'smooth' });
      showNotification('Contact information available in footer', 'info');
    }, 100);
  } else {
    // Show home page
    main.style.display = 'block';
    footer.style.display = 'block';
    if (page !== 'contact') {
      scrollToSection(page === 'home' ? 'home' : page);
    }
  }
  
  currentPage = page;
  updateURL(page);
}

function updateURL(page) {
  const url = page === 'home' ? '/' : `#${page}`;
  history.pushState({ page }, '', url);
}

// Smooth scrolling
function scrollToSection(sectionId) {
  const element = document.getElementById(sectionId);
  if (element) {
    const headerHeight = 70;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
    
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
}

// Mobile Navigation
function initMobileNav() {
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      navToggle.classList.toggle('active');
    });
    
    // Close menu when clicking on links
    navMenu.addEventListener('click', (e) => {
      if (e.target.classList.contains('nav-link')) {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
      }
    });
  }
}

// Bluetooth Connection Simulation
function simulateConnection() {
  const connectBtn = document.getElementById('connectBtn');
  const deviceStatus = document.getElementById('deviceStatus');
  const bluetoothStatus = document.getElementById('bluetoothStatus');
  const connectionLine = document.getElementById('connectionLine');
  
  if (!connectBtn) return;
  
  connectBtn.textContent = 'Connecting...';
  connectBtn.disabled = true;
  
  // Simulate connection process
  setTimeout(() => {
    bluetoothConnected = true;
    connectBtn.textContent = 'Connected';
    connectBtn.classList.remove('btn--secondary');
    connectBtn.classList.add('btn--primary');
    
    // Update status indicators
    if (deviceStatus) {
      const statusIndicator = deviceStatus.querySelector('.status-indicator');
      if (statusIndicator) {
        statusIndicator.style.background = '#22c55e';
      }
    }
    
    if (bluetoothStatus) {
      bluetoothStatus.classList.add('active');
      bluetoothStatus.querySelector('span:last-child').textContent = 'Connected';
    }
    
    // Add visual feedback
    if (connectionLine) {
      connectionLine.style.background = '#22c55e';
    }
    
    // Show success notification
    showNotification('Device connected successfully!', 'success');
    
    setTimeout(() => {
      connectBtn.textContent = 'Disconnect';
      connectBtn.disabled = false;
      connectBtn.onclick = () => disconnectDevice();
    }, 1000);
  }, 2000);
}

function disconnectDevice() {
  const connectBtn = document.getElementById('connectBtn');
  const deviceStatus = document.getElementById('deviceStatus');
  const bluetoothStatus = document.getElementById('bluetoothStatus');
  const connectionLine = document.getElementById('connectionLine');
  
  bluetoothConnected = false;
  
  if (connectBtn) {
    connectBtn.textContent = 'Connect Device';
    connectBtn.classList.add('btn--secondary');
    connectBtn.classList.remove('btn--primary');
    connectBtn.onclick = () => simulateConnection();
  }
  
  // Update status indicators
  if (deviceStatus) {
    const statusIndicator = deviceStatus.querySelector('.status-indicator');
    if (statusIndicator) {
      statusIndicator.style.background = '#ef4444';
    }
  }
  
  if (bluetoothStatus) {
    bluetoothStatus.classList.remove('active');
    bluetoothStatus.querySelector('span:last-child').textContent = 'Not Connected';
  }
  
  if (connectionLine) {
    connectionLine.style.background = '#00B4D8';
  }
  
  showNotification('Device disconnected', 'info');
}

// Notification System
function showNotification(message, type = 'info') {
  // Remove existing notifications
  document.querySelectorAll('.notification').forEach(n => n.remove());
  
  const notification = document.createElement('div');
  notification.className = `notification notification--${type}`;
  notification.innerHTML = `
    <span>${message}</span>
    <button onclick="this.parentElement.remove()">×</button>
  `;
  
  // Add notification styles
  notification.style.cssText = `
    position: fixed;
    top: 90px;
    right: 20px;
    background: ${type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#00B4D8'};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 12px;
    z-index: 10000;
    animation: slideIn 0.3s ease-out;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;
  
  // Add animation keyframes if not already added
  if (!document.querySelector('#notification-animations')) {
    const animationStyle = document.createElement('style');
    animationStyle.id = 'notification-animations';
    animationStyle.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(animationStyle);
  }
  
  document.body.appendChild(notification);
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.style.animation = 'slideIn 0.3s ease-out reverse';
      setTimeout(() => notification.remove(), 300);
    }
  }, 3000);
}

// Dashboard Initialization
function initDashboard() {
  populateDetectionsTable();
  initCharts();
  startRealTimeUpdates();
}

function populateDetectionsTable() {
  const tbody = document.getElementById('detectionsTable');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  appData.recentDetections.forEach(detection => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${detection.location}</td>
      <td>${detection.date}</td>
      <td>${detection.size}</td>
      <td><span class="material-type material-${detection.type.toLowerCase()}">${detection.type}</span></td>
      <td>${detection.count}</td>
    `;
    tbody.appendChild(row);
  });
}

function initCharts() {
  // Time Series Chart
  const timeCtx = document.getElementById('timeSeriesChart');
  if (timeCtx) {
    charts.timeSeries = new Chart(timeCtx, {
      type: 'line',
      data: {
        labels: appData.chartData.timeSeriesLabels,
        datasets: [{
          label: 'Microplastic Count',
          data: appData.chartData.timeSeriesData,
          borderColor: '#00B4D8',
          backgroundColor: 'rgba(0, 180, 216, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#00B4D8',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: '#90E0EF'
            }
          }
        },
        scales: {
          x: {
            ticks: {
              color: '#90E0EF'
            },
            grid: {
              color: 'rgba(144, 224, 239, 0.2)'
            }
          },
          y: {
            ticks: {
              color: '#90E0EF'
            },
            grid: {
              color: 'rgba(144, 224, 239, 0.2)'
            }
          }
        }
      }
    });
  }
  
  // Size Distribution Chart
  const sizeCtx = document.getElementById('sizeChart');
  if (sizeCtx) {
    charts.sizeDistribution = new Chart(sizeCtx, {
      type: 'bar',
      data: {
        labels: appData.chartData.sizeDistribution.labels,
        datasets: [{
          label: 'Count',
          data: appData.chartData.sizeDistribution.data,
          backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#5D878F'],
          borderColor: '#00B4D8',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: '#90E0EF'
            }
          }
        },
        scales: {
          x: {
            ticks: {
              color: '#90E0EF'
            },
            grid: {
              color: 'rgba(144, 224, 239, 0.2)'
            }
          },
          y: {
            ticks: {
              color: '#90E0EF'
            },
            grid: {
              color: 'rgba(144, 224, 239, 0.2)'
            }
          }
        }
      }
    });
  }
  
  // Material Types Chart
  const materialCtx = document.getElementById('materialChart');
  if (materialCtx) {
    charts.materialTypes = new Chart(materialCtx, {
      type: 'doughnut',
      data: {
        labels: appData.chartData.materialTypes.labels,
        datasets: [{
          data: appData.chartData.materialTypes.data,
          backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F'],
          borderColor: '#03045E',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#90E0EF',
              padding: 20
            }
          }
        }
      }
    });
  }
}

function startRealTimeUpdates() {
  // Simulate real-time data updates every 5 seconds
  setInterval(() => {
    if (currentPage === 'dashboard' && bluetoothConnected) {
      updateChartData();
      updateDetectionCount();
    }
  }, 5000);
}

function updateChartData() {
  // Add random variation to time series data
  if (charts.timeSeries) {
    const lastValue = appData.chartData.timeSeriesData[appData.chartData.timeSeriesData.length - 1];
    const newValue = Math.max(100, lastValue + Math.floor(Math.random() * 40 - 20));
    
    // Shift data
    appData.chartData.timeSeriesData.shift();
    appData.chartData.timeSeriesData.push(newValue);
    
    charts.timeSeries.data.datasets[0].data = appData.chartData.timeSeriesData;
    charts.timeSeries.update('none');
  }
}

function updateDetectionCount() {
  // Add random new detection
  const locations = ["Lake Superior", "Thames River", "Pacific Ocean", "Mediterranean", "Atlantic Ocean", "Baltic Sea"];
  const types = ["PET", "PE", "PP", "PVC", "PS"];
  
  const newDetection = {
    location: locations[Math.floor(Math.random() * locations.length)],
    date: new Date().toISOString().split('T')[0],
    size: Math.floor(Math.random() * 80) + 20,
    type: types[Math.floor(Math.random() * types.length)],
    count: Math.floor(Math.random() * 200) + 50
  };
  
  // Add to beginning of array
  appData.recentDetections.unshift(newDetection);
  
  // Keep only last 10 detections
  if (appData.recentDetections.length > 10) {
    appData.recentDetections.pop();
  }
  
  // Update table
  populateDetectionsTable();
  
  // Show notification
  showNotification(`New detection: ${newDetection.count} ${newDetection.type} particles at ${newDetection.location}`, 'success');
}

// Login Form Handler
function handleLogin(event) {
  event.preventDefault();
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  // Simple validation
  if (!username || !password) {
    showNotification('Please fill in all fields', 'error');
    return;
  }
  
  // Simulate login process
  const loginBtn = event.target.querySelector('button[type="submit"]');
  const originalText = loginBtn.textContent;
  
  loginBtn.textContent = 'Signing In...';
  loginBtn.disabled = true;
  
  setTimeout(() => {
    // Simulate successful login
    isLoggedIn = true;
    console.log('Login successful, isLoggedIn set to:', isLoggedIn);
    showNotification('Login successful! Redirecting to dashboard...', 'success');
    
    setTimeout(() => {
      navigateTo('dashboard');
    }, 1000);
    
    loginBtn.textContent = originalText;
    loginBtn.disabled = false;
  }, 1500);
}

// Logout function
function logout() {
  isLoggedIn = false;
  bluetoothConnected = false;
  console.log('Logged out, isLoggedIn set to:', isLoggedIn);
  showNotification('Logged out successfully', 'info');
  navigateTo('home');
}

// Filter Functions for Dashboard
function initFilters() {
  const filters = ['locationFilter', 'sizeFilter', 'dateFilter'];
  
  filters.forEach(filterId => {
    const filter = document.getElementById(filterId);
    if (filter) {
      filter.addEventListener('change', applyFilters);
    }
  });
}

function applyFilters() {
  const locationFilter = document.getElementById('locationFilter')?.value;
  const sizeFilter = document.getElementById('sizeFilter')?.value;
  const dateFilter = document.getElementById('dateFilter')?.value;
  
  let filteredData = [...appData.recentDetections];
  
  if (locationFilter && locationFilter !== 'All Locations') {
    filteredData = filteredData.filter(d => d.location === locationFilter);
  }
  
  if (sizeFilter && sizeFilter !== 'All Sizes') {
    const [min, max] = sizeFilter.replace(' μm', '').split('-').map(Number);
    filteredData = filteredData.filter(d => {
      const size = parseInt(d.size);
      return size >= min && size <= max;
    });
  }
  
  if (dateFilter) {
    filteredData = filteredData.filter(d => d.date >= dateFilter);
  }
  
  // Update table with filtered data
  updateTableWithData(filteredData);
  
  showNotification(`Showing ${filteredData.length} filtered results`, 'info');
}

function updateTableWithData(data) {
  const tbody = document.getElementById('detectionsTable');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  data.forEach(detection => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${detection.location}</td>
      <td>${detection.date}</td>
      <td>${detection.size}</td>
      <td><span class="material-type material-${detection.type.toLowerCase()}">${detection.type}</span></td>
      <td>${detection.count}</td>
    `;
    tbody.appendChild(row);
  });
  
  if (data.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="5" style="text-align: center; color: #90E0EF; padding: 40px;">No data matches your filters</td>';
    tbody.appendChild(row);
  }
}

// Scroll Animations
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);
  
  // Observe elements for animation
  const animatedElements = document.querySelectorAll('.feature-card, .audience-card, .software-feature');
  animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(el);
  });
}

// Header Scroll Effect
function initHeaderScroll() {
  window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
      header.style.background = 'rgba(3, 4, 94, 0.98)';
      header.style.boxShadow = '0 2px 20px rgba(3, 4, 94, 0.3)';
    } else {
      header.style.background = 'rgba(3, 4, 94, 0.95)';
      header.style.boxShadow = 'none';
    }
  });
}

// Device Status Simulation
function initDeviceStatus() {
  const deviceStatus = document.getElementById('deviceStatus');
  if (!deviceStatus) return;
  
  // Simulate device status changes
  setInterval(() => {
    if (bluetoothConnected && Math.random() > 0.7) {
      // Occasionally show data transfer
      const statusText = deviceStatus.querySelector('span:last-child');
      const originalText = statusText.textContent;
      
      statusText.textContent = 'Transferring data...';
      setTimeout(() => {
        statusText.textContent = originalText;
      }, 2000);
    }
  }, 10000);
}

// Add CSS for material type styling
function initMaterialTypeStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .material-type {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .material-pet { background: #1FB8CD; color: #03045E; }
    .material-pe { background: #FFC185; color: #03045E; }
    .material-pp { background: #B4413C; color: white; }
    .material-pvc { background: #5D878F; color: white; }
    .material-ps { background: #ECEBD5; color: #03045E; }
  `;
  document.head.appendChild(style);
}

// Export data functionality
function exportData() {
  const dataStr = JSON.stringify(appData.recentDetections, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = 'microplastic-detections.json';
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
  
  showNotification('Data exported successfully!', 'success');
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('h2Oclear-x application initializing...');
  
  // Reset login state on page load
  isLoggedIn = false;
  bluetoothConnected = false;
  
  initMobileNav();
  initScrollAnimations();
  initHeaderScroll();
  initDeviceStatus();
  initMaterialTypeStyles();
  
  // Handle browser navigation
  window.addEventListener('popstate', (event) => {
    if (event.state && event.state.page) {
      navigateTo(event.state.page);
    }
  });
  
  // Initialize filters when on dashboard
  setTimeout(() => {
    initFilters();
  }, 1000);
  
  // Set initial Bluetooth status to disconnected
  setTimeout(() => {
    const bluetoothStatus = document.getElementById('bluetoothStatus');
    if (bluetoothStatus) {
      bluetoothStatus.classList.remove('active');
      const statusText = bluetoothStatus.querySelector('span:last-child');
      if (statusText) {
        statusText.textContent = 'Not Connected';
      }
    }
  }, 1000);
  
  // Add keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
      switch(e.key) {
        case '1':
          e.preventDefault();
          navigateTo('home');
          break;
        case '2':
          e.preventDefault();
          navigateTo('dashboard');
          break;
        case '3':
          e.preventDefault();
          navigateTo('login');
          break;
      }
    }
    
    // ESC key to logout
    if (e.key === 'Escape' && isLoggedIn) {
      logout();
    }
  });
  
  console.log('h2Oclear-x Dashboard initialized');
  console.log('Keyboard shortcuts: Ctrl+1 (Home), Ctrl+2 (Dashboard), Ctrl+3 (Login), ESC (Logout)');
  console.log('Initial state - isLoggedIn:', isLoggedIn, 'bluetoothConnected:', bluetoothConnected);
});