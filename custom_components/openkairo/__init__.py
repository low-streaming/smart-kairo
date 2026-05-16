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
    hass.data[DOMAIN] = config or {}

    static_path = hass.config.path(f"custom_components/{DOMAIN}/www")
    
    # Ensure folder exists
    if not os.path.exists(static_path):
        os.makedirs(static_path)

    # Register static paths
    await hass.http.async_register_static_paths([
        StaticPathConfig(url_path="/openkairo_os", path=static_path, cache_headers=False),
        StaticPathConfig(url_path="/smart_start_screen", path=static_path, cache_headers=False)
    ])

    version = await hass.async_add_executor_job(get_version, hass)
    files = await hass.async_add_executor_job(os.listdir, static_path)
    
    # 1. Add as extra JS URLs (for global OS features)
    for file_name in files:
        if file_name.endswith(".js"):
            url = f"/openkairo_os/{file_name}?v={version}"
            add_extra_js_url(hass, url)

    # 2. Register specifically as Lovelace Resources (Crucial for Editor support!)
    try:
        if "lovelace" in hass.data:
            lovelace = hass.data["lovelace"]
            # Check for storage-based lovelace resources
            if hasattr(lovelace, "resources"):
                resources = lovelace.resources
                if resources:
                    # We register the primary cards
                    for card_file in ["smart_start_screen_card.js", "openkairo_custom_card.js"]:
                        if card_file in files:
                            url = f"/openkairo_os/{card_file}"
                            exists = any(res.get("url") == url for res in resources.async_items())
                            if not exists:
                                _LOGGER.info(f"Registering Lovelace Resource: {url}")
                                await resources.async_create_item({"res_type": "module", "url": url})
    except Exception as e:
        _LOGGER.warning(f"Lovelace Resource registration failed (this is normal on some systems): {e}")

    # Start platforms
    for platform in ["sensor", "weather"]:
        hass.async_create_task(
            discovery.async_load_platform(hass, platform, DOMAIN, {}, config or {})
        )

    _LOGGER.info("OpenKAIRO OS V4.2.9 fully initialized.")

async def async_setup(hass: HomeAssistant, config: dict):
    """Set up via YAML."""
    if DOMAIN in config:
        await _setup_internal(hass, config)
    return True

async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry):
    """Set up via UI."""
    # Combine data and options
    config = {**entry.data, **entry.options}
    await _setup_internal(hass, config)
    entry.async_on_unload(entry.add_update_listener(update_listener))
    return True

async def update_listener(hass, entry):
    """Handle options update."""
    await hass.config_entries.async_reload(entry.entry_id)

async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry):
    """Unload."""
    if DOMAIN in hass.data:
        del hass.data[DOMAIN]
    async_remove_panel(hass, PANEL_URL)
    return True

def get_version(hass):
    try:
        manifest_path = os.path.join(os.path.dirname(__file__), "manifest.json")
        with open(manifest_path, "r") as f:
            manifest = json.load(f)
            return manifest.get("version", "1.0.0")
    except Exception:
        return "1.0.0"
