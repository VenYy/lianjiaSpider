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
                <span style="font-weight:bold; font-size:14px;">平均租金:</span>&nbsp;<span style="font-weight:bold; font-size:14px; color: #53c1ed">${params.value.toFixed(2)}</span>元/月`
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
            },
            {
                name: "平均租金",
                type: "map",
                map: name,
                data: avgPriceData,
                label: {show: true},
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

// 页面加载完成后执行
document.addEventListener("DOMContentLoaded", function () {
    initChart()
    getCityNameById()
        .then((data) => {
            // 处理异步操作成功的结果
            // console.log(data);
            var city = data.city
            geocoding(city)
                .then((data) => {
                    // console.log(data)
                    const adcode = data.geocodes[0].adcode
                    getWeather(adcode)
                        .then((data) => {
                            // console.log(data)
                            const currentCity = data.lives[0].city
                            const temperature = data.lives[0].temperature
                            const weather = data.lives[0].weather
                            const windDirection = data.lives[0].winddirection
                            const windPower = data.lives[0].windpower
                            const humidity = data.lives[0].humidity
                            const weatherDom = document.getElementById("weatherInfo")

                            $("#city").text(currentCity)
                            $("#temperature").text(temperature + "℃")
                            $("#weather .weatherkey").text(weather)
                            $("#weather img").attr('src', getIcon(weather))

                            $("#windpower").text("风速: " + windPower + "级")
                            $("#winddirection").text("风向: " + windDirection)
                            $("#humidity").text("湿度: " + humidity + "%")

                        })
                })
        })
        .catch((error) => {
            // 处理异步操作失败的情况
            console.error(error);
        });
})

// 获取当前城市的天气信息
function getWeather(adcode) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `https://restapi.amap.com/v3/weather/weatherInfo?city=${adcode}&key=${apiKey}`,
            type: "get",
            dataType: "jsonp",
            jsonp: "callback",
            success: function (data) {
                if (data.status === "1") {
                    resolve(data)
                } else {
                    reject(data.info)
                }
            }, error: function (xhr, status, error) {
                reject(new Error(error))
            }
        })
    })

}

// 使用高德地图api完成当前ip城市定位
function getCityNameById() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `https://restapi.amap.com/v3/ip?key=${apiKey}`,
            type: "get",
            dataType: "jsonp",
            jsonp: "callback",
            success: function (data) {
                if (data.status === "1") {
                    resolve(data); // 异步操作成功，传递数据给resolve函数
                } else {
                    reject(data.info); // 异步操作失败，传递错误信息给reject函数
                }
            },
            error: function (xhr, status, error) {
                reject(new Error(error)); // 异步操作发生错误，传递错误信息给reject函数
            },
        });
    });
}

// 获取城市编码adcode
function geocoding(cityName) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `https://restapi.amap.com/v3/geocode/geo?address=${cityName}&key=${apiKey}`,
            type: "get",
            dataType: "jsonp",
            jsonp: "callback",
            success: function (data) {
                if (data.status === "1") {
                    resolve(data); // 异步操作成功，传递数据给resolve函数
                } else {
                    reject(data.info); // 异步操作失败，传递错误信息给reject函数
                }
            }
        })
    })
}

/**
 * 根据天气现象返回其图标icon url
 * @param {String} weather 天气现象
 * @returns 天气现象对应的某一类的url
 */
function getIcon(weather) {
    // 这个是icon的默认值
    let url = "static/image/晴.png"

    const iconWeatherMap = {
        '风': ['有风', '平静', '微风', '和风', '清风', '强风/劲风', '疾风', '大风', '烈风', '风暴', '狂爆风', '飓风', '热带风暴', '龙卷风'],
        '多云': ['少云', '晴间多云', '多云'],
        '雪': ['雪', '阵雪', '小雪', '中雪', '大雪', '暴雪', '小雪-中雪', '中雪-大雪', '大雪-暴雪', '冷'],
        '雾': ['浮尘', '扬沙', '沙尘暴', '强沙尘暴', '雾', '浓雾', '强浓雾', '轻雾', '大雾', '特强浓雾'],
        '晴': ['晴', '热'],
        '雨夹雪': ['雨雪天气', '雨夹雪', '阵雨夹雪'],
        '雨': ['阵雨', '雷阵雨', '雷阵雨并伴有冰雹', '小雨', '中雨', '大雨', '暴雨', '大暴雨', '特大暴雨', '强阵雨', '强雷阵雨', '极端降雨', '毛毛雨/细雨', '雨', '小雨-中雨', '中雨-大雨', '大雨-暴雨', '暴雨-大暴雨', '大暴雨-特大暴雨', '冻雨'],
        '阴': ['阴', '霾', '中度霾', '重度霾', '严重霾', '未知']
    }

    for (const weatherKey in iconWeatherMap) {
        if (Object.hasOwnProperty.call(iconWeatherMap, weatherKey)) {
            const weatherNames = iconWeatherMap[weatherKey]
            const findWeatherItem = weatherNames.find(name => weather === name)

            // 如果找了某一类的图标了，那重新赋值url
            if (findWeatherItem) {
                // 这里的weatherKey和icon的名字一一对应了
                url = `static/image/${weatherKey}.png`
                // console.debug('@find weather key = ', weatherKey)
                break
            }
        }
    }

    return url
}
