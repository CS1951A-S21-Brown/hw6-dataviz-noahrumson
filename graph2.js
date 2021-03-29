const PIE_RADIUS = Math.min(graph_2_width, graph_2_height) / 2;

let svg2 = d3.select("#graph2")
    .append("svg")
    .attr("width", graph_2_width)
    .attr("height", graph_2_height)
    .append("g")
    // .attr("transform", `translate(${margin.left}, ${margin.top})`);
    .attr("transform", `translate(${margin.left},180)`);

let title2 = svg2.append("text")
    .attr("transform", `translate(${(graph_2_width-margin.left-margin.right)/2},-160)`)
    .style("text-anchor", "middle")
    .style("font-size", 15)
    .style("font-weight", "bold")

let tooltip = d3.select("#graph2")     // HINT: div id for div containing scatterplot
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

csv_promise.then(function(video_game_data) {
    update_graph2("NA")
});

// region one of {"NA", "EU", "JP", "Other"}
function genre_sales_by_region(data, region) {
    let colname = region + "_Sales";
    let sales_by_region = d3.nest()
                        .key((v) => v.Genre)
                        .rollup((v) => d3.sum(v, (w) => parseFloat(w[colname])))
                        .entries(data);
    let sales_total = d3.sum(sales_by_region, (v) => v.value);
    let res = {};
    sales_by_region.forEach((x) => res[x.key] = x.value / sales_total);
    return [res, sales_by_region.length];
}

function top_per_genre_in_region(data, region) {
    let colname = region + "_Sales";
    let top_sales = d3.nest()
                    .key((v) => v.Genre)
                    .rollup((v) =>d3.max(v, (w) => parseFloat(w[colname])))
                    .entries(data);
    let top_titles = {};
    top_sales.forEach((x) => top_titles[x.key] = data.filter((v) => v.Genre == x.key && v[colname] == x.value)[0].Name);
    return top_titles;
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
        top_title_per_genre = top_per_genre_in_region(video_game_data, region_id);

        let color = d3.scaleOrdinal()
            .domain(data)
            // .range(d3.quantize(d3.interpolateHcl("#66a0e2", "#ff5c7a"), num_genres));
            // .range(d3.quantize(d3.interpolateHcl("#bc5090", "#ffa600"), num_genres));
            .range(d3.quantize(d3.interpolateHcl("#f47a1f", "#00529B"), num_genres));

        let pie = d3.pie().value(function(d) { return d.value; });
        let pie_data = pie(d3.entries(data));

        let arc = d3.arc().innerRadius(0).outerRadius(PIE_RADIUS);

        let pie_slices = svg2.selectAll("mySlices").data(pie_data);

        let mouseover = function(d) {
            let color_span = `<span style="color: ${color(d.data.key)};">`;
            // let html = `${"Test1"}<br/>
            //         ${color_span}${"Test2"}</span><br/>
            //         Position: ${color_span}${"Test3"}</span>`;       // HINT: Display the song here
            let html = `${color_span}${d.data.key}</span><br/>
                    Percentage: ${(100 * d.data.value).toFixed(1) + "%"}<br/>
                    Best Seller: ${top_title_per_genre[d.data.key]}</span>`;       // HINT: Display the song here
        
            // Show the tooltip and set the position relative to the event X and Y location
            tooltip.html(html)
                .style("left", `${(d3.event.pageX) - 20}px`)
                .style("top", `${(d3.event.pageY) - 30}px`)
                .style("box-shadow", `2px 2px 5px ${color(d.data.key)}`)    // OPTIONAL for students
                .style("background", "white")
                .transition()
                .duration(200)
                // .style("opacity", 0.9)
                .style("opacity", 1.0)
        };
        
        let mouseout = function(d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", 0);
        };

        pie_slices.enter()
            .append("path")
            .attr("d", arc)
            .attr("fill", function(d) { return color(d.data.key); })
            .attr("stroke", "black")
            .on("mouseover", mouseover)
            .on("mouseout", mouseout);

        pie_slices.enter()
            .append("text")
            .text(function(d) { return d.data.key; })
            .attr("transform", function(d) { return `translate(${arc.centroid(d)})`; })
            .style("text-anchor", "middle");

        title2.text("Proportion of Sales in " + region + " by Genre")

        pie_slices.exit().remove();
    });
};