# Bitcoin Whitepaper Interactive Guide

An interactive educational website explaining the core concepts of the Bitcoin whitepaper.

## Project Structure

```
btc-whitepaper/
├── index.html              # Homepage
├── css/
│   └── style.css           # Global styles
├── js/
│   ├── i18n.js             # Internationalization (zh/en)
│   ├── hash.js             # Hash function demo
│   ├── sha256-demo.js      # SHA-256 visualization
│   ├── signature.js        # Digital signature demo
│   ├── ecdsa-demo.js       # ECDSA visualization
│   ├── address.js          # Bitcoin address generation
│   ├── multisig.js         # Multi-signature demo
│   ├── timelock.js         # Timelock demo
│   ├── htlc.js             # Hash Time-Locked Contract
│   ├── utxo.js             # UTXO model demo
│   ├── block.js            # Block structure demo
│   ├── chain.js            # Blockchain demo
│   ├── pow.js              # Proof of Work demo
│   └── p2p.js              # P2P network visualization
├── pages/
│   ├── hash.html           # Hash function
│   ├── sha256.html         # SHA-256 process
│   ├── signature.html      # Digital signature
│   ├── ecdsa.html          # ECDSA process
│   ├── address.html        # Bitcoin address
│   ├── multisig.html       # Multi-signature
│   ├── timelock.html       # Timelock
│   ├── htlc.html           # HTLC
│   ├── utxo.html           # UTXO model
│   ├── block.html          # Block structure
│   ├── chain.html          # Blockchain
│   ├── pow.html            # Proof of Work
│   └── p2p.html            # P2P network
├── package.json
├── vercel.json             # Vercel deployment config
└── .gitignore
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# The site will be available at http://localhost:8080
```

## Features

- **Bilingual Support**: Chinese and English (toggle in navigation)
- **Interactive Demos**: Live visualizations of cryptographic concepts
- **Mobile Responsive**: Optimized for all screen sizes

## Topics Covered

### Cryptography
- Hash Functions (SHA-256)
- Digital Signatures (ECDSA)
- Bitcoin Address Generation

### Scripts
- Multi-signature (m-of-n)
- Timelocks (CLTV/CSV)
- Hash Time-Locked Contracts

### Transactions
- UTXO Model

### Blockchain
- Block Structure
- Blockchain
- Proof of Work
- P2P Network

## License

MIT
