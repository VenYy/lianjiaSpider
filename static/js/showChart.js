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

    initChart("chart1", "/charts/chart1");
    initChart("chart2", "/charts/chart2");
    initChart("chart3", "/charts/chart3");
    initChart("chart4", "/charts/chart4");
});
