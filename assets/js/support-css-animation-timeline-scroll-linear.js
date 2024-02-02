function supportAnimateTimelineCSS(list) {
    if (CSS.supports('animation-timeline: scroll()')) return;

    for (let [selector, animation] of list) {
        for (let node of document.querySelectorAll(selector)) {
            node.style.animation = `${animation} 999999s linear`;
            node.style.animationPlayState = 'paused';
            node.style.animationDelay = 'calc(var(--scroll-percentage))';
        }
    }

    // https://segmentfault.com/q/1010000012311653
    let totalHeight = document.body.scrollHeight || document.documentElement.scrollHeight, // 页面总高
        clientHeight = window.innerHeight || document.documentElement.clientHeight;  // 可视高
    window.addEventListener('scroll', () => {
        let validHeight = totalHeight - clientHeight, // 有效高
            scrollHeight = document.body.scrollTop || document.documentElement.scrollTop // 滚动条卷去高度
        document.body.style.setProperty("--scroll-percentage", `-${scrollHeight / validHeight * 999999}s`);
    });

    window.addEventListener('resize', debounce(location.reload, 1000));

    alert("您的浏览器不支持一些现代css属性, 网站某些功能可能会有兼容性问题");
}