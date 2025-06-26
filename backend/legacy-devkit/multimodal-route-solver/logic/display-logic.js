/**
 * Clears the Route Table's contents
 */
function clearRouteTable() {
    $('#rte-table tbody').html('');
}

/**
 * Shows the route info in the table
 * @param {*} _routeName Route's name
 * @param {*} _colorName Selected color
 */
function appendToRouteTableInfo(_routeName, _colorName) {
    $('#rte-table tbody').append(
        $(`<tr>
                <td>${_routeName}</td>
                <td>${_colorName}</td>
            </tr>`)
    );
}