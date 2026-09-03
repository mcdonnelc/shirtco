#!/usr/bin/env python3
"""Build a local visual fixture from the public Hat.co staging form.

This does not submit the form or modify WordPress. It injects the local plugin
assets into a fetched copy so the enhancement can be checked against current
staging markup before deployment access is available.
"""

from pathlib import Path
import re
from urllib.request import Request, urlopen


SOURCE_URL = "https://hatco2.wpenginepowered.com/get-a-quote/"
PLUGIN_ROOT = Path(__file__).resolve().parents[1]
OUTPUT = Path("/tmp/hatco-quote-live-fixture.html")


def read_asset(relative_path: str) -> str:
    return (PLUGIN_ROOT / relative_path).read_text(encoding="utf-8")


request = Request(SOURCE_URL, headers={"User-Agent": "HatCo staging UX check"})
with urlopen(request, timeout=30) as response:
    html = response.read().decode("utf-8")

css = read_asset("assets/quote-ux.css")
color_utils = read_asset("assets/color-utils.js")
quote_ux = read_asset("assets/quote-ux.js")

html = re.sub(
    r'<body class="([^"]*)"',
    r'<body class="hatco-quote-ux \1"',
    html,
    count=1,
)
html = html.replace("</head>", f"<style>{css}</style></head>", 1)
html = html.replace(
    "</body>",
    (
        f"<script>{color_utils}</script><script>{quote_ux}</script>"
        "<script>window.addEventListener('load',function(){"
        "setTimeout(function(){document.querySelector('#gform_wrapper_2')"
        ".scrollIntoView({block:'start'});},750);});</script></body>"
    ),
    1,
)

OUTPUT.write_text(html, encoding="utf-8")
print(OUTPUT)
