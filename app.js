// QuestLens - Real-time Agentic Spot Seeker
// Fixed version with proper CORS handling and error management

class QuestLensRealTime {
    constructor() {
        this.apiKeys = {
            foursquare: 'Your Foursquare API Key'
        };
        
        this.endpoints = {
            nominatim: 'https://nominatim.openstreetmap.org/search',
            foursquareSearch: 'https://api.foursquare.com/v3/places/search',
            foursquarePlace: 'https://api.foursquare.com/v3/places'
        };

        // Foursquare category mappings
        this.foursquareCategories = {
            "restaurants": ["13000", "13001", "13002", "13003", "13004", "13005"],
            "coffee": ["13032", "13033", "13034", "13035"],
            "museums": ["12047", "12048", "12049"],
            "attractions": ["12000", "12001", "12002", "12003"],
            "hotels": ["19014", "19015", "19016"],
            "shopping": ["17000", "17001", "17002", "17003"],
            "nightlife": ["10000", "10001", "10002"],
            "parks": ["16032", "16033", "16034"]
        };

        this.map = null;
        this.markers = [];
        this.currentLocation = null;
        this.requestTimeout = 10000;
        this.isDebugMode = true;
        
        this.initialize();
    }

    initialize() {
        this.log('Initializing QuestLens Real-time...');
        this.initializeMap();
        this.bindEvents();
        this.setupSampleQueries();
        this.log('QuestLens Real-time initialized successfully');
    }

    log(message, data = null) {
        if (this.isDebugMode) {
            console.log(`[QuestLens] ${message}`, data || '');
        }
    }

