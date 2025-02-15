let data = [];

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

    const xScale = d3
        .scaleTime()
        .domain(d3.extent(commits, (d) => d.datetime))
        .range([0, width])
        .nice();

    const yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);

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

    const dots = svg.append('g').attr('class', 'dots');

    dots
        .selectAll('circle')
        .data(commits)
        .join('circle')
        .attr('cx', (d) => xScale(d.datetime))
        .attr('cy', (d) => yScale(d.hourFrac))
        .attr('r', 5)
        .attr('fill', 'steelblue');
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    createScatterPlot();
});

