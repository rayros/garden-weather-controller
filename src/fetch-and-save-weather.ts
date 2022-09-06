import axios from "axios";
import { AppDataSource } from "./data-source";
import { HourlyWeather } from "./entity/HourlyWeather";

export const fetchAndSaveWeather = async () => {
  const weather = await fetchWeather();
  const weatherEntity = new HourlyWeather();
  weatherEntity.rain = weather.rain;
  weatherEntity.temp = weather.temp;
  console.log(weatherEntity);
  await AppDataSource.manager.save(weatherEntity);
}

async function fetchWeather() {
  const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${process.env.WEATHER_PLACE_LAT}&lon=${process.env.WEATHER_PLACE_LON}&appid=${process.env.OPEN_WEATHER_MAP_API_KEY}&units=metric`);
  return {
    rain: response.data.rain ? response.data.rain["1h"] : 0,
    temp: response.data.main.temp,
  }
}
