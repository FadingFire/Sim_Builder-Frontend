let pagenumber = 1;
let pagesize = 10;
let page = document.getElementById("page");
let deleterow = ["", ''];
let sortOrder = 'asc'; // Default sorting order
let rowcount
let selfmade = true


async function changepage() {
    let url = `http://127.0.0.1:5000/scene/change_outputfile?selfmade=${selfmade}`;
    await fetch(url, { method: 'OPTIONS' }).then(() => {
      fetchData(pagenumber, pagesize, sortOrder);
    });
    selfmade = !selfmade;
}


function downloadScene() {
    let sortamount = document.getElementById("sortamount").value;
    fetch(`http://127.0.0.1:5000/scene/scene?sortamount=${sortamount}`, {
        method: 'GET'
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


function uploadFile() {
    const formData = new FormData(document.getElementById('uploadForm'));
    const url = 'http://127.0.0.1:5000/scene/upload'
    fetch(url,
    {
            method: 'POST',
            body: formData
        }).then((value) => {
            fetchData(pagenumber, pagesize, sortOrder)
        }
    );
// Clear file input fields after upload
    document.getElementById("Flights").value = ''
    document.getElementById("Landings").value = ''
}


function pageup() {
    if (pagenumber < rowcount) {
        pagenumber = pagenumber + 1;
        fetchData(pagenumber, pagesize, sortOrder);
    }
}

function pagemax() {
    pagenumber = rowcount;
    fetchData(pagenumber, pagesize, sortOrder);
    document.getElementById("pagemax").disabled = true
}

function pagemin() {
    pagenumber = 1;
    fetchData(pagenumber, pagesize, sortOrder);
    document.getElementById("pagemin").disabled = true
}

function pagedown() {
    if (pagenumber > 1) {
        pagenumber = pagenumber - 1;
        fetchData(pagenumber, pagesize, sortOrder);
    }
}


async function fetchData(pageNumber, pageSize, order) {
    try {
        const searchValue = document.getElementById("search").value;
        let url = `http://127.0.0.1:5000/scene/complete/table?` +
            `pageNumber=${pageNumber}&` +
            `pageSize=${pageSize}&` +
            `sortBy=${cellContent}&` +
            `order=${order}&` +
            `searchfilter=${searchValue}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const responseData = await response.json();

        // Call your function to update the table with the response data
        processData(responseData.data);
        rowcount = responseData.pagenumber + 1; // Update totalPages variable
        document.getElementById("pagemax").disabled = pagenumber >= rowcount;
        document.getElementById("pagemin").disabled = pagenumber <= 1;
        if (rowcount < 1) {
            rowcount = 1;
        }
        page.innerText = "Page: " + pagenumber + " of " + rowcount;
    } catch (error) {
        console.error('Error fetching paginated data:', error.message);
    }
}

let cellContent
if (!cellContent) {
    cellContent = "FLIGHT_ID";
}

function processData(csv) {
    const allTextLines = csv.split(/\r\n|\n/);
    let lines = [];
    while (allTextLines.length) {
        let line = allTextLines.shift().split(',');
        lines.push(line);
    }

    drawOutput(lines);
}

function drawOutput(lines) {
    // Clear previous data
    document.getElementById("output").innerHTML = "";

    const table = document.createElement("table");
    table.className = "FullTable";

    for (let i = 0; i < lines.length - 1; i++) {
        const row = table.insertRow(-1);
        row.id = i.toString();
        row.className = "fullcsv";

        if (i === 0) {
            // Handling click for the header row
            row.insertCell(-1).innerHTML = '<button onclick="addData()">+</button>';
            row.firstChild.id = "buttons";
            for (let j = 0; j < lines[i].length; j++) {
                // Add arrow indicators for sorting order next to each header cell
                const headerCell = row.insertCell(-1);
                headerCell.innerHTML = lines[i][j];
                if (lines[i][j] === cellContent) {
                    headerCell.innerHTML += sortOrder === 'asc' ? '▼' : '▲';
                }

                headerCell.onclick = function () {
                    if (cellContent === lines[i][j]) {
                        sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
                    } else {
                        cellContent = lines[i][j];
                        sortOrder = 'asc';
                    }
                    fetchData(pagenumber, pagesize, sortOrder);
                };
            }
        } else if (i <= pagesize) {
            // Buttons for non-header rows
            row.insertCell(-1).innerHTML =
                '<button onclick="editData(this)">Edit</button>' +
                '<button onclick="deleteData(this)">Delete</button>';
            for (let j = 0; j < lines[i].length; j++) {
                const cell = row.insertCell(-1);
                cell.appendChild(document.createTextNode(lines[i][j]));
            }
        }
    }
    document.getElementById("output").appendChild(table);
}

async function deleteData(button) {
    // Get the parent row of the clicked button
    let row = button.parentNode.parentNode;
    deleterow = row.children;
    // Remove the row from the table
    row.parentNode.removeChild(row);
    let url = `http://127.0.0.1:5000/scene/delete?Deleterow=${deleterow[1].innerHTML}`;
    await fetch(url);
    await fetchData(pagenumber, pagesize, sortOrder)
}


function addData(){
    // Create a form element
    let form = document.createElement("form");
    form.className = "editform"
    let exitButton = document.createElement("button");
    exitButton.textContent = "X";
    exitButton.className = "exitbutton"

    exitButton.onclick=function() {
        document.body.removeChild(modalOverlay);
    };
    let fields
    // Define the fields you want to edit
    fields = ["Callsign", "Operator", "ICAOType", "ADEP", "DEST", "FLIGHT_RULES", "TAS", "RFL", "WeightClass", "RunWay", "GATE", "STACK"];
    // Iterate over the fields and create textboxes for each
    fields.forEach(field => {
        let label = document.createElement("label");
        label.textContent = `Enter the new ${field}: `;
        let input = document.createElement("input");

        if (field === "Operator"){ input.maxLength = 3 }
        if ((field === "ADEP") || (field === "DEST")){ input.maxLength = 4 }
        if ((field === "FLIGHT_RULES") || (field === "WTC")){ input.maxLength = 1 }
        if ((field === "RFL") || (field === "TAS")){
            input.onkeydown = function(event) {
                if(isNaN(event.key) && event.key !== 'Backspace') { event.preventDefault(); }
            };
        }

        input.type = "text";
        input.name = field;
        form.appendChild(label);
        form.appendChild(input);
        form.appendChild(document.createElement("br"));
    });

    // Add a submit button to the form
    let submitButton = document.createElement("button");
    submitButton.textContent = "Submit";
    form.appendChild(submitButton);

    // Create a modal overlay
    let modalOverlay = document.createElement("div");
    modalOverlay.classList.add("modal-overlay");
    modalOverlay.appendChild(exitButton);

    // Display the form in the modal overlay
    modalOverlay.appendChild(form);
    document.body.appendChild(modalOverlay);

    // Handle the form submission
    form.addEventListener("submit", function (event) {
        event.preventDefault();

        // Extract values from the form
        let newData = {};
        fields.forEach(field => {
            newData[field] = form.elements[field].value;
        });
        // Perform the fetch request
        const url ='http://127.0.0.1:5000/scene/add'
        fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newData),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log(data.message);
                fetchData(pagenumber, pagesize, sortOrder)
                // Optionally update your UI based on the response
            })
            .catch(error => {
                console.error('Error updating data:', error.message);
            });

        // Remove the modal overlay after submission
        document.body.removeChild(modalOverlay);
    });
}


function editData(button) {
    let row = button.parentNode.parentNode;

    // Create a form element
    let form = document.createElement("form");
    form.className = "editform"
    let fields
    let exitButton = document.createElement("button");
    exitButton.textContent = "X";
    exitButton.className = "exitbutton"

    exitButton.onclick=function() {
        document.body.removeChild(modalOverlay);
    };

    // Define the fields you want to edit
    if (row.cells[6].innerHTML === "EHAM")
        fields = ["Callsign", "Operator", "ICAOType", "ADEP", "DEST", "FLIGHT_RULES", "TAS", "RFL", "WeightClass", "RunWay", "GATE", "STACK"];
    else
        fields = ["Callsign", "Operator", "ICAOType", "ADEP", "DEST", "FLIGHT_RULES", "TAS", "RFL", "WeightClass"];

    // Iterate over the fields and create textboxes for each
    fields.forEach(field => {
        let label = document.createElement("label");
        label.textContent = `Enter the new ${field}: `;
        let input = document.createElement("input");

        // Adjust the cell index for RunWay and GATE
        let cellIndex;
        if (field === "RunWay") {
            cellIndex = 13;
        } else if (field === "GATE") {
            cellIndex = 14;
        } else if (field === "STACK") {
            cellIndex = 15;
        } else {
            cellIndex = fields.indexOf(field) + 2;
        }

        input.value = row.cells[cellIndex].innerHTML;
        input.type = "text";
        input.name = field;
        form.appendChild(label);
        form.appendChild(input);
        form.appendChild(document.createElement("br"));
    });

    // Add a submit button to the form
    let submitButton = document.createElement("button");
    submitButton.textContent = "Submit";
    form.appendChild(submitButton);

    // Create a modal overlay
    let modalOverlay = document.createElement("div");
    modalOverlay.classList.add("modal-overlay");

    // Display the form in the modal overlay
    modalOverlay.appendChild(exitButton);
    modalOverlay.appendChild(form);
    document.body.appendChild(modalOverlay);


    // Handle the form submission
    form.addEventListener("submit", function (event) {
        event.preventDefault();

        // Extract values from the form
        let updatedData = {FLIGHT_ID: row.cells[1].innerHTML};
        fields.forEach(field => {
            updatedData[field] = form.elements[field].value;
        });
        console.log(JSON.stringify(updatedData))
        // Perform the fetch request
        const url ='http://127.0.0.1:5000/scene/update'
        fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedData),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log(data.message);
                fetchData(pagenumber, pagesize, sortOrder)
                // Optionally update your UI based on the response
            })
            .catch(error => {
                console.error('Error updating data:', error.message);
            });

        // Remove the modal overlay after submission
        document.body.removeChild(modalOverlay);
    });
}


function confirmDelete() {
    const deleteDate = document.getElementById("DateOlder").value;
    const confirmation = window.confirm(`Are you sure you want to delete all data older than ${deleteDate}?`);

    if (confirmation) {
        // User confirmed, proceed with deletion
        let url = `http://127.0.0.1:5000/scene/delete?DeleteOlder=${document.getElementById("DateOlder").value}`;
        fetch(url).then((value) => {
                fetchData(pagenumber, pagesize, sortOrder)
            }
        );
    }
    // If not confirmed, do nothing
}

// Fetch paginated data when the page loads
fetchData(1, 10, sortOrder);

