const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const primaryNav = document.querySelector('.primary-nav');
const servicesNav = document.querySelector('.nav-services');
const submenuToggle = document.querySelector('.submenu-toggle');

const updateHeader = () => {
  header.classList.toggle('scrolled', window.scrollY > 24);
};

const setSubmenu = (open) => {
  servicesNav.classList.toggle('submenu-open', open);
  submenuToggle.setAttribute('aria-expanded', String(open));
  submenuToggle.setAttribute('aria-label', open ? 'Hide services menu' : 'Show services menu');
};

const setMenu = (open) => {
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
  primaryNav.classList.toggle('nav-open', open);
  header.classList.toggle('menu-active', open);
  document.body.classList.toggle('menu-open', open);
  if (!open) setSubmenu(false);
};

updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });
menuToggle.addEventListener('click', () => {
  setMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
});
submenuToggle.addEventListener('click', () => {
  setSubmenu(submenuToggle.getAttribute('aria-expanded') !== 'true');
});
primaryNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));

document.addEventListener('click', (event) => {
  if (!servicesNav.contains(event.target)) setSubmenu(false);
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (menuToggle.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    menuToggle.focus();
  } else if (submenuToggle.getAttribute('aria-expanded') === 'true') {
    setSubmenu(false);
    submenuToggle.focus();
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

const projectGrid = document.querySelector('.project-grid');
const lightbox = document.querySelector('#project-lightbox');

if (projectGrid && lightbox) {
  const filterButtons = [...document.querySelectorAll('.filter-button')];
  const projectCards = [...document.querySelectorAll('.project-card')];
  const lightboxImage = document.querySelector('#lightbox-image');
  const lightboxTitle = document.querySelector('#lightbox-title');
  const lightboxDetail = document.querySelector('#lightbox-detail');
  const lightboxCounter = document.querySelector('#lightbox-counter');
  let visibleProjects = projectCards;
  let currentProject = 0;

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
}

const quoteForm = document.querySelector('#quote-form');

if (quoteForm) {
  const serviceSelect = document.querySelector('#service');
  const formStatus = document.querySelector('#form-status');
  const requestedService = new URLSearchParams(window.location.search).get('service');
  const availableServices = [...serviceSelect.options].map((option) => option.value);
  if (requestedService && availableServices.includes(requestedService)) {
    serviceSelect.value = requestedService;
    document.querySelector('.quote-panel').classList.add('highlight');
  }

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
}

document.querySelectorAll('#current-year').forEach((year) => {
  year.textContent = new Date().getFullYear();
});
