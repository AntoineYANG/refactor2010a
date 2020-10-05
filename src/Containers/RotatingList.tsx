/*
 * @Author: Kanata You 
 * @Date: 2020-10-05 13:14:27 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2020-10-05 17:10:00
 */

import React from "react";
import ResponsiveComponent from "you-responsivecomponent";


export interface RotatingListProps {
    width: number | string;
    height: number | string;
    items: Array<{
        name: string;
        detail: string;
        onClick: () => void;
        paint: (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) => void;
    }>;
};

export interface RotatingListState {
    w: number;
    h: number;
};


export class RotatingList extends ResponsiveComponent<RotatingListProps, RotatingListState> {

    protected canvas: React.RefObject<HTMLCanvasElement>;

    protected ctx: CanvasRenderingContext2D | null;

    protected focus: number;
    protected chosen: number;

    protected items: Array<{
        name: string;
        detail: string;
        onClick: () => void;
        paint: (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) => void;
        angle: number;
        x: number;
        y: number;
        r: number;
    }>;

    public constructor(props: RotatingListProps) {
        super(props);
        this.state = {
            w: 0,
            h: 0
        };

        this.canvas = React.createRef<HTMLCanvasElement>();
        this.ctx = null;
        
        this.items = this.props.items.map((item, i) => {
            const angle: number = (270 + i * 360 / this.props.items.length) % 360;

            return {
                ...item,
                angle: angle,
                ...this.project(angle)
            };
        });

        this.focus = -1;
        this.chosen = -1;
    }

    public render(): JSX.Element {
        return (
            <canvas ref={ this.canvas }
            style={{
                width: this.props.width,
                height: this.props.height
            }}
            onMouseMove={
                e => {
                    const x: number = e.clientX - e.currentTarget.offsetLeft;
                    const y: number = e.clientY - e.currentTarget.offsetTop;
                    
                    this.focus = -1;
                    let _y: number = -Infinity;

                    for (let i: number = 0; i < this.items.length; i++) {
                        if (Math.pow(
                            x - this.items[i].x, 2
                        ) + Math.pow(
                            y - this.items[i].y, 2
                        ) <= Math.pow(this.items[i].r, 2)) {
                            if (this.items[i].y > _y) {
                                _y = this.items[i].y;
                                this.focus = i;
                            }
                        }
                    }
                }
            }
            onClick={
                e => {
                    if (this.chosen !== -1) {
                        const x: number = e.clientX - e.currentTarget.offsetLeft;
                        const y: number = e.clientY - e.currentTarget.offsetTop;

                        const item = this.items[this.chosen];

                        const da: number = (
                            this.items[this.chosen].angle >= 90 && this.items[this.chosen].angle <= 270
                        ) ? 270 - this.items[this.chosen].angle : (this.items[this.chosen].angle + 90) % 360;
            
                        const dy: number = this.state.h * Math.max(120 - da, 0) / 320;

                        if (
                            Math.abs(x - item.x) <= item.r * 1.4
                            && y >= item.y - dy - item.r * 1.5
                            && y <= item.y + 0.4 * dy + item.r * 0.5
                        ) {
                            this.items[this.chosen].onClick();
                        } else {
                            this.chosen = -1;
                        }

                        return;
                    }

                    if (this.focus !== -1) {
                        const idx: number = this.focus;
                        this.focus = -1;
                        this.chosen = idx;
                    }
                }
            }
            onMouseOut={
                () => {
                    this.focus = -1;
                }
            } />
        );
    }

    public componentWillResize(): void {
        this.canvas.current!.removeAttribute("width");
        this.canvas.current!.removeAttribute("height");
        const w: number = this.canvas.current!.clientWidth;
        const h: number = this.canvas.current!.clientHeight;

        if ((w ^ this.state.w) | (h ^ this.state.h)) {
            this.setState({
                w: w,
                h: h
            });
        }
    }

    public componentDidMountRE(): void {
        if (this.canvas.current) {
            this.ctx = this.canvas.current.getContext("2d");
        }
        this.paint();
    }
    
    public componentDidUpdate(): void {
        this.paint();
    }

    protected project(angle: number): { x: number; y: number; r: number } {
        const d: number = Math.min(this.state.w, this.state.h) * 4;
        const R: number = d / 6;
        const ty: number = 1.2 * d + R;
        const tz: number = R * 2;
        const rangeHorizontal: number = 100 / 180 * Math.PI;
        const rangeVertical: number = 60 / 180 * Math.PI;
        const x2d: number = Math.cos(angle / 180 * Math.PI) * d;
        const y2d: number = - Math.sin(angle / 180 * Math.PI) * d * 1.6;
        const dist2: number = Math.pow(x2d, 2) + Math.pow(ty - y2d, 2) + Math.pow(tz, 2);
        const dh: number = Math.sqrt(dist2) / Math.cos(rangeHorizontal / 2);
        const x: number = (0.5 + 0.5 * x2d / dh) * this.state.w;
        const dv: number = Math.sqrt(dist2) / Math.cos(rangeVertical / 2);
        const y: number = (0.4 + 0.3 * tz / dv * Math.sqrt(this.state.w / this.state.h)) * this.state.h;

        return { x, y, r: 8 * R / Math.pow(dist2, 1 / 4) };
    }

