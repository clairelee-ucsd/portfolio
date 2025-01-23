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

let nav = document.createElement('nav');
document.body.prepend(nav);

const BASE_URL = 'https://clairelee-ucsd.github.io/portfolio/';
const ARE_WE_HOME = document.documentElement.classList.contains('home');

for (let p of pages) {
    let url = p.url;
    let title = p.title;

    if (!ARE_WE_HOME && !url.startsWith('http')) {
        url = BASE_URL + url + 'index.html';
    } else if (url && !url.startsWith('http')) {
        url = BASE_URL + url + 'index.html';
    }

    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;

    a.classList.toggle(
        'current',
        a.host === location.host && a.pathname === location.pathname
      );

    if (a.host !== location.host) {
        a.target = "_blank";
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
    localStorage.colorScheme = event.target.value;
  });

  document.documentElement.style.setProperty('color-scheme', event.target.value);