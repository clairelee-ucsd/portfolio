import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

let projects = await fetchJSON('../lib/projects.json');

let query = '';
let searchInput = document.querySelector('.searchBar');

const projectsContainer = document.querySelector('.projects');
const projectCount = projects.length;
const projectsTitle = document.querySelector('.projects-title');
projectsTitle.textContent = `${projectCount} Projects`;


// let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
// let rolledData = d3.rollups(projects, (v) => v.length, (d) => d.year);
// let data = rolledData.map(([year, count]) => {
//     return { value: count, label: year };
//     });

// let sliceGenerator = d3.pie().value((d) => d.value);
// let arcData = sliceGenerator(data);
// let arcs = arcData.map((d) => arcGenerator(d));
// let colors = d3.scaleOrdinal(d3.schemeTableau10);

// arcs.forEach((arc, idx) => {
//     d3.select('svg')
//       .append('path')
//       .attr('d', arc)
//       .attr('fill', colors(idx))
//       .attr('transform', 'translate(0, 0)');
//   });

// let legend = d3.select('.legend');
// data.forEach((d, idx) => {
//     legend.append('li')
//     .attr('style', `--color:${colors(idx)}`) // set the style attribute while passing in
//     .attr('class', 'legend-item')
//     .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`); // set the i
//     });



// searchInput.addEventListener('change', (event) => {
//     query = event.target.value;
    
//     let filteredProjects = projects.filter((project) => {
//         let values = Object.values(project).join('\n').toLowerCase();
//         return values.includes(query.toLowerCase());
//         });
    
//     renderProjects(filteredProjects, projectsContainer, 'h2');
//     });

// function renderPieChart(projectsGiven){
//     let newSVG = d3.select('svg');
//     newSVG.selectAll('path').remove();

//     let legend = d3.select('.legend');
//     legend.selectAll('.legend-item').remove();

//     let newRolledData = d3.rollups(projectsGiven, (v) => v.length, (d) => d.year);

//     let newData = newRolledData.map(([year, count]) => {
//         return { value: count, label: year };
//         });
    
//     let newSliceGenerator = d3.pie().value((d) => d.value);
//     let newArcData = newSliceGenerator(newData);
//     let newArcs = newArcData.map((d) => arcGenerator(d));
//     let colors = d3.scaleOrdinal(d3.schemeTableau10);

//     arcs.forEach((arc, idx) => {
//         d3.select('svg')
//           .append('path')
//           .attr('d', arc)
//           .attr('fill', colors(idx))
//           .attr('transform', 'translate(0, 0)');
//       });
    
//     newData.forEach((d, idx) => {
//         legend.append('li')
//         .attr('style', `--color:${colors(idx)}`) // set the style attribute while passing in
//         .attr('class', 'legend-item')
//         .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`); // set the i
//         })
// }

function renderPieChart(projectsGiven) {
    // re-calculate rolled data
    let newRolledData = d3.rollups(projectsGiven, (v) => v.length, (d) => d.year);

    // re-calculate data
    let newData = newRolledData.map(([year, count]) => {
    return {value: count, label: year};
    });

    // re-calculate slice generator, arc data, arc, etc.
    let newSliceGenerator = d3.pie().value((d) => d.value);
    let newArcData = newSliceGenerator(newData);
    let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
    let newArcs = newArcData.map((d) => arcGenerator(d));
    let colors = d3.scaleOrdinal(d3.schemeTableau10);
    
    // clear up paths and legends
    let newSVG = d3.select('svg');
    newSVG.selectAll('path').remove();

    let legend = d3.select('.legend');
    legend.selectAll('.legend-item').remove();

    // update paths and legends, refer to steps 1.4 and 2.2
    newArcs.forEach((arc, idx) => {
        d3.select('svg')
          .append('path')
          .attr('d', arc)
          .attr('fill', colors(idx))
          .attr('transform', 'translate(0, 0)');
      });

    newData.forEach((d, idx) => {
        legend.append('li')
        .attr('style', `--color:${colors(idx)}`) // set the style attribute while passing in
        .attr('class', 'legend-item')
        .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`); // set the i
      });
    }

renderPieChart(projects);
renderProjects(projects, projectsContainer, 'h2');

searchInput.addEventListener('change', (event) => {
    query = event.target.value;

    let filteredProjects = projects.filter((project) => {
        let values = Object.values(project).join('\n').toLowerCase();
        return values.includes(query.toLowerCase());
        });

    // re-render legends and pie chart when event triggers
    renderProjects(filteredProjects, projectsContainer, 'h2');
    renderPieChart(filteredProjects);
});
