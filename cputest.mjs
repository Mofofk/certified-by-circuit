import {ethers} from "ethers";
const p=new ethers.JsonRpcProvider("https://rpc.xlayer.tech",196,{staticNetwork:true});
const I=new ethers.Interface(["function createCPU(string,string,string,uint256,uint256) payable returns (address,address)","function deployFee() view returns (uint256)"]);
const F="0x1f09daefa827f02cbb40967cc91b259763760761";const from="0x2222222222222222222222222222222222222222";
const fee=BigInt(await p.call({to:F,data:I.encodeFunctionData("deployFee")}));console.log("deployFee wei",fee);
for(const [s,pr,v] of [[1000000n,10n**10n,fee],[1000000n,66n*10n**12n,fee],[100000000n,10n**10n,fee],[1000000n,10n**10n,10n**16n],[1000000n,10n**10n,0n]]){
 const data=I.encodeFunctionData("createCPU",["Certified by Circuit","CERT","story",s,pr]);
 const r=await p.send("eth_call",[{from,to:F,data,value:ethers.toQuantity(v)},"latest",{[from]:{balance:"0x56BC75E2D63100000"}}]).then(x=>"ok "+x.slice(0,80),e=>"revert "+(e.info?.error?.message||e.message).slice(0,120)+" "+(e.info?.error?.data||""));
 console.log(s,pr,v,r)}
