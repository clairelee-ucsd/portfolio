console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

let pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'contact/', title: 'Contact' },
  { url: 'resume/', title: 'Resume' },
  { url: 'meta/', title: 'Meta' },
  { url: 'https://github.com/clairelee-ucsd', title: 'GitHub profile' }
];

const IS_PAGES = location.hostname === 'clairelee-ucsd.github.io';
const BASE_PATH = IS_PAGES ? '/portfolio' : '';
const ARE_WE_HOME = document.documentElement.classList.contains('home');

let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
  let url = p.url;
  let title = p.title;


  url = !ARE_WE_HOME && !url.startsWith('http') ? BASE_PATH + '/' + url : url;

  let a = document.createElement('a');
  a.href = url;
  a.textContent = title;

  const currentPath = location.pathname.endsWith('/') ? location.pathname : location.pathname + '/';
  if (a.host === location.host && a.pathname === location.pathname) {
    a.classList.add('current');
  }

  if (!url.startsWith(BASE_PATH) && !url.startsWith('/')) {
    a.target = '_blank';
  }

  nav.append(a);
}

document.body.insertAdjacentHTML(
  'afterbegin',
  `
      <label class="color-scheme">
          Theme:
          <select>
              <option value = 'light dark'>Automatic</option>
              <option value = 'light'>Light</option>
              <option value = 'dark'>Dark</option>
          </select>
      </label>`
);

const select = document.querySelector('.color-scheme select');

if ('colorScheme' in localStorage) {
  document.documentElement.style.setProperty('color-scheme', localStorage.colorScheme);
  select.value = localStorage.colorScheme;
}

select.addEventListener('input', function (event) {
  console.log('color scheme changed to', event.target.value);
  document.documentElement.style.setProperty('color-scheme', event.target.value);
  localStorage.colorScheme = event.target.value;
});


const form = document.querySelector('form');

form?.addEventListener('submit', function (event) {
  event.preventDefault();

  const data = new FormData(form);

  let url = form.action + "?";

  for (let [name, value] of data) {
    url += encodeURIComponent(name) + "=" + encodeURIComponent(value) + "&";
    console.log(name, value);
  }

  url = url.slice(0, -1);

  location.href = url;
});

export async function fetchJSON(url) {
  try {
    // Fetch the JSON file from the given URL
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }

    const data = await response.json();
    return data;


  } catch (error) {
    console.error('Error fetching or parsing JSON data:', error);
  }
}


export function renderProjects(projects, containerElement, headingLevel = 'h2') {
  containerElement.innerHTML = '';

  projects.forEach(project => {
    const validHeading = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    if (!validHeading.includes(headingLevel)) {
      headingLevel = 'h2';
    }

    const article = document.createElement('article');

    const heading = document.createElement(headingLevel);
    heading.textContent = project.title;

    const projectDetails = document.createElement('div');
    projectDetails.style.display = 'flex';
    projectDetails.style.alignItems = 'flex-start'; 
    projectDetails.style.justifyContent = 'space-between';
    projectDetails.style.flexWrap = 'wrap';

    const image = document.createElement('img');
    image.src = project.image;
    image.alt = project.title;
    image.style.width = '269px';
    image.style.height = '134x';
    image.style.objectFit = 'cover';

    const description = document.createElement('p');
    description.textContent = project.description;
    description.style.marginRight = '20px';

    const link = document.createElement('a');
    link.href = project.link; 
    link.textContent = 'View Project'; 
    link.style.marginRight = '20px';
    link.target = '_blank';

    const year = document.createElement('p');
    year.textContent = project.year;
    year.style.fontFamily = 'Baskerville, serif';
    year.style.fontVariantNumeric = 'oldstyle-nums';
    year.style.margin = '0';

    projectDetails.appendChild(image);
    projectDetails.appendChild(description);
    projectDetails.appendChild(link);
    projectDetails.appendChild(year);

    article.innerHTML = `
      <${headingLevel}>${project.title}</${headingLevel}>
    `;

    article.appendChild(projectDetails);
    containerElement.appendChild(article);
  });
}


export async function fetchGitHubData(username) {
  return fetchJSON(`https://api.github.com/users/${username}`);
}