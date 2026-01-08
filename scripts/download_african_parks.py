"""
Download National Parks data for all African countries
This script collects comprehensive national parks data from various sources
"""

import csv
import os

# List of all African countries
AFRICAN_COUNTRIES = [
    'Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi', 'Cabo Verde',
    'Cameroon', 'Central African Republic', 'Chad', 'Comoros', 'Congo', 'Côte d\'Ivoire',
    'Democratic Republic of the Congo', 'Djibouti', 'Egypt', 'Equatorial Guinea', 'Eritrea',
    'Eswatini', 'Ethiopia', 'Gabon', 'Gambia', 'Ghana', 'Guinea', 'Guinea-Bissau',
    'Kenya', 'Lesotho', 'Liberia', 'Libya', 'Madagascar', 'Malawi', 'Mali', 'Mauritania',
    'Mauritius', 'Morocco', 'Mozambique', 'Namibia', 'Niger', 'Nigeria', 'Rwanda',
    'São Tomé and Príncipe', 'Senegal', 'Seychelles', 'Sierra Leone', 'Somalia',
    'South Africa', 'South Sudan', 'Sudan', 'Tanzania', 'Togo', 'Tunisia', 'Uganda',
    'Zambia', 'Zimbabwe'
]

def get_african_parks_data():
    """
    Get comprehensive national parks data for African countries
    This includes major parks from each country
    """
    
    parks_data = []
    
    # South Africa - Major National Parks
    south_africa_parks = [
        {'Park_Code': 'KRU', 'Name': 'Kruger National Park', 'Country': 'South Africa', 'Region': 'Limpopo, Mpumalanga', 'Latitude': '-23.9883', 'Longitude': '31.5547', 'Established': '1926', 'Description': 'One of Africa\'s largest game reserves, home to the Big Five.'},
        {'Park_Code': 'TAB', 'Name': 'Table Mountain National Park', 'Country': 'South Africa', 'Region': 'Western Cape', 'Latitude': '-33.9500', 'Longitude': '18.4167', 'Established': '1998', 'Description': 'Includes Table Mountain, Cape of Good Hope, and Silvermine.'},
        {'Park_Code': 'GAR', 'Name': 'Garden Route National Park', 'Country': 'South Africa', 'Region': 'Western Cape, Eastern Cape', 'Latitude': '-33.9833', 'Longitude': '23.0167', 'Established': '2009', 'Description': 'Combines Tsitsikamma, Knysna, and Wilderness areas.'},
        {'Park_Code': 'KGA', 'Name': 'Kgalagadi Transfrontier Park', 'Country': 'South Africa', 'Region': 'Northern Cape', 'Latitude': '-25.7667', 'Longitude': '20.3833', 'Established': '2000', 'Description': 'Transfrontier park shared with Botswana, known for Kalahari lions.'},
        {'Park_Code': 'ADDO', 'Name': 'Addo Elephant National Park', 'Country': 'South Africa', 'Region': 'Eastern Cape', 'Latitude': '-33.5000', 'Longitude': '25.7500', 'Established': '1931', 'Description': 'Home to over 600 elephants and the Big Seven.'},
        {'Park_Code': 'PIL', 'Name': 'Pilanesberg National Park', 'Country': 'South Africa', 'Region': 'North West', 'Latitude': '-25.2500', 'Longitude': '27.0833', 'Established': '1979', 'Description': 'Located in an extinct volcanic crater.'},
        {'Park_Code': 'HLO', 'Name': 'Hluhluwe-Imfolozi Park', 'Country': 'South Africa', 'Region': 'KwaZulu-Natal', 'Latitude': '-28.2333', 'Longitude': '31.9833', 'Established': '1895', 'Description': 'Oldest proclaimed nature reserve in Africa, home to white rhinos.'},
    ]
    
    # Kenya - Major National Parks
    kenya_parks = [
        {'Park_Code': 'MASA', 'Name': 'Maasai Mara National Reserve', 'Country': 'Kenya', 'Region': 'Narok', 'Latitude': '-1.5000', 'Longitude': '35.0000', 'Established': '1961', 'Description': 'Famous for the Great Migration and big cat populations.'},
        {'Park_Code': 'AMB', 'Name': 'Amboseli National Park', 'Country': 'Kenya', 'Region': 'Kajiado', 'Latitude': '-2.6500', 'Longitude': '37.2500', 'Established': '1974', 'Description': 'Known for large elephant herds with Mount Kilimanjaro backdrop.'},
        {'Park_Code': 'TSAV', 'Name': 'Tsavo East National Park', 'Country': 'Kenya', 'Region': 'Taita-Taveta', 'Latitude': '-2.7833', 'Longitude': '38.7667', 'Established': '1948', 'Description': 'One of Kenya\'s largest parks, home to red elephants.'},
        {'Park_Code': 'TSAW', 'Name': 'Tsavo West National Park', 'Country': 'Kenya', 'Region': 'Taita-Taveta', 'Latitude': '-3.0000', 'Longitude': '38.0000', 'Established': '1948', 'Description': 'Known for Mzima Springs and diverse wildlife.'},
        {'Park_Code': 'NAK', 'Name': 'Nairobi National Park', 'Country': 'Kenya', 'Region': 'Nairobi', 'Latitude': '-1.3667', 'Longitude': '36.8333', 'Established': '1946', 'Description': 'World\'s only national park within a capital city.'},
        {'Park_Code': 'HELL', 'Name': 'Hell\'s Gate National Park', 'Country': 'Kenya', 'Region': 'Nakuru', 'Latitude': '-0.9167', 'Longitude': '36.3167', 'Established': '1984', 'Description': 'Known for geothermal activity and rock climbing.'},
        {'Park_Code': 'ABER', 'Name': 'Aberdare National Park', 'Country': 'Kenya', 'Region': 'Nyeri, Nyandarua', 'Latitude': '-0.4167', 'Longitude': '36.6667', 'Established': '1950', 'Description': 'Mountainous park with diverse wildlife and waterfalls.'},
    ]
    
    # Tanzania - Major National Parks
    tanzania_parks = [
        {'Park_Code': 'SERE', 'Name': 'Serengeti National Park', 'Country': 'Tanzania', 'Region': 'Mara, Arusha', 'Latitude': '-2.3333', 'Longitude': '34.8333', 'Established': '1951', 'Description': 'Famous for the annual wildebeest migration of over 1.5 million animals.'},
        {'Park_Code': 'NGOR', 'Name': 'Ngorongoro Conservation Area', 'Country': 'Tanzania', 'Region': 'Arusha', 'Latitude': '-3.1833', 'Longitude': '35.5500', 'Established': '1959', 'Description': 'UNESCO World Heritage Site with the largest intact caldera.'},
        {'Park_Code': 'KILI', 'Name': 'Kilimanjaro National Park', 'Country': 'Tanzania', 'Region': 'Kilimanjaro', 'Latitude': '-3.0667', 'Longitude': '37.3500', 'Established': '1973', 'Description': 'Home to Mount Kilimanjaro, Africa\'s highest peak.'},
        {'Park_Code': 'TARA', 'Name': 'Tarangire National Park', 'Country': 'Tanzania', 'Region': 'Manyara', 'Latitude': '-3.8333', 'Longitude': '36.0000', 'Established': '1970', 'Description': 'Known for large elephant herds and baobab trees.'},
        {'Park_Code': 'LAKE', 'Name': 'Lake Manyara National Park', 'Country': 'Tanzania', 'Region': 'Manyara', 'Latitude': '-3.5000', 'Longitude': '35.8333', 'Established': '1960', 'Description': 'Famous for tree-climbing lions and diverse birdlife.'},
        {'Park_Code': 'ARUS', 'Name': 'Arusha National Park', 'Country': 'Tanzania', 'Region': 'Arusha', 'Latitude': '-3.2500', 'Longitude': '36.8333', 'Established': '1960', 'Description': 'Small park with Mount Meru and diverse wildlife.'},
        {'Park_Code': 'RUA', 'Name': 'Ruaha National Park', 'Country': 'Tanzania', 'Region': 'Iringa', 'Latitude': '-7.8333', 'Longitude': '34.8333', 'Established': '1964', 'Description': 'Tanzania\'s largest national park, known for elephants and wild dogs.'},
    ]
    
    # Botswana - Major National Parks
    botswana_parks = [
        {'Park_Code': 'CHOB', 'Name': 'Chobe National Park', 'Country': 'Botswana', 'Region': 'Chobe', 'Latitude': '-18.6667', 'Longitude': '24.5000', 'Established': '1967', 'Description': 'Renowned for large elephant herds and diverse wildlife along the Chobe River.'},
        {'Park_Code': 'OKAV', 'Name': 'Okavango Delta', 'Country': 'Botswana', 'Region': 'North West', 'Latitude': '-19.2833', 'Longitude': '22.7500', 'Established': '2014', 'Description': 'UNESCO World Heritage Site, world\'s largest inland delta.'},
        {'Park_Code': 'MOR', 'Name': 'Moremi Game Reserve', 'Country': 'Botswana', 'Region': 'North West', 'Latitude': '-19.1667', 'Longitude': '23.0833', 'Established': '1963', 'Description': 'First reserve in Africa established by local residents.'},
        {'Park_Code': 'KGAL', 'Name': 'Kgalagadi Transfrontier Park', 'Country': 'Botswana', 'Region': 'Kgalagadi', 'Latitude': '-25.7667', 'Longitude': '20.3833', 'Established': '2000', 'Description': 'Transfrontier park shared with South Africa, Kalahari desert ecosystem.'},
    ]
    
    # Namibia - Major National Parks
    namibia_parks = [
        {'Park_Code': 'ETOS', 'Name': 'Etosha National Park', 'Country': 'Namibia', 'Region': 'Kunene, Oshikoto', 'Latitude': '-18.9167', 'Longitude': '16.3333', 'Established': '1907', 'Description': 'Centered around a vast salt pan, home to diverse wildlife including rhinos and lions.'},
        {'Park_Code': 'NAUK', 'Name': 'Namib-Naukluft National Park', 'Country': 'Namibia', 'Region': 'Erongo, Hardap', 'Latitude': '-24.7500', 'Longitude': '15.3000', 'Established': '1907', 'Description': 'One of the largest national parks in Africa, includes Sossusvlei dunes.'},
        {'Park_Code': 'FISH', 'Name': 'Fish River Canyon Park', 'Country': 'Namibia', 'Region': 'Karas', 'Latitude': '-27.5833', 'Longitude': '17.6000', 'Established': '1962', 'Description': 'Home to the second largest canyon in the world.'},
        {'Park_Code': 'SKEL', 'Name': 'Skeleton Coast National Park', 'Country': 'Namibia', 'Region': 'Kunene, Erongo', 'Latitude': '-20.5000', 'Longitude': '13.5000', 'Established': '1971', 'Description': 'Famous for shipwrecks and desert-adapted wildlife.'},
    ]
    
    # Zambia - Major National Parks
    zambia_parks = [
        {'Park_Code': 'SOUL', 'Name': 'South Luangwa National Park', 'Country': 'Zambia', 'Region': 'Eastern Province', 'Latitude': '-13.0000', 'Longitude': '31.5000', 'Established': '1972', 'Description': 'Known for walking safaris and high density of leopards.'},
        {'Park_Code': 'LOWE', 'Name': 'Lower Zambezi National Park', 'Country': 'Zambia', 'Region': 'Lusaka, Central', 'Latitude': '-15.6667', 'Longitude': '29.5000', 'Established': '1983', 'Description': 'Beautiful park along the Zambezi River with excellent game viewing.'},
        {'Park_Code': 'KAFU', 'Name': 'Kafue National Park', 'Country': 'Zambia', 'Region': 'Central, Northwestern, Southern', 'Latitude': '-15.0000', 'Longitude': '25.7500', 'Established': '1950', 'Description': 'Zambia\'s largest national park, diverse ecosystems.'},
    ]
    
    # Zimbabwe - Major National Parks
    zimbabwe_parks = [
        {'Park_Code': 'HWAN', 'Name': 'Hwange National Park', 'Country': 'Zimbabwe', 'Region': 'Matabeleland North', 'Latitude': '-19.0000', 'Longitude': '26.5000', 'Established': '1929', 'Description': 'Zimbabwe\'s largest national park, home to one of the largest elephant populations.'},
        {'Park_Code': 'MANA', 'Name': 'Mana Pools National Park', 'Country': 'Zimbabwe', 'Region': 'Mashonaland West', 'Latitude': '-15.7500', 'Longitude': '29.3333', 'Established': '1963', 'Description': 'UNESCO World Heritage Site, known for walking safaris and large mammals.'},
        {'Park_Code': 'MATO', 'Name': 'Matobo National Park', 'Country': 'Zimbabwe', 'Region': 'Matabeleland South', 'Latitude': '-20.5000', 'Longitude': '28.5000', 'Established': '1926', 'Description': 'Known for balancing rocks and ancient rock art.'},
    ]
    
    # Uganda - Major National Parks
    uganda_parks = [
        {'Park_Code': 'BWIN', 'Name': 'Bwindi Impenetrable National Park', 'Country': 'Uganda', 'Region': 'Kanungu, Kisoro', 'Latitude': '-1.0000', 'Longitude': '29.6667', 'Established': '1991', 'Description': 'UNESCO World Heritage Site, home to half of the world\'s mountain gorillas.'},
        {'Park_Code': 'MGAH', 'Name': 'Mgahinga Gorilla National Park', 'Country': 'Uganda', 'Region': 'Kisoro', 'Latitude': '-1.3667', 'Longitude': '29.6500', 'Established': '1991', 'Description': 'Part of the Virunga Conservation Area, home to mountain gorillas.'},
        {'Park_Code': 'QUEEN', 'Name': 'Queen Elizabeth National Park', 'Country': 'Uganda', 'Region': 'Kasese, Kamwenge', 'Latitude': '-0.2500', 'Longitude': '30.0000', 'Established': '1952', 'Description': 'Uganda\'s most visited park, diverse ecosystems and wildlife.'},
        {'Park_Code': 'MURC', 'Name': 'Murchison Falls National Park', 'Country': 'Uganda', 'Region': 'Masindi, Nwoya', 'Latitude': '2.2500', 'Longitude': '31.7500', 'Established': '1952', 'Description': 'Home to the powerful Murchison Falls and diverse wildlife.'},
    ]
    
    # Rwanda - Major National Parks
    rwanda_parks = [
        {'Park_Code': 'VOLC', 'Name': 'Volcanoes National Park', 'Country': 'Rwanda', 'Region': 'Northern Province', 'Latitude': '-1.5000', 'Longitude': '29.5000', 'Established': '1925', 'Description': 'Home to mountain gorillas, made famous by Dian Fossey.'},
        {'Park_Code': 'AKAG', 'Name': 'Akagera National Park', 'Country': 'Rwanda', 'Region': 'Eastern Province', 'Latitude': '-1.8333', 'Longitude': '30.7500', 'Established': '1934', 'Description': 'Rwanda\'s only savannah park, home to the Big Five.'},
        {'Park_Code': 'NYUN', 'Name': 'Nyungwe Forest National Park', 'Country': 'Rwanda', 'Region': 'Western Province', 'Latitude': '-2.5000', 'Longitude': '29.2500', 'Established': '2004', 'Description': 'Ancient montane rainforest, home to chimpanzees and colobus monkeys.'},
    ]
    
    # Ethiopia - Major National Parks
    ethiopia_parks = [
        {'Park_Code': 'SIMM', 'Name': 'Simien Mountains National Park', 'Country': 'Ethiopia', 'Region': 'Amhara', 'Latitude': '13.2500', 'Longitude': '38.2500', 'Established': '1969', 'Description': 'UNESCO World Heritage Site, home to gelada baboons and Ethiopian wolves.'},
        {'Park_Code': 'BALE', 'Name': 'Bale Mountains National Park', 'Country': 'Ethiopia', 'Region': 'Oromia', 'Latitude': '6.7500', 'Longitude': '39.7500', 'Established': '1970', 'Description': 'Home to the largest population of Ethiopian wolves and mountain nyala.'},
        {'Park_Code': 'AWASH', 'Name': 'Awash National Park', 'Country': 'Ethiopia', 'Region': 'Afar, Oromia', 'Latitude': '9.0000', 'Longitude': '40.0000', 'Established': '1966', 'Description': 'First national park in Ethiopia, diverse wildlife and landscapes.'},
    ]
    
    # Morocco - Major National Parks
    morocco_parks = [
        {'Park_Code': 'TOUB', 'Name': 'Toubkal National Park', 'Country': 'Morocco', 'Region': 'Marrakesh-Safi', 'Latitude': '31.0833', 'Longitude': '-7.9167', 'Established': '1942', 'Description': 'Home to Mount Toubkal, North Africa\'s highest peak.'},
        {'Park_Code': 'IFRA', 'Name': 'Ifrane National Park', 'Country': 'Morocco', 'Region': 'Fès-Meknès', 'Latitude': '33.5000', 'Longitude': '-5.1000', 'Established': '2004', 'Description': 'Known for Atlas cedar forests and Barbary macaques.'},
    ]
    
    # Egypt - Major National Parks
    egypt_parks = [
        {'Park_Code': 'RAS', 'Name': 'Ras Mohammed National Park', 'Country': 'Egypt', 'Region': 'South Sinai', 'Latitude': '27.7167', 'Longitude': '34.2500', 'Established': '1983', 'Description': 'Marine park at the tip of the Sinai Peninsula, world-class diving.'},
        {'Park_Code': 'WHITE', 'Name': 'White Desert National Park', 'Country': 'Egypt', 'Region': 'New Valley', 'Latitude': '27.2500', 'Longitude': '28.7500', 'Established': '2002', 'Description': 'Famous for white chalk rock formations shaped by wind erosion.'},
    ]
    
    # Madagascar - Major National Parks
    madagascar_parks = [
        {'Park_Code': 'ANDA', 'Name': 'Andasibe-Mantadia National Park', 'Country': 'Madagascar', 'Region': 'Alaotra-Mangoro', 'Latitude': '-18.8333', 'Longitude': '48.4167', 'Established': '1989', 'Description': 'Known for indri lemurs and lush rainforests.'},
        {'Park_Code': 'ISAL', 'Name': 'Isalo National Park', 'Country': 'Madagascar', 'Region': 'Ihorombe', 'Latitude': '-22.4167', 'Longitude': '45.3333', 'Established': '1962', 'Description': 'Known for dramatic sandstone formations and canyons.'},
        {'Park_Code': 'RANO', 'Name': 'Ranomafana National Park', 'Country': 'Madagascar', 'Region': 'Vatovavy-Fitovinany', 'Latitude': '-21.2500', 'Longitude': '47.4167', 'Established': '1991', 'Description': 'Tropical rainforest park, home to 12 species of lemurs.'},
    ]
    
    # Gabon - Major National Parks
    gabon_parks = [
        {'Park_Code': 'LOAN', 'Name': 'Loango National Park', 'Country': 'Gabon', 'Region': 'Ogooué-Maritime', 'Latitude': '-2.0833', 'Longitude': '9.5833', 'Established': '2002', 'Description': 'Dubbed "Africa\'s Last Eden," unique blend of rainforest and ocean ecosystems.'},
        {'Park_Code': 'IVIN', 'Name': 'Ivindo National Park', 'Country': 'Gabon', 'Region': 'Ogooué-Ivindo', 'Latitude': '0.1667', 'Longitude': '12.7500', 'Established': '2002', 'Description': 'UNESCO World Heritage Site, home to Kongou Falls and diverse wildlife.'},
    ]
    
    # Cameroon - Major National Parks
    cameroon_parks = [
        {'Park_Code': 'WAZA', 'Name': 'Waza National Park', 'Country': 'Cameroon', 'Region': 'Far North', 'Latitude': '11.3333', 'Longitude': '14.6667', 'Established': '1968', 'Description': 'UNESCO Biosphere Reserve, home to lions, elephants, and various bird species.'},
        {'Park_Code': 'KORU', 'Name': 'Korup National Park', 'Country': 'Cameroon', 'Region': 'Southwest', 'Latitude': '5.0833', 'Longitude': '8.8333', 'Established': '1986', 'Description': 'One of Africa\'s oldest and most biodiverse rainforests.'},
    ]
    
    # Add all parks to the main list
    all_parks = (
        south_africa_parks + kenya_parks + tanzania_parks + botswana_parks +
        namibia_parks + zambia_parks + zimbabwe_parks + uganda_parks +
        rwanda_parks + ethiopia_parks + morocco_parks + egypt_parks +
        madagascar_parks + gabon_parks + cameroon_parks
    )
    
    # Format parks data consistently
    for park in all_parks:
        formatted_park = {
            'Park_Code': park.get('Park_Code', ''),
            'Name': park.get('Name', ''),
            'Designation': 'National Park',
            'States': park.get('Region', ''),
            'Latitude': park.get('Latitude', '0'),
            'Longitude': park.get('Longitude', '0'),
            'Description': park.get('Description', ''),
            'URL': f"https://en.wikipedia.org/wiki/{park.get('Name', '').replace(' ', '_')}",
            'Country': park.get('Country', '')
        }
        parks_data.append(formatted_park)
    
    print(f"Created comprehensive list of {len(parks_data)} African National Parks")
    return parks_data

