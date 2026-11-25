"""Print QR labels for batch records: python3 label.py  (after deploy, uses deploy_config.json)."""
import json,os,qrcode
from PIL import Image,ImageDraw,ImageFont
cfg=json.load(open("deploy_config.json")) if os.path.exists("deploy_config.json") else {}
name=f"{cfg['circuitId']}.2.{cfg['cpuNumber']}.tape" if cfg else "CIRCUIT.2.CPU.tape"
os.makedirs("labels",exist_ok=True)
for f in sorted(os.listdir("site/batches")):
    b=json.load(open("site/batches/"+f)); url=f"tape://{name}/?batch={b['batch']}"
    q=qrcode.make(url).resize((360,360)); im=Image.new("RGB",(420,520),"white"); im.paste(q,(30,20))
    d=ImageDraw.Draw(im); fnt=ImageFont.load_default()
    for i,t in enumerate(["Certified by Circuit",b["batch"],b["product"][:40],"Scan to verify on X Layer",url[:58]]): d.text((30,395+i*22),t,fill="black",font=fnt)
    im.save(f"labels/{b['batch']}.png")
print("labels for",name)
