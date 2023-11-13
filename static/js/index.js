let publicUrl = "https://geo.datav.aliyun.com/areas_v3/bound/"

function initEcharts(geoJson, name, chart, alladcode, houseData, avgPriceData) {
    // geoJson: 城市地理数据
    // name: 地图名称
    // chart: echarts实例

    echarts.registerMap(name, geoJson)
    let option = {
        tooltip: {
            formatter: function (params) {
                return `<span style="font-weight:bold; color:#000; font-size:16px;">${params.name}</span>
                <br>
                <span style="font-weight:bold; font-size:14px;">${params.seriesName}:</span>&nbsp;<span style="font-weight:bold; font-size:14px; color: #53c1ed">${params.data.value}</span>
                <br>
                <span style="font-weight:bold; font-size:14px;">平均租金:</span>&nbsp;<span style="font-weight:bold; font-size:14px; color: #53c1ed">${params.value.toFixed(2)}</span>`
            }
        },
        visualMap: {
            min: 0,
            max: 30000,
            show: false,
            inRange: {
                color: ['lightskyblue', 'yellow', 'orangered']
            }
        },
        series: [
            {
                name: "房源数量",
                type: "map",
                map: name,
                data: houseData,
                label: {
                    show: true
                },
                tooltip: {
                    // formatter: params => {
                    //     console.log("houseData: ", params)
                    //     return `${params.seriesName}: ${params.data.value}`
                    // }
                }
            },
            {
                name: "平均租金",
                type: "map",
                map: name,
                data: avgPriceData,
                label: { show: true },
                tooltip: {
                    // formatter: params => {
                    //     console.log("avgPriceData: ", params)
                    //     return `平均租金: ${params.value}`
                    // }
                }
            }],
    }
    chart.setOption(option)
    // 解绑click事件
    chart.off("click")
    // 给地图添加点击事件
    chart.on("click", params => {
        let clickRegionCode = alladcode.filter(areaJson => areaJson.name === params.name)[0].adcode
        getGeoJson(clickRegionCode + "_full.json")
            .then(regionGeoJson => initEcharts(regionGeoJson, params.name, chart, alladcode, houseData, avgPriceData))
            .catch(err => {
                getGeoJson("330000_full.json").then(
                    chinaGeoJson => initEcharts(chinaGeoJson, "全国", chart, alladcode, houseData, avgPriceData)
                )
            })
    })
}

// 获取地图json数据
async function getGeoJson(jsonName) {
    return await $.get(publicUrl + jsonName)
}

// 实现地图下钻
async function initChart() {
    let chart = echarts.init(document.getElementById("main"))
    let alladcode = await getGeoJson("all.json")
    let chinaGeoJson = await getGeoJson("330000_full.json")
    initEcharts(chinaGeoJson, "全国", chart, alladcode, houseData, avgPriceData)

}

document.addEventListener("DOMContentLoaded", function () {
    initChart()
})
