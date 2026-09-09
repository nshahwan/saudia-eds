import json, re, html, sys

rev = json.load(open("/tmp/dam-to-src.json"))  # filename -> source url (raw, with &)


def restore(path, xml_escape):
    s = open(path, encoding="utf-8").read()
    n = 0
    for fn, url in rev.items():
        src = html.escape(url, quote=True) if xml_escape else url
        # replace any /content/dam/saudia-eds/<fn> occurrence with the source url
        pat = re.compile(r'/content/dam/saudia-eds/' + re.escape(fn))
        s, c = pat.subn(src, s)
        n += c
    open(path, "w", encoding="utf-8").write(s)
    return n


target = sys.argv[1]
escape = sys.argv[2] == "xml"
print(target, "->", restore(target, escape), "replacements")
