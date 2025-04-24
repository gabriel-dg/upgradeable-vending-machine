const { ethers, upgrades } = require("hardhat");

async function main() {
  const VendingMachineV1 = await ethers.getContractFactory("VendingMachineV1");
  console.log("Deploying VendingMachineV1...");
  const proxy = await upgrades.deployProxy(VendingMachineV1, [100]);

  // In ethers v6, we wait for deployment instead of using deployed()
  await proxy.waitForDeployment();

  // In ethers v6, address is a method, not a property
  const proxyAddress = await proxy.getAddress();

  const implementationAddress = await upgrades.erc1967.getImplementationAddress(
    proxyAddress
  );

  console.log("Proxy contract address: " + proxyAddress);
  console.log("Implementation contract address: " + implementationAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
