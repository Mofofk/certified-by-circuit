// Certified by Circuit: X Layer mainnet deployment.
// Usage: node deploy.mjs --dry            (read-only checks + simulated createCPU, spends nothing)
//        node deploy.mjs --go             (sends transactions; needs DEPLOYER_KEY in .env and ~0.1 OKB)
// Steps are idempotent: progress is kept in deploy_state.json.
import {ethers} from "ethers"; import fs from "fs"; import crypto from "crypto";
const GO=process.argv.includes("--go");
const CPU_ARG=(process.argv.find(a=>a.startsWith("--cpu="))||"").slice(6); // use an existing processor instead of creating one
const RPC="https://rpc.xlayer.tech";
const A={factory:"0x1f09daefa827f02cbb40967cc91b259763760761",opener:"0x536add8f30f03b69f6fbf29d425a816a0dc50106",
 registry:"0xd6efb7adcc9c83dc4924ad56f6a8e4e969b9adb6",binding:"0x68809fd2fb343aa57d0aeb7f33defe477c9666f9"};
const CPU={name:"Certified by Circuit",symbol:"CERT",story:"Safety-gear compliance decided by NAND circuits on X Layer.",supply:1_000_000n,price:ethers.parseEther("0.00000001")};
const abi={
 factory:["function createCPU(string name,string symbol,string story,uint256 transistorSupply,uint256 mintPrice) payable returns (address transistors,address circuits)","function deployFee() view returns (uint256)","function cpuCount() view returns (uint256)","function cpuAt(uint256) view returns (address)"],
 circuits:["function tapeout(bytes nl,uint32 nIn,uint32 nOut) payable returns (uint256)","function TAPEOUT_FEE() view returns (uint256)","function transistors() view returns (address)","function nextId() view returns (uint256)","function ownerOf(uint256) view returns (address)","function eval(uint256 id,bytes inputs) view returns (bytes)","function circuitInfo(uint256) view returns (uint32,uint32,uint32,uint32)"],
 transistors:["function mint(uint256 id,uint256 amount) payable","function NAND() view returns (uint256)","function mintPrice() view returns (uint256)","function balanceOf(address,uint256) view returns (uint256)","function FEE() view returns (uint256)"],
 opener:["function open(address circuits,uint256 tokenId) payable returns (address)","function FEE() view returns (uint256)","function accountOf(address,uint256) view returns (address)","function isOpened(address,uint256) view returns (bool)"],
 registry:["function putFile(address container,string path,string contentType,bytes32 sha256Hash,bytes data)","function appendChunk(address container,string path,uint256 expectIndex,bytes data)","function fileInfo(address,string) view returns (uint32,string,bytes32,uint40,uint256)"]
};
const p=new ethers.JsonRpcProvider(RPC,196,{staticNetwork:true});
const env=fs.existsSync(".env")?Object.fromEntries(fs.readFileSync(".env","utf8").split("\n").filter(l=>l.includes("=")).map(l=>l.split(/=(.*)/s).slice(0,2))):{};
const st=fs.existsSync("deploy_state.json")?JSON.parse(fs.readFileSync("deploy_state.json")):{};
const save=()=>fs.writeFileSync("deploy_state.json",JSON.stringify(st,null,1));
const j=JSON.parse(fs.readFileSync("compliance_4x8.json"));
const okb=v=>ethers.formatEther(v)+" OKB";
const log=(...a)=>console.log(...a);

const factory=new ethers.Contract(A.factory,abi.factory,p), opener=new ethers.Contract(A.opener,abi.opener,p);
const fees={deploy:await factory.deployFee(),open:await opener.FEE(),protocolMint:660_000_000_000_000n,tapeout:1_300_000_000_000_000n};
const gates=BigInt(j.gates);
const est=gates*CPU.price+fees.protocolMint+fees.tapeout+fees.open;
log("Fees: createCPU",ethers.formatUnits(fees.deploy,8)+" BEM","| mint",gates,"NAND +",okb(fees.protocolMint),"protocol | tapeout",okb(fees.tapeout),"| open container",okb(fees.open));
log("Estimated total before gas:",okb(est));

if(!GO){
 const from="0x1111111111111111111111111111111111111111";
 const data=factory.interface.encodeFunctionData("createCPU",[CPU.name,CPU.symbol,CPU.story,CPU.supply,CPU.price]);
 const r=await p.send("eth_call",[{from,to:A.factory,data },"latest",{[from]:{balance:"0x56BC75E2D63100000"}}]).catch(e=>({err:e.shortMessage||e.message}));
 log("Simulated createCPU:",r.err?("reverts as expected without a BEM allowance ("+r.err+")"):"ok, would create processor "+ethers.AbiCoder.defaultAbiCoder().decode(["address","address"],r)[1]);
 log("Dry run only. Nothing sent."); process.exit(0);
}
if(!env.DEPLOYER_KEY) throw Error("DEPLOYER_KEY missing in .env");
const w=new ethers.Wallet(env.DEPLOYER_KEY,p);
const bal=await p.getBalance(w.address); log("Deployer",w.address,"balance",okb(bal));
if(bal<est+ethers.parseEther("0.002")) throw Error("Balance too low; need about "+okb(est+ethers.parseEther("0.002")));
const send=async(label,txp)=>{const tx=await txp;log(label,"tx",tx.hash);const rc=await tx.wait();if(rc.status!==1)throw Error(label+" failed");return rc};

