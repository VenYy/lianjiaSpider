import json

from flask import Flask, render_template
from sqlalchemy import func

from charts import charts
from list_page import list_page
from detail import detail

from db.settings import Config, db
from lib.geo.mapCity import map_city
from db.model import Houses, District, Village

app = Flask(__name__)
app.config.from_object(Config)
app.secret_key = "123@123"

db.init_app(app)

# 注册蓝图
app.register_blueprint(charts)
app.register_blueprint(list_page)
app.register_blueprint(detail)


@app.route("/")
def index():
    # 查询各 city 和 district 下的房源总数
    city_data = Houses.query.with_entities(Houses.city, func.count(Houses.id_), func.avg(Houses.price)).group_by(Houses.city).all()
    district_data = Houses.query.with_entities(
        Houses.city, Houses.district, func.count(Houses.id_), func.avg(Houses.price)
    ).group_by(Houses.city, Houses.district).all()

    # 将查询结果转换为 ECharts 所需的数据格式
    house_data = [{"name": map_city(city), "value": count} for city, count, _ in city_data]
    avg_price_data = [{"name": map_city(city), "value": round(float(avg_price), 2)} for city, _, avg_price in city_data]

    for city, district, count, avg_price in district_data:
        house_data.append({"name": map_city(district), "value": count})
        avg_price_data.append({"name": map_city(district), "value": round(float(avg_price), 2)})

    district_count = District.query.count()
    village_count = Village.query.count()
    houses_count = Houses.query.count()

    return render_template("index.html",
                           house_data=json.dumps(house_data),
                           avg_price_data=json.dumps(avg_price_data),
                           district_count=district_count,
                           village_count=village_count,
                           houses_count=houses_count)


if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=5000)
