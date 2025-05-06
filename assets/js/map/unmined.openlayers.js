let tilesBackend = 'http://play.dogelake.cn:21309';
let llseBackend = 'http://play.dogelake.cn:21309/doge';

let markersLayer;
class Unmined {
    map(mapId, options, regions) {

        const dpiScale = window.devicePixelRatio ?? 1.0;

        const worldMinX = options.minRegionX * 512;
        const worldMinY = options.minRegionZ * 512;
        const worldWidth = (options.maxRegionX + 1 - options.minRegionX) * 512;
        const worldHeight = (options.maxRegionZ + 1 - options.minRegionZ) * 512;

        const worldTileSize = 256;

        const worldMaxZoomFactor = Math.pow(2, options.maxZoom);

        // left, bottom, right, top, Y is negated
        const mapExtent = ol.extent.boundingExtent([
            [worldMinX * worldMaxZoomFactor, -(worldMinY + worldHeight) * worldMaxZoomFactor],
            [(worldMinX + worldWidth) * worldMaxZoomFactor, -worldMinY * worldMaxZoomFactor]]);

        const viewProjection = new ol.proj.Projection({
            code: 'VIEW',
            units: 'pixels',
        });

        const dataProjection = new ol.proj.Projection({
            code: 'DATA',
            units: 'pixels',
        });

        // Coordinate transformation between view and data
        // OpenLayers Y is positive up, world Y is positive down
        ol.proj.addCoordinateTransforms(viewProjection, dataProjection,
            function (coordinate) {
                return [coordinate[0], -coordinate[1]];
            },
            function (coordinate) {
                return [coordinate[0], -coordinate[1]];
            });

        const mapZoomLevels = options.maxZoom - options.minZoom;
        // Resolution for each OpenLayers zoom level        
        const resolutions = new Array(mapZoomLevels + 1);
        for (let z = 0; z < mapZoomLevels + 1; ++z) {
            resolutions[mapZoomLevels - z] = Math.pow(2, z) * dpiScale / worldMaxZoomFactor;
        }

        const tileGrid = new ol.tilegrid.TileGrid({
            extent: mapExtent,
            origin: [0, 0],
            resolutions: resolutions,
            tileSize: worldTileSize / dpiScale
        });

        const unminedLayer =
            new ol.layer.Tile({
                source: new ol.source.XYZ({
                    projection: viewProjection,
                    tileGrid: tileGrid,
                    tilePixelRatio: dpiScale,
                    tileSize: worldTileSize / dpiScale,

                    tileUrlFunction: function (coordinate) {
                        const worldZoom = -(mapZoomLevels - coordinate[0]) + options.maxZoom;
                        const worldZoomFactor = Math.pow(2, worldZoom);

                        const minTileX = Math.floor(worldMinX * worldZoomFactor / worldTileSize);
                        const minTileY = Math.floor(worldMinY * worldZoomFactor / worldTileSize);
                        const maxTileX = Math.ceil((worldMinX + worldWidth) * worldZoomFactor / worldTileSize) - 1;
                        const maxTileY = Math.ceil((worldMinY + worldHeight) * worldZoomFactor / worldTileSize) - 1;

                        const tileX = coordinate[1];
                        const tileY = coordinate[2];

                        const tileBlockSize = worldTileSize / worldZoomFactor;
                        const tileBlockPoint = {
                            x: tileX * tileBlockSize,
                            z: tileY * tileBlockSize
                        };

                        const hasTile = function () {
                            const tileRegionPoint = {
                                x: Math.floor(tileBlockPoint.x / 512),
                                z: Math.floor(tileBlockPoint.z / 512)
                            };
                            const tileRegionSize = Math.ceil(tileBlockSize / 512);

                            for (let x = tileRegionPoint.x; x < tileRegionPoint.x + tileRegionSize; x++) {
                                for (let z = tileRegionPoint.z; z < tileRegionPoint.z + tileRegionSize; z++) {
                                    const group = {
                                        x: Math.floor(x / 32),
                                        z: Math.floor(z / 32)
                                    };
                                    const regionMap = regions.find(e => e.x === group.x && e.z === group.z);
                                    if (regionMap) {
                                        const relX = x - group.x * 32;
                                        const relZ = z - group.z * 32;
                                        const inx = relZ * 32 + relX;
                                        const b = regionMap.m[Math.floor(inx / 32)];
                                        const bit = inx % 32;
                                        const found = (b & (1 << bit)) !== 0;
                                        if (found) return true;
                                    }
                                }
                            }
                            return false;
                        };

                        if (tileX >= minTileX
                            && tileY >= minTileY
                            && tileX <= maxTileX
                            && tileY <= maxTileY
                            && hasTile()) {
                            return (tilesBackend + '/tiles/zoom.{z}/{xd}/{yd}/tile.{x}.{y}.' + options.imageFormat)
                                .replace('{z}', worldZoom)
                                .replace('{yd}', Math.floor(tileY / 10))
                                .replace('{xd}', Math.floor(tileX / 10))
                                .replace('{y}', tileY)
                                .replace('{x}', tileX);
                        } else
                            return undefined;
                    }
                })
            });

        const map = new ol.Map({
            target: mapId,
            controls: ol.control.defaults().extend([

                new ol.control.MousePosition({
                    coordinateFormat: ol.coordinate.createStringXY(0),
                    projection: dataProjection
                }),

                new ol.control.LayerSwitcher()

            ]),
            layers: [
                unminedLayer,

                // new ol.layer.Tile({
                //     source: new ol.source.TileDebug({
                //         tileGrid: tileGrid,
                //         projection: viewProjection
                //     })
                // })
            ],
            view: new ol.View({
                center: [0, 0],
                extent: mapExtent,
                projection: viewProjection,
                resolutions: tileGrid.getResolutions(),
                maxZoom: mapZoomLevels,
                zoom: mapZoomLevels - options.maxZoom,
                constrainResolution: true,
                showFullExtent: true,
                constrainOnlyCenter: true
            })
        });


        let playerMarkersLayer;
        let lastGetPlayerMarkersTime = new Date().getTime();
        const getPlayerMarkers = () => {
            $.ajax({
                url: llseBackend + '/getPlayerMarkers',
                type: 'GET',
                dataType: 'json',
                success: data => {
                    // TODO delete
                    data = data.markers

                    if (playerMarkersLayer) map.removeLayer(playerMarkersLayer);
                    playerMarkersLayer = this.createMarkersLayer(data, dataProjection, viewProjection);
                    map.addLayer(playerMarkersLayer);

                    let now = new Date().getTime();
                    setTimeout(getPlayerMarkers, Math.max(0,
                        1000 - (now - lastGetPlayerMarkersTime)
                    ));
                    lastGetPlayerMarkersTime = now;
                    // getPlayerMarkers();
                }
            });
        };
        getPlayerMarkers();
        // setInterval(getPlayerMarkers, 1000);

        let placeMarkersLayer;
        $.ajax({
            url: llseBackend + '/getPlaceMarkers',
            type: 'GET',
            dataType: 'json',
            success: data => {
                placeMarkersLayer = this.createMarkersLayer(data, dataProjection, viewProjection);
                map.addLayer(switchable(placeMarkersLayer));
            }
        });

        // Marks
        markersLayer = this.createMarkersLayer(options.markers, dataProjection, viewProjection);
        map.addLayer(markersLayer);

        this.openlayersMap = map;
    }

