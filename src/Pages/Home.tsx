/*
 * @Author: Kanata You 
 * @Date: 2020-10-05 13:23:31 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2020-10-05 17:59:13
 */

import React from "react";
import { RotatingList } from "../Containers/RotatingList";


export const Home = (_props: {}): JSX.Element => {
    return (
        <div
        style={{
            // border: "1px solid black",
            minHeight: "80vh",
            margin: "10vh 10vw",
            width: "80vw",
            display: "flex",
            justifyContent: "center"
        }} >
            <RotatingList width={ 800 } height={ 500 }
            items={ [{
                name: "订单管理",
                detail: "功能正在等待完善",
                paint: (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) => {
                    ctx.beginPath();
                    ctx.moveTo(cx - r * 0.42, cy - r * 0.54);
                    ctx.lineTo(cx + r * 0.42, cy - r * 0.54);
                    ctx.lineTo(cx + r * 0.42, cy + r * 0.54);
                    ctx.lineTo(cx - r * 0.42, cy + r * 0.54);
                    ctx.lineTo(cx - r * 0.42, cy - r * 0.54);
                    ctx.stroke();
                    ctx.closePath();
                    for (let i: number = 0; i < 3; i++) {
                        ctx.beginPath();
                        ctx.arc(cx - r * 0.28, cy - r * (0.42 - i * 0.2), r * 0.07, 0, Math.PI * 2);
                        if (i) {
                            ctx.stroke();
                        } else {
                            ctx.fill();
                        }
                        ctx.closePath();
                        ctx.beginPath();
                        ctx.moveTo(cx - r * 0.18, cy - r * (0.38 - i * 0.2));
                        ctx.lineTo(cx + r * 0.34, cy - r * (0.38 - i * 0.2));
                        ctx.stroke();
                        ctx.closePath();
                    }
                },
                onClick: () => {}
            }, {
                name: "车辆调度",
                detail: "功能正在等待完善",
                paint: (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) => {
                    ctx.beginPath();
                    ctx.moveTo(cx - r * 0.41, cy - r * 0.36);
                    ctx.lineTo(cx - r * 0.54, cy + r * 0.02);
                    ctx.lineTo(cx - r * 0.42, cy + r * 0.02);
                    ctx.moveTo(cx - r * 0.29, cy - r * 0.36);
                    ctx.lineTo(cx - r * 0.41, cy - r * 0.36);
                    ctx.stroke();
                    ctx.closePath();
                    ctx.beginPath();
                    ctx.arc(cx - r * 0.36, cy + r * 0.11, r * 0.09, Math.PI * 0.4, Math.PI * 1.2);
                    ctx.stroke();
                    ctx.closePath();

                    ctx.beginPath();
                    ctx.moveTo(cx - r * 0.23, cy - r * 0.38);
                    ctx.lineTo(cx - r * 0.36, cy + r * 0.06);
                    ctx.lineTo(cx - r * 0.24, cy + r * 0.06);
                    ctx.moveTo(cx - r * 0.11, cy - r * 0.38);
                    ctx.lineTo(cx - r * 0.23, cy - r * 0.38);
                    ctx.stroke();
                    ctx.closePath();
                    ctx.beginPath();
                    ctx.arc(cx - r * 0.15, cy + r * 0.16, r * 0.1, Math.PI * 0.4, Math.PI * 1.2);
                    ctx.stroke();
                    ctx.closePath();

                    ctx.beginPath();
                    ctx.moveTo(cx - r * 0.05, cy - r * 0.4);
                    ctx.lineTo(cx - r * 0.18, cy + r * 0.1);
                    ctx.lineTo(cx + r * 0.56, cy + r * 0.1);
                    ctx.lineTo(cx + r * 0.24, cy + r * 0.1);
                    ctx.lineTo(cx + r * 0.24, cy - r * 0.4);
                    ctx.lineTo(cx - r * 0.05, cy - r * 0.4);
                    ctx.stroke();
                    ctx.closePath();
                    ctx.beginPath();
                    ctx.moveTo(cx - r * 0.01, cy - r * 0.31);
                    ctx.lineTo(cx - r * 0.07, cy - r * 0.07);
                    ctx.lineTo(cx + r * 0.14, cy - r * 0.07);
                    ctx.lineTo(cx + r * 0.14, cy - r * 0.31);
                    ctx.lineTo(cx - r * 0.01, cy - r * 0.31);
                    ctx.stroke();
                    ctx.closePath();
                    ctx.beginPath();
                    ctx.arc(cx + r * 0.06, cy + r * 0.21, r * 0.11, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.closePath();
                },
                onClick: () => {}
            }, {
                name: "车辆配载",
                detail: "功能正在等待完善",
                paint: (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) => {
                    ctx.beginPath();
                    ctx.moveTo(cx - r * 0.41, cy - r * 0.4);
                    ctx.lineTo(cx - r * 0.54, cy + r * 0.1);
                    ctx.lineTo(cx + r * 0.56, cy + r * 0.1);
                    ctx.lineTo(cx - r * 0.12, cy + r * 0.1);
                    ctx.lineTo(cx - r * 0.12, cy - r * 0.4);
                    ctx.lineTo(cx - r * 0.41, cy - r * 0.4);
                    ctx.stroke();
                    ctx.closePath();
                    ctx.beginPath();
                    ctx.moveTo(cx - r * 0.37, cy - r * 0.31);
                    ctx.lineTo(cx - r * 0.43, cy - r * 0.07);
                    ctx.lineTo(cx - r * 0.22, cy - r * 0.07);
                    ctx.lineTo(cx - r * 0.22, cy - r * 0.31);
                    ctx.lineTo(cx - r * 0.37, cy - r * 0.31);
                    ctx.stroke();
                    ctx.closePath();
                    ctx.beginPath();
                    ctx.arc(cx - r * 0.3, cy + r * 0.21, r * 0.11, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.closePath();
                    ctx.beginPath();
                    ctx.arc(cx + r * 0.32, cy + r * 0.21, r * 0.11, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.closePath();

                    ctx.strokeRect(cx - r * 0.05, cy - r * 0.12, r * 0.24, r * 0.18);
                    ctx.strokeRect(cx + r * 0.29, cy - r * 0.12, r * 0.24, r * 0.18);
                    ctx.strokeRect(cx + r * 0.12, cy - r * 0.34, r * 0.24, r * 0.18);
                },
                onClick: () => {}
            }, {
                name: "车辆跟踪",
                detail: "功能正在等待完善",
                paint: (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) => {
                    ctx.beginPath();
                    ctx.moveTo(cx - r * 0.41, cy - r * 0.4);
                    ctx.lineTo(cx - r * 0.54, cy + r * 0.1);
                    ctx.lineTo(cx + r * 0.56, cy + r * 0.1);
                    ctx.lineTo(cx - r * 0.12, cy + r * 0.1);
                    ctx.lineTo(cx - r * 0.12, cy - r * 0.06);
                    ctx.moveTo(cx - r * 0.12, cy - r * 0.38);
                    ctx.lineTo(cx - r * 0.12, cy - r * 0.4);
                    ctx.lineTo(cx - r * 0.41, cy - r * 0.4);
                    ctx.stroke();
                    ctx.closePath();
                    ctx.beginPath();
                    ctx.moveTo(cx - r * 0.37, cy - r * 0.31);
                    ctx.lineTo(cx - r * 0.43, cy - r * 0.07);
                    ctx.lineTo(cx - r * 0.22, cy - r * 0.07);
                    ctx.lineTo(cx - r * 0.22, cy - r * 0.17);
                    ctx.moveTo(cx - r * 0.22, cy - r * 0.29);
                    ctx.lineTo(cx - r * 0.22, cy - r * 0.31);
                    ctx.lineTo(cx - r * 0.37, cy - r * 0.31);
                    ctx.stroke();
                    ctx.closePath();
                    ctx.beginPath();
                    ctx.arc(cx - r * 0.3, cy + r * 0.21, r * 0.11, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.closePath();
                    ctx.beginPath();
                    ctx.arc(cx + r * 0.32, cy + r * 0.21, r * 0.11, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.closePath();

                    ctx.beginPath();
                    ctx.arc(cx + r * 0.16, cy, r * 0.4, Math.PI * 1.2, -Math.PI * 0.2);
                    ctx.arc(cx + r * 0.16, cy - r * 0.44, r * 0.4, Math.PI * 0.2, Math.PI * 0.8);
                    ctx.closePath();
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.arc(cx + r * 0.16, cy - r * 0.22, r * 0.17, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.closePath();
                },
                onClick: () => {}
            }, {
                name: "路线规划",
                detail: "功能正在等待完善",
                paint: (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) => {
                    ctx.beginPath();
                    ctx.moveTo(cx - r * 0.11, cy + r * 0.52);
                    ctx.lineTo(cx - r * 0.11, cy + r * 0.3);
                    ctx.lineTo(cx - r * 0.25, cy - r * 0.09);
                    ctx.stroke();
                    ctx.closePath();

                    ctx.beginPath();
                    ctx.moveTo(cx, cy + r * 0.52);
                    ctx.lineTo(cx, cy - r * 0.44);
                    ctx.stroke();
                    ctx.closePath();

                    ctx.beginPath();
                    ctx.moveTo(cx + r * 0.11, cy + r * 0.52);
                    ctx.lineTo(cx + r * 0.11, cy + r * 0.19);
                    ctx.lineTo(cx + r * 0.28, cy - r * 0.36);
                    ctx.stroke();
                    ctx.closePath();

                    ctx.strokeRect(cx - r * 0.05, cy + r * 0.31, r * 0.21, r * 0.08);
                },
                onClick: () => {}
            }] } />
        </div>
    );
};
