const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const primaryNav = document.querySelector('.primary-nav');
const navLinks = [...document.querySelectorAll('.nav-link')];

const updateHeader = () => {
  header.classList.toggle('scrolled', window.scrollY > 24);
};

const setMenu = (open) => {
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
  primaryNav.classList.toggle('nav-open', open);
  header.classList.toggle('menu-active', open);
  document.body.classList.toggle('menu-open', open);
};

updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });
menuToggle.addEventListener('click', () => {
  setMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
});

navLinks.forEach((link) => link.addEventListener('click', () => setMenu(false)));

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    menuToggle.focus();
  }
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 980) setMenu(false);
});

const revealItems = document.querySelectorAll('[data-reveal]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (reducedMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('revealed'));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px' });

  revealItems.forEach((item) => revealObserver.observe(item));
}

if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        const active = link.getAttribute('href') === `#${entry.target.id}`;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-25% 0px -65% 0px', threshold: 0 });

  document.querySelectorAll('main section[id]').forEach((section) => sectionObserver.observe(section));
}

const serviceSelect = document.querySelector('#service');
const quotePanel = document.querySelector('.quote-panel');
let highlightTimer;

document.querySelectorAll('.service-card').forEach((card) => {
  card.addEventListener('click', () => {
    serviceSelect.value = card.dataset.service;
    quotePanel.classList.add('highlight');
    window.clearTimeout(highlightTimer);
    highlightTimer = window.setTimeout(() => quotePanel.classList.remove('highlight'), 1400);
  });
});

const filterButtons = [...document.querySelectorAll('.filter-button')];
const projectGrid = document.querySelector('.project-grid');
const projectCards = [...document.querySelectorAll('.project-card')];
let visibleProjects = projectCards;

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((item) => {
      const selected = item === button;
      item.classList.toggle('active', selected);
      item.setAttribute('aria-pressed', String(selected));
    });

    projectGrid.classList.toggle('is-filtered', filter !== 'all');
    projectCards.forEach((card) => {
      card.hidden = filter !== 'all' && card.dataset.category !== filter;
    });
    visibleProjects = projectCards.filter((card) => !card.hidden);
  });
});

const lightbox = document.querySelector('#project-lightbox');
const lightboxImage = document.querySelector('#lightbox-image');
const lightboxTitle = document.querySelector('#lightbox-title');
const lightboxDetail = document.querySelector('#lightbox-detail');
const lightboxCounter = document.querySelector('#lightbox-counter');
let currentProject = 0;

const updateLightbox = () => {
  const project = visibleProjects[currentProject];
  const projectImage = project.querySelector('img');
  lightboxImage.src = projectImage.src;
  lightboxImage.alt = projectImage.alt;
  lightboxTitle.textContent = project.dataset.title;
  lightboxDetail.textContent = project.dataset.detail;
  lightboxCounter.textContent = `${String(currentProject + 1).padStart(2, '0')} / ${String(visibleProjects.length).padStart(2, '0')}`;
};

const openLightbox = (project) => {
  currentProject = visibleProjects.indexOf(project);
  updateLightbox();
  if (typeof lightbox.showModal === 'function') lightbox.showModal();
  else lightbox.setAttribute('open', '');
  document.body.classList.add('lightbox-open');
};

const closeLightbox = () => {
  if (typeof lightbox.close === 'function') lightbox.close();
  else lightbox.removeAttribute('open');
  document.body.classList.remove('lightbox-open');
};

const changeProject = (direction) => {
  currentProject = (currentProject + direction + visibleProjects.length) % visibleProjects.length;
  updateLightbox();
};

projectCards.forEach((card) => card.addEventListener('click', () => openLightbox(card)));
document.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
document.querySelector('.lightbox-prev').addEventListener('click', () => changeProject(-1));
document.querySelector('.lightbox-next').addEventListener('click', () => changeProject(1));
lightbox.addEventListener('close', () => document.body.classList.remove('lightbox-open'));
lightbox.addEventListener('click', (event) => {
  if (event.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', (event) => {
  if (!lightbox.hasAttribute('open')) return;
  if (event.key === 'ArrowLeft') changeProject(-1);
  if (event.key === 'ArrowRight') changeProject(1);
});

const quoteForm = document.querySelector('#quote-form');
const formStatus = document.querySelector('#form-status');

quoteForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!quoteForm.reportValidity()) return;

  const data = new FormData(quoteForm);
  const recipientSelect = document.querySelector('#recipient');
  const recipientName = recipientSelect.options[recipientSelect.selectedIndex].textContent;
  const firstName = recipientName.split(' ')[0];
  const message = [
    `Hello ${firstName}, I'd like to request a quote from Malepe Projects.`,
    '',
    `Name: ${data.get('name').trim()}`,
    `Phone: ${data.get('phone').trim()}`,
    `Service: ${data.get('service')}`,
    '',
    'Project details:',
    data.get('message').trim()
  ].join('\n');
  const whatsappUrl = `https://wa.me/${data.get('recipient')}?text=${encodeURIComponent(message)}`;
  const whatsappWindow = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

  formStatus.textContent = `Your message is ready for ${recipientName} in WhatsApp.`;
  if (!whatsappWindow) window.location.href = whatsappUrl;
});

document.querySelector('#current-year').textContent = new Date().getFullYear();
