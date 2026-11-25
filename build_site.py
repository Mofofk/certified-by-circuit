import json,sys
j=json.load(open("compliance_4x8.json")); cfg=json.load(open("deploy_config.json")) if len(sys.argv)>1 else {}
t=open("site/index.template.html").read().replace("/*CONFIG*/{}",json.dumps(cfg)).replace("/*NETLIST*/",j["hex"][2:])
open("site/index.html","w").write(t); print("ok",len(t),cfg)
