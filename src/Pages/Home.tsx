/*
 * @Author: Kanata You 
 * @Date: 2020-10-05 13:23:31 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2020-10-18 19:55:17
 */

import React from "react";
import { Link } from "react-router-dom";


export const Home = (_props: {}): JSX.Element => {
    return (
        <div
        style={{
            minHeight: "80vh",
            margin: "9vh 8vw",
            width: "84vw",
            display: "flex",
            flexDirection: "column",
            color: "rgb(225,225,225)",
            justifyContent: "space-between"
        }} >
            <div key="header" className="title"
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%"
            }} >
                <h1 style={{
                    margin: "0.6em 0 0.55em"
                }} >
                    智慧物流平台
                </h1>
                <span></span>
            </div>
            <div key="navi" className="listcontainer"
            style={{
                flex: 1,
                margin: "10vh 6vw 0",
                color: "rgb(225,225,225)",
                fontSize: "140%"
            }} >
                <div key="navi" className="list"
                style={{
                    padding: "5vh 4vw",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between"
                }} >
                    <Link to="routemanage" >
                        <div key="路线规划" className="item"
                        style={{
                            padding: "0.4em 0"
                        }} >
                            路线规划
                        </div>
                    </Link>
                    <div key="车辆调度" className="item"
                    style={{
                        padding: "0.4em 0"
                    }} >
                        车辆调度
                    </div>
                    <div key="车辆配载" className="item"
                    style={{
                        padding: "0.4em 0"
                    }} >
                        车辆配载
                    </div>
                    <div key="订单管理" className="item"
                    style={{
                        padding: "0.4em 0"
                    }} >
                        订单管理
                    </div>
                    <div key="车辆定位" className="item"
                    style={{
                        padding: "0.4em 0"
                    }} >
                        车辆定位
                    </div>
                </div>
            </div>
        </div>
    );
};
