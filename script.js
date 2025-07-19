let map;
let markers = [];
let tempLatLng = null;

function initMap() {
  map = L.map("map").setView([20.5937, 78.9629], 5);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);

  map.on("click", onMapClick);

  map.locate({ setView: true, maxZoom: 15, watch: false, enableHighAccuracy: true });

  map.on("locationfound", function (e) {
    const radius = e.accuracy;
    L.marker(e.latlng).addTo(map)
      .bindPopup(`You are here within ${radius.toFixed(0)} meters.`).openPopup();
    L.circle(e.latlng, radius).addTo(map);
  });

  map.on("locationerror", function () {
    alert("Unable to access your location. Please allow location access in your browser.");
  });
}

function onMapClick(e) {
  tempLatLng = e.latlng;
  document.getElementById("friend-form").classList.remove("hidden");
  document.getElementById("friend-name").focus();
}

function addFriendMarker(data) {
  const { name, notes, usefulness, photoUrl, latlng } = data;

  const popupContent = `
    <div style="text-align:center; max-width: 200px;">
      <b style="font-size:16px;">${name}</b><br/>
      <i>Usefulness: ${usefulness}/5</i><br/>
      <p style="margin-top:8px; white-space: pre-wrap;">${notes || "(No notes)"}</p>
      ${photoUrl ? `<img src="${photoUrl}" alt="Friend photo" />` : ""}
    </div>
  `;

  const marker = L.marker(latlng, { data }).addTo(map);
  marker.bindPopup(popupContent);
  markers.push(marker);
  saveMarkersToStorage();
}

function saveMarkersToStorage() {
  const savedMarkers = markers.map(marker => marker.options.data);
  localStorage.setItem("dosthuluMarkers", JSON.stringify(savedMarkers));
}

function loadMarkersFromStorage() {
  const saved = localStorage.getItem("dosthuluMarkers");
  if (saved) {
    const savedMarkers = JSON.parse(saved);
    savedMarkers.forEach(data => addFriendMarker(data));
  }
}

document.getElementById("form").addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("friend-name").value.trim();
  const notes = document.getElementById("friend-notes").value.trim();
  const usefulness = document.getElementById("friend-usefulness").value;
  const photoInput = document.getElementById("friend-photo");

  if (!tempLatLng) {
    alert("Please click on the map to select a location.");
    return;
  }

  if (!name) {
    alert("Please enter a friend's name.");
    return;
  }

  if (photoInput.files && photoInput.files[0]) {
    const reader = new FileReader();
    reader.onload = function (event) {
      const photoUrl = event.target.result;
      addFriendMarker({
        name,
        notes,
        usefulness,
        photoUrl,
        latlng: tempLatLng,
      });
      resetForm();
    };
    reader.readAsDataURL(photoInput.files[0]);
  } else {
    addFriendMarker({
      name,
      notes,
      usefulness,
      photoUrl: null,
      latlng: tempLatLng,
    });
    resetForm();
  }
});

function resetForm() {
  document.getElementById("form").reset();
  document.getElementById("friend-form").classList.add("hidden");
  tempLatLng = null;
}

document.getElementById("cancel-btn").addEventListener("click", function () {
  resetForm();
});

window.onload = function () {
  initMap();
  loadMarkersFromStorage();
};
