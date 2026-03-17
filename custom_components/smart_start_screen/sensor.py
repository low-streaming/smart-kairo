import logging
from datetime import timedelta
from homeassistant.components.sensor import SensorEntity

_LOGGER = logging.getLogger(__name__)
SCAN_INTERVAL = timedelta(minutes=30)

async def async_setup_platform(hass, config, async_add_entities, discovery_info=None):
    """Set up the SmartStartScreen sensors."""
    async_add_entities([SmartStartNewsSensor()], True)

class SmartStartNewsSensor(SensorEntity):
    """Sensor that fetches news from OpenKairo."""

    def __init__(self):
        self._state = "System Bereit"
        self._attr_name = "SmartStart Status"
        self._attr_unique_id = "smart_start_status_001"
        self._attr_extra_state_attributes = {
            "news": "Willkommen bei deinem neuen OpenKairo System!",
            "update_available": False,
            "version": "2.0.4",
            "dashboard_tip": "Wusstest du? Du kannst dein Dashboard komplett lokal anpassen."
        }

    @property
    def state(self):
        return self._state

    async def async_update(self):
        """Fetch new state data for the sensor."""
        # Hier kann später die Logik rein, um News von openkairo.de zu laden
        pass
