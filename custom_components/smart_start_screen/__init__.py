import logging
import os
from homeassistant.core import HomeAssistant
from homeassistant.helpers.typing import ConfigType
from homeassistant.helpers import discovery
from homeassistant.components.frontend import add_extra_js_url
from homeassistant.components.http import StaticPathConfig

DOMAIN = "smart_start_screen"
_LOGGER = logging.getLogger(__name__)

async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up the SmartStartScreen integration."""
    hass.data.setdefault(DOMAIN, {})
    
    www_dir = os.path.join(os.path.dirname(__file__), "www")
    js_path = os.path.join(www_dir, "smart_start_screen_card.js")
    
    if os.path.exists(js_path):
        # Das hier ist die korrekte, aktuelle Methode mit 'await'!
        await hass.http.async_register_static_paths([
            StaticPathConfig("/smart_start_screen/card.js", js_path, False)
        ])
        add_extra_js_url(hass, "/smart_start_screen/card.js")
        _LOGGER.info("SmartStartScreen: UI registered successfully")
    else:
        _LOGGER.error("SmartStartScreen: JS file not found!")

    hass.async_create_task(
        discovery.async_load_platform(hass, "sensor", DOMAIN, {}, config)
    )
    
    return True
