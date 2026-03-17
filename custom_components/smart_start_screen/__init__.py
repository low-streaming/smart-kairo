import logging
from homeassistant.core import HomeAssistant
from homeassistant.helpers.typing import ConfigType

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up the SmartStartScreen integration."""
    hass.data.setdefault(DOMAIN, {})
    _LOGGER.info("SmartStartScreen Integration initialized")
    
    hass.async_create_task(
        hass.helpers.discovery.async_load_platform("sensor", DOMAIN, {}, config)
    )
    
    return True