// 1. processor
if(!st.circuits&&CPU_ARG){st.circuits=ethers.getAddress(CPU_ARG);st.transistors=await new ethers.Contract(st.circuits,abi.circuits,p).transistors();
 for(let i=(await factory.cpuCount())-1n;i>=0n;i--){if((await factory.cpuAt(i)).toLowerCase()===st.circuits.toLowerCase()){st.cpuNumber=Number(i);break}} save();log("using existing processor",st.cpuNumber,st.circuits)}
if(!st.circuits){
 // createCPU charges deployFee in BEM (8 decimals) via transferFrom: approve first
 const bem=new ethers.Contract("0x60e62efa9405d6873c5deabd4e6cc91c25363952",["function approve(address,uint256) returns (bool)","function balanceOf(address) view returns (uint256)"],w);
 if((await bem.balanceOf(w.address))<fees.deploy) throw Error("createCPU needs "+ethers.formatUnits(fees.deploy,8)+" BEM on X Layer, or pass --cpu=<existing processor>");
 await send("approve BEM",bem.approve(A.factory,fees.deploy));
 const before=await factory.cpuCount();
 await send("createCPU",factory.connect(w).createCPU(CPU.name,CPU.symbol,CPU.story,CPU.supply,CPU.price));
 const n=await factory.cpuCount(); st.cpuNumber=Number(n-1n); st.circuits=await factory.cpuAt(n-1n);
 if(n!==before+1n) log("warning: cpuCount moved by more than one; verify ownership");
 st.transistors=await new ethers.Contract(st.circuits,abi.circuits,p).transistors(); save(); log("processor",st.cpuNumber,st.circuits);
}
const circuits=new ethers.Contract(st.circuits,abi.circuits,w), tr=new ethers.Contract(st.transistors,abi.transistors,w);
// 2. mint NAND
const NAND=await tr.NAND(); const have=await tr.balanceOf(w.address,NAND);
if(!st.circuitId && have<gates){const need=gates-have;const price=await tr.mintPrice();
 await send("mint",tr.mint(NAND,need,{value:need*price+fees.protocolMint}))}
// 3. tapeout
if(!st.circuitId){const fee=await circuits.TAPEOUT_FEE();
 const rc=await send("tapeout",circuits.tapeout(j.hex,j.nIn,j.nOut,{value:fee}));
 st.circuitId=Number((await circuits.nextId()))-0; // nextId() returns highest id
 if((await circuits.ownerOf(st.circuitId)).toLowerCase()!==w.address.toLowerCase()) throw Error("circuit id check failed; inspect "+rc.hash);
 save(); log("circuit #",st.circuitId)}
// 4. verify on chain
{const info=await circuits.circuitInfo(st.circuitId);log("circuitInfo",info.map(String).join(","));}
// 5. container
if(!st.container){if(!(await opener.isOpened(st.circuits,st.circuitId)))await send("open",opener.connect(w).open(st.circuits,st.circuitId,{value:fees.open}));
 st.container=await opener.accountOf(st.circuits,st.circuitId);save();log("container",st.container)}
// 6. site files
fs.writeFileSync("deploy_config.json",JSON.stringify({cpu:st.circuits,circuitId:String(st.circuitId),cpuNumber:st.cpuNumber,container:st.container}));
const {execSync}=await import("child_process"); execSync("python3 build_site.py cfg");
const reg=new ethers.Contract(A.registry,abi.registry,w);
const files=[["index.html","text/html"],...fs.readdirSync("site/batches").map(f=>["batches/"+f,"application/json"])];
st.files=st.files||{};
for(const [path,type] of files){const data=fs.readFileSync("site/"+path);const sha="0x"+crypto.createHash("sha256").update(data).digest("hex");
 if(st.files[path]===sha)continue; const CH=24000;
 await send("putFile "+path,reg.putFile(st.container,path,type,sha,data.subarray(0,CH)));
 for(let i=1;i*CH<data.length;i++) await send("appendChunk "+path+" "+i,reg.appendChunk(st.container,path,i,data.subarray(i*CH,(i+1)*CH)));
 st.files[path]=sha;save()}
log("Done. Site name:",`${st.circuitId}.2.${st.cpuNumber}.tape`);
