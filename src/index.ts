import { AppDataSource } from "./data-source";
import * as cron from "node-cron";
import { connectAsync } from 'async-mqtt';
import { fetchAndSaveWeather } from "./fetch-and-save-weather";
import { closeValve, openValve, shouldOpenValve } from "./valve";
import { HourlyWeather } from "./entity/HourlyWeather";

AppDataSource.initialize()
  .then(async () => {

    const client = await connectAsync(`mqtt://${process.env.MQTT_HOST}:${process.env.MQTT_PORT}`, {
      username: process.env.MQTT_USER,
      password: process.env.MQTT_PASSWORD
    });

    await client.subscribe([
      process.env.MQTT_WEATHER_STATUS_TOPIC
    ]);

    client.on('message', async (topic, message) => {
      if (topic === process.env.MQTT_WEATHER_STATUS_TOPIC) {
        const hourlyWeather = await AppDataSource.manager.findOne(HourlyWeather, {});
        await client.publish(process.env.MQTT_WEATHER_RESULT_TOPIC, JSON.stringify(hourlyWeather));
      } else {
        console.log(topic, message.toString());
      }
    })

    cron.schedule(
      "0 4 * * *", // At 04:00
      async () => {
        console.log("Opening valve at 04:00");
        if (await shouldOpenValve()) {
          openValve(client);
        }
      }
    ).start();
    cron.schedule(
      "0 6 * * *", // At 06:00
      () => {
        console.log("Closing valve at 06:00");
        closeValve(client);
      }
    ).start();

    cron.schedule(
      "0 * * * *", // At minute 0
      async () => {
        console.log("Checking rain and temperature.");
        await fetchAndSaveWeather(client);
      }
    ).start();

    await closeValve(client);
  })
  .catch((error) => console.log(error));


