import { useState, useEffect } from 'react';
import { 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  Sun, 
  CloudLightning, 
  Cloudy, 
  CloudDrizzle,
  Loader
} from 'lucide-react';

interface WeatherData {
  temp: number;
  description: string;
  main: string;
  city: string;
  country: string;
}

export function Weather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async (latitude: number, longitude: number) => {
      try {
        const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
        );
        
        if (!response.ok) {
          throw new Error('Weather data not available');
        }

        const data = await response.json();
        setWeather({
          temp: Math.round(data.main.temp),
          description: data.weather[0].description,
          main: data.weather[0].main,
          city: data.name,
          country: data.sys.country
        });
      } catch (err) {
        console.error('Error fetching weather:', err);
        setError('Unable to fetch weather data');
      } finally {
        setLoading(false);
      }
    };

    const getLocation = () => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            fetchWeather(position.coords.latitude, position.coords.longitude);
          },
          (err) => {
            console.error('Error getting location:', err);
            setError('Unable to get location');
            setLoading(false);
          }
        );
      } else {
        setError('Geolocation not supported');
        setLoading(false);
      }
    };

    getLocation();
  }, []);

  const getWeatherIcon = (main: string) => {
    switch (main.toLowerCase()) {
      case 'clear':
        return <Sun className="h-8 w-8 text-yellow-500" />;
      case 'rain':
        return <CloudRain className="h-8 w-8 text-blue-500" />;
      case 'snow':
        return <CloudSnow className="h-8 w-8 text-blue-200" />;
      case 'thunderstorm':
        return <CloudLightning className="h-8 w-8 text-purple-500" />;
      case 'drizzle':
        return <CloudDrizzle className="h-8 w-8 text-blue-400" />;
      case 'clouds':
        return <Cloudy className="h-8 w-8 text-gray-500" />;
      default:
        return <Cloud className="h-8 w-8 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-center space-x-2">
          <Loader className="h-5 w-5 animate-spin text-blue-500" />
          <span className="text-gray-500 dark:text-gray-400">
            Loading weather...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <p className="text-red-500 text-center">{error}</p>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {weather.city}, {weather.country}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
            {weather.description}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {getWeatherIcon(weather.main)}
          <span className="text-3xl font-bold text-gray-900 dark:text-white">
            {weather.temp}°C
          </span>
        </div>
      </div>
    </div>
  );
} 