import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

async function updateProjectCount() {
    const response = await fetch('../lib/projects.json');
    const projects = await response.json(); 

    const projectsTitle = document.querySelector('.projects-title');
    const projectCount = projects.length;

    projectsTitle.textContent = `${projectCount} Projects`;
}

updateProjectCount();