async function timeOperation(_name, _func) {
    var time1 = new Date();

    await _func();

    alert(`${_name} took ${((new Date() - time1) / 1000).toFixed(2)} seconds to complete`);
}

async function timeOperationMultiple(_ops) {
    let returnStr = "";
    let totalTime = 0;

    for (let i = 0; i < _ops.length; i++) {
        const [label, func] = _ops[i];
        
        var time1 = new Date();
        await func();
        const duration = (new Date() - time1) / 1000
        returnStr += `${label} took ${duration.toFixed(2)} seconds to complete\n`;
        totalTime += duration;
    }
    returnStr+=`Total time: ${totalTime.toFixed(2)} seconds`;
    alert(returnStr);
}