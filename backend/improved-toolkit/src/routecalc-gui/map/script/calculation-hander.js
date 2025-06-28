function sendCalculationRequest(_map, _mPos) {
    $.ajax({
        type: "post",
        url: "/calc-route",
        contentType: "application/json",
        data: JSON.stringify({
            startPos: { lat: _mPos.startPos.lat, lng: _mPos.startPos.lng },
            endPos: { lat: _mPos.endPos.lat, lng: _mPos.endPos.lng }
        }),
        dataType: "json",
        success: async function (response) {         
            console.log(response);
            
            // L.polyline(response.plainPath, {
            //     color: 'red'
            // }).addTo(_map);

            drawRouteLegs(_map, response.legs);
            // await visualizeCalculatedMergedPath(_map, response.merged, response.routes, response.startCoord, response.endCoord);
        }
    });
}
