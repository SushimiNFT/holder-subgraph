import { Address, BigInt, log } from "@graphprotocol/graph-ts";
import {
  Sushimi,
  Approval,
  ApprovalForAll,
  OwnershipTransferred,
  Transfer,
} from "../generated/Sushimi/Sushimi";
import { User, NFT } from "../generated/schema";

function getOrCreateUser(address: Address): User {
  let user = User.load(address.toHexString());

  if (user === null) {
    user = new User(address.toHexString());
    user.nftCount = 0;
    user.save();
  }

  return user as User;
}

function getNFT(id: BigInt): NFT {
  let nft = NFT.load(id.toString());

  return nft as NFT;
}

function createNFT(id: BigInt, owner: Address): NFT {
  let nft = new NFT(id.toString());
  nft.user = owner.toHexString();
  nft.save();

  return nft as NFT;
}

export function handleTransfer(event: Transfer): void {
  if (
    event.params.from.toHexString() ==
    "0x0000000000000000000000000000000000000000"
  ) {
    // Mint
    let nft = createNFT(event.params.tokenId, event.params.to);
    let newOwner = getOrCreateUser(event.params.to);

    nft.user = newOwner.id;
    nft.save();

    newOwner.nftCount = newOwner.nftCount + 1;
    newOwner.save();
  } else {
    // Transfer
    let nft = getNFT(event.params.tokenId);
    let oldOwner = getOrCreateUser(event.params.from);
    let newOwner = getOrCreateUser(event.params.to);

    nft.user = newOwner.id;
    nft.save();

    oldOwner.nftCount = oldOwner.nftCount - 1;
    oldOwner.save();

    newOwner.nftCount = newOwner.nftCount + 1;
    newOwner.save();
  }
}
