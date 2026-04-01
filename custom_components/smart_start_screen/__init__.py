import logging
import os
import time
import json
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
    solar_js_path = os.path.join(www_dir, "openkairo_solar_card.js")
    history_js_path = os.path.join(www_dir, "openkairo_history_card.js")
    gauge_js_path = os.path.join(www_dir, "openkairo_gauge_card.js")
    button_js_path = os.path.join(www_dir, "openkairo_button_card.js")
    alert_js_path = os.path.join(www_dir, "openkairo_alert_card.js")
    picker_js_path = os.path.join(www_dir, "entity-picker-card.js")
    
    paths_to_register = []
    
    if os.path.exists(js_path):
        paths_to_register.append(StaticPathConfig("/smart_start_screen/smart_start_screen_card.js", js_path, False))
    
    if os.path.exists(solar_js_path):
        paths_to_register.append(StaticPathConfig("/smart_start_screen/openkairo_solar_card.js", solar_js_path, False))
    
    if os.path.exists(history_js_path):
        paths_to_register.append(StaticPathConfig("/smart_start_screen/openkairo_history_card.js", history_js_path, False))

    if os.path.exists(gauge_js_path):
        paths_to_register.append(StaticPathConfig("/smart_start_screen/openkairo_gauge_card.js", gauge_js_path, False))

    if os.path.exists(button_js_path):
        paths_to_register.append(StaticPathConfig("/smart_start_screen/openkairo_button_card.js", button_js_path, False))
        
    if os.path.exists(alert_js_path):
        paths_to_register.append(StaticPathConfig("/smart_start_screen/openkairo_alert_card.js", alert_js_path, False))
        
    if os.path.exists(picker_js_path):
        paths_to_register.append(StaticPathConfig("/smart_start_screen/entity-picker-card.js", picker_js_path, False))

    if paths_to_register:
        # Optimization: Use static version from manifest as cache buster to prevent conflicts on reload
        manifest_path = os.path.join(os.path.dirname(__file__), "manifest.json")
        try:
            with open(manifest_path, "r") as f:
                manifest = json.load(f)
            cache_buster = manifest.get("version", "1.0.0")
        except Exception:
            cache_buster = str(time.time())

        await hass.http.async_register_static_paths(paths_to_register)
        
        if os.path.exists(js_path):
            add_extra_js_url(hass, f"/smart_start_screen/smart_start_screen_card.js?v={cache_buster}")
        if os.path.exists(solar_js_path):
            add_extra_js_url(hass, f"/smart_start_screen/openkairo_solar_card.js?v={cache_buster}")
        if os.path.exists(history_js_path):
            add_extra_js_url(hass, f"/smart_start_screen/openkairo_history_card.js?v={cache_buster}")
        if os.path.exists(gauge_js_path):
            add_extra_js_url(hass, f"/smart_start_screen/openkairo_gauge_card.js?v={cache_buster}")
        if os.path.exists(button_js_path):
            add_extra_js_url(hass, f"/smart_start_screen/openkairo_button_card.js?v={cache_buster}")
        if os.path.exists(alert_js_path):
            add_extra_js_url(hass, f"/smart_start_screen/openkairo_alert_card.js?v={cache_buster}")
        if os.path.exists(picker_js_path):
            add_extra_js_url(hass, f"/smart_start_screen/entity-picker-card.js?v={cache_buster}")
            
        _LOGGER.info("SmartStartScreen: UIs registered successfully (Cache Busted)")
    else:
        _LOGGER.error("SmartStartScreen: No JS files found!")

    hass.async_create_task(
        discovery.async_load_platform(hass, "sensor", DOMAIN, {}, config)
    )
    
    return True
