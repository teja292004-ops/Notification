// KodNest Premium Build System - Job Notification Tracker Routes

// State Management
let currentFilters = {
  keyword: '',
  location: '',
  mode: '',
  experience: '',
  source: '',
  sort: 'latest'
};

let savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');

class Router {
  constructor() {
    this.routes = {
      '/': 'dashboard',
      '/dashboard': 'dashboard',
      '/saved': 'saved',
      '/digest': 'digest',
      '/settings': 'settings',
      '/proof': 'proof'
    };
    
    this.init();
  }
  
  init() {
    // Handle initial load
    this.handleRoute();
    
    // Handle navigation clicks
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-route]')) {
        e.preventDefault();
        const path = e.target.getAttribute('data-route');
        this.navigate(path);
      }
    });
    
    // Handle browser back/forward
    window.addEventListener('popstate', () => {
      this.handleRoute();
    });
  }
  
  navigate(path) {
    window.history.pushState({}, '', path);
    this.handleRoute();
  }
  
  handleRoute() {
    const path = window.location.pathname;
    const route = this.routes[path] || 'dashboard';
    this.render(route);
    this.updateActiveLink(path);
  }
  
  render(route) {
    const content = document.getElementById('route-content');
    
    const pages = {
      landing: this.renderLanding(),
      dashboard: this.renderDashboard(),
      saved: this.renderSaved(),
      digest: this.renderDigest(),
      settings: this.renderSettings(),
      proof: this.renderProof()
    };
    
    content.innerHTML = pages[route] || pages.landing;
  }
  
  renderLanding() {
    return `
      <div class="kn-landing">
        <div class="kn-landing__content">
          <h1 class="kn-landing__headline">Stop Missing The Right Jobs.</h1>
          <p class="kn-landing__subtext">Precision-matched job discovery delivered daily at 9AM.</p>
          <button class="kn-button kn-button--primary kn-button--large" data-route="/settings">Start Tracking</button>
        </div>
      </div>
    `;
  }
  
  renderDashboard() {
    const filteredJobs = this.filterJobs(JOBS_DATA);
    const sortedJobs = this.sortJobs(filteredJobs);
    
    return `
      <div class="kn-context-header">
        <h1 class="kn-context-header__title">Dashboard</h1>
        <p class="kn-context-header__subtitle">Discover your next opportunity.</p>
      </div>
      
      ${this.renderFilterBar()}
      
      <div class="kn-jobs-grid">
        ${sortedJobs.length > 0 ? sortedJobs.map(job => this.renderJobCard(job)).join('') : '<div class="kn-empty-state"><h3 class="kn-empty-state__title">No jobs found.</h3><p class="kn-empty-state__description">Try adjusting your filters.</p></div>'}
      </div>
      
      ${this.renderModal()}
    `;
  }
  
  filterJobs(jobs) {
    return jobs.filter(job => {
      const matchesKeyword = !currentFilters.keyword || 
        job.title.toLowerCase().includes(currentFilters.keyword.toLowerCase()) ||
        job.company.toLowerCase().includes(currentFilters.keyword.toLowerCase());
      
      const matchesLocation = !currentFilters.location || 
        job.location.toLowerCase().includes(currentFilters.location.toLowerCase());
      
      const matchesMode = !currentFilters.mode || job.mode === currentFilters.mode;
      const matchesExperience = !currentFilters.experience || job.experience === currentFilters.experience;
      const matchesSource = !currentFilters.source || job.source === currentFilters.source;
      
      return matchesKeyword && matchesLocation && matchesMode && matchesExperience && matchesSource;
    });
  }
  
  sortJobs(jobs) {
    if (currentFilters.sort === 'latest') {
      return [...jobs].sort((a, b) => a.postedDaysAgo - b.postedDaysAgo);
    } else {
      return [...jobs].sort((a, b) => b.postedDaysAgo - a.postedDaysAgo);
    }
  }
  
  renderFilterBar() {
    return `
      <div class="kn-filter-bar">
        <input type="text" class="kn-input kn-filter-input" id="keyword-filter" placeholder="Search by title or company..." value="${currentFilters.keyword}">
        
        <input type="text" class="kn-input kn-filter-input" id="location-filter" placeholder="Location..." value="${currentFilters.location}">
        
        <select class="kn-input kn-filter-select" id="mode-filter">
          <option value="">All Modes</option>
          <option value="Remote" ${currentFilters.mode === 'Remote' ? 'selected' : ''}>Remote</option>
          <option value="Hybrid" ${currentFilters.mode === 'Hybrid' ? 'selected' : ''}>Hybrid</option>
          <option value="Onsite" ${currentFilters.mode === 'Onsite' ? 'selected' : ''}>Onsite</option>
        </select>
        
        <select class="kn-input kn-filter-select" id="experience-filter">
          <option value="">All Experience</option>
          <option value="Fresher" ${currentFilters.experience === 'Fresher' ? 'selected' : ''}>Fresher</option>
          <option value="0-1" ${currentFilters.experience === '0-1' ? 'selected' : ''}>0-1 Years</option>
          <option value="1-3" ${currentFilters.experience === '1-3' ? 'selected' : ''}>1-3 Years</option>
          <option value="3-5" ${currentFilters.experience === '3-5' ? 'selected' : ''}>3-5 Years</option>
        </select>
        
        <select class="kn-input kn-filter-select" id="source-filter">
          <option value="">All Sources</option>
          <option value="LinkedIn" ${currentFilters.source === 'LinkedIn' ? 'selected' : ''}>LinkedIn</option>
          <option value="Naukri" ${currentFilters.source === 'Naukri' ? 'selected' : ''}>Naukri</option>
          <option value="Indeed" ${currentFilters.source === 'Indeed' ? 'selected' : ''}>Indeed</option>
        </select>
        
        <select class="kn-input kn-filter-select" id="sort-filter">
          <option value="latest" ${currentFilters.sort === 'latest' ? 'selected' : ''}>Latest First</option>
          <option value="oldest" ${currentFilters.sort === 'oldest' ? 'selected' : ''}>Oldest First</option>
        </select>
        
        <button class="kn-button kn-button--secondary kn-button--small" onclick="router.clearFilters()">Clear</button>
      </div>
    `;
  }
  
  renderJobCard(job) {
    const isSaved = savedJobs.includes(job.id);
    const daysText = job.postedDaysAgo === 0 ? 'Today' : job.postedDaysAgo === 1 ? '1 day ago' : `${job.postedDaysAgo} days ago`;
    
    return `
      <div class="kn-job-card">
        <div class="kn-job-card__header">
          <h3 class="kn-job-card__title">${job.title}</h3>
          <span class="kn-badge kn-badge--source">${job.source}</span>
        </div>
        
        <div class="kn-job-card__company">${job.company}</div>
        
        <div class="kn-job-card__details">
          <span class="kn-job-card__detail">📍 ${job.location}</span>
          <span class="kn-job-card__detail">💼 ${job.mode}</span>
          <span class="kn-job-card__detail">⏱️ ${job.experience}</span>
        </div>
        
        <div class="kn-job-card__salary">${job.salaryRange}</div>
        
        <div class="kn-job-card__footer">
          <span class="kn-job-card__posted">${daysText}</span>
          <div class="kn-job-card__actions">
            <button class="kn-button kn-button--secondary kn-button--small" onclick="router.viewJob(${job.id})">View</button>
            <button class="kn-button ${isSaved ? 'kn-button--primary' : 'kn-button--secondary'} kn-button--small" onclick="router.toggleSave(${job.id})">${isSaved ? 'Saved' : 'Save'}</button>
            <button class="kn-button kn-button--primary kn-button--small" onclick="router.applyJob('${job.applyUrl}')">Apply</button>
          </div>
        </div>
      </div>
    `;
  }
  
  renderModal() {
    return `
      <div class="kn-modal" id="job-modal">
        <div class="kn-modal__overlay" onclick="router.closeModal()"></div>
        <div class="kn-modal__content">
          <button class="kn-modal__close" onclick="router.closeModal()">✕</button>
          <div id="modal-body"></div>
        </div>
      </div>
    `;
  }
  
  viewJob(jobId) {
    const job = JOBS_DATA.find(j => j.id === jobId);
    if (!job) return;
    
    const modal = document.getElementById('job-modal');
    const modalBody = document.getElementById('modal-body');
    
    modalBody.innerHTML = `
      <h2 class="kn-modal__title">${job.title}</h2>
      <div class="kn-modal__company">${job.company}</div>
      
      <div class="kn-modal__meta">
        <span>📍 ${job.location}</span>
        <span>💼 ${job.mode}</span>
        <span>⏱️ ${job.experience}</span>
        <span class="kn-badge kn-badge--source">${job.source}</span>
      </div>
      
      <div class="kn-modal__salary">${job.salaryRange}</div>
      
      <div class="kn-modal__section">
        <h3>Description</h3>
        <p>${job.description}</p>
      </div>
      
      <div class="kn-modal__section">
        <h3>Required Skills</h3>
        <div class="kn-skills-list">
          ${job.skills.map(skill => `<span class="kn-skill-tag">${skill}</span>`).join('')}
        </div>
      </div>
      
      <div class="kn-modal__actions">
        <button class="kn-button kn-button--primary" onclick="router.applyJob('${job.applyUrl}')">Apply Now</button>
        <button class="kn-button kn-button--secondary" onclick="router.toggleSave(${job.id}); router.closeModal();">${savedJobs.includes(job.id) ? 'Unsave' : 'Save Job'}</button>
      </div>
    `;
    
    modal.classList.add('kn-modal--open');
  }
  
  closeModal() {
    const modal = document.getElementById('job-modal');
    modal.classList.remove('kn-modal--open');
  }
  
  toggleSave(jobId) {
    if (savedJobs.includes(jobId)) {
      savedJobs = savedJobs.filter(id => id !== jobId);
    } else {
      savedJobs.push(jobId);
    }
    localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
    this.handleRoute();
  }
  
  applyJob(url) {
    window.open(url, '_blank');
  }
  
  clearFilters() {
    currentFilters = {
      keyword: '',
      location: '',
      mode: '',
      experience: '',
      source: '',
      sort: 'latest'
    };
    this.handleRoute();
  }
  
  renderSaved() {
    const savedJobsData = JOBS_DATA.filter(job => savedJobs.includes(job.id));
    
    return `
      <div class="kn-context-header">
        <h1 class="kn-context-header__title">Saved Jobs</h1>
        <p class="kn-context-header__subtitle">Jobs you've marked for later review.</p>
      </div>
      
      ${savedJobsData.length > 0 ? `
        <div class="kn-jobs-grid">
          ${savedJobsData.map(job => this.renderJobCard(job)).join('')}
        </div>
      ` : `
        <div class="kn-empty-state">
          <h3 class="kn-empty-state__title">No saved jobs yet.</h3>
          <p class="kn-empty-state__description">Save jobs from your dashboard to review them later.</p>
          <button class="kn-button kn-button--primary" data-route="/dashboard">Browse Jobs</button>
        </div>
      `}
      
      ${this.renderModal()}
    `;
  }
  
  renderDigest() {
    return `
      <div class="kn-context-header">
        <h1 class="kn-context-header__title">Daily Digest</h1>
        <p class="kn-context-header__subtitle">Your personalized job matches delivered at 9AM.</p>
      </div>
      <div class="kn-empty-state">
        <h3 class="kn-empty-state__title">No digest available.</h3>
        <p class="kn-empty-state__description">Your first digest will be generated after you configure your preferences.</p>
      </div>
    `;
  }
  
  renderSettings() {
    return `
      <div class="kn-context-header">
        <h1 class="kn-context-header__title">Preferences</h1>
        <p class="kn-context-header__subtitle">Configure your job matching criteria.</p>
      </div>
      
      <div class="kn-card kn-card--large" style="max-width: 720px;">
        <div class="kn-card__body">
          <div class="kn-input-group" style="margin-bottom: var(--space-md);">
            <label class="kn-label">Role Keywords</label>
            <input type="text" class="kn-input" placeholder="e.g., Product Manager, Senior Engineer">
          </div>
          
          <div class="kn-input-group" style="margin-bottom: var(--space-md);">
            <label class="kn-label">Preferred Locations</label>
            <input type="text" class="kn-input" placeholder="e.g., San Francisco, Remote">
          </div>
          
          <div class="kn-input-group" style="margin-bottom: var(--space-md);">
            <label class="kn-label">Work Mode</label>
            <select class="kn-input">
              <option value="">Select mode</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">Onsite</option>
            </select>
          </div>
          
          <div class="kn-input-group" style="margin-bottom: var(--space-md);">
            <label class="kn-label">Experience Level</label>
            <select class="kn-input">
              <option value="">Select level</option>
              <option value="entry">Entry Level</option>
              <option value="mid">Mid Level</option>
              <option value="senior">Senior</option>
              <option value="lead">Lead</option>
              <option value="executive">Executive</option>
            </select>
          </div>
        </div>
        
        <div class="kn-card__footer">
          <button class="kn-button kn-button--primary">Save Preferences</button>
          <button class="kn-button kn-button--secondary">Reset</button>
        </div>
      </div>
    `;
  }
  
  renderProof() {
    return `
      <div class="kn-context-header">
        <h1 class="kn-context-header__title">Proof</h1>
        <p class="kn-context-header__subtitle">Artifact collection and validation.</p>
      </div>
      <div class="kn-empty-state">
        <h3 class="kn-empty-state__title">Proof collection placeholder.</h3>
        <p class="kn-empty-state__description">This section will be built in the next step.</p>
      </div>
    `;
  }
  
  updateActiveLink(path) {
    // Remove active class from all links
    document.querySelectorAll('[data-route]').forEach(link => {
      link.classList.remove('kn-nav__link--active');
    });
    
    // Add active class to current link
    const activeLink = document.querySelector(`[data-route="${path}"]`) || 
                       document.querySelector('[data-route="/dashboard"]');
    if (activeLink) {
      activeLink.classList.add('kn-nav__link--active');
    }
  }
}

// Initialize router when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.router = new Router();
  
  // Mobile menu toggle
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');
  
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('kn-nav__links--open');
      menuToggle.classList.toggle('kn-nav__toggle--open');
    });
  }
  
  // Filter event listeners
  document.addEventListener('input', (e) => {
    if (e.target.id === 'keyword-filter') {
      currentFilters.keyword = e.target.value;
      router.handleRoute();
    }
    if (e.target.id === 'location-filter') {
      currentFilters.location = e.target.value;
      router.handleRoute();
    }
  });
  
  document.addEventListener('change', (e) => {
    if (e.target.id === 'mode-filter') {
      currentFilters.mode = e.target.value;
      router.handleRoute();
    }
    if (e.target.id === 'experience-filter') {
      currentFilters.experience = e.target.value;
      router.handleRoute();
    }
    if (e.target.id === 'source-filter') {
      currentFilters.source = e.target.value;
      router.handleRoute();
    }
    if (e.target.id === 'sort-filter') {
      currentFilters.sort = e.target.value;
      router.handleRoute();
    }
  });
});
