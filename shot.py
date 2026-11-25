from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={"width":420,"height":900},device_scale_factor=1)
    errs=[]; pg.on("pageerror",lambda e:errs.append(str(e)))
    pg.goto("http://localhost:8765/index.html?batch=LT-GLV-2611-001"); pg.wait_for_timeout(1500); pg.screenshot(path="shot_verify.png",full_page=True)
    pg.goto("http://localhost:8765/index.html?batch=LT-ARC-2611-002"); pg.wait_for_timeout(1500); pg.screenshot(path="shot_fail.png",full_page=True)
    pg.click("text=Certify a batch"); pg.fill("#m0","4");pg.fill("#m1","2");pg.fill("#m2","4");pg.fill("#m3","3"); pg.fill("#cBatch","LT-GLV-TEST"); pg.click("#cRun"); pg.wait_for_timeout(800); pg.screenshot(path="shot_certify.png",full_page=True)
    print("errors",errs); b.close()
