export const BEDS_OPTIONS = ["Studio", "1", "2", "3", "4+"] as const;
export const BATHS_OPTIONS = ["1", "1.5", "2", "2+"] as const;
export const SLEEP_SCHEDULE_OPTIONS = ["Early Bird", "Night Owl", "Flexible"] as const;
export const WORK_FROM_HOME_OPTIONS = ["Yes, fully remote", "Sometimes", "No, I go in"] as const;
export const PREFERRED_TEMP_OPTIONS = ["Cool (65-68F)", "Moderate (69-72F)", "Warm (73F+)"] as const;
export const LEASE_LENGTH_OPTIONS = ["3 months", "6 months", "12 months", "Month-to-month"] as const;

export const CLEANLINESS_LABELS: Record<number, string> = {
  1: "Very relaxed",
  2: "Fairly relaxed",
  3: "Somewhere in the middle",
  4: "Pretty tidy",
  5: "Super clean",
};

export const CITY_OPTIONS = [
  "New York, NY",
  "Los Angeles, CA",
  "Chicago, IL",
  "Houston, TX",
  "Nashville, TN",
  "Austin, TX",
  "San Francisco, CA",
  "Seattle, WA",
  "Boston, MA",
  "Miami, FL",
  "Denver, CO",
  "Atlanta, GA",
  "Philadelphia, PA",
  "Phoenix, AZ",
  "Portland, OR",
  "Washington, DC",
];

