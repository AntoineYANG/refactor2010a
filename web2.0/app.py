import pymysql
from flask import Flask, render_template, request, jsonify, redirect, url_for, make_response, json, send_from_directory, send_file
from PSO import PSO
import os


app = Flask(__name__)


'''=========================================start 数据库操作所需的函数================================='''
'''使用ID查询数据库的操作'''
def Use_Sno_SearchDataBase(index):
    db = pymysql.connect("localhost", "root", "123456", "flask", charset='utf8')
    # 使用cursor()方法获取操作游标
    cursor = db.cursor()
    select_str = 'select Sname,Sno,Password from student where Sno in (%s)' % ','.join(['%s'] * len(index))
    cursor.execute(select_str, index)
    results = cursor.fetchall()
    db.commit()
    db.close()
    return results


'''=========================================start falsk路由服务======================================='''

@app.route('/')
def hello_world():
    return render_template('login.html')
@app.route('/index') #页面链接该路由名称
def f_infor():
    return render_template('index.html')

'''登录功能'''

@app.route('/login', methods=['GET', 'POST'])
def login():
    print('进入登录验证模块')
    file_handle = open ( '登陆名单.txt' , mode = 'a' )
    if request.method == 'POST':
        # 获取参数
        data = json.loads(request.form.get('data'))
        text = data['sig_Sno']
        # 对text的首尾进行操作
        text = text.strip()
        temp_list = []
        temp_list.append(text)
        # 对单条数据查询数据库
        text1 = data['sig_Pwd']
        result = Use_Sno_SearchDataBase(temp_list)
        #print(result)
        if (len(result)!=0 and result[0][2]==text1):
            print(result[0][0]+'在数据库中')
            line = result[0][0]+"\n"
            file_handle.write( line )
            file_handle.close()
            return render_template('index.html')
        elif (len(result)!=0 and result[0][2]!=text1):
            print('密码错误！')
            return "loss"
        else:
            print('该同学不在数据库中，请完成数据库的录入。')
            return "defeat"

@app.route('/pso', methods=['GET', 'POST'])
def pso_vrp():    
    print('进入pso算法运算模块')
    if request.method == 'POST':
        data = json.loads(request.form.get('data'))
        car_count = data['params'][0]
        car_load = data['params'][1]
        r = data['params'][2]
        q = data['params'][3]
        lis = data['params'][4]
        pop_size = data['params'][5]
        iteration = data['params'][6]
        w = data['params'][7]
        c1 = data['params'][8]
        c2 = data['params'][9]
        
        # liss = []
        #print(lis)
        # for i in range(len(lis)):
        #     dic = lis[i]
        #     liss.append(list(dic.values()))
        # print(liss)
        ans = PSO(car_count,car_load,r,q,lis,pop_size,iteration,w,c1,c2)
        print("pso算法运算结束，将结果传回网页")
    return jsonify(ans)


"""
admin:AntoineYANG
pk.eyJ1IjoibGV5b25vIiwiYSI6ImNrZXdqc3RxdzRmMXMzMHBjYTYwNm4zOG4ifQ.r-vydM9dFLCSqAl7lSSrfQ
"""

if __name__ == '__main__':
    #app.run(host="0.0.0.0",port="5000",threaded=True)
    app.run(threaded=True)
