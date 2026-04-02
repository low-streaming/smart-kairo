"""OpenKAIRO OS Integration."""
import logging
import os
import time

from homeassistant.core import HomeAssistant
from homeassistant.config_entries import ConfigEntry
from homeassistant.components.frontend import async_register_built_in_panel, async_remove_panel
from homeassistant.components.http import StaticPathConfig

from .const import DOMAIN, PANEL_NAME, PANEL_TITLE, PANEL_ICON, PANEL_URL

_LOGGER = logging.getLogger(__name__)

async def _setup_internal(hass: HomeAssistant):
    """Shared setup logic for both YAML and UI config."""
    if DOMAIN in hass.data:
        return
    hass.data[DOMAIN] = True

    static_path = hass.config.path(f"custom_components/{DOMAIN}/www")
    
    # Check if folder exists, if not create it
    if not os.path.exists(static_path):
        os.makedirs(static_path)

    await hass.http.async_register_static_paths([
        StaticPathConfig(
            url_path="/openkairo_os",
            path=static_path,
            cache_headers=False
        )
    ])

    files = await hass.async_add_executor_job(os.listdir, static_path)
    for file_name in files:
        if file_name.endswith(".js"):
            _LOGGER.info(f"OpenKAIRO Resource detected: {file_name}")

    try:
        async_register_built_in_panel(
            hass,
            component_name="custom",
            sidebar_title=PANEL_TITLE,
            sidebar_icon=PANEL_ICON,
            frontend_url_path=PANEL_URL,
            config={
                "_panel_custom": {
                    "name": "openkairo-panel",
                    "embed_iframe": False,
                    "trust_external": False,
                    "js_url": f"/openkairo_os/openkairo_panel_v10.js?v={int(time.time())}"
                }
            },
            require_admin=True
        )

        # Register Dashboard Card as Lovelace Resource
        if "lovelace" in hass.data:
            lovelace = hass.data["lovelace"]
            if hasattr(lovelace, "resources"):
                # Handle storage-based lovelace
                resources = lovelace.resources
                if resources:
                    url = "/openkairo_os/openkairo_custom_card.js"
                    exists = any(res.get("url") == url for res in resources.async_items())
                    if not exists:
                        _LOGGER.info(f"Registering OpenKAIRO Dashboard Card resource: {url}")
                        await resources.async_create_item({"res_type": "module", "url": url})
    except Exception as e:
        _LOGGER.warning(f"Failed to register OpenKAIRO resources: {e}")
        pass # Panel or resource might already exist or system not ready

async def async_setup(hass: HomeAssistant, config: dict):
    """Set up the OpenKAIRO OS component via YAML configuration."""
    if DOMAIN in config:
        await _setup_internal(hass)
    return True

async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry):
    """Set up OpenKAIRO OS from a config entry (UI)."""
    await _setup_internal(hass)
    _LOGGER.info("OpenKAIRO OS successfully initialized via UI.")
    return True

async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry):
    """Unload a config entry."""
    if DOMAIN in hass.data:
        del hass.data[DOMAIN]
    async_remove_panel(hass, PANEL_URL)
    _LOGGER.info("OpenKAIRO OS unloaded.")
    return True
