$(function () { 
    const map = initializeLeaflet();

    //Create the start and end markers
    const markerPositions = { startPos: null, endPos: null };
    leafletCreateMarkers(map, markerPositions);

    handleCheckbox(map);
    handleCalculateButton(map, markerPositions);
});

function handleCalculateButton(_map, _mPos) {
    const button = $('#btn-calc');

    button.click(function (e) { 
        sendCalculationRequest(_map, _mPos);

        $('#chk-show-all').prop('checked', false);
        hidePathPreview(_map);
    });
}

function handleCheckbox(_map) {
    const checkbox = $('#chk-show-all');

    previewAllPaths(_map);
    checkbox.prop('checked', true);
    checkbox.change(function (){
        const checked = checkbox.is(':checked');

        if(checked) {
            previewAllPaths(_map);
        } else {
            hidePathPreview(_map);
        }
    });
}