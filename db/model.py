from sqlalchemy import Column, Integer, String, DECIMAL, create_engine
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()
engine = create_engine('mysql+pymysql://root:root@127.0.0.1:3306/lianjia')


class House(Base):
    __tablename__ = 'houses'
    id_ = Column(String(255), primary_key=True)
    title = Column(String(255))              # 标题
    city = Column(String(32))                # 所在城市
    district = Column(String(32))            # 所在区县
    village_name = Column(String(255))       # 小区名称
    img_src = Column(String(255))            # 封面图片URL
    price = Column(DECIMAL(precision=10, scale=2))               # 价格
    rent_type = Column(String(32))           # 房源类型(整租/合租)
    rooms = Column(String(32))               # 户型
    area = Column(String(32))                # 房源面积
    direction = Column(String(32))           # 房源朝向
    floor_type = Column(String(32))          # 楼层类型(高层/中层/低层)
    floor_num = Column(Integer)           # 房源所在楼层
    facilities = Column(String(255))         # 配套设施

    def __repr__(self):
        return (f'<House(id_={self.id_}, '
                f'title={self.title}, '
                f'price={self.price}, '
                f'village_name={self.village_name}, '
                f'img_src={self.img_src}, '
                f'rent_type={self.rent_type}, '
                f'rooms={self.rooms}, '
                f'area={self.area}, '
                f'direction={self.direction}, '
                f'floor_type={self.floor_type}, '
                f'floor_num={self.floor_num}, '
                f'facilities={self.facilities})>')

