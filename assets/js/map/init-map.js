try {
    UnminedMapProperties.markers = UnminedMapProperties.markers.concat(UnminedCustomMarkers.markers);
    let unmined = new Unmined();
    unmined.map('map', UnminedMapProperties, UnminedRegions);
} catch (e) {
    console.log(e);
}