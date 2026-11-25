# Certified by Circuit

**Safety gear compliance decided by a NAND circuit on X Layer, not by a PDF anyone can edit.**

## The problem
Steel plants, power utilities and construction sites in India buy safety gear (gloves, arc-flash suits, SCBA sets) in batches. Each batch arrives with a test certificate: a PDF or a photocopy. Certificates are easy to forge, reuse across batches or edit. Safety officers rarely have time to check them, and a failed glove or suit costs lives. Genuine suppliers can't prove they're genuine.

## The product
1. **Certify.** The supplier enters the lab's test values for a batch, such as EN 388 abrasion, cut, tear and puncture levels, or an arc suit's ATPV. The buyer's minimums come from the standard or from the purchase order.
2. **Decide on-chain.** The values go into one TapeOut circuit on X Layer. It has 224 NAND gates: four 8-bit "measured ≥ required" comparators plus an AND. The circuit's `eval()` returns PASS or FAIL for each parameter and overall. Anyone can re-run it for free, so the verdict can't be faked.
3. **Publish.** The batch record and the lab report's SHA-256 are stored on the project's DeWEB site (SiteRegistry, X Layer). A QR label on the carton opens `tape://<site>/?batch=<id>`.
4. **Verify at the gate.** A safety officer scans the label. The page re-runs the circuit live and checks the record hash. If anything is wrong, they message the supplier's container over TapeSend.

"Lower is better" limits, such as afterflame seconds, are entered as 255 minus the value, so one comparator circuit covers every standard.

## TapeOut ecosystem use
| Feature | How it's used |
|---|---|
| Circuit (NAND netlist, TAP-02) | 224-gate compliance comparator taped out on X Layer; `eval()` is the verifier |
| Processor | Our own "CERT" processor (or an existing one); one circuit per rule set |
| Container (ERC-6551) | The project's identity and the owner of the site files |
| DeWEB / SiteRegistry | The verifier app and every batch record live on-chain; no server |
| TapeKit | The site follows the tape:// rules: no off-chain resources, and its only network calls are to X Layer RPC |
| TapeSend | Buyer-to-supplier issue reports to the supplier's container |

## Target users and how to reach them
- **Buyers:** safety and procurement teams at steel, power, mining and oil plants (SAIL, JSW, Vedanta/ESL, L&T, Tata Steel), first in Jharkhand and Odisha.
- **Suppliers:** PPE makers and distributors, starting with our own supply business (Leather Tech Safety), which already sells to these plants.
- **Go-to-market:** suppliers adopt it to win tenders ("verifiable certificates"). Buyers then ask other vendors for it. B2B marketplaces like Moglix can show the badge on listings.

## Revenue model
- **Suppliers** pay per certified batch: about ₹50 to ₹200 ($0.60 to $2.40), paid in OKB or USDT.
- **Buyers** subscribe to a dashboard of every batch they received, with failed-batch alerts and audit export, at ₹5,000 to ₹20,000 a month per plant.
- **Labs** pay to sign records directly (next phase), so the values come from the lab rather than the supplier.
- **Why they keep paying:** tenders and safety audits increasingly ask for traceability. Once a buyer requires it, every supplier needs it for every batch.

## What's built (during the event)
- Netlist compiler (Python) that emits TAP-02 bytes. Exhaustively tested: 65,536 / 65,536 cases match.
- The netlist passes the X Layer processor's on-chain well-formedness checks. A simulated `tapeout` reverts only at the NAND burn, which needs 224 NAND.
- The DeWEB verifier app as one self-contained file, with Verify, Certify and How it works tabs, three standards and a local fallback simulator. The on-chain `eval()` path was tested against a live X Layer circuit: 20 / 20 identical.
- Deploy script for processor, mint, tapeout, container and site files (idempotent), plus a QR label generator.

## Roadmap
Lab-signed records (TapeSend plus signatures), more standards (helmets IS 2925, harnesses EN 361), a buyer dashboard, and LATCH-based expiry checks such as cylinder hydro-test dates.
