function top_median_sales(data) {
    let median_sales = d3.nest()
        .key((x) => x.Genre)
        .key((x) => x.Publisher)
        .rollup((x) => [d3.median(x, (y) => parseFloat(y.Global_Sales)), x.length])
        .entries(data);
    let filtered_by_count = median_sales.map((d) => [d.key, d.values.filter((x) => x.value[1] >= 5)]);
    let max_median_per_genre = filtered_by_count.map((d) => [d[0], d3.max(d[1], (x) => x.value[0])]);
    let filtered_table = {}
    filtered_by_count.forEach((x) => filtered_table[x[0]] = x[1]);
    let best_publisher_per_genre = max_median_per_genre.map(
        (x) => [x[0], filtered_table[x[0]].filter((v) => v.value[0] == x[1])[0]]);
    res = []
    best_publisher_per_genre.forEach((x) => res.push({"Genre" : x[0], "Publisher" : x[1].key, "Median" : x[1].value[0]}));
    return res;
}

// const TOP_K = 3;

// function top_k_median_sales(data, k) {
//     let median_sales = d3.nest()
//         .key((x) => x.Genre)
//         .key((x) => x.Publisher)
//         .rollup((x) => [d3.median(x, (y) => parseFloat(y.Global_Sales)), x.length])
//         .entries(data);
//     let filtered_by_count = median_sales.map((d) => [d.key, d.values.filter((x) => x.value[1] >= 5)]);
//     filtered_by_count.forEach((d) => d[1].sort((x, y) => y.value[0] - x.value[0]));
//     let top_k_per_genre = filtered_by_count.map((d) => [d[0], d[1].slice(0, k)]);
//     console.log(top_k_per_genre)
//     return top_k_per_genre
// }

let svg = d3.select("#graph3")
    .append("svg")
    .attr("width", graph_3_width)
    .attr("height", graph_3_height)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

svg.append("text")
    .attr("transform", `translate(${(graph_3_width-margin.left-margin.right)/2},${-20})`)
    .style("text-anchor", "middle")
    .style("font-size", 15)
    .style("font-weight", "bold")
    .text("Top Publisher per Genre (with at least 5 titles)")

svg.append("text")
    .attr("transform", `translate(${(graph_3_width - margin.left - margin.right)/2},${(graph_3_height - margin.top - margin.bottom) + 40})`)
    .style("text-anchor", "middle")
    .text("Median Global Sales (USD Millions)");

svg.append("text")
    .attr("transform", `translate(-100, ${(graph_3_height - margin.top - margin.bottom) / 2})`)
    .style("text-anchor", "middle")   
    .text("Genre");


csv_promise.then(function(video_game_data) {
    let data = top_median_sales(video_game_data);

    let x = d3.scaleLinear()
        // .domain([0, d3.max(top_k_publishers, function(d) { return d3.max(d[1], (x) => x.value[0]); })])
        .domain([0, d3.max(data, (v) => v.Median)])
        .range([0, graph_3_width - margin.left - margin.right]);

    let y = d3.scaleBand()
        .domain(data.map((v) => v.Genre))
        .range([0, graph_3_height - margin.top - margin.bottom])
        .padding(0.2);

    svg.append("g")
        .call(d3.axisLeft(y).tickSize(0).tickPadding(10));

    svg.append("g")
        .attr("transform", `translate(0, ${graph_3_height - margin.top - margin.bottom})`)
        .call(d3.axisBottom(x));

    svg.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .transition()
        .duration(1000)
        .attr("x", function(d) { return x(0); })
        .attr("y", function(d) { return y(d.Genre); })
        .attr("width", function(d) { return x(d.Median); })
        .attr("height", y.bandwidth())
        .attr("fill", "dodgerblue");

    let pubtext = svg.append("g");
    pubtext.selectAll("text")
        .data(data)
        .enter()
        .append("text")
        .attr("x", function(d) { return 8 + x(d.Median); })
        .attr("y", function(d) { return 18 + y(d.Genre); })
        .style("text-anchor", "start")
        .style("font-size", "12px")
        .text(function(d) { return d.Publisher; });

});