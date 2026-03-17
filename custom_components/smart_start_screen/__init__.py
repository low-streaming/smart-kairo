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
    
    # Pfad zum www Ordner innerhalb der Integration
    www_dir = os.path.join(os.path.dirname(__file__), "www")
    
    # Die sicherste Methode, die in fast allen HA Versionen funktioniert:
    # Wir registrieren den Pfad direkt über die HTTP Komponente
    hass.http.register_static_path(
        "/smart_start_screen/card.js",
        os.path.join(www_dir, "smart_start_screen_card.js"),
        False
    )

    # Das Frontend anweisen, das Script zu laden
    add_extra_js_url(hass, "/smart_start_screen/card.js")

    _LOGGER.info("SmartStartScreen: Custom UI registered at /smart_start_screen/card.js")
    
    # Sensoren laden
    hass.async_create_task(
        hass.helpers.discovery.async_load_platform("sensor", DOMAIN, {}, config)
    )
    
    return True
