(() => {
    if (window.location.protocol === 'https:' || window.location.protocol === 'https') {
        alert('该网页无法在https协议下正常浏览, 正在尝试跳转到http!');
        window.location.href = window.location.href.replace(/^https/, 'http');
    }
})()