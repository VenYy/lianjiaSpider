function show_pie(title, data) {
    return {
        title: {
            show: false
        },

        series: {
            name: "房源数量",
            type: "pie",
            radius: (data.length > 8) ? "85%" : "65%",
            center: ['50%', '50%'],
            selectedMode: 'single',
            data: data,
            label: {
                position: (data.length > 8) ? "inside" : "outside",
            },
            emphasis: {
                itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        },
        tooltip: {show: true},
        grid: {
            top: 40,
            bottom: 10
        }
    }
}

function show_scatter(title, data) {
    return {
        xAxis: {
            name: "面积(㎡)",
            splitLine: {show: false}
        },
        yAxis: {
            splitLine: {show: false}
        },
        series: [
            {
                name: "面积",
                symbolSize: 10,
                type: "scatter",
                data: data,
                itemStyle: {
                    opacity: 0.8,
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowOffsetY: 0,
                    shadowColor: 'rgba(0,0,0,0.2)'
                }
            }
        ],
        grid: {
            bottom: "10%",
            left: "10%",
            top: "5%",
            right: "15%"
        },
        tooltip: {
            show: true,
            formatter: function (param) {
                const value = param.value
                return `面积: <span style="font-size: 16px; color: #5c7bd9; font-weight:bold;">${value[0]}</span>㎡</br>
                        租金: <span style="font-size: 16px; color: #5c7bd9; font-weight:bold;">${value[1]}</span>元/月`
            }
        }
    }
}

function show_bar(title, x_data, y_data) {
    return {
        xAxis: {
            type: "category",
            data: x_data,
            axisLabel: {
                show: true,
                fontSize: 11,
                rotate: 15,
                margin: 15,
                align: "center",
            }
        },
        yAxis: {
            type: "value"
        },
        series: [
            {
                name: "平均租金",
                type: "bar",
                data: y_data,
                barMaxWidth: 30,
                itemStyle: {
                    borderRadius: [5, 5, 0, 0],
                    // 渐变色
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        {offset: 0, color: '#83bff6'},
                        {offset: 0.5, color: '#188df0'},
                        {offset: 1, color: '#18f080'}
                    ])
                },
                emphasis: {
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            {offset: 1, color: '#18f080'},
                            {offset: 0.7, color: '#2378f7'},
                            {offset: 1, color: '#83bff6'}
                        ])
                    }
                },
            }
        ],
        grid: {
            bottom: "15%",
            top: "5%"
        },
        tooltip: {
            show: true,
            formatter: function (param) {
                return `<span style="color: #0f0f0f; font-weight:bold; font-size: 16px">${param.name}</span>
                        </br>
                        <span style="font-size: 14px">${param.seriesName}:</span>
                        <span style="font-size: 14px; color: #5c7bd9; font-weight:bold;">${param.value.toFixed(2)}</span>元/月`
            }
        }
    }
}


function getVillageInfo() {
    const city = $("#city_select").val()
    const district = $("#district_select").val()
    const village_name = $("#village_select").val()

    if (village_name === "") {
        alert("请选择小区名称！")
    }

    // console.log(city, district, village_name)

    const chart1 = echarts.init(document.getElementById("chart1"))
    const chart2 = echarts.init(document.getElementById("chart2"))
    const chart3 = echarts.init(document.getElementById("chart3"))
    const chart4 = echarts.init(document.getElementById("chart4"))
    const url = `/village_detail?city=${encodeURIComponent(city)}&district=${encodeURIComponent(district)}&village_name=${encodeURIComponent(village_name)}`;
    $.ajax({
        type: "GET",
        url: url,
        dataType: "json",
        success: function (response) {
            // console.log(response)
            if (response.data.price_data.length !== 0) {
                document.getElementById("charts_wrap").style.display = "block"
            } else {
                document.getElementById("charts_wrap").style.display = "none"
            }

            const price_data = response.data.price_data
            const rooms_data = response.data.rooms_data
            // console.log(price_data)
            chart1.setOption(show_pie("租金分布情况", price_data))
            chart2.setOption(show_pie("户型分布情况", rooms_data))
            $("#min_price").text("￥" + response.data.min_price)
            $("#max_price").text("￥" + response.data.max_price)

            const min_price_house = JSON.parse(response.data.min_price_house);
            const max_price_house = JSON.parse(response.data.max_price_house);
            const max_price_house_url = "/house_list?param=" + encodeURIComponent(max_price_house.title);
            const min_price_house_url = "/house_list?param=" + encodeURIComponent(min_price_house.title);
            $("#max_price_house").html(`<div class="house_title"><a href="${max_price_house_url}">${max_price_house.title}</a></div>&nbsp;&nbsp;<div class="house_price">￥${max_price_house.price}</div>`);
            $("#min_price_house").html(`<div class="house_title"><a href="${min_price_house_url}">${min_price_house.title}</a></div>&nbsp;&nbsp;<div class="house_price">￥${min_price_house.price}</div>`);

            const max_rooms_name = response.data.max_rooms_name
            const max_rooms_count = response.data.max_rooms_count
            const max_rooms_url = "/house_list?rooms=" + encodeURIComponent(max_rooms_name);
            $("#max_house_type").html(`<div class="house_type"><a href="${max_rooms_url}">${max_rooms_name}</a></div>`)
            $("#max_house_count").html(`<div class="house_count">${max_rooms_count}</div>`)


            const scatter_data = response.data.scatter_data
            chart3.setOption(show_scatter("", scatter_data))
            const bar_rooms_data = response.data.rooms_list
            const avg_price_data = response.data.avg_price_list
            chart4.setOption(show_bar("", bar_rooms_data, avg_price_data))

        }
    })
}


$(document).ready(function () {
    // 当用户选择一个选项时，使用 jQuery 在前端获取该选项的值，并将其封装成一个 AJAX 请求，发送到后端的 /selector 路由。
    // 请求的数据部分包含一个名为 city 的键和用户选择的城市名称。
    $("#city_select").on("change", function () {
        const selectedCity = $(this).val()
        const district_select = document.getElementById("district_select")

        // 启用/禁用选择框
        if (selectedCity !== "") {
            district_select.disabled = false;
        } else {
            district_select.disabled = true
            $("#village_select").val(null)
        }

        if (district_select.disabled) {
            $("#village_select").prop('disabled', true);
        }

        let str = ""

        // 清除选择框内容
        district_select.innerHTML = "<option value=''>区县</option>";


        $.ajax({
            url: "/selector_city",  // 发送请求的后端路由
            data: {city: selectedCity},  // 发送选项值
            type: "POST",
            success: function (response) {
                // console.log(response);  // 处理响应
                str += '<option value="">区县</option>'
                for (let i = 0; i < response.length; i++) {
                    str += '<option value="' + response[i] + '">' + response[i] + '</option>'
                }
                district_select.innerHTML = str
            },
            error: function () {
                district_select.innerHTML = str
            }
        });
    });
    $("#district_select").on("change", function () {
        const selectedDistrict = $(this).val()
        const selectedCity = $("#city_select").val()
        const village_select = document.getElementById("village_select")
        const district_select = document.getElementById("district_select")

        if (selectedDistrict === "") {
            $("#village_select").val(null)
            village_select.disabled = true
        }
        if (selectedDistrict !== "") {
            village_select.disabled = false
        }

        let str = ""
        if (selectedDistrict === "") {
            village_select.innerHTML = '小区'
        }

        $.ajax({
            url: "/selector_district",  // 发送请求的后端路由
            data: {district: selectedDistrict},  // 发送选项值
            type: "POST",
            success: function (response) {
                // console.log(response);  // 处理响应
                str += '<option value="">小区</option>'
                for (let i = 0; i < response.length; i++) {
                    str += '<option value="' + response[i] + '">' + response[i] + '</option>'
                }
                village_select.innerHTML = str
            },
            error: function () {
                village_select.innerHTML = str
            }
        });
    });
});