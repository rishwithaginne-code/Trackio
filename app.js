document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const fileInput = document.getElementById('image-upload');
    const fileNameDisplay = document.getElementById('file-name');
    const navigateBtn = document.getElementById('navigate-btn');
    const startInput = document.getElementById('start-location');
    const destInput = document.getElementById('destination');
    
    const emptyState = document.getElementById('empty-state');
    const routeDetails = document.getElementById('route-details');
    const routePathText = document.getElementById('route-path-text');
    const routeSteps = document.getElementById('route-steps');
    const facilitiesList = document.getElementById('facilities-list');

    // Initialize Leaflet Map
    // Coordinates for a dummy station (Hyderabad Deccan Station area)
    const stationCoords = [17.4399, 78.4983];
    const map = L.map('map').setView(stationCoords, 18);

    // Use a clean dark-themed tile layer (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors © CARTO'
    }).addTo(map);

    let markers = [];
    let routeLine = null;
    let sourceMarker = null;
    let facilityData = [];

    // Fetch Facilities from Backend
    async function fetchFacilities() {
        try {
            const response = await fetch('http://localhost:3000/api/facilities');
            facilityData = await response.json();
            displayFacilities(facilityData);
            addFacilityMarkers(facilityData);
        } catch (error) {
            console.error("Error fetching facilities:", error);
            // Fallback to dummy data if server is not running
            facilityData = [
                { id: 1, name: "Coffee Shop", category: "cafe", lat: 17.4399, lng: 78.4983, image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=300&q=80", description: "Level 1, Near Entrance" },
                { id: 2, name: "Restrooms", category: "restroom", lat: 17.4402, lng: 78.4985, image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=300&q=80", description: "All Platforms" },
                { id: 3, name: "Ticket Counter", category: "ticket", lat: 17.4395, lng: 78.4980, image: "https://images.unsplash.com/photo-1563853110287-25e1cc454bf5?auto=format&fit=crop&w=300&q=80", description: "Main Hall" },
                { id: 4, name: "Waiting Area", category: "waiting", lat: 17.4405, lng: 78.4988, image: "https://images.unsplash.com/photo-1510255470535-6ad6293427be?auto=format&fit=crop&w=300&q=80", description: "Near Platform 3" }
            ];
            displayFacilities(facilityData);
            addFacilityMarkers(facilityData);
        }
    }

    function displayFacilities(data) {
        facilitiesList.innerHTML = '';
        data.slice(0, 4).forEach(fac => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${getCategoryIcon(fac.category)} ${fac.name}</span>`;
            li.style.cursor = 'pointer';
            li.onclick = () => {
                const marker = markers.find(m => m.options.id === fac.id);
                if (marker) {
                    map.setView(marker.getLatLng(), 19);
                    marker.openPopup();
                }
            };
            facilitiesList.appendChild(li);
        });
    }

    function addFacilityMarkers(data) {
        markers.forEach(m => map.removeLayer(m));
        markers = [];

        data.forEach(fac => {
            const icon = L.divIcon({
                className: 'custom-div-icon',
                html: `<div>${getCategoryIcon(fac.category)}</div>`,
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            });

            const marker = L.marker([fac.lat, fac.lng], { icon: icon, id: fac.id })
                .addTo(map)
                .bindPopup(`
                    <div class="facility-popup">
                        <img src="${fac.image}" onerror="this.src='https://via.placeholder.com/300x150?text=No+Image+Available'">
                        <h4>${fac.name}</h4>
                        <p>${fac.description}</p>
                    </div>
                `);
            markers.push(marker);
        });
    }

    function getCategoryIcon(cat) {
        const icons = {
            cafe: '☕',
            restroom: '🚻',
            ticket: '🎫',
            waiting: '🪑',
            elevator: '🛗',
            escalator: '🪜',
            security: '👮',
            water: '🚰',
            exit: '🚪'
        };
        return icons[cat] || '📍';
    }

    // Handle File Upload
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            fileNameDisplay.textContent = `Image: ${e.target.files[0].name}`;
            startInput.value = 'My Current Location';
        }
    });

    // Navigation Logic
    navigateBtn.addEventListener('click', () => {
        const start = startInput.value.trim();
        const dest = destInput.value.trim().toLowerCase();

        if (!start || !dest) {
            alert("Please enter source and destination");
            return;
        }

        const targetFacility = facilityData.find(f => 
            f.name.toLowerCase().includes(dest) || f.category.includes(dest)
        );

        if (!targetFacility) {
            alert("Facility not found in station database.");
            return;
        }

        proceedWithNavigation(start, targetFacility);
    });

    function proceedWithNavigation(startName, target) {
        navigateBtn.textContent = 'Mapping Route...';
        navigateBtn.disabled = true;

        setTimeout(() => {
            navigateBtn.textContent = 'Start Navigation';
            navigateBtn.disabled = false;

            routeDetails.style.display = 'block';
            routePathText.innerHTML = `Route to <strong>${target.name}</strong>`;

            // Setup Start and End points
            const startPos = [stationCoords[0] - 0.001, stationCoords[1] - 0.001]; // Dummy starting point
            const endPos = [target.lat, target.lng];

            // Add/Update Source Marker
            if (sourceMarker) map.removeLayer(sourceMarker);
            const sourceIcon = L.divIcon({
                className: 'custom-div-icon source-icon',
                html: `<div>A</div>`,
                iconSize: [35, 35],
                iconAnchor: [17, 17]
            });
            sourceMarker = L.marker(startPos, { icon: sourceIcon })
                .addTo(map)
                .bindPopup("<b>Starting Point</b><br>" + startName)
                .openPopup();

            // Clear and redraw route line
            if (routeLine) map.removeLayer(routeLine);
            routeLine = L.polyline([startPos, endPos], {
                color: '#3b82f6',
                weight: 6,
                opacity: 0.9,
                dashArray: '10, 15',
                lineJoin: 'round'
            }).addTo(map);

            // Highlight Destination Marker
            const destMarker = markers.find(m => m.options.id === target.id);
            if (destMarker) {
                // Temporarily add a destination glow/class if possible
                setTimeout(() => destMarker.openPopup(), 1500);
            }

            // Fit map to show both markers
            map.fitBounds(L.latLngBounds([startPos, endPos]), { padding: [80, 80] });

            // Generate Steps
            routeSteps.innerHTML = `
                <div class="step-item"><div class="step-icon">1</div><span>Starting from ${startName}</span></div>
                <div class="step-item"><div class="step-icon">2</div><span>Walk 50m straight towards Platform Area</span></div>
                <div class="step-item"><div class="step-icon">3</div><span>Turn right at the information desk</span></div>
                <div class="step-item"><div class="step-icon">4</div><span>Arrived! ${target.name} is right in front of you.</span></div>
            `;
        }, 1200);
    }

    // Initialize
    fetchFacilities();
    setTimeout(() => map.invalidateSize(), 100);

    // Tab Logic
    document.querySelectorAll('.nav-link').forEach(link => {
        link.onclick = (e) => {
            e.preventDefault();
            const target = link.getAttribute('data-target');
            document.querySelectorAll('.page-view').forEach(v => v.classList.remove('active-view'));
            const targetEl = document.getElementById(target);
            if(targetEl) targetEl.classList.add('active-view');
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            if (target === 'view-navigate') setTimeout(() => map.invalidateSize(), 100);
        };
    });
});
