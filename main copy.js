// Add your JavaScript code here
const MAX_WIDTH = Math.max(1080, window.innerWidth);
const MAX_HEIGHT = 720;
// const margin = {top: 40, right: 100, bottom: 40, left: 175};
const margin = {top: 40, right: 100, bottom: 40, left: 225};

const DEFAULT_YEAR = 2006;
document.getElementById("year_input").setAttribute("value", DEFAULT_YEAR)

// Assumes the same graph width, height dimensions as the example dashboard. Feel free to change these if you'd like
let graph_1_width = (MAX_WIDTH / 2) - 10, graph_1_height = 250;
// let graph_2_width = (MAX_WIDTH / 2) - 10, graph_2_height = 275;
let graph_2_width = (MAX_WIDTH / 2) - 10, graph_2_height = 325;
let graph_3_width = MAX_WIDTH / 2, graph_3_height = 575;

csv_promise = d3.csv("data/video_games.csv")

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


// GRAPH 2
const PIE_RADIUS = Math.min(graph_2_width, graph_2_height) / 2;

let svg2 = d3.select("#graph2")
    .append("svg")
    .attr("width", graph_2_width)
    .attr("height", graph_2_height)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);
    // .attr("transform", `translate(${margin.left},${graph_1_height-margin.top})`);

let title2 = svg2.append("text")
    .attr("transform", `translate(${(graph_2_width-margin.left-margin.right)/2},0)`)
    .style("text-anchor", "middle")
    .style("font-size", 15)
    .style("font-weight", "bold")

csv_promise.then(function(video_game_data) {
    update_graph2("NA")
});

// region one of {"NA", "EU", "JP", "Other"}
function genre_sales_by_region(data, region) {
    let sales_by_region = d3.nest()
                        .key((v) => v.Genre)
                        .rollup((v) => d3.sum(v, (w) => w.NA_Sales))
                        .entries(data);
    let sales_total = d3.sum(sales_by_region, (v) => v.value);
    let res = {};
    sales_by_region.forEach((x) => res[x.key] = x.value / sales_total);
    return [res, sales_by_region.length];
}

function update_graph2(region) {
    csv_promise.then(function(video_game_data) {
        let region_id = region;
        if (region_id == "North America") {
            region_id = "NA";
        }
        else if (region_id == "Japan") {
            region_id = "JP";
        }
        [data, num_genres] = genre_sales_by_region(video_game_data, region_id);

        let color = d3.scaleOrdinal()
            .domain(data)
            // .range(d3.quantize(d3.interpolateHcl("#66a0e2", "#ff5c7a"), num_genres));
            // .range(d3.quantize(d3.interpolateHcl("#bc5090", "#ffa600"), num_genres));
            .range(d3.quantize(d3.interpolateHcl("#f47a1f", "#00529B"), num_genres));


        let pie = d3.pie().value(function(d) { return d.value; });
        let pie_data = pie(d3.entries(data));

        let arc = d3.arc().innerRadius(0).outerRadius(PIE_RADIUS);

        let pie_slices = svg2.selectAll("mySlices").data(pie_data);

        pie_slices.enter()
            .append("path")
            .attr("d", arc)
            .attr("fill", function(d) { return color(d.data.key); })
            .attr("stroke", "black");

        pie_slices.enter()
            .append("text")
            .text(function(d) { return d.data.key; })
            .attr("transform", function(d) { return `translate(${arc.centroid(d)})`; })
            .style("text-anchor", "middle");

        title2.text("Proportion of Sales in " + region + " by Genre")

        pie_slices.exit().remove();

        // y1.domain(data.map(function(d) { return d.Name; }));
        // yaxis_label1.call(d3.axisLeft(y1).tickSize(0).tickPadding(10));

        // let bars = svg1.selectAll("rect").data(data);
    
        // bars.enter()
        //     .append("rect")
        //     .merge(bars)
        //     .transition()
        //     .duration(1000)
        //     .attr("x", function(d) { return x1(0); })
        //     .attr("y", function(d) { return y1(d.Name); })
        //     .attr("width", function(d) { return x1(d.Global_Sales); })
        //     .attr("height", y1.bandwidth())
        //     .attr("fill", "dodgerblue");
    
        // let sales = sales_ref1.selectAll("text").data(data);
    
        // sales.enter()
        //     .append("text")
        //     .merge(sales)
        //     .attr("x", function(d) { return 8 + x1(d.Global_Sales); })
        //     .attr("y", function(d) { return 12 + y1(d.Name); })
        //     .style("text-anchor", "start")
        //     .style("font-size", "12px")
        //     .text(function(d) { return d.Global_Sales; });
    
    
        // svg1.append("text")
        //     .attr("transform", `translate(${(graph_1_width - margin.left - margin.right)/2},${(graph_1_height - margin.top - margin.bottom) + 30})`)
        //     .style("text-anchor", "middle")
        //     .text("Global Sales (USD Millions)");
    
        // svg1.append("text")
        //     .attr("transform", `translate(-200, ${(graph_1_height - margin.top - margin.bottom) / 2})`)
        //     .style("text-anchor", "middle")   
        //     .text("Title");
    
        // svg1.append("text")
        //     .attr("transform", `translate(${(graph_1_width-margin.left-margin.right)/2},${-20})`)
        //     .style("text-anchor", "middle")
        //     .style("font-size", 15)
        //     .style("font-weight", "bold")
        //     .text("Top Video Games by Sales in " + year);

        // bars.exit().remove();
        // sales.exit().remove();
    });
};
