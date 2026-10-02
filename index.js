import { fetchJSON, renderProjects } from './global.js';

const root = document.documentElement;

// Restore the exact reading position after a browser refresh.
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

const scrollKey = `portfolio-scroll:${location.pathname}`;
const projectsExpandedKey = `portfolio-projects-expanded:${location.pathname}`;
const navigationEntry = performance.getEntriesByType('navigation')[0];
const isReload = navigationEntry?.type === 'reload';
const savedScroll = Number(sessionStorage.getItem(scrollKey));
const shouldRestoreScroll = isReload && Number.isFinite(savedScroll);

let scrollSaveFrame = null;
function saveScrollPosition() {
  if (scrollSaveFrame !== null) return;
  scrollSaveFrame = requestAnimationFrame(() => {
    sessionStorage.setItem(scrollKey, String(window.scrollY));
    scrollSaveFrame = null;
  });
}

window.addEventListener('scroll', saveScrollPosition, { passive: true });
window.addEventListener('pagehide', () => {
  sessionStorage.setItem(scrollKey, String(window.scrollY));
});

const themeToggle = document.querySelector('.theme-toggle');
const sunIcon = document.querySelector('.theme-icon-sun');
const moonIcon = document.querySelector('.theme-icon-moon');
const storedTheme = localStorage.getItem('portfolio-theme');
const preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

function applyTheme(theme) {
  root.dataset.theme = theme;
  const isDark = theme === 'dark';

  if (themeToggle) {
    themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  }

  if (sunIcon && moonIcon) {
    sunIcon.hidden = isDark;
    moonIcon.hidden = !isDark;
  }
}

applyTheme(storedTheme || preferredTheme);

themeToggle?.addEventListener('click', () => {
  const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('portfolio-theme', nextTheme);
  applyTheme(nextTheme);
});

const projectsContainer = document.querySelector('.projects');
const projectControls = document.querySelector('.project-controls');
const projectToggle = document.querySelector('.project-toggle');
const projects = await fetchJSON('lib/projects.json');

const normalizedProjects = projects.map((project) => ({
  ...project,
  image: project.image?.replace(/^\.\.\//, '')
}));

renderProjects(normalizedProjects, projectsContainer, 'h3');

let projectsExpanded = sessionStorage.getItem(projectsExpandedKey) === 'true';

function projectColumns() {
  if (window.innerWidth > 980) return 3;
  if (window.innerWidth > 820) return 2;
  return 1;
}

function updateProjectVisibility() {
  const cards = [...projectsContainer.querySelectorAll('.project-card')];
  const initialCount = projectColumns() * 2;
  const canExpand = cards.length > initialCount;

  cards.forEach((card, index) => {
    card.hidden = !projectsExpanded && index >= initialCount;
  });

  if (projectControls && projectToggle) {
    projectControls.hidden = !canExpand;
    projectToggle.textContent = projectsExpanded ? 'Show less' : 'Show more';
    projectToggle.setAttribute('aria-expanded', String(projectsExpanded));
  }
}

updateProjectVisibility();

projectToggle?.addEventListener('click', () => {
  const buttonTopBefore = projectToggle.getBoundingClientRect().top;
  projectsExpanded = !projectsExpanded;
  sessionStorage.setItem(projectsExpandedKey, String(projectsExpanded));
  updateProjectVisibility();

  // When collapsing, keep the button in the same visual spot instead of jumping down the page.
  if (!projectsExpanded) {
    requestAnimationFrame(() => {
      const buttonTopAfter = projectToggle.getBoundingClientRect().top;
      window.scrollBy(0, buttonTopAfter - buttonTopBefore);
    });
  }
});

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(updateProjectVisibility, 100);
});

async function restoreScrollPosition() {
  if (!shouldRestoreScroll) return;

  const restore = () => window.scrollTo({ top: savedScroll, left: 0, behavior: 'auto' });

  // Restore once after the projects are rendered, then again after images settle.
  restore();

  const images = [...document.images];
  await Promise.all(images.map((image) => {
    if (image.complete) return Promise.resolve();
    return new Promise((resolve) => {
      image.addEventListener('load', resolve, { once: true });
      image.addEventListener('error', resolve, { once: true });
    });
  }));

  restore();
  requestAnimationFrame(restore);
  setTimeout(restore, 120);
  setTimeout(restore, 350);
}

restoreScrollPosition();
