// Weather service for Bihar districts using Open-Meteo real-time weather API

export interface DistrictCoordinates {
  name: string;
  hindiName: string;
  lat: number;
  lon: number;
}

export interface WeatherData {
  districtName: string;
  temperature: number;
  weatherCode: number;
  conditionHindi: string;
  conditionEnglish: string;
  windSpeed: number;
  humidity?: number;
  isDay?: boolean;
  updatedAt: string;
}

export const BIHAR_DISTRICT_COORDS: Record<string, DistrictCoordinates> = {
  'Patna': { name: 'Patna', hindiName: 'पटना', lat: 25.5941, lon: 85.1376 },
  'Muzaffarpur': { name: 'Muzaffarpur', hindiName: 'मुजफ्फरपुर', lat: 26.1209, lon: 85.3647 },
  'Gaya': { name: 'Gaya', hindiName: 'गया', lat: 24.7914, lon: 85.0002 },
  'Bhagalpur': { name: 'Bhagalpur', hindiName: 'भागलपुर', lat: 25.2425, lon: 86.9842 },
  'Darbhanga': { name: 'Darbhanga', hindiName: 'दरभंगा', lat: 26.1542, lon: 85.8918 },
  'Purnia': { name: 'Purnia', hindiName: 'पूर्णिया', lat: 25.7771, lon: 87.4753 },
  'Nalanda': { name: 'Nalanda', hindiName: 'नालंदा', lat: 25.1982, lon: 85.5149 },
  'Rohtas': { name: 'Rohtas', hindiName: 'रोहतास', lat: 24.9510, lon: 84.0298 },
  'Vaishali': { name: 'Vaishali', hindiName: 'वैशाली', lat: 25.6858, lon: 85.2146 },
  'Samastipur': { name: 'Samastipur', hindiName: 'समस्तीपुर', lat: 25.8629, lon: 85.7811 },
  'Sitamarhi': { name: 'Sitamarhi', hindiName: 'सीतामढ़ी', lat: 26.5977, lon: 85.4891 },
  'Madhubani': { name: 'Madhubani', hindiName: 'मधुबनी', lat: 26.3547, lon: 86.0719 },
  'East Champaran': { name: 'East Champaran', hindiName: 'पूर्वी चंपारण', lat: 26.6469, lon: 84.9089 },
  'West Champaran': { name: 'West Champaran', hindiName: 'पश्चिमी चंपारण', lat: 26.8023, lon: 84.5042 },
  'Saran': { name: 'Saran', hindiName: 'सारण', lat: 25.7848, lon: 84.7274 },
  'Siwan': { name: 'Siwan', hindiName: 'सीवान', lat: 26.2243, lon: 84.3600 },
  'Gopalganj': { name: 'Gopalganj', hindiName: 'गोपालगंज', lat: 26.4673, lon: 84.4452 },
  'Begusarai': { name: 'Begusarai', hindiName: 'बेगूसराय', lat: 25.4182, lon: 86.1272 },
  'Saharsa': { name: 'Saharsa', hindiName: 'सहरसा', lat: 25.8835, lon: 86.6006 },
  'Madhepura': { name: 'Madhepura', hindiName: 'मधेपुरा', lat: 25.9262, lon: 86.7941 },
  'Supaul': { name: 'Supaul', hindiName: 'सुपौल', lat: 26.1260, lon: 86.6062 },
  'Katihar': { name: 'Katihar', hindiName: 'कटिहार', lat: 25.5434, lon: 87.5739 },
  'Araria': { name: 'Araria', hindiName: 'अररिया', lat: 26.1504, lon: 87.4957 },
  'Kishanganj': { name: 'Kishanganj', hindiName: 'किशनगंज', lat: 26.0968, lon: 87.9431 },
  'Munger': { name: 'Munger', hindiName: 'मुंगेर', lat: 25.3757, lon: 86.4744 },
  'Khagaria': { name: 'Khagaria', hindiName: 'खगड़िया', lat: 25.5034, lon: 86.4828 },
  'Jamui': { name: 'Jamui', hindiName: 'जमुई', lat: 24.9255, lon: 86.2238 },
  'Lakhisarai': { name: 'Lakhisarai', hindiName: 'लखीसराय', lat: 25.1741, lon: 85.9080 },
  'Sheikhpura': { name: 'Sheikhpura', hindiName: 'शेखपुरा', lat: 25.1408, lon: 85.8576 },
  'Nawada': { name: 'Nawada', hindiName: 'नवादा', lat: 24.8872, lon: 85.5434 },
  'Aurangabad': { name: 'Aurangabad', hindiName: 'औरंगाबाद', lat: 24.7539, lon: 84.3736 },
  'Jehanabad': { name: 'Jehanabad', hindiName: 'जहानाबाद', lat: 25.2132, lon: 84.9877 },
  'Arwal': { name: 'Arwal', hindiName: 'अरवल', lat: 25.2443, lon: 84.6738 },
  'Buxar': { name: 'Buxar', hindiName: 'बक्सर', lat: 25.5647, lon: 83.9777 },
  'Bhojpur': { name: 'Bhojpur', hindiName: 'भोजपुर', lat: 25.5560, lon: 84.6603 },
  'Kaimur': { name: 'Kaimur', hindiName: 'कैमूर', lat: 25.0449, lon: 83.6143 },
  'Banka': { name: 'Banka', hindiName: 'बांका', lat: 24.8856, lon: 86.9234 }
};

