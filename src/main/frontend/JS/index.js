let max = 100

// Function to handle slider changes
function change(current) {
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
    if (val || val === 0) { // Check for both 0 and undefined
        elm.value = val;
    }
    elm.setAttribute('value', elm.value);
}

// Add event listener to the specific sliders
const riverSlider = document.getElementById('riverSlider');
const artipSlider = document.getElementById('artipSlider');
const sugolSlider = document.getElementById('sugolSlider');
const EHAMSlider = document.getElementById('EHAMSlider');

const sliders = [riverSlider, artipSlider, sugolSlider, EHAMSlider];

sliders.forEach(function (slider) {
    slider.addEventListener('input', function () {
        change(this);
    }, false);
});

// Function to send command
function downloadScene() {
    let sliderval = [
        riverSlider.value.toString(),
        artipSlider.value.toString(),
        sugolSlider.value.toString(),
        EHAMSlider.value.toString()
    ];
    console.log(sliderval)
    fetch(`http://127.0.0.1:5000/scene/scene?sortamount=${document.getElementById("sortamount").value}&slidervalue=${sliderval}&scenetime=${document.getElementById("scenetime").value}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json' // Add this line
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            // Assuming the response is a file, trigger the download
            return response.blob();
        })
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'scenefile.scn';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        })
        .catch(error => {
            console.error('Error downloading scene file:', error.message);
        });
}