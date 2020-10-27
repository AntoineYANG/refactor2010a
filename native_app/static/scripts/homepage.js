/*
 * @Author: Kanata You 
 * @Date: 2020-10-27 18:32:54 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2020-10-27 19:33:52
 */

const homepage = {
    node: createNode(null, null).render(() => {
        return [{
            id: 0,
            tag: "div",
            style: {
                "min-height": "80vh",
                margin: "9vh 8vw",
                width: "84vw",
                display: "flex",
                "flex-direction": "column",
                color: "rgb(225,225,225)",
                "justify-content": "space-between",
                "text-align": "center"
            }
        }, {
            id: "header",
            parent: 0,
            tag: "div",
            style: {
                background: "black",
                color: "#03e9f4",
                overflow: "hidden",
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%"
            },
            attr: {
                innerHTML: (
                    `<h1 style="margin: 0.6em 0 0.55em;" >
                        智慧物流平台
                    </h1><span id="header_ani" ></span>`
                )
            }
        }, {
            id: "navi",
            parent: 0,
            tag: "div",
            style: {
                flex: 1,
                margin: "10vh 6vw 0",
                color: "rgb(225,225,225)",
                "font-size": "140%",
                position: "relative",
                background: "#060c21",
                display: "flex",
                "flex-direction": "column"
            },
            attr: {
                id: "listcontainer"
            }
        }, {
            id: "navi-inside",
            parent: "navi",
            tag: "div",
            style: {
                padding: "5vh 4vw",
                display: "flex",
                "justify-content": "space-between",
                flex: 1
            },
            attr: {
                innerHTML: [
                    { name: "云制造服务组合", url: "./img/home_router_0.png" },
                    { name: "物流配送调度", url: "./img/home_router_1.png" },
                    { name: "生产计划排程", url: "./img/home_router_2.jpg" },
                    { name: "货运网络规划", url: "./img/home_router_3.png" }
                ].map(item => {
                    return (
                        `<div class="option_item"
                        style="padding: 2vh 0; display: inline-flex; cursor: pointer;
                        flex-direction: column; justify-content: space-around;" >
                            <img alt="图片未加载" src="${ item.url }" ondragstart="void 0"
                            style="width: 11vw; height: 11vw; font-size: 60%; font-weight: 400;" />
                            <label>${ item.name }</label>
                        </div>`
                    );
                }).join("")
            }
        }];
    }),
    turn: () => {
        $("div#all").html("");
        use(Q, $("div#all")[0]);
    },
    render: () => {
        // 从最顶层开始初始化渲染
        use(homepage.node, $("div#all")[0]);
        $(".option_item")[1].addEventListener("click", () => {
            homepage.turn();
        });
    }
};

homepage.render();
