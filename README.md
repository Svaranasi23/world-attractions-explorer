# US National Parks Interactive Map

An interactive web map showcasing US and Canadian National Parks with advanced features including regional filtering, heat maps, statistics, and draggable popups.

## Features

- 🗺️ **Interactive Map**: Visualize all US and Canadian National Parks on an interactive map
- 🎯 **Regional Filtering**: Filter parks by region (West, Midwest, South, Northeast, Alaska, Hawaii, Canada)
- 🔥 **Heat Map**: View park density with a heat map overlay
- 📊 **Statistics Panel**: See park counts by region, state, and province
- 🎨 **Draggable Popups**: Click on any park to see detailed information in a draggable popup
- ✈️ **Nearby Airports**: View major airports within 200 miles of each park
- 🏞️ **Nearby Parks**: Discover other national parks within 300 miles
- 🎛️ **Layer Controls**: Toggle different map layers and features
- 📍 **Mini Map**: Navigation aid for large-scale maps
- 🖱️ **Mouse Coordinates**: Real-time coordinate display

## Files

- `map_national_parks.py` - Main script to generate the interactive map
- `US_National_Parks.csv` - US National Parks data
- `Canadian_National_Parks.csv` - Canadian National Parks data
- `Major_Airports.csv` - Major airports data
- `US_National_Parks_Interactive_Map.html` - Generated interactive map (open in browser)
- `download_national_parks.py` - Script to download US parks data from NPS API
- `download_canadian_parks.py` - Script to download Canadian parks data
- `download_airports.py` - Script to download airports data

## Requirements

- Python 3.x
- folium
- requests (for downloading data)

## Installation

```bash
# Install required packages
pip install folium requests beautifulsoup4
```

## Usage

1. **Generate the interactive map:**
   ```bash
   python3 map_national_parks.py
   ```

2. **Open the generated HTML file:**
   Open `US_National_Parks_Interactive_Map.html` in your web browser.

3. **Download/Update data (optional):**
   ```bash
   python3 download_national_parks.py
   python3 download_canadian_parks.py
   python3 download_airports.py
   ```

## Map Features

### Interacting with Parks
- **Hover** over markers to see park names
- **Click** on markers to open detailed popups
- **Drag** popups by clicking and holding the green header
- **Close** popups by clicking the × button

### Filtering
- Use the **Filter** tab to filter parks by region
- Use the **Layer Control** (top-right) to toggle layers
- Check/uncheck regions to show/hide parks

### Statistics
- View park counts by region in the **Statistics** tab
- See breakdown by state/province

## Data Sources

- US National Parks: [National Park Service API](https://www.nps.gov/subjects/developer/api-documentation.htm)
- Canadian National Parks: Scraped from Wikipedia
- Airports: OpenFlights data

## License

This project is open source and available for educational purposes.

