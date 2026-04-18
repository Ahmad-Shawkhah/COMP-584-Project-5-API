// We grab all the elements we need from the DOM
const vinInput = document.getElementById("vin-input");
const searchBtn = document.getElementById("search-btn");
const carCard = document.getElementById("car-card");
const carTitle = document.getElementById("car-title");
const detailsContainer = document.getElementById("details-container");

// Animate search input and button on page load using Popmotion timeline
const { tween, timeline, styler } = popmotion;

const inputStyler = styler(vinInput);
const btnStyler = styler(searchBtn);

vinInput.style.opacity = 0;
searchBtn.style.opacity = 0;

timeline([
  //input slides in from the left
  {
    track: "input",
    from: { opacity: 0, translateX: -30 },
    to: { opacity: 1, translateX: 0 },
    duration: 600
  },
  // button slides in from the right
  {
    track: "btn",
    from: { opacity: 0, translateX: 30 },
    to: { opacity: 1, translateX: 0 },
    duration: 600,
    offset: 400
  }
]).start(function(values) {
  inputStyler.set(values.input);
  btnStyler.set(values.btn);
});

// Listen for the search button click
searchBtn.onclick = function () {

  // Get the VIN value from the input and clean it up
  const vin = vinInput.value.trim();

  // If the input is empty, do nothing
  if (vin === "") return;

  // Fetch vehicle data from the NHTSA government API using the VIN
  fetch("https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/" + vin + "?format=json")
    .then(function (response) {
      // Convert the raw response into a JavaScript object
      return response.json();
    })

    .then(function (data) {
      // then pass the results array to our display function
      displayCar(data.Results);
    });
};

function displayCar(results) {

  // Helper function to find a specific value from the results array by label name
  const getValue = function (label) {
    const found = results.find(function (item) {
      return item.Variable === label;
    });
    // Return the value if it exists, or "N/A if nothing"
    return found && found.Value ? found.Value : "N/A";
  };

  // extract year, make, and model to build the card title
  const year = getValue("Model Year");
  const make = getValue("Make");
  const model = getValue("Model");

  carTitle.textContent = year + " " + make + " " + model;

  // Clear any previous search results
  detailsContainer.innerHTML = "";

  // Define the details we want to display on the card
  const details = [
    { label: "Body Style", value: getValue("Body Class") },
    { label: "Drive Type", value: getValue("Drive Type") },
    { label: "Engine", value: getValue("Displacement (L)") + "L" },
    { label: "Cylinders", value: getValue("Engine Number of Cylinders") },
    { label: "Fuel Type", value: getValue("Fuel Type - Primary") },
    { label: "Transmission", value: getValue("Transmission Style") },
    { label: "Plant Country", value: getValue("Plant Country") },
    { label: "Manufacturer", value: getValue("Manufacturer Name") }
  ];

  // Loop through each detail and create HTML elements dynamically
  details.forEach(function (item) {

    // Create the row container
    const row = document.createElement("div");
    row.classList.add("detail-row");

    // Create the label element (left side)
    const label = document.createElement("span");
    label.classList.add("detail-label");
    label.textContent = item.label;

    // Create the value element (right side)
    const value = document.createElement("span");
    value.classList.add("detail-value");
    value.textContent = item.value;

    // Append label and value into the row, then row into the card
    row.appendChild(label);
    row.appendChild(value);
    detailsContainer.appendChild(row);
  });

  // Make the card visible
  carCard.style.display = "block";

  // Set starting position for animation
  carCard.style.opacity = 0;
  carCard.style.transform = "translateY(40px)";

  // Animate the card sliding up and fading in using Popmotion tween
  const cardStyler = styler(carCard);

  tween({
    from: { opacity: 0, translateY: 40 },
    to: { opacity: 1, translateY: 0 },
    duration: 1500
  }).start(cardStyler.set);
}