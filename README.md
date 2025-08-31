# 🧭 QuestLens - AI-Powered Travel Discovery Platform

<div align="center">

**🏆 Hackathon Project - Real-time Agentic Spot Seeker**

*Discover amazing places worldwide with intelligent AI recommendations and real-time data*

</div>

---

## 🚀 What is QuestLens?

QuestLens revolutionizes travel discovery by combining **artificial intelligence** with **real-time data** to help users find exactly what they're looking for, anywhere in the world. Simply describe what you want in natural language, and our AI agent will understand your intent and provide personalized recommendations with live information.

### ✨ Key Features

- 🤖 **AI-Powered Understanding** - Natural language processing with GPT-4 and Llama 3.1
- 🌍 **Global Coverage** - Search any city worldwide with real-time data
- 📍 **Smart Recommendations** - Context-aware suggestions based on your preferences
- 🗺️ **Interactive Maps** - Beautiful Leaflet.js integration with custom markers
- ⚡ **Real-time Data** - Live information from Foursquare Places API
- 🎯 **Intelligent Categorization** - Automatic classification of places and preferences
- 📱 **Responsive Design** - Works perfectly on desktop and mobile devices

---

## 🎯 Problem Solved

Traditional travel apps require users to know exactly what they're searching for and navigate complex category filters. QuestLens solves this by:

1. **Understanding Intent** - "Coffee shops with WiFi for remote work" → Finds co-working friendly cafes
2. **Context Awareness** - "Family museums with parking" → Filters for kid-friendly venues with accessibility
3. **Real-time Accuracy** - Live data ensures places are open, rated, and available
4. **Global Reach** - Works in any city worldwide, not just major tourist destinations

---

## 🛠️ Technology Stack

### Frontend
- **HTML5/CSS3** - Modern responsive design
- **Vanilla JavaScript** - Lightweight, fast performance
- **Leaflet.js** - Interactive mapping
- **Font Awesome** - Beautiful iconography

### AI & APIs
- **OpenAI GPT-4** - Advanced natural language understanding
- **Llama 3.1** - Local AI processing for enhanced recommendations
- **Foursquare Places API** - Real-time venue data and ratings
- **Nominatim OSM** - Global geocoding service

---

## 🎮 How to Use

1. **Enter Location** - Type any city or location worldwide
2. **Describe Your Quest** - Use natural language to describe what you're looking for
3. **Get AI Recommendations** - Receive intelligent, personalized suggestions
4. **Explore on Map** - View results on an interactive map with detailed information

### 💡 Example Queries

```
"Best ramen shops for lunch in Tokyo"
"Family-friendly museums with parking in New York"
"Coffee shops with WiFi for remote work in Berlin"
"Budget hotels near city center in Mumbai"
"Hidden local attractions off the beaten path in Paris"
"Parks perfect for morning jogging in San Francisco"
```

---

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend UI   │────│   AI Processing  │────│  External APIs  │
│                 │    │                  │    │                 │
│ • Interactive   │    │ • GPT-4 Intent   │    │ • Foursquare    │
│   Search Form   │    │   Understanding  │    │   Places API    │
│ • Real-time     │    │ • Llama 3.1      │    │ • Nominatim     │
│   Results       │    │   Local AI       │    │   Geocoding     │
│ • Leaflet Maps  │    │ • Smart Category │    │ • Google Maps   │
│                 │    │   Mapping        │    │   Integration   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

---

## 🚀 Quick Start

### Run Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/Haridas-Nishita/QuestLens.git
   cd questlens
   ```

2. **Open in browser**
   ```bash
   # Simply open index.html in your browser
   # Or use a local server:
   python -m http.server 8000
   # Then visit: http://localhost:8000
   ```

3. **Configure APIs (Optional)**
   - Add your Foursquare API key in `app.js`
   - The app works with demo data without API keys

---

## 🎨 Screenshots

### Main Interface
- Clean, modern design with intuitive search interface
- Real-time loading indicators and status updates
- Smart sample queries to get users started

### AI Recommendations
- Contextual understanding of user intent
- Detailed place information with ratings and reviews
- Smart categorization and filtering

### Interactive Map
- Custom markers for different place types
- Popup details with rich information
- Smooth animations and user interactions

---

## 🧠 AI Intelligence Features

### Natural Language Processing
- **Intent Recognition** - Understands complex, multi-criteria requests
- **Context Awareness** - Considers location, time, and user preferences
- **Smart Categorization** - Automatically maps requests to relevant place types

### Local AI Processing
- **Llama 3.1 Integration** - On-device processing for privacy and speed
- **Fallback Systems** - Graceful degradation when APIs are unavailable
- **Smart Caching** - Optimized performance with intelligent data management

---

## 🌟 Hackathon Highlights

### Innovation
- **First-of-its-kind** natural language travel discovery
- **Hybrid AI approach** combining cloud and local processing
- **Real-time data integration** for accurate, up-to-date information

### Technical Excellence
- **Production-ready deployment** with full CI/CD pipeline
- **Scalable architecture** using serverless functions
- **Error handling & fallbacks** for robust user experience

### User Experience
- **Zero learning curve** - Just type what you want
- **Global accessibility** - Works anywhere in the world
- **Mobile-first design** - Perfect for travelers on the go

---

## 🔧 Development

### Project Structure
```
questlens/
├── index.html          # Main application interface
├── app.js             # Core application logic & AI processing
├── style.css          # Modern responsive styling
├── netlify/           # Serverless functions (production)
│   └── functions/     # API endpoints and integrations
├── services/          # Modular API service layer
└── README.md          # This file
```

### Key Components
- **QuestLensRealTime Class** - Main application controller
- **AI Query Processor** - Natural language understanding
- **API Integration Layer** - Real-time data fetching
- **Map Visualization** - Interactive place discovery

---

## 🏆 Awards & Recognition

- ✅ **Full-Stack Implementation** - Frontend + Backend + AI integration
- ✅ **Real API Integration** - Working with live external services
- ✅ **Mobile Responsive** - Works across all devices

---

## 🤝 Contributing

This project was built for a hackathon and represents a complete, production-ready travel discovery platform. The codebase demonstrates:

- Modern JavaScript development practices
- AI integration patterns
- Real-time API consumption
- Responsive web design
- Production deployment strategies

---

## 📄 License

Built with ❤️ for hackathon innovation. Feel free to explore, learn, and build upon this project!

---

<div align="center">

**🌟 Star this repo if you found QuestLens innovative! 🌟**

*Made with passion for intelligent travel discovery*

</div>