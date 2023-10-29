# 用于向village表中新增的数据添加经纬度信息

from db.model import session_factory, Village
from geoCoder import *

session = session_factory()
data = session.query(Village).with_entities(Village.city, Village.district, Village.village_name).all()
for item in data[14201:14500]:
    print(item)
    city, district, village_name = item[0], item[1], item[2]
    address = city + district + village_name

    lng, lat = geocoder(address)
    # 根据city、district和village_name查询Village表中的记录
    village = session.query(Village).filter_by(city=city, district=district, village_name=village_name).first()
    # 更新经度和纬度字段
    village.lng = lng
    village.lat = lat
session.commit()
