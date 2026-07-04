import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("Deploying GiziChainRegistry to Polygon Amoy...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", ethers.formatEther(balance), "MATIC\n");

  const GiziChainRegistry = await ethers.getContractFactory("GiziChainRegistry");
  const registry = await GiziChainRegistry.deploy();

  await registry.waitForDeployment();
  const address = await registry.getAddress();

  const deployment = {
    contractName: "GiziChainRegistry",
    address,
    network: "polygon-amoy",
    chainId: 80002,
    rpcUrl: "https://rpc-amoy.polygon.technology",
    explorerUrl: `https://amoy.polygonscan.com/address/${address}`,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
  };

  const outPath = path.join(__dirname, "../abi/deployment.json");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(deployment, null, 2));

  console.log("GiziChainRegistry deployed to:", address);
  console.log("Deployment info saved to abi/deployment.json");
  console.log("\nBagikan ke tim frontend:");
  console.log("  - abi/GiziChainRegistry.json  (ABI contract)");
  console.log("  - abi/deployment.json         (address + network config)");
  console.log("  - Explorer:", deployment.explorerUrl);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
