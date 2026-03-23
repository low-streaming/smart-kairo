"""OpenKAIRO OS Integration."""
import logging
import os

from homeassistant.core import HomeAssistant
from homeassistant.config_entries import ConfigEntry
from homeassistant.components.frontend import async_register_built_in_panel, async_remove_panel

from .const import DOMAIN, PANEL_NAME, PANEL_TITLE, PANEL_ICON, PANEL_URL

_LOGGER = logging.getLogger(__name__)

async def async_setup(hass: HomeAssistant, config: dict):
    """Set up the OpenKAIRO OS component."""
    return True

async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry):
    """Set up OpenKAIRO OS from a config entry."""
    hass.data.setdefault(DOMAIN, {})

    # The path pointing to our custom JS and Assets
    static_path = hass.config.path(f"custom_components/{DOMAIN}/www")

    # Serve the static files under /openkairo_os endpoint
    hass.http.register_static_path(
        url_path="/openkairo_os",
        path=static_path,
        cache_headers=False
    )

    # Automatically register custom cards so users don't have to fiddle with YAML Resources
    for file_name in os.listdir(static_path):
        if file_name.endswith(".js"):
            # You can check if already in Lovelace resources, but simply serving them is step 1.
            # To magically register as Lovelace resource automatically:
            _LOGGER.info(f"OpenKAIRO Resource detected: {file_name}")

    # Register the Custom 'Builder/Hub' Panel in the Sidebar
    async_register_built_in_panel(
        hass,
        component_name="custom",
        sidebar_title=PANEL_TITLE,
        sidebar_icon=PANEL_ICON,
        frontend_url_path=PANEL_URL,
        config={
            "_panel_custom": {
                "name": f"{DOMAIN}-panel", # Points to <openkairo-panel> Element
                "embed_iframe": False,
                "trust_external": False,
                "js_url": "/openkairo_os/openkairo_panel.js"
            }
        },
        require_admin=True
    )

    _LOGGER.info("OpenKAIRO OS successfully initialized.")
    return True

async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry):
    """Unload a config entry."""
    async_remove_panel(hass, PANEL_URL)
    _LOGGER.info("OpenKAIRO OS unloaded.")
    return True
