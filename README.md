# World Attractions Explorer - Interactive Map Application

A modern React-based web application for exploring world attractions including national parks, temples, UNESCO sites, and cultural landmarks from multiple countries (USA, Canada, India, Nepal, Sri Lanka, and Costa Rica) with an interactive map, advanced filtering, statistics, and detailed information.

## 🚀 Features

- 🗺️ **Interactive Map**: Explore world attractions including parks, temples, UNESCO sites, and cultural landmarks from multiple countries on an interactive Leaflet map
- 🎯 **Regional Filtering**: Filter attractions by region and country (USA, Canada, India, Nepal, Sri Lanka, Costa Rica)
- 🌏 **Multi-Country Support**: View attractions from United States, Canada, India, Nepal, Sri Lanka, and Costa Rica
- 🏛️ **Diverse Attractions**: National parks, UNESCO World Heritage sites, temples, and cultural landmarks
- 📊 **Statistics Dashboard**: View comprehensive statistics about parks by region, state, and province
- 🎨 **Rich Park Information**: Click on any park to see detailed information including:
  - Park designation and location
  - Nearby airports (within 200 miles)
  - Nearby parks (within 300 miles)
  - Park descriptions and links
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- ⚡ **Fast Performance**: Built with React and Vite for optimal performance
- 🔄 **Real-time Updates**: Dynamic filtering and statistics calculation

## 📁 Project Structure

```
world-attractions-explorer/
├── src/
│   ├── components/          # React components
│   │   ├── StatisticsPanel.jsx
│   │   ├── FilterPanel.jsx
│   │   └── TabPanel.jsx
│   ├── pages/               # Page components
│   │   └── MapView.jsx
│   ├── services/            # Data services
│   │   └── dataService.js
│   ├── assets/              # Images and static assets
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # App entry point
│   └── index.css            # Global styles
├── public/                   # Public assets
├── data/                     # CSV data files
│   ├── US_National_Parks.csv
│   ├── Canadian_National_Parks.csv
│   ├── Indian_National_Parks.csv
│   ├── Costa_Rica_National_Parks.csv
│   └── Major_Airports.csv
├── scripts/                  # Python scripts for data management
│   ├── map_national_parks.py
│   ├── download_national_parks.py
│   ├── download_canadian_parks.py
│   └── download_airports.py
├── package.json
├── vite.config.js
└── README.md
```

## 🛠️ Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Python 3.x (for data scripts, optional)

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Edit `.env` and add your Firebase configuration:
     - Get your Firebase credentials from [Firebase Console](https://console.firebase.google.com/) > Project Settings > General > Your apps
     - Fill in all `VITE_FIREBASE_*` variables
   - **Note**: The `.env` file is already in `.gitignore` and will not be committed to git

3. **Ensure data files are in place:**
   - Check that CSV files are in the `data/` directory
   - If missing, run the download scripts (see Data Management section)

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   - The app will automatically open at `http://localhost:3000`

## 📊 Data Management

### Download/Update Data

To download or update park and airport data:

```bash
# Download all data
npm run download-data

# Or run individually:
python3 scripts/download_national_parks.py
python3 scripts/download_canadian_parks.py
python3 scripts/download_indian_parks.py
python3 scripts/download_costa_rica_parks.py
python3 scripts/download_airports.py
```

### Generate Static HTML Map (Legacy)

To generate the original static HTML map:

```bash
npm run generate-map
# or
python3 scripts/map_national_parks.py
```

## 🎮 Usage

### Exploring Parks

1. **View the Map**: The map loads with all parks visible by default
2. **Filter by Region**: 
   - Click the "🔍 Filters" tab
   - Check/uncheck regions to show/hide parks
3. **View Statistics**:
   - Click the "📊 Statistics" tab
   - See park counts by region, state, and province
4. **Get Park Details**:
   - Click on any park marker
   - View detailed information including nearby airports and parks

### Features

- **Interactive Markers**: 
  - Green markers for US parks
  - Red markers for Canadian parks
  - Saffron markers for Indian attractions (parks, UNESCO sites, Jyotirlinga temples)
  - Yellow markers for Nepal attractions (parks, temples)
  - Light yellow markers for Sri Lanka attractions (parks, temples)
  - Violet markers for Costa Rica parks
  - Country-colored markers for airports
- **Park Popups**: Click markers to see detailed information
- **Regional Filtering**: Toggle regions on/off to focus on specific areas
- **Statistics**: Real-time statistics based on visible parks

## 🚀 Building for Production

```bash
# Build the app
npm run build

# Preview the production build
npm run preview
```

The built files will be in the `dist/` directory.

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run generate-map` - Generate static HTML map (legacy)
- `npm run download-data` - Download/update data files

### Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **React Leaflet** - Map integration
- **Leaflet** - Mapping library
- **PapaParse** - CSV parsing
- **React Router** - Routing (ready for expansion)

## 📱 Mobile Support

The app is fully responsive and works on:
- Desktop browsers
- Tablets
- Mobile devices

## 🔮 Future Enhancements

Potential features for extension:
- [ ] User authentication and favorites
- [ ] Trip planning features
- [ ] Weather integration
- [ ] Photo galleries
- [ ] Reviews and ratings
- [ ] Offline mode
- [ ] Mobile app (React Native)
- [ ] Advanced search and filtering
- [ ] Route planning between parks
- [ ] Social sharing

## 📄 Data Sources

- **US National Parks**: [National Park Service API](https://www.nps.gov/subjects/developer/api-documentation.htm)
- **Canadian National Parks**: Scraped from Wikipedia
- **Indian National Parks**: Scraped from Wikipedia
- **Costa Rica National Parks**: Scraped from Wikipedia
- **Airports**: OpenFlights data

## 🤝 Contributing

This is a personal project, but suggestions and improvements are welcome!

## 📝 License

This project is open source and available for educational purposes.

## 🙏 Acknowledgments

- National Park Service for providing the API
- Leaflet and React Leaflet communities
- All the open-source libraries that made this possible

---

**Built with ❤️ for exploring the beautiful attractions and cultural landmarks around the world**