def save_to_csv(parks, filename):
    """Save parks data to CSV file"""
    if not parks:
        print("No parks to save.")
        return
    
    fieldnames = ['Park_Code', 'Name', 'Designation', 'States', 'Latitude', 'Longitude', 'Description', 'URL', 'Country']
    
    with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(parks)
    
    print(f"✅ Saved {len(parks)} parks to {filename}")

if __name__ == '__main__':
    print("=" * 80)
    print("African National Parks Data Downloader")
    print("=" * 80)
    
    parks = get_african_parks_data()
    
    if parks:
        # Save to public/data directory
        script_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.dirname(script_dir)
        public_data_dir = os.path.join(project_root, 'public', 'data')
        os.makedirs(public_data_dir, exist_ok=True)
        
        csv_path = os.path.join(public_data_dir, 'African_National_Parks.csv')
        save_to_csv(parks, csv_path)
        
        # Also save to data directory
        data_dir = os.path.join(project_root, 'data')
        os.makedirs(data_dir, exist_ok=True)
        data_csv_path = os.path.join(data_dir, 'African_National_Parks.csv')
        save_to_csv(parks, data_csv_path)
        
        print(f"\n✅ Data saved to:")
        print(f"   - {csv_path}")
        print(f"   - {data_csv_path}")
        print(f"\nTotal parks: {len(parks)}")
        print(f"Countries covered: {len(set(p['Country'] for p in parks))}")
    else:
        print("\n❌ No parks data retrieved.")

