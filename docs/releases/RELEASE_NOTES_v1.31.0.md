*Your packets have a table. The table has manners.*

## Added
- Compact **Overview** and **Wi-Fi Diagnostics** presets in the device column picker. Existing saved column preferences are retained.
- Wi-Fi signal filtering by dBm, with weaker-than and stronger-than comparisons. The filter works alongside text search and can be cleared from its filter chip.

## Improved
- Live device updates retain the table header and open filters, reuse unchanged rows, and preserve the table’s scroll position.
- The connection column is now **Rate / Signal**. Equal receive and transmit rates share one value, and DNS badges show the blocked count and percentage.
- Lighter IP-range labels and a roomier DNS Live header.
- DNS protection links open the provider interface, including the AdGuard Home add-on when present and the Pi-hole admin page.
- Shorter English and German READMEs with DNS providers presented alongside the other features.

## Fixed
- Resolving a warning now leaves internet access decisions to the dedicated approval action. Failed monitoring changes show an error.
