import re
import sys

M = "https://www.saudia.com/-/media/SaudiaWebApp/data/media/img"


def esc(u):
    return u.replace("&", "&amp;")


ITEMS = [
    ("https://entertainment.saudia.com",
     f"{M}/Live-images/Home-Page-Rebranding/Time-flies.ashx?h=1200&iar=0&w=1270&rev=bfeabd9118e7491eaee57195800b5e0c&hash=2502CDE9D19B406D640FCE77B6E66CA7",
     "Time Flies. Saudia Beyond.", "Time Flies with BEYOND",
     "Discover our new entertainment experience BEYOND and learn more about the various entertainment channels and services available on your flight."),
    ("https://www.saudia.com/en/about-us/press-releases/press-release-17062025",
     f"{M}/Media-Center/2025/06/banner-1270x1200.ashx?h=1200&iar=0&w=1270&rev=158d3f5a8c954981b37b1a4c79f0c183&hash=6FA32973149A108852BD43641CF4CEF4",
     "Saudia Named Best Airline Staff Service", "Saudia Named “Best Airline Staff Service” at the 2025 Skytrax Awards",
     "The airline climbs to 17th place in global ranking, reflecting excellence across the guest journey"),
    ("/en-US/Companion",
     f"{M}/Live-images/Campaign-Banner/2025/02/Saudia_Travel-Companion_Web_1240x1171_EN.ashx?h=1171&iar=0&w=1240&rev=fb2ca24d991d452186a88297ae73d95f&hash=6BAAB0142E8ADFEB9936EC366C333261",
     "Saudia Travel Companion", "Saudia Travel Companion",
     "A cutting-edge tool crafted to elevate the travel experience through the power of artificial intelligence and natural language processing."),
]

item_html = "".join(
    "<div>"
    f'<div><!-- field:image --><picture><img src="{esc(img)}" alt="{ialt}"></picture></div>'
    f'<div><!-- field:text --><h3>{title}</h3><p>{desc}</p></div>'
    f'<div><!-- field:link --><a href="{href}">Learn more</a></div>'
    "</div>"
    for href, img, ialt, title, desc in ITEMS
)

BLOCK = (
    '<div><div class="experiences">'
    '<div><div><!-- field:title -->Exceptional experiences with Saudia</div></div>'
    '<div><div><!-- field:intro -->Explore the world, earn rewards and live the best adventures with Saudia.</div></div>'
    + item_html
    + '</div></div>'
)


def swap(path):
    s = open(path, encoding="utf-8").read()
    if 'class="experiences"' in s:
        return "already present"
    # Match the default-content exceptional-experiences section:
    # <div>...<h2 id="exceptional-experiences-with-saudia">...</h2>...<ul>...</ul></div>
    m = re.search(
        r'<div><h2 id="exceptional-experiences-with-saudia">.*?</ul></div>',
        s, re.S,
    )
    if not m:
        return "section not found"
    s2 = s[:m.start()] + BLOCK + s[m.end():]
    open(path, "w", encoding="utf-8").write(s2)
    return "swapped"


print(sys.argv[1], "->", swap(sys.argv[1]))
