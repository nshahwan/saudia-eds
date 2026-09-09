import zipfile, os

OUT = "saudia-en-jcr.zip"
if os.path.exists(OUT):
    os.remove(OUT)
jcr = open("content/saudia-eds/en/.content.xml", encoding="utf-8").read()
filt = ('<?xml version="1.0" encoding="UTF-8"?>\n<workspaceFilter version="1.0">\n'
        '    <filter root="/content/saudia-eds/en"/>\n</workspaceFilter>\n')
props = '''<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE properties SYSTEM "http://java.sun.com/dtd/properties.dtd">
<properties><comment>FileVault Package Properties</comment>
<entry key="name">saudia-en</entry><entry key="group">saudia-eds</entry>
<entry key="version">1.2</entry><entry key="packageType">content</entry>
<entry key="path">/etc/packages/saudia-eds/saudia-en-1.2.zip</entry>
<entry key="description">Saudia en homepage node (images reference saudia.com source URLs)</entry>
<entry key="createdBy">excat</entry><entry key="requiresRoot">false</entry></properties>
'''
with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as z:
    z.writestr("META-INF/vault/filter.xml", filt)
    z.writestr("META-INF/vault/properties.xml", props)
    z.writestr("jcr_root/content/saudia-eds/en/.content.xml", jcr)
print("page pkg:", os.path.getsize(OUT), "bytes; source-url images:", jcr.count("www.saudia.com/-/media"))
