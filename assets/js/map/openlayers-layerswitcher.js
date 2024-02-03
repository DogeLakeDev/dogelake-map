let layers = [];

function switchable(layer) {
    layers.push(layer);
    setTimeout(() => layer.setVisible(false), 0);
    return layer;
}

ol.control.LayerSwitcher = function () {
    let shown = false;

    const span = document.createElement('span');
    span.classList.add('material-symbols-sharp');
    span.innerText = 'share_location';
    span.style = `
        position: absolute;
        right: 1rem;
        bottom: 1rem;
        padding: .5rem;
        width: 3rem;
        height: 3rem;
        font-size: 2rem;
        color: #fff;
        cursor: pointer;
        border-radius: calc(infinity * 1px);
        transition: all .1s ease;
    `;

    span.onclick = () => {
        shown = !shown;
        layers.forEach(layer => layer.setVisible(shown));
        span.style.background = shown ? '#b62121' : 'transparent';
    }

    ol.control.Control.call(this, {
        element: span
    });
}
ol.inherits(ol.control.LayerSwitcher, ol.control.Control);