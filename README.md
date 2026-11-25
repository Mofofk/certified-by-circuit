<p align="center"><img src="logo_256.png" width="128" alt="Certified by Circuit logo"></p>

# Certified by Circuit

**Safety gear compliance decided by a NAND circuit on X Layer, not by a PDF anyone can edit.**

Built for the OKX X Layer TapeOut Accelerate hackathon.

Suppliers enter a PPE batch's lab test values (for example EN 388 glove levels or an arc suit's ATPV). A 224-gate TapeOut NAND circuit on X Layer (four 8-bit "measured >= required" comparators plus an AND) returns PASS or FAIL per parameter and overall. Anyone can re-run `eval()` for free. The batch record and the lab report's SHA-256 live on the project's DeWEB site, and a QR label on each carton opens the record at the gate.

See [SUBMISSION.md](SUBMISSION.md) for the full write-up and [DEMO_SCRIPT.md](DEMO_SCRIPT.md) for the demo.

## Repo layout
- `build_circuit.py`, `reference.py`: netlist compiler emitting TAP-02 bytes, with an exhaustive reference test
- `compliance_4x8.netlist`, `compliance_4x8.json`: the compiled compliance circuit
- `site/`: the self-contained DeWEB verifier app (Verify, Certify, How it works)
- `deploy.mjs`: deploy script for processor, mint, tapeout, container and site files (needs a funded X Layer key in a local `.env`, never committed)
- `label.py`, `labels/`: QR carton label generator
- `*.mjs`: simulation and on-chain eval tests

## Status
Work in progress. Not yet deployed to X Layer mainnet. The batch records in `site/batches/` and `labels/` are **demo sample data**, not real certified batches.

## Run locally
```
npm install
python3 build_circuit.py
node sim.mjs
```
