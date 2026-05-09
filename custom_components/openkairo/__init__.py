"""OpenKAIRO OS Integration."""
import logging
import os
import json
import time

from homeassistant.core import HomeAssistant
from homeassistant.config_entries import ConfigEntry
from homeassistant.components.frontend import async_register_built_in_panel, async_remove_panel, add_extra_js_url
from homeassistant.components.http import StaticPathConfig
from homeassistant.helpers import discovery

from .const import DOMAIN, PANEL_NAME, PANEL_TITLE, PANEL_ICON, PANEL_URL

_LOGGER = logging.getLogger(__name__)

async def _setup_internal(hass: HomeAssistant, config: dict = None):
    """Shared setup logic for both YAML and UI config."""
    if DOMAIN in hass.data:
        return
    hass.data[DOMAIN] = True

    static_path = hass.config.path(f"custom_components/{DOMAIN}/www")
    
    # Check if folder exists, if not create it
    if not os.path.exists(static_path):
        os.makedirs(static_path)

    # Register multiple paths for backward compatibility
    await hass.http.async_register_static_paths([
        StaticPathConfig(url_path="/openkairo_os", path=static_path, cache_headers=False),
        StaticPathConfig(url_path="/smart_start_screen", path=static_path, cache_headers=False)
    ])

    version = get_version(hass)
    files = await hass.async_add_executor_job(os.listdir, static_path)
    
    for file_name in files:
        if file_name.endswith(".js"):
            # Inject as extra JS URL for global availability
            # Using /openkairo_os/ as the primary path
            url = f"/openkairo_os/{file_name}?v={version}"
            add_extra_js_url(hass, url)
            _LOGGER.info(f"OpenKAIRO Resource registered: {url}")

    # Start the sensor platform
    hass.async_create_task(
        discovery.async_load_platform(hass, "sensor", DOMAIN, {}, config or {})
    )

    _LOGGER.info("OpenKAIRO OS successfully initialized.")

async def async_setup(hass: HomeAssistant, config: dict):
    """Set up the OpenKAIRO OS component via YAML configuration."""
    if DOMAIN in config:
        await _setup_internal(hass, config)
    return True

async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry):
    """Set up OpenKAIRO OS from a config entry (UI)."""
    await _setup_internal(hass)
    return True

async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry):
    """Unload a config entry."""
    if DOMAIN in hass.data:
        del hass.data[DOMAIN]
    async_remove_panel(hass, PANEL_URL)
    _LOGGER.info("OpenKAIRO OS unloaded.")
    return True

def get_version(hass):
    """Get version from manifest."""
    try:
        manifest_path = os.path.join(os.path.dirname(__file__), "manifest.json")
        with open(manifest_path, "r") as f:
            manifest = json.load(f)
            return manifest.get("version", "1.0.0")
    except Exception:
        return "1.0.0"
