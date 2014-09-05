(function (d3) {
  d3.json('analytics.json', function (stats) {
    stats.aggregated_values = JSON.parse(stats.aggregated_values);

    var parseDate = d3.time.format('%Y-%m-%d');
    stats.users_by_day.forEach(function (d) { d.date = parseDate.parse(d.date); });
    stats.users_by_day.sort(function (a, b) { return d3.ascending(a.date, b.date); });
    stats.users_by_day.splice(0, 8);

    stats.reviews_by_day.forEach(function (d) { d.date = parseDate.parse(d.date); });
    stats.reviews_by_day.sort(function (a, b) { return d3.ascending(a.date, b.date); });
    stats.reviews_by_day.splice(0, 5);

    lineChart('#users', stats.users_by_day, 'orange');
    lineChart('#reviews', stats.reviews_by_day, 'steelblue');
  });
})(d3);

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