import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('../lib/projects.json');

const projectsContainer = document.querySelector('.projects');
const title = document.querySelector('.projects-title');
const searchInput = document.querySelector('.searchBar');

let selectedYear = null;
let query = '';

function getFilteredProjects(query, selectedYear) {
  let filteredProjects = projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });

  if (selectedYear) {
    filteredProjects = filteredProjects.filter((project) => project.year === selectedYear);
  }

  return filteredProjects;
}

title.textContent = projects.length + ' Projects';
renderProjects(projects, projectsContainer, 'h2');
renderPieChart(projects);

function renderPieChart(projectsGiven) {
  let rolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year,
  );

  let data = rolledData.map(([year, count]) => {
    return { value: count, label: year };
  });

  let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  let sliceGenerator = d3.pie().value((d) => d.value);
  let arcData = sliceGenerator(data);
  let arcs = arcData.map((d) => arcGenerator(d));

  let colors = d3.scaleOrdinal(d3.schemeTableau10);

  let svg = d3.select('#projects-plot');
  svg.selectAll('path').remove();

  let legend = d3.select('.legend');
  legend.selectAll('li').remove();

  arcs.forEach((arc, idx) => {
    svg
      .append('path')
      .attr('d', arc)
      .attr('fill', colors(idx))
      .attr('class', data[idx].label === selectedYear ? 'selected' : '')
      .on('click', () => {
        selectedYear = selectedYear === data[idx].label ? null : data[idx].label;
        const filteredProjects = getFilteredProjects(query, selectedYear);
        renderProjects(filteredProjects, projectsContainer, 'h2');
        title.textContent = filteredProjects.length + ' Projects';

        svg
          .selectAll('path')
          .attr('class', (_, i) => (data[i].label === selectedYear ? 'selected' : ''));

        legend
          .selectAll('li')
          .attr('class', (_, i) => (data[i].label === selectedYear ? 'selected' : ''));
      });
  });

  data.forEach((d, idx) => {
    legend
      .append('li')
      .attr('style', `--color:${colors(idx)}`)
      .attr('class', d.label === selectedYear ? 'selected' : '')
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
      .on('click', () => {
        selectedYear = selectedYear === d.label ? null : d.label;
        const filteredProjects = getFilteredProjects(query, selectedYear);
        renderProjects(filteredProjects, projectsContainer, 'h2');
        title.textContent = filteredProjects.length + ' Projects';

        svg
          .selectAll('path')
          .attr('class', (_, i) => (data[i].label === selectedYear ? 'selected' : ''));

        legend
          .selectAll('li')
          .attr('class', (_, i) => (data[i].label === selectedYear ? 'selected' : ''));
      });
  });
}

searchInput.addEventListener('input', (event) => {
  query = event.target.value;
  const filteredProjects = getFilteredProjects(query, selectedYear);
  renderProjects(filteredProjects, projectsContainer, 'h2');
  renderPieChart(filteredProjects);
  title.textContent = filteredProjects.length + ' Projects';
});