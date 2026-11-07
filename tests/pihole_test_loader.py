"""Load the real DNS clients with only HA's shared-session boundary replaced."""
import ast
import importlib.util
from pathlib import Path
import sys
import types


def load_clients():
    base = Path(__file__).parents[1] / "custom_components/nodarion"
    package = types.ModuleType("_dns_client_tests")
    package.__path__ = [str(base)]
    sys.modules[package.__name__] = package
    module = types.ModuleType("_dns_client_tests.adguard")
    module.HomeAssistant = object
    module.async_get_clientsession = lambda hass: hass.session
    sys.modules[module.__name__] = module
    tree = ast.parse((base / "adguard.py").read_text(encoding="utf-8"))
    tree.body = [node for node in tree.body if not (isinstance(node, ast.ImportFrom) and node.module and node.module.startswith("homeassistant"))]
    exec(compile(tree, str(base / "adguard.py"), "exec"), module.__dict__)
    spec = importlib.util.spec_from_file_location("_dns_client_tests.pihole", base / "pihole.py")
    pihole = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = pihole
    spec.loader.exec_module(pihole)
    return module.AdGuardScanner, pihole.PiHoleScanner
