// css scroll-behavior 没反应, 只能用js力 :/
document.querySelector('.page-welcome .button').onclick = () => window.scrollTo({
    top: window.innerHeight,
    behavior: 'smooth'
});
const map = document.getElementById("map");
document.querySelector('.fullscreen').onclick = () => {
    if (map.requestFullscreen) {
        map.requestFullscreen();
    } else if (map.mozRequestFullScreen) {
        map.mozRequestFullScreen();
    } else if (map.msRequestFullscreen) {
        map.msRequestFullscreen();
    } else if (map.webkitRequestFullscreen) {
        map.webkitRequestFullScreen();
    }
}

supportAnimateTimelineCSS([
    ['.page-welcome', 'page-welcome-scroll'],
    ['.page-map .map-background', 'map-rotate'],
    ['.hand', 'hand-move'],
    ['.fullscreen', 'fullscreen-move'],
    ['#message-box', 'message-box-move']
]);



const messageBox = document.getElementById("message-box");
function sendMessage(msg) {
    let p = document.createElement("p");
    (p.textContent != null) ? (p.textContent = msg) : (p.innerText = msg);
    msg = p.innerHTML;
    motdParser.toHtml(msg, (err, res) => {
        res = err ? msg : res;
        p.innerHTML = res;
    });
    messageBox.appendChild(p);
    setTimeout(() => {
        p.style.opacity = '0';
        setTimeout(() => p.remove(), 200);
    }, 10000);
}

let lastMsgTimestamp = undefined;
const getRecentMsgs = () => {
    $.ajax({
        url: llseBackend + '/getRecentMsgs',
        type: 'GET',
        dataType: 'json',
        success: data => {
            if (!data || data.t.length === 0) return;

            if (lastMsgTimestamp === undefined) {
                lastMsgTimestamp = data.t.pop();
                return;
            }

            let index = data.t.lastIndexOf(lastMsgTimestamp);
            for (let i = index + 1; i < data.t.length; i++) {
                sendMessage(data.m[i]);
            }
            lastMsgTimestamp = data.t.pop();
        }
    });
};
getRecentMsgs();
setInterval(getRecentMsgs, 1000);