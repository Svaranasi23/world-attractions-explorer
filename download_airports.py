import csv

# Major airports in US and Canada with IATA codes and coordinates
major_airports = [
    # US Major Airports
    {'IATA': 'ATL', 'Name': 'Hartsfield-Jackson Atlanta International', 'City': 'Atlanta', 'State': 'GA', 'Country': 'United States', 'Latitude': '33.6407', 'Longitude': '-84.4277'},
    {'IATA': 'LAX', 'Name': 'Los Angeles International', 'City': 'Los Angeles', 'State': 'CA', 'Country': 'United States', 'Latitude': '33.9425', 'Longitude': '-118.4081'},
    {'IATA': 'ORD', 'Name': "O'Hare International", 'City': 'Chicago', 'State': 'IL', 'Country': 'United States', 'Latitude': '41.9786', 'Longitude': '-87.9048'},
    {'IATA': 'DFW', 'Name': 'Dallas/Fort Worth International', 'City': 'Dallas', 'State': 'TX', 'Country': 'United States', 'Latitude': '32.8969', 'Longitude': '-97.0381'},
    {'IATA': 'DEN', 'Name': 'Denver International', 'City': 'Denver', 'State': 'CO', 'Country': 'United States', 'Latitude': '39.8617', 'Longitude': '-104.6731'},
    {'IATA': 'JFK', 'Name': 'John F. Kennedy International', 'City': 'New York', 'State': 'NY', 'Country': 'United States', 'Latitude': '40.6413', 'Longitude': '-73.7781'},
    {'IATA': 'SFO', 'Name': 'San Francisco International', 'City': 'San Francisco', 'State': 'CA', 'Country': 'United States', 'Latitude': '37.6213', 'Longitude': '-122.3790'},
    {'IATA': 'SEA', 'Name': 'Seattle-Tacoma International', 'City': 'Seattle', 'State': 'WA', 'Country': 'United States', 'Latitude': '47.4502', 'Longitude': '-122.3088'},
    {'IATA': 'LAS', 'Name': 'McCarran International', 'City': 'Las Vegas', 'State': 'NV', 'Country': 'United States', 'Latitude': '36.0840', 'Longitude': '-115.1537'},
    {'IATA': 'MIA', 'Name': 'Miami International', 'City': 'Miami', 'State': 'FL', 'Country': 'United States', 'Latitude': '25.7959', 'Longitude': '-80.2870'},
    {'IATA': 'CLT', 'Name': 'Charlotte Douglas International', 'City': 'Charlotte', 'State': 'NC', 'Country': 'United States', 'Latitude': '35.2144', 'Longitude': '-80.9473'},
    {'IATA': 'PHX', 'Name': 'Phoenix Sky Harbor International', 'City': 'Phoenix', 'State': 'AZ', 'Country': 'United States', 'Latitude': '33.4342', 'Longitude': '-112.0116'},
    {'IATA': 'EWR', 'Name': 'Newark Liberty International', 'City': 'Newark', 'State': 'NJ', 'Country': 'United States', 'Latitude': '40.6895', 'Longitude': '-74.1745'},
    {'IATA': 'IAH', 'Name': 'George Bush Intercontinental', 'City': 'Houston', 'State': 'TX', 'Country': 'United States', 'Latitude': '29.9902', 'Longitude': '-95.3368'},
    {'IATA': 'MCO', 'Name': 'Orlando International', 'City': 'Orlando', 'State': 'FL', 'Country': 'United States', 'Latitude': '28.4312', 'Longitude': '-81.3083'},
    {'IATA': 'MSP', 'Name': 'Minneapolis-Saint Paul International', 'City': 'Minneapolis', 'State': 'MN', 'Country': 'United States', 'Latitude': '44.8848', 'Longitude': '-93.2223'},
    {'IATA': 'DTW', 'Name': 'Detroit Metropolitan', 'City': 'Detroit', 'State': 'MI', 'Country': 'United States', 'Latitude': '42.2162', 'Longitude': '-83.3554'},
    {'IATA': 'PHL', 'Name': 'Philadelphia International', 'City': 'Philadelphia', 'State': 'PA', 'Country': 'United States', 'Latitude': '39.8719', 'Longitude': '-75.2411'},
    {'IATA': 'LGA', 'Name': 'LaGuardia', 'City': 'New York', 'State': 'NY', 'Country': 'United States', 'Latitude': '40.7769', 'Longitude': '-73.8740'},
    {'IATA': 'BWI', 'Name': 'Baltimore/Washington International', 'City': 'Baltimore', 'State': 'MD', 'Country': 'United States', 'Latitude': '39.1774', 'Longitude': '-76.6684'},
    {'IATA': 'SLC', 'Name': 'Salt Lake City International', 'City': 'Salt Lake City', 'State': 'UT', 'Country': 'United States', 'Latitude': '40.7899', 'Longitude': '-111.9791'},
    {'IATA': 'DCA', 'Name': 'Ronald Reagan Washington National', 'City': 'Washington', 'State': 'DC', 'Country': 'United States', 'Latitude': '38.8512', 'Longitude': '-77.0402'},
    {'IATA': 'MDW', 'Name': 'Chicago Midway International', 'City': 'Chicago', 'State': 'IL', 'Country': 'United States', 'Latitude': '41.7868', 'Longitude': '-87.7522'},
    {'IATA': 'HNL', 'Name': 'Daniel K. Inouye International', 'City': 'Honolulu', 'State': 'HI', 'Country': 'United States', 'Latitude': '21.3206', 'Longitude': '-157.9242'},
    {'IATA': 'ANC', 'Name': 'Ted Stevens Anchorage International', 'City': 'Anchorage', 'State': 'AK', 'Country': 'United States', 'Latitude': '61.1743', 'Longitude': '-149.9962'},
    {'IATA': 'BOS', 'Name': 'Logan International', 'City': 'Boston', 'State': 'MA', 'Country': 'United States', 'Latitude': '42.3656', 'Longitude': '-71.0096'},
    {'IATA': 'IAD', 'Name': 'Washington Dulles International', 'City': 'Washington', 'State': 'VA', 'Country': 'United States', 'Latitude': '38.9531', 'Longitude': '-77.4565'},
    {'IATA': 'FLL', 'Name': 'Fort Lauderdale-Hollywood International', 'City': 'Fort Lauderdale', 'State': 'FL', 'Country': 'United States', 'Latitude': '26.0726', 'Longitude': '-80.1528'},
    {'IATA': 'PDX', 'Name': 'Portland International', 'City': 'Portland', 'State': 'OR', 'Country': 'United States', 'Latitude': '45.5898', 'Longitude': '-122.5951'},
    {'IATA': 'STL', 'Name': 'St. Louis Lambert International', 'City': 'St. Louis', 'State': 'MO', 'Country': 'United States', 'Latitude': '38.7487', 'Longitude': '-90.3700'},
    {'IATA': 'SAN', 'Name': 'San Diego International', 'City': 'San Diego', 'State': 'CA', 'Country': 'United States', 'Latitude': '32.7338', 'Longitude': '-117.1933'},
    {'IATA': 'TPA', 'Name': 'Tampa International', 'City': 'Tampa', 'State': 'FL', 'Country': 'United States', 'Latitude': '27.9755', 'Longitude': '-82.5332'},
    {'IATA': 'BNA', 'Name': 'Nashville International', 'City': 'Nashville', 'State': 'TN', 'Country': 'United States', 'Latitude': '36.1245', 'Longitude': '-86.6782'},
    {'IATA': 'AUS', 'Name': 'Austin-Bergstrom International', 'City': 'Austin', 'State': 'TX', 'Country': 'United States', 'Latitude': '30.1945', 'Longitude': '-97.6699'},
    {'IATA': 'OAK', 'Name': 'Oakland International', 'City': 'Oakland', 'State': 'CA', 'Country': 'United States', 'Latitude': '37.7213', 'Longitude': '-122.2207'},
    {'IATA': 'MSY', 'Name': 'Louis Armstrong New Orleans International', 'City': 'New Orleans', 'State': 'LA', 'Country': 'United States', 'Latitude': '29.9934', 'Longitude': '-90.2581'},
    {'IATA': 'RDU', 'Name': 'Raleigh-Durham International', 'City': 'Raleigh', 'State': 'NC', 'Country': 'United States', 'Latitude': '35.8776', 'Longitude': '-78.7875'},
    {'IATA': 'CLE', 'Name': 'Cleveland Hopkins International', 'City': 'Cleveland', 'State': 'OH', 'Country': 'United States', 'Latitude': '41.4117', 'Longitude': '-81.8498'},
    {'IATA': 'IND', 'Name': 'Indianapolis International', 'City': 'Indianapolis', 'State': 'IN', 'Country': 'United States', 'Latitude': '39.7173', 'Longitude': '-86.2944'},
    {'IATA': 'CMH', 'Name': 'John Glenn Columbus International', 'City': 'Columbus', 'State': 'OH', 'Country': 'United States', 'Latitude': '39.9980', 'Longitude': '-82.8919'},
    {'IATA': 'MCI', 'Name': 'Kansas City International', 'City': 'Kansas City', 'State': 'MO', 'Country': 'United States', 'Latitude': '39.2976', 'Longitude': '-94.7139'},
    {'IATA': 'SJC', 'Name': 'Norman Y. Mineta San Jose International', 'City': 'San Jose', 'State': 'CA', 'Country': 'United States', 'Latitude': '37.3626', 'Longitude': '-121.9290'},
    {'IATA': 'SMF', 'Name': 'Sacramento International', 'City': 'Sacramento', 'State': 'CA', 'Country': 'United States', 'Latitude': '38.6954', 'Longitude': '-121.5908'},
    {'IATA': 'PIT', 'Name': 'Pittsburgh International', 'City': 'Pittsburgh', 'State': 'PA', 'Country': 'United States', 'Latitude': '40.4915', 'Longitude': '-80.2329'},
    {'IATA': 'MKE', 'Name': 'General Mitchell International', 'City': 'Milwaukee', 'State': 'WI', 'Country': 'United States', 'Latitude': '42.9472', 'Longitude': '-87.8966'},
    {'IATA': 'BUF', 'Name': 'Buffalo Niagara International', 'City': 'Buffalo', 'State': 'NY', 'Country': 'United States', 'Latitude': '42.9405', 'Longitude': '-78.7322'},
    {'IATA': 'JAX', 'Name': 'Jacksonville International', 'City': 'Jacksonville', 'State': 'FL', 'Country': 'United States', 'Latitude': '30.4941', 'Longitude': '-81.6879'},
    {'IATA': 'BUR', 'Name': 'Hollywood Burbank', 'City': 'Burbank', 'State': 'CA', 'Country': 'United States', 'Latitude': '34.2006', 'Longitude': '-118.3587'},
    {'IATA': 'ABQ', 'Name': 'Albuquerque International Sunport', 'City': 'Albuquerque', 'State': 'NM', 'Country': 'United States', 'Latitude': '35.0402', 'Longitude': '-106.6092'},
    {'IATA': 'BOI', 'Name': 'Boise Airport', 'City': 'Boise', 'State': 'ID', 'Country': 'United States', 'Latitude': '43.5644', 'Longitude': '-116.2228'},
    {'IATA': 'OGG', 'Name': 'Kahului Airport', 'City': 'Kahului', 'State': 'HI', 'Country': 'United States', 'Latitude': '20.8986', 'Longitude': '-156.4306'},
    
    # Canadian Major Airports
    {'IATA': 'YYZ', 'Name': 'Toronto Pearson International', 'City': 'Toronto', 'State': 'ON', 'Country': 'Canada', 'Latitude': '43.6772', 'Longitude': '-79.6306'},
    {'IATA': 'YVR', 'Name': 'Vancouver International', 'City': 'Vancouver', 'State': 'BC', 'Country': 'Canada', 'Latitude': '49.1947', 'Longitude': '-123.1792'},
    {'IATA': 'YUL', 'Name': 'Montréal-Pierre Elliott Trudeau International', 'City': 'Montreal', 'State': 'QC', 'Country': 'Canada', 'Latitude': '45.4577', 'Longitude': '-73.7497'},
    {'IATA': 'YYC', 'Name': 'Calgary International', 'City': 'Calgary', 'State': 'AB', 'Country': 'Canada', 'Latitude': '51.1215', 'Longitude': '-114.0076'},
    {'IATA': 'YEG', 'Name': 'Edmonton International', 'City': 'Edmonton', 'State': 'AB', 'Country': 'Canada', 'Latitude': '53.3097', 'Longitude': '-113.5797'},
    {'IATA': 'YOW', 'Name': 'Ottawa Macdonald-Cartier International', 'City': 'Ottawa', 'State': 'ON', 'Country': 'Canada', 'Latitude': '45.3225', 'Longitude': '-75.6692'},
    {'IATA': 'YHZ', 'Name': 'Halifax Stanfield International', 'City': 'Halifax', 'State': 'NS', 'Country': 'Canada', 'Latitude': '44.8808', 'Longitude': '-63.5086'},
    {'IATA': 'YWG', 'Name': 'Winnipeg James Armstrong Richardson International', 'City': 'Winnipeg', 'State': 'MB', 'Country': 'Canada', 'Latitude': '49.9100', 'Longitude': '-97.2399'},
    {'IATA': 'YQB', 'Name': 'Québec City Jean Lesage International', 'City': 'Quebec City', 'State': 'QC', 'Country': 'Canada', 'Latitude': '46.7911', 'Longitude': '-71.3933'},
    {'IATA': 'YQR', 'Name': 'Regina International', 'City': 'Regina', 'State': 'SK', 'Country': 'Canada', 'Latitude': '50.4319', 'Longitude': '-104.6658'},
    {'IATA': 'YQT', 'Name': 'Thunder Bay International', 'City': 'Thunder Bay', 'State': 'ON', 'Country': 'Canada', 'Latitude': '48.3719', 'Longitude': '-89.3239'},
    {'IATA': 'YFC', 'Name': 'Fredericton International', 'City': 'Fredericton', 'State': 'NB', 'Country': 'Canada', 'Latitude': '45.8689', 'Longitude': '-66.5372'},
    {'IATA': 'YXY', 'Name': 'Erik Nielsen Whitehorse International', 'City': 'Whitehorse', 'State': 'YT', 'Country': 'Canada', 'Latitude': '60.7096', 'Longitude': '-135.0673'},
    {'IATA': 'YFB', 'Name': 'Iqaluit Airport', 'City': 'Iqaluit', 'State': 'NU', 'Country': 'Canada', 'Latitude': '63.7567', 'Longitude': '-68.5558'},
]

if __name__ == "__main__":
    output_path = '/Users/srivaranasi/Library/CloudStorage/GoogleDrive-pvsvnc04@gmail.com/My Drive/PVSVNC_Documents/Sri/Sri_Gigs/US national parks/Major_Airports.csv'
    
    fieldnames = ['IATA', 'Name', 'City', 'State', 'Country', 'Latitude', 'Longitude']
    
    with open(output_path, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(major_airports)
    
    print(f"Created CSV with {len(major_airports)} major airports")
    print(f"Saved to: {output_path}")

