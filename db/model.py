from sqlalchemy import Column, Integer, String, DECIMAL, create_engine, PrimaryKeyConstraint, ForeignKey, Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, Session

Base = declarative_base()
engine = create_engine('mysql+pymysql://root:root@127.0.0.1:3306/lianjia')


class Houses(Base):
    __tablename__ = 'houses'

    id_ = Column(String(255), primary_key=True)
    title = Column(String(255))
    village_name = Column(String(255))
    img_src = Column(String(255))
    price = Column(DECIMAL(10, 2))
    rent_type = Column(String(32))
    rooms = Column(String(32))
    area = Column(String(32))
    direction = Column(String(32))
    floor_type = Column(String(32))
    floor_num = Column(Integer)
    facilities = Column(String(255))
    city = Column(String(32), ForeignKey('city.city_zh'))
    district = Column(String(32), ForeignKey('district.district_zh'))

    city_ref = relationship('City')
    district_ref = relationship('District')

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


class City(Base):
    __tablename__ = 'city'

    city_en = Column(String(32), primary_key=True)
    city_zh = Column(String(32))

    def __repr__(self):
        return f"<City(city_en='{self.city_en}', city_zh='{self.city_zh}')>"


class District(Base):
    __tablename__ = 'district'

    city_en = Column(String(32), ForeignKey('city.city_en'))
    district_en = Column(String(32), primary_key=True)
    district_zh = Column(String(32))
    city = relationship('City')

    __table_args__ = (
        Index('city_en', 'city_en'),
    )

    def __repr__(self):
        return f"<District(district_en='{self.district_en}', district_zh='{self.district_zh}')>"


class Village(Base):
    __tablename__ = 'village'

    city = Column(String(32), ForeignKey('city.city_zh'), primary_key=True)
    district = Column(String(32), ForeignKey('district.district_zh'), primary_key=True)
    village_name = Column(String(255), primary_key=True)
    lng = Column(DECIMAL(19, 15))
    lat = Column(DECIMAL(19, 15))

    city_ref = relationship('City')
    district_ref = relationship('District')

    def __repr__(self):
        return f"<Village(district_en='{self.district_en}', village_name='{self.village_name}', lng={self.lng}, lat={self.lat})>"


def session_factory():
    """创建一个新的Session对象"""
    return Session(bind=engine)
    # Session = sessionmaker(bind=engine)
    # return Session()
