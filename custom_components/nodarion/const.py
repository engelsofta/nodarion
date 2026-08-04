"""Constants for Engelsoft Nodarion."""

DOMAIN = "nodarion"
PLATFORMS = ["binary_sensor"]
PANEL_URL = "nodarion"
PANEL_TITLE = "Engelsoft Nodarion"
INTEGRATION_VERSION = "1.17.9"
FRONTEND_VERSION = "1.25.0"

CONF_FRITZ_ENABLED = "fritz_enabled"
CONF_FRITZ_HOST = "fritz_host"
CONF_FRITZ_USER = "fritz_user"
CONF_FRITZ_PASSWORD = "fritz_password"
DEFAULT_FRITZ_HOST = "fritz.box"

CONF_ADGUARD_ENABLED = "adguard_enabled"
CONF_ADGUARD_HOST = "adguard_host"
CONF_ADGUARD_PORT = "adguard_port"
CONF_ADGUARD_USER = "adguard_user"
CONF_ADGUARD_PASSWORD = "adguard_password"
CONF_ADGUARD_SSL = "adguard_ssl"
CONF_ADGUARD_VERIFY_SSL = "adguard_verify_ssl"
CONF_ADGUARD_PERIOD_HOURS = "adguard_period_hours"
DEFAULT_ADGUARD_PORT = 3000
DEFAULT_ADGUARD_PERIOD_HOURS = 24

CONF_NETWORK = "network"
CONF_SCAN_INTERVAL = "scan_interval"
CONF_TIMEOUT = "timeout"
CONF_CONCURRENCY = "concurrency"
CONF_PORTS = "ports"
CONF_EXCLUDE = "exclude"
CONF_OFFLINE_AFTER = "offline_after"
CONF_REMOVE_AFTER_DAYS = "remove_after_days"

DEFAULT_NETWORK = "192.168.1.0/24"
DEFAULT_SCAN_INTERVAL = 60
DEFAULT_TIMEOUT = 1.0
DEFAULT_CONCURRENCY = 64
DEFAULT_PORTS = "22,53,80,443,445,554,1883,8123"
DEFAULT_OFFLINE_AFTER = 3
DEFAULT_REMOVE_AFTER_DAYS = 7

# Optional data sources are deliberately slower than active host detection.
# Their metadata changes far less often and their APIs are comparatively heavy.
FRITZ_SCAN_INTERVAL_SECONDS = 60
FRITZ_HOSTNAME_GRACE_SECONDS = 2 * 60 * 60
ADGUARD_SCAN_INTERVAL_SECONDS = 600
FRITZ_DEVICE_INFO_INTERVAL_SECONDS = 3600
