# PathPay Checkout Agent Demo

What it does:

- accepts a product or checkout link
- analyzes the merchant and route
- simulates a USDT deposit
- simulates smart-contract escrow
- simulates purchase execution through a viable route
- returns a purchase confirmation

This is a self-contained demo. It does not move real funds or connect to a live smart contract.

The route logic is based on the local payment memory extracted from: Data Source

Later, this can become a real app with:

- a backend API
- wallet connection
- USDT smart-contract escrow
- route execution partners
- live Firecrawl route enrichment
- user-submitted payment confirmations