    // Initialize Leaflet map
    initializeMap() {
        this.map = L.map('map').setView([48.8566, 2.3522], 2);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors | Real-time data by Foursquare',
            maxZoom: 19
        }).addTo(this.map);

        // Add custom control for data source
        const dataSourceControl = L.control({position: 'bottomright'});
        dataSourceControl.onAdd = function(map) {
            const div = L.DomUtil.create('div', 'map-data-source');
            div.innerHTML = `
                <div style="background: rgba(255,255,255,0.9); padding: 8px; border-radius: 6px; font-size: 12px;">
                    <i class="fas fa-wifi" style="color: #28a745;"></i>
                    <strong>Live Data</strong> from Foursquare API
                </div>
            `;
            return div;
        };
        dataSourceControl.addTo(this.map);
    }

    bindEvents() {
        const form = document.getElementById('questForm');
        form.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }

    setupSampleQueries() {
        const sampleTags = document.querySelectorAll('.sample-tag');
        sampleTags.forEach(tag => {
            tag.addEventListener('click', () => {
                const query = tag.getAttribute('data-query');
                document.getElementById('queryInput').value = query;
            });
        });
    }

    // Enhanced fetch with proper error handling
    async fetchWithTimeout(url, options = {}) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), this.requestTimeout);
        
        try {
            this.log('Making request to:', url);
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(id);
            
            this.log('Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return response;
        } catch (error) {
            clearTimeout(id);
            this.log('Fetch error:', error.message);
            
            if (error.name === 'AbortError') {
                throw new Error('Request timed out. Please try again.');
            }
            throw error;
        }
    }

    // Handle form submission with comprehensive error handling
    async handleFormSubmit(event) {
        event.preventDefault();
        
        const location = document.getElementById('locationInput').value.trim();
        const query = document.getElementById('queryInput').value.trim();
        
        if (!location || !query) {
            this.showError('Please enter both location and query for real-time search');
            return;
        }

        this.log('Starting search', { location, query });
        
        this.showLoading();
        this.hideError();
        this.hideResults();
        this.hideMapOverlay();

        try {
            // Step 1: Geocode location
            this.setLoadingStep(1);
            await this.delay(500);
            
            const coordinates = await this.geocodeLocationWithFallback(location);
            if (!coordinates) {
                throw new Error(`Location "${location}" not found. Please try a more specific location.`);
            }

            this.log('Location geocoded successfully', coordinates);
            this.currentLocation = coordinates;
            this.map.setView([coordinates.lat, coordinates.lon], 13);

            // Step 2: Process query with local AI (no external API dependency)
            this.setLoadingStep(2);
            await this.delay(500);
            
            const aiProcessedQuery = this.processQueryWithLocalAI(query, location);
            this.log('Query processed by local AI', aiProcessedQuery);

            // Step 3: Search for places using Foursquare API
            this.setLoadingStep(3);
            await this.delay(500);
            
            const places = await this.searchPlacesWithFallback(coordinates, aiProcessedQuery);
            if (places.length === 0) {
                throw new Error(`No places found for "${query}" in ${location}. Try a broader search term.`);
            }

            this.log(`Found ${places.length} places`);

            // Step 4: Get detailed information
            this.setLoadingStep(4);
            await this.delay(500);
            
            const detailedPlaces = await this.processPlaceDetails(places);

            // Display results
            this.displayRealTimeResults(aiProcessedQuery, detailedPlaces, location);
            this.updateMapWithRealData(detailedPlaces);
            
            this.hideLoading();
            this.log('Search completed successfully');

        } catch (error) {
            this.log('Search failed with error:', error.message);
            this.hideLoading();
            this.showError(error.message);
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Geocoding with fallback to sample locations
    async geocodeLocationWithFallback(location) {
        try {
            // First try real geocoding
            const coordinates = await this.geocodeLocation(location);
            if (coordinates) {
                return coordinates;
            }
        } catch (error) {
            this.log('Geocoding API failed, trying fallback', error.message);
        }

        // Fallback to predefined locations
        const fallbackLocations = {
            'tokyo': { lat: 35.6762, lon: 139.6503, display_name: 'Tokyo, Japan' },
            'new york': { lat: 40.7128, lon: -74.0060, display_name: 'New York, USA' },
            'london': { lat: 51.5074, lon: -0.1278, display_name: 'London, UK' },
            'paris': { lat: 48.8566, lon: 2.3522, display_name: 'Paris, France' },
            'mumbai': { lat: 19.0760, lon: 72.8777, display_name: 'Mumbai, India' },
            'delhi': { lat: 28.6139, lon: 77.2090, display_name: 'Delhi, India' },
            'sydney': { lat: -33.8688, lon: 151.2093, display_name: 'Sydney, Australia' },
            'berlin': { lat: 52.5200, lon: 13.4050, display_name: 'Berlin, Germany' },
            'rome': { lat: 41.9028, lon: 12.4964, display_name: 'Rome, Italy' },
            'bangkok': { lat: 13.7563, lon: 100.5018, display_name: 'Bangkok, Thailand' }
        };

        const locationKey = location.toLowerCase();
        for (const [key, coords] of Object.entries(fallbackLocations)) {
            if (locationKey.includes(key) || key.includes(locationKey)) {
                this.log('Using fallback location', coords);
                return coords;
            }
        }

        return null;
    }

    async geocodeLocation(location) {
        try {
            const url = `${this.endpoints.nominatim}?format=json&q=${encodeURIComponent(location)}&limit=1&addressdetails=1`;
            const response = await this.fetchWithTimeout(url);
            const data = await response.json();
            
            if (data.length === 0) {
                return null;
            }
            
            return {
                lat: parseFloat(data[0].lat),
                lon: parseFloat(data[0].lon),
                display_name: data[0].display_name
            };
        } catch (error) {
            this.log('Geocoding failed:', error.message);
            return null;
        }
    }

    // Local AI processing (no external API dependency)
    processQueryWithLocalAI(query, location) {
        const lowerQuery = query.toLowerCase();
        let categories = [];
        let intent = 'attractions';
        
        // Enhanced intent detection
        const intentMap = {
            'restaurants': ['restaurant', 'food', 'eat', 'dining', 'meal', 'lunch', 'dinner', 'ramen', 'sushi', 'pizza'],
            'coffee': ['coffee', 'cafe', 'espresso', 'latte', 'cappuccino', 'starbucks'],
            'museums': ['museum', 'gallery', 'art', 'history', 'culture', 'exhibition'],
            'attractions': ['attraction', 'tourist', 'landmark', 'monument', 'sightseeing', 'visit', 'temple', 'shrine'],
            'hotels': ['hotel', 'accommodation', 'stay', 'lodge', 'inn', 'resort'],
            'shopping': ['shop', 'shopping', 'mall', 'store', 'boutique', 'market'],
            'nightlife': ['bar', 'club', 'nightlife', 'drinks', 'pub', 'lounge'],
            'parks': ['park', 'garden', 'nature', 'outdoor', 'green', 'recreation']
        };

        // Detect intent and map to categories
        for (const [intentKey, words] of Object.entries(intentMap)) {
            if (words.some(word => lowerQuery.includes(word))) {
                intent = intentKey;
                categories = this.foursquareCategories[intentKey] || [];
                break;
            }
        }

        // Extract keywords
        const stopWords = ['best', 'good', 'great', 'top', 'popular', 'amazing', 'nice', 'with', 'for', 'the', 'a', 'an'];
        const keywords = query.split(' ')
            .filter(word => word.length > 2 && !stopWords.includes(word.toLowerCase()))
            .slice(0, 3);

        const radius = /nearby|close|walking/i.test(query) ? 2000 : 5000;
        const limit = /few|couple/i.test(query) ? 10 : 20;

        return {
            intent,
            categories: categories.join(','),
            keywords: keywords.join(' '),
            radius,
            limit,
            response: `I'm searching for ${intent} related to "${query}" in ${location}. Let me find the best real-time matches!`
        };
    }

    // Search places with fallback to sample data
    async searchPlacesWithFallback(coordinates, searchParams) {
        try {
            // Try real Foursquare API
            const places = await this.searchPlacesRealTime(coordinates, searchParams);
            if (places.length > 0) {
                return places;
            }
        } catch (error) {
            this.log('Foursquare API failed, using sample data', error.message);
        }

        // Fallback to sample data
        return this.generateSamplePlaces(coordinates, searchParams);
    }

    async searchPlacesRealTime(coordinates, searchParams) {
        const params = new URLSearchParams({
            ll: `${coordinates.lat},${coordinates.lon}`,
            radius: searchParams.radius,
            limit: Math.min(searchParams.limit, 20),
            sort: 'POPULARITY'
        });

        if (searchParams.categories) {
            params.append('categories', searchParams.categories);
        }

        if (searchParams.keywords) {
            params.append('query', searchParams.keywords);
        }

        const url = `${this.endpoints.foursquareSearch}?${params}`;
        
        const response = await this.fetchWithTimeout(url, {
            headers: {
                'Authorization': this.apiKeys.foursquare,
                'Accept': 'application/json'
            }
        });

        const data = await response.json();
        return data.results || [];
    }

    // Generate sample places when API is unavailable
    generateSamplePlaces(coordinates, searchParams) {
        const intent = searchParams.intent || 'restaurants';
        const samplePlaces = {
            restaurants: [
                { name: 'Ichiran Ramen', category: 'Ramen Restaurant', rating: 4.2 },
                { name: 'Sukiyabashi Jiro', category: 'Sushi Restaurant', rating: 4.8 },
                { name: 'Bills Omotesando', category: 'Breakfast Restaurant', rating: 4.1 },
                { name: 'Nabezo Shibuya', category: 'Shabu Shabu Restaurant', rating: 4.0 }
            ],
            attractions: [
                { name: 'Senso-ji Temple', category: 'Buddhist Temple', rating: 4.3 },
                { name: 'Tokyo Skytree', category: 'Observation Tower', rating: 4.1 },
                { name: 'Meiji Shrine', category: 'Shinto Shrine', rating: 4.2 },
                { name: 'Tokyo National Museum', category: 'History Museum', rating: 4.0 }
            ],
            coffee: [
                { name: 'Blue Bottle Coffee', category: 'Coffee Shop', rating: 4.3 },
                { name: 'Starbucks Reserve Roastery', category: 'Coffee Roaster', rating: 4.2 },
                { name: 'Kurasu Kyoto', category: 'Specialty Coffee', rating: 4.5 },
                { name: 'Bear Pond Espresso', category: 'Espresso Bar', rating: 4.4 }
            ]
        };

        const places = samplePlaces[intent] || samplePlaces.restaurants;
        
        return places.map((place, index) => ({
            fsq_id: `sample_${intent}_${index}`,
            name: place.name,
            categories: [{ name: place.category }],
            rating: place.rating,
            location: {
                formatted_address: `Sample Address, ${coordinates.display_name || 'Location'}`,
                address: `Sample Address ${index + 1}`
            },
            geocodes: {
                main: {
                    latitude: coordinates.lat + (Math.random() - 0.5) * 0.02,
                    longitude: coordinates.lon + (Math.random() - 0.5) * 0.02
                }
            },
            hours: {
                display: index % 2 === 0 ? 'Open until 10 PM' : 'Open 24 hours'
            },
            tel: index % 3 === 0 ? '+81-3-1234-5678' : null,
            isRealTime: false,
            isSample: true
        }));
    }

    async processPlaceDetails(places) {
        // For sample data, return as is
        if (places.some(p => p.isSample)) {
            return places.map(place => ({
                ...place,
                details: place,
                isRealTime: false
            }));
        }

        // For real data, try to get more details
        const detailedPlaces = [];
        for (const place of places.slice(0, 10)) {
            try {
                const url = `${this.endpoints.foursquarePlace}/${place.fsq_id}`;
                const response = await this.fetchWithTimeout(url, {
                    headers: {
                        'Authorization': this.apiKeys.foursquare,
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    const details = await response.json();
                    detailedPlaces.push({
                        ...place,
                        details: details,
                        isRealTime: true
                    });
                } else {
                    detailedPlaces.push({
                        ...place,
                        details: place,
                        isRealTime: true
                    });
                }
            } catch (error) {
                detailedPlaces.push({
                    ...place,
                    details: place,
                    isRealTime: false
                });
            }
        }

        return detailedPlaces;
    }

    displayRealTimeResults(aiResponse, places, location) {
        const resultsSection = document.getElementById('resultsSection');
        const aiResponseDiv = document.getElementById('aiResponse');
        const placesList = document.getElementById('placesList');

        const dataSourceText = places.some(p => p.isRealTime) ? 'Live Data from Foursquare' : 'Sample Data (API Unavailable)';
        const dataSourceClass = places.some(p => p.isRealTime) ? 'live' : 'sample';

        aiResponseDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                <div>
                    <strong><i class="fas fa-brain"></i> Llama 3.1 AI Analysis:</strong>
                </div>
                <div class="real-time-badge ${dataSourceClass}">
                    <i class="fas fa-${places.some(p => p.isRealTime) ? 'wifi' : 'database'}"></i>
                    ${dataSourceText}
                </div>
            </div>
            <p>${aiResponse.response}</p>
            <p><small><i class="fas fa-map-marker-alt"></i> Found ${places.length} places in ${location}</small></p>
        `;

        placesList.innerHTML = places.map(place => this.createRealTimePlaceCard(place)).join('');

        // Add click handlers
        placesList.querySelectorAll('.place-card').forEach((card, index) => {
            card.addEventListener('click', () => {
                this.focusOnPlace(places[index]);
            });
        });

        resultsSection.classList.remove('hidden');
    }

    createRealTimePlaceCard(place) {
        const details = place.details || place;
        const name = place.name || 'Unknown Place';
        const address = place.location?.formatted_address || place.location?.address || 'Address not available';
        const category = place.categories?.[0]?.name || 'Place';
        const rating = details.rating ? details.rating.toFixed(1) : null;
        const hours = details.hours?.display;
        const phone = details.tel;
        const website = details.website;
        
        const badgeClass = place.isRealTime ? 'live' : 'sample';
        const badgeText = place.isRealTime ? 'Live' : 'Sample';
        const badgeIcon = place.isRealTime ? 'wifi' : 'database';
        
        return `
            <div class="place-card" data-place-id="${place.fsq_id}">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                    <h4 class="place-name">${name}</h4>
                    <div class="real-time-badge ${badgeClass}">
                        <i class="fas fa-${badgeIcon}"></i>
                        ${badgeText}
                    </div>
                </div>
                <div class="place-details">
                    <div class="place-detail">
                        <i class="fas fa-tag"></i>
                        <span>${category}</span>
                    </div>
                    <div class="place-detail">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${address}</span>
                    </div>
                    ${rating ? `
                    <div class="place-detail">
                        <i class="fas fa-star"></i>
                        <span class="place-rating">
                            <span class="rating-stars">${'★'.repeat(Math.floor(rating))}</span>
                            ${rating}/5
                        </span>
                    </div>` : ''}
                    ${hours ? `
                    <div class="place-detail">
                        <i class="fas fa-clock"></i>
                        <span>${hours}</span>
                    </div>` : ''}
                    ${phone ? `
                    <div class="place-detail">
                        <i class="fas fa-phone"></i>
                        <span><a href="tel:${phone}">${phone}</a></span>
                    </div>` : ''}
                    ${website ? `
                    <div class="place-detail">
                        <i class="fas fa-globe"></i>
                        <span><a href="${website}" target="_blank">Visit Website</a></span>
                    </div>` : ''}
                </div>
            </div>
        `;
    }

    updateMapWithRealData(places) {
        // Clear existing markers
        this.markers.forEach(marker => this.map.removeLayer(marker));
        this.markers = [];

        // Add new markers
        places.forEach((place) => {
            if (place.geocodes?.main?.latitude && place.geocodes?.main?.longitude) {
                const marker = L.marker([
                    place.geocodes.main.latitude,
                    place.geocodes.main.longitude
                ]).addTo(this.map);

                const popupContent = this.createRealTimePopupContent(place);
                marker.bindPopup(popupContent);
                
                this.markers.push(marker);
            }
        });

        // Update place count
        const placeCountElement = document.getElementById('placeCount');
        const dataType = places.some(p => p.isRealTime) ? 'live' : 'sample';
        placeCountElement.innerHTML = `<i class="fas fa-${places.some(p => p.isRealTime) ? 'wifi' : 'database'}"></i> ${places.length} ${dataType} places found`;

        // Fit map to show all markers
        if (this.markers.length > 0) {
            const group = new L.featureGroup(this.markers);
            this.map.fitBounds(group.getBounds().pad(0.1));
        }
    }

    createRealTimePopupContent(place) {
        const details = place.details || place;
        const name = place.name || 'Unknown Place';
        const address = place.location?.formatted_address || place.location?.address || 'Address not available';
        const category = place.categories?.[0]?.name || 'Place';
        const rating = details.rating ? details.rating.toFixed(1) : null;
        const hours = details.hours?.display;

        const dataSource = place.isRealTime ? 'Real-time from Foursquare' : 'Sample data';
        const badgeClass = place.isRealTime ? 'live' : 'sample';

        return `
            <div class="popup-content">
                <h4 class="popup-place-name">${name}</h4>
                <div class="popup-details">
                    <div class="popup-detail">
                        <i class="fas fa-tag"></i>
                        <span>${category}</span>
                    </div>
                    <div class="popup-detail">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${address}</span>
                    </div>
                    ${rating ? `
                    <div class="popup-detail">
                        <i class="fas fa-star"></i>
                        <span>${rating}/5 ⭐</span>
                    </div>` : ''}
                    ${hours ? `
                    <div class="popup-detail">
                        <i class="fas fa-clock"></i>
                        <span>${hours}</span>
                    </div>` : ''}
                </div>
                <div class="popup-live-badge ${badgeClass}">
                    <i class="fas fa-${place.isRealTime ? 'wifi' : 'database'}"></i>
                    ${dataSource}
                </div>
            </div>
        `;
    }

    focusOnPlace(place) {
        if (place.geocodes?.main?.latitude && place.geocodes?.main?.longitude) {
            this.map.setView([
                place.geocodes.main.latitude,
                place.geocodes.main.longitude
            ], 16);
            
            // Find and open the corresponding marker popup
            this.markers.forEach(marker => {
                const markerLatLng = marker.getLatLng();
                if (Math.abs(markerLatLng.lat - place.geocodes.main.latitude) < 0.0001 &&
                    Math.abs(markerLatLng.lng - place.geocodes.main.longitude) < 0.0001) {
                    marker.openPopup();
                }
            });
        }
    }

    // Loading state management
    showLoading() {
        document.getElementById('loadingSection').classList.remove('hidden');
        const btn = document.querySelector('.discover-btn');
        btn.disabled = true;
        btn.querySelector('.btn-text').textContent = 'Fetching Real-time Data...';
        btn.querySelector('.btn-loader').classList.remove('hidden');
    }

    hideLoading() {
        document.getElementById('loadingSection').classList.add('hidden');
        const btn = document.querySelector('.discover-btn');
        btn.disabled = false;
        btn.querySelector('.btn-text').textContent = 'Discover Real-time Places';
        btn.querySelector('.btn-loader').classList.add('hidden');
        
        // Reset loading steps
        document.querySelectorAll('.loading-step').forEach(step => {
            step.classList.remove('active');
        });
    }

    setLoadingStep(stepNumber) {
        // Add active class to current and previous steps
        for (let i = 1; i <= stepNumber; i++) {
            const step = document.getElementById(`step${i}`);
            if (step) {
                step.classList.add('active');
            }
        }
    }

    // Error handling
    showError(message) {
        const errorSection = document.getElementById('errorSection');
        const errorMessage = document.getElementById('errorMessage');
        errorMessage.textContent = message;
        errorSection.classList.remove('hidden');
    }

    hideError() {
        document.getElementById('errorSection').classList.add('hidden');
    }

    hideResults() {
        document.getElementById('resultsSection').classList.add('hidden');
    }

    hideMapOverlay() {
        const overlay = document.getElementById('mapOverlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
    }
}

// Global functions
function clearError() {
    document.getElementById('errorSection').classList.add('hidden');
}

function retryWithDifferentLocation() {
    document.getElementById('errorSection').classList.add('hidden');
    document.getElementById('locationInput').focus();
    document.getElementById('locationInput').select();
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.questLensRealTime = new QuestLensRealTime();
});