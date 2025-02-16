let data = [];
let xScale;
let yScale;

async function loadData() {
    data = await d3.csv('loc.csv', (row) => ({
        ...row,
        line: Number(row.line), // or just +row.line
        depth: Number(row.depth),
        length: Number(row.length),
        date: new Date(row.date + 'T00:00' + row.timezone),
        datetime: new Date(row.datetime),
    }));

    displayStats();

}

let commits = d3.groups(data, (d) => d.commit);

function processCommits() {
    commits = d3
        .groups(data, (d) => d.commit)
        .map(([commit, lines]) => {
            let first = lines[0];
            let { author, date, time, timezone, datetime } = first;
            let ret = {
                id: commit,
                url: 'https://github.com/vis-society/lab-7/commit/' + commit,
                author,
                date,
                time,
                timezone,
                datetime,
                hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
                totalLines: lines.length,
            };

            Object.defineProperty(ret, 'lines', {
                value: lines,
                configurable: false,
                writable: false,
                enumerable: false

                // What other options do we need to set?
                // Hint: look up configurable, writable, and enumerable
            });

            return ret;
        });
}

function displayStats() {
    // Process commits first
    processCommits();

    // Create the dl element
    const dl = d3.select('#stats').append('dl').attr('class', 'stats');

    // Add total LOC
    dl.append('dt').html('Total LOC');
    dl.append('dd').text(data.length);

    // Add total commits
    dl.append('dt').text('Total Commits');
    dl.append('dd').text(commits.length);

    const totalLength = data.reduce((sum, row) => sum + row.length, 0);
    const avgLength = totalLength / data.length;

    // Add more stats as needed...
    const uniqueFiles = new Set(data.map(row => row.file));

    dl.append('dt').html('Files');
    dl.append('dd').text(uniqueFiles.size);

    dl.append('dt').html('Avg. File Length (Lines)');
    dl.append('dd').text(avgLength.toFixed(2));

    const longestLine = data.reduce((max, row) => (row.length > max.length ? row : max), data[0]);

    dl.append('dt').html('Longest Line');
    dl.append('dd').text(longestLine.length);

    function categorizeTimeOfDay(datetime) {
        const hour = datetime.getHours();

        // Define time categories
        if (hour >= 6 && hour < 12) {
            return 'Morning';
        } else if (hour >= 12 && hour < 17) {
            return 'Afternoon';
        } else if (hour >= 17 && hour < 22) {
            return 'Evening'
        } else {
            return 'Night';
        }
    }

    function findMostProductiveTime() {
        // Count the number of commits in each time of day category
        const timeCounts = {
            Morning: 0,
            Afternoon: 0,
            Evening: 0,
            Night: 0
        };

        data.forEach(row => {
            const timeOfDay = categorizeTimeOfDay(row.datetime);
            timeCounts[timeOfDay]++;
        });

        // Find the time of day with the most work
        const maxTimeOfDay = Object.keys(timeCounts).reduce((a, b) => timeCounts[a] > timeCounts[b] ? a : b);

        return maxTimeOfDay;
    }

    dl.append('dt').html('Work is Most Done');
    dl.append('dd').text(findMostProductiveTime());

}

function createScatterPlot() {
    const width = 1000;
    const height = 600;
    const margin = { top: 10, right: 10, bottom: 30, left: 20 };

    const svg = d3
        .select('#chart')
        .append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .style('overflow', 'visible');

    xScale = d3
        .scaleTime()
        .domain(d3.extent(commits, (d) => d.datetime))
        .range([0, width])
        .nice();

    yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);

    const usableArea = {
        top: margin.top,
        right: width - margin.right,
        bottom: height - margin.bottom,
        left: margin.left,
        width: width - margin.left - margin.right,
        height: height - margin.top - margin.bottom,
    };

    // Update scales with new ranges
    xScale.range([usableArea.left, usableArea.right]);
    yScale.range([usableArea.bottom, usableArea.top]);

    // Add gridlines BEFORE the axes
    const gridlines = svg
        .append('g')
        .attr('class', 'gridlines')
        .attr('transform', `translate(${usableArea.left}, 0)`);

    // Create gridlines as an axis with no labels and full-width ticks
    gridlines
        .call(d3.axisLeft(yScale)
            .tickFormat('')
            .tickSize(-usableArea.width));

    // Create the axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3
        .axisLeft(yScale)
        .tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');

    // Add X axis
    svg
        .append('g')
        .attr('transform', `translate(0, ${usableArea.bottom})`)
        .call(xAxis);

    // Add Y axis
    svg
        .append('g')
        .attr('transform', `translate(${usableArea.left}, 0)`)
        .call(yAxis);

    const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
    const rScale = d3
        .scaleSqrt()
        .domain([minLines, maxLines])
        .range([10, 30]); // adjust these values based on your experimentation

    const sortedCommits = d3.sort(commits, (d) => -d.totalLines);

    const dots = svg.append('g').attr('class', 'dots');

    dots
        .selectAll('circle')
        .data(sortedCommits)
        .join('circle')
        .attr('cx', (d) => xScale(d.datetime))
        .attr('cy', (d) => yScale(d.hourFrac))
        .attr('r', (d) => rScale(d.totalLines))
        .attr('fill', 'steelblue')
        .style('fill-opacity', 0.7) // Add transparency for overlapping dots
        //added commit to mouseenter
        .on('mouseenter', function (event, commit, d, i) {
            d3.select(event.currentTarget).style('fill-opacity', 1); // Full opacity on hover
            updateTooltipContent(commit);
            updateTooltipVisibility(true);
            updateTooltipPosition(event);
        })
        // added event to mouseleave
        .on('mouseleave', function (event) {
            d3.select(event.currentTarget).style('fill-opacity', 0.7); // Restore transparency
            updateTooltipContent({}); // Clear tooltip content
            updateTooltipVisibility(false);
        });

    brushSelector();
}

function updateTooltipVisibility(isVisible) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.hidden = !isVisible;
}

function updateTooltipContent(commit) {
    const link = document.getElementById('commit-link');
    const date = document.getElementById('commit-date');
    const time = document.getElementById('commit-time');
    const author = document.getElementById('commit-author');
    const edited = document.getElementById('commit-lines');

    if (Object.keys(commit).length === 0) return;

    link.href = commit.url;
    link.textContent = commit.id;
    date.textContent = commit.datetime?.toLocaleString('en', {
        dateStyle: 'full',
    });
    time.textContent = commit.time;
    author.textContent = commit.author;
    edited.textContent = commit.lines.length;
}

function updateTooltipPosition(event) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.style.left = `${event.clientX}px`;
    tooltip.style.top = `${event.clientY}px`;
}

function brushSelector() {
    const svg = document.querySelector('svg');
    // Create brush
    d3.select(svg).call(d3.brush());

    // Raise dots and everything after overlay
    d3.select(svg).selectAll('.dots, .overlay ~ *').raise();

    // Update brush initialization to listen for events
    d3.select(svg).call(d3.brush().on('start brush end', brushed));
}

let brushSelection = null;

function isCommitSelected(commit) {
    if (!brushSelection) {
        return false;
    }

    const min = { x: brushSelection[0][0], y: brushSelection[0][1] };
    const max = { x: brushSelection[1][0], y: brushSelection[1][1] };
    const x = xScale(commit.date); const y = yScale(commit.hourFrac);

    return x >= min.x && x <= max.x && y >= min.y && y <= max.y;
}

function updateSelection() {
    // Update visual state of dots based on selection
    d3.selectAll('circle').classed('selected', (d) => isCommitSelected(d));
}

function updateSelectionCount() {
    const selectedCommits = brushSelection
        ? commits.filter(isCommitSelected)
        : [];

    const countElement = document.getElementById('selection-count');
    countElement.textContent = `${selectedCommits.length || 'No'
        } commits selected`;

    return selectedCommits;
}

function updateLanguageBreakdown() {
    const selectedCommits = brushSelection
        ? commits.filter(isCommitSelected)
        : [];
    const container = document.getElementById('language-breakdown');

    if (selectedCommits.length === 0) {
        container.innerHTML = '';
        return;
    }
    const requiredCommits = selectedCommits.length ? selectedCommits : commits;
    const lines = requiredCommits.flatMap((d) => d.lines);

    // Use d3.rollup to count lines per language
    const breakdown = d3.rollup(
        lines,
        (v) => v.length,
        (d) => d.type
    );

    // Update DOM with breakdown
    container.innerHTML = '';

    for (const [language, count] of breakdown) {
        const proportion = count / lines.length;
        const formatted = d3.format('.1~%')(proportion);

        container.innerHTML += `
            <dt>${language}</dt>
            <dd>${count} lines (${formatted})</dd>
        `;
    }

    return breakdown;
}

function brushed(event) {
    brushSelection = event.selection;
    updateSelectionCount();
    updateSelection();
    updateLanguageBreakdown();
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    createScatterPlot();
});

