
let publicUrl = "https://geo.datav.aliyun.com/areas_v3/bound/"

function initEcharts(geoJson, name, chart, alladcode, houseData) {
    echarts.registerMap(name, geoJson)
    let option = {
        tooltip: {
            show: true,
            formatter: function (params) {
                var count = params.value;
                if (isNaN(count)) {
                    count = 0;
                }
                return params.name + '<br/>房源数量: ' + count;
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
        series: [{
            name: "房源数量",
            type: "map",
            map: name,
            data: houseData,
            label: {
                show: true
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
            .then(regionGeoJson => initEcharts(regionGeoJson, params.name, chart, alladcode, houseData))
            .catch(err => {
                getGeoJson("330000_full.json").then(
                    chinaGeoJson => initEcharts(chinaGeoJson, "全国", chart, alladcode, houseData)
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
    initEcharts(chinaGeoJson, "全国", chart, alladcode, houseData)
    // console.log(houseData)

}

document.addEventListener("DOMContentLoaded", function () {
    initChart()
})
