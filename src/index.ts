import { connectAsync } from 'async-mqtt';
import * as cron from "node-cron";
import { AppDataSource } from "./data-source";
import { fetchAndSaveWeather, publishLastHourlyWeather } from "./fetch-and-save-weather";
import { closeValve, openValve, shouldOpenValve } from "./valve";

AppDataSource.initialize()
  .then(async () => {

    const client = await connectAsync(`mqtt://${process.env.MQTT_HOST}:${process.env.MQTT_PORT}`, {
      username: process.env.MQTT_USER,
      password: process.env.MQTT_PASSWORD
    });

    await client.subscribe([
      process.env.MQTT_WEATHER_STATUS_TOPIC
    ]);

    await closeValve(client);

    client.on('message', async (topic: string) => {
      if (topic === process.env.MQTT_WEATHER_STATUS_TOPIC) {
        await publishLastHourlyWeather(client);
      }
    })

    cron.schedule(
      "0 4 * * *", // At 04:00
      async () => {
        console.log("Opening valve at 04:00");
        if (await shouldOpenValve()) {
          openValve(client);
        }
      },
      {
        timezone: process.env.TIMEZONE
      }
    ).start();

    cron.schedule(
      "0 6 * * *", // At 06:00
      () => {
        console.log("Closing valve at 06:00");
        closeValve(client);
      },
      {
        timezone: process.env.TIMEZONE
      }
    ).start();

    cron.schedule(
      "0 * * * *", // At minute 0
      async () => {
        console.log("Checking rain and temperature.");
        await fetchAndSaveWeather(client);
      }
    ).start();

  })
  .catch((error) => console.log(error));


