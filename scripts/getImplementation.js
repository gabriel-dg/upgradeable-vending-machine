const { ethers, upgrades } = require("hardhat");

// Fetch proxy address from environment variables
const proxyAddress = process.env.PROXY_ADDRESS;
if (!proxyAddress) {
  throw new Error("PROXY_ADDRESS not set in environment variables");
}

async function main() {
  // Get the implementation address directly from the proxy's storage
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(
    proxyAddress
  );

  console.log("Proxy address:", proxyAddress);
  console.log("Implementation address:", implementationAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
