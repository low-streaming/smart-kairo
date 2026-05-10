import logging
import aiohttp
import async_timeout
from datetime import timedelta

from homeassistant.components.weather import (
    WeatherEntity,
    WeatherEntityFeature,
)
from homeassistant.const import UnitOfTemperature

from .const import DOMAIN, CONF_POSTCODE, BRIGHT_SKY_URL

_LOGGER = logging.getLogger(__name__)
SCAN_INTERVAL = timedelta(minutes=30)

async def async_setup_platform(hass, config, async_add_entities, discovery_info=None):
    """Set up the OpenKAIRO weather platform."""
    conf = hass.data.get(DOMAIN, {})
    postcode = conf.get(CONF_POSTCODE)
    
    if postcode:
        async_add_entities([OpenKairoWeather(postcode)], True)

async def async_setup_entry(hass, entry, async_add_entities):
    """Set up OpenKAIRO weather from a config entry."""
    postcode = entry.data.get(CONF_POSTCODE)
    if postcode:
        async_add_entities([OpenKairoWeather(postcode)], True)

class OpenKairoWeather(WeatherEntity):
    """Representation of an OpenKAIRO weather entity."""

    def __init__(self, postcode):
        self._postcode = postcode
        self._attr_name = f"OpenKairo Wetter ({postcode})"
        self._attr_unique_id = f"openkairo_weather_entity_{postcode}"
        self._attr_native_temperature_unit = UnitOfTemperature.CELSIUS
        
        self._temp = None
        self._condition = None
        self._humidity = None
        self._pressure = None
        self._wind_speed = None

    @property
    def condition(self):
        """Return the current condition."""
        return self._condition

    @property
    def native_temperature(self):
        """Return the temperature."""
        return self._temp

    @property
    def native_pressure(self):
        """Return the pressure."""
        return self._pressure

    @property
    def humidity(self):
        """Return the humidity."""
        return self._humidity

    @property
    def native_wind_speed(self):
        """Return the wind speed."""
        return self._wind_speed

    async def async_update(self):
        """Fetch current weather from Bright Sky."""
        try:
            # 1. Resolve PLZ to coordinates
            geo_url = f"https://api.zippopotam.us/de/{self._postcode}"
            async with async_timeout.timeout(10):
                async with aiohttp.ClientSession() as session:
                    async with session.get(geo_url) as geo_resp:
                        if geo_resp.status == 200:
                            geo_data = await geo_resp.json()
                            if geo_data.get("places"):
                                place = geo_data["places"][0]
                                lat = place["latitude"]
                                lon = place["longitude"]
                                
                                # 2. Fetch weather from Bright Sky using coordinates
                                weather_url = f"{BRIGHT_SKY_URL}?lat={lat}&lon={lon}&date=now"
                                async with session.get(weather_url) as weather_resp:
                                    if weather_resp.status == 200:
                                        data = await weather_resp.json()
                                        weather_list = data.get("weather", [])
                                        if weather_list:
                                            weather = weather_list[0]
                                            self._temp = weather.get("temperature")
                                            self._condition = weather.get("condition")
                                            self._humidity = weather.get("relative_humidity")
                                            self._pressure = weather.get("pressure_msl")
                                            self._wind_speed = weather.get("wind_speed")
        except Exception as e:
            _LOGGER.error("Weather Update failed: %s", e)
