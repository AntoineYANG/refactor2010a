const clip = document.createElement("div");

window.onload = () => {
    clip.style.width = 0;
    clip.style.height = 0;
    clip.style.overflow = "hidden";
    clip.style.userSelect = "unset";
    document.body.appendChild(clip);
};

let copyRestore = {};

const execCopy = code => {
    clip.innerText = copyRestore[code];

    const selection = window.getSelection();
    selection.removeAllRanges();

    const range = document.createRange();
    range.selectNodeContents(clip);

    selection.addRange(range);

    document.execCommand('copy');

    selection.removeAllRanges();

    toast("复制成功");
};
