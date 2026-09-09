import json, re
rm = json.load(open("/tmp/remote-map.json"))
rev = {v: k for k, v in rm.items()}
offers = {
    "offer-upgraded.jpg": "https://www.saudia.com/-/media/SaudiaWebApp/data/media/img/Live-images/Home-Page-Rebranding/Letsgetyouupdgradedmob.ashx?h=540&iar=0&w=960&rev=5da5fff656e0453abf69414ce6681c82&hash=F0270504C6555A2E5A916D2C8C47A402",
    "offer-hot-deals.jpg": "https://www.saudia.com/-/media/SaudiaWebApp/data/media/img/Live-images/Campaign-Banner/2024/07/card3.ashx?h=446&iar=0&w=384&rev=983d52db88dd49cc9edc9736f1509775&hash=C1E77C371C5EE6DF541FB1233DD7DDC9",
    "offer-insurance.jpg": "https://www.saudia.com/-/media/SaudiaWebApp/data/media/img/Live-images/Home-Page-Rebranding/TravelSafely.ashx?h=3000&iar=0&w=4000&rev=042d0d88920b45d4bb57f525b299111a&hash=B2E35718053D88BBEB33FAA8B4C34B4F",
    "offer-flightpass.jpg": "https://www.saudia.com/-/media/SaudiaWebApp/data/media/img/Live-images/flight-pass/flight-pass-web-en.ashx?h=750&iar=0&w=1000",
}
rev.update(offers)
json.dump(rev, open("/tmp/dam-to-src.json", "w"))
page = open("/tmp/page.xml").read()
used = sorted(set(re.findall(r'dam/saudia-eds/([a-z0-9.-]+)', page)))
missing = [u for u in used if u not in rev]
print("page filenames:", len(used), "mapped:", len([u for u in used if u in rev]), "missing:", missing)
