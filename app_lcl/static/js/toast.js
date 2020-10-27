/*
 * @Author: Antoine YANG 
 * @Date: 2020-08-03 17:39:48 
 * @Last Modified by: Antoine YANG
 * @Last Modified time: 2020-08-04 01:07:47
 */

const toast = debounced(text => {
    const t = document.createElement("div");
    t.style.display = "inline-block";
    t.style.position = "absolute";
    t.style.top = "24vh";
    t.style.left = "33vw";
    t.style.width = "28vw";
    t.style.textAlign = "center";
    t.style.backgroundColor = "rgb(22,22,22)";
    t.style.color = "rgb(244,255,226)";
    t.style.padding = "3vh 3vw";
    t.style.opacity = 0.8;
    t.innerText = text;
    document.body.appendChild(t);
    
    $(t).animate({
        top: "20vh"
    }, 800);

    setTimeout(() => {
        $(t).fadeOut(600);
    }, 800);
});
