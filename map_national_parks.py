import csv
import folium
from folium import plugins
from collections import Counter
import json
import math

# Read US National Parks CSV
us_csv_path = '/Users/srivaranasi/Library/CloudStorage/GoogleDrive-pvsvnc04@gmail.com/My Drive/PVSVNC_Documents/Sri/Sri_Gigs/US national parks/US_National_Parks.csv'

parks_data = []
with open(us_csv_path, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        row['Country'] = 'United States'
        parks_data.append(row)

print(f"Loaded {len(parks_data)} US National Parks")

# Read Canadian National Parks CSV
canada_csv_path = '/Users/srivaranasi/Library/CloudStorage/GoogleDrive-pvsvnc04@gmail.com/My Drive/PVSVNC_Documents/Sri/Sri_Gigs/US national parks/Canadian_National_Parks.csv'

try:
    with open(canada_csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Convert Canadian park format to match US format
            canada_park = {
                'Park_Code': row.get('Park_Code', ''),
                'Name': row.get('Name', ''),
                'Designation': 'National Park',
                'States': row.get('Province', ''),
                'Latitude': row.get('Latitude', '0'),
                'Longitude': row.get('Longitude', '0'),
                'Description': f"Canadian National Park in {row.get('Province', '')}",
                'URL': '',
                'Country': 'Canada'
            }
            parks_data.append(canada_park)
    print(f"Loaded {len([p for p in parks_data if p.get('Country') == 'Canada'])} Canadian National Parks")
except FileNotFoundError:
    print("Canadian parks CSV not found, continuing with US parks only")
except Exception as e:
    print(f"Error loading Canadian parks: {e}")

print(f"Total parks loaded: {len(parks_data)}")

# Load airport data
airports_data = []
airports_csv_path = '/Users/srivaranasi/Library/CloudStorage/GoogleDrive-pvsvnc04@gmail.com/My Drive/PVSVNC_Documents/Sri/Sri_Gigs/US national parks/Major_Airports.csv'
try:
    with open(airports_csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            airports_data.append(row)
    print(f"Loaded {len(airports_data)} major airports")
except FileNotFoundError:
    print("Airports CSV not found, airport features will be disabled")
except Exception as e:
    print(f"Error loading airports: {e}")

# Distance calculation function (Haversine formula) - returns distance in miles
def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two points in miles using Haversine formula"""
    # Radius of Earth in miles
    R = 3958.8
    
    # Convert to radians
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    
    # Haversine formula
    a = math.sin(delta_lat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    distance = R * c
    
    return distance

# Process data for statistics
state_counts = Counter()
province_counts = Counter()
country_counts = Counter()
region_parks = {'West': [], 'Midwest': [], 'South': [], 'Northeast': [], 'Alaska': [], 'Hawaii': [], 'Canada': []}
west_states = ['CA', 'OR', 'WA', 'NV', 'ID', 'MT', 'WY', 'UT', 'CO', 'AZ', 'NM']
midwest_states = ['ND', 'SD', 'NE', 'KS', 'MN', 'IA', 'MO', 'WI', 'IL', 'MI', 'IN', 'OH']
south_states = ['TX', 'OK', 'AR', 'LA', 'MS', 'AL', 'TN', 'KY', 'WV', 'VA', 'NC', 'SC', 'GA', 'FL']
northeast_states = ['ME', 'NH', 'VT', 'MA', 'RI', 'CT', 'NY', 'NJ', 'PA', 'MD', 'DE']

for park in parks_data:
    country = park.get('Country', 'United States')
    country_counts[country] += 1
    
    if country == 'Canada':
        # Canadian parks
        province = park.get('States', '')  # Using States field for Province
        if province:
            province_list = [p.strip() for p in province.split(',')]
            for prov in province_list:
                province_counts[prov] += 1
        region_parks['Canada'].append(park)
    else:
        # US parks
        states = park.get('States', '')
        if states:
            state_list = [s.strip() for s in states.split(',')]
            for state in state_list:
                state_counts[state] += 1
            
            # Categorize by region
            park_states = [s.strip() for s in states.split(',')]
            if 'AK' in park_states:
                region_parks['Alaska'].append(park)
            elif any(s in park_states for s in ['HI']):
                region_parks['Hawaii'].append(park)
            elif any(s in park_states for s in west_states):
                region_parks['West'].append(park)
            elif any(s in park_states for s in midwest_states):
                region_parks['Midwest'].append(park)
            elif any(s in park_states for s in south_states):
                region_parks['South'].append(park)
            elif any(s in park_states for s in northeast_states):
                region_parks['Northeast'].append(park)

# Create a base map centered to show both US and Canada
# Center between US and Canada
north_america_center = [50.0, -100.0]  # Centered to show both countries

# Create the map with light styling
m = folium.Map(
    location=north_america_center,
    zoom_start=3,  # Zoomed out to show both countries
    tiles='CartoDB positron',
    min_zoom=2,
    max_zoom=18
)

# Add different tile layer options
folium.TileLayer('CartoDB positron', name='Light Map (Default)', show=True).add_to(m)
folium.TileLayer('CartoDB voyager', name='Voyager (Light)', show=False).add_to(m)
folium.TileLayer('OpenStreetMap', name='OpenStreetMap', show=False).add_to(m)
# Terrain layer - using Esri WorldTopoMap (very reliable terrain provider)
folium.TileLayer(
    tiles='https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attr='Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
    name='Terrain',
    overlay=False,
    control=True,
    min_zoom=0,
    max_zoom=16
).add_to(m)

# Create feature groups by region - these will be toggleable layers
# Start with all regions visible, but users can toggle them
region_groups = {}
region_visibility = {
    'West': True,
    'South': True, 
    'Midwest': True,
    'Northeast': True,
    'Alaska': True,
    'Hawaii': True,
    'Canada': True
}
for region in region_parks.keys():
    region_groups[region] = folium.FeatureGroup(name=f'{region} ({len(region_parks[region])} parks)')

# Prepare heat map data
heat_data = []

# Add markers for each park
park_count = 0
park_markers = []  # Store for search functionality

for park in parks_data:
    try:
        lat = float(park.get('Latitude', 0))
        lon = float(park.get('Longitude', 0))
        name = park.get('Name', 'Unknown')
        states = park.get('States', 'N/A')
        designation = park.get('Designation', 'N/A')
        description = park.get('Description', 'No description available')
        url = park.get('URL', '')
        
        if lat != 0 and lon != 0:
            park_count += 1
            heat_data.append([lat, lon])
            
            # Get country
            country = park.get('Country', 'United States')
            
            # Determine region
            park_states = [s.strip() for s in states.split(',')]
            if country == 'Canada':
                region = 'Canada'
            else:
                region = 'West'
                if 'AK' in park_states:
                    region = 'Alaska'
                elif any(s in park_states for s in ['HI']):
                    region = 'Hawaii'
                elif any(s in park_states for s in west_states):
                    region = 'West'
                elif any(s in park_states for s in midwest_states):
                    region = 'Midwest'
                elif any(s in park_states for s in south_states):
                    region = 'South'
                elif any(s in park_states for s in northeast_states):
                    region = 'Northeast'
            
            # Truncate description
            desc_short = description[:250] + '...' if len(description) > 250 else description
            
            # Determine location label
            location_label = 'State(s)' if country == 'United States' else 'Province(s)'
            
            # Find nearby airports (within 200 miles)
            nearby_airports = []
            if airports_data:
                for airport in airports_data:
                    try:
                        airport_lat = float(airport.get('Latitude', 0))
                        airport_lon = float(airport.get('Longitude', 0))
                        if airport_lat != 0 and airport_lon != 0:
                            distance = calculate_distance(lat, lon, airport_lat, airport_lon)
                            if distance <= 200:  # Within 200 miles
                                nearby_airports.append({
                                    'name': airport.get('Name', ''),
                                    'iata': airport.get('IATA', ''),
                                    'city': airport.get('City', ''),
                                    'distance': distance
                                })
                    except (ValueError, TypeError):
                        continue
                # Sort by distance
                nearby_airports.sort(key=lambda x: x['distance'])
                nearby_airports = nearby_airports[:5]  # Top 5 closest
            
            # Find nearby parks (within 300 miles driving distance)
            nearby_parks = []
            for other_park in parks_data:
                if other_park.get('Name') == name:  # Skip self
                    continue
                try:
                    other_lat = float(other_park.get('Latitude', 0))
                    other_lon = float(other_park.get('Longitude', 0))
                    if other_lat != 0 and other_lon != 0:
                        distance = calculate_distance(lat, lon, other_lat, other_lon)
                        if distance <= 300:  # Within 300 miles
                            nearby_parks.append({
                                'name': other_park.get('Name', ''),
                                'distance': distance,
                                'lat': other_lat,
                                'lon': other_lon
                            })
                except (ValueError, TypeError):
                    continue
            # Sort by distance
            nearby_parks.sort(key=lambda x: x['distance'])
            nearby_parks = nearby_parks[:5]  # Top 5 closest
            
            # Build airports HTML
            airports_html = ""
            if nearby_airports:
                airports_html = '<div style="margin: 10px 0 5px 0;"><strong>✈️ Nearby Airports:</strong></div><ul style="margin: 5px 0; padding-left: 20px; font-size: 11px;">'
                for airport in nearby_airports:
                    airports_html += f'<li>{airport["iata"]} - {airport["name"]} ({airport["distance"]:.1f} mi)</li>'
                airports_html += '</ul>'
            else:
                airports_html = '<p style="margin: 10px 0 5px 0; font-size: 11px; color: #666;"><strong>✈️ Nearby Airports:</strong> None within 200 miles</p>'
            
            # Build nearby parks HTML
            nearby_parks_html = ""
            if nearby_parks:
                nearby_parks_html = '<div style="margin: 10px 0 5px 0;"><strong>🏞️ Nearby Parks (within 300 mi):</strong></div><ul style="margin: 5px 0; padding-left: 20px; font-size: 11px;">'
                for park in nearby_parks:
                    nearby_parks_html += f'<li>{park["name"]} ({park["distance"]:.1f} mi)</li>'
                nearby_parks_html += '</ul>'
            else:
                nearby_parks_html = '<p style="margin: 10px 0 5px 0; font-size: 11px; color: #666;"><strong>🏞️ Nearby Parks:</strong> None within 300 miles</p>'
            
            # Create popup HTML with country info, airports, and nearby parks
            park_id = f"park_{park_count}"  # Unique ID for this park
            popup_html = f"""
            <div id="{park_id}_popup" class="draggable-popup" style="width: 350px; font-family: Arial, sans-serif; position: relative; background: white; border-radius: 5px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
                <div class="popup-header" style="background-color: #4CAF50; color: white; padding: 8px 12px; border-radius: 5px 5px 0 0; cursor: move; user-select: none;">
                    <h3 style="margin: 0; font-size: 16px; display: inline-block;">{name}</h3>
                    <span class="popup-close-btn" style="float: right; cursor: pointer; font-size: 18px; font-weight: bold; opacity: 0.8; padding: 0 5px;" title="Close">×</span>
                </div>
                <div class="popup-content" style="padding: 12px; max-height: 500px; overflow-y: auto;">
                    <p style="margin: 5px 0; font-size: 12px;"><strong>🌍 Country:</strong> {country}</p>
                    <p style="margin: 5px 0; font-size: 12px;"><strong>📍 {location_label}:</strong> {states}</p>
                    <p style="margin: 5px 0; font-size: 12px;"><strong>🏞️ Designation:</strong> {designation}</p>
                    <p style="margin: 5px 0; font-size: 12px;"><strong>🗺️ Region:</strong> {region}</p>
                    <p style="margin: 8px 0; font-size: 11px; color: #555; line-height: 1.4;">{desc_short}</p>
                    {f'<p style="margin: 8px 0;"><a href="{url}" target="_blank" style="color: #0066cc; text-decoration: none; font-weight: bold;">🌐 Visit NPS Website →</a></p>' if url else ''}
                    {airports_html}
                    {nearby_parks_html}
                    <p style="margin: 5px 0; font-size: 10px; color: #888;">Coordinates: {lat:.4f}°N, {lon:.4f}°W</p>
                </div>
            </div>
            """
            
            # Choose icon color based on country
            icon_color = 'red' if country == 'Canada' else 'green'
            
            # Create marker with unique ID
            marker = folium.Marker(
                location=[lat, lon],
                popup=folium.Popup(popup_html, max_width=380, close_on_click=False),
                tooltip=folium.Tooltip(
                    text=f"<b>{name}</b><br>{country}<br>{states}<br>Region: {region}",
                    permanent=False,
                    sticky=True,
                    style="font-size: 12px; font-weight: bold;"
                ),
                icon=folium.Icon(
                    color=icon_color,
                    icon='tree-conifer',
                    prefix='glyphicon',
                    icon_size=(20, 30)
                )
            )
            
            # Add unique ID to marker for JavaScript access
            marker._id = park_id
            
            # Add to appropriate region group
            if region in region_groups:
                marker.add_to(region_groups[region])
            
            park_markers.append({
                'id': park_id,
                'name': name,
                'lat': lat,
                'lon': lon,
                'states': states,
                'region': region,
                'marker': marker,
                'nearby_parks': nearby_parks  # Store for JavaScript highlighting
            })
            
    except (ValueError, TypeError):
        continue

# Add all region groups to map as overlays (so they show as checkboxes)
for group in region_groups.values():
    group.add_to(m)

# Add heat map layer
if heat_data:
    heat_map = plugins.HeatMap(
        heat_data,
        name='Park Density Heat Map',
        show=False,
        overlay=True,  # Make sure it's an overlay
        radius=20,
        blur=15,
        max_zoom=17,
        gradient={0.2: 'blue', 0.4: 'cyan', 0.6: 'lime', 0.8: 'yellow', 1.0: 'red'}
    )
    heat_map.add_to(m)

# Add layer control - must be added AFTER all feature groups
# FeatureGroups are automatically overlays, so they should show as checkboxes
# Position it at top-left to avoid overlap with statistics panel and minimap
layer_control = folium.LayerControl(
    collapsed=True,  # Start collapsed to save space
    position='topleft',
    autoZIndex=True
)
layer_control.add_to(m)

# Create tabbed interface for statistics and filters
top_states = sorted(state_counts.items(), key=lambda x: x[1], reverse=True)[:10]
top_provinces = sorted(province_counts.items(), key=lambda x: x[1], reverse=True)[:10]

# Build filter checkboxes HTML
filter_checkboxes = ""
# Separate US regions and Canada
us_regions = [r for r in sorted(region_parks.keys()) if r != 'Canada']
for region in us_regions:
    count = len(region_parks[region])
    filter_checkboxes += f"""
    <label style="display: block; margin: 5px 0; cursor: pointer; padding: 3px 0;">
        <input type="checkbox" id="filter_{region}" checked onchange="toggleRegionLayer('{region}', this.checked)" 
               style="margin-right: 8px; cursor: pointer; width: 16px; height: 16px;">
        <strong>{region}</strong> ({count} parks)
    </label>
    """
# Add Canada separately with different styling
if 'Canada' in region_parks:
    canada_count = len(region_parks['Canada'])
    filter_checkboxes += f"""
    <label style="display: block; margin: 8px 0 5px 0; cursor: pointer; padding: 5px 0; border-top: 1px solid #ccc;">
        <input type="checkbox" id="filter_Canada" checked onchange="toggleRegionLayer('Canada', this.checked)" 
               style="margin-right: 8px; cursor: pointer; width: 16px; height: 16px;">
        <strong style="color: #d32f2f;">🇨🇦 Canada</strong> ({canada_count} parks)
    </label>
    """

# Build statistics list HTML
stats_list = ""
for state, count in top_states:
    stats_list += f"    <li>{state}: {count} park{'s' if count > 1 else ''}</li>\n"

# Build provinces list HTML
provinces_list = ""
if top_provinces:
    for prov, count in top_provinces:
        park_word = "parks" if count > 1 else "park"
        provinces_list += f"    <li>{prov}: {count} {park_word}</li>\n"

tabbed_panel_html = f"""
<div id="tabbedPanel" style="position: fixed; 
            top: 10px; right: 10px; width: 300px; max-height: 600px; 
            background-color: white; border: 2px solid #4CAF50; z-index:9999 !important; 
            font-size: 12px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            overflow: hidden; display: flex; flex-direction: column;">
    
    <!-- Tab Headers -->
    <div style="display: flex; border-bottom: 2px solid #4CAF50; background-color: #f0f8f0;">
        <button id="tabStats" onclick="switchTab('stats')" 
                style="flex: 1; padding: 10px; border: none; background-color: #4CAF50; color: white; 
                       cursor: pointer; font-size: 13px; font-weight: bold; border-right: 1px solid #2d5016;">
            📊 Statistics
        </button>
        <button id="tabFilters" onclick="switchTab('filters')" 
                style="flex: 1; padding: 10px; border: none; background-color: #f0f8f0; color: #2d5016; 
                       cursor: pointer; font-size: 13px; font-weight: bold;">
            🔍 Filters
        </button>
    </div>
    
    <!-- Tab Content Container -->
    <div style="flex: 1; overflow-y: auto; padding: 15px;">
        <!-- Statistics Tab Content -->
        <div id="contentStats" style="display: block;">
            <h3 style="margin: 0 0 10px 0; color: #2d5016; font-size: 16px; border-bottom: 2px solid #4CAF50; padding-bottom: 5px;">
                📊 Statistics
            </h3>
            <p style="margin: 5px 0;"><strong>Total Parks:</strong> {park_count}</p>
            
            <p style="margin: 10px 0 5px 0;"><strong>Parks by Country:</strong></p>
            <ul style="margin: 5px 0; padding-left: 20px;">
                <li>🇺🇸 United States: {country_counts.get('United States', 0)}</li>
                <li>🇨🇦 Canada: {country_counts.get('Canada', 0)}</li>
            </ul>
            
            <p style="margin: 10px 0 5px 0;"><strong>Parks by Region:</strong></p>
            <ul style="margin: 5px 0; padding-left: 20px;">
                <li>West: {len(region_parks['West'])}</li>
                <li>South: {len(region_parks['South'])}</li>
                <li>Midwest: {len(region_parks['Midwest'])}</li>
                <li>Northeast: {len(region_parks['Northeast'])}</li>
                <li>Alaska: {len(region_parks['Alaska'])}</li>
                <li>Hawaii: {len(region_parks['Hawaii'])}</li>
                <li style="color: #d32f2f;">🇨🇦 Canada: {len(region_parks.get('Canada', []))}</li>
            </ul>
            
            <p style="margin: 10px 0 5px 0;"><strong>Top 10 US States:</strong></p>
            <ol style="margin: 5px 0; padding-left: 20px; font-size: 11px;">
{stats_list}
            </ol>
            
            {f'''
            <p style="margin: 10px 0 5px 0;"><strong>Top 10 Canadian Provinces:</strong></p>
            <ol style="margin: 5px 0; padding-left: 20px; font-size: 11px;">
{provinces_list}
            </ol>
            ''' if top_provinces else ''}
            
            <div style="margin: 15px 0 0 0; padding: 8px; background-color: #fff3cd; border-radius: 5px; border: 1px solid #ffc107;">
                <p style="margin: 0; font-size: 11px; color: #856404;">
                    <strong>💡 Tip:</strong> Click the <strong>Layer Control</strong> icon (top-left corner, looks like stacked layers) to toggle the <strong>Park Density Heat Map</strong> and switch map styles!
                </p>
            </div>
        </div>
        
        <!-- Filters Tab Content -->
        <div id="contentFilters" style="display: none;">
            <h3 style="margin: 0 0 10px 0; color: #2d5016; font-size: 16px; border-bottom: 2px solid #4CAF50; padding-bottom: 5px;">
                🔍 Filter by Region
            </h3>
            <p style="margin: 5px 0 10px 0; font-size: 11px; color: #666;">
                Check/uncheck regions to show/hide parks on the map
            </p>
            <div style="max-height: 400px; overflow-y: auto; padding: 5px;">
{filter_checkboxes}
            </div>
            <p style="margin: 10px 0 0 0; font-size: 10px; color: #666; font-style: italic;">
                ✅ All regions are visible by default
            </p>
        </div>
    </div>
</div>

<script>
function switchTab(tabName) {{
    // Hide all tab contents
    document.getElementById('contentStats').style.display = 'none';
    document.getElementById('contentFilters').style.display = 'none';
    
    // Reset all tab buttons
    document.getElementById('tabStats').style.backgroundColor = '#f0f8f0';
    document.getElementById('tabStats').style.color = '#2d5016';
    document.getElementById('tabFilters').style.backgroundColor = '#f0f8f0';
    document.getElementById('tabFilters').style.color = '#2d5016';
    
    // Show selected tab content and highlight button
    if (tabName === 'stats') {{
        document.getElementById('contentStats').style.display = 'block';
        document.getElementById('tabStats').style.backgroundColor = '#4CAF50';
        document.getElementById('tabStats').style.color = 'white';
    }} else if (tabName === 'filters') {{
        document.getElementById('contentFilters').style.display = 'block';
        document.getElementById('tabFilters').style.backgroundColor = '#4CAF50';
        document.getElementById('tabFilters').style.color = 'white';
    }}
}}
</script>
"""
m.get_root().html.add_child(folium.Element(tabbed_panel_html))

# Enhanced title with search hint
title_html = '''
             <div style="position: fixed; 
                         top: 10px; left: 50px; width: 350px; height: 100px; 
                         background-color: white; border: 2px solid #4CAF50; z-index:9999 !important; 
                         font-size: 14px; padding: 10px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.3);">
             <h3 style="margin: 0 0 5px 0; color: #2d5016;"><b>🗺️ US National Parks Map</b></h3>
             <p style="margin: 0; font-size: 11px;">Hover for names • Click for details • Toggle layers to filter</p>
             <p style="margin: 3px 0; font-size: 10px; color: #666;">Use layer control (top-right) to filter by region</p>
             </div>
             '''
m.get_root().html.add_child(folium.Element(title_html))

# Add fullscreen button
plugins.Fullscreen(
    position='topleft',
    title='Fullscreen',
    title_cancel='Exit Fullscreen',
    force_separate_button=True
).add_to(m)

# Add measure tool
plugins.MeasureControl(
    position='bottomleft',
    primary_length_unit='miles',
    secondary_length_unit='kilometers',
    primary_area_unit='sqmiles',
    secondary_area_unit='sqmeters'
).add_to(m)

# Add draw plugin
draw = plugins.Draw(export=True)
draw.add_to(m)

# Add minimap
minimap = plugins.MiniMap(toggle_display=True, position='bottomright')
minimap.add_to(m)

# Add mouse position
plugins.MousePosition(
    position='bottomright',
    separator=' | ',
    prefix='Coordinates: ',
    num_digits=4
).add_to(m)

# Create a mapping of regions to sample coordinates for matching
region_coordinates = {}
for park in parks_data:
    try:
        lat = float(park.get('Latitude', 0))
        lon = float(park.get('Longitude', 0))
        name = park.get('Name', 'Unknown')
        states = park.get('States', 'N/A')
        
        if lat != 0 and lon != 0:
            # Get country
            country = park.get('Country', 'United States')
            
            # Determine region
            park_states = [s.strip() for s in states.split(',')]
            if country == 'Canada':
                region = 'Canada'
            else:
                region = 'West'
                if 'AK' in park_states:
                    region = 'Alaska'
                elif any(s in park_states for s in ['HI']):
                    region = 'Hawaii'
                elif any(s in park_states for s in west_states):
                    region = 'West'
                elif any(s in park_states for s in midwest_states):
                    region = 'Midwest'
                elif any(s in park_states for s in south_states):
                    region = 'South'
                elif any(s in park_states for s in northeast_states):
                    region = 'Northeast'
            
            # Store first coordinate for each region (for matching)
            if region not in region_coordinates:
                region_coordinates[region] = [lat, lon, name]
    except:
        continue

# Create JavaScript mapping
region_map_script = f"""
<script>
// Store region to coordinate mapping for matching FeatureGroups
window.regionCoordinates = {json.dumps(region_coordinates)};
console.log('Region coordinates stored:', Object.keys(window.regionCoordinates));

// Store park data with nearby parks for highlighting
window.parkData = {json.dumps([{'id': p['id'], 'name': p['name'], 'lat': p['lat'], 'lon': p['lon'], 'nearby_parks': p['nearby_parks']} for p in park_markers])};
console.log('Park data stored:', window.parkData.length, 'parks');
</script>
"""
m.get_root().html.add_child(folium.Element(region_map_script))

# Add CSS to ensure popups appear above other panels
popup_css = """
<style>
/* Ensure popup is above all panels - use very high z-index */
.leaflet-popup-pane {
    z-index: 99999 !important;
    position: relative !important;
}
.leaflet-popup {
    z-index: 99999 !important;
    position: relative !important;
}
.leaflet-popup-content-wrapper {
    z-index: 99999 !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    border: none !important;
    padding: 0 !important;
    background: transparent !important;
    position: relative !important;
}
.leaflet-popup-content {
    z-index: 99999 !important;
    position: relative !important;
}
.draggable-popup {
    z-index: 99999 !important;
    position: relative !important;
}
/* Ensure popup container is above everything */
div[id*="_popup"] {
    z-index: 99999 !important;
    position: relative !important;
}
/* Force popup to be on top of all other elements */
.leaflet-container .leaflet-popup-pane {
    z-index: 99999 !important;
}
.leaflet-container .leaflet-popup {
    z-index: 99999 !important;
}
/* Hide Leaflet's default close button since we have our own */
.leaflet-popup-close-button {
    display: none !important;
}
/* Hide Leaflet's popup tip */
.leaflet-popup-tip {
    display: none !important;
}
</style>
"""
m.get_root().html.add_child(folium.Element(popup_css))

toggle_script = """
<script>
// Store map reference
var leafletMap = null;

// Function to get the Leaflet map object
function getMap() {
    if (leafletMap) return leafletMap;
    
    // Try to find map in various ways
    var container = document.querySelector('.leaflet-container');
    if (!container) return null;
    
    // Look for map in window objects
    for (var key in window) {
        try {
            var obj = window[key];
            if (obj && obj._container === container && obj.eachLayer) {
                leafletMap = obj;
                return leafletMap;
            }
        } catch(e) {}
    }
    
    // Try to get from container
    if (container._leaflet_id) {
        var id = container._leaflet_id;
        if (window[id]) {
            leafletMap = window[id];
            return leafletMap;
        }
    }
    
    return null;
}

// Function to toggle region layers on the map
function toggleRegionLayer(region, show) {
    var map = getMap();
    if (!map) {
        setTimeout(function() { toggleRegionLayer(region, show); }, 300);
        return;
    }
    
    // Try stored references first
    if (regionGroupLayers[region]) {
        var layer = regionGroupLayers[region];
        try {
            if (show) {
                if (!map.hasLayer(layer)) {
                    map.addLayer(layer);
                }
            } else {
                if (map.hasLayer(layer)) {
                    map.removeLayer(layer);
                }
            }
            updateLayerControlCheckbox(region, show);
            updateFilterPanelCheckbox(region, show);
            return;
        } catch(e) {
            console.log('Error with stored reference:', e);
        }
    }
    
    // Simple approach: Find the checkbox in layer control and click it
    // This will trigger Leaflet's built-in toggle mechanism
    var layerControl = document.querySelector('.leaflet-control-layers');
    if (!layerControl) {
        console.log('Layer control not found in DOM');
        return;
    }
    
    var overlaySection = layerControl.querySelector('.leaflet-control-layers-overlays');
    if (!overlaySection) {
        console.log('Overlay section not found');
        return;
    }
    
    var labels = overlaySection.querySelectorAll('label');
    console.log('Found', labels.length, 'labels in overlay section');
    
    // Debug: List all labels
    for (var d = 0; d < labels.length; d++) {
        var labelText = labels[d].textContent || labels[d].innerText || '';
        console.log('Label', d, ':', labelText);
    }
    
    // Try to find matching label
    var foundLabel = null;
    for (var i = 0; i < labels.length; i++) {
        var label = labels[i];
        var text = label.textContent || label.innerText || '';
        var textLower = text.toLowerCase();
        var regionLower = region.toLowerCase();
        
        // Try different matching strategies
        // Match at start, or match anywhere for Canada (since it might be "Canada (43 parks)")
        var matches = false;
        if (text.indexOf(region) === 0 || 
            text.indexOf(region + ' ') === 0 ||
            textLower.indexOf(regionLower) === 0) {
            matches = true;
        } else if (region === 'Canada') {
            // Special handling for Canada - check for "canada" anywhere or flag emoji
            if (textLower.indexOf('canada') >= 0 || text.indexOf('🇨🇦') >= 0 || text.indexOf('Canada') >= 0) {
                matches = true;
            }
        }
        
        if (matches) {
            foundLabel = label;
            console.log('Found matching label:', text, 'for region:', region);
            break;
        }
    }
    
    if (foundLabel) {
        var input = foundLabel.querySelector('input');
        if (input) {
            console.log('Found input, current checked state:', input.checked, 'desired:', show);
            // Set the checkbox state
            if (input.type === 'radio') {
                input.type = 'checkbox';
            }
            
            // If state needs to change, directly manipulate the layer first, then sync checkbox
            if (input.checked !== show) {
                console.log('Setting checkbox to:', show);
                
                // Set flag to prevent event listener from processing this change
                isProgrammaticChange = true;
                
                // First, try to find and toggle the layer directly
                var layerToggled = false;
                var allFeatureGroups = [];
                map.eachLayer(function(layer) {
                    if (layer instanceof L.FeatureGroup) {
                        allFeatureGroups.push(layer);
                    }
                });
                
                var inputIndex = Array.from(overlaySection.querySelectorAll('input')).indexOf(input);
                if (inputIndex >= 0 && inputIndex < allFeatureGroups.length) {
                    var targetLayer = allFeatureGroups[inputIndex];
                    try {
                        if (show) {
                            if (!map.hasLayer(targetLayer)) {
                                map.addLayer(targetLayer);
                            }
                        } else {
                            if (map.hasLayer(targetLayer)) {
                                map.removeLayer(targetLayer);
                            }
                        }
                        regionGroupLayers[region] = targetLayer;
                        layerToggled = true;
                        console.log('Directly toggled layer for:', region);
                    } catch(e) {
                        console.log('Error toggling layer directly:', e);
                    }
                }
                
                // If direct toggle didn't work, use checkbox events as fallback
                if (!layerToggled) {
                    // Set checkbox state and trigger events
                    input.checked = show;
                    
                    // Trigger click event which Leaflet listens to
                    var clickEvent = new MouseEvent('click', {
                        bubbles: true,
                        cancelable: true,
                        view: window
                    });
                    input.dispatchEvent(clickEvent);
                    
                    // Also try change event
                    var changeEvent = new Event('change', {
                        bubbles: true,
                        cancelable: true
                    });
                    input.dispatchEvent(changeEvent);
                } else {
                    // If we toggled directly, just update the checkbox state to match
                    input.checked = show;
                }
                
                // Clear flag after a short delay to allow events to process
                setTimeout(function() {
                    isProgrammaticChange = false;
                }, 100);
                
                // Store the layer reference for future use (if not already stored)
                if (!regionGroupLayers[region]) {
                    var inputIndex = Array.from(overlaySection.querySelectorAll('input')).indexOf(input);
                    console.log('Input index:', inputIndex, 'FeatureGroups:', allFeatureGroups.length, 'for region:', region);
                    if (inputIndex >= 0 && inputIndex < allFeatureGroups.length) {
                        regionGroupLayers[region] = allFeatureGroups[inputIndex];
                        console.log('Stored layer reference for:', region);
                    } else {
                        // Try to find the layer by matching the label text with layer control
                        console.log('Could not match by index, trying to find layer by name for:', region);
                        // The layer should already be toggled by the click event, so just store reference if we can find it
                        var layerControlObj = null;
                        if (map._controls && map._controls.length > 0) {
                            for (var c = 0; c < map._controls.length; c++) {
                                var control = map._controls[c];
                                if (control instanceof L.Control.Layers) {
                                    layerControlObj = control;
                                    break;
                                }
                            }
                        }
                        if (layerControlObj && layerControlObj._layers) {
                            for (var l = 0; l < layerControlObj._layers.length; l++) {
                                var layerInfo = layerControlObj._layers[l];
                                if (layerInfo.overlay && layerInfo.name) {
                                    var layerName = layerInfo.name.trim();
                                    if (layerName.indexOf(region) === 0 || 
                                        (region === 'Canada' && (layerName.toLowerCase().indexOf('canada') >= 0 || layerName.indexOf('🇨🇦') >= 0))) {
                                        regionGroupLayers[region] = layerInfo.layer;
                                        console.log('Stored layer reference for', region, 'by name matching');
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
                // Update filter panel to sync
                updateFilterPanelCheckbox(region, show);
            } else {
                console.log('Checkbox already in desired state');
                // Still update filter panel to ensure sync
                updateFilterPanelCheckbox(region, show);
            }
            return;
        } else {
            console.log('No input found in label');
        }
    } else {
        console.log('Could not find checkbox for region:', region);
        console.log('Available labels:', Array.from(labels).map(function(l) { return l.textContent || l.innerText; }));
        
        // Fallback: Match FeatureGroups by checking if they contain markers with expected coordinates
        if (window.regionCoordinates && window.regionCoordinates[region]) {
            var expectedCoord = window.regionCoordinates[region];
            var expectedLat = expectedCoord[0];
            var expectedLon = expectedCoord[1];
            console.log('Trying coordinate matching for region:', region, 'expected:', expectedLat, expectedLon);
            
            var allFeatureGroups = [];
            map.eachLayer(function(layer) {
                if (layer instanceof L.FeatureGroup) {
                    allFeatureGroups.push(layer);
                }
            });
            
            // Check each FeatureGroup to see if it contains a marker at the expected coordinates
            for (var i = 0; i < allFeatureGroups.length; i++) {
                var fg = allFeatureGroups[i];
                var foundMarker = false;
                fg.eachLayer(function(marker) {
                    if (marker instanceof L.Marker) {
                        var markerLat = marker.getLatLng().lat;
                        var markerLon = marker.getLatLng().lng;
                        // Check if coordinates match (within small tolerance)
                        if (Math.abs(markerLat - expectedLat) < 0.1 && Math.abs(markerLon - expectedLon) < 0.1) {
                            foundMarker = true;
                        }
                    }
                });
                
                if (foundMarker) {
                    console.log('Matched FeatureGroup by coordinates for region:', region);
                    try {
                        if (show) {
                            if (!map.hasLayer(fg)) {
                                map.addLayer(fg);
                            }
                        } else {
                            if (map.hasLayer(fg)) {
                                map.removeLayer(fg);
                            }
                        }
                        regionGroupLayers[region] = fg;
                        updateLayerControlCheckbox(region, show);
                        updateFilterPanelCheckbox(region, show);
                        return;
                    } catch(e) {
                        console.log('Error toggling matched layer:', e);
                    }
                }
            }
        }
    }
}

// Helper function to update layer control checkbox
function updateLayerControlCheckbox(region, show) {
    var layerControl = document.querySelector('.leaflet-control-layers');
    if (layerControl) {
        var overlaySection = layerControl.querySelector('.leaflet-control-layers-overlays');
        if (overlaySection) {
            var labels = overlaySection.querySelectorAll('label');
            labels.forEach(function(label) {
                var text = label.textContent || label.innerText || '';
                var textLower = text.toLowerCase();
                var regionLower = region.toLowerCase();
                
                // Match region name at the start of the label text, or special handling for Canada
                var matches = false;
                if (text.indexOf(region) === 0 || 
                    text.indexOf(region + ' ') === 0 ||
                    textLower.indexOf(regionLower) === 0) {
                    matches = true;
                } else if (region === 'Canada') {
                    // Special handling for Canada
                    if (textLower.indexOf('canada') >= 0 || text.indexOf('🇨🇦') >= 0 || text.indexOf('Canada') >= 0) {
                        matches = true;
                    }
                }
                
                if (matches) {
                    var input = label.querySelector('input');
                    if (input) {
                        if (input.type === 'radio') {
                            input.type = 'checkbox';
                        }
                        input.checked = show;
                    }
                }
            });
        }
    }
}

// Helper function to update filter panel checkbox
function updateFilterPanelCheckbox(region, show) {
    var filterCheckbox = document.getElementById('filter_' + region);
    if (filterCheckbox) {
        filterCheckbox.checked = show;
    } else {
        console.log('Filter panel checkbox not found for region:', region);
    }
}

// Store region group references for direct access (use window object for cross-script access)
if (!window.regionGroupLayers) {
    window.regionGroupLayers = {};
}
var regionGroupLayers = window.regionGroupLayers;

// Flag to prevent event listener from processing programmatic changes
var isProgrammaticChange = false;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        var map = getMap();
        if (!map) {
            setTimeout(arguments.callee, 500);
            return;
        }
        
        // Convert radio buttons to checkboxes in overlay section and add event listeners
        var layerControl = document.querySelector('.leaflet-control-layers');
        if (layerControl) {
            var overlaySection = layerControl.querySelector('.leaflet-control-layers-overlays');
            if (overlaySection) {
                var inputs = overlaySection.querySelectorAll('input[type="radio"]');
                inputs.forEach(function(input) {
                    input.type = 'checkbox';
                });
                
                // Add event listeners to all overlay checkboxes to sync with filter panel
                var allOverlayInputs = overlaySection.querySelectorAll('input[type="checkbox"]');
                allOverlayInputs.forEach(function(input) {
                    input.addEventListener('change', function() {
                        // Skip if this is a programmatic change
                        if (isProgrammaticChange) {
                            return;
                        }
                        
                        var label = this.closest('label');
                        if (label) {
                            var labelText = label.textContent || label.innerText || '';
                            var labelTextLower = labelText.toLowerCase();
                            
                            // Try to match region name
                            var regions = ['West', 'South', 'Midwest', 'Northeast', 'Alaska', 'Hawaii', 'Canada'];
                            for (var r = 0; r < regions.length; r++) {
                                var region = regions[r];
                                var regionLower = region.toLowerCase();
                                
                                // Match if label starts with region name, or contains it for Canada
                                if (labelText.indexOf(region) === 0 || 
                                    labelText.indexOf(region + ' ') === 0 ||
                                    labelTextLower.indexOf(regionLower) === 0 ||
                                    (region === 'Canada' && (labelTextLower.indexOf('canada') >= 0 || labelText.indexOf('🇨🇦') >= 0))) {
                                    console.log('Layer control checkbox changed for region:', region, 'checked:', this.checked);
                                    updateFilterPanelCheckbox(region, this.checked);
                                    break;
                                }
                            }
                        }
                    });
                });
            }
        }
        
        // Store region group references by checking layer control first
        var layerControlObj = null;
        if (map._controls && map._controls.length > 0) {
            for (var i = 0; i < map._controls.length; i++) {
                var control = map._controls[i];
                if (control instanceof L.Control.Layers) {
                    layerControlObj = control;
                    break;
                }
            }
        }
        
        console.log('Initializing region groups...');
        var regions = ['West', 'South', 'Midwest', 'Northeast', 'Alaska', 'Hawaii', 'Canada'];
        
        // Debug: Check what controls exist
        console.log('Map controls:', map._controls ? map._controls.length : 'null');
        if (map._controls) {
            for (var c = 0; c < map._controls.length; c++) {
                console.log('  Control', c, ':', map._controls[c].constructor.name);
            }
        }
        
        // Get layers from layer control
        if (layerControlObj) {
            console.log('Layer control object found');
            console.log('Layer control _layers:', layerControlObj._layers ? layerControlObj._layers.length : 'null');
            
            if (layerControlObj._layers && layerControlObj._layers.length > 0) {
                console.log('Found layer control with', layerControlObj._layers.length, 'layers');
                for (var i = 0; i < layerControlObj._layers.length; i++) {
                    var layerInfo = layerControlObj._layers[i];
                    console.log('Layer', i, ':', {
                        overlay: layerInfo.overlay,
                        name: layerInfo.name,
                        hasLayer: !!layerInfo.layer
                    });
                    if (layerInfo.overlay && layerInfo.name) {
                        var layerName = layerInfo.name.trim();
                        console.log('Processing layer:', layerName);
                        for (var j = 0; j < regions.length; j++) {
                            if (layerName.indexOf(regions[j]) === 0) {
                                if (!regionGroupLayers[regions[j]]) {
                                    regionGroupLayers[regions[j]] = layerInfo.layer;
                                    console.log('✓ Stored', regions[j], 'from layer control');
                                } else {
                                    console.log('  (Already stored:', regions[j], ')');
                                }
                                break;
                            }
                        }
                    }
                }
            } else {
                console.log('Layer control has no _layers array or it is empty');
            }
        } else {
            console.log('Layer control object not found in map._controls');
        }
        
        // Use coordinate matching to store region groups
        if (window.regionCoordinates) {
            console.log('Using coordinate matching to store region groups...');
            var mapLayerCount = 0;
            var allFeatureGroups = [];
            
            map.eachLayer(function(layer) {
                if (layer instanceof L.FeatureGroup) {
                    mapLayerCount++;
                    allFeatureGroups.push(layer);
                }
            });
            
            console.log('Found', mapLayerCount, 'FeatureGroups on map');
            
            // Match each region by checking coordinates
            for (var r = 0; r < regions.length; r++) {
                var region = regions[r];
                if (window.regionCoordinates[region]) {
                    var expectedCoord = window.regionCoordinates[region];
                    var expectedLat = expectedCoord[0];
                    var expectedLon = expectedCoord[1];
                    
                    // Find FeatureGroup containing marker at these coordinates
                    for (var i = 0; i < allFeatureGroups.length; i++) {
                        var fg = allFeatureGroups[i];
                        var foundMarker = false;
                        
                        fg.eachLayer(function(marker) {
                            if (marker instanceof L.Marker) {
                                var markerLat = marker.getLatLng().lat;
                                var markerLon = marker.getLatLng().lng;
                                if (Math.abs(markerLat - expectedLat) < 0.1 && Math.abs(markerLon - expectedLon) < 0.1) {
                                    foundMarker = true;
                                }
                            }
                        });
                        
                        if (foundMarker && !regionGroupLayers[region]) {
                            regionGroupLayers[region] = fg;
                            console.log('✓ Stored', region, 'by coordinate matching');
                            break;
                        }
                    }
                }
            }
        }
        
        console.log('Region groups stored:', Object.keys(regionGroupLayers));
        console.log('Total groups found:', Object.keys(regionGroupLayers).length);
        
        if (Object.keys(regionGroupLayers).length > 0) {
            console.log('✓ Region groups initialized successfully!');
        } else {
            console.log('Note: Region groups will be stored on first toggle');
        }
        
        // Add click handlers for park highlighting
        setupParkHighlighting(map);
    }, 2000);
});

// Function to setup park highlighting on click
function setupParkHighlighting(map) {
    if (!window.parkData || !map) return;
    
    var highlightedMarkers = [];
    var originalIcons = {};
    var clickedMarker = null;
    var currentPopup = null; // Track current open popup
    
    // Function to reset all highlights
    function resetHighlights() {
        // Reset clicked marker icon first (before clearing originalIcons)
        if (clickedMarker && originalIcons[clickedMarker._leaflet_id]) {
            clickedMarker.setIcon(originalIcons[clickedMarker._leaflet_id]);
        }
        
        highlightedMarkers.forEach(function(item) {
            // Remove circles or reset marker icons
            if (item instanceof L.CircleMarker) {
                map.removeLayer(item);
            } else if (item instanceof L.Marker && originalIcons[item._leaflet_id]) {
                item.setIcon(originalIcons[item._leaflet_id]);
            }
        });
        highlightedMarkers = [];
        originalIcons = {};
        clickedMarker = null;
        currentPopup = null;
    }
    
    // Function to highlight nearby parks and the clicked park
    function highlightNearbyParks(clickedPark, clickedLayer) {
        // Reset previous highlights
        resetHighlights();
        
        // Store the clicked marker
        clickedMarker = clickedLayer;
        
        // Highlight the clicked park with orange icon
        if (clickedLayer) {
            // Store original icon
            if (!originalIcons[clickedLayer._leaflet_id]) {
                originalIcons[clickedLayer._leaflet_id] = clickedLayer.options.icon;
            }
            
            // Create orange highlight icon for clicked park
            var orangeIcon = L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            });
            
            clickedLayer.setIcon(orangeIcon);
        }
        
        if (!clickedPark.nearby_parks || clickedPark.nearby_parks.length === 0) {
            return;
        }
        
        // Find and highlight nearby parks
        var nearbyParkNames = clickedPark.nearby_parks.map(function(p) { return p.name; });
        
        map.eachLayer(function(layer) {
            if (layer instanceof L.Marker) {
                var markerLat = layer.getLatLng().lat;
                var markerLon = layer.getLatLng().lng;
                
                // Check if this marker is a nearby park
                for (var i = 0; i < window.parkData.length; i++) {
                    var park = window.parkData[i];
                    if (Math.abs(park.lat - markerLat) < 0.01 && Math.abs(park.lon - markerLon) < 0.01) {
                        if (nearbyParkNames.indexOf(park.name) >= 0) {
                            // Store original icon
                            if (!originalIcons[layer._leaflet_id]) {
                                originalIcons[layer._leaflet_id] = layer.options.icon;
                            }
                            
                            // Create highlight using a blue circle marker overlay
                            // Add a blue circle around the marker to highlight it
                            var circle = L.circleMarker([markerLat, markerLon], {
                                radius: 25,
                                fillColor: '#3388ff',
                                color: '#0066cc',
                                weight: 3,
                                opacity: 0.8,
                                fillOpacity: 0.3
                            });
                            circle.addTo(map);
                            highlightedMarkers.push(circle);
                            break;
                        }
                    }
                }
            }
        });
        
        console.log('Highlighted clicked park and', highlightedMarkers.length, 'nearby parks');
    }
    
    // Add click event to all markers
    setTimeout(function() {
        map.eachLayer(function(layer) {
            if (layer instanceof L.Marker) {
                layer.on('click', function(e) {
                    var markerLat = e.latlng.lat;
                    var markerLon = e.latlng.lng;
                    var clickedLayer = e.target; // The marker layer that was clicked
                    
                    // Close any existing popup - but do it AFTER Leaflet processes the click
                    // This ensures the new popup can open first
                    setTimeout(function() {
                        // Close current popup if it's not the one being opened
                        if (currentPopup && currentPopup.isOpen()) {
                            var newPopup = clickedLayer.getPopup();
                            if (!newPopup || !newPopup.isOpen() || currentPopup !== newPopup) {
                                try {
                                    currentPopup.closePopup(true); // Force close
                                } catch(err) {
                                    console.log('Error closing currentPopup:', err);
                                }
                            }
                        }
                        
                        // Close any other open popups on the map (not the one being opened)
                        var newPopup = clickedLayer.getPopup();
                        map.eachLayer(function(layer) {
                            if (layer instanceof L.Marker) {
                                var popup = layer.getPopup();
                                if (popup && popup.isOpen() && popup !== newPopup) {
                                    try {
                                        popup.closePopup(true); // Force close
                                    } catch(err) {}
                                }
                            }
                        });
                        
                        // Also close any popup that's currently open via map (if not the new one)
                        var newPopup = clickedLayer.getPopup();
                        if (map._popup && map._popup.isOpen() && map._popup !== newPopup) {
                            try {
                                map._popup.closePopup(true); // Force close
                            } catch(err) {}
                        }
                    }, 50); // Delay to let Leaflet open the new popup first
                    
                    // Find the park data for this marker
                    for (var i = 0; i < window.parkData.length; i++) {
                        var park = window.parkData[i];
                        if (Math.abs(park.lat - markerLat) < 0.01 && Math.abs(park.lon - markerLon) < 0.01) {
                            highlightNearbyParks(park, clickedLayer);
                            
                            // Track the popup when it opens - wait a bit for popup to be created
                            setTimeout(function() {
                                var popup = clickedLayer.getPopup();
                                if (popup && popup.isOpen()) {
                                    currentPopup = popup;
                                    console.log('Tracking popup for highlights');
                                }
                            }, 100);
                            break;
                        }
                    }
                });
            }
        });
        
        // Listen for popup open/close events
        map.on('popupopen', function(e) {
            currentPopup = e.popup;
            console.log('Popup opened, setting z-index and keeping highlights');
            // Set high z-index to bring popup above other panels
            setTimeout(function() {
                if (e.popup._container) {
                    e.popup._container.style.zIndex = '99999';
                    e.popup._container.style.setProperty('z-index', '99999', 'important');
                    // Also set on the popup pane
                    var popupPane = e.popup._container.closest('.leaflet-popup-pane');
                    if (popupPane) {
                        popupPane.style.zIndex = '99999';
                        popupPane.style.setProperty('z-index', '99999', 'important');
                    }
                }
            }, 10);
        });
        
        map.on('popupclose', function(e) {
            console.log('Popup closed, resetting highlights');
            if (currentPopup === e.popup || !currentPopup || !currentPopup.isOpen()) {
                resetHighlights();
            }
        });
        
        // Don't reset highlights on map click - only reset when popup closes
        // Removed the map click handler that was resetting highlights
        
        console.log('Park highlighting setup complete');
    }, 3000);
}
</script>
"""
m.get_root().html.add_child(folium.Element(toggle_script))

# Add draggable popup functionality
draggable_popup_script = """
<script>
// Make popups draggable
function makePopupsDraggable() {
    // Function to make a popup draggable
    function makePopupDraggable(popup) {
        var popupContent = popup.getContent();
        if (!popupContent) {
            console.log('makePopupDraggable: No popup content');
            return;
        }
        
        var popupElement = popup._container;
        if (!popupElement) {
            console.log('makePopupDraggable: No popup container');
            return;
        }
        
        // Check if already made draggable - but allow retry if elements aren't found
        var alreadySetup = popupElement.hasAttribute('data-draggable-setup');
        
        var header = popupElement.querySelector('.popup-header');
        if (!header) {
            console.log('makePopupDraggable: Header not found, will retry');
            // Don't mark as setup if header isn't found yet
            if (!alreadySetup) {
                // Retry after a short delay
                setTimeout(function() {
                    makePopupDraggable(popup);
                }, 50);
            }
            return;
        }
        
        // Check if close button and drag handlers are already set up
        var closeBtn = popupElement.querySelector('.popup-close-btn');
        var hasCloseHandler = closeBtn && closeBtn.hasAttribute('data-close-handler');
        var hasDragHandler = header.hasAttribute('data-drag-handler');
        
        // Always proceed with setup - even if partially set up, ensure everything is working
        // This is especially important for the first popup
        if (alreadySetup && hasCloseHandler && hasDragHandler) {
            console.log('makePopupDraggable: Popup appears set up, but re-checking handlers');
            // Don't return - continue to ensure handlers are properly attached
        }
        
        // Mark as setup
        if (!alreadySetup) {
            popupElement.setAttribute('data-draggable-setup', 'true');
            console.log('makePopupDraggable: Setting up popup for the first time');
        } else {
            console.log('makePopupDraggable: Re-setting up popup elements (may be first popup)');
        }
        
        var isDragging = false;
        var hasBeenDragged = false;
        var startX, startY, initialX, initialY;
        
        // Get popup pane position
        var popupPane = popup._container.closest('.leaflet-popup-pane');
        if (!popupPane) return;
        
        // Set high z-index immediately and ensure it stays high
        popupElement.style.zIndex = '99999';
        popupElement.style.setProperty('z-index', '99999', 'important');
        if (popupPane) {
            popupPane.style.zIndex = '99999';
            popupPane.style.setProperty('z-index', '99999', 'important');
        }
        
        // Prevent Leaflet from closing popup on map click
        popup.options.closeOnClick = false;
        popup.options.autoClose = false;
        
        // Override Leaflet's closePopup to prevent closing during drag
        if (!popup._originalClosePopup) {
            popup._originalClosePopup = popup.closePopup;
        }
        // Store reference to isDragging in popup for closePopup to access
        popup._isDragging = false;
        popup._allowClose = true; // Allow closing by default
        popup._forceClose = false; // Flag for forced closes
        popup.closePopup = function(forceClose) {
            // Allow forced closes (from marker clicks)
            if (forceClose === true) {
                this._forceClose = true;
                this._isDragging = false;
                this._allowClose = true;
            }
            
            // Don't close if we're currently dragging (unless forced)
            if (this._isDragging && !this._forceClose) {
                return;
            }
            
            // Always allow closing - the X button and explicit close calls should work
            if (this._originalClosePopup) {
                this._originalClosePopup.call(this);
            } else {
                // Fallback: use map's closePopup
                if (this._map) {
                    this._map.closePopup(this);
                } else {
                    // Last resort: remove from DOM
                    if (this._container && this._container.parentNode) {
                        this._container.parentNode.removeChild(this._container);
                    }
                }
            }
            
            // Reset force flag
            this._forceClose = false;
        };
        
        // Mark popup as draggable
        popupElement.setAttribute('data-draggable', 'true');
        
        // Add close button handler - use multiple methods to ensure it works
        var closeBtn = popupElement.querySelector('.popup-close-btn');
        if (closeBtn) {
            // Always set up handler - even if it appears set up, ensure it's working
            // This is critical for the first popup
            var needsSetup = !closeBtn.hasAttribute('data-close-handler');
            if (needsSetup) {
                // Remove any existing handlers by cloning
                var newCloseBtn = closeBtn.cloneNode(true);
                closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
                closeBtn = newCloseBtn;
                
                closeBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    
                    // Force close - try multiple methods
                    popup._isDragging = false;
                    popup._allowClose = true;
                    
                    // Method 1: Use map's closePopup
                    if (popup._map && popup._map.closePopup) {
                        try {
                            popup._map.closePopup(popup);
                            return;
                        } catch(err) {}
                    }
                    
                    // Method 2: Use original closePopup
                    if (popup._originalClosePopup) {
                        try {
                            popup._originalClosePopup.call(popup);
                            return;
                        } catch(err) {}
                    }
                    
                    // Method 3: Remove from DOM directly
                    if (popupElement && popupElement.parentNode) {
                        popupElement.parentNode.removeChild(popupElement);
                    }
                    
                    // Method 4: Hide the popup
                    if (popupElement) {
                        popupElement.style.display = 'none';
                    }
                }, true);
                
                // Also add mouseup handler as backup
                closeBtn.addEventListener('mouseup', function(e) {
                    e.stopPropagation();
                    e.preventDefault();
                    e.stopImmediatePropagation();
                }, true);
                
                // Mark close button as having handler
                closeBtn.setAttribute('data-close-handler', 'true');
                console.log('Close button handler set up');
            } else {
                // Even if marked as set up, verify it's working by checking if it has event listeners
                // For first popup, we want to ensure it's really working
                console.log('Close button marked as set up, but ensuring it works');
                // Re-setup to be safe (clone and re-add handler)
                var newCloseBtn = closeBtn.cloneNode(true);
                closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
                closeBtn = newCloseBtn;
                
                closeBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    popup._isDragging = false;
                    popup._allowClose = true;
                    if (popup._map && popup._map.closePopup) {
                        popup._map.closePopup(popup);
                    } else if (popup._originalClosePopup) {
                        popup._originalClosePopup.call(popup);
                    }
                }, true);
                closeBtn.setAttribute('data-close-handler', 'true');
            }
        } else {
            console.log('Close button not found!');
        }
        
        // Store references on popup element for persistence
        popupElement._dragHeader = header;
        popupElement._dragPopup = popup;
        popupElement._dragPopupElement = popupElement;
        
        // Create dragStart function that finds elements dynamically
        function dragStart(e) {
            // Get references dynamically
            var currentHeader = popupElement.querySelector('.popup-header') || popupElement._dragHeader;
            if (!currentHeader) {
                console.log('dragStart: Header not found');
                return;
            }
            // Don't drag if clicking close button or links
            if (e.target.classList.contains('popup-close-btn') || 
                e.target.closest('.popup-close-btn') ||
                e.target.tagName === 'A' || 
                e.target.closest('a')) {
                return;
            }
            
            // Check if clicking on header or its children
            var clickedOnHeader = (e.target === currentHeader || currentHeader.contains(e.target));
            if (!clickedOnHeader) {
                return;
            }
            
            console.log('dragStart: Starting drag on header');
            
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            isDragging = true;
            hasBeenDragged = false;
            popup._isDragging = true; // Set flag to prevent closing
            currentHeader.style.cursor = 'grabbing';
            popupElement.style.cursor = 'grabbing';
            
            // Prevent Leaflet from closing the popup
            if (popup._source) {
                popup._source._popup = popup;
            }
            
            // Disable Leaflet's popup positioning and prevent closing
            popup._updatePosition = function() {};
            popup.options.closeOnClick = false;
            popup.options.autoClose = false;
            
            // Prevent popup from being removed during drag
            if (!popup._originalRemove) {
                popup._originalRemove = popup.remove;
            }
            popup.remove = function() {
                if (!isDragging) {
                    if (popup._originalRemove) {
                        popup._originalRemove.call(this);
                    }
                }
            };
            
            // Get initial mouse position
            startX = e.clientX || e.pageX;
            startY = e.clientY || e.pageY;
            
            // Get initial popup position
            var rect = popupElement.getBoundingClientRect();
            initialX = rect.left;
            initialY = rect.top;
            
            // Remove any existing listeners first to avoid duplicates
            document.removeEventListener('mousemove', drag, true);
            document.removeEventListener('mouseup', dragEnd, true);
            document.removeEventListener('click', preventClick, true);
            
            // Add global event listeners with capture to catch events first
            document.addEventListener('mousemove', drag, true);
            document.addEventListener('mouseup', dragEnd, true);
            document.addEventListener('click', preventClick, true);
            
            // Prevent map click from closing popup during drag
            if (popup._map) {
                popup._map.dragging.disable();
            }
            
            console.log('Drag started');
        }
        
        // Now add the drag handlers to header - ensure they're added
        // Remove any existing handlers first by checking if they exist
        if (header._dragStartHandler) {
            header.removeEventListener('mousedown', header._dragStartHandler, true);
            header.removeEventListener('mousedown', header._dragStartHandler, false);
        }
        
        header.addEventListener('mousedown', dragStart, true);
        header.addEventListener('mousedown', dragStart, false);
        header._dragStartHandler = dragStart; // Store reference
        header.setAttribute('data-drag-handler', 'true');
        console.log('Drag handler set up on header - header found:', !!header, 'header text:', header.textContent.substring(0, 50));
        
        // Also make the entire popup element draggable when clicking on header
        var popupMousedownHandler = function(e) {
            // Only start drag if clicking on header area
            var currentHeader = popupElement.querySelector('.popup-header');
            if (currentHeader && currentHeader.contains(e.target) && !e.target.classList.contains('popup-close-btn') && !e.target.closest('.popup-close-btn')) {
                dragStart(e);
            }
        };
        
        // Remove old listener if it exists
        if (popupElement._dragMousedownHandler) {
            popupElement.removeEventListener('mousedown', popupElement._dragMousedownHandler, true);
        }
        popupElement.addEventListener('mousedown', popupMousedownHandler, true);
        popupElement._dragMousedownHandler = popupMousedownHandler; // Store reference
        
        function preventClick(e) {
            if (isDragging) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                return false;
            }
        }
        
        function drag(e) {
            if (!isDragging) return;
            
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            // Calculate new position
            var deltaX = e.clientX - startX;
            var deltaY = e.clientY - startY;
            
            // Only move if there's significant movement (prevents accidental drags)
            if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
                hasBeenDragged = true;
                popupElement.setAttribute('data-has-been-dragged', 'true');
            }
            
            var newX = initialX + deltaX;
            var newY = initialY + deltaY;
            
            // Completely override Leaflet's positioning
            popup._updatePosition = function() {}; // Disable Leaflet's position updates
            
            // Update popup position using fixed positioning
            popupElement.style.left = newX + 'px';
            popupElement.style.top = newY + 'px';
            popupElement.style.transform = 'none';
            popupElement.style.position = 'fixed';
            popupElement.style.margin = '0';
            popupElement.style.zIndex = '99999';
            popupElement.style.setProperty('z-index', '99999', 'important');
            
            // Hide popup tip
            var tip = popupElement.querySelector('.leaflet-popup-tip');
            if (tip) {
                tip.style.display = 'none';
            }
            
            // Prevent Leaflet from closing popup - override all close methods
            popup.options.closeOnClick = false;
            popup.options.autoClose = false;
            
            // Prevent map from processing this event
            if (popup._map) {
                popup._map.dragging.disable();
            }
        }
        
        function dragEnd(e) {
            if (!isDragging) return;
            
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            isDragging = false;
            popup._isDragging = false; // Clear flag to allow closing
            
            // Find header dynamically
            var currentHeader = popupElement.querySelector('.popup-header') || popupElement._dragHeader;
            if (currentHeader) {
                currentHeader.style.cursor = 'move';
            }
            popupElement.style.cursor = 'default';
            
            // Restore remove function
            if (popup._originalRemove) {
                popup.remove = popup._originalRemove;
                delete popup._originalRemove;
            }
            
            // Re-enable map dragging
            if (popup._map) {
                popup._map.dragging.enable();
                
                // If popup was dragged, prevent map clicks from closing it
                if (hasBeenDragged) {
                    popup.options.closeOnClick = false;
                    popup.options.autoClose = false;
                    
                    // Prevent map click from closing this popup
                    var mapClickHandler = function(clickEvent) {
                        // Check if click is outside the popup
                        if (!popupElement.contains(clickEvent.originalEvent.target)) {
                            clickEvent.originalEvent.stopPropagation();
                            clickEvent.originalEvent.preventDefault();
                        }
                    };
                    
                    // Store handler for cleanup
                    popupElement._mapClickHandler = mapClickHandler;
                    popup._map.on('click', mapClickHandler, popup);
                }
            }
            
            // Remove global event listeners
            document.removeEventListener('mousemove', drag, true);
            document.removeEventListener('mouseup', dragEnd, true);
            document.removeEventListener('click', preventClick, true);
            
            // Small delay to prevent immediate click event
            setTimeout(function() {
                // Restore update position function but make it no-op
                if (popup._updatePosition) {
                    popup._updatePosition = function() {};
                }
            }, 100);
        }
    }
    
    // Make existing popups draggable
    setTimeout(function() {
        // Try to get map using the getMap function if available
        var map = null;
        if (typeof getMap === 'function') {
            map = getMap();
        }
        
        // If not available, try other methods
        if (!map) {
            var container = document.querySelector('.leaflet-container');
            if (container && container._leaflet_id) {
                var id = container._leaflet_id;
                if (window[id]) {
                    map = window[id];
                }
            }
        }
        
        if (!map) {
            var container = document.querySelector('.leaflet-container');
            for (var key in window) {
                try {
                    var obj = window[key];
                    if (obj && obj._container === container && obj.eachLayer) {
                        map = obj;
                        break;
                    }
                } catch(e) {}
            }
        }
        
        if (map) {
            // Intercept map clicks to prevent closing popups that shouldn't be closed
            map.on('click', function(e) {
                // Check if click is on a popup - if so, don't close it
                var clickedElement = e.originalEvent.target;
                if (clickedElement && clickedElement.closest('.leaflet-popup')) {
                    e.originalEvent.stopPropagation();
                    return;
                }
                
                // Check all open popups and prevent closing if closeOnClick is false
                map.eachLayer(function(layer) {
                    if (layer instanceof L.Marker) {
                        var popup = layer.getPopup();
                        if (popup && popup.isOpen() && !popup.options.closeOnClick) {
                            // Prevent this popup from closing
                            e.originalEvent.stopPropagation();
                        }
                    }
                });
            }, true); // Use capture phase
            
            // Listen for popup opens - set up immediately
            map.on('popupopen', function(e) {
                console.log('Popup opened, setting up draggable functionality');
                
                // Prevent closing on map click - set this immediately and keep it false
                e.popup.options.closeOnClick = false;
                e.popup.options.autoClose = false;
                
                // Set high z-index immediately to bring above other panels
                function setZIndex() {
                    if (e.popup._container) {
                        e.popup._container.style.zIndex = '99999';
                        e.popup._container.style.setProperty('z-index', '99999', 'important');
                        // Force z-index on popup pane as well
                        var popupPane = e.popup._container.closest('.leaflet-popup-pane');
                        if (popupPane) {
                            popupPane.style.zIndex = '99999';
                            popupPane.style.setProperty('z-index', '99999', 'important');
                        }
                    }
                }
                
                // Set z-index immediately and repeatedly
                setZIndex();
                setTimeout(setZIndex, 1);
                setTimeout(setZIndex, 5);
                setTimeout(setZIndex, 10);
                setTimeout(setZIndex, 50);
                setTimeout(setZIndex, 100);
                
                // Disable Leaflet's position updates
                if (e.popup._updatePosition) {
                    e.popup._updatePosition = function() {};
                }
                
                // Use requestAnimationFrame for immediate setup (catches first frame)
                requestAnimationFrame(function() {
                    console.log('Setting up draggable popup - requestAnimationFrame');
                    makePopupDraggable(e.popup);
                    setZIndex();
                });
                
                // Set up draggable immediately - try multiple times aggressively
                // Try immediately (0ms)
                console.log('Setting up draggable popup - attempt 1 (immediate)');
                makePopupDraggable(e.popup);
                
                // Try with very short delays to ensure DOM is ready
                setTimeout(function() {
                    console.log('Setting up draggable popup - attempt 2 (1ms)');
                    makePopupDraggable(e.popup);
                    setZIndex();
                }, 1);
                
                setTimeout(function() {
                    console.log('Setting up draggable popup - attempt 3 (5ms)');
                    makePopupDraggable(e.popup);
                    setZIndex();
                }, 5);
                
                setTimeout(function() {
                    console.log('Setting up draggable popup - attempt 4 (10ms)');
                    makePopupDraggable(e.popup);
                    setZIndex();
                }, 10);
                
                setTimeout(function() {
                    console.log('Setting up draggable popup - attempt 5 (25ms)');
                    makePopupDraggable(e.popup);
                    setZIndex();
                }, 25);
                
                setTimeout(function() {
                    console.log('Setting up draggable popup - attempt 6 (50ms)');
                    makePopupDraggable(e.popup);
                    setZIndex();
                }, 50);
                
                setTimeout(function() {
                    console.log('Setting up draggable popup - attempt 7 (100ms)');
                    makePopupDraggable(e.popup);
                    setZIndex();
                }, 100);
                
                setTimeout(function() {
                    console.log('Setting up draggable popup - attempt 8 (200ms)');
                    makePopupDraggable(e.popup);
                    setZIndex();
                }, 200);
                
                // Also use MutationObserver to catch when DOM is ready
                if (e.popup._container) {
                    var observer = new MutationObserver(function(mutations) {
                        console.log('MutationObserver: DOM changed, setting up popup');
                        makePopupDraggable(e.popup);
                        setZIndex();
                        observer.disconnect(); // Stop observing after first change
                    });
                    observer.observe(e.popup._container, { childList: true, subtree: true });
                    // Disconnect after 500ms to avoid memory leaks
                    setTimeout(function() {
                        observer.disconnect();
                    }, 500);
                }
            });
            
            // Make any existing popups draggable
            var popups = document.querySelectorAll('.leaflet-popup');
            popups.forEach(function(popupEl) {
                // Try to find popup object from the element
                var popup = popupEl._leaflet_popup;
                if (popup) {
                    makePopupDraggable(popup);
                    setTimeout(function() {
                        makePopupDraggable(popup);
                    }, 10);
                }
            });
        }
    }, 1000);
}

// Initialize draggable popups when page loads
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(makePopupsDraggable, 2000);
});

// Also try after map is fully loaded
window.addEventListener('load', function() {
    setTimeout(makePopupsDraggable, 3000);
});
</script>
"""
m.get_root().html.add_child(folium.Element(draggable_popup_script))

# Save the map
output_path = '/Users/srivaranasi/Library/CloudStorage/GoogleDrive-pvsvnc04@gmail.com/My Drive/PVSVNC_Documents/Sri/Sri_Gigs/US national parks/US_National_Parks_Interactive_Map.html'
m.save(output_path)

print(f"\n{'='*80}")
print(f"✅ Enhanced interactive map created successfully!")
print(f"📁 File saved to: {output_path}")
print(f"📍 Total parks mapped: {park_count}")
print(f"\n🆕 New Features Added:")
print(f"   ✅ Regional filtering (West, Midwest, South, Northeast, Alaska, Hawaii)")
print(f"   ✅ Heat map showing park density")
print(f"   ✅ Statistics panel with park counts by region and state")
print(f"   ✅ Mini map for navigation")
print(f"   ✅ Mouse position coordinates display")
print(f"   ✅ Enhanced layer controls")
print(f"\n💡 Existing Features:")
print(f"   - Hover over markers to see park names in tooltips")
print(f"   - Click markers for detailed information")
print(f"   - Switch between different map styles")
print(f"   - Use fullscreen mode for better viewing")
print(f"   - Measure distances between parks")
print(f"   - Draw and export custom areas")
print(f"\n🌐 Open the HTML file in your web browser to view the enhanced map!")
print(f"{'='*80}")
