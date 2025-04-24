const { ethers } = require("hardhat");

// Fetch proxy address from environment variables
const proxyAddress = process.env.PROXY_ADDRESS;
if (!proxyAddress) {
  throw new Error("PROXY_ADDRESS not set in environment variables");
}

async function main() {
  // ERC1967 storage slot where implementation address is stored
  const IMPLEMENTATION_SLOT =
    "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";

  // Connect to the proxy address
  const provider = ethers.provider;

  // Get the implementation address from the storage slot
  const implementationSlotData = await provider.getStorage(
    proxyAddress,
    IMPLEMENTATION_SLOT
  );

  // Convert the slot data to an address format
  const implementationAddress = "0x" + implementationSlotData.slice(26);

  console.log("Proxy address:", proxyAddress);
  console.log("Implementation address:", implementationAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
