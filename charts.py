from flask import Blueprint
from sqlalchemy import func, desc, case, text

from db.model import Houses, Village, District, City, session_factory
from pyecharts.charts import Bar, Line, Pie
from pyecharts import options as opts

charts = Blueprint("charts", __name__)


@charts.route("/charts/chart1")
def chart1():
    # 城市房源数量排行柱状图
    session = session_factory()
    data = session.query(Houses.city, func.count().label("count")) \
        .group_by(Houses.city) \
        .all()
    # .order_by(desc('count'))\
    x_data = [i[0] for i in data]
    y_data = [i[1] for i in data]
    bar = Bar()
    bar.add_xaxis(x_data)
    bar.add_yaxis("房源数量", y_data,
                  bar_width=25,
                  label_opts=opts.LabelOpts(color="#5a79d5", font_weight="bold", position="top"),
                  # 柱条最小高度，可用于防止某数据项的值过小而影响交互。
                  bar_min_height=5
                  )
    bar.set_global_opts(
        title_opts=opts.TitleOpts(
            title="各城市房源数量",
            subtitle="直观对比各城市的房源数量",
            pos_left="10px",
            pos_top="3px",
            padding=[0, 0, 10, 0],
            title_textstyle_opts=opts.TextStyleOpts(font_weight="bold", font_size=18),
            subtitle_textstyle_opts=opts.TextStyleOpts(font_size=13)
        ),
        legend_opts=opts.LegendOpts(is_show=False),
        xaxis_opts=opts.AxisOpts(
            splitline_opts=opts.SplitLineOpts(is_show=False),
            axislabel_opts=opts.LabelOpts(font_size=14)
        ),
        yaxis_opts=opts.AxisOpts(
            splitline_opts=opts.SplitLineOpts(is_show=True, linestyle_opts=opts.LineStyleOpts(type_="dashed"))
        ),
        tooltip_opts=opts.TooltipOpts(
            formatter="{b}</br>房源数量: {c}"
        )
    )

    return bar.dump_options_with_quotes()


@charts.route("/charts/chart2")
def chart2():
    # 将价格分为5段并查询各分段的数量
    session = session_factory()
    sql = '''select case
                when price >= 0 and price <= 2000 then "2K以下"
                when price > 2000 and price <= 4000 then "2K~4K"
                when price > 4000 and price <= 6000 then "4K~6K"
                when price > 6000 and price <= 8000 then "6K~8K"
                when price > 8000 and price <= 10000 then "8K~10K"
                when price > 10000 then "10K以上"
                end  as price_segment,
            count(*) as segment_count
            from houses
            group by price_segment'''
    data = list(session.execute(text(sql)))
    pie = Pie()
    pie.add("房源价格", data_pair=data,
            # 饼图的半径，数组的第一项是内半径，第二项是外半径
            radius=[0, 70],
            label_opts=opts.LabelOpts(color="#535353"),
            label_line_opts=opts.PieLabelLineOpts(smooth=True, length=10, length_2=10)
            )
    pie.set_global_opts(
        title_opts=opts.TitleOpts(
            title="房源价格分布",
            subtitle="各价格段的房源数量",
            subtitle_textstyle_opts=opts.TextStyleOpts(font_size=13),
            pos_left="10px",
            title_textstyle_opts=opts.TextStyleOpts(font_weight="bold", font_size=18)
        ),
        tooltip_opts=opts.TooltipOpts(formatter="{b}</br>房源数量: {c}"),
        legend_opts=opts.LegendOpts(is_show=False)
    )
    return pie.dump_options_with_quotes()


@charts.route("/charts/chart3")
def chart3():
    # 各城市小区数量分布
    session = session_factory()
    data = session.query(Houses).group_by