import csv
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from collections import Counter
import re

# Read the CSV file
csv_path = '/Users/srivaranasi/Library/CloudStorage/GoogleDrive-pvsvnc04@gmail.com/My Drive/PVSVNC_Documents/Sri/Sri_Gigs/US  Light houses/US_National_Parks.csv'

parks_data = []
with open(csv_path, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        parks_data.append(row)

print(f"Loaded {len(parks_data)} National Parks")

# Process states - some parks span multiple states
state_counts = Counter()
for park in parks_data:
    states = park.get('States', '')
    if states:
        # Split by comma and clean up
        state_list = [s.strip() for s in states.split(',')]
        for state in state_list:
            state_counts[state] += 1

# Extract coordinates
latitudes = []
longitudes = []
names = []
for park in parks_data:
    try:
        lat = float(park.get('Latitude', 0))
        lon = float(park.get('Longitude', 0))
        if lat != 0 and lon != 0:
            latitudes.append(lat)
            longitudes.append(lon)
            names.append(park.get('Name', 'Unknown'))
    except (ValueError, TypeError):
        continue

# Create figure with multiple subplots
fig = plt.figure(figsize=(16, 12))
fig.suptitle('US National Parks Data Visualization', fontsize=16, fontweight='bold')

# 1. Map of National Parks (scatter plot)
ax1 = plt.subplot(2, 2, 1)
ax1.scatter(longitudes, latitudes, alpha=0.6, s=100, c='green', edgecolors='darkgreen', linewidth=1.5)
ax1.set_xlabel('Longitude', fontsize=10)
ax1.set_ylabel('Latitude', fontsize=10)
ax1.set_title('Geographic Distribution of National Parks', fontsize=12, fontweight='bold')
ax1.grid(True, alpha=0.3)
ax1.set_facecolor('#f0f0f0')

# Add some labels for major parks
for i, name in enumerate(names):
    if i < 10:  # Label first 10 to avoid clutter
        ax1.annotate(name[:20] + '...' if len(name) > 20 else name, 
                    (longitudes[i], latitudes[i]), 
                    fontsize=7, alpha=0.7, rotation=45)

# 2. Parks by State (bar chart)
ax2 = plt.subplot(2, 2, 2)
sorted_states = sorted(state_counts.items(), key=lambda x: x[1], reverse=True)
top_states = sorted_states[:15]  # Top 15 states
states_list = [s[0] for s in top_states]
counts_list = [s[1] for s in top_states]

bars = ax2.barh(states_list, counts_list, color='steelblue', edgecolor='navy', linewidth=1.2)
ax2.set_xlabel('Number of National Parks', fontsize=10)
ax2.set_ylabel('State', fontsize=10)
ax2.set_title('Top 15 States by Number of National Parks', fontsize=12, fontweight='bold')
ax2.grid(True, alpha=0.3, axis='x')
ax2.set_facecolor('#f0f0f0')

# Add value labels on bars
for i, (bar, count) in enumerate(zip(bars, counts_list)):
    ax2.text(count + 0.1, i, str(count), va='center', fontsize=9, fontweight='bold')

# 3. Geographic regions (by longitude)
ax3 = plt.subplot(2, 2, 3)
# Categorize by longitude regions
east = [lon for lon in longitudes if lon < -100]
central = [lon for lon in longitudes if -100 <= lon < -110]
west = [lon for lon in longitudes if lon >= -110]
alaska = [lon for lon in longitudes if lon < -130]  # Alaska parks
hawaii = [lon for lon in longitudes if -160 < lon < -155]  # Hawaii parks

regions = ['East\n(< -100°)', 'Central\n(-100° to -110°)', 'West\n(> -110°)']
region_counts = [len(east), len(central), len(west)]
colors = ['#ff6b6b', '#4ecdc4', '#45b7d1']

bars3 = ax3.bar(regions, region_counts, color=colors, edgecolor='black', linewidth=1.5, alpha=0.8)
ax3.set_ylabel('Number of Parks', fontsize=10)
ax3.set_title('Parks by Geographic Region (Longitude)', fontsize=12, fontweight='bold')
ax3.grid(True, alpha=0.3, axis='y')
ax3.set_facecolor('#f0f0f0')

# Add value labels
for bar, count in zip(bars3, region_counts):
    height = bar.get_height()
    ax3.text(bar.get_x() + bar.get_width()/2., height + 0.5,
             f'{count}', ha='center', va='bottom', fontsize=11, fontweight='bold')

# 4. Latitude distribution (histogram)
ax4 = plt.subplot(2, 2, 4)
ax4.hist(latitudes, bins=15, color='orange', edgecolor='darkorange', linewidth=1.5, alpha=0.7)
ax4.set_xlabel('Latitude', fontsize=10)
ax4.set_ylabel('Number of Parks', fontsize=10)
ax4.set_title('Distribution of Parks by Latitude', fontsize=12, fontweight='bold')
ax4.grid(True, alpha=0.3, axis='y')
ax4.set_facecolor('#f0f0f0')

# Add vertical lines for reference
ax4.axvline(x=25, color='red', linestyle='--', alpha=0.5, label='Tropic of Cancer')
ax4.axvline(x=49, color='blue', linestyle='--', alpha=0.5, label='US-Canada Border')
ax4.legend(fontsize=8)

plt.tight_layout()

# Save the figure
output_path = '/Users/srivaranasi/Library/CloudStorage/GoogleDrive-pvsvnc04@gmail.com/My Drive/PVSVNC_Documents/Sri/Sri_Gigs/US  Light houses/national_parks_visualization.png'
plt.savefig(output_path, dpi=300, bbox_inches='tight')
print(f"\nVisualization saved to: {output_path}")

# Print summary statistics
print("\n" + "="*80)
print("SUMMARY STATISTICS")
print("="*80)
print(f"Total National Parks: {len(parks_data)}")
print(f"Parks with valid coordinates: {len(latitudes)}")
print(f"\nTop 5 States by Number of Parks:")
for state, count in sorted_states[:5]:
    print(f"  {state}: {count} parks")
print(f"\nGeographic Spread:")
print(f"  Northernmost: {max(latitudes):.2f}°N")
print(f"  Southernmost: {min(latitudes):.2f}°N")
print(f"  Easternmost: {max(longitudes):.2f}°W")
print(f"  Westernmost: {min(longitudes):.2f}°W")
print("="*80)

plt.show()

