import csv

def get_nepal_unesco_sites():
    """
    Create Nepal UNESCO World Heritage Sites CSV data
    Nepal has 4 UNESCO World Heritage Sites (2 cultural, 2 natural)
    """
    
    unesco_sites = [
        # Cultural Sites
        {
            'Park_Code': 'KAT',
            'Name': 'Kathmandu Valley',
            'Designation': 'UNESCO World Heritage Site (Cultural)',
            'States': 'Kathmandu, Lalitpur, Bhaktapur',
            'Latitude': '27.7172',
            'Longitude': '85.3240',
            'Description': 'Kathmandu Valley - UNESCO World Heritage Site. Includes seven monument zones: the Durbar Squares of Hanuman Dhoka (Kathmandu), Patan and Bhaktapur, the Buddhist stupas of Swayambhunath and Boudhanath, and the Hindu temples of Pashupatinath and Changu Narayan.',
            'URL': 'https://whc.unesco.org/en/list/121',
            'Country': 'Nepal',
            'UNESCO_Year': '1979'
        },
        {
            'Park_Code': 'LUM',
            'Name': 'Lumbini, the Birthplace of the Lord Buddha',
            'Designation': 'UNESCO World Heritage Site (Cultural)',
            'States': 'Rupandehi',
            'Latitude': '27.4833',
            'Longitude': '83.2833',
            'Description': 'Lumbini, the Birthplace of the Lord Buddha - UNESCO World Heritage Site. Sacred site where Siddhartha Gautama (Lord Buddha) was born in 623 BCE. Features the Mayadevi Temple, Ashoka Pillar, and numerous monasteries.',
            'URL': 'https://whc.unesco.org/en/list/666',
            'Country': 'Nepal',
            'UNESCO_Year': '1997'
        },
        # Natural Sites
        {
            'Park_Code': 'CHI',
            'Name': 'Chitwan National Park',
            'Designation': 'UNESCO World Heritage Site (Natural)',
            'States': 'Chitwan, Nawalpur, Parsa, Makwanpur',
            'Latitude': '27.5000',
            'Longitude': '84.3333',
            'Description': 'Chitwan National Park - UNESCO World Heritage Site. Home to one-horned rhinoceroses, Bengal tigers, and over 500 bird species. One of the last remaining undisturbed vestiges of the Terai region.',
            'URL': 'https://whc.unesco.org/en/list/284',
            'Country': 'Nepal',
            'UNESCO_Year': '1984'
        },
        {
            'Park_Code': 'SAG',
            'Name': 'Sagarmatha National Park',
            'Designation': 'UNESCO World Heritage Site (Natural)',
            'States': 'Solukhumbu',
            'Latitude': '27.9881',
            'Longitude': '86.9250',
            'Description': 'Sagarmatha National Park - UNESCO World Heritage Site. Encompasses Mount Everest and surrounding peaks. Home to rare species like snow leopard, red panda, and Himalayan tahr.',
            'URL': 'https://whc.unesco.org/en/list/120',
            'Country': 'Nepal',
            'UNESCO_Year': '1979'
        }
    ]
    
    return unesco_sites

def save_nepal_unesco_csv(data, filename):
    """Save Nepal UNESCO sites data to CSV file"""
    if not data:
        print("No data to save")
        return
    
    fieldnames = ['Park_Code', 'Name', 'Designation', 'States', 'Latitude', 'Longitude', 'Description', 'URL', 'Country', 'UNESCO_Year']
    
    with open(filename, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(data)
    
    print(f"Saved {len(data)} Nepal UNESCO sites to {filename}")

if __name__ == '__main__':
    print("Creating Nepal UNESCO World Heritage Sites data...")
    
    unesco_data = get_nepal_unesco_sites()
    
    import os
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    data_dir = os.path.join(project_root, 'public', 'data')
    
    os.makedirs(data_dir, exist_ok=True)
    
    output_file = os.path.join(data_dir, 'Nepal_UNESCO_Sites.csv')
    save_nepal_unesco_csv(unesco_data, output_file)
    
    print(f"✅ Successfully created {output_file}")

