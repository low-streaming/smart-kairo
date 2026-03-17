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
            "latest_commit": "Initialisiere...",
            "last_update": "Unbekannt",
            "version": "2.0.4",
            "status_color": "#10b981",
            "github_news": "Verbinde mit GitHub für aktuelle Updates..."
        }

    @property
    def state(self):
        return self._state

    async def async_update(self):
        """Fetch real data from GitHub API."""
        try:
            async with async_timeout.timeout(10):
                async with aiohttp.ClientSession() as session:
                    # 1. Fetch Latest Commits (as News)
                    async with session.get(f"{GITHUB_API_URL}/commits") as response:
                        if response.status == 200:
                            commits = await response.json()
                            if commits:
                                latest = commits[0]
                                msg = latest.get("commit", {}).get("message", "Keine Nachricht")
                                date = latest.get("commit", {}).get("author", {}).get("date", "")
                                self._attr_extra_state_attributes["latest_commit"] = msg
                                self._attr_extra_state_attributes["last_update"] = date
                                # Wir nutzen die Commit-Nachricht als 'geile News'
                                self._attr_extra_state_attributes["github_news"] = f"LETZTES UPDATE: {msg}"

                    # 2. Status check (Simuliert für die Hardware)
                    self._state = "System Optimal"
                    self._attr_extra_state_attributes["status_color"] = "#10b981"

        except Exception as e:
            _LOGGER.error("Error fetching data from GitHub: %s", e)
            self._state = "Offline"
            self._attr_extra_state_attributes["status_color"] = "#ef4444"
