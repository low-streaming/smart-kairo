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
    
    # Der Fehler lag an der veralteten Methode. 
    # In neuen HA Versionen nutzen wir .http.async_register_static_paths
    www_dir = os.path.join(os.path.dirname(__file__), "www")
    
    # Wir registrieren den statischen Pfad für unsere JS-Karte
    hass.http.async_register_static_paths([
        hass.http.StaticPathConfig(
            "/smart_start_screen/card.js",
            os.path.join(www_dir, "smart_start_screen_card.js"),
            False
        )
    ])

    # Frontend anweisen, das Script zu laden
    add_extra_js_url(hass, "/smart_start_screen/card.js")

    _LOGGER.info("SmartStartScreen Integration initialized with async_register_static_paths")
    
    # Sensoren laden
    hass.async_create_task(
        hass.helpers.discovery.async_load_platform("sensor", DOMAIN, {}, config)
    )
    
    return True
