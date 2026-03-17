import logging
import os
from homeassistant.core import HomeAssistant
from homeassistant.helpers.typing import ConfigType
from homeassistant.components.frontend import add_extra_js_url

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up the SmartStartScreen integration."""
    hass.data.setdefault(DOMAIN, {})
    
    # 1. Register the static path so HA serves the JS file
    # Path in browser: /smart_start_screen/card.js
    # Actual path: /config/custom_components/smart_start_screen/www/smart_start_screen_card.js
    www_dir = os.path.join(os.path.dirname(__file__), "www")
    
    hass.http.register_static_path(
        "/smart_start_screen/card.js",
        os.path.join(www_dir, "smart_start_screen_card.js"),
        False
    )

    # 2. Tell the frontend to load this script
    # This acts like adding a resource manually in Dashboards -> Resources
    add_extra_js_url(hass, "/smart_start_screen/card.js")

    _LOGGER.info("SmartStartScreen Integration initialized - Custom UI served at /smart_start_screen/card.js")
    
    # Load sensors via discovery
    hass.async_create_task(
        hass.helpers.discovery.async_load_platform("sensor", DOMAIN, {}, config)
    )
    
    return True
