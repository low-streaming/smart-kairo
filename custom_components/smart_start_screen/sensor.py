import logging
import aiohttp
import async_timeout
from datetime import timedelta
from homeassistant.components.sensor import SensorEntity

from .const import GITHUB_API_URL

_LOGGER = logging.getLogger(__name__)
SCAN_INTERVAL = timedelta(minutes=30)

async def async_setup_platform(hass, config, async_add_entities, discovery_info=None):
    """Set up the SmartStartScreen sensors."""
    async_add_entities([SmartStartGitHubSensor()], True)

class SmartStartGitHubSensor(SensorEntity):
    """Sensor that fetches updates directly from GitHub for OpenKairo."""

    def __init__(self):
        self._state = "Online"
        self._attr_name = "OpenKairo OS Status"
        self._attr_unique_id = "openkairo_github_status"
        self._attr_extra_state_attributes = {
            "github_news": "Lade aktuelle Nachrichten...",
            "version": "2.0.4",
            "dashboard_tip": "OpenKairo OS läuft lokal auf diesem Node.",
            "last_commit": "Initialisiere..."
        }

    @property
    def state(self):
        return self._state

    async def async_update(self):
        """Fetch latest commit from GitHub to use as news."""
        try:
            async with async_timeout.timeout(10):
                async with aiohttp.ClientSession() as session:
                    async with session.get(f"https://api.github.com/repos/open-kairo/smart-kairo/commits") as response:
                        if response.status == 200:
                            commits = await response.json()
                            if commits:
                                msg = commits[0].get("commit", {}).get("message", "System aktuell.")
                                self._attr_extra_state_attributes["github_news"] = msg
                                self._attr_extra_state_attributes["last_commit"] = msg
                                self._state = "System Optimal"
        except Exception as e:
            _LOGGER.error("GitHub News Update failed: %s", e)
            self._state = "Offline Mode"
            self._attr_extra_state_attributes["github_news"] = "Verbindung zu GitHub fehlgeschlagen. Lokale Instanz läuft."