    createMarkersLayer(markers, dataProjection, viewProjection) {
        const features = [];

        for (let i = 0; i < markers.length; i++) {
            const item = markers[i];
            const longitude = item.x;
            const latitude = item.z;

            const feature = new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.transform([longitude, latitude], dataProjection, viewProjection))
            });

            const style = new ol.style.Style();

            if (item.image === 'steve.png') {

                style.setImage(new ol.style.Icon({
                    src: 'assets/img/map/player.png',
                    anchor: [0.5, .5],
                    scale: .3,
                    rotation: item.rotation ? (item.rotation + 180) * (Math.PI / 180) : 0
                }));
                style.setText(new ol.style.Text({
                    text: item.text,
                    font: '.6rem Minecraft, Unifont, system-ui',
                    offsetX: item.offsetX,
                    offsetY: item.offsetY,
                    fill: new ol.style.Fill({color: '#ffffff'}),
                    padding: item.textPadding ?? [2, 4, 2, 4],
                    stroke: new ol.style.Stroke({color: '#000000', width: 3}),
                    backgroundFill: item.textBackgroundColor ? new ol.style.Fill({
                        color: item.textBackgroundColor
                    }) : null,
                    backgroundStroke: item.textBackgroundStrokeColor ? new ol.style.Stroke({
                        color: item.textBackgroundStrokeColor,
                        width: item.textBackgroundStrokeWidth
                    }) : null,
                }));

            } else {

                if (item.image)
                    style.setImage(new ol.style.Icon({
                        src: item.image,
                        anchor: item.imageAnchor,
                        scale: item.imageScale
                    }));
                if (item.text) {
                    style.setText(new ol.style.Text({
                        text: item.text,
                        font: item.font,
                        offsetX: item.offsetX,
                        offsetY: item.offsetY,
                        fill: item.textColor ? new ol.style.Fill({
                            color: item.textColor
                        }) : null,
                        padding: item.textPadding ?? [2, 4, 2, 4],
                        stroke: item.textStrokeColor ? new ol.style.Stroke({
                            color: item.textStrokeColor,
                            width: item.textStrokeWidth
                        }) : null,
                        backgroundFill: item.textBackgroundColor ? new ol.style.Fill({
                            color: item.textBackgroundColor
                        }) : null,
                        backgroundStroke: item.textBackgroundStrokeColor ? new ol.style.Stroke({
                            color: item.textBackgroundStrokeColor,
                            width: item.textBackgroundStrokeWidth
                        }) : null,
                    }));
                }

            }

            feature.setStyle(style);
            features.push(feature);
        }

        const vectorSource = new ol.source.Vector({
            features: features
        });

        return new ol.layer.Vector({
            source: vectorSource
        });
    }
}
