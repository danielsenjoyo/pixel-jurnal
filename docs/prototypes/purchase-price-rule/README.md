# Purchase Price Rule — prototype screenshots

One-pager: Confluence PD 51412239134. Seed data: `app/data/products.ts` (rules 711–715).

| File                                  | Shows                                                                                    |
| ------------------------------------- | ---------------------------------------------------------------------------------------- |
| 1-price-rules-list.png                | Products → Price rules: Transaction type column, vendor + PKP summary, type quick filter |
| 2-purchase-rule-form-pkp-conflict.png | Purchase rule form: Transaction type, vendor picker, PKP checkbox, conflict error        |
| 3-purchase-invoice-pkp-vendor.png     | Purchase invoice: PKP badge under vendor                                                 |
| 4-purchase-invoice-rules-applied.png  | Rules applied per line (vendor + product 10%, vendor only 5%)                            |
| 5-purchase-invoice-non-pkp.png        | Non-PKP vendor: PPN cleared, manual discount kept, product-only rule (Rp/unit → %)       |

## Outlet-specific rules (DECIDED 12 Nov)

Outlet = the transaction's **Warehouse**. Rule 715 (12%) names Outlet Kemang; rule 711 (10%) covers every outlet.

| Step                                                                        | Expected on the Printer Paper A4 (Ream) line                                |
| --------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Purchases → Order → Create. Vendor PT Maju Bersama, add Printer Paper A4    | 10% · "Vendor + product" (no warehouse yet, so only all-outlet rules apply) |
| Set Warehouse to Outlet Kemang                                              | 12% · "Outlet · Vendor + product" (rule 715)                                |
| Switch Warehouse to Outlet Cilandak                                         | 10% · "Vendor + product" (rule 711)                                         |
| Products → Price rules: row 715 reads "… · Outlet Kemang"; search "Kemang"  | Only rule 715 listed                                                        |
| Edit a purchase rule: Outlets (warehouses) checkboxes; switch type to Sales | Outlets section disappears and the selection is cleared                     |
