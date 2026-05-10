import voluptuous as vol
from homeassistant import config_entries
from homeassistant.core import callback

from .const import DOMAIN, PANEL_TITLE, CONF_POSTCODE

class OpenKairoConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for OpenKAIRO OS."""

    VERSION = 1

    async def async_step_user(self, user_input=None):
        """Handle the initial step."""
        if self._async_current_entries():
            return self.async_abort(reason="single_instance_allowed")

        if user_input is not None:
            return self.async_create_entry(title=PANEL_TITLE, data=user_input)

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema({
                vol.Optional(CONF_POSTCODE): str,
            }),
            description_placeholders={"title": PANEL_TITLE}
        )

    @staticmethod
    @callback
    def async_get_options_flow(config_entry):
        return OpenKairoOptionsFlowHandler(config_entry)

class OpenKairoOptionsFlowHandler(config_entries.OptionsFlow):
    """Handle options flow for OpenKAIRO OS."""

    def __init__(self, config_entry):
        """Initialize options flow."""
        self.config_entry = config_entry

    async def async_step_init(self, user_input=None):
        """Manage the options."""
        if user_input is not None:
            return self.async_create_entry(title="", data=user_input)

        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema({
                vol.Optional(
                    CONF_POSTCODE,
                    default=self.config_entry.options.get(
                        CONF_POSTCODE, 
                        self.config_entry.data.get(CONF_POSTCODE, "")
                    ),
                ): str,
            })
        )

