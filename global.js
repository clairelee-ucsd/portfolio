export async function fetchJSON(url) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching or parsing JSON data:', error);
    return [];
  }
}

export function renderProjects(projects, containerElement, headingLevel = 'h3') {
  if (!containerElement) return;

  const validHeadings = ['h2', 'h3', 'h4', 'h5', 'h6'];
  const tag = validHeadings.includes(headingLevel) ? headingLevel : 'h3';

  containerElement.innerHTML = '';

  if (!projects?.length) {
    containerElement.innerHTML = '<p class="empty-state">Projects could not be loaded.</p>';
    return;
  }

  projects.forEach((project, index) => {
    const article = document.createElement('article');
    article.className = 'project-card';

    if (project.image) {
      const imageLink = document.createElement(project.link ? 'a' : 'div');
      imageLink.className = 'project-image-link';

      if (project.link) {
        imageLink.href = project.link;
        imageLink.target = '_blank';
        imageLink.rel = 'noopener noreferrer';
        imageLink.setAttribute('aria-label', `Open ${project.title || 'project'}`);
      }

      const image = document.createElement('img');
      image.src = project.image;
      image.alt = project.title ? `${project.title} project preview` : 'Project preview';
      image.loading = 'lazy';

      imageLink.appendChild(image);
      article.appendChild(imageLink);
    }

    const content = document.createElement('div');
    content.className = 'project-content';

    const meta = document.createElement('div');
    meta.className = 'project-meta';

    const number = document.createElement('span');
    number.className = 'project-number';
    number.textContent = String(index + 1).padStart(2, '0');
    meta.appendChild(number);

    if (project.year) {
      const year = document.createElement('span');
      year.className = 'project-year';
      year.textContent = project.year;
      meta.appendChild(year);
    }

    content.appendChild(meta);

    const heading = document.createElement(tag);
    heading.textContent = project.title || 'Untitled project';
    content.appendChild(heading);

    if (project.description) {
      const description = document.createElement('p');
      description.textContent = project.description;
      content.appendChild(description);
    }

    if (project.link) {
      const link = document.createElement('a');
      link.className = 'project-link';
      link.href = project.link;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.innerHTML = 'View project <span aria-hidden="true">↗</span>';
      content.appendChild(link);
    }

    article.appendChild(content);
    containerElement.appendChild(article);
  });
}
