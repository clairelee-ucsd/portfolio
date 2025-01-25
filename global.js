console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

let pages = [
    { url: '', title: 'Home' },
    { url: 'projects/', title: 'Projects' },
    { url: 'contact/', title: 'Contact' },
    { url: 'resume/', title: 'Resume' },
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

    const currentPath = location.pathname.endsWith('/')? location.pathname: location.pathname + '/';
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

  if ('colorScheme' in localStorage){
    document.documentElement.style.setProperty('color-scheme', localStorage.colorScheme);
    select.value = localStorage.colorScheme;
  }

  select.addEventListener('input', function (event) {
    console.log('color scheme changed to', event.target.value);
    document.documentElement.style.setProperty('color-scheme', event.target.value);
    localStorage.colorScheme = event.target.value;
  });


const form = document.querySelector('form');

form?.addEventListener('submit', function(event) {
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