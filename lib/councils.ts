export interface Council {
    name: string;
    region: string;
    friendlyName: string;
    suburbs: string[];
}

export const COUNCILS: Council[] = [
    // Inner City Municipalities
    {
        name: "City of Melbourne",
        region: "Inner City",
        friendlyName: "Melbourne CBD & Inner City",
        suburbs: ["Carlton", "Docklands", "Flemington", "Kensington", "North Melbourne", "Parkville", "Richmond", "Melbourne"]
    },
    {
        name: "City of Port Phillip",
        region: "Inner City",
        friendlyName: "St Kilda & Beachside",
        suburbs: ["Albert Park", "Balaclava", "Elwood", "St Kilda", "South Melbourne", "Port Melbourne", "Ripponlea", "Middle Park", "Beacon Cove"]
    },
    {
        name: "City of Yarra",
        region: "Inner City",
        friendlyName: "Inner North Creative",
        suburbs: ["Abbotsford", "Collingwood", "Fitzroy", "Fitzroy North", "Richmond", "Burnley", "Cremorne", "Clifton Hill", "Princes Hill", "Fairfield", "Alphington"]
    },

    // Northern Municipalities
    {
        name: "City of Banyule",
        region: "Northern",
        friendlyName: "Heidelberg & Foothills",
        suburbs: ["Heidelberg", "Ivanhoe", "Watsonia", "Greensborough", "Eltham", "Rosanna", "Eaglemont", "Macleod", "Yallambie", "Viewbank", "Lower Plenty", "Bundoora"]
    },
    {
        name: "City of Darebin",
        region: "Northern",
        friendlyName: "Preston & Inner North",
        suburbs: ["Preston", "Reservoir", "Thornbury", "West Preston", "Fairfield", "Northcote", "Kingsbury", "Bundoora"]
    },
    {
        name: "City of Hume",
        region: "Northern",
        friendlyName: "Broadmeadows & Outer North",
        suburbs: ["Broadmeadows", "Sunbury", "Craigieburn", "Roxburgh Park", "Tullamarine", "Campbellfield", "Coolaroo", "Dallas", "Gladstone Park", "Greenvale", "Jacana", "Meadow Heights", "Melbourne Airport", "Mickleham", "Oaklands Junction", "Somerton", "Westmeadows", "Yuroke"]
    },
    {
        name: "City of Merri-bek",
        region: "Northern",
        friendlyName: "Brunswick & Inner West",
        suburbs: ["Brunswick", "Coburg", "Fawkner", "Glenroy", "Pascoe Vale", "Brunswick West", "Brunswick East", "Coburg North", "Hadfield", "Oak Park", "Pascoe Vale South"]
    },
    {
        name: "City of Whittlesea",
        region: "Northern",
        friendlyName: "Epping & Growth Corridor",
        suburbs: ["South Morang", "Epping", "Doreen", "Mernda", "Kinglake", "Bundoora", "Donnybrook", "Lalor", "Mill Park", "Thomastown", "Whittlesea", "Wollert"]
    },
    {
        name: "Shire of Nillumbik",
        region: "Northern",
        friendlyName: "Eltham & Dandenong Hills",
        suburbs: ["Diamond Creek", "Eltham", "Kallista", "Monbulk", "Lilydale East", "Eltham North", "Greensborough", "Hurstbridge", "Kangaroo Ground", "North Warrandyte", "Plenty", "Research", "Wattle Glen", "Yarrambat"]
    },

    // Eastern Municipalities
    {
        name: "City of Boroondara",
        region: "Eastern",
        friendlyName: "Hawthorn & Eastern Prestige",
        suburbs: ["Camberwell", "Hawthorn", "Kew", "Balwyn", "Glen Iris", "Ashburton", "Balwyn North", "Canterbury", "Deepdene", "Hawthorn East", "Kew East", "Surrey Hills"]
    },
    {
        name: "City of Knox",
        region: "Eastern",
        friendlyName: "Boronia & Mountain Suburbs",
        suburbs: ["Bayswater", "Boronia", "Mountain Gate", "Knoxfield", "Ferntree Gully", "Lysterfield", "Rowville", "Scoresby", "The Basin", "Upper Ferntree Gully", "Wantirna", "Wantirna South"]
    },
    {
        name: "City of Manningham",
        region: "Eastern",
        friendlyName: "Doncaster & Eastern Leafy",
        suburbs: ["Doncaster", "Templestowe", "Bulleen", "Park Orchards", "Doncaster East", "Donvale", "Lower Templestowe", "Ringwood North", "Warrandyte", "Warrandyte South", "Wonga Park"]
    },
    {
        name: "City of Maroondah",
        region: "Eastern",
        friendlyName: "Ringwood & Eastern Corridor",
        suburbs: ["Croydon", "Ringwood", "Heathmont", "Donvale", "Warranwood", "Bayswater North", "Croydon Hills", "Croydon North", "Croydon South", "Kilsyth South", "Ringwood East", "Ringwood North"]
    },
    {
        name: "City of Whitehorse",
        region: "Eastern",
        friendlyName: "Box Hill & Eastern Residential",
        suburbs: ["Box Hill", "Nunawading", "Vermont", "Mitcham", "Blackburn", "Blackburn North", "Blackburn South", "Box Hill North", "Box Hill South", "Burwood", "Burwood East", "Forest Hill", "Mont Albert", "Mont Albert North", "Surrey Hills", "Vermont South"]
    },
    {
        name: "Shire of Yarra Ranges",
        region: "Eastern",
        friendlyName: "Lilydale & Dandenong Ranges",
        suburbs: ["Lilydale", "Belgrave", "Emerald", "Coldstream", "Yarra Glen", "Badger Creek", "Belgrave Heights", "Belgrave South", "Chirnside Park", "Chum Creek", "Clematis", "Cockatoo", "Dixons Creek", "Don Valley", "Ferny Creek", "Gembrook", "Gruyere", "Healesville", "Hoddles Creek", "Kallista", "Kalorama", "Kilsyth", "Launching Place", "Macclesfield", "Meneiyan", "Millgrove", "Monbulk", "Montrose", "Mooroolbark", "Mount Dandenong", "Mount Evelyn", "Mount Toolebewong", "Narre Warren East", "Olinda", "Powelltown", "Reefton", "Sassafras", "Selby", "Seville", "Seville East", "Sherbrooke", "Silvan", "Steels Creek", "Tarrawarra", "Tecoma", "The Patch", "Three Bridges", "Toorongo", "Tremont", "Upwey", "Wandin East", "Wandin North", "Warburton", "Warburton East", "Wesburn", "Woori Yallock", "Yarra Junction", "Yellingbo"]
    },

    // Southeastern Municipalities
    {
        name: "City of Bayside",
        region: "Southeastern",
        friendlyName: "Brighton & Bayside",
        suburbs: ["Beaumaris", "Brighton", "Hampton", "Black Rock", "Sandringham", "Brighton East", "Cheltenham", "Hampton East", "Highett"]
    },
    {
        name: "City of Glen Eira",
        region: "Southeastern",
        friendlyName: "Caulfield & Southeastern",
        suburbs: ["Caulfield", "Carnegie", "Bentleigh", "Elsternwick", "Murrumbeena", "Bentleigh East", "Caulfield East", "Caulfield North", "Caulfield South", "Gardenvale", "Glen Huntly", "McKinnon", "Ormond", "St Kilda East"]
    },
    {
        name: "City of Kingston",
        region: "Southeastern",
        friendlyName: "Mentone & Bayside South",
        suburbs: ["Mentone", "Moorabbin", "Aspendale", "Highett", "Sandown", "Aspendale Gardens", "Bonbeach", "Braeside", "Carrum", "Chelsea", "Chelsea Heights", "Cheltenham", "Clarinda", "Clayton South", "Dingley Village", "Edithvale", "Heatherton", "Moorabbin Airport", "Mordialloc", "Oakleigh South", "Parkdale", "Patterson Lakes", "Waterways"]
    },
    {
        name: "City of Casey",
        region: "Southeastern",
        friendlyName: "Narre Warren & Outer South",
        suburbs: ["Narre Warren", "Cranbourne", "Fountain Gate", "Officer", "Clyde", "Berwick", "Blind Bight", "Cannons Creek", "Clyde North", "Cranbourne East", "Cranbourne North", "Cranbourne South", "Cranbourne West", "Devon Meadows", "Doveton", "Endeavour Hills", "Eumemmerring", "Hallam", "Hampton Park", "Harkaway", "Junction Village", "Lynbrook", "Lyndhurst", "Lysterfield South", "Narre Warren North", "Narre Warren South", "Pearcedale", "Tooradin", "Warneet"]
    },
    {
        name: "City of Frankston",
        region: "Southeastern",
        friendlyName: "Frankston & Peninsula",
        suburbs: ["Frankston", "Seaford", "Karingal", "Skye", "Langwarrin", "Carrum Downs", "Frankston North", "Frankston South", "Langwarrin South", "Sandhurst"]
    },
    {
        name: "Shire of Cardinia",
        region: "Southeastern",
        friendlyName: "Pakenham & Outer Southeast",
        suburbs: ["Pakenham", "Officer", "Beaconsfield", "Emerald", "Bunyip", "Avonsleigh", "Bayles", "Beaconsfield Upper", "Bunyip North", "Caldermeade", "Cardinia", "Catani", "Clematis", "Cockatoo", "Cora Lynn", "Dalmore", "Dewhurst", "Garfield", "Garfield North", "Gembrook", "Guys Hill", "Iona", "Koo Wee Rup", "Koo Wee Rup North", "Lang Lang", "Lang Lang East", "Longwarry", "Maryknoll", "Menzies Creek", "Modella", "Monomeith", "Mount Burnett", "N Nar Nar Goon", "Nar Nar Goon North", "Officer South", "Pakenham South", "Pakenham Upper", "Rythdale", "Tynong", "Tynong North", "Vervale", "Yannathan"]
    },
    {
        name: "Mornington Peninsula Shire",
        region: "Southeastern",
        friendlyName: "Mornington Peninsula",
        suburbs: ["Mornington", "Mount Martha", "Red Hill", "Sorrento", "Portsea", "Arthurs Seat", "Balnarring", "Balnarring Beach", "Baxter", "Bittern", "Blairgowrie", "Boneo", "Cape Schanck", "Crib Point", "Dromana", "Fingal", "Flinders", "Hastings", "HMAS Cerberus", "Main Ridge", "McCrae", "Merricks", "Merricks Beach", "Merricks North", "Moorooduc", "Mount Eliza", "Point Leo", "Rosebud", "Rye", "Safety Beach", "Shoreham", "Somers", "Somerville", "St Andrews Beach", "Tootgarook", "Tuerong", "Tyabb"]
    },

    // Western Municipalities
    {
        name: "City of Brimbank",
        region: "Western",
        friendlyName: "Sunshine & Western Industrial",
        suburbs: ["Sunshine", "St Albans", "Keilor", "Albanvale", "Deer Park", "Albion", "Ardeer", "Brooklyn", "Cairnlea", "Calder Park", "Delahey", "Derrimut", "Kealba", "Keilor Downs", "Keilor East", "Keilor Lodge", "Keilor North", "Keilor Park", "Kings Park", "Sunshine North", "Sunshine West", "Sydenham", "Taylors Lakes", "Tullamarine"]
    },
    {
        name: "City of Hobsons Bay",
        region: "Western",
        friendlyName: "Williamstown & Western Coastal",
        suburbs: ["Williamstown", "Altona", "Newport", "Werribee South", "Altona Meadows", "Altona North", "Brooklyn", "Laverton", "Seabrook", "Seaholme", "South Kingsville", "Spotswood", "Williamstown North"]
    },
    {
        name: "City of Maribyrnong",
        region: "Western",
        friendlyName: "Footscray & Inner West",
        suburbs: ["Footscray", "Yarraville", "Seddon", "Kingsville", "West Footscray", "Braybrook", "Maidstone", "Maribyrnong", "Tottenham"]
    },
    {
        name: "City of Melton",
        region: "Western",
        friendlyName: "Melton & Western Growth",
        suburbs: ["Caroline Springs", "Melton", "Hillside", "Toolern", "Brookfield", "Burnside", "Burnside Heights", "Diggers Rest", "Exford", "Eynesbury", "Harkness", "Kurunjang", "Melton South", "Melton West", "Mount Cottrell", "Parwan", "Plumpton", "Ravenhall", "Rockbank", "Taylors Hill", "Toolern Vale", "Truganina"]
    },
    {
        name: "City of Moonee Valley",
        region: "Western",
        friendlyName: "Essendon & Northern West",
        suburbs: ["Essendon", "Moonee Ponds", "Ascot Vale", "Strathmore", "Avondale Heights", "Aberfeldie", "Airport West", "Essendon North", "Essendon West", "Flemington", "Keilor East", "Niddrie", "Strathmore Heights", "Travancore"]
    },
    {
        name: "City of Wyndham",
        region: "Western",
        friendlyName: "Werribee & Southwest Growth",
        suburbs: ["Werribee", "Point Cook", "Williams Landing", "Tarneit", "Manor Lakes", "Hoppers Crossing", "Laverton North", "Mambourin", "Mount Cottrell", "Quandong", "Truganina", "Werribee South", "Wyndham Logic", "Wyndham Vale"]
    }
];

// Helper Functions

export interface SuburbOption {
    suburb: string;
    council: Council;
}

/**
 * Returns a flat list of all suburb options (Suburb + Council pairs).
 * This allows split suburbs (e.g., Richmond) to appear under both councils.
 */
export function getAllSuburbOptions(): SuburbOption[] {
    const options: SuburbOption[] = [];

    COUNCILS.forEach(council => {
        council.suburbs.forEach(suburb => {
            options.push({ suburb, council });
        });
    });

    return options.sort((a, b) => a.suburb.localeCompare(b.suburb));
}

/**
 * DEPRECATED: Use getAllSuburbOptions for UI.
 * Returns a unique list of suburb names.
 */
export function getAllSuburbs(): string[] {
    const allSuburbs = COUNCILS.flatMap(c => c.suburbs);
    return Array.from(new Set(allSuburbs)).sort((a, b) => a.localeCompare(b));
}

/**
 * Finds the Council object for a given suburb name (case-insensitive)
 */
export function getCouncilForSuburb(suburbName: string): Council | undefined {
    if (!suburbName) return undefined;
    const normalized = suburbName.toLowerCase().trim();
    return COUNCILS.find(c =>
        c.suburbs.some(s => s.toLowerCase() === normalized)
    );
}

/**
 * Returns the "Friendly UX Name" for a given Council Name
 */
export function getFriendlyNameForCouncil(councilName: string): string | undefined {
    if (!councilName) return undefined;
    return COUNCILS.find(c => c.name === councilName)?.friendlyName;
}

/**
 * Returns the "Council Name" for a given Friendly Name (reverse lookup)
 */
export function getCouncilNameFromFriendly(friendlyName: string): string | undefined {
    if (!friendlyName) return undefined;
    return COUNCILS.find(c => c.friendlyName === friendlyName)?.name;
}
