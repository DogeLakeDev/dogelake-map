let layers = [];

function switchable(layer) {
    layers.push(layer);
    return layer;
}

// let v = false;
// setInterval(() => {
//     layers.forEach(layer => layer.setVisible(v = !v));
// }, 2000);

ol.control.LayerSwitcher = function () {
    // const root = ;
    //
    //
    // const _options = opt_options || {}
    //
    // const _root = document.createElement('div')
    // _root.className = 'ol-layer-data-loading'
    // _root.style = {
    //     'width':'100%',
    //     'height':'100%',
    //     'background-color':'rgba(255,255,255,0.5)'
    // }
    //
    // const _box = document.createElement('span')
    // _box.className = 'ol-layer-spin-dot-spin'
    //
    // for(let i = 0 ; i < 4; i++){
    //     const _i = document.createElement('i')
    //     _i.className = 'ol-layer-spin-dot-item dot'+i
    //     _box.appendChild(_i)
    // }
    // _root.appendChild(_box)

    const root = document.createElement("div");
    root.style = {
        width: '1rem',
        height: '1rem',
        background: 'red'
    }

    ol.control.Control.call(this, {
        element: root
    });
}
ol.inherits(ol.control.LayerSwitcher, ol.control.Control)