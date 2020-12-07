/*
 * @Author: Antoine YANG 
 * @Date: 2020-07-23 23:38:34 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2020-11-30 21:24:12
 */

let geometry = {
    x: [0, 0],
    y: [0, 0]
};

// 预先准备的 12 种颜色
const colortab = [
    "rgb(44,110,190)",
    "rgb(48,179,224)",
    "rgb(139,240,252)",
    "rgb(159,255,184)",
    "rgb(255,219,92)",
    "rgb(251,114,147)",
    "rgb(224,98,174)",
    "rgb(230,144,209)",
    "rgb(231,188,243)",
    "rgb(157,150,245)",
    "rgb(158,75,217)",
    "rgb(150,191,255)"
];

let _cr = 0;

let moving = null;
let movingOffset = [0, 0];
let resizing = null;

// source: [图表的引用, 表示数据类别的键名]
let source = null;
// 添加数据到图表
const appending = data => {
    if (source) {
        const key = source[1];
        let o = {};
        o[key] = [...source[0]['<state>'].data[key], data];
        if (source[0]['<props>'].id.endsWith("(map)")) {
            if (key === "points" && Check.isGeoPointArray(data.data)) {
                // ok
            } else if (key === "paths" && Check.isGeoPathArray(data.data)) {
                // ok
            } else {
                alert("数据类型不匹配");
                return;
            }
        } else if (source[0]['<props>'].id.endsWith("(2d)")) {
            if (key === "scatters" && Check.isPoint2dArray(data.data)) {
                // ok
            } else if (key === "polylines" && Check.isPath2dArray(data.data)) {
                // ok
            } else {
                alert("数据类型不匹配");
                return;
            }
        }
        source[0].update({
            data: {
                ...source[0]['<state>'].data,
                ...o
            }
        });
        source = null;
        W.update({});
    }
};

// 查找移除数据
const delData = (e, t, i) => {
    const n = e.parentElement.parentElement.parentElement.children[0].textContent;
    let m = null;
    for (let j = 0; j < G['<state>'].list.length; j++) {
        if (G['<state>'].list[j].ref['<props>'].id === n) {
            m = G['<state>'].list[j].ref;
            break;
        }
    }
    if (!m) {
        alert("出现预期外的结果，操作失败。");
    } else {
        let o = {};
        o[t] = m['<state>'].data[t].filter((_, j) => j !== i);
        m.update({
            data: {
                ...m['<state>'].data,
                ...o
            }
        });
        W.update({});
    }
};

// 直接移除数据
const unlinkData = (e, t, i) => {
    let o = {};
    o[t] = e['<state>'].data[t].filter((_, j) => j !== i);
    e.update({
        data: {
            ...e['<state>'].data,
            ...o
        }
    });
    W.update({});
};

// 删除数据集
const delDataset = i => {
    W["<state>"].charts.forEach(chart => {
        if (chart.ref["<props>"].id.endsWith("(map)")) {
            let nextPoints = [];
            chart.ref['<state>'].data.points.forEach(p => {
                if (W["<state>"].data[i].name !== p.name) {
                    nextPoints.push(p);
                }
            });
            let nextPaths = [];
            chart.ref['<state>'].data.paths.forEach(p => {
                if (W["<state>"].data[i].name !== p.name) {
                    nextPaths.push(p);
                }
            });
            if (nextPoints.length < chart.ref['<state>'].data.points.length
            || nextPaths.length < chart.ref['<state>'].data.paths.length) {
                chart.ref.update({
                    data: {
                        points: nextPoints,
                        paths: nextPaths
                    }
                });
            }
        } else if (chart.ref["<props>"].id.endsWith("(2d)")) {
            let nextScatters = [];
            chart.ref['<state>'].data.scatters.forEach(p => {
                if (W["<state>"].data[i].name !== p.name) {
                    nextScatters.push(p);
                }
            });
            let nextPolylines = [];
            chart.ref['<state>'].data.polylines.forEach(p => {
                if (W["<state>"].data[i].name !== p.name) {
                    nextPolylines.push(p);
                }
            });
            if (nextScatters.length < chart.ref['<state>'].data.scatters.length
            || nextPolylines.length < chart.ref['<state>'].data.polylines.length) {
                chart.ref.update({
                    data: {
                        scatters: nextScatters,
                        polylines: nextPolylines
                    }
                });
            }
        }
    });
    W.update({
        data: W["<state>"].data.filter((_, j) => j !== i)
    });
};

// 白板视图
const Bf = (id, x, y) => {
    const m = createNode({
        id: id,
        info: () => ""
    }, {
        active: true,
        x: x,
        y: y,
        w: 450,
        h: 300
    }).render(() => {
        return [{
            id: m["<props>"].id + "#",
            tag: "div",
            parent: $("#G")[0],
            style: {
                position: "absolute",
                left: (m['<state>'].x - geometry.x[0]) + "px",
                top: (m['<state>'].y - geometry.y[0]) + "px",
                "background-color": "rgb(245,245,245)",
                border: "1px solid rgb(205,205,205)",
                padding: "8px 10px 10px"
            }
        }, {
            id: m["<props>"].id + "_t",
            tag: "div",
            parent: m["<props>"].id + "#",
            attr: {
                ondblclick: () => {
                    const _p = $("#G")[0];
                    const _s = m.find(m["<props>"].id + "#");
                    _s.remove();
                    _p.appendChild(_s);
                }
            },
            style: {
                height: "24px",
                "margin-bottom": "8px"
            }
        }, {
            id: m["<props>"].id + "_move",
            tag: "img",
            parent: m["<props>"].id + "_t",
            attr: {
                src: "./static/img/move.jpg",
                alt: "move",
                width: "24",
                height: "24",
                title: "拖动视图",
                ondragstart: () => false,
                onmousedown: e => {
                    moving = m;
                    movingOffset = [
                        e.pageX - parseFloat(m['<state>'].x),
                        e.pageY - parseFloat(m['<state>'].y)
                    ];
                }
            },
            style: {
                "user-select": "none",
                cursor: "move"
            }
        }, {
            id: m["<props>"].id + "_top",
            tag: "img",
            parent: m["<props>"].id + "_t",
            attr: {
                src: "./static/img/top.jpg",
                alt: "top",
                width: "24",
                height: "24",
                title: "置顶视图 (您也可以双击视图顶端)",
                ondragstart: () => false,
                onclick: () => {
                    const _p = $("#G")[0];
                    const _s = m.find(m["<props>"].id + "#");
                    _s.remove();
                    _p.appendChild(_s);
                }
            },
            style: {
                "user-select": "none",
                cursor: "pointer",
                "margin-left": "4px"
            }
        }, {
            id: m["<props>"].id + "_remove",
            tag: "img",
            parent: m["<props>"].id + "_t",
            attr: {
                src: "./static/img/remove.jpg",
                alt: "remove",
                width: "24",
                height: "24",
                title: "删除视图",
                ondragstart: () => false,
                onclick: () => {
                    const _s = m.find(m["<props>"].id + "#");
                    _s.remove();
                    m['<state>'].active = false;
                    if (W["<parent>"]) {
                        W.update({
                            charts: [...G["<state>"].list.filter(d => d.ref['<state>'].active)]
                        });
                    }
                }
            },
            style: {
                "user-select": "none",
                cursor: "pointer",
                "margin-left": "4px"
            }
        }, {
            id: m["<props>"].id + "_name",
            tag: "label",
            parent: m["<props>"].id + "_t",
            attr: {
                title: m["<props>"].id
            },
            text: m["<props>"].id,
            style: {
                "user-select": "none",
                margin: "0px 10px",
                height: "24px",
                display: "inline-block",
                transform: "translateY(-7px)",
                "background-color": "cornsilk",
                padding: "0 0.3em"
            }
        }, {
            id: m["<props>"].id + "_",
            tag: "div",
            parent: m["<props>"].id + "#",
            attr: {
                id: m["<props>"].id + "_"
            },
            style: {
                "background-color": "rgb(245,245,245)",
                border: "1px solid rgb(205,205,205)",
                width: m["<state>"].w + "px",
                height: m["<state>"].h + "px",
                "min-width": "12vw",
                "min-height": "12vh",
                "max-width": (geometry.x[1] - geometry.x[0]) * 0.8,
                "max-height": (geometry.y[1] - geometry.y[0]) * 0.8
            }
        }, {
            id: m["<props>"].id + "_resize",
            tag: "div",
            parent: m["<props>"].id + "#",
            attr: {
                onmousedown: e => {
                    resizing = m;
                    movingOffset = [
                        e.pageX - m['<state>'].x - m['<state>'].w,
                        e.pageY - m['<state>'].y - m['<state>'].h
                    ];
                }
            },
            style: {
                "background-color": "rgba(0,116,232,0.2)",
                width: "16px",
                height: "16px",
                position: "absolute",
                right: "-6px",
                bottom: "-6px",
                cursor: "nw-resize"
            }
        }];
    });

    return m;
};

// 散点折线视图
const Pf = (id, x, y) => {
    const allocated = G['<state>'].list.filter(d => d.ref['<state>'].active).length;
    let displayType = allocated === 0 ? "only" : "free";
    if (allocated === 1) {
        const before = G['<state>'].list.filter(
            d => d.ref['<state>'].active
        )[0].ref['<state>'];
        if (!before.positionChanged) {
            before.x = geometry.x[0];
            before.y = geometry.y[0];
            G['<state>'].list.filter(
                d => d.ref['<state>'].active
            )[0].ref.update({
                w: 420
            });
            displayType = "right";
        }
    }

    const m = createNode({
        id: id,
        info: () => (
            `<div style="color: rgb(205,205,210);`
            + ` font-size: 80%; padding: 0.2em 0.8em;" >`
                + `<label>x 轴值域范围: [${
                    m['<state>'].range.x[0].toFixed(2)
                }, ${
                    m['<state>'].range.x[1].toFixed(2)
                }]</label>`
                + `<br />`
                + `<label>y 轴值域范围: [${
                    m['<state>'].range.y[0].toFixed(2)
                }, ${
                    m['<state>'].range.y[1].toFixed(2)
                }]</label>`
            + `</div>`
            + `<div style="color: rgb(205,205,210); font-size: 80%; padding: 0.1em 0.4em; `
            + `border: 1px solid; margin: 0.4em;" >`
                + `<label>散点 (${ m['<state>'].data.scatters.length })</label>`
                + `<div style="text-align: end; margin: -14px 0px -4px;" >`
                    + `<img src="./static/img/add.jpg" width="18" height="18"`
                    + ` onclick="bindData(this, 'scatters');" class="import"`
                    + ` ondragstart="return false;" title="导入数据"`
                    + ` style="opacity: 0.5;" />`
                + `</div>`
                + `<hr style="margin-top: -0.1em;" />`
                + (
                    m['<state>'].data.scatters.map((d, idx) => {
                        return `<label`
                        + ` style="display: block; margin: 0.1em 0;`
                        + ` background-color: darkslategrey; padding: 0.2em;" >`
                            + `<span title="${ JSON.stringify(d.data) }">`
                                + `${ d.name }`
                            + `</span>`
                        + `</label>`
                        + `<div style="text-align: end;`
                        + ` pointer-events: none; margin-bottom: -18px;`
                        + ` transform: translate(-2px, -20px);">`
                            + `<img src="./static/img/delete.jpg" width="16" height="16"`
                            + ` style="pointer-events: all;" `
                            + ` onclick="delData(this, 'scatters', ${ idx })" `
                            + ` ondragstart="return false;" />`
                        + `</div>`;
                    }).join("")
                )
                + "<br />"
                + `<label>折线 (${ m['<state>'].data.polylines.length })</label>`
                + `<div style="text-align: end; margin: -14px 0px -4px;" >`
                    + `<img src="./static/img/add.jpg" width="18" height="18"`
                    + ` onclick="bindData(this, 'polylines');" class="import"`
                    + ` ondragstart="return false;" title="导入数据"`
                    + ` style="opacity: 0.5;" />`
                + `</div>`
                + `<hr style="margin-top: -0.1em;" />`
                + (
                    m['<state>'].data.polylines.map((d, idx) => {
                        return `<label`
                        + ` style="display: block; margin: 0.1em 0;`
                        + ` background-color: darkslategrey; padding: 0.2em;" >`
                            + `<span title="${ JSON.stringify(d.data) }">`
                                + `${ d.name }`
                            + `</span>`
                        + `</label>`
                        + `<div style="text-align: end;`
                        + ` pointer-events: none; margin-bottom: -18px;`
                        + ` transform: translate(-2px, -20px);">`
                            + `<img src="./static/img/delete.jpg" width="16" height="16"`
                            + ` style="pointer-events: all;" `
                            + ` onclick="delData(this, 'polylines', ${ idx })" `
                            + ` ondragstart="return false;" />`
                        + `</div>`;
                    }).join("")
                ) + "<br />"
            + `</div>`
        )
    }, {
        active: true,
        range: {
            x: [-1, 1],
            y: [-1, 1]
        },
        preRange: {
            x: [-1, 1],
            y: [-1, 1]
        },
        data: {
            scatters: [],
            polylines: []
        },
        snapshot: null,
        dragging: null,
        x: displayType === "only" ? geometry.x[0] : displayType === "right" ? (
            geometry.x[0] + 445
        ) : x,
        y: displayType === "only" ? geometry.y[0] : displayType === "right" ? (
            geometry.y[0]
        ) : y,
        w: displayType === "only" ? 860 : displayType === "right" ? 420 : 450,
        h: displayType === "only" ? 613 : displayType === "right" ? 613 : 300,
        positionChanged: false
    }).render(() => {
        if (m["<state>"].data.scatters.length || m["<state>"].data.polylines.length) {
            const snapshot = JSON.stringify(m["<state>"].data);
            if (snapshot === m["<state>"].snapshot) {
                // 没变
            } else {
                m["<state>"].snapshot = snapshot;
                m["<state>"].range = {
                    x: [NaN, NaN],
                    y: [NaN, NaN]
                };
                m["<state>"].data.scatters.forEach(sct => {
                    sct.data.forEach(p => {
                        m["<state>"].range.x = [
                            isNaN(m["<state>"].range.x[0]) || p[0] < m["<state>"].range.x[0] ? p[0] : m["<state>"].range.x[0],
                            isNaN(m["<state>"].range.x[1]) || p[0] > m["<state>"].range.x[1] ? p[0] : m["<state>"].range.x[1]
                        ];
                        m["<state>"].range.y = [
                            isNaN(m["<state>"].range.y[0]) || p[1] < m["<state>"].range.y[0] ? p[1] : m["<state>"].range.y[0],
                            isNaN(m["<state>"].range.y[1]) || p[1] > m["<state>"].range.y[1] ? p[1] : m["<state>"].range.y[1]
                        ];
                    });
                });
                m["<state>"].data.polylines.forEach(plls => {
                    plls.data.forEach(pll => {
                        pll.forEach(p => {
                            m["<state>"].range.x = [
                                isNaN(m["<state>"].range.x[0]) || p[0] < m["<state>"].range.x[0] ? p[0] : m["<state>"].range.x[0],
                                isNaN(m["<state>"].range.x[1]) || p[0] > m["<state>"].range.x[1] ? p[0] : m["<state>"].range.x[1]
                            ];
                            m["<state>"].range.y = [
                                isNaN(m["<state>"].range.y[0]) || p[1] < m["<state>"].range.y[0] ? p[1] : m["<state>"].range.y[0],
                                isNaN(m["<state>"].range.y[1]) || p[1] > m["<state>"].range.y[1] ? p[1] : m["<state>"].range.y[1]
                            ];
                        });
                    });
                });
                const dx = m["<state>"].range.x[1] - m["<state>"].range.x[0];
                const dy = m["<state>"].range.y[1] - m["<state>"].range.y[0];
                m["<state>"].range.x[0] -= dx * 0.05 || 0.2;
                m["<state>"].range.x[1] += dx * 0.05 || 0.2;
                m["<state>"].range.y[0] -= dy * 0.05 || 0.2;
                m["<state>"].range.y[1] += dy * 0.05 || 0.2;
                m["<state>"].preRange = {
                    x: [...m["<state>"].range.x],
                    y: [...m["<state>"].range.y]
                };
            }
        } else {
            m["<state>"].range = {
                x: [-1, 1],
                y: [-1, 1]
            };
            m["<state>"].preRange = {
                x: [-1, 1],
                y: [-1, 1]
            };
        }

        const xMin = Math.min(...m["<state>"].range.x);
        const xMax = Math.max(...m["<state>"].range.x);
        const yMin = Math.min(...m["<state>"].range.y);
        const yMax = Math.max(...m["<state>"].range.y);

        const xLev = Math.round(
            Math.log10((xMax - xMin) / (5 + m["<state>"].w / 40))
        );
        const yLev = Math.round(
            Math.log10((yMax - yMin) / (5 + m["<state>"].h / 40))
        );
        let xTicks = [];
        let xSpan = Math.pow(10, xLev);
        while ((xMax - xMin) / xSpan > m["<state>"].w / 30) {
            xSpan *= 2;
        }
        if (m["<state>"].range.x[1] * m["<state>"].range.x[0] <= 0) {
            // 包含 0
            for (let i = 0; i >= xMin; i -= xSpan) {
                xTicks = [i, ...xTicks];
            }
            for (let i = xSpan; i <= xMax; i += xSpan) {
                xTicks.push(i);
            }
        } else {
            for (let i = xMin; i <= xMax; i += xSpan) {
                xTicks.push(i);
            }
        }
        let yTicks = [];
        let ySpan = Math.pow(10, yLev);
        while ((yMax - yMin) / ySpan > m["<state>"].h / 30) {
            ySpan *= 2;
        }
        if (m["<state>"].range.y[1] * m["<state>"].range.y[0] <= 0) {
            // 包含 0
            for (let i = 0; i >= yMin; i -= ySpan) {
                yTicks = [i, ...yTicks];
            }
            for (let i = ySpan; i <= yMax; i += ySpan) {
                yTicks.push(i);
            }
        } else {
            for (let i = yMin; i <= yMax; i += ySpan) {
                yTicks.push(i);
            }
        }

        const fx = x => m["<state>"].w * (x - xMin) / (xMax - xMin);
        const fy = y => m["<state>"].h * (yMax - y) / (yMax - yMin);

        return [{
            id: m["<props>"].id + "#",
            tag: "div",
            parent: $("#G")[0],
            style: {
                position: "absolute",
                left: (m['<state>'].x - geometry.x[0]) + "px",
                top: (m['<state>'].y - geometry.y[0]) + "px",
                "background-color": "rgb(245,245,245)",
                border: "1px solid rgb(205,205,205)",
                padding: "8px 10px 10px"
            }
        }, {
            id: m["<props>"].id + "_t",
            tag: "div",
            parent: m["<props>"].id + "#",
            attr: {
                ondblclick: () => {
                    const _p = $("#G")[0];
                    const _s = m.find(m["<props>"].id + "#");
                    _s.remove();
                    _p.appendChild(_s);
                }
            },
            style: {
                height: "24px",
                "margin-bottom": "8px"
            }
        }, {
            id: m["<props>"].id + "_move",
            tag: "img",
            parent: m["<props>"].id + "_t",
            attr: {
                src: "./static/img/move.jpg",
                alt: "move",
                width: "24",
                height: "24",
                title: "拖动视图",
                ondragstart: () => false,
                onmousedown: e => {
                    moving = m;
                    movingOffset = [
                        e.pageX - parseFloat(m['<state>'].x),
                        e.pageY - parseFloat(m['<state>'].y)
                    ];
                }
            },
            style: {
                "user-select": "none",
                cursor: "move"
            }
        }, {
            id: m["<props>"].id + "_top",
            tag: "img",
            parent: m["<props>"].id + "_t",
            attr: {
                src: "./static/img/top.jpg",
                alt: "top",
                width: "24",
                height: "24",
                title: "置顶视图 (您也可以双击视图顶端)",
                ondragstart: () => false,
                onclick: () => {
                    const _p = $("#G")[0];
                    const _s = m.find(m["<props>"].id + "#");
                    _s.remove();
                    _p.appendChild(_s);
                }
            },
            style: {
                "user-select": "none",
                cursor: "pointer",
                "margin-left": "4px"
            }
        }, {
            id: m["<props>"].id + "_remove",
            tag: "img",
            parent: m["<props>"].id + "_t",
            attr: {
                src: "./static/img/remove.jpg",
                alt: "remove",
                width: "24",
                height: "24",
                title: "删除视图",
                ondragstart: () => false,
                onclick: () => {
                    const _s = m.find(m["<props>"].id + "#");
                    _s.remove();
                    m['<state>'].active = false;
                    if (W["<parent>"]) {
                        W.update({
                            charts: [...G["<state>"].list.filter(d => d.ref['<state>'].active)]
                        });
                    }
                }
            },
            style: {
                "user-select": "none",
                cursor: "pointer",
                "margin-left": "4px"
            }
        }, {
            id: m["<props>"].id + "_home",
            tag: "img",
            parent: m["<props>"].id + "_t",
            attr: {
                src: "./static/img/home.jpg",
                alt: "reset",
                width: "24",
                height: "24",
                title: "还原比例尺",
                ondragstart: () => false,
                onclick: () => {
                    m.update({
                        range: {
                            x: [...m["<state>"].preRange.x],
                            y: [...m["<state>"].preRange.y]
                        }
                    });
                }
            },
            style: {
                "user-select": "none",
                cursor: "pointer",
                "margin-left": "4px"
            }
        }, {
            id: m["<props>"].id + "_name",
            tag: "label",
            parent: m["<props>"].id + "_t",
            attr: {
                title: m["<props>"].id
            },
            text: m["<props>"].id,
            style: {
                "user-select": "none",
                margin: "0px 10px",
                height: "24px",
                display: "inline-block",
                transform: "translateY(-7px)",
                "background-color": "cornsilk",
                padding: "0 0.3em"
            }
        }, {
            id: m["<props>"].id + "_container",
            tag: "div",
            parent: m["<props>"].id + "#",
            style: {
                width: m["<state>"].w + "px",
                height: m["<state>"].h + "px"
            }
        }, {
            id: m["<props>"].id + "_svg",
            tag: "svg.svg",
            parent: m["<props>"].id + "_container",
            attr: {
                width: m["<state>"].w + "px",
                height: m["<state>"].h + "px",
                onmousedown: e => {
                    m["<state>"].dragging = {
                        x: e.offsetX,
                        y: e.offsetY
                    };
                },
                onmouseout: () => {
                    m["<state>"].dragging = null;
                },
                onmouseup: () => {
                    m["<state>"].dragging = null;
                },
                ondblclick: e => {
                    const xb = e.offsetX / m["<state>"].w * Math.abs(
                        m["<state>"].range.x[1] - m["<state>"].range.x[0]
                    ) + m["<state>"].range.x[0];
                    const yb = (1 - e.offsetY / m["<state>"].h) * Math.abs(
                        m["<state>"].range.y[1] - m["<state>"].range.y[0]
                    ) + m["<state>"].range.y[0];
                    m.update({
                        range: {
                            x: [
                                0.3 * xb + 0.7 * m["<state>"].range.x[0],
                                0.3 * xb + 0.7 * m["<state>"].range.x[1]
                            ],
                            y: [
                                0.3 * yb + 0.7 * m["<state>"].range.y[0],
                                0.3 * yb + 0.7 * m["<state>"].range.y[1]
                            ]
                        }
                    });
                },
                onmousemove: e => {
                    if (m["<state>"].dragging) {
                        const dx = e.offsetX - m["<state>"].dragging.x;
                        m["<state>"].dragging.x = e.offsetX;
                        const dy = e.offsetY - m["<state>"].dragging.y;
                        m["<state>"].dragging.y = e.offsetY;
                        const tx = dx / m["<state>"].w * Math.abs(
                            m["<state>"].range.x[1] - m["<state>"].range.x[0]
                        ) * 2.6;
                        const ty = dy / m["<state>"].h * Math.abs(
                            m["<state>"].range.y[1] - m["<state>"].range.y[0]
                        ) * 2.6;
                        m.update({
                            range: {
                                x: [
                                    m["<state>"].range.x[0] - tx,
                                    m["<state>"].range.x[1] - tx
                                ],
                                y: [
                                    m["<state>"].range.y[0] + ty,
                                    m["<state>"].range.y[1] + ty
                                ]
                            }
                        });
                    }
                }
            },
            style: {
                "background-color": "rgb(245,245,245)",
                border: "1px solid rgb(205,205,205)",
                "min-width": "12vw",
                "min-height": "12vh",
                // "max-width": (geometry.x[1] - geometry.x[0]) * 0.8,
                // "max-height": (geometry.y[1] - geometry.y[0]) * 0.8,
                cursor: "grab"
            }
        }, {
            id: m["<props>"].id + "_resizeX",
            tag: "svg.rect",
            parent: m["<props>"].id + "_svg",
            attr: {
                x: 24,
                width: m["<state>"].w - 24,
                y: m["<state>"].h - 24,
                height: 24,
                onmousedown: e => {
                    m["<state>"].dragging = {
                        x: e.offsetX,
                        y: e.offsetY
                    };
                    $(m.find(m["<props>"].id + "_resizeX")).css(
                        "fill", "rgba(25,195,235,0.2)"
                    );
                    return false;
                },
                onmouseover: () => {
                    $(m.find(m["<props>"].id + "_resizeX")).css(
                        "fill", "rgba(25,195,235,0.08)"
                    );
                },
                onmouseout: () => {
                    m["<state>"].dragging = null;
                    $(m.find(m["<props>"].id + "_resizeX")).css(
                        "fill", "rgba(25,195,235,0)"
                    );
                    return false;
                },
                onmouseup: () => {
                    m["<state>"].dragging = null;
                    $(m.find(m["<props>"].id + "_resizeX")).css(
                        "fill", "rgba(25,195,235,0.08)"
                    );
                    return false;
                },
                ondblclick: () => {
                    m.update({
                        range: {
                            x: [...m["<state>"].preRange.x],
                            y: [...m["<state>"].range.y]
                        }
                    });
                    return false;
                },
                onmousemove: e => {
                    if (m["<state>"].dragging) {
                        $(m.find(m["<props>"].id + "_resizeX")).css(
                            "fill", "rgba(25,195,235,0.2)"
                        );
                        const dx = e.offsetX / m["<state>"].dragging.x;
                        m["<state>"].dragging.x = e.offsetX;
                        m.update({
                            range: {
                                x: [
                                    m["<state>"].range.x[0],
                                    m["<state>"].range.x[0] * (1 - 1 / dx)
                                    + m["<state>"].range.x[1] / dx
                                ],
                                y: [...m["<state>"].range.y]
                            }
                        });
                    }
                    return false;
                }
            },
            style: {
                fill: "rgba(25,195,235,0)",
                cursor: "e-resize"
            }
        }, {
            id: m["<props>"].id + "_resizeY",
            tag: "svg.rect",
            parent: m["<props>"].id + "_svg",
            attr: {
                x: 0,
                width: 24,
                y: 0,
                height: m["<state>"].h,
                onmousedown: e => {
                    m["<state>"].dragging = {
                        x: e.offsetX,
                        y: e.offsetY
                    };
                    $(m.find(m["<props>"].id + "_resizeY")).css(
                        "fill", "rgba(25,195,235,0.2)"
                    );
                    return false;
                },
                onmouseover: () => {
                    $(m.find(m["<props>"].id + "_resizeY")).css(
                        "fill", "rgba(25,195,235,0.08)"
                    );
                },
                onmouseout: () => {
                    m["<state>"].dragging = null;
                    $(m.find(m["<props>"].id + "_resizeY")).css(
                        "fill", "rgba(25,195,235,0)"
                    );
                    return false;
                },
                onmouseup: () => {
                    m["<state>"].dragging = null;
                    $(m.find(m["<props>"].id + "_resizeY")).css(
                        "fill", "rgba(25,195,235,0.08)"
                    );
                    return false;
                },
                ondblclick: () => {
                    m.update({
                        range: {
                            x: [...m["<state>"].range.x],
                            y: [...m["<state>"].preRange.y]
                        }
                    });
                    return false;
                },
                onmousemove: e => {
                    if (m["<state>"].dragging) {
                        $(m.find(m["<props>"].id + "_resizeY")).css(
                            "fill", "rgba(25,195,235,0.2)"
                        );
                        const dy = (
                            m["<state>"].h - e.offsetY
                        ) / (
                            m["<state>"].h - m["<state>"].dragging.y
                        );
                        m["<state>"].dragging.y = e.offsetY;
                        m.update({
                            range: {
                                x: [...m["<state>"].range.x],
                                y: [
                                    m["<state>"].range.y[0],
                                    m["<state>"].range.y[0] * (1 - 1 / dy)
                                    + m["<state>"].range.y[1] / dy
                                ]
                            }
                        });
                    }
                    return false;
                }
            },
            style: {
                fill: "rgba(25,195,235,0)",
                cursor: "n-resize"
            }
        }, ...yTicks.map(t => {
            const y = yLev === 0 ? Math.round(t).toLocaleString()
                : yLev < 0 ? t.toFixed(-yLev).toLocaleString()
                    : (Math.round(t / Math.pow(10, yLev)) * Math.pow(10, yLev)).toLocaleString();
            return [{
                id: m["<props>"].id + "_tickY_" + y,
                tag: "svg.line",
                parent: m["<props>"].id + "_svg",
                attr: {
                    x1: 0,
                    x2: m["<state>"].w,
                    y1: fy(t),
                    y2: fy(t)
                },
                style: {
                    stroke: "rgb(96,96,96)",
                    opacity: t === 0 ? 1 : 0.5,
                    "stroke-width": t === 0 ? "2px" : "1px",
                    "pointer-events": "none"
                }
            }, {
                id: m["<props>"].id + "_labelY_" + y,
                tag: "svg.text",
                parent: m["<props>"].id + "_svg",
                attr: {
                    x: 0,
                    y: fy(t),
                    "text-anchor": "middle",
                    innerHTML: y
                },
                style: {
                    "user-select": "none",
                    fill: "rgb(102,102,102)",
                    transform: "translate(2em, 0.25em)",
                    "font-size": "84%",
                    "pointer-events": "none"
                }
            }];
        }).flat(), ...xTicks.map(t => {
            const x = xLev === 0 ? Math.round(t).toLocaleString()
                : xLev < 0 ? t.toFixed(-xLev).toLocaleString()
                    : (Math.round(t / Math.pow(10, xLev)) * Math.pow(10, xLev)).toLocaleString();
            return [{
                id: m["<props>"].id + "_tickX_" + x,
                tag: "svg.line",
                parent: m["<props>"].id + "_svg",
                attr: {
                    x1: fx(x),
                    x2: fx(x),
                    y1: 0,
                    y2: m["<state>"].h
                },
                style: {
                    stroke: "rgb(96,96,96)",
                    opacity: t === 0 ? 1 : 0.5,
                    "stroke-width": t === 0 ? "2px" : "1px",
                    "pointer-events": "none"
                }
            }, {
                id: m["<props>"].id + "_labelX_" + x,
                tag: "svg.text",
                parent: m["<props>"].id + "_svg",
                attr: {
                    x: fx(x),
                    y: m["<state>"].h,
                    "text-anchor": "middle",
                    innerHTML: x
                },
                style: {
                    "user-select": "none",
                    fill: "rgb(102,102,102)",
                    transform: "translateY(-0.5em)",
                    "font-size": "84%",
                    "pointer-events": "none"
                }
            }];
        }).flat(), ...m["<state>"].data.scatters.map((sct, j) => {
            const xLev2 = xLev - 1;
            const yLev2 = yLev - 1;
            return sct.data.map((p, i) => {
                const x = xLev2 === 0 ? Math.round(p[0]).toLocaleString()
                : xLev2 < 0 ? p[0].toFixed(-xLev2).toLocaleString()
                    : (Math.round(p[0] / Math.pow(10, xLev2)) * Math.pow(10, xLev2)).toLocaleString();
                const y = yLev2 === 0 ? Math.round(p[1]).toLocaleString()
                : yLev2 < 0 ? p[1].toFixed(-yLev2).toLocaleString()
                    : (Math.round(p[1] / Math.pow(10, yLev2)) * Math.pow(10, yLev2)).toLocaleString();
                return [{
                    id: m["<props>"].id + "&data=" + sct.name + "&idx=" + i,
                    tag: "svg.circle",
                    parent: m["<props>"].id + "_svg",
                    attr: {
                        cx: fx(p[0]),
                        cy: fy(p[1]),
                        r: 5,
                        onmouseover: () => {
                            $(m.find(m["<props>"].id + "&data=" + sct.name + "&idx=" + i + " =title")).show();
                        },
                        onmouseout: () => {
                            $(m.find(m["<props>"].id + "&data=" + sct.name + "&idx=" + i + " =title")).hide();
                        }
                    },
                    style: {
                        stroke: "rgb(96,96,96)",
                        fill: colortab[j % 12],
                        opacity: 0.9,
                        cursor: "crosshair"
                    }
                }, {
                    id: m["<props>"].id + "&data=" + sct.name + "&idx=" + i + " =title",
                    tag: "svg.text",
                    parent: m["<props>"].id + "_svg",
                    attr: {
                        x: fx(p[0]),
                        y: fy(p[1]),
                        "text-anchor": "middle",
                        innerHTML: `[${ x }, ${ y }]`
                    },
                    style: {
                        "user-select": "none",
                        "font-size": "84%",
                        transform: `translateY(${ fy(p[1]) < 20 ? 18 : -8 }px)`,
                        display: "none"
                    }
                }];
            });
        }).flat(Infinity), ...m["<state>"].data.polylines.map(plls => {
            const xLev2 = xLev - 1;
            const yLev2 = yLev - 1;
            return plls.data.map((pll, i) => {
                let d = "";
                const ps = pll.map((p, g) => {
                    const x = xLev2 === 0 ? Math.round(p[0]).toLocaleString()
                    : xLev2 < 0 ? p[0].toFixed(-xLev2).toLocaleString()
                        : (Math.round(p[0] / Math.pow(10, xLev2)) * Math.pow(10, xLev2)).toLocaleString();
                    const y = yLev2 === 0 ? Math.round(p[1]).toLocaleString()
                    : yLev2 < 0 ? p[1].toFixed(-yLev2).toLocaleString()
                        : (Math.round(p[1] / Math.pow(10, yLev2)) * Math.pow(10, yLev2)).toLocaleString();
                    d += `${ g === 0 ? "M" : " L" }${ fx(x) },${ fy(y) }`;
                    return [x, y, p];
                });
                return [{
                    id: m["<props>"].id + "&&data=" + plls.name + "&idx=" + i,
                    tag: "svg.path",
                    parent: m["<props>"].id + "_svg",
                    attr: {
                        d: d,
                        onmouseover: () => {
                            $(m.find(m["<props>"].id + "&&data=" + plls.name + "&idx=" + i)).css(
                                "stroke-width", "3.6px"
                            );
                        },
                        onmouseout: () => {
                            $(m.find(m["<props>"].id + "&&data=" + plls.name + "&idx=" + i)).css(
                                "stroke-width", "2.4px"
                            );
                        }
                    },
                    style: {
                        stroke: colortab[i % 12],
                        fill: "none",
                        "stroke-width": "2.4px",
                        opacity: 0.8,
                        cursor: "cell"
                    }
                }, ps.map((p, g) => {
                    return [{
                        id: m["<props>"].id + "&&data=" + plls.name + "&idx=" + i + ":" + g,
                        tag: "svg.circle",
                        parent: m["<props>"].id + "_svg",
                        attr: {
                            cx: fx(p[2][0]),
                            cy: fy(p[2][1]),
                            r: 3,
                            onmouseover: () => {
                                $(m.find(m["<props>"].id + "&&data=" + plls.name + "&idx=" + i + ":" + g + " =title")).show();
                            },
                            onmouseout: () => {
                                $(m.find(m["<props>"].id + "&&data=" + plls.name + "&idx=" + i + ":" + g + " =title")).hide();
                            }
                        },
                        style: {
                            stroke: "rgb(96,96,96)",
                            fill: colortab[i % 12],
                            opacity: 0.9,
                            cursor: "crosshair"
                        }
                    }, {
                        id: m["<props>"].id + "&&data=" + plls.name + "&idx=" + i + ":" + g + " =title",
                        tag: "svg.text",
                        parent: m["<props>"].id + "_svg",
                        attr: {
                            x: fx(p[2][0]),
                            y: fy(p[2][1]),
                            "text-anchor": "middle",
                            innerHTML: `[${ p[0] }, ${ p[1] }]`
                        },
                        style: {
                            "user-select": "none",
                            "font-size": "84%",
                            transform: `translateY(${ fy(p[1]) < 20 ? 18 : -8 }px)`,
                            display: "none"
                        }
                    }];
                })];
            });
        }).flat(Infinity), {
            id: m["<props>"].id + "_resize",
            tag: "div",
            parent: m["<props>"].id + "#",
            attr: {
                onmousedown: e => {
                    resizing = m;
                    movingOffset = [
                        e.pageX - m['<state>'].x - m['<state>'].w,
                        e.pageY - m['<state>'].y - m['<state>'].h
                    ];
                }
            },
            style: {
                "background-color": "rgba(0,116,232,0.2)",
                width: "16px",
                height: "16px",
                position: "absolute",
                right: "-6px",
                bottom: "-6px",
                cursor: "nw-resize"
            }
        }];
    });

    return m;
};

// 地图视图
const Mf = (id, x, y) => {
    const selectEvent = debounced(ec => {
        m.update({
            selected: m["<state>"].selected.concat({
                ...ec.lngLat,
                data: 1 + Math.floor(Math.random() * 99)
            })
        });
    });

    const allocated = G['<state>'].list.filter(d => d.ref['<state>'].active).length;
    let displayType = allocated === 0 ? "only" : "free";
    if (allocated === 1) {
        const before = G['<state>'].list.filter(
            d => d.ref['<state>'].active
        )[0].ref['<state>'];
        if (!before.positionChanged) {
            before.x = geometry.x[0];
            before.y = geometry.y[0];
            G['<state>'].list.filter(
                d => d.ref['<state>'].active
            )[0].ref.update({
                w: 420
            });
            displayType = "right";
        }
    }
    
    const m = createNode({
        id: id,
        info: () => (
            m['<state>'].map ? (
                `<div style="color: rgb(205,205,210);`
                + ` font-size: 80%; padding: 0.2em 0.8em;" >`
                    + `<label>缩放级: ${ m['<state>'].map.getZoom().toFixed(2) }</label>`
                    + `<label style="float: right;" >中心: (${ [
                        m['<state>'].map.getCenter().lng.toFixed(4),
                        m['<state>'].map.getCenter().lat.toFixed(4)
                    ] })</label>`
                    + "<br />"
                    + `<label>边界:<br />[${
                        m['<state>'].map.getBounds()._sw.lng.toFixed(3)
                    } ${
                        m['<state>'].map.getBounds()._ne.lng.toFixed(3)
                    }] [${
                        m['<state>'].map.getBounds()._sw.lat.toFixed(3)
                    } ${
                        m['<state>'].map.getBounds()._ne.lat.toFixed(3)
                    }]</label>`
                + `</div>`
                + `<div style="color: rgb(205,205,210); font-size: 80%; padding: 0.1em 0.4em; `
                + `border: 1px solid; margin: 0.4em;" >`
                    + `<label>坐标点 (${ m['<state>'].data.points.length })</label>`
                    + `<div style="text-align: end; margin: -14px 0px -4px;" >`
                        + `<img src="./static/img/add.jpg" width="18" height="18"`
                        + ` onclick="bindData(this, 'points');" class="import"`
                        + ` ondragstart="return false;" title="导入数据"`
                        + ` style="opacity: 0.5;" />`
                    + `</div>`
                    + `<hr style="margin-top: -0.1em;" />`
                    + (
                        m['<state>'].data.points.map((d, idx) => {
                            return `<label`
                            + ` style="display: block; margin: 0.1em 0;`
                            + ` background-color: darkslategrey; padding: 0.2em;" >`
                                + `<span title="${ JSON.stringify(d.data) }">`
                                    + `${ d.name }`
                                + `</span>`
                            + `</label>`
                            + `<div style="text-align: end;`
                            + ` pointer-events: none; margin-bottom: -18px;`
                            + ` transform: translate(-2px, -20px);">`
                                + `<img src="./static/img/delete.jpg" width="16" height="16"`
                                + ` style="pointer-events: all;" `
                                + ` onclick="delData(this, 'points', ${ idx })" `
                                + ` ondragstart="return false;" />`
                            + `</div>`;
                        }).join("")
                    )
                    + "<br />"
                    + `<label>路径 (${ m['<state>'].data.paths.length })</label>`
                    + `<div style="text-align: end; margin: -14px 0px -4px;" >`
                        + `<img src="./static/img/add.jpg" width="18" height="18"`
                        + ` onclick="bindData(this, 'paths');" class="import"`
                        + ` ondragstart="return false;" title="导入数据"`
                        + ` style="opacity: 0.5;" />`
                    + `</div>`
                    + `<hr style="margin-top: -0.1em;" />`
                    + (
                        m['<state>'].data.paths.map((d, idx) => {
                            return `<label`
                            + ` style="display: block; margin: 0.1em 0;`
                            + ` background-color: darkslategrey; padding: 0.2em;" >`
                                + `<span title="${ JSON.stringify(d.data) }">`
                                    + `${ d.name }`
                                + `</span>`
                            + `</label>`
                            + `<div style="text-align: end;`
                            + ` pointer-events: none; margin-bottom: -18px;`
                            + ` transform: translate(-2px, -20px);">`
                                + `<img src="./static/img/delete.jpg" width="16" height="16"`
                                + ` style="pointer-events: all;" `
                                + ` onclick="delData(this, 'paths', ${ idx })" `
                                + ` ondragstart="return false;" />`
                            + `</div>`;
                        }).join("")
                    ) + "<br />"
                + `</div>`
            ) : (
                `<div style="color: rgb(250,8,30);`
                + ` font-size: 80%; padding: 0.6em 0.8em;" >`
                    + `<label>`
                        + `地图未正确加载，请检查 Settings -> MapBox.accessToken 设置。`
                    + `</label>`
                + `</div>`
            )
        )
    }, {
        active: true,
        loaded: false,
        map: null,
        refs: [],
        src: [],
        data: {
            points: [],
            paths: []
        },
        snapshots: {
            zoom: null,
            center: null
        },
        selecting: false,
        selected: [],
        x: displayType === "only" ? geometry.x[0] : displayType === "right" ? (
            geometry.x[0] + 445
        ) : x,
        y: displayType === "only" ? geometry.y[0] : displayType === "right" ? (
            geometry.y[0]
        ) : y,
        w: displayType === "only" ? 860 : displayType === "right" ? 420 : 450,
        h: displayType === "only" ? 611 : displayType === "right" ? 611 : 300,
        positionChanged: false
    }).render(() => {
        return [{
            id: m["<props>"].id + "#",
            tag: "div",
            parent: $("#G")[0],
            style: {
                position: "absolute",
                left: (m['<state>'].x - geometry.x[0]) + "px",
                top: (m['<state>'].y - geometry.y[0]) + "px",
                "background-color": "rgb(245,245,245)",
                border: "1px solid rgb(205,205,205)",
                padding: "8px 10px 10px"
            }
        }, {
            id: m["<props>"].id + "_t",
            tag: "div",
            parent: m["<props>"].id + "#",
            attr: {
                ondblclick: () => {
                    const _p = $("#G")[0];
                    const _s = m.find(m["<props>"].id + "#");
                    _s.remove();
                    _p.appendChild(_s);
                }
            },
            style: {
                height: "24px",
                "margin-bottom": "8px"
            }
        }, {
            id: m["<props>"].id + "_move",
            tag: "img",
            parent: m["<props>"].id + "_t",
            attr: {
                src: "./static/img/move.jpg",
                alt: "move",
                width: "24",
                height: "24",
                title: "拖动视图",
                ondragstart: () => false,
                onmousedown: e => {
                    moving = m;
                    movingOffset = [
                        e.pageX - m['<state>'].x,
                        e.pageY - m['<state>'].y
                    ];
                }
            },
            style: {
                "user-select": "none",
                cursor: "move"
            }
        }, {
            id: m["<props>"].id + "_top",
            tag: "img",
            parent: m["<props>"].id + "_t",
            attr: {
                src: "./static/img/top.jpg",
                alt: "top",
                width: "24",
                height: "24",
                title: "置顶视图 (您也可以双击视图顶端)",
                ondragstart: () => false,
                onclick: () => {
                    const _p = $("#G")[0];
                    const _s = m.find(m["<props>"].id + "#");
                    _s.remove();
                    _p.appendChild(_s);
                }
            },
            style: {
                "user-select": "none",
                cursor: "pointer",
                "margin-left": "4px"
            }
        }, {
            id: m["<props>"].id + "_remove",
            tag: "img",
            parent: m["<props>"].id + "_t",
            attr: {
                src: "./static/img/remove.jpg",
                alt: "remove",
                width: "24",
                height: "24",
                title: "删除视图",
                ondragstart: () => false,
                onclick: () => {
                    const _s = m.find(m["<props>"].id + "#");
                    _s.remove();
                    m['<state>'].active = false;
                    if (W["<parent>"]) {
                        W.update({
                            charts: [...G["<state>"].list.filter(d => d.ref['<state>'].active)]
                        });
                    }
                }
            },
            style: {
                "user-select": "none",
                cursor: "pointer",
                "margin-left": "4px"
            }
        }, {
            id: m["<props>"].id + "_inter",
            tag: "img",
            parent: m["<props>"].id + "_t",
            attr: {
                src: `./static/img/interaction${ m["<state>"].selecting ? "" : "_false" }.jpg`,
                alt: "select",
                width: "24",
                height: "24",
                title: `从地图上选择点`,
                ondragstart: () => false,
                onclick: () => {
                    if (m["<state>"].selected.length) {
                        toast("你有未保存的改动");
                        return;
                    }

                    m.update({
                        selecting: !m["<state>"].selecting,
                        selected: []
                    });
                }
            },
            style: {
                "user-select": "none",
                cursor: "pointer",
                "margin-left": "4px"
            }
        }, {
            id: m["<props>"].id + "_download",
            tag: "img",
            parent: m["<props>"].id + "_t",
            attr: {
                src: "./static/img/download.jpg",
                alt: "download",
                width: "24",
                height: "24",
                title: "下载",
                ondragstart: () => false,
                onclick: e => {
                    downloadCanvas(
                        e.target.parentElement.parentElement.getElementsByClassName(
                            "mapboxgl-canvas"
                        )[0]
                    );
                }
            },
            style: {
                "user-select": "none",
                cursor: "pointer",
                "margin-left": "4px"
            }
        }, {
            id: m["<props>"].id + "_name",
            tag: "label",
            parent: m["<props>"].id + "_t",
            attr: {
                title: m["<props>"].id
            },
            text: m["<props>"].id + (m["<state>"].selecting ? " (交互模式)" : ""),
            style: {
                "user-select": "none",
                margin: "0px 10px",
                height: "24px",
                display: "inline-block",
                transform: "translateY(-7px)",
                "background-color": "cornsilk",
                padding: "0 0.3em"
            }
        }, {
            id: m["<props>"].id + "_selected",
            tag: "div",
            parent: m["<props>"].id + "#",
            style: {
                "margin-bottom": "8px",
                display: m["<state>"].selecting ? "block" : "none"
            }
        }, {
            id: m["<props>"].id + "_selected_ta",
            tag: "div",
            parent: m["<props>"].id + "_selected",
            text: JSON.stringify(m["<state>"].selected),
            style: {
                height: "5.6em",
                width: (m["<state>"].w - 11) + "px",
                overflow: "hidden scroll",
                "font-size": "80%",
                padding: "0 6px",
                margin: "1.3em 0 0.6em",
                "word-wrap": "anywhere",
                "box-shadow": "inset 0 1px 3px rgba(0, 0, 0, 0.1), 0 0 8px rgba(82, 168, 236, 0.6)"
            }
        }, {
            id: m["<props>"].id + "_selected_layout",
            tag: "div",
            parent: m["<props>"].id + "_selected",
            style: {
                width: (m["<state>"].w - 11) + "px",
                padding: "0 6px",
                margin: "0.6em 0 0.8em",
                "text-align": "center"
            }
        }, {
            id: m["<props>"].id + "_selected_save",
            tag: "button",
            parent: m["<props>"].id + "_selected_layout",
            style: {
                width: "10em",
                padding: "0.2em",
                margin: "0 2%",
                "background-color": "#f2f2f2"
            },
            text: `保存 ( ${ m["<state>"].selected.length } 个点)`,
            attr: {
                onclick: () => {
                    submitToND(`${ m["<props>"].id } 的采样`, m["<state>"].selected);
                }
            }
        }, {
            id: m["<props>"].id + "_selected_back",
            tag: "button",
            parent: m["<props>"].id + "_selected_layout",
            style: {
                width: "4.4em",
                padding: "0.2em",
                margin: "0 2%",
                "background-color": "#f2f2f2"
            },
            text: "撤销",
            attr: {
                onclick: () => {
                    if (m["<state>"].selected.length === 0) {
                        return;
                    }

                    let b = m["<state>"].selected;
                    b.pop(b.length - 1);
                    m.update({
                        selected: b
                    });
                }
            }
        }, {
            id: m["<props>"].id + "_selected_clear",
            tag: "button",
            parent: m["<props>"].id + "_selected_layout",
            style: {
                width: "4.4em",
                padding: "0.2em",
                margin: "0 2%",
                "background-color": "#f2f2f2"
            },
            text: "清空",
            attr: {
                onclick: () => {
                    if (m["<state>"].selected.length === 0) {
                        return;
                    }
                    
                    m.update({
                        selected: []
                    });
                }
            }
        }, {
            id: "map",
            tag: "div",
            parent: m["<props>"].id + "#",
            attr: {
                id: m["<props>"].id + "_map"
            },
            style: {
                "background-color": "rgb(245,245,245)",
                border: "1px solid rgb(205,205,205)",
                width: m["<state>"].w + "px",
                height: m["<state>"].h + "px",
                "min-width": "12vw",
                "min-height": "12vh",
                "max-width": (geometry.x[1] - geometry.x[0]) * 0.8,
                "max-height": (geometry.y[1] - geometry.y[0]) * 0.8
            }
        }, {
            id: m["<props>"].id + "_resize",
            tag: "div",
            parent: m["<props>"].id + "#",
            attr: {
                onmousedown: e => {
                    resizing = m;
                    movingOffset = [
                        e.pageX - m['<state>'].x - m['<state>'].w,
                        e.pageY - m['<state>'].y - m['<state>'].h
                    ];
                }
            },
            style: {
                "background-color": "rgba(0,116,232,0.2)",
                width: "16px",
                height: "16px",
                position: "absolute",
                right: "-6px",
                bottom: "-6px",
                cursor: "nw-resize"
            }
        }];
    }).next(() => {
        if (!m["<state>"].loaded) {
            m["<state>"].loaded = true;
            // 检查 token 是否有效
            const token = LI["<state>"].accessToken === "" ? (
                "pk.eyJ1IjoibGV5b25vIiwiYSI6ImNrZXdqc3RxdzRmMXMzMHBjYTYwNm4zOG4ifQ.r-vydM9dFLCSqAl7lSSrfQ"
            ) : LI["<state>"].accessToken;
            $.get(`https://api.mapbox.com/styles/v1/mapbox/streets-v10?access_token=${
                token
            }`).then(() => {
                // 有效
                m["<state>"].map = buildMap(
                    {
                        center: m["<state>"].snapshots.center || LI["<state>"].option.center,
                        zoom: m["<state>"].snapshots.zoom || LI["<state>"].option.zoom,
                        minZoom: LI["<state>"].option.minZoom,
                        maxZoom: LI["<state>"].option.maxZoom
                    },
                    m["<props>"].id + "_map",
                    token,
                    undefined,
                    () => {
                        m['<state>'].refs.forEach(r => r.remove());
                        m['<state>'].refs = [];
                        m['<state>'].data.points.forEach((p, j) => {
                            try {
                                p.data.forEach((d, i) => {
                                    const popup = new mapboxgl.Popup()
                                        .setLngLat([exist(d[0], d.lng), exist(d[1], d.lat)])
                                        .setHTML(
                                            `<label>${ p.name }</label>`
                                            + "<br />"
                                            + `<label>#${ i }</label>`
                                            + "<br />"
                                            + (
                                                exist(d[2], d.data) ? (
                                                    `<label>`
                                                        + `${ JSON.stringify(exist(d[2], d.data)) }`
                                                    + `</label>`
                                                ) : ""
                                            )
                                        );
                                    const marker = new mapboxgl.Marker()
                                        .setLngLat([exist(d[0], d.lng), exist(d[1], d.lat)])
                                        .setPopup(popup)
                                        .addTo(m['<state>'].map);
                                    m['<state>'].refs.push(popup, marker);
                                });
                            } catch {
                                unlinkData(m, "points", j);
                                alert(
                                    `${ m["<props>"].id } 上绑定的坐标点数据 ${ p.name } 解析出现异常，已解除绑定。`
                                );
                            }
                        });
                        m['<state>'].src = [];
                        m['<state>'].data.paths.forEach((p, j) => {
                            try {
                                p.data.forEach((d, i) => {
                                    const id = `map_${ j }_path_${ i }`;
                                    m['<state>'].src.push(id);
                                    m['<state>'].map.addSource(id, {
                                        'type': 'geojson',
                                        'data': {
                                            'type': 'Feature',
                                            'properties': {},
                                            'geometry': {
                                                'type': 'LineString',
                                                'coordinates': d[0] !== void 0 && Array.isArray(d[0])
                                                ? d : d.map(
                                                    w => [w.lng, w.lat]
                                                )
                                            }
                                        }
                                    });
                                    m['<state>'].map.addLayer({
                                        'id': id,
                                        'type': 'line',
                                        'source': id,
                                        'layout': {
                                            'line-join': 'round',
                                            'line-cap': 'round'
                                        },
                                        'paint': {
                                            'line-color': colortab[i % 12],
                                            'line-width': 6
                                        }
                                    });
                                });
                            } catch {
                                unlinkData(m, "paths", j);
                                alert(
                                    `${ m["<props>"].id } 上绑定的路径数据 ${ p.name } 解析出现异常，已解除绑定。`
                                );
                            }
                        });
                    }
                );
                m['<state>'].map.owner = m;
                W.update({});
            }, e => {
                // 无效
                m.find("map").innerHTML = (
                    `<label style="display: block; margin: 10px; color: rgb(64,0,0);`
                    + ` user-select: none;" >`
                        + `缺少合法的 MapBox.accessToken 设置项。`
                    + `<label>`
                    + `<br />`
                    + `<label style="display: block; margin: 10px; color: rgb(64,0,0);`
                    + ` user-select: none;" >`
                        + `更多信息：`
                    + `<label>`
                    + `<br />`
                    + `<label style="display: block; margin: 10px; color: rgb(64,0,0);`
                    + ` user-select: none; padding-left: 10px; font-size: 90%;" >`
                        + `${ e.responseText }`
                    + `<label>`
                );
                m["<state>"].loaded = false;
            });
        } else {
            m['<state>'].refs.forEach(r => r.remove());
            m['<state>'].refs = [];
            m['<state>'].src.forEach(r => {
                if (m['<state>'].map.getLayer(r)) {
                    m['<state>'].map.removeLayer(r);
                }
                if (m['<state>'].map.getSource(r)) {
                    m['<state>'].map.removeSource(r);
                }
            });
            m['<state>'].src = [];
            if (m["<state>"].selecting) {
                m['<state>'].selected.forEach(d => {
                    const marker = new mapboxgl.Marker()
                        .setLngLat([d.lng, d.lat])
                        .addTo(m['<state>'].map);
                    m['<state>'].refs.push(marker);
                });
            } else {
                m['<state>'].data.points.forEach((p, j) => {
                    try {
                        p.data.forEach((d, i) => {
                            const popup = new mapboxgl.Popup()
                                .setLngLat([exist(d[0], d.lng), exist(d[1], d.lat)])
                                .setHTML(
                                    `<label>${ p.name }</label>`
                                    + "<br />"
                                    + `<label>#${ i }</label>`
                                    + "<br />"
                                    + (
                                        exist(d[2], d.data) ? (
                                            `<label>`
                                                + `${ JSON.stringify(exist(d[2], d.data)) }`
                                            + `</label>`
                                        ) : ""
                                    )
                                );
                            const marker = new mapboxgl.Marker()
                                .setLngLat([exist(d[0], d.lng), exist(d[1], d.lat)])
                                .setPopup(popup)
                                .addTo(m['<state>'].map);
                            m['<state>'].refs.push(popup, marker);
                        });
                    } catch {
                        unlinkData(m, "points", j);
                        alert(
                            `${ m["<props>"].id } 上绑定的坐标点数据 ${ p.name } 解析出现异常，已解除绑定。`
                        );
                    }
                });
                m['<state>'].data.paths.forEach((p, j) => {
                    try {
                        p.data.forEach((d, i) => {
                            const id = `map_${ j }_path_${ i }`;
                            m['<state>'].src.push(id);
                            m['<state>'].map.addSource(id, {
                                'type': 'geojson',
                                'data': {
                                    'type': 'Feature',
                                    'properties': {},
                                    'geometry': {
                                        'type': 'LineString',
                                        'coordinates': d[0] !== void 0 && Array.isArray(d[0])
                                        ? d : d.map(
                                            w => [w.lng, w.lat]
                                        )
                                    }
                                }
                            });
                            m['<state>'].map.addLayer({
                                'id': id,
                                'type': 'line',
                                'source': id,
                                'layout': {
                                    'line-join': 'round',
                                    'line-cap': 'round'
                                },
                                'paint': {
                                    'line-color': colortab[i % 12],
                                    'line-width': 6
                                }
                            });
                        });
                    } catch (err) {
                        unlinkData(m, "paths", j);
                        alert(
                            `${ m["<props>"].id } 上绑定的路径数据 ${ p.name } 解析出现异常，已解除绑定。`
                        );
                    }
                });
            }
        }

        if (m["<state>"].selecting) {
            $(m.find(m["<props>"].id + "_selected_ta")).scrollTop(1e16);
            m["<state>"].map.on("click", selectEvent);
            onNDexit = bl => {
                if (bl) {
                    m.update({
                        selecting: false,
                        selected: []
                    });
                }
            };
        } else if (m["<state>"].map) {
            m["<state>"].map.off("click", selectEvent);
        }
    });

    return m;
};

// 工作区域
const G = createNode(null, {list: []}).render(() => {
    return [{
        id: 0,
        tag: "div",
        attr: {
            id: "G"
        },
        style: {
            position: "absolute",
            top: "67px",
            left: "235px",
            display: "inline-block",
            "background-color": "rgb(37,37,37)",
            width: "calc(78vw - 286px)",
            height: "90vh",
            margin: "0 12px",
            overflow: "scroll"
        }
    },
    ...G["<state>"].list.map(d => {
        return d.ref['<call>']();
    }).flat(Infinity)];
}).next(() => {
    const e = G.find(0);
    geometry = {
        x: [e.offsetLeft, e.offsetLeft + e.offsetWidth],
        y: [e.offsetTop, e.offsetTop + e.offsetHeight]
    };
    if (W["<parent>"]) {
        W.update({
            charts: [...G["<state>"].list.filter(d => d.ref['<state>'].active)]
        });
    }
});

// 工具集合
const ts = [{
    name: "地图",
    pic: "./static/img/map.jpg",
    oncreate: (x, y) => {
        let list = G["<state>"].list;
        G.update({
            list: [...list.filter(d => d.ref['<state>'].active), {
                ref: Mf("Figure#" + _cr + " (map)", x, y)
            }]
        });
        _cr += 1;
    }
}, {
    name: "可视化分析",//"算法收敛曲线",
    pic: "./static/img/chart2d.jpg",
    oncreate: (x, y) => {
        let list = G["<state>"].list;
        G.update({
            list: [...list.filter(d => d.ref['<state>'].active), {
                ref: Pf("Figure#" + _cr + " (2d)", x, y)
            }]
        });
        _cr += 1;
    }
// }, {
//     name: "白板",
//     pic: "./static/img/blank.jpg",
//     oncreate: (x, y) => {
//         let list = G["<state>"].list;
//         G.update({
//             list: [...list.filter(d => d.ref['<state>'].active), {
//                 ref: Bf("Figure#" + _cr + " (blank)", x, y)
//             }]
//         });
//         _cr += 1;
//     }
// }, {
//     name: "未定义",
//     pic: "null",
//     oncreate: () => {}
}];

// 算法集合
const als = [{
    name: "粒子群优化",
    steps: 2,
    input: [[{
        name: "车辆数量",
        default: 5,
        check: val => typeof val === "number",
        tips: "",
        useImport: false
    }, {
        name: "总载重量",
        default: 200,
        check: val => typeof val === "number",
        tips: "",
        useImport: false
    }, {
        name: "惩罚系数",
        default: 10,
        check: val => typeof val === "number",
        tips: "",
        useImport: false
    }, {
        name: "客户数量",
        default: 10,
        check: val => typeof val === "number",
        tips: "",
        useImport: false
    }], [{
        name: "坐标点集",
        default: undefined,
        check: Check.isGeoPointArray,
        tips: "坐标点的列表",
        useImport: true
    }, {
        name: "粒子数",
        default: 10,
        check: val => typeof val === "number",
        tips: "",
        useImport: false
    }, {
        name: "迭代次数",
        default: 300,
        check: val => typeof val === "number",
        tips: "",
        useImport: false
    }, {
        name: "权重系数",
        default: 0.8,
        check: val => typeof val === "number",
        tips: "",
        useImport: false
    }, {
        name: "加速常数c1",
        default: 2,
        check: val => typeof val === "number",
        tips: "",
        useImport: false
    }, {
        name: "加速常数c2",
        default: 2,
        check: val => typeof val === "number",
        tips: "",
        useImport: false
    }]],
    start: req => {
        $.ajax({
            url: "/pso",
            type: "POST",
            data: {
                data: JSON.stringify({
                    params: req
                })
            },
            success: res => {
                // console.log(res);
                receive([{
                    name: "路线 1",
                    data: res[0]
                }, {
                    name: "收敛曲线",
                    data: res[1]
                }]);
            },
            error: err => {
                receiveError(err);
            }
        });
    }
}, {
    name: "遗传算法",
    input: [],
    start: () => {
        receiveError("算法未定义");
    }
}, {
    name: "蚁群算法",
    input: [],
    start: () => {
        receiveError("算法未定义");
    }
}, {
    name: "差分进化算法",
    input: [],
    start: () => {
        receiveError("算法未定义");
    }
}, {
    name: "多智能体系统",
    input: [],
    start: () => {
        receiveError("算法未定义");
    }
}];

// 场景集合
const quests = [{
    name: "调度问题参数",
    als: als
}, {
    name: "算法模型参数",
    als: null
}, {
    name: "算法模型选择",
    als: null
}, {
    name: "应用场景选择",
    als: null
}, {
    name: "导出仿真数据",
    als: null
}];

// 左侧的工具栏
const TB = createNode(null, {active: null}).render(() => {
    return [{
        id: "-",
        tag: "div",
        style: {
            position: "absolute",
            top: "67px",
            display: "inline-block",
            "background-color": "rgb(51,51,52)",
            width: "200px",
            padding: "12px"
        }
    }, {
        id: -1,
        parent: "-",
        tag: "label",
        text: "视图区",
        style: {
            display: "block",
            "text-align": "center",
            padding: "0.3em 0",
            color: "rgb(245,245,245)",
            "font-size": "18px",
            "letter-spacing": "0.5em",
            "user-select": "none"
        }
    }, {
        id: "+",
        parent: "-",
        tag: "div",
        style: {
            "min-height": "300px",
            "max-height": "33vh",
            overflow: "hidden",//"hidden scroll",
            padding: "12px",
            display: "flex",
            "flex-direction": "column",
            "justify-content": "center",
            "align-items": "center"
        }
    }, ...ts.map((t, i) => {
        return {
            id: i,
            parent: "+",
            tag: "div",
            attr: {
                innerHTML: `<img src=${ t.pic } alt="" width="150" height="100" `
                + `style="pointer-events: none; user-select: none;" />`
                    + `<span style="display: block; text-align: center;`
                        + `padding: 0.3em 0; color: rgb(245,245,245);`
                        + `font-size: 16px; letter-spacing: 0.3em;`
                        + `user-select: none;" >${ t.name }</span>`,
                onmousedown: () => {
                    $("#all").css("cursor", "cell");
                    TB["<state>"].active = t.oncreate;
                }
            },
            style: {
                display: "block",
                margin: "12px 0",
                cursor: "pointer"
            }
        }
    }), {
        id: -5,
        parent: "-",
        tag: "hr",
        style: {
            color: "rgb(245,245,245)"
        }
    }, {
        id: -2,
        parent: "-",
        tag: "label",
        text: "功能区",
        style: {
            display: "block",
            "text-align": "center",
            padding: "0.3em 0",
            color: "rgb(245,245,245)",
            "font-size": "18px",
            "letter-spacing": "0.5em",
            "user-select": "none"
        }
    }, {
        id: "++",
        parent: "-",
        tag: "div",
        attr: {
            id: "als"
        },
        style: {
            "min-height": "120px",
            "max-height": "30vh",
            overflow: "hidden",
            padding: "12px",
            "text-align": "center"
        }
    }, ...quests.map((q, i) => {
        return {
            id: "q" + i,
            parent: "++",
            tag: "div",
            attr: {
                innerHTML: (
                    `<label style="cursor: pointer; user-select: none;" >`
                        + `${ q.name }`
                    + `</label>`
                ),
                onclick: () => {
                    if (q.als) {
                        AC.update({
                            list: als
                        });
                    }
                }
            },
            style: {
                display: "block",
                margin: "12px 0",
                cursor: "pointer",
                "background-color": "azure",
                padding: "0.4em 0.6em"
            }
        }
    })];
});

// 算法选择界面
const AC = createNode(
    null, {
        list: []
    }
).render(() => {
    return [{
        id: "ac",
        tag: "div",
        style: {
            // "background-color": "rgb(225,225,225)",
            background: "black url(static/img/container2.jpg) no-repeat fixed top / cover",
            color: "rgb(15,15,15)",
            position: "absolute",
            top: "12vh",
            padding: "4vh 2vw",
            left: "26vw",
            width: "40vw",
            display: AC["<state>"].list.length ? "unset" : "none",
            "box-shadow": "5px 4px 3px rgba(30,30,30,0.8)",
            // border: "1px solid black",
            overflow: "hidden scroll",
            "max-height": "72vh",
            "text-align": "center"
        }
    }, {
        id: "h",
        tag: "header",
        parent: "ac",
        text: "算法选择",
        style: {
            padding: "1em 0",
            "font-size": "130%",
            "font-weight": "bold"
        }
    }, ...AC['<state>'].list.map((t, i) => {
        return {
            id: "a" + i,
            parent: "ac",
            tag: "div",
            attr: {
                innerHTML: (
                    `<label style="cursor: pointer; user-select: none;" >`
                        + `${ t.name }`
                    + `</label>`
                ),
                onclick: () => {
                    AL.update({
                        activeAlgo: t,
                        step: 0
                    });
                    AC.update({
                        list: []
                    });
                }
            },
            style: {
                display: "block",
                margin: "16px 0",
                cursor: "pointer",
                "background-color": "azure",
                padding: "1.2em 0.6em"
            }
        }
    })];
}).next(() => {
    if (AC['<state>'].list.length > 0) {
        $("#container").hide();
    }
});

// 右侧的监视栏
const W = createNode(
    null, {
        data: [{
            name: "模拟数据=地理点",
            data: [
                [120.10381512286305, 30.296979475670415, 58],
                [120.13323508830406, 30.295944409131792, 5],
                [120.13535755277118, 30.27231061649803, 92],
                [120.14134862304405, 30.272910882325476, 91],
                [120.19384817284751, 30.3148764119662, 89],
                [120.16132709851536, 30.26993610525515, 29],
                [120.10208045460568, 30.30385734107755, 12],
                [120.17871410117165, 30.251713945814448, 53],
                [120.18522771149132, 30.30968673788928, 11],
                [120.1998195114828, 30.313308444438878, 94],
                [120.19938300216269, 30.241084483561675, 97],
                [120.12975630335826, 30.329071540703026, 64],
                [120.14551459148248, 30.31659746233546, 66],
                [120.1663901117333, 30.329390402909038, 39],
                [120.11867167986912, 30.243949062427433, 69],
                [120.1991678149825, 30.283147282709077, 67],
                [120.1093170403052, 30.327581773094387, 82],
                [120.10633621141761, 30.279621387188776, 29],
                [120.12993638155, 30.233687374645903, 3],
                [120.17148553648997, 30.310167211109682, 74]
            ]
        }, {
            name: "模拟数据=地理路径",
            data: [
                [
                    [120.11583095528272, 30.242949123874855, 26],
                    [120.13940713535024, 30.320895567037315, 62],
                    [120.13066853417747, 30.321732743395483, 90],
                    [120.10753644105827, 30.263735505863114, 42],
                    [120.14415066903422, 30.24743951381532, 28],
                    [120.164070039279, 30.25616067407522, 97]
                ], [
                    [120.14226426415563, 30.25283460403629, 21],
                    [120.17939606306804, 30.261794158546973, 2],
                    [120.15068555885821, 30.296609723650416, 29],
                    [120.18841983609752, 30.252797555472142, 6],
                    [120.18129039218086, 30.26178374442229, 20]
                ], [
                    [120.14406210358906, 30.299724016264957, 45],
                    [120.10012557887927, 30.28749307387719, 82],
                    [120.19389455305203, 30.232005155232706, 15],
                    [120.12174206694229, 30.241750239080723, 55]
                ]
            ]
        }, {
            name: "模拟数据=折线",
            data: [
                [[0,100],[2,58.90163935615551],[3,60.43116946129517],[4,46.58357026660894],[5,35.345796377473555],[6,26.29066555797228],[7,21.048556846195368],[8,12.798214501889506],[9,8.408880035299072],[10,4.537820299473694],[11,4.285924226183409],[12,3.9974470408470317],[13,4.009836304440394],[14,2.254963695711872],[15,1.6542393370382527]],
                [[0,100],[2,106.96839800460218],[3,92.63133656818046],[4,67.22333727904324],[5,49.95239389449587],[6,42.135462542936004],[7,28.597465384404106],[8,24.41560196183807],[9,15.558912712478577],[10,11.390046793828862],[11,7.003357782659723],[12,7.039974007859501],[13,3.466963754561879],[14,1.826091420313342]],
                [[0,100],[2,99.74530642047337],[3,73.46027591792964],[4,52.22798755622453],[5,46.52459411459219],[6,32.28376418718885],[7,33.82196942170168],[8,21.7481097754496],[9,15.482683123369663],[10,11.716379268557905],[11,6.697111209330351],[12,2.8243252270682544],[13,2.7282673436553373],[14,1.6849111274295667]],
                [[0,100],[2,105.92937347995154],[3,102.16618796808993],[4,74.18526724444483],[5,73.729251893478],[6,43.05051383961105],[7,42.36748503407878],[8,25.023246761329922],[9,21.606944438478983],[10,12.096320355885045],[11,6.578673688545349],[12,3.161787300809037],[13,2.4965663708916166],[14,1.9609050092409215]]
            ]
        }],
        charts: []
    }
).render(() => {
    if (W["<refs>"] && W.find("#")) {
        W.find("#").innerHTML = "";
        W["<refs>"] = {};
    }

    return [{
        id: "#",
        tag: "div",
        style: {
            position: "absolute",
            top: "67px",
            left: "calc(78vw - 24px)",
            display: "inline-block",
            "background-color": "rgb(51,51,52)",
            width: "calc(18vw + 24px)",
            padding: "12px"
        }
    }, {
        id: -1,
        parent: "#",
        tag: "label",
        text: "控制台",
        style: {
            display: "block",
            "text-align": "center",
            padding: "0.3em 0",
            color: "rgb(245,245,245)",
            "font-size": "18px",
            "letter-spacing": "0.5em",
            "user-select": "none"
        }
    }, {
        id: "+",
        parent: "#",
        tag: "div",
        style: {
            "min-height": "500px",
            "max-height": "80vh",
            overflow: "hidden scroll",
            padding: "12px"
        }
    }, {
        id: -10,
        parent: "+",
        tag: "label",
        text: "数据",
        style: {
            padding: "0.3em 0",
            color: "rgb(245,245,245)",
            "font-size": "16px",
            "letter-spacing": "0.5em",
            "user-select": "none"
        }
    }, {
        id: "new data",
        parent: "+",
        tag: "img",
        attr: {
            src: "./static/img/add.jpg",
            alt: "new",
            width: "24",
            height: "24",
            title: "录入 JSON",
            ondragstart: () => false,
            onclick: () => {
                if (ND["<state>"].active) {
                    return;
                } else {
                    ND.update({
                        active: true
                    });
                }
            }
        },
        style: {
            "user-select": "none",
            cursor: "pointer",
            margin: "0 4px",
            float: "right"
        }
    }, {
        id: -100,
        parent: "+",
        tag: "hr",
        style: {
            display: "block",
            padding: "0.1em 0",
            color: "rgb(245,245,245)"
        }
    }, {
        id: "data",
        parent: "+",
        tag: "div",
        style: {
            "min-height": "60px",
            color: "rgb(156,220,254)"
        }
    }, ...W['<state>'].data.map((s, i) => {
        copyRestore[i] = JSON.stringify(s.data);
        let show = JSON.stringify(s.data);
        if (show.length > 90) {
            show = show.substring(0, 89) + "...";
        }
        return {
            id: `data_${ i }`,
            tag: "div",
            parent: "data",
            attr: {
                classList: ["data"],
                onclick: e => {
                    if (source) {
                        const self = $(e.target).parent(".data")[0];
                        const t = source[0]['<refs>'][
                            source[0]['<props>'].id + "#"
                        ];
                        if (self && t) {
                            // 动画效果
                            const container = document.createElement("div");
                            container.style.pointerEvents = "none";
                            container.style.width = `${ $(self).width() }px`;
                            container.style.color = `rgb(156, 220, 254)`;
                            container.style.backgroundColor = `rgb(51, 51, 52)`;

                            let x = $(self).offset().left;
                            let y = $(self).offset().top;
                            const tx = $(t).offset().left + $(t).width() / 3;
                            const ty = $(t).offset().top + $(t).height() * 2 / 3;

                            const clone = self.cloneNode(true);
                            clone.classList = [];
                            clone.style.margin = "";
                            container.appendChild(clone);
                            const body = document.getElementsByTagName("body")[0];

                            container.style.position = "absolute";
                            container.style.top = `${ y }px`;
                            container.style.left = `${ x }px`;

                            body.appendChild(container);

                            let b = 0;
                            const frames = 30;
                            const animate = () => {
                                x += (tx - x) / (frames - b + 1);
                                y += (ty - y) / (frames - b + 1);
                                container.style.top = `${ y }px`;
                                container.style.left = `${ x }px`;
                                container.style.opacity = `${ 0.9 - 0.6 * b / frames }`;
                                container.style.scale = `${ 100 - 90 * b / frames }%`;
                                b += 1;
                                if (b < frames) {
                                    setTimeout(() => {
                                        animate();
                                    }, 5);
                                } else {
                                    container.remove();
                                }
                            };
                            animate();
                        }
                        appending(s);
                    }
                },
                __self: s,
                innerHTML: (
                    // 数据名称
                    `<div style="background-color: rgb(78,78,80); padding: 0.2em 0.8em;" >`
                        + `<span>${ s.name }</span>`
                    + `</div>`
                    // 复制和删除
                    + `<div style="text-align: end; margin: -22px 6px 0px;" >`
                        + `<img src="./static/img/copy.jpg" width="18" height="18"`
                        + ` onclick="execCopy(${ i });"`
                        + ` style="cursor: pointer;"`
                        + ` ondragstart="return false;" title="复制 JSON" />`
                        + `<img src="./static/img/remove.jpg" width="18" height="18"`
                        + ` style="margin-left: 4px; cursor: pointer;"`
                        + ` onclick="delDataset(${ i });"`
                        + ` ondragstart="return false;" title="丢弃数据" />`
                    + `</div>`
                    // 显示概览
                    + `<div title='${ JSON.stringify(s.data) }' `
                    + `style="user-select: none; color: rgb(205,205,210); `
                    + `padding: 0.2em 0.8em; font-size: 80%; word-break: break-all;`
                    + `min-height: 1.5em; max-height: 6em; overflow: hidden;" >`
                        + `${ show }`
                    + `</div>`
                    // 数组信息
                    + (
                        typeof s.data === "object" && Array.isArray(s.data) ? (
                            `<div style="color: rgb(94,158,72); `
                            + `padding: 0 0.8em 0.2em; font-size: 90%; text-align: right;" >`
                                + `length=${
                                    s.data.length
                                }`
                            + `</div>`
                        ) : ""
                    )
                )
            },
            style: {
                "margin-bottom": "12px",
                border: "1px solid"
            }
        };
    }), {
        id: -11,
        parent: "+",
        tag: "label",
        text: "图表",
        style: {
            padding: "0.3em 0",
            color: "rgb(245,245,245)",
            "font-size": "16px",
            "letter-spacing": "0.5em",
            "user-select": "none"
        }
    }, {
        id: -110,
        parent: "+",
        tag: "hr",
        style: {
            display: "block",
            padding: "0.1em 0",
            color: "rgb(245,245,245)"
        }
    }, {
        id: "charts",
        parent: "+",
        tag: "div",
        style: {
            "min-height": "60px",
            color: "rgb(156,220,254)"
        }
    }, ...W['<state>'].charts.map((s, i) => {
        return {
            id: `chart_${ i }`,
            parent: "charts",
            tag: "div",
            attr: {
                data: s.ref,
                innerHTML: (
                    // 图表名称
                    `<div style="background-color: rgb(78,78,80); padding: 0.2em 0.8em;" >`
                        + `<span>${ s.ref['<props>'].id }</span>`
                    + `</div>`
                    // 数据
                    + s.ref['<props>'].info()
                )
            },
            style: {
                "margin-bottom": "12px",
                border: "1px solid rgb(163,99,214)"
            }
        };
    })];
});

// 全局鼠标事件监听
$("#all").on('mouseup', t => {
    const x = t.pageX;
    const y = t.pageY;
    if (TB["<state>"].active) {
        $("#all").css("cursor", "default");
        if (x > geometry.x[0] && x < geometry.x[1] && y > geometry.y[0] && y < geometry.y[1]) {
            TB["<state>"].active(x, y);
        }
    }
    TB["<state>"].active = null;
    moving = null;
    if (resizing && resizing['<state>'] && resizing['<state>'].loaded) {
        delete resizing['<state>'].map;
        resizing['<refs>'].map.innerHTML = "";
        resizing.update({
            loaded: false,
            map: null
        });
    }
    resizing = null;
}).on('mousemove', t => {
    const x = t.pageX;
    const y = t.pageY;
    if (moving) {
        if (x > geometry.x[0] && x < geometry.x[1] && y > geometry.y[0] && y < geometry.y[1]) {
            const nx = x - movingOffset[0];
            const ny = y - movingOffset[1];
            moving.update({
                x: nx,
                y: ny,
                positionChanged: true
            });
        } else {
            moving = null;
        }
    } else if (resizing) {
        if (x > geometry.x[0] && x < geometry.x[1] && y > geometry.y[0] && y < geometry.y[1]) {
            const nw = x - movingOffset[0] - resizing['<state>'].x;
            const nh = y - movingOffset[1] - resizing['<state>'].y;
            resizing.update({
                w: Math.max(Math.min(nw, 1500), 300),
                h: Math.max(Math.min(nh, 1000), 200),
                positionChanged: true
            });
        } else {
            resizing = null;
        }
    }
});

// 验证 JSON 格式
const testJSON = () => {
    try {
        const t = $("#nd_data").val().toString().trim() || "";
        JSON.parse(t);
        $("#jsontest").text("");
    } catch (err) {
        $("#jsontest").text(
            ("JSON 格式错误 - " + err.toString().substr(25)).substr(0, 80)
        );
    }
};

const stg = () => {
    LI.update({
        active: true
    });
};

