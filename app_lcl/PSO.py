# -*- coding: utf-8 -*-
"""
Created on Sat Jan 11 12:54:21 2020

@author: 吕丛林
"""
import random
import math
import copy
import matplotlib.pyplot as plt 
 #种群规模

#lis = [[120.10381512286305,30.296979475670415],[120.13323508830406,30.295944409131792,34],[120.13535755277118,30.27231061649803,17],[120.14134862304405,30.272910882325476,25],[120.19384817284751,30.3148764119662,44],[120.16132709851536,30.26993610525515,5],[120.10208045460568,30.30385734107755,31],[120.17871410117165,30.251713945814448,9],[120.18522771149132,30.309686737889287,7],[120.1998195114828,30.313308444438878,14],[120.19938300216269,30.241084483561675,15],[120.12975630335826,30.329071540703026,41],[120.14551459148248,30.31659746233546,11],[120.1663901117333,30.329390402909038,2],[120.11867167986912,30.243949062427433,21],[120.1991678149825,30.283147282709077,33],[120.1093170403052,30.327581773094387,27],[120.10633621141761,30.279621387188776,38],[120.12993638155,30.233687374645903,22],[120.17148553648997,30.310167211109682,33]]

def get_dis(lis):
    dis = [[0 for i in range(50)]for i in range(50)]
    for i in range(len(lis)):
        for j in range(len(lis)):
            if(i<len(lis)):
                dis[i][j] = math.sqrt((lis[i][0]-lis[j][0])**2+(lis[i][1]-lis[j][1])**2)
    return dis
def get_fit(p,lis):
    dis = get_dis(lis)
    fit = 0
    for j in range(len(p)-1):
        fit += dis[p[j]][p[j+1]]
    fit +=dis[p[0]][p[len(p)-1]]
    return fit
def fit(pop,lis,dis,car_count,car_load,r):
    zzu = []
    fit = 0
    load = 0
    lastload = 0
    zzus=[]
    ii = 0
    count = 0
    for i in range(len(pop)):
        if(count==car_count-1):
            ii=i;
            break
        if(pop[i]>(len(pop)-car_count+1)):
            count+=1;
            if(len(zzus)!=0):
                zzu.append(copy.deepcopy(zzus))
                zzus.clear()
            continue;
        else:
            load +=lis[pop[i]][2]
            if(load<=car_load):
                zzus.append(pop[i])
            else:
                if(len(zzus)!=0):
                    zzu.append(copy.deepcopy(zzus))
                    zzus.clear()
                load = 0
                load +=lis[pop[i]][2]
                zzus.append(pop[i])
    for i in range(len(zzu)):
        fit += get_fit(zzu[i],lis)
    for i in range(ii,len(pop)):
        if(pop[i]>(len(pop)-car_count+1)):
            continue
        lastload = lis[pop[i]][2]
    fit *=111
    if((lastload-car_load)>0):
        fit +=r*((lastload)-car_load)   
    return fit
def answer(pop,lis,dis,car_count,car_load,r):
    zzu = []
    load = 0
    zzus=[]
    ii = 0
    count = 0
    aa = []
    for i in range(len(pop)):
        if(count==car_count-1):
            ii=i;
            break
        if(pop[i]>(len(pop)-car_count+1)):
            count+=1;
            if(len(zzus)!=0):
                zzu.append(copy.deepcopy(zzus))
                zzus.clear()
            continue;
        else:
            load +=lis[pop[i]][2]
            if(load<=car_load):
                zzus.append(pop[i])
            else:
                if(len(zzus)!=0):
                    zzu.append(copy.deepcopy(zzus))
                    zzus.clear()
                load = 0
                load +=lis[pop[i]][2]
                zzus.append(pop[i])
    for i in range(ii,len(pop)):
        if(pop[i]>(len(pop)-car_count+1)):
            continue
        aa.append(pop[i])
    zzu.append(copy.deepcopy(aa))          
    return zzu
def get_fitness(dis,pop):
    fitness = []
    for i in range(len(pop)):
        fit = 0
        p = pop[i]
        for j in range(len(p)-1):
            fit += dis[p[j]][p[j+1]]
        fitness.append(fit)
    return fitness
def get_best(pop,fitness):
    index = fitness.index(min(fitness))
    return pop[index]
