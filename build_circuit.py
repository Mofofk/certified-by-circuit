"""Certified by Circuit: compliance netlist compiler (TAP-02 format).
Inputs (LSB-first): for k in 0..K-1: measured_k (W bits) then required_k (W bits).
Outputs: pass_0..pass_{K-1}, overall (= all pass).
pass_k = measured_k >= required_k (unsigned).
"""
import sys, json, random, hashlib
from reference import Element, NAND, encode, load, beat, pack

class B:
    def __init__(s, n_in): s.n_in=n_in; s.els=[]; s.next=2+n_in; s.cache={}
    def inp(s,i): return 2+i
    def nand(s,a,b):
        if a>b: a,b=b,a
        if a==0 or b==0: return 1           # NAND(0,x)=1
        if (a,b) in s.cache: return s.cache[(a,b)]
        s.els.append(Element(NAND,[a,b])); o=s.next; s.next+=1; s.cache[(a,b)]=o; return o
    def raw(s,a,b):  # uncached (for output duplicates)
        s.els.append(Element(NAND,[a,b])); o=s.next; s.next+=1; return o
    def inv(s,a):
        if a==0: return 1
        if a==1: return 0
        return s.nand(a,a)

def geq(bd, A, Bv):
    """carry-out of A + ~B + 1. Returns (carry_signal, (p,q)) where carry=NAND(p,q)."""
    c=1; last=None
    for a,b in zip(A,Bv):
        nb=bd.inv(b)
        # x=a, y=nb, cin=c. carry = (x&y) | (c&(x^y)) = NAND(NAND(x,y), NAND(c, x^y))
        n1=bd.nand(a,nb)
        if c==1:
            # carry = x|y = NAND(~x,~y) ; ~y = b
            p,q=bd.inv(a),b
        elif c==0:
            p,q=n1,1  # carry=x&y = NAND(n1,1)
        else:
            x1=bd.nand(a,n1); y1=bd.nand(nb,n1); xr=bd.nand(x1,y1)
            p,q=n1,bd.nand(c,xr)
        c=bd.nand(p,q); last=(p,q)
    return c,last

def build(K=4,W=8):
    n_in=2*K*W; bd=B(n_in)
    cs=[];pq=[]
    for k in range(K):
        base=2*k*W
        A=[bd.inp(base+i) for i in range(W)]; Bv=[bd.inp(base+W+i) for i in range(W)]
        c,last=geq(bd,A,Bv); cs.append(c); pq.append(last)
    # overall = AND of cs, ending with ~overall as w
    acc=cs[0]
    for c in cs[1:]:
        acc=bd.inv(bd.nand(acc,c))
    w=bd.inv(acc)   # ~overall
    for p,q in pq: bd.raw(p,q)        # pass_k duplicates as final outputs
    bd.raw(w,w)                        # overall
    return bd.els,n_in,K+1

def bits(v,W): return [(v>>i)&1 for i in range(W)]

if __name__=="__main__":
    K,W=4,8
    els,n_in,n_out=build(K,W)
    nl=encode(els); c=load(nl,n_in,n_out)
    print("gates",c.n_gates,"bytes",len(nl),"nIn",n_in,"nOut",n_out)
    # exhaustive per-channel check on channel 0, random others
    rnd=random.Random(1); bad=0; tests=0
    for a in range(256):
        for b in range(256):
            vals=[(a,b)]+[(rnd.randrange(256),rnd.randrange(256)) for _ in range(K-1)]
            inp=[]
            for m,r in vals: inp+=bits(m,W)+bits(r,W)
            _,out=beat(c,[],inp)
            exp=[int(m>=r) for m,r in vals]; exp.append(int(all(exp)))
            tests+=1
            if out!=exp: bad+=1
    print("tests",tests,"mismatches",bad)
    open("compliance_4x8.netlist","wb").write(nl)
    json.dump({"nIn":n_in,"nOut":n_out,"gates":c.n_gates,"sha256":hashlib.sha256(nl).hexdigest(),"hex":"0x"+nl.hex()},open("compliance_4x8.json","w"),indent=1)
