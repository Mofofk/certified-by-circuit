import {ethers} from "ethers"; import fs from "fs";
const j=JSON.parse(fs.readFileSync("compliance_4x8.json"));
const iface=new ethers.Interface(["function tapeout(bytes netlist,uint32 nIn,uint32 nOut) payable returns (uint256)"]);
const from="0x1111111111111111111111111111111111111111";
const cpu="0x0565EA48CA41Ae559d8d491dbb0a9ec945DB551b";
async function go(data,label){
 const body={jsonrpc:"2.0",id:1,method:"eth_call",params:[{from,to:cpu,data,value:"0x49e57d6354000"},"latest",{[from]:{balance:"0x56BC75E2D63100000"}}]};
 const r=await (await fetch("https://rpc.xlayer.tech",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)})).json();
 let msg=r.error?.data; try{ if(msg&&msg.startsWith("0x08c379a0")) msg=ethers.AbiCoder.defaultAbiCoder().decode(["string"],"0x"+msg.slice(10))[0]}catch{}
 console.log(label, r.result??"", r.error?.message??"", msg??"");
}
await go(iface.encodeFunctionData("tapeout",[j.hex,j.nIn,j.nOut]),"ours:");
await go(iface.encodeFunctionData("tapeout",["0x05",j.nIn,j.nOut]),"bad:");