def PSO(lis,pop_size,iteration,w,c1,c2,car_count,car_load,r):#数据#粒子数#迭代次数 （粒子数不能超过50）
    gbestbit = []
    gbestfit = []
    pop =[] #种群
    pbest = [] #局部最优
    gbest = [] #全局最优
    velo=[] #粒子速度A
    ans = []
    t=0
    # w = 0.8    #权重系数 数值越大，全局搜索能力越强，局部搜索能力越弱；数值越小，全局搜索能力越弱，局部搜索能力越强
    # c1 = 2     #加速常数，通常取2，也可取0-4之间的值 pbest
    # c2 = 2     #加速常数，通常取2，也可取0-4之间的值 gbest
    # car_count = 5
    # car_load = 200
    # r = 10  #5或者10
    dis = get_dis(lis)
    #pop_size = 100
    #初始化种群
    for i in range(pop_size):
        a=[]
        p=[]
        for i in range(len(lis)+car_count-1):
            a.append(0)
        for i in range(1,len(lis)+car_count-1):
            s = random.randint(1,len(lis)+car_count-2)
            while(a[s] == 1):
                s = random.randint(1,len(lis)+car_count-2)
            a[s]=1
            p.append(s)
        pop.append(p) 
        b=[]
        v=[]
        for i in range(len(lis)+car_count-1):
            b.append(0)
        for i in range(1,len(lis)+car_count-1):
            s = random.randint(1,len(lis)+car_count-2)
            while(b[s] == 1):
                s = random.randint(1,len(lis)+car_count-2)
            b[s]=1
            v.append(s)
        velo.append(v)
    fitness = get_fitness(dis,pop)
    #得到pbest和gbest
    gbest.append(copy.deepcopy(get_best(pop,fitness)))
    #每个粒子的pbest都是自己
    pbest=copy.deepcopy(pop) 
    #更新粒子的位置和速度
    while (t<iteration):
        #print(t)
        r1 = round(random.uniform(0,1),1) #随机数，0-1,每次迭代都要更新一次
        r2 = round(random.uniform(0,1),1) #随机数，0-1，每次迭代都要更新一下
        for i in range(pop_size):
            c = [0 for i in range(50)]
            for j in range(len(pop[i])):

                velo[i][j]=w*velo[i][j]+c1*r1*(pbest[i][j]-pop[i][j])+c2*r2*(gbest[t][j]-pop[i][j])
                p= int(pop[i][j]+velo[i][j])
                if p>=1 and p<=len(pop[i])and c[p]==0:
                    pop[i][j]= p
                while not(p>=1 and p<=len(pop[i])and c[p]==0):
                    count = 0
                    d= []
                    for s in range(len(c)):
                        if(c[s]==0):
                            count+=1;
                            d.append(i)
                    count -=1
                    p=random.randint(0,count)
                c[p]=1
                pop[i][j]=p
                        
        
        for i in range(pop_size):
            #更新局部最优
            if (fit(pbest[i],lis,dis,car_count,car_load,r)< fit(pop[i],lis,dis,car_count,car_load,r)):
                pbest[i] = pop[i]
        t=t+1
        fitness = get_fitness(dis,pop)
        #更新gbest        
        gbest.append(copy.deepcopy(get_best(pop,fitness)))
        if (fit(gbest[t-1],lis,dis,car_count,car_load,r)<fit(gbest[t],lis,dis,car_count,car_load,r)):
            gbest[t]=copy.deepcopy(gbest[t-1])
       
        print("第"+str(t)+"代的全局最优为:"+str(fit(gbest[t],lis,dis,car_count,car_load,r)))
        qq = []
        gbestbit.append(t)
        gbestfit.append(fit(gbest[t],lis,dis,car_count,car_load,r))
        qq.append(copy.deepcopy(t))
        qq.append(copy.deepcopy(fit(gbest[t],lis,dis,car_count,car_load,r)))
        ans.append(qq)
    anss = []    
    anss.append(ans)   
    plt.plot(gbestbit, gbestfit)
    plt.show()
    print("最终fitness为:"+str(fit(gbest[iteration-1],lis,dis,car_count,car_load,r)))
    s = answer(gbest[iteration-1], lis, dis, car_count, car_load, r)
    #print(s)
    ss = []
    sss = []
    ssss= []
    for i in range(len(s)):
        ss.append(copy.deepcopy(lis[0][0]))
        ss.append(copy.deepcopy(lis[0][1]))
        sss.append(copy.deepcopy(ss))
        ss.clear()
        for j in range(len(s[i])):
            ss.append(copy.deepcopy(lis[s[i][j]][0]))
            ss.append(copy.deepcopy(lis[s[i][j]][1]))
            #ss.append(copy.deepcopy(s[i][j]))
            sss.append(copy.deepcopy(ss))
            ss.clear()
        ss.append(copy.deepcopy(lis[0][0]))
        ss.append(copy.deepcopy(lis[0][1]))
        sss.append(copy.deepcopy(ss))
        ss.clear()
        ssss.append(copy.deepcopy(sss))
        sss.clear()
    #print(str(ssss).replace(' ', ''))
    #print(str(ans).replace(' ', ''))
    final = []
    final.append(ssss)
    final.append(anss)
    #print(final)
    return final
#PSO(lis,10,30,0.8,2,2,5,200,10)
"""
[[[120.15278284949227,30.321188343182214],[120.10136064186827,30.335777792068967],[120.088743155739,30.324681789391107],[120.08779089263419,30.308446483735736],[120.15278284949227,30.321188343182214]],[[120.15278284949227,30.321188343182214],[120.12159623283253,30.300019505391973],[120.10326516807612,30.273911829932786],[120.15825836234177,30.27247262218276],[120.15278284949227,30.321188343182214]],[[120.15278284949227,30.321188343182214],[120.16920938803901,30.30043059431226],[120.19539662340253,30.274117429317798],[120.2158702801425,30.30063613812571],[120.15278284949227,30.321188343182214]],[[120.15278284949227,30.321188343182214],
[120.22610710851245,30.320160835293493],
[120.1984914784909,30.340708945234283],
[120.15278284949227,30.321188343182214]],
[[120.15278284949227,30.321188343182214],
[120.1663525987264,30.340708945234283],
[120.15278284949227,30.321188343182214]]]
"""    
    

