document.addEventListener("DOMContentLoaded", function () {
    const chart1 = echarts.init(document.getElementById("chart1"))
    $.ajax({
        type: "json",
        method: "GET",
        url: "/charts/chart1",
        success: function (option) {
            chart1.setOption(JSON.parse(option))
        }
    })

    const chart2 = echarts.init(document.getElementById("chart2"))
    $.ajax({
        type: "json",
        method: "GET",
        url: "/charts/chart2",
        success: function (option) {
            chart2.setOption(JSON.parse(option))
        }
    })

})