function getVillageInfo() {
    const city = $("#city_select").val()
    const district = $("#district_select").val()
    const village_name = $("#village_select").val()

    if (village_name === "") {
        alert("请选择小区名称！")
    }

    // console.log(city, district, village_name)

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

    const chart1 = echarts.init(document.getElementById("chart1"))
    const chart2 = echarts.init(document.getElementById("chart2"))
    const url = `/village_detail?city=${encodeURIComponent(city)}&district=${encodeURIComponent(district)}&village_name=${encodeURIComponent(village_name)}`;
    $.ajax({
        type: "GET",
        url: url,
        dataType: "json",
        success: function (response) {
            console.log(response)
            if (response.data.price_data.length !== 0) {
                document.getElementById("charts_wrap").style.display = "block"
            }
            else {
                document.getElementById("charts_wrap").style.display = "none"
            }

            const price_data = response.data.price_data
            const rooms_data = response.data.rooms_data
            // console.log(price_data)
            chart1.setOption(show_pie("租金分布情况", price_data))
            chart2.setOption(show_pie("户型分布情况", rooms_data))
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
            $("#district_select").val(null).selectpicker("refresh")
            district_select.disabled = true
            $("#village_select").val(null)
            $("#village_select").prop('disabled', true).selectpicker("refresh")
        }

        if (district_select.disabled) {
            $("#village_select").prop('disabled', true);
        }

        let str = ""

        // 清除选择框内容
        district_select.innerHTML = "<option value=''>区县</option>";
        $('#district_select').selectpicker('refresh');


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
                $('#district_select').selectpicker('refresh');
            },
            error: function () {
                district_select.innerHTML = str
                $('#district_select').selectpicker('refresh');
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
            $("#village_select").selectpicker("refresh")
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
                $("#village_select").selectpicker("refresh")
            },
            error: function () {
                village_select.innerHTML = str
                $("#village_select").selectpicker("refresh")
            }
        });
    });
});