import {ethers} from "ethers";
const p=new ethers.JsonRpcProvider("https://rpc.xlayer.tech",196,{staticNetwork:true});
const F="0x1f09daefa827f02cbb40967cc91b259763760761";
for(const s of ["feeToken()","deployToken()","token()","TAPE()","BEM()","bem()","tape()","paymentToken()","FEE_TOKEN()","treasury()","protocolWallet()"]){
 const r=await p.call({to:F,data:ethers.id(s).slice(0,10)}).catch(()=>null); if(r&&r!=="0x") console.log(s,r)}
// try transistors contract of the arcade processor for payment token
const T="0x7837b10fb7910a784cc864dc36089c88d9d73132";
for(const s of ["feeToken()","token()","BEM()","paymentToken()","FEE()","protocolFee()","PROTOCOL_FEE()"]){const r=await p.call({to:T,data:ethers.id(s).slice(0,10)}).catch(()=>null); if(r&&r!=="0x") console.log("T",s,r)}
