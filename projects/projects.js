import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

let projects = await fetchJSON('../lib/projects.json');
let rolledData = d3.rollups(projects, (v) => v.length, (d) => d.year);
let data = rolledData.map(([year, count]) => {
    return { value: count, label: year };
    });

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

const projectsContainer = document.querySelector('.projects');
const projectCount = projects.length;
const projectsTitle = document.querySelector('.projects-title');
projectsTitle.textContent = `${projectCount} Projects`;
renderProjects(projects, projectsContainer, 'h2');