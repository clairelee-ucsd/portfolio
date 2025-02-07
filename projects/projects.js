import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

let data = [
    { value: 1, label: 'apples' },
    { value: 2, label: 'oranges' },
    { value: 3, label: 'mangos' },
    { value: 4, label: 'pears' },
    { value: 5, label: 'limes' },
    { value: 5, label: 'cherries' },
    ];
let sliceGenerator = d3.pie().value((d) => d.value);
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

let legend = d3.select('.legend');
data.forEach((d, idx) => {
    legend.append('li')
    .attr('style', `--color:${colors(idx)}`) // set the style attribute while passing in
    .attr('class', 'legend-item')
    .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`); // set the i
    })

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
const projectCount = projects.length;
const projectsTitle = document.querySelector('.projects-title');
projectsTitle.textContent = `${projectCount} Projects`;
renderProjects(projects, projectsContainer, 'h2');