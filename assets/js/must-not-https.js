(() => {
    if (window.location.protocol === 'https:' || window.location.protocol === 'https') {
        window.location.href = window.location.href.replace(/^https/, 'http');
    }
})()