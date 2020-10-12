/*
 * @Author: Kanata You 
 * @Date: 2020-10-05 13:23:31 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2020-10-05 17:59:13
 */

import React from "react";


export const Home = (_props: {}): JSX.Element => {
    return (
        <div
        style={{
            minHeight: "80vh",
            margin: "9vh 10vw",
            width: "80vw",
            display: "flex",
            flexDirection: "column",
            color: "rgb(225,225,225)",
            justifyContent: "space-between"
        }} >
            <div key="header" className="title"
            style={{
                margin: "0 10vw"
            }} >
                <h1>智慧物流平台</h1>
            </div>
            <div key="navi"
            style={{
                flex: 1,
                margin: "6vh 10vw",
                display: "flex",
                flexDirection: "column",
                color: "rgb(225,225,225)",
                justifyContent: "space-between",
                fontSize: "130%"
            }} >
                <div key="路线规划" className="item"
                style={{
                    padding: "0.7em 0"
                }} >
                    路线规划
                </div>
                <div key="车辆调度" className="item"
                style={{
                    padding: "0.7em 0"
                }} >
                    车辆调度
                </div>
                <div key="车辆配载" className="item"
                style={{
                    padding: "0.7em 0"
                }} >
                    车辆配载
                </div>
                <div key="订单管理" className="item"
                style={{
                    padding: "0.7em 0"
                }} >
                    订单管理
                </div>
                <div key="车辆定位" className="item"
                style={{
                    padding: "0.7em 0"
                }} >
                    车辆定位
                </div>
            </div>
        </div>
    );
};