    protected paint(): void {
        if (!this.ctx) {
            return;
        }

        this.canvas.current!.width = this.state.w;
        this.canvas.current!.height = this.state.h;

        this.ctx.clearRect(0, 0, this.state.w, this.state.h);
        
        this.ctx!.strokeStyle = "rgb(204,204,204)";
        this.ctx!.lineWidth = 2;
        if (this.chosen !== -1) {
            const da: number = (
                this.items[this.chosen].angle >= 90 && this.items[this.chosen].angle <= 270
            ) ? 270 - this.items[this.chosen].angle : (this.items[this.chosen].angle + 90) % 360;

            const item = this.items[this.chosen];

            const dy: number = this.state.h * Math.max(120 - da, 0) / 320;

            if (dy > item.r * 0.6) {
                this.ctx!.strokeRect(
                    item.x - item.r * 1.4,
                    item.y - dy - item.r * 1.5,
                    item.r * 2.8,
                    1.6 * dy + item.r * 2
                );
            
                this.ctx!.font = `${ item.r / 4 }px Verdana`;
                this.ctx!.fillStyle = "rgb(204,204,204)";
                this.ctx!.fillText(
                    item.detail, item.x - item.r * 0.12 * item.detail.length, item.y + item.r * 2.4 - dy
                );
            }

            this.ctx!.fillStyle = "rgba(204,204,204,0.4)";
            this.drawWave(item.x, item.y - dy, item.r);

            this.ctx!.font = `${ item.r / 3 }px Verdana`;
            this.ctx!.fillStyle = "rgb(204,204,204)";
            this.ctx!.fillText(
                item.name, item.x - item.r * 0.16 * item.name.length, item.y + item.r * 1.6 - dy
            );

            item.paint(this.ctx!, item.x, item.y - dy, item.r);

            if (da >= 10) {
                this.ctx!.globalAlpha = Math.min(1, da / 60);
                this.items.map((d, i) => {
                    return {
                        ...d,
                        index: i
                    };
                }).sort((a, b) => a.y - b.y).forEach(item => {
                    if (item.index === this.chosen) {
                        return;
                    }
                    
                    this.ctx!.fillStyle = "rgba(204,204,204,0.1)";
                    this.ctx!.beginPath();
                    this.ctx!.arc(item.x, item.y, item.r, 0, Math.PI * 2);
                    // this.ctx!.stroke();
                    this.ctx!.fill();
        
                    item.paint(this.ctx!, item.x, item.y, item.r);
                });
                this.ctx!.globalAlpha = 1;
            }
        } else {
            this.items.map((d, i) => {
                return {
                    ...d,
                    index: i
                };
            }).sort((a, b) => a.y - b.y).forEach(item => {
                if (item.index === this.focus) {
                    this.ctx!.fillStyle = "rgba(204,204,204,0.4)";
                    this.drawWave(item.x, item.y, item.r);
                } else {
                    this.ctx!.fillStyle = "rgba(204,204,204,0.1)";
                    this.ctx!.beginPath();
                    this.ctx!.arc(item.x, item.y, item.r, 0, Math.PI * 2);
                    // this.ctx!.stroke();
                    this.ctx!.fill();
                }
    
                this.ctx!.font = `${ item.r / 3 }px Verdana`;
                this.ctx!.fillStyle = "rgb(204,204,204)";
                this.ctx!.fillText(
                    item.name, item.x - item.r * 0.16 * item.name.length, item.y + item.r * 1.6
                );
    
                item.paint(this.ctx!, item.x, item.y, item.r);
            });
        }

        setTimeout(() => {
            try {
                if (this.chosen !== -1) {
                    if (this.items[this.chosen].angle >= 90 && this.items[this.chosen].angle <= 270) {
                        const da: number = 270 - this.items[this.chosen].angle;
                        this.items = this.items.map(item => {
                            const angle: number = (item.angle + Math.min(3, da)) % 360;
                
                            return {
                                ...item,
                                angle: angle,
                                ...this.project(angle)
                            };
                        });
                    } else {
                        const da: number = (this.items[this.chosen].angle + 90) % 360;
                        this.items = this.items.map(item => {
                            const angle: number = (item.angle - Math.min(3, da)) % 360;
                
                            return {
                                ...item,
                                angle: angle,
                                ...this.project(angle)
                            };
                        });
                    }
                } else if (this.focus === -1) {
                    this.items = this.items.map(item => {
                        const angle: number = (item.angle + 0.2) % 360;
            
                        return {
                            ...item,
                            angle: angle,
                            ...this.project(angle)
                        };
                    });
                }

                this.paint();
            } catch {}
        }, 40);
    }

    protected drawWave(cx: number, cy: number, r: number): void {
        this.ctx!.beginPath();
        this.ctx!.arc(cx, cy, r, 0, Math.PI * 2);
        // this.ctx!.stroke();
        this.ctx!.fill();
    }

};
