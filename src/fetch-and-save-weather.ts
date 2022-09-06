import { AsyncMqttClient } from "async-mqtt";
import axios from "axios";
import { AppDataSource } from "./data-source";
import { HourlyWeather } from "./entity/HourlyWeather";

export const fetchAndSaveWeather = async (client: AsyncMqttClient) => {
  const weather = await fetchWeather();
  const hourlyWeather = new HourlyWeather();
  hourlyWeather.rain = weather.rain;
  hourlyWeather.temp = weather.temp;
  await AppDataSource.manager.save(hourlyWeather);
  console.log(await AppDataSource.manager.findOne(HourlyWeather, {}));
  await client.publish(process.env.MQTT_WEATHER_RESULT_TOPIC, JSON.stringify(hourlyWeather));
}

async function fetchWeather() {
  const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${process.env.WEATHER_PLACE_LAT}&lon=${process.env.WEATHER_PLACE_LON}&appid=${process.env.OPEN_WEATHER_MAP_API_KEY}&units=metric`);
  return {
    rain: response.data.rain ? response.data.rain["1h"] as number : 0,
    temp: response.data.main.temp as number,
  }
}