// Weather code mapping per WMO standard
export function interpretWeatherCode(code: number): { hindi: string; english: string } {
  switch (code) {
    case 0:
      return { hindi: 'साफ़ मौसम', english: 'Clear Sky' };
    case 1:
      return { hindi: 'मुख्यतः साफ़', english: 'Mainly Clear' };
    case 2:
      return { hindi: 'आंशिक बादल', english: 'Partly Cloudy' };
    case 3:
      return { hindi: 'घने बादल', english: 'Overcast' };
    case 45:
    case 48:
      return { hindi: 'धुंध / कोहरा', english: 'Foggy' };
    case 51:
    case 53:
    case 55:
      return { hindi: 'हल्की बूंदाबांदी', english: 'Drizzle' };
    case 61:
    case 63:
    case 65:
      return { hindi: 'वर्षा / बारिश', english: 'Rain' };
    case 71:
    case 73:
    case 75:
      return { hindi: 'ओलावृष्टि / हिमपात', english: 'Snow / Hail' };
    case 80:
    case 81:
    case 82:
      return { hindi: 'तेज़ बौछारें', english: 'Rain Showers' };
    case 95:
    case 96:
    case 99:
      return { hindi: 'गरज के साथ बारिश', english: 'Thunderstorm' };
    default:
      return { hindi: 'सुहावना मौसम', english: 'Pleasant' };
  }
}

// Extract clean district key from formatted strings e.g. "पटना (Patna)" -> "Patna"
export function resolveDistrictKey(districtStr: string): string {
  if (!districtStr || districtStr.startsWith('सभी')) {
    return 'Patna'; // Default capital city
  }
  
  for (const key of Object.keys(BIHAR_DISTRICT_COORDS)) {
    if (districtStr.toLowerCase().includes(key.toLowerCase())) {
      return key;
    }
  }

  // Check Hindi names
  for (const [key, val] of Object.entries(BIHAR_DISTRICT_COORDS)) {
    if (districtStr.includes(val.hindiName)) {
      return key;
    }
  }

  return 'Patna';
}

// Fetch real-time weather from Open-Meteo
export async function fetchDistrictWeather(districtKey: string): Promise<WeatherData> {
  const resolvedKey = resolveDistrictKey(districtKey);
  const districtInfo = BIHAR_DISTRICT_COORDS[resolvedKey] || BIHAR_DISTRICT_COORDS['Patna'];

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${districtInfo.lat}&longitude=${districtInfo.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,is_day&timezone=Asia%2FKolkata`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Weather fetch failed: ${res.statusText}`);
  }

  const data = await res.json();
  const current = data.current || {};
  const weatherCode = current.weather_code ?? 0;
  const condition = interpretWeatherCode(weatherCode);

  return {
    districtName: districtInfo.hindiName,
    temperature: Math.round(current.temperature_2m ?? 28),
    weatherCode,
    conditionHindi: condition.hindi,
    conditionEnglish: condition.english,
    windSpeed: Math.round(current.wind_speed_10m ?? 8),
    humidity: Math.round(current.relative_humidity_2m ?? 55),
    isDay: current.is_day === 1,
    updatedAt: new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }),
  };
}
