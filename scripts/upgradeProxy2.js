const { ethers, upgrades } = require("hardhat");

// TO DO: Place the address of your proxy here!
const proxyAddress = process.env.PROXY_ADDRESS;

async function main() {
  // Get the original implementation address directly from the proxy
  const originalImplementation =
    await upgrades.erc1967.getImplementationAddress(proxyAddress);
  console.log("Original implementation address:", originalImplementation);

  const VendingMachineV3 = await ethers.getContractFactory("VendingMachineV3");
  console.log("Upgrading to VendingMachineV3...");

  // Perform the upgrade
  const upgraded = await upgrades.upgradeProxy(proxyAddress, VendingMachineV3);

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
    console.log(
      "This can happen if the bytecode of V3 is very similar to V1 or V2."
    );
  } else {
    console.log("✅ Implementation address has changed as expected.");
  }
  console.log("----------------------------------------");

  // Now correctly await the owner call
  console.log("The current contract owner is:", await upgraded.owner());

  // Try to call V3-specific functions to verify upgrade
  try {
    // Call the version function
    const version = await upgraded.version();
    console.log("Contract version:", version);

    // Check if we have a successful upgrade to V3
    if (version === "3.0.0") {
      console.log("✅ Contract reports version 3.0.0");

      // Check if V3 functions and state variables are available
      try {
        const machineName = await upgraded.vendingMachineName();
        console.log("Machine name:", machineName);

        const isPaused = await upgraded.isPaused();
        console.log("Machine is paused:", isPaused);

        const totalSold = await upgraded.totalSodaSold();
        console.log("Total sodas sold:", totalSold.toString());

        console.log("✅✅ Full V3 functionality is available!");
      } catch (error) {
        console.error("❌ Error accessing V3 features:", error.message);
        console.log(
          "The upgrade may have only updated the version number but not the full V3 functionality."
        );
      }
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
