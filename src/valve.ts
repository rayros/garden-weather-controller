import { AsyncMqttClient } from "async-mqtt";
import { MoreThanOrEqual } from "typeorm";
import { AppDataSource } from "./data-source";
import { HourlyWeather } from "./entity/HourlyWeather";

const minAverageDailyTemperature = Number(process.env.MIN_AVERAGE_DAILY_TEMPERATURE_IN_CELSIUS);

export const openValve = async (client: AsyncMqttClient) => {
  await client.publish(process.env.MQTT_VALVE_TOPIC, 'OPEN');
}

export const closeValve = async (client: AsyncMqttClient) => {
  await client.publish(process.env.MQTT_VALVE_TOPIC, 'CLOSE');
}

export const requestValveState = async (client: AsyncMqttClient) => {
  await client.publish(process.env.MQTT_VALVE_TOPIC, '');
}

export const shouldOpenValve = async () => {
  const oneDay = new Date();
  oneDay.setDate(oneDay.getDate() - 1);

  const hourlyWeatherLast24h = await AppDataSource.manager.find(HourlyWeather, {
    where: {
      date: MoreThanOrEqual(oneDay)
    }
  });

  console.log(hourlyWeatherLast24h)

  if (hourlyWeatherLast24h.length < 24) {
    return false;
  }

  const rainLast24h = hourlyWeatherLast24h.reduce((acc, curr) => acc + curr.rain, 0);
  const averageTempLast24h = hourlyWeatherLast24h.reduce((acc, curr) => acc + curr.temp, 0) / hourlyWeatherLast24h.length;

  console.log("rainLast24h", rainLast24h);
  console.log("averageTempLast24h", averageTempLast24h);
  console.log("minAverageDailyTemperature", minAverageDailyTemperature);

  return rainLast24h === 0 && averageTempLast24h > minAverageDailyTemperature;
}