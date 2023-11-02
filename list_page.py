import math
import re

from flask import Blueprint, render_template, request, redirect, url_for, jsonify
from sqlalchemy import not_

from db.model import Houses, City, District
from db.settings import db

list_page = Blueprint("list_page", __name__)


@list_page.route("/house_list")
def house_list():
    user_input = request.args.get("param")
    city = request.args.get("city", "", type=str)
    district = request.args.get("district", "", type=str)
    rent_type = request.args.get("rent_type", "", type=str)
    rooms = request.args.get("rooms", "", type=str)
    direction = request.args.get("direction", "", type=str)
    price_range = request.args.get("price", "", type=str)

    result = db.session.query(City.city_zh, District.district_zh).join(District).all()
    city_districts = {}
    for city_zh, district_zh in result:
        if city_zh not in city_districts:
            city_districts[city_zh] = []
        city_districts[city_zh].append(district_zh)

    # print(city_districts)

    query = Houses.query

    if user_input:
        query = query.filter(
            (Houses.city.like(f"%{user_input}%")) |
            (Houses.district.like(f"%{user_input}%")) |
            (Houses.village_name.like(f"%{user_input}%")) |
            (Houses.title.like(f"%{user_input}%"))
        )

    if city:
        query = query.filter(Houses.city == city)
    if district:
        query = query.filter(Houses.district == district)
    if rent_type:
        query = query.filter(Houses.rent_type == rent_type)

    if rooms == "5室以上":
        # 使用正则表达式提取数字并比较
        query = query.filter(Houses.rooms.op("REGEXP")('[5-9]室|[1-9][0-9]室'))
        print(query)
    elif rooms:
        query = query.filter(Houses.rooms.like(f"%{rooms}%"))

    if direction == "其他":
        query = query.filter(not_(Houses.direction.in_(["东", "西", "南", "北", "南/北"])))
    elif direction:
        query = query.filter(Houses.direction == direction)

    if price_range:
        if price_range == "0-1000元":
            query = query.filter(Houses.price.between(0, 1000))
        elif price_range == "1000-2000元":
            query = query.filter(Houses.price.between(1000, 2000))
        elif price_range == "2000-3000元":
            query = query.filter(Houses.price.between(2000, 3000))
        elif price_range == "3000-4000元":
            query = query.filter(Houses.price.between(3000, 4000))
        elif price_range == "4000-5000元":
            query = query.filter(Houses.price.between(4000, 5000))
        elif price_range == "5000元以上":
            query = query.filter(Houses.price >= 5000)

    per_page = 30  # 每页的显示数量
    total_count = query.count()  # 总的记录数
    total_page_num = math.ceil(total_count / per_page)  # 总的页面数量
    current_page = request.args.get("page", 1, type=int)  # 当前页码

    # 执行分页查询
    pagination = query.paginate(page=current_page, per_page=per_page)
    # print(pagination)
    return render_template("house_list.html",
                           pagination=pagination,
                           page_num=current_page,
                           param=user_input,
                           city=city,
                           district=district,
                           rent_type=rent_type,
                           rooms=rooms,
                           direction=direction,
                           price=price_range,
                           city_districts=city_districts,
                           total_count=total_count,
                           total_page_num=total_page_num)


# 过滤器, 修改模板中的城市名称
@list_page.app_template_filter("trans_city")
def trans_city(city_zh):
    city_en = City.query.with_entities(City.city_en).filter(City.city_zh == city_zh).first()[0]
    return city_en


# 分割设施列表
@list_page.app_template_filter("deal_facility")
def deal_facility(facilities):
    facility_list = facilities.split(",")
    return facility_list
