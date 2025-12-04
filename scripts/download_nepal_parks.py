import csv

def get_nepal_parks():
    """
    Create Nepal National Parks and Protected Areas CSV data
    """
    
    nepal_parks = [
        # Note: Chitwan (CHI) and Sagarmatha (SAG) are in UNESCO CSV, removed from here
        {
            'Park_Code': 'BAR',
            'Name': 'Bardiya National Park',
            'Designation': 'National Park',
            'States': 'Bardiya',
            'Latitude': '28.3667',
            'Longitude': '81.3000',
            'Description': 'Bardiya National Park - Largest and most undisturbed national park in Nepal.',
            'URL': 'https://en.wikipedia.org/wiki/Bardiya_National_Park',
            'Country': 'Nepal'
        },
        {
            'Park_Code': 'LAN',
            'Name': 'Langtang National Park',
            'Designation': 'National Park',
            'States': 'Rasuwa, Nuwakot, Sindhupalchok',
            'Latitude': '28.2167',
            'Longitude': '85.5167',
            'Description': 'Langtang National Park - First Himalayan national park in Nepal.',
            'URL': 'https://en.wikipedia.org/wiki/Langtang_National_Park',
            'Country': 'Nepal'
        },
        {
            'Park_Code': 'SHI',
            'Name': 'Shivapuri Nagarjun National Park',
            'Designation': 'National Park',
            'States': 'Kathmandu, Nuwakot, Sindhupalchok',
            'Latitude': '27.8000',
            'Longitude': '85.3667',
            'Description': 'Shivapuri Nagarjun National Park - Protected area near Kathmandu.',
            'URL': 'https://en.wikipedia.org/wiki/Shivapuri_Nagarjun_National_Park',
            'Country': 'Nepal'
        },
        {
            'Park_Code': 'MAK',
            'Name': 'Makalu Barun National Park',
            'Designation': 'National Park',
            'States': 'Sankhuwasabha, Solukhumbu',
            'Latitude': '27.7500',
            'Longitude': '87.0833',
            'Description': 'Makalu Barun National Park - Home to Mount Makalu, fifth highest mountain.',
            'URL': 'https://en.wikipedia.org/wiki/Makalu_Barun_National_Park',
            'Country': 'Nepal'
        },
        {
            'Park_Code': 'SHI',
            'Name': 'Shey Phoksundo National Park',
            'Designation': 'National Park',
            'States': 'Dolpa, Mugu',
            'Latitude': '29.2167',
            'Longitude': '82.9500',
            'Description': 'Shey Phoksundo National Park - Largest national park in Nepal.',
            'URL': 'https://en.wikipedia.org/wiki/Shey_Phoksundo_National_Park',
            'Country': 'Nepal'
        },
        {
            'Park_Code': 'RAR',
            'Name': 'Rara National Park',
            'Designation': 'National Park',
            'States': 'Mugu, Jumla',
            'Latitude': '29.5167',
            'Longitude': '82.0833',
            'Description': 'Rara National Park - Smallest national park in Nepal, home to Rara Lake.',
            'URL': 'https://en.wikipedia.org/wiki/Rara_National_Park',
            'Country': 'Nepal'
        },
        {
            'Park_Code': 'KHA',
            'Name': 'Khaptad National Park',
            'Designation': 'National Park',
            'States': 'Bajhang, Bajura, Achham, Doti',
            'Latitude': '29.2833',
            'Longitude': '81.1833',
            'Description': 'Khaptad National Park - Protected area in far-western Nepal.',
            'URL': 'https://en.wikipedia.org/wiki/Khaptad_National_Park',
            'Country': 'Nepal'
        },
        {
            'Park_Code': 'BAN',
            'Name': 'Banke National Park',
            'Designation': 'National Park',
            'States': 'Banke, Dang',
            'Latitude': '28.0833',
            'Longitude': '81.6167',
            'Description': 'Banke National Park - Tiger conservation area.',
            'URL': 'https://en.wikipedia.org/wiki/Banke_National_Park',
            'Country': 'Nepal'
        }
    ]
    
    return nepal_parks

def save_nepal_csv(data, filename):
    """Save Nepal parks data to CSV file"""
    if not data:
        print("No data to save")
        return
    
    fieldnames = ['Park_Code', 'Name', 'Designation', 'States', 'Latitude', 'Longitude', 'Description', 'URL', 'Country']
    
    with open(filename, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(data)
    
    print(f"Saved {len(data)} Nepal parks to {filename}")

if __name__ == '__main__':
    print("Creating Nepal National Parks data...")
    
    parks_data = get_nepal_parks()
    
    import os
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    data_dir = os.path.join(project_root, 'public', 'data')
    
    os.makedirs(data_dir, exist_ok=True)
    
    output_file = os.path.join(data_dir, 'Nepal_National_Parks.csv')
    save_nepal_csv(parks_data, output_file)
    
    print(f"✅ Successfully created {output_file}")

