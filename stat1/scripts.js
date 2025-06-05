function findSensorByTypeAndName(node, type, name, parentText = null) {
    if (parentText && node.Text === parentText) {
        for (const child of node.Children || []) {
            const res = findSensorByTypeAndName(child, type, name);
            if (res) return res;
        }
        return null;
    }
    if (node.Type === type && node.Text === name) return node;
    if (!node.Children) return null;
    for (const child of node.Children) {
        const result = findSensorByTypeAndName(child, type, name, parentText);
        if (result) return result;
    }
    return null;
}

function formatFixedWidthValue(num, totalDigits = 3) {
    // Формат: XXX,X (например: 007,2 или 103,5)
    num = String(num).replace(',', '.').replace(/[^\d.]/g, '');
    let f = Number(num);
    num = f.toFixed(1);
    let [intPart, fracPart] = num.split('.');
    intPart = intPart || '0';
    let padded = intPart.padStart(totalDigits, '0');
    let firstNonZero = padded.search(/[^0]/);
    if (firstNonZero === -1) firstNonZero = totalDigits - 1;
    let result = '';
    for (let i = 0; i < padded.length; ++i) {
        if (i < firstNonZero)
            result += `<span class="leading-zero">${padded[i]}</span>`;
        else
            result += `<span>${padded[i]}</span>`;
    }
    result += ',' + `<span>${fracPart}</span>`;
    return result;
}

function formatRamUsed(num, totalDigits = 2) {
    // Формат: XX,X (например: 09,5 или 15,3)
    num = String(num).replace(',', '.').replace(/[^\d.]/g, '');
    let f = Number(num);
    num = f.toFixed(1);
    let [intPart, fracPart] = num.split('.');
    intPart = intPart || '0';
    let padded = intPart.padStart(totalDigits, '0');
    let firstNonZero = padded.search(/[^0]/);
    if (firstNonZero === -1) firstNonZero = totalDigits - 1;
    let result = '';
    for (let i = 0; i < padded.length; ++i) {
        if (i < firstNonZero)
            result += `<span class="leading-zero">${padded[i]}</span>`;
        else
            result += `<span>${padded[i]}</span>`;
    }
    result += ',' + `<span>${fracPart}</span>`;
    return result;
}

function formatSSDMBps(num, totalDigits = 4) {
    // Формат: XXXX,X (например: 0056,5)
    num = String(num).replace(',', '.').replace(/[^\d.]/g, '');
    let f = Number(num);
    num = f.toFixed(1);
    let [intPart, fracPart] = num.split('.');
    intPart = intPart || '0';
    let padded = intPart.padStart(totalDigits, '0');
    let firstNonZero = padded.search(/[^0]/);
    if (firstNonZero === -1) firstNonZero = totalDigits - 1;
    let result = '';
    for (let i = 0; i < padded.length; ++i) {
        if (i < firstNonZero)
            result += `<span class="leading-zero">${padded[i]}</span>`;
        else
            result += `<span>${padded[i]}</span>`;
    }
    result += ',' + `<span>${fracPart}</span>`;
    return result;
}

// Приведение к MB/s
function parseRateToMBps(value) {
    if (!value) return '--';
    value = value.replace(',', '.');
    if (value.includes('KB/s')) {
        return (parseFloat(value) / 1024).toFixed(1);
    } else if (value.includes('MB/s')) {
        return parseFloat(value).toFixed(1);
    } else {
        return parseFloat(value).toFixed(1);
    }
}

async function updateInfo() {
    try {
        const response = await fetch('http://192.168.0.210:8888/data.json');
        const data = await response.json();

        const gpuLoad = findSensorByTypeAndName(data, 'Load', 'GPU Core');
        const gpuTemp = findSensorByTypeAndName(data, 'Temperature', 'GPU Core');
        const cpuLoad = findSensorByTypeAndName(data, 'Load', 'CPU Total');
        const cpuTemp = findSensorByTypeAndName(data, 'Temperature', 'Core (Tctl/Tdie)');
        const ramLoad = findSensorByTypeAndName(data, 'Load', 'Memory');
        const ramUsed = findSensorByTypeAndName(data, 'Data', 'Memory Used');
        const ssdRead = findSensorByTypeAndName(data, 'Throughput', 'Read Rate', 'WD_BLACK SN850X 1000GB');
        const ssdWrite = findSensorByTypeAndName(data, 'Throughput', 'Write Rate', 'WD_BLACK SN850X 1000GB');

        document.getElementById('gpu_load').innerHTML = gpuLoad
            ? formatFixedWidthValue(gpuLoad.Value.replace('%','').replace(' ','').replace('\u00A0',''), 3)
            : '--';
        document.getElementById('gpu_temp').innerHTML = gpuTemp
            ? formatFixedWidthValue(gpuTemp.Value.replace('°C','').replace(' ','').replace('\u00A0',''), 3)
            : '--';
        document.getElementById('cpu_load').innerHTML = cpuLoad
            ? formatFixedWidthValue(cpuLoad.Value.replace('%','').replace(' ','').replace('\u00A0',''), 3)
            : '--';
        document.getElementById('cpu_temp').innerHTML = cpuTemp
            ? formatFixedWidthValue(cpuTemp.Value.replace('°C','').replace(' ','').replace('\u00A0',''), 3)
            : '--';
        document.getElementById('ram_load').innerHTML = ramLoad
            ? formatFixedWidthValue(ramLoad.Value.replace('%','').replace(' ','').replace('\u00A0',''), 3)
            : '--';
        document.getElementById('ram_used').innerHTML = ramUsed
            ? formatRamUsed(ramUsed.Value.replace(' GB','').replace(' ','').replace('\u00A0',''), 2)
            : '--';
        document.getElementById('ssd_read').innerHTML = ssdRead
            ? formatSSDMBps(parseRateToMBps(ssdRead.Value), 4)
            : '--';
        document.getElementById('ssd_write').innerHTML = ssdWrite
            ? formatSSDMBps(parseRateToMBps(ssdWrite.Value), 4)
            : '--';

    } catch (err) {
        document.getElementById('gpu_load').textContent = 'Ошибка';
        document.getElementById('gpu_temp').textContent = 'Ошибка';
        document.getElementById('cpu_load').textContent = 'Ошибка';
        document.getElementById('cpu_temp').textContent = 'Ошибка';
        document.getElementById('ram_load').textContent = 'Ошибка';
        document.getElementById('ram_used').textContent = 'Ошибка';
        document.getElementById('ssd_read').textContent = 'Ошибка';
        document.getElementById('ssd_write').textContent = 'Ошибка';
    }
}

setInterval(updateInfo, 1000);
updateInfo();
