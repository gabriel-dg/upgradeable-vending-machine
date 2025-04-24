const { ethers, upgrades } = require("hardhat");

// Fetch proxy address from environment variables
const proxyAddress = process.env.PROXY_ADDRESS;
if (!proxyAddress) {
  throw new Error("PROXY_ADDRESS not set in environment variables");
}

async function main() {
  // Get the original implementation address directly from the proxy
  const originalImplementation =
    await upgrades.erc1967.getImplementationAddress(proxyAddress);
  console.log("Original implementation address:", originalImplementation);

  const VendingMachineV2 = await ethers.getContractFactory("VendingMachineV2");
  console.log("Upgrading to VendingMachineV2...");

  // Perform the upgrade
  const upgraded = await upgrades.upgradeProxy(proxyAddress, VendingMachineV2);

  // Wait for deployment to complete
  await upgraded.waitForDeployment();

  // Get the address of the proxy after upgrade (should be the same)
  const upgradedAddress = await upgraded.getAddress();

  // Double-check that the proxy address hasn't changed
  console.log("Proxy address (should be unchanged):", upgradedAddress);
  console.log("Original proxy address:", proxyAddress);

  if (upgradedAddress.toLowerCase() !== proxyAddress.toLowerCase()) {
    console.warn(
      "⚠️ WARNING: Proxy addresses don't match! This is unexpected."
    );
  }

  // Get implementation address directly from the proxy contract after upgrade
  // This is the most reliable method
  const newImplementation = await upgrades.erc1967.getImplementationAddress(
    proxyAddress
  );

  console.log("----------------------------------------");
  console.log("IMPLEMENTATION ADDRESSES:");
  console.log("Before upgrade:", originalImplementation);
  console.log("After upgrade:", newImplementation);

  if (
    originalImplementation.toLowerCase() === newImplementation.toLowerCase()
  ) {
    console.log("⚠️ NOTE: Implementation address has not changed.");
    console.log("This can happen if the bytecode of V2 is very similar to V1.");
  } else {
    console.log("✅ Implementation address has changed as expected.");
  }
  console.log("----------------------------------------");

  // Now correctly await the owner call
  console.log("The current contract owner is:", await upgraded.owner());

  // Try to call a V2-specific function to verify upgrade
  try {
    // Call the version function which only exists in V2
    const version = await upgraded.version();
    console.log("Contract version:", version);

    if (version === "2.0.0") {
      console.log("✅ Contract successfully upgraded to V2!");
    } else {
      console.log("⚠️ Contract returned unexpected version:", version);
    }
  } catch (error) {
    console.error("❌ Error verifying upgrade:", error.message);
    console.error("The upgrade may not have been successful.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
