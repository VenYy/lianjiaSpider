import json

from flask import Flask, render_template
from sqlalchemy import func

from charts import charts
from lib.geo.mapCity import map_city
from db.model import Houses, City, District, session_factory, Village

app = Flask(__name__)
app.register_blueprint(charts)


@app.route("/")
def index():
    session = session_factory()
    # 查询各 city 和 district 下的房源总数
    city_data = session.query(Houses.city, func.count(Houses.id_)).group_by(Houses.city).all()
    district_data = session.query(
        Houses.city, Houses.district, func.count(Houses.id_)
    ).group_by(Houses.city, Houses.district).all()

    # 将查询结果转换为 ECharts 所需的数据格式
    house_data = [{"name": map_city(city), "value": count} for city, count in city_data]

    for city, district, count in district_data:
        house_data.append({"name": map_city(district), "value": count})

    district_count = session.query(District).count()
    village_count = session.query(Village).count()
    houses_count = session.query(Houses).count()

    return render_template("index.html",
                           house_data=json.dumps(house_data),
                           district_count=district_count,
                           village_count=village_count,
                           houses_count=houses_count)


if __name__ == '__main__':
    app.run(debug=True)
