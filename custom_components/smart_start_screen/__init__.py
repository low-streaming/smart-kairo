import logging
import os
from homeassistant.core import HomeAssistant
from homeassistant.helpers.typing import ConfigType

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up the SmartStartScreen integration."""
    hass.data.setdefault(DOMAIN, {})
    
    # 1. Register the custom card as a Lovelace resource
    # This makes the "geile" UI instantly available without manual YAML adding
    www_dir = os.path.join(os.path.dirname(__file__), "www")
    
    # Create static view for our JS file
    hass.http.register_static_path(
        "/smart_start_screen/card.js",
        os.path.join(www_dir, "smart_start_screen_card.js"),
        False
    )

    # 2. Add as Lovelace Resource automatically (if not already there)
    # This is the "Pro" way so the customer doesn't have to do anything
    resources = hass.data.get("lovelace", {}).get("resources")
    if resources:
        resource_path = "/smart_start_screen/card.js"
        if not any(res.get("url") == resource_path for res in await resources.async_get_items()):
            await resources.async_create_item({"res_type": "module", "url": resource_path})

    _LOGGER.info("SmartStartScreen Integration initialized with Custom UI")
    
    # Load sensors
    hass.async_create_task(
        hass.helpers.discovery.async_load_platform("sensor", DOMAIN, {}, config)
    )
    
    return True