// 登录界面
const LI = createNode({}, {
    active: true,
    accessToken: null,
    option: {
        center: null,
        minZoom: 8,
        maxZoom: 15,
        zoom: 12
    }
}).render(() => {
    return {
        id: "#",
        tag: "div",
        attr: {
            innerHTML: (
                `<label style="display: block; padding: 0.5em 0 1.2em; font-size: 110%;" >`
                    + `设置`
                + `</label>`
                + `<label style="display: block; text-align: end; margin-top: -2.6em;`
                + ` font-size: 90%; color: rgb(10,132,255); text-decoration: underline;" >`
                    + `<span style="cursor: pointer;" >`
                        + `完成`
                    + `</span>`
                + `</label>`
                + `<br />`
                + `<div style="overflow: hidden scroll; height: 56vh; padding: 0 6px;" >`
                    + `<label style="display: block; padding: 0.2em 0;" >`
                        + `Mapbox.accessToken`
                    + `</label>`
                    + `<hr style="margin-top: -0.3em;" />`
                    + `<label style="display: block; padding: 0 0 0.55em; font-weight: 200;`
                    + ` font-size: 94%;" >`
                        + `accessToken 是我们访问 MapBox SDK 的唯一秘钥。`
                        + `你需要在此填入绑定于你的 MapBox 账户的 accessToken 以更好地使用平台。`
                        + `如果缺少合法的 accessToken 项，地图工具将无法被渲染。`
                    + `</label>`
                    + `<label style="display: block; padding: 0 0 0.55em; font-weight: 200;`
                    + ` font-size: 94%;" >`
                        + `如果遗忘秘钥或尚未注册，请`
                            + `<a href="https://www.mapbox.com/" target="_blank"`
                            + ` style="color: rgb(10,132,249); padding: 0 2px;" >`
                                + `点击这里`
                            + `</a>`
                        + `访问 MapBox 官网。`
                    + `</label>`
                    + `<textarea id="accessToken" type="text" placeholder="accessToken"`
                    + ` style="width: 90%; height: 2.4em; resize: none; box-shadow: `
                        + `inset 0 1px 3px rgba(0, 0, 0, 0.1), 0 0 8px rgba(82, 168, 236, 0.6);" >`
                    + `</textarea>`
                    + `<br />`
                    + `<br />`
                    + `<label style="display: block; padding: 0.2em 0;" >`
                        + `Mapbox.center`
                    + `</label>`
                    + `<hr style="margin-top: -0.3em;" />`
                    + `<label style="display: block; padding: 0 0 0.55em; font-weight: 200;`
                    + ` font-size: 94%;" >`
                        + `指定地图创建时初始化的中心坐标。`
                    + `</label>`
                    + `<input id="center" type="text" placeholder="[lng, lat]"`
                    + ` style="width: 20%; box-shadow: `
                        + `inset 0 1px 3px rgba(0, 0, 0, 0.1), 0 0 8px rgba(82, 168, 236, 0.6);" />`
                    + `<span id="center_test" style="font-size: 80%; user-select: none;`
                    + ` margin-left: 8px; color: rgb(228,79,38);" >`
                        + ``
                    + `</span>`
                    + `<br />`
                    + `<br />`
                    + `<label style="display: block; padding: 0.2em 0;" >`
                        + `Mapbox.zoom`
                    + `</label>`
                    + `<hr style="margin-top: -0.3em;" />`
                    + `<label style="display: block; padding: 0 0 0.55em; font-weight: 200;`
                    + ` font-size: 94%;" >`
                        + `指定地图创建时初始化的缩放级别。`
                    + `</label>`
                    + `<input id="zoom" type="text"`
                    + ` style="width: 20%; box-shadow: `
                        + `inset 0 1px 3px rgba(0, 0, 0, 0.1), 0 0 8px rgba(82, 168, 236, 0.6);" />`
                    + `<span id="zoom_test" style="font-size: 80%; user-select: none;`
                    + ` margin-left: 8px; color: rgb(228,79,38);" >`
                        + ``
                    + `</span>`
                    + `<br />`
                    + `<br />`
                    + `<label style="display: block; padding: 0.2em 0;" >`
                        + `Mapbox.minZoom`
                    + `</label>`
                    + `<hr style="margin-top: -0.3em;" />`
                    + `<label style="display: block; padding: 0 0 0.55em; font-weight: 200;`
                    + ` font-size: 94%;" >`
                        + `指定地图的最小缩放级别。`
                    + `</label>`
                    + `<input id="minZoom" type="text"`
                    + ` style="width: 20%; box-shadow: `
                        + `inset 0 1px 3px rgba(0, 0, 0, 0.1), 0 0 8px rgba(82, 168, 236, 0.6);" />`
                    + `<span id="minZoom_test" style="font-size: 80%; user-select: none;`
                    + ` margin-left: 8px; color: rgb(228,79,38);" >`
                        + ``
                    + `</span>`
                    + `<br />`
                    + `<br />`
                    + `<label style="display: block; padding: 0.2em 0;" >`
                        + `Mapbox.maxZoom`
                    + `</label>`
                    + `<hr style="margin-top: -0.3em;" />`
                    + `<label style="display: block; padding: 0 0 0.55em; font-weight: 200;`
                    + ` font-size: 94%;" >`
                        + `指定地图的最大缩放级别。`
                    + `</label>`
                    + `<input id="maxZoom" type="text"`
                    + ` style="width: 20%; box-shadow: `
                        + `inset 0 1px 3px rgba(0, 0, 0, 0.1), 0 0 8px rgba(82, 168, 236, 0.6);" />`
                    + `<span id="maxZoom_test" style="font-size: 80%; user-select: none;`
                    + ` margin-left: 8px; color: rgb(228,79,38);" >`
                        + ``
                    + `</span>`
                    + `<br />`
                    + `<br />`
                + `</div>`
            )
        },
        style: {
            // "background-color": "rgb(225,225,225)",
            background: "black url(static/img/container.jpg) no-repeat fixed top / cover",
            color: "rgb(236,236,236)",
            position: "absolute",
            top: "12vh",
            padding: "4vh 2vw 8vh",
            left: "26vw",
            width: "40vw",
            display: LI["<state>"].active ? "unset" : "none",
            "box-shadow": "5px 4px 3px rgba(30,30,30,0.8)"
        }
    };
}).next(() => {
    if (LI["<state>"].active) {
        $("#container").hide();
        $(LI.find("#")).children("label").eq(1).children("span").on("click", () => {
            LI.update({
                active: false,
                accessToken: $("#accessToken").val().toString().trim()
            });
        });
        if (LI["<state>"].accessToken) {
            $("#accessToken").val(LI["<state>"].accessToken);
        }
        if (LI["<state>"].option.center) {
            $("#center").val(
                JSON.stringify(LI["<state>"].option.center)
            );
        }
        if (LI["<state>"].option.zoom) {
            $("#zoom").val(LI["<state>"].option.zoom);
        }
        if (LI["<state>"].option.minZoom) {
            $("#minZoom").val(LI["<state>"].option.minZoom);
        }
        if (LI["<state>"].option.maxZoom) {
            $("#maxZoom").val(LI["<state>"].option.maxZoom);
        }

        const test = () => {
            if ($("#center").val()) {
                try {
                    const val = JSON.parse($("#center").val());
                    if (Array.isArray(val) && val.length === 2) {
                        if (typeof val[0] === "number") {
                            if (typeof val[1] === "number") {
                                if (Math.abs(val[0]) <= 180) {
                                    if (Math.abs(val[1]) <= 90) {
                                        $("#center_test").text("");
                                        LI["<state>"].option.center = val;
                                    } else {
                                        throw "纬度值超出有效范围";
                                    }
                                } else {
                                    throw "经度值超出有效范围";
                                }
                            } else {
                                throw "错误的纬度类型";
                            }
                        } else {
                            throw "错误的经度类型";
                        }
                    } else {
                        throw "错误的坐标格式";
                    }
                } catch (err) {
                    if (err.toString().startsWith("SyntaxError")) {
                        $("#center_test").text("JSON 格式错误");
                    } else {
                        $("#center_test").text(err);
                    }
                }
            }

            if ($("#zoom").val()) {
                try {
                    const val = JSON.parse($("#zoom").val());
                    if (typeof val === "number") {
                        if (val >= LI["<state>"].option.minZoom
                        && val <= LI["<state>"].option.maxZoom) {
                            $("#zoom_test").text("");
                            LI["<state>"].option.zoom = val;
                        } else {
                            LI["<state>"].option.zoom = null;
                            throw "缩放级超出限制";
                        }
                    } else {
                        throw "请输入数字";
                    }
                } catch (err) {
                    if (err.toString().startsWith("SyntaxError")) {
                        $("#zoom_test").text("请输入数字");
                    } else {
                        $("#zoom_test").text(err);
                    }
                }
            }
            if ($("#minZoom").val()) {
                try {
                    const val = JSON.parse($("#minZoom").val());
                    if (typeof val === "number") {
                        if (val <= LI["<state>"].option.maxZoom) {
                            $("#minZoom_test").text("");
                            LI["<state>"].option.minZoom = val;
                        } else {
                            LI["<state>"].option.minZoom = null;
                            throw "最小缩放级别不应大于最大缩放级别";
                        }
                    } else {
                        throw "请输入数字";
                    }
                } catch (err) {
                    if (err.toString().startsWith("SyntaxError")) {
                        $("#minZoom_test").text("请输入数字");
                    } else {
                        $("#minZoom_test").text(err);
                    }
                }
            }
            if ($("#maxZoom").val()) {
                try {
                    const val = JSON.parse($("#maxZoom").val());
                    if (typeof val === "number") {
                        if (val >= LI["<state>"].option.minZoom) {
                            $("#maxZoom_test").text("");
                            LI["<state>"].option.maxZoom = val;
                        } else {
                            LI["<state>"].option.maxZoom = null;
                            throw "最大缩放级别不应大于最小缩放级别";
                        }
                    } else {
                        throw "请输入数字";
                    }
                } catch (err) {
                    if (err.toString().startsWith("SyntaxError")) {
                        $("#maxZoom_test").text("请输入数字");
                    } else {
                        $("#maxZoom_test").text(err);
                    }
                }
            }
            
            if (LI["<state>"].active) {
                setTimeout(test, 300);
            }
        };

        test();
    } else if (!AL["<state>"].activeAlgo && !ND["<state>"].active) {
        $("#container").show();
    }
});

const quitND = () => {
    ND.update({
        active: false
    });
    onNDexit(false);
    onNDexit = () => {};
};

const sendND = () => {
    try {
        const t = $("#nd_data").val().toString().trim() || "";
        const d = JSON.parse(t);
        $("#jsontest").text("");
        const n = $("#nd_name").val().toString().trim() || $("#nd_name").attr("default");
        let nn = n;

        let i = -1;
        const nextName = () => {
            i += 1;
            return i <= 0 ? n : `${ n }_${ i }`;
        }

        while (true) {
            let flag = false;
            for (let j = 0; j < W["<state>"].data.length; j++) {
                if (W["<state>"].data[j].name === nn) {
                    flag = true;
                    break;
                }
            }
            if (!flag) {
                break;
            } else {
                nn = nextName();
            }
        }

        const list = W["<state>"].data;

        W.update({
            data: [...list, {
                name: nn,
                data: d
            }]
        });

        onNDexit(true);
        onNDexit = () => {};
        quitND();
    } catch {
        toast("添加失败：错误的 JSON 格式");
        onNDexit(false);
        onNDexit = () => {};
    }
};

const appendData = data => {
    let count = 0;

    let list = [...W["<state>"].data];

    data.forEach(d => {
        try {
            const n = d.name;
            let nn = n;
    
            let i = -1;
            const nextName = () => {
                i += 1;
                return i <= 0 ? n : `${ n }_${ i }`;
            }
    
            while (true) {
                let flag = false;
                for (let j = 0; j < list.length; j++) {
                    if (list[j].name === nn) {
                        flag = true;
                        break;
                    }
                }
                if (!flag) {
                    break;
                } else {
                    nn = nextName();
                }
            }
    
            list.push({
                name: nn,
                data: d.data
            });

            count += 1;
        } catch {}
    });

    if (count) {
        W.update({
            data: [...list]
        });
        toast(`成功录入 ${ count } 数据`);
    }
};

const bindData = (e, t) => {
    if (e.style.opacity === "0.5") {
        $(".import").css("opacity", "0.5");
        e.style.opacity = "1";
        const n = e.parentElement.parentElement.parentElement.data;
        source = [n, t];
        $(".data").css("border-color", "chartreuse");
    } else {
        $(".data").css("border-color", "unset");
        $(".import").css("opacity", "0.5");
        e.style.opacity = "0.5";
        source = null;
    }
};

let onNDexit = () => {};

// 添加数据弹窗
const ND = createNode(null, {
    active: false
}).render(() => {
    let i = 0;
    const nextName = () => {
        i += 1;
        return `新数据_${ i }`;
    }

    let nn = nextName();

    while (true) {
        let flag = false;
        for (let j = 0; j < W["<state>"].data.length; j++) {
            if (W["<state>"].data[j].name === nn) {
                flag = true;
                break;
            }
        }
        if (!flag) {
            break;
        } else {
            nn = nextName();
        }
    }

    return {
        id: "#",
        tag: "div",
        attr: {
            innerHTML: (
                `<label style="display: block; padding: 0.5em 0; font-size: 110%;" >新建数据</label>`
                + `<label style="display: block; padding: 0.2em 0;" >数据名称</label>`
                + `<hr style="margin-top: -0.3em;" />`
                + `<input id="nd_name" default="${ nn }" type="text" placeholder="${ nn }"`
                + ` style="width: 40%; box-shadow: `
                    + `inset 0 1px 3px rgba(0, 0, 0, 0.1), 0 0 8px rgba(82, 168, 236, 0.6);" />`
                + `<label style="margin-top: 6vh; display: block; padding: 0.2em 0;" >`
                    + `JSON`
                    + `<span id="jsontest" style="margin-left: 6px; color: red; font-size: 80%;"></span>`
                + `</label>`
                + `<hr style="margin-top: -0.3em;" />`
                + `<textarea id="nd_data" type="text" style="display: block; width: 99%; `
                + `resize: none; height: 26vh; box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1),`
                + ` 0 0 8px rgba(82, 168, 236, 0.6);" ></textarea>`
                + `<button onclick="quitND()" style="margin: 4vmin 17%; width: 16%;" >`
                    + `取消`
                + `</button>`
                + `<button onclick="sendND()" style="margin: 4vmin 17%; width: 16%;" >`
                    + `添加`
                + `</button>`
            )
        },
        style: {
            // "background-color": "rgb(225,225,225)",
            background: "black url(static/img/container.jpg) no-repeat fixed top / cover",
            color: "rgb(236,236,236)",
            position: "absolute",
            top: "12vh",
            padding: "4vh 2vw",
            left: "26vw",
            width: "40vw",
            display: ND["<state>"].active ? "unset" : "none",
            "box-shadow": "5px 4px 3px rgba(30,30,30,0.8)"
        }
    };
}).next(() => {
    if (ND["<state>"].active) {
        $("#container").hide();

        const test = () => {
            testJSON();
            if (ND["<state>"].active) {
                setTimeout(test, 300);
            }
        };

        test();
    } else if (!AL["<state>"].activeAlgo && !LI["<state>"].active) {
        $("#container").show();
    }
});

// 提交数据到添加弹窗
const submitToND = (name, data) => {
    ND.update({
        active: true
    });
    if (name) {
        $("#nd_name").val(name);
    }
    $("#nd_data").val(JSON.stringify(data));
};

const quitAL = () => {
    AL.update({
        activeAlgo: null
    });
};

const sendAL = () => {
    if ($("#run_state").text() === "运行中") {
        toast("任务已在运行中");
        return;
    }
    if (!AL.legal) {
        toast("部分参数不符合要求");
        return;
    }
    const request = AL["<state>"].activeAlgo.input.flat(1).map(a => {
        return a.useImport ? (
            W["<state>"].data[parseInt(
                $(`select[name='input_${ a.name }']`).val()
            )].data
        ) : (
            $(`#input_${ a.name }`).val() ? JSON.parse(
                $(`#input_${ a.name }`).val().toString()
            ) : null
        );
    });
    
    $("#run_state").text("运行中");
    toast("任务开始运行");
    AL["<state>"].activeAlgo.start(request);
};

const nextInput = () => {
    AL.update({
        step: AL['<state>'].step + 1
    });
};

// 算法启动界面
const AL = createNode(null, {
    activeAlgo: null,
    step: 0
}).render(() => {
    AL.legal = true;
    const steps = AL["<state>"].activeAlgo ? (
        AL["<state>"].activeAlgo.steps || 1
    ) : 1;
    const input = AL["<state>"].activeAlgo ? (
        steps > 1 ? AL["<state>"].activeAlgo.input.map((d, i) => {
            return d.map(e => {
                return {
                    ...e,
                    step: i
                }
            });
        }).flat(1) : AL["<state>"].activeAlgo.input.map(e => {
            return {
                ...e,
                step: 0
            }
        })
    ) : [];
    
    return {
        id: "#",
        tag: "div",
        attr: {
            innerHTML: AL["<state>"].activeAlgo ? (
                `<label style="display: block; padding: 0.5em 0; font-size: 110%;" >运行</label>`
                + `<label style="display: block; padding: 0.5em 0; font-size: 110%;" >`
                    + `${ AL["<state>"].activeAlgo ? (
	                    steps < 2 || AL['<state>'].step === 0 ? "物流配送问题" : AL["<state>"].activeAlgo.name
                    ) : "null" }`
                + `</label>`
                + `<label style="display: block; padding: 0.2em 0;" >`
                + (
                    steps === 1 ? "算法输入" : (
                        AL['<state>'].step === 0 ? "问题参数" : "算法参数"
                    )
                )
                + `</label>`
                + `<hr style="margin-top: -0.3em;" />`
                + `<div style="display: flex;" >`
                    + `<div style="flex: 1;" >`
                    + (
                        input.length ? (
                            input.map(a => {
                                return (
                                    `<label style="display: block; padding: 0.2em 0;`
                                    + ` display: ${
                                        a.step === AL['<state>'].step ? "block" : "none"
                                    };" >`
                                        + `<span style="color: rgb(53,140,214);" >`
                                            + `${ a.name }`
                                        + `</span>`
                                        + (
                                            a.tips ? (
                                                `<span style="font-size: 80%; margin-left: 2em;" >`
                                                    + `${ a.tips }`
                                                + `</span>`
                                            ) : ""
                                        )
                                    + `</label>`
                                    + `<label style="display: block; padding: 0.2em 0;`
                                    + ` display: ${
                                        a.step === AL['<state>'].step ? "block" : "none"
                                    };" >`
                                    + (
                                        a.useImport ? (
                                            W["<state>"].data.length ? (
                                                `<select name="input_${ a.name }" >`
                                                + (
                                                    W["<state>"].data.map((d, i) => {
                                                        return (
                                                            `<option value="${ i }">`
                                                                + `${ d.name }`
                                                            + `</option>`
                                                        );
                                                    }).join("")
                                                )
                                                + `</select>`
                                            ) : (
                                                `<label style="padding: 0.2em 0; color: red;">`
                                                    + `没有可供选择的数据`
                                                + `</label>`
                                            )
                                        ) : (
                                            `<input id="input_${ a.name }"`
                                            + ` style="width: 40%; box-shadow: inset 0 1px 3px`
                                            + ` rgba(0, 0, 0, 0.1), 0 0 8px rgba(82, 168, 236, 0.6);`
                                            + ` " />`
                                        )
                                    ) + `<span id="check_${ a.name }"`
                                        + ` style="color: red; font-size: 80%; margin-left: 0.3em;" >`
                                            + `参数不符`
                                        + `</span>`
                                    + `</label>`
                                );
                            }).join("")
                        ) : `<label style="display: block; padding: 0.2em 0;" >没有输入</label>`
                    )
                    + `</div>`
                    + `<div>`
                        + `<img src="./static/img/${
                            AL["<state>"].activeAlgo.name
                        }_${
                            AL['<state>'].step
                        }.jpg" alt=""
                            style="max-width: 18vw;" />`
                        + (
                            AL['<state>'].step === 0 ? (
                                "<div style='display: flex; justify-content: flex-end; align-items: center; margin-top: 0.5em;' >"
                                    + "<a href='https://wkbjcloudbos.bdimg.com/v1/wenku21//35d2ddbdd10121f804b472974aa3aa53?responseContentDisposition=attachment%3B%20filename%3D%22%25E8%25BD%25A6%25E8%25BE%2586%25E8%25B7%25AF%25E5%25BE%2584%25E9%2597%25AE%25E9%25A2%2598.doc%22%3B%20filename%2A%3Dutf-8%27%27%25E8%25BD%25A6%25E8%25BE%2586%25E8%25B7%25AF%25E5%25BE%2584%25E9%2597%25AE%25E9%25A2%2598.doc&responseContentType=application%2Foctet-stream&responseCacheControl=no-cache&authorization=bce-auth-v1%2Ffa1126e91489401fa7cc85045ce7179e%2F2020-11-30T13%3A23%3A40Z%2F3000%2Fhost%2Fc8a7e05f1a5d5e5aeb21f05391bd07b687e0bc70334b735a9b65be5db71c7082&token=eyJ0eXAiOiJKSVQiLCJ2ZXIiOiIxLjAiLCJhbGciOiJIUzI1NiIsImV4cCI6MTYwNjc0NTYyMCwidXJpIjp0cnVlLCJwYXJhbXMiOlsicmVzcG9uc2VDb250ZW50RGlzcG9zaXRpb24iLCJyZXNwb25zZUNvbnRlbnRUeXBlIiwicmVzcG9uc2VDYWNoZUNvbnRyb2wiXX0%3D.5b%2Br4mmuL%2FHanUP9UPK3KntkSEt0Bt0c3%2FUCUm%2F0M7I%3D.1606745620' "
                                    + "style='cursor: pointer; color: rgb(74,118,181); "
                                    + "text-decoration: underline' >问题介绍</a>"
                                    + "<pre style='margin: 0;' > </pre>"
                                    + "<img width='18.4px' height='18.4px' src='https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=1214975356,507844605&fm=26&gp=0.jpg' />"
                                + "</div>"
                            ) : ""
                        )
                    + `</div>`
                + `</div>`
                + ((
                    AL['<state>'].step === steps - 1
                ) ? (
                    `<label style="display: block; padding: 2.2em 0 0.2em;" >算法输出</label>`
                    + `<hr style="margin-top: -0.3em;" />`
                    + `<label style="padding: 0.2em 0;" >运行状态：</label>`
                    + `<label id="run_state" style="padding: 0.2em 0; margin-left: 2em;" >未启动</label>`
                    + `<br />`
                    + `<br />`
                    + `<label style="padding: 0.2em 0; display: block;" >输出数据：</label>`
                    + `<div id="run_output" style="display: block; font-size: 80%;" >没有数据</div>`
                    + `<button onclick="quitAL()" style="margin: 4vmin 17%; width: 16%;" >`
                        + `退出`
                    + `</button>`
                    + `<button id="sendAL" onclick="sendAL()" style="margin: 4vmin 17%; width: 16%;" >`
                        + `运行`
                    + `</button>`
                ) : (
                    `<button id="nextInput" onclick="nextInput()" style="margin: 4vmin 40%; width: 20%;" >`
                        + `保存参数`
                    + `</button>`
                ))
            ) : ""
        },
        style: {
            // "background-color": "rgb(225,225,225)",
            background: "black url(static/img/container2.jpg) no-repeat fixed top / cover",
            color: "rgb(15,15,15)",
            position: "absolute",
            top: "12vh",
            padding: "4vh 2vw",
            left: "26vw",
            width: "40vw",
            display: AL["<state>"].activeAlgo ? "unset" : "none",
            "box-shadow": "5px 4px 3px rgba(30,30,30,0.8)",
            // border: "1px solid black",
            overflow: "hidden scroll",
            "max-height": "72vh"
        }
    };
}).next(() => {
    if (AL["<state>"].activeAlgo) {
        $("#container").hide();

        AL["<state>"].activeAlgo.input.flat(1).forEach(a => {
            if (!a.useImport && a.default !== void 0) {
                $(`#input_${ a.name }`).val(JSON.stringify(a.default));
            }
        });

        const test = () => {
            AL.legal = true;
            if (!AL["<state>"].activeAlgo) {
                return;
            }
            AL["<state>"].activeAlgo.input.flat(1).forEach(a => {
                try {
                    const val = a.useImport ? (
                        W["<state>"].data[parseInt(
                            $(`select[name='input_${ a.name }']`).val()
                        )].data
                    ) : (
                        $(`#input_${ a.name }`).val() ? JSON.parse(
                            $(`#input_${ a.name }`).val().toString()
                        ) : null
                    );
                    if (a.check(val)) {
                        $(`#check_${ a.name }`).hide();
                    } else {
                        $(`#check_${ a.name }`).show();
                        AL.legal = false;
                    }
                } catch {
                    $(`#check_${ a.name }`).show();
                    AL.legal = false;
                }
            });
            if (AL["<state>"].activeAlgo) {
                setTimeout(test, 300);
            }
        };

        test();
    } else if (!ND["<state>"].active && !LI["<state>"].active) {
        $("#container").show();
    }
});

// 接受后端返回的算法输出
const receive = res => {
    if (!AL["<state>"].activeAlgo) {
        // 已经不在该界面
        return;
    }
    $("#run_state").text("运行完成");

    $("#sendAL").text("全部保存");

    const render = data => {
        $("#sendAL")[0].onclick = () => {
            appendData(data.map((d, i) => {
                return {
                    name: ($(`#output_${ i }`).val() || d.name).toString(),
                    data: d.data
                };
            }));
            quitAL();
        };

        $("#run_output")[0].innerHTML = data.map((s, i) => {
            copyRestore[i] = JSON.stringify(s.data);
            let show = JSON.stringify(s.data);
            if (show.length > 90) {
                show = show.substring(0, 89) + "...";
            }
            return (
                `<div style="margin-bottom: 12px; border: 1px solid; background-color: rgb(11,11,11);" >`
                    // 数据名称
                    + `<div style="background-color: rgb(78,78,80); padding: 0.2em 0.8em;" >`
                        + `<input id="output_${ i }" />`
                    + `</div>`
                    // 保存和移除
                    + `<div style="text-align: end; margin: -22px 6px 0px;" >`
                        + `<img id="output_save_${ i }" src="./static/img/add.jpg" width="18" height="18"`
                        + ` style="cursor: pointer;"`
                        + ` ondragstart="return false;" title="保存" />`
                        + `<img id="output_pop_${ i }" src="./static/img/remove.jpg" width="18" height="18"`
                        + ` style="margin-left: 4px; cursor: pointer;"`
                        + ` ondragstart="return false;" title="移除" />`
                    + `</div>`
                    // 显示概览
                    + `<div title='${ JSON.stringify(s.data) }' `
                    + `style="user-select: none; color: rgb(205,205,210); `
                    + `padding: 0.2em 0.8em; font-size: 80%; word-break: break-all;`
                    + `min-height: 1.5em; max-height: 6em; overflow: hidden;" >`
                        + `${ show }`
                    + `</div>`
                    // 数组信息
                    + (
                        typeof s.data === "object" && Array.isArray(s.data) ? (
                            `<div style="color: rgb(94,158,72); `
                            + `padding: 0 0.8em 0.2em; font-size: 90%; text-align: right;" >`
                                + `length=${
                                    s.data.length
                                }`
                            + `</div>`
                        ) : ""
                    )
                + `</div>`
            )
        });
    
        const pop = i => {
            render(data.filter((_, j) => j !== i));
        };
    
        data.forEach((s, i) => {
            $(`#output_${ i }`).val(s.name);
            $(`#output_save_${ i }`).on("click", () => {
                submitToND(
                    ($(`#output_save_${ i }`).val() || s.name).toString(),
                    s.data
                );
                $(AL.find("#")).hide();
                onNDexit = b => {
                    $(AL.find("#")).show();
                    if (b) {
                        toast("已保存");
                        pop(i);
                    }
                };
            });
            $(`#output_pop_${ i }`).on("click", () => {
                pop(i);
            });
        });
    };

    render(res);
};

// 后端算法返回错误，结束任务
const receiveError = reason => {
    if (!AL["<state>"].activeAlgo) {
        // 已经不在该界面
        return;
    }
    $("#run_state").text("出现错误");

    $("#sendAL").remove();

    const render = errorInfo => $("#run_output")[0].innerHTML += (
        `<div style="margin-bottom: 12px; border: 1px solid; background-color: rgb(11,11,11);" >`
            // 显示概览
            + `<div `
            + `style="user-select: none; color: rgb(236,128,104); `
            + `padding: 0.2em 0.8em; font-size: 80%; word-break: break-all;`
            + `min-height: 1.5em; max-height: 6em; overflow: hidden;" >`
                + `${ JSON.stringify(errorInfo) }`
            + `</div>`
        + `</div>`
    );

    render(reason);
};

// 最顶层的结构
const Q = createNode(null, null).render(() => {
    return [{
        id: 0,
        tag: "div",
        attr: {
            id: "container"
        }
    }, {
        id: 1,
        parent: 0,
        tag: "div",
        style: {
            "background": "rgb(130,130,130) "
                + "url(static/img/title.jpg) no-repeat fixed top / cover",
            height: "25px",
            width: "95.7vw",
            "margin-bottom": "12px",
            padding: "10px",
            display: "flex",
            "align-items": "center",
            "justify-content": "flex-end"
        },
        attr: {
            innerHTML: (
                `<label style="display: inline-block; text-align: end;" >`
                //     + `<span class="save_btn"`
                //     + ` style="padding: 4px 6px; color: rgb(140,179,255);`
                //     + ` cursor: pointer; font-weight: 200;`
                //     + ` border: 1px solid rgb(0,122,204); border-radius: 4px;" >`
                //         + `实验数据导出`
                //     + `</span>`
                // + `</label>`
                // + `<label style="display: inline-block; text-align: end;" >`
                    + `<span class="save_btn" onclick="stg()"`
                    + ` style="margin: 20px; padding: 4px 6px; color: rgb(140,179,255);`
                    + ` text-decoration: underline; cursor: pointer; font-weight: 200;`
                    + ` border: 1px solid rgb(0,122,204); border-radius: 4px;" >`
                        + `Settings...`
                    + `</span>`
                + `</label>`
            )
        }
    }, {
        ...TB,
        parent: 0
    }, {
        ...G,
        parent: 0
    }, {
        ...W,
        parent: 0
    }, {
        ...AL
    }, {
        ...ND
    }, {
        ...LI
    }, {
        ...AC
    }];
});

// 从最顶层开始初始化渲染
// use(Q, $("div#all")[0]);
