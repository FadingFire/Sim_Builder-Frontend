let max = 100;

// Function to handle slider changes
function change(current, sliders, max) {
    set(current);
    const input = +current.value;
    const delta = max - input;
    let sum = 0;
    const siblings = [];

    // Sum of all siblings
    sliders.forEach(function (slider) {
        if (current !== slider) {
            siblings.push(slider); // Register as sibling
            sum += +slider.value;
        }
    });

    // Update all the siblings
    let partial = 0;
    siblings.forEach(function (slider, i) {
        let val = +slider.value;
        const fraction = sum > 0 ? val / sum : 1 / (sliders.length - 1);
        if (i >= sliders.length - 1) {
            val = max - partial;
        } else {
            val = Math.round(delta * fraction); // Round the value
            partial += val;
        }
        set(slider, val);
    });
}

// Set value on a slider
function set(elm, val) {
    if (val || val === 0) {
        elm.value = val;
    }
    elm.setAttribute('value', elm.value);
}

// Function to initialize sliders for a given group
function initializeSliders(groupId, sliderIds) {
    const sliders = [];

    sliderIds.forEach(sliderId => {
        const slider = document.createElement("input");
        slider.type = "range";
        slider.id = sliderId;
        slider.min = "0";
        slider.max = "100";
        slider.step = "1";
        slider.value = (100 / sliderIds.length).toString();

        const label = document.createElement("label");
        label.textContent = `${sliderId}: `;

        const groupElement = document.getElementById(groupId);
        groupElement.appendChild(label);
        groupElement.appendChild(slider);

        sliders.push(slider);
    });

    return sliders;
}

// Initialize sliders for the direction and WTC groups
const directionSliders = initializeSliders("directionSliders", ["river", "artip", "sugol"]);
const WTCsliders = initializeSliders("WTCsliders", ["L", "M", "H", "J"]);
const APPsliders = initializeSliders("appsliders", ["INBOUND", "OUTBOUND"]);

// Add event listeners to the initialized sliders
directionSliders.forEach(function (slider) {
    slider.addEventListener('input', function () {
        change(this, directionSliders, max);
    }, false);
});

WTCsliders.forEach(function (slider) {
    slider.addEventListener('input', function () {
        change(this, WTCsliders, max);
    }, false);
});

APPsliders.forEach(function (slider) {
    slider.addEventListener('input', function () {
        change(this, APPsliders, max);
    }, false);
});

// Set predefined values for sliders based on difficulty level
function setDifficulty(difficulty) {
    switch (difficulty) {
        case 'easy':
            document.getElementById('sortamount').value = 10;
            document.getElementById('scenetime').value = 30;
            document.getElementById('filename').value = 'easy_scenario';
            set(APPsliders[0], 30)
            set(APPsliders[1], 70)
            set(directionSliders[0], 33);
            set(directionSliders[1], 33);
            set(directionSliders[2], 33);
            set(WTCsliders[0], 20)
            set(WTCsliders[1], 60)
            set(WTCsliders[2], 15)
            set(WTCsliders[3], 5)
            break;
        case 'medium':
            document.getElementById('sortamount').value = 20;
            document.getElementById('scenetime').value = 40;
            document.getElementById('filename').value = 'Medium_scenario';
            set(APPsliders[0], 50)
            set(APPsliders[1], 50)
            set(directionSliders[0], 33);
            set(directionSliders[1], 33);
            set(directionSliders[2], 33);
            set(WTCsliders[0], 15)
            set(WTCsliders[1], 45)
            set(WTCsliders[2], 35)
            set(WTCsliders[3], 5)
            break;
        case 'hard':
            document.getElementById('sortamount').value = 30;
            document.getElementById('scenetime').value = 50;
            document.getElementById('filename').value = 'Hard_scenario';
            set(APPsliders[0], 60)
            set(APPsliders[1], 40)
            set(directionSliders[0], 33);
            set(directionSliders[1], 33);
            set(directionSliders[2], 33);
            set(WTCsliders[0], 10)
            set(WTCsliders[1], 35)
            set(WTCsliders[2], 45)
            set(WTCsliders[3], 10)
            break;
        case 'extra-hard':
            document.getElementById('sortamount').value = 100;
            document.getElementById('scenetime').value = 60;
            document.getElementById('filename').value = 'Extra_Hard_scenario';
            set(APPsliders[0], 70)
            set(APPsliders[1], 30)
            set(directionSliders[0], 33);
            set(directionSliders[1], 33);
            set(directionSliders[2], 33);
            set(WTCsliders[0], 5)
            set(WTCsliders[1], 15)
            set(WTCsliders[2], 70)
            set(WTCsliders[3], 10)
            break;
    }
}

function downloadScene() {
    const slidervalDirection = directionSliders.map(slider => slider.value.toString());
    const slidervalWTC = WTCsliders.map(slider => slider.value.toString());
    const slidervalAPP = APPsliders.map(slider => slider.value.toString());

    const sortamount = document.getElementById("sortamount").value;
    const scenetime = document.getElementById("scenetime").value;

    fetch(`http://127.0.0.1:5000/scene/scene?sortamount=${sortamount}&slidervalue=${slidervalDirection}&slidervalueWTC=${slidervalWTC}&scenetime=${scenetime}&APPvalue=${slidervalAPP}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.blob();
        })
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = document.getElementById("filename").value + ".scn";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        })
        .catch(error => {
            console.error('Error downloading scene file:', error.message);
        });
}

document.getElementById('easyButton').addEventListener('click', function () {
    setDifficulty('easy');
});

document.getElementById('mediumButton').addEventListener('click', function () {
    setDifficulty('medium');
});

document.getElementById('hardButton').addEventListener('click', function () {
    setDifficulty('hard');
});

document.getElementById('extraHardButton').addEventListener('click', function () {
    setDifficulty('extra-hard');
});
