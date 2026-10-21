# Module 1 implementation plan

## Reference findings and assumptions

The uploaded `YASH FINAL VERSION-2026 (1)(2).html` reference was not present in
the supplied workspace. The public business site was also unavailable from the
implementation environment. Module 1 is therefore scoped as **Sales, CRM &
Order** according to the project brief. Product names are configurable catalogue
data; the development seed uses only the product categories named in the brief.

## Scope implemented in this delivery

- Cookie-authenticated login, logout, administrator bootstrap, session revocation,
  backend permission checks, and audit records.
- Customer, enquiry, sales activity/follow-up, quotation and sales-order workflows.
- Dashboard aggregates sourced from PostgreSQL.
- Responsive React application shell and data screens backed only by the API.
- Development migrations, sample seed data, tests, and setup documentation.

## Deliberate boundaries

Email/WhatsApp delivery is recorded manually as an activity. No endpoint asserts
that an external message was delivered. Quotation printing is a browser print view;
formal PDF generation and external provider integrations are future work.

## Workflow rules

An enquiry moves through New, Contacted, Qualified, Quotation Draft, Quotation
Sent, Negotiation, PO Received, Converted, or Lost. Only qualified enquiries may
produce quotations. Only an approved/sent quotation can produce one sales order;
the one-to-one database constraint and transaction prevent duplicate conversion.
