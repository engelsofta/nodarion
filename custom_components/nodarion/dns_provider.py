"""DNS provider selection; legacy AdGuard settings stay compatible."""

from .adguard import AdGuardScanner
from .pihole import PiHoleScanner


def create_dns_scanner(hass, options):
    """Create the selected optional DNS provider from the existing connection fields."""
    if not options.get("adguard_enabled"):
        return None
    provider = options.get("dns_provider", "adguard")
    if provider not in {"adguard", "pihole"}:
        raise ValueError("Unsupported DNS provider")
    scanner_class = PiHoleScanner if provider == "pihole" else AdGuardScanner
    return scanner_class(
        hass,
        str(options.get("adguard_host", "")),
        int(options.get("adguard_port", 80 if provider == "pihole" else 3000)),
        str(options.get("adguard_user", "")),
        str(options.get("adguard_password", "")),
        bool(options.get("adguard_ssl", False)),
        bool(options.get("adguard_verify_ssl", True)),
        int(options.get("adguard_period_hours", 24)),
    )
