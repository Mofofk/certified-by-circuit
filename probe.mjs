import {ethers} from "ethers";
const p=new ethers.JsonRpcProvider("https://rpc.xlayer.tech",196,{staticNetwork:true});
const cpu="0x0565EA48CA41Ae559d8d491dbb0a9ec945DB551b";
const tries=["TAPEOUT_FEE()","tapeoutFee()","name()","symbol()","nand()","latch()","NAND()","LATCH()","transistor()","factory()","nextId()","owner()"];
for(const s of tries){const d=ethers.id(s).slice(0,10);try{const r=await p.call({to:cpu,data:d});console.log(s,r.length>140?r.slice(0,140)+"…":r)}catch(e){console.log(s,"revert")}}
const code=await p.getCode(cpu); console.log("codelen",code.length);