export const NEIGHBORHOODS_BY_CITY: Record<string, string[]> = {
  "Nashville, TN": ["12South","The Gulch","Germantown","East Nashville","Sylvan Park","Midtown","Hillsboro Village","Belmont","Berry Hill","Donelson","Antioch","Madison","Brentwood","Green Hills","Edgehill","Nations","Wedgewood-Houston","Salemtown","Inglewood","Bordeaux"],
  "Austin, TX": ["South Congress","East Austin","Domain","Downtown Austin","Hyde Park","South Lamar","Barton Hills","Travis Heights","Bouldin Creek","Cherrywood","Mueller","North Loop","Red River District","Rainey Street","West Campus","Clarksville","Rosedale","Tarrytown","Zilker","Windsor Park"],
  "New York, NY": ["Manhattan","Brooklyn","Queens","The Bronx","Staten Island","Williamsburg","Bushwick","Astoria","Harlem","Upper East Side","Upper West Side","Lower East Side","Greenwich Village","SoHo","Tribeca","Chelsea","Hell's Kitchen","Midtown","Financial District","Park Slope","Crown Heights","Bed-Stuy","Long Island City","Flushing","Jackson Heights","Ridgewood","Greenpoint","Carroll Gardens","Cobble Hill","Fort Greene"],
  "Los Angeles, CA": ["Silver Lake","Echo Park","Los Feliz","Highland Park","Eagle Rock","Koreatown","Mid-City","Culver City","Venice","Santa Monica","West Hollywood","Hollywood","Los Feliz","Atwater Village","Glassell Park","Boyle Heights","Arts District","Downtown LA","Palms","Mar Vista","Playa Vista","Brentwood","Pacific Palisades"],
  "Chicago, IL": ["Wicker Park","Bucktown","Logan Square","Pilsen","Bridgeport","Lincoln Park","Lakeview","Andersonville","Ravenswood","Edgewater","Rogers Park","Hyde Park","Bronzeville","South Loop","West Loop","River North","Gold Coast","Old Town","Uptown","Ukrainian Village","Ukrainian Village","Noble Square","Humboldt Park"],
  "San Francisco, CA": ["Mission District","Castro","Haight-Ashbury","Noe Valley","Cole Valley","The Richmond","The Sunset","Pacific Heights","Marina District","North Beach","Chinatown","SoMa","Potrero Hill","Dogpatch","Bernal Heights","Excelsior","Outer Sunset","Inner Sunset","Glen Park","Nob Hill","Russian Hill","Financial District"],
  "Seattle, WA": ["Capitol Hill","Fremont","Ballard","Queen Anne","South Lake Union","Belltown","Pioneer Square","Georgetown","Columbia City","Beacon Hill","West Seattle","Magnolia","Wallingford","Phinney Ridge","Green Lake","Ravenna","University District","Montlake","Madison Park","Madrona","Central District"],
  "Denver, CO": ["RiNo (River North)","Capitol Hill","Highland","LoDo","Baker","Washington Park","Cheesman Park","Congress Park","Platt Park","South Pearl","Sunnyside","Sloan's Lake","West Colfax","Stapleton","Five Points","Globeville","Cherry Creek","Glendale","Whittier","Potter-Highlands"],
  "Atlanta, GA": ["Midtown","Buckhead","Old Fourth Ward","Inman Park","Cabbagetown","Grant Park","Virginia-Highland","Poncey-Highland","Decatur","Little Five Points","Kirkwood","East Atlanta Village","Edgewood","Vine City","West End","Castleberry Hill","Summerhill","Sweet Auburn","Reynoldstown","Candler Park"],
  "Boston, MA": ["South End","South Boston","Fenway","Allston","Brighton","Jamaica Plain","Roxbury","Dorchester","Cambridge","Somerville","Brookline","Back Bay","Beacon Hill","North End","East Boston","Charlestown","Hyde Park","Roslindale","West Roxbury","Mattapan"],
  "Miami, FL": ["Wynwood","Design District","Brickell","Downtown Miami","Little Havana","Little Haiti","Coconut Grove","Coral Gables","South Beach","North Beach","Overtown","Liberty City","Edgewater","Allapattah","Miami Shores"],
  "Houston, TX": ["Midtown","Montrose","Heights","East Downtown","Museum District","Galleria","Upper Kirby","Greenway Plaza","Oak Forest","Garden Oaks","Rice Military","Washington Avenue","Eastwood","EaDo","Third Ward","Fifth Ward","Northside","Spring Branch","Memorial","Braeswood"],
  "Phoenix, AZ": ["Downtown Phoenix","Arcadia","Scottsdale","Tempe","Chandler","Mesa","Glendale","Peoria","Gilbert","Cave Creek","Biltmore","Camelback","Ahwatukee","Sunnyslope","Maryvale","South Mountain","Encanto","Laveen"],
  "Portland, OR": ["Pearl District","Alphabet District","Hawthorne","Division","Alberta Arts District","Mississippi Avenue","Sellwood","Woodstock","St. Johns","Boise-Eliot","Belmont","Richmond","Irvington","Buckman","Southeast Portland","North Portland","Lloyd District","Goose Hollow"],
  "Philadelphia, PA": ["Fishtown","Northern Liberties","South Philly","East Passyunk","Bella Vista","Old City","Rittenhouse Square","Graduate Hospital","Fairmount","Brewerytown","Manayunk","West Philadelphia","University City","Germantown","Chestnut Hill","Mount Airy","Kensington","Point Breeze","Pennsport"],
  "Minneapolis, MN": ["Uptown","Whittier","Lyndale","Bryant","Nokomis","Linden Hills","Kenwood","Longfellow","Seward","Powderhorn","Cedar-Riverside","Northeast Minneapolis","North Loop","Downtown","Dinkytown","Marcy-Holmes","Como","Midway"],
  "Dallas, TX": ["Deep Ellum","Oak Cliff","Bishop Arts","Uptown","Lower Greenville","East Dallas","Lakewood","Preston Hollow","Addison","Plano","Richardson","Garland","Mesquite","Irving","Design District","Knox-Henderson","M Streets","Vickery Meadow"],
  "San Diego, CA": ["North Park","South Park","Hillcrest","Mission Hills","Ocean Beach","Pacific Beach","Mission Beach","La Jolla","Normal Heights","University Heights","Kensington","College Area","East Village","Little Italy","Gaslamp Quarter","Golden Hill","Sherman Heights","City Heights","Logan Heights"],
  "Washington, DC": ["Adams Morgan","Columbia Heights","Shaw","U Street Corridor","Capitol Hill","Logan Circle","Petworth","Bloomingdale","Eckington","Trinidad","H Street Corridor","Brookland","Anacostia","Navy Yard","NoMa","Dupont Circle","Georgetown","Foggy Bottom","Mount Pleasant","Cleveland Park"],
};

export const SCHOOL_OPTIONS = [
  "Vanderbilt University",
  "University of Tennessee",
  "Belmont University",
  "Lipscomb University",
  "Tennessee State University",
  "Fisk University",
  "Middle Tennessee State University",
  "Other",
];
