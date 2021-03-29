let svg1 = d3.select("#graph1")
    .append("svg")
    .attr("width", graph_1_width)
    .attr("height", graph_1_height)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

let sales_ref1 = svg1.append("g");
let yaxis_label1 = svg1.append("g");
let title1 = svg1.append("text")
    .attr("transform", `translate(${(graph_1_width-margin.left-margin.right)/2},${-20})`)
    .style("text-anchor", "middle")
    .style("font-size", 15)
    .style("font-weight", "bold")

svg1.append("text")
    .attr("transform", `translate(${(graph_1_width - margin.left - margin.right)/2},${(graph_1_height - margin.top - margin.bottom) + 30})`)
    .style("text-anchor", "middle")
    .text("Global Sales (USD Millions)");

svg1.append("text")
    .attr("transform", `translate(-200, ${(graph_1_height - margin.top - margin.bottom) / 2})`)
    .style("text-anchor", "middle")   
    .text("Title");

let x1 = d3.scaleLinear().range([0, graph_1_width - margin.left - margin.right]);

let y1 = d3.scaleBand()
    .range([0, graph_1_height - margin.top - margin.bottom])
    .padding(0.1);

csv_promise.then(function(video_game_data) {
    x1.domain([0, d3.max(video_game_data, function(d) { return parseFloat(d.Global_Sales); })]);
    svg1.append("g")
        .attr("transform", `translate(0, ${graph_1_height - margin.top - margin.bottom})`)
        .call(d3.axisBottom(x1));

    update_graph1(DEFAULT_YEAR);
});

function filter_year(data, year) {
    return data.filter(function(d) { return d.Year == year; });
}

function top_ten_sales(data) {
    return data.sort((a,b) => d3.ascending(parseInt(a.Rank), parseInt(b.Rank))).slice(0, 10);
}

function update_graph1(year) {
    csv_promise.then(function(video_game_data) {
        data = top_ten_sales(filter_year(video_game_data, year));

        y1.domain(data.map(function(d) { return d.Name; }));
        yaxis_label1.call(d3.axisLeft(y1).tickSize(0).tickPadding(10));

        let bars = svg1.selectAll("rect").data(data);
    
        bars.enter()
            .append("rect")
            .merge(bars)
            .transition()
            .duration(1000)
            .attr("x", function(d) { return x1(0); })
            .attr("y", function(d) { return y1(d.Name); })
            .attr("width", function(d) { return x1(d.Global_Sales); })
            .attr("height", y1.bandwidth())
            .attr("fill", "dodgerblue");
    
        let sales = sales_ref1.selectAll("text").data(data);
    
        sales.enter()
            .append("text")
            .merge(sales)
            .attr("x", function(d) { return 8 + x1(d.Global_Sales); })
            .attr("y", function(d) { return 12 + y1(d.Name); })
            .style("text-anchor", "start")
            .style("font-size", "12px")
            .text(function(d) { return d.Global_Sales; });
    
        title1.text("Top Video Games by Sales in " + year);

        bars.exit().remove();
        sales.exit().remove();
    });
};