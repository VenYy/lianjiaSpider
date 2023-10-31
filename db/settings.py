from flask_sqlalchemy import SQLAlchemy
import pymysql

pymysql.install_as_MySQLdb()

db = SQLAlchemy()


class Config:
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = 'mysql://root:root@127.0.0.1:3306/lianjia'
