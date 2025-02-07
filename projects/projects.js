import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

let data = [1, 2, 3, 4, 5, 5];
let sliceGenerator = d3.pie();
let arcData = sliceGenerator(data);
let arcs = arcData.map((d) => arcGenerator(d));
let colors = d3.scaleOrdinal(d3.schemeTableau10);

arcs.forEach((arc, idx) => {
    d3.select('svg')
      .append('path')
      .attr('d', arc)
      .attr('fill', colors(idx))
      .attr('transform', 'translate(0, 0)');
  });

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
const projectCount = projects.length;
const projectsTitle = document.querySelector('.projects-title');
projectsTitle.textContent = `${projectCount} Projects`;
renderProjects(projects, projectsContainer, 'h2');