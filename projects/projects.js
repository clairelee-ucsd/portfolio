import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
const projectsTitle = document.querySelector('.projects-title');
const searchInput = document.querySelector('.searchBar');

let query = '';
let selectedYear = null;

function renderPieChart(projectsGiven) {
    const rolledData = d3.rollups(
        projectsGiven,
        v => v.length,
        d => d.year
    );

    const pieData = rolledData.map(([year, count]) => ({
        value: count,
        label: String(year),
        year: year
    }));

    const newSVG = d3.select('svg');
    newSVG.selectAll('*').remove();
    const legend = d3.select('.legend');
    legend.selectAll('*').remove();

    const pie = d3.pie().value(d => d.value);
    const arc = d3.arc().innerRadius(0).outerRadius(50);
    const arcs = pie(pieData);
    const colors = d3.scaleOrdinal(d3.schemeTableau10);

    // Draw pie slices
    newSVG.selectAll('path')
        .data(arcs)
        .join('path')
        .attr('d', arc)
        .attr('fill', (_, i) => colors(i))
        .attr('class', d => selectedYear === d.data.year ? 'selected' : '')
        .on('click', (_, d) => {
            selectedYear = selectedYear === d.data.year ? null : d.data.year;
            updateDisplay();
        });

    // Draw legend
    legend.selectAll('li')
        .data(pieData)
        .join('li')
        .attr('style', (_, i) => `--color: ${colors(i)}`)
        .attr('class', d => selectedYear === d.year ? 'selected' : '')
        .html(d => `
            <span class="swatch"></span>
            ${d.label} <em>(${d.value})</em>
        `)
        .on('click', (event, d) => {
            event.preventDefault();
            selectedYear = selectedYear === d.year ? null : d.year;
            updateDisplay();
        });
}

function updateDisplay() {
    // changed this code
    const filteredProjects = projects.filter(project => {
        const matchesSearch = Object.values(project)
            .join(' ')
            .toLowerCase()
            .includes(query.toLowerCase());
            
        const matchesYear = !selectedYear || project.year === selectedYear;
        
        return matchesSearch && matchesYear;
    });

    // Update projects list
    renderProjects(filteredProjects, projectsContainer, 'h2');
    projectsTitle.textContent = `${filteredProjects.length} Project${filteredProjects.length !== 1 ? 's' : ''}`;

    // Update pie chart with search-filtered data
    const searchFiltered = projects.filter(p => 
        Object.values(p).join(' ').toLowerCase().includes(query.toLowerCase())
    );
    renderPieChart(searchFiltered);
}

// Initial setup
projectsTitle.textContent = `${projects.length} Projects`;
renderProjects(projects, projectsContainer, 'h2');
renderPieChart(projects);

searchInput.addEventListener('input', (event) => {
    query = event.target.value;
    selectedYear = null;
    updateDisplay();
});

// Initial render
updateDisplay();