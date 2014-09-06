d3.json('data/analytics.json', function (stats) {
  stats.aggregated_values = JSON.parse(stats.aggregated_values);

  var parseDate = d3.time.format('%Y-%m-%d');
  stats.users_by_day.forEach(function (d) { d.date = parseDate.parse(d.date); });
  stats.users_by_day.sort(function (a, b) { return d3.ascending(a.date, b.date); });
  stats.users_by_day.splice(0, 8);

  stats.reviews_by_day.forEach(function (d) { d.date = parseDate.parse(d.date); });
  stats.reviews_by_day.sort(function (a, b) { return d3.ascending(a.date, b.date); });
  stats.reviews_by_day.splice(0, 5);

  lineChart('#users', stats.users_by_day, 'orange');
  lineChart('#reviews', stats.reviews_by_day, 'lightskyblue');
});

function lineChart (section, stats, color) {
  var margin = {top: 20, right: 20, bottom: 50, left: $(section).width() / 20},
      height = $(section).height() - $(section + ' h1').outerHeight(true) - margin.top - margin.bottom,
      width = $(section).width() - margin.left - margin.right;

  var x = d3.time.scale()
      .domain(d3.extent(stats, function(d) { return d.date; }))
      .range([0, width]);

  var y = d3.scale.linear()
      .domain(d3.extent(stats, function(d) { return d.count; }))
      .range([height, 0]);

  var line = d3.svg.line()
      .x(function (d) { return x(d.date); })
      .y(function (d) { return y(d.count); });

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient('bottom')
      .tickFormat(d3.time.format('%b %e, %Y'))
      .ticks(5);

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient('left')
      .tickSize(-width);

  var svg = d3.select(section + ' svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
    .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(xAxis);

  svg.append('path')
      .datum(stats)
      .attr('d', line)
      .style('stroke', color)
      .style('stroke-width', '.2em')
      .style('stroke-linecap', 'round')
      .style('fill', 'none');

  svg.append('g')
      .attr('class', 'y axis')
      .style('fill', 'none')
      .call(yAxis);

  svg.append('text')
      .attr('dx', '1em')
      .attr('dy', '.5em')
      .attr('transform', 'translate(' + x(stats[8].date) + ',' + y(stats[8].count) + ')')
      .style('fill', '#fff')
      .style('font-size', '.7em')
      .text('MiddBeat Article');

  svg.append('text')
      .attr('dx', '1em')
      .attr('dy', '.5em')
      .attr('transform', 'translate(' + x(stats[18].date) + ',' + y(stats[18].count) + ')')
      .style('fill', '#fff')
      .style('font-size', '.7em')
      .text('All Student Email');
}

d3.json('data/hours.json', function (stats) {
  var margin = {top: 20, right: 20, bottom: 70, left: $('#hours').width() / 20 + 20},
      height = $('#hours').height() - $('#hours h1').outerHeight(true) - margin.top - margin.bottom,
      width = $('#hours').width() - margin.left - margin.right;

  var data = d3.entries(d3.range(13)).map(function (h) {
    if (stats.hasOwnProperty(h.key))
      return {key: +h.key, value: stats[h.key]};

    return {key: +h.key, value: 0};
  });

  var x = d3.scale.linear()
      .domain(d3.extent(data, function (d) { return d.key; }))
      .range([width / data.length / 2, width - width / data.length / 2]);

  var y = d3.scale.linear()
      .domain([0, d3.max(data, function (d) { return d.value; })])
      .range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient('bottom');

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient('left')
      .ticks(5);

  var svg = d3.select('#hours svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
    .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(xAxis)
    .append('text')
      .attr('y', '2.5em')
      .text('hours per week');

  svg.append('g')
      .attr('class', 'y axis')
      .call(yAxis)
    .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('dy', '-3em')
      .style('text-anchor', 'end')
      .text('votes');

  svg.append('g')
      .attr('class', 'y gridlines')
      .call(yAxis.tickFormat('').tickSize(-width, 0, 0));

  svg.selectAll('rect')
      .data(data)
    .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', function (d) { return (x(d.key) - width / data.length / 2) + 9; })
      .attr('y', function (d) { return y(d.value)})
      .attr('width', (width / data.length) - 10)
      .attr('height', function (d) { return height - y(d.value)})
      .style('fill', 'lightskyblue');

  var avgHours = d3.sum(d3.entries(stats), function(d) {
    return +d.key * d.value;
  }) / d3.sum(d3.entries(stats), function (d) { return d.value});

  var avgTextFits = true;

  var avg = svg.append('g')
      .datum(d3.round(avgHours, 1))
      .attr('class', 'avg')
      .attr('transform', function (d) {
        return 'translate(' + x(d) + ',0)';
      });
  avg
    .append('path')
      .attr('stroke-dasharray', '5,5')
      .attr('d', 'M0,-10L0,' + height);
  avg
    .append('text')
      .text(function (d) { return 'Average: ' + d + ' hours'; })
      .datum(function (d) {
        avgTextFits = this.getBBox().width < (width - x(d) - 3);
        return d;
      })
      .attr('dx', function () {
        if (avgTextFits) return 3;
        return -3;
      })
      .style('text-anchor', function () {
        if (avgTextFits) return 'beginning';
        return 'end';
      });
});

d3.json('data/components.json', function (stats) {
  var margin = {top: 20, right: 20, bottom: 90, left: $('#components').width() / 50},
      height = $('#components').height() - $('#components h1').outerHeight(true) - margin.top - margin.bottom,
      barHeight = height / 11,
      width = $('#components').width() - margin.left - margin.right

  stats = d3.entries(stats);

  var x = d3.scale.linear()
      .domain([0, d3.max(stats, function (d) { return d.value; })])
      .range([0, width]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .tickSize(-height, 0, 0)
      .orient('bottom');

  var svg = d3.select('#components svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
    .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  svg.append('g')
      .attr('class', 'x axis gridlines')
      .attr('transform', 'translate(0,' + height + ')')
      .call(xAxis)
    .append('text')
      .attr('dy', 40)
      .text('votes');

  var bar = svg.selectAll('.bar')
      .data(stats)
    .enter().append('g')
      .attr('class', 'bar')
      .sort(function (a, b) { return d3.descending(a.value, b.value); })
      .attr('class', 'bar')
      .attr('transform', function (d, i) { return 'translate(0,' + i * barHeight + ')'});

  bar.append('rect')
      .attr('width', function (d) { return x(d.value); })
      .attr('height', barHeight - 3)
      .style('fill', 'lightskyblue');

  bar.append('text')
      .attr('y', barHeight / 2 - 1)
      .attr('dy', '.35em')
      .text(function (d) { return '' + d.key; })
      .datum(function (d, i) {
        if (i < 10)
          d.textFits = true;
        else d.textFits = false;
        return d;
      })
      .style('text-anchor', function (d) {
        return d.textFits ? 'end' : 'beginning';
      })
      .attr('x', function (d) {
        return d.textFits ? x(d.value) - 10 : x(d.value) + 10;
      })
      .style('fill', function (d) { return d.textFits ? '#000' : '#fff'; })
      .style('font-size', '.7em')
});

d3.json('data/quota_stats.json', function (stats) {
  var margin = {top: 20, right: 20, bottom: 70, left: $('#quota').width() / 20 + 20},
      height = $('#quota').height() - $('#quota h1').outerHeight(true) - margin.top - margin.bottom,
      width = $('#quota').width() - margin.left - margin.right;

  var x = d3.scale.ordinal()
      .domain(stats.map(function (d) { return d.reviews; }))
      .rangeRoundBands([0, width], .1);

  var y = d3.scale.linear()
      .domain([0, d3.max(stats, function (d) { return d.users; })])
      .range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient('bottom');

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient('left');

  var svg = d3.select('#quota svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
    .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  svg.append('g')
      .attr('class', 'y axis')
      .call(yAxis)
    .append('text')
      .attr('x', -height / 2)
      .attr('y', '-3em')
      .attr('transform', 'rotate(-90)')
      .style('text-anchor', 'middle')
      .text('users');

  svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(xAxis)
    .append('text')
      .attr('x', width / 2)
      .attr('y', '2.5em')
      .style('text-anchor', 'middle')
      .text('reviews');

  var bar = svg.selectAll('.bar')
      .data(stats)
    .enter().append('g')
      .attr('class', 'bar')
      .attr('transform', function (d) { return 'translate(' + x(d.reviews) + ',0)'; });

  bar.append('rect')
      .attr('y', function (d) { return y(d.users); })
      .attr('height', function (d) { return height - y(d.users); })
      .attr('width', x.rangeBand())
      .style('fill', function (d) {
        if (d.reviews > 2) return 'orange';
        return 'lightskyblue';
      });

  bar.append('text')
      .attr('x', x.rangeBand() / 2)
      .attr('y', function (d) { return y(d.users); })
      .attr('dy', function (d) {
        if (d.reviews === 0 || d.reviews === 2) return '1.2em';
        return '-.6em';
      })
      .style('text-anchor', 'middle')
      .style('font-size', '.7em')
      .style('fill', function (d) {
        if (d.reviews === 0 || d.reviews === 2) return '#000';
        return '#fff';
      })
      .text(function (d) {
        return d.users;
      });
});

d3.json('data/courses_code_stats.json', function (stats) {
  stats.forEach(function (d) {
    d.level = +(d.prof_course__course__code.replace(/^\D+/g, '')[0]);
  });

  var aggregated = d3.nest()
      .key(function (d) { return d.level; })
      .rollup(function (leaves) { return d3.sum(leaves, function (d) { return d.count; }) })
      .entries(stats)
      .sort(function (a, b) { return d3.ascending(+a.key, +b.key) })
      .map(function (d) { return {level: +d.key, count: d.values} });

  var margin = {top: 20, right: 20, bottom: 50, left: $('#level').width() / 20},
      height = $('#level').height() - $('#level h1').outerHeight(true) - margin.top - margin.bottom,
      width = $('#level').width() - margin.left - margin.right;

  var x = d3.scale.ordinal()
      .domain(aggregated.map(function(d) { return d.level; }))
      .rangeRoundBands([0, width], .1);

  var y = d3.scale.linear()
      .domain([0, d3.max(aggregated, function (d) { return d.count; })])
      .range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient('bottom')
      .tickFormat(function (d) { return d + 'xx'});

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient('left');

  var svg = d3.select('#level svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
    .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  svg.append('g')
      .attr('class', 'y axis')
      .call(yAxis);

  svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(xAxis);

  var bar = svg.selectAll('.bar')
      .data(aggregated)
    .enter().append('g')
      .attr('class', 'bar')
      .attr('transform', function (d) { return 'translate(' + x(d.level) + ',0)'; });

  bar.append('rect')
      .attr('y', function (d) { return y(d.count); })
      .attr('height', function (d) { return height - y(d.count); })
      .attr('width', x.rangeBand())
      .style('fill', 'lightskyblue');

  bar.append('text')
      .attr('x', x.rangeBand() / 2)
      .attr('y', function (d) { return y(d.count); })
      .attr('dy', function (d) {
        if (d.level < 4) return '1.2em';
        return '-.6em';
      })
      .style('text-anchor', 'middle')
      .style('font-size', '.7em')
      .style('fill', function (d) {
        if (d.level < 4) return '#000';
        return '#fff';
      })
      .text(function (d) {
        if (d.count === 1) return d.count + ' review';
        return d.count + ' reviews';
      });
});
