import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
const projectCount = projects.length;
const projectsTitle = document.querySelector('.projects-title');
projectsTitle.textContent = `${projectCount} Projects`;
renderProjects(projects, projectsContainer, 'h2');
