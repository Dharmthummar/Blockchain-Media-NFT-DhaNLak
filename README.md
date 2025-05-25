# BlockSync: Blockchain Royalty Platform (NFT: DhaNLak)

BlockSync is a decentralized Ethereum-based platform for managing digital content, royalties, and NFTs. It enables creators, consumers, and collaborators to register, monetize, and verify digital assets transparently using smart contracts and IPFS. DhaNLak-tokens, unique digital assets visualized as colorful QR-like codes, enhance content ownership and monetization.

## Features

- **Content Creation**: Upload media (images, videos, audio) to IPFS and register on the blockchain with title and price.
- **Royalty Distribution**: Assign and distribute royalty shares to collaborators via smart contracts.
- **DhaNLak-tokens**: Unique NFTs representing content ownership, with features like uniqueness, provenance tracking, monetization, and programmable royalties.
- **Marketplace**: Browse, purchase, and verify content authenticity using ETH.
- **NFT Creation**: Tokenize content as DhaNLak-tokens for unique ownership.
- **Profile Management**: Update profiles and view created/purchased content, DhaNLak-tokens, and activity history.
- **Authentication**: Secure login with MetaMask wallet integration.
- **User Interface**: Tab-based navigation, toast notifications, and light/dark theme support.

## How It Works

1. **Authentication**: Users log in/register (`auth.js`) and connect MetaMask for blockchain transactions (`app.js`).
2. **Content Creation**: In Creator Studio, upload media to IPFS, set a price, and register content on the blockchain (`MediaRights.sol`).
3. **Royalty Management**: Assign shares, distribute ETH royalties, and manage shareholders in Royalty Hub.
4. **DhaNLak-tokens**: Tokenize content as NFTs (`NFTContract.sol`) with unique properties, visualized as QR-like codes, supporting ownership tracking and royalties.
5. **Marketplace**: Browse, buy, and verify content; purchased content is added to user profiles.
6. **Profile/Dashboard**: Manage profiles, view DhaNLak-tokens, check balances, and withdraw funds.
7. **Blockchain**: Smart contracts handle content registration, royalties, and NFT minting; IPFS stores media files.

## DhaNLak-tokens
DhaNLak-tokens are unique NFTs representing digital content ownership, visualized as colorful QR-like codes. Key features:
- **Uniqueness**: Each token has distinct properties, non-replicable.
- **Provenance**: Tracks ownership history on the blockchain.
- **Monetization**: Enables new revenue streams for creators.
- **Programmability**: Includes royalty mechanisms for secondary sales.

## Workflow Example
- **Creator**: Laksh uploads a video, sets a 0.1 ETH price, assigns 20% royalties to Dharm, and creates a DhaNLak-token.
- **Consumer**: Charlie buys the video for 0.1 ETH and verifies its authenticity.
- **Collaborator**: Dharm receives royalties when Laksh distributes ETH.
- **NFT Buyer**: Purchases Laksh’s DhaNLak-token, triggering royalty payments.

## Smart Contracts
- **RoyaltyDistribution.sol**: Manages content registration, royalty distribution, and purchases.
- **NFTContract.sol**: Handles DhaNLak-token minting and secondary sale royalties.

## Project Structure
```
./
├── index.html           # Main HTML file
├── app.js              # Core logic (Web3, IPFS)
├── auth.js             # Authentication system
├── profile.js          # Profile management
├── MediaRights.sol     # Royalty smart contract
├── NFTContract.sol     # DhaNLak-token smart contract
├── README.md           # This file
```
## License
MIT License. See [LICENSE](LICENSE).

## Acknowledgments
- [Ethereum](https://ethereum.org/)
- [IPFS](https://ipfs.io/)
- [MetaMask](https://metamask.io/)
- [OpenZeppelin](https://openzeppelin.com/)
- [Infura](https://infura.io/)

© 2025 DhaNLak | Blocksync NFT by Dharm & Laksh
