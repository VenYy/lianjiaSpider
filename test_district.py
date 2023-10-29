import os
from datetime import datetime
from queue import Queue
from threading import Thread
import sqlalchemy
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import QueuePool
from db.model import Houses, engine, session_factory

from lib.request.headers import *
from lib.request.proxies import *

import requests
from lxml import etree

from city import district_list

root_path = r"E:\myCodes\lianjiaSpider"
THREAD_SIZE = 10


def parse_html(url):
    proxy = get_proxy().get("proxy")
    resp = requests.get(url, headers=create_headers(), proxies={"http": f"http://{proxy}"})
    if resp.status_code != 200:
        print("error status code: ", resp.status_code)
        return
    resp_content = resp.content.decode("utf-8")
    root = etree.HTML(resp_content)
    return root


# 创建Session对象池，包含 5 个 Session 对象
session_pool = QueuePool(session_factory, max_overflow=THREAD_SIZE, pool_size=THREAD_SIZE)


def worker():
    """处理队列中的任务"""
    # 获取当前线程的 Session 对象
    # session = session_pool.connect()
    session = session_factory()
    while True:
        url = q.get()
        print("Processing: ", url)

        # 数据库操作
        try:
            root = parse_html(url)
            # 其他操作...
            # title:        标题
            # village_name: 小区名称
            # img_src:      封面图片
            # price:        价格
            # rent_type:    房源类型(整租, 合租)
            # rooms:        户型
            # area:         房源面积
            # direction:    房源朝向
            # floor_type:   楼层类型(高层, 中层, 低层)
            # floor_num:    房源所在楼层
            # facilities:   配套设施
            title = root.xpath("//p[@class='content__title']/text()")[0].replace("\n", "").strip()
            id = root.xpath("//i[@class='gov_title']/text()")[1].replace('\n', '').strip().split("：")[1]
            village_name = title.split(" ")[0].split("·")[1]
            img_src = root.xpath("//div[@class='content__article__slide__item']/img/@src")[0]
            price = root.xpath("//div[@class='content__aside--title']/span/text()")[0]
            rent_type = root.xpath("//ul[@class='content__aside__list']/li[1]/text()")[0]
            basic_info = root.xpath("//ul[@class='content__aside__list']/li[2]/text()")[0].split(" ")
            rooms = basic_info[0]
            area = basic_info[1]
            floor_info = root.xpath("//li[@class='floor']/span[2]/text()")[0].split(" ")
            direction = floor_info[0]
            floor_type = floor_info[1].split("/")[0]
            floor_num = int(floor_info[1].split("/")[1].replace('层', ''))
            facility_list = root.xpath(
                "//ul[@class='content__article__info2']/li[not(contains(@class, 'facility_no'))]/text()")
            if facility_list and facility_list[0].strip() == "配套设施":
                facility_list = facility_list[1:]
            facilities = ",".join([i.replace('\n', '').replace(' ', '') for i in facility_list if i.strip() != ""])
            if len(facilities) == 0:
                facilities = "无"
            # 查询数据库中是否已存在当前房源
            house = session.query(Houses).filter_by(id_=id).first()
            if house:
                # 如果已存在， 则更新数据
                house.title = title
                house.village_name = village_name
                house.img_src = img_src
                house.price = price
                house.rent_type = rent_type
                house.rooms = rooms
                house.area = area
                house.direction = direction
                house.floor_type = floor_type
                house.floor_num = floor_num
                house.facilities = facilities
                house.city = city_zh
                house.district = district_zh
                session.commit()
                print(f"更新房源信息成功：{id}")

            else:
                # 将数据存入数据库
                house = Houses(title=title, id_=id, village_name=village_name, img_src=img_src, price=price,
                               rent_type=rent_type,
                               rooms=rooms, area=area, direction=direction, floor_type=floor_type, floor_num=floor_num,
                               facilities=facilities,
                               city=city_zh, district=district_zh)
                print(house)
                session.add(house)
                session.commit()
                print(f"新增房源信息成功：{id}")

        except Exception as e:
            # 处理异常
            print(f"Error when parsing {id}: {e}")

        finally:
            # 释放 Session 对象
            session.close()
            q.task_done()


q = Queue()
position = 50

for i in range(1, 4):
    city_zh = district_list[position]["city_zh"]
    city_en = district_list[position]["city_en"]
    district_zh = district_list[position]["district_zh"]
    url = district_list[position]["url"]
    current_url = url + f"pg{i}rco11"
    print(current_url)
    base_url = f"https://{city_en}.lianjia.com"

    root = parse_html(current_url)

    # 判断是否为最后一页
    if root.xpath("//div[@class='content__empty1']"):
        break

    detail_url = [f"{base_url}{i}" for i in
                  root.xpath("//div[@class='content__list'][1]//p[@class='content__list--item--title']/a/@href")]
    print(detail_url)

    # 添加任务到队列
    for u in detail_url:
        q.put(u)

for i in range(THREAD_SIZE):  # 创建 5 个线程
    t = Thread(target=worker)
    t.daemon = True
    t.start()

# 阻塞主线程，等待队列中的所有任务完成
q.join()
