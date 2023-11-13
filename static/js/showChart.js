document.addEventListener("DOMContentLoaded", function () {
    function initChart(chartId, chartUrl) {
        const chart = echarts.init(document.getElementById(chartId));
        $.ajax({
            type: "json",
            method: "GET",
            url: chartUrl,
            success: function (option) {
                chart.setOption(JSON.parse(option));
            }
        });
    }

    // function showBoxPlot(x_data, y_data) {
    //     const option = {
    //         xAxis: {
    //             type: "category",
    //             data: x_data
    //         },
    //         yAxis: {
    //             type: "value",
    //             splitLine: { show: false }
    //         },
    //         series: [{
    //             data: y_data,
    //             type: 'boxplot',
    //
    //         }],
    //         grid: {
    //             bottom: "15%",
    //             top: "10%"
    //         },
    //         tooltip: {
    //             show: true
    //         }
    //     }
    //     return option
    // }
    // $.ajax({
    //     method: "GET",
    //     type: "json",
    //     url: "/charts/chart5",
    //     success: function (resp) {
    //         x_data = resp.x_data
    //         y_data = resp.y_data
    //         const option = showBoxPlot(x_data, y_data)
    //         const chart = echarts.init(document.getElementById("chart5"))
    //         chart.setOption(option)
    //     }
    // })


    initChart("chart1", "/charts/chart1");
    initChart("chart2", "/charts/chart2");
    initChart("chart3", "/charts/chart3");
    initChart("chart4", "/charts/chart4");
});
