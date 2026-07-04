import * as fs from "fs";
import * as path from "path";

const artifactPath = path.join(
  __dirname,
  "../artifacts/contracts/GiziChainRegistry.sol/GiziChainRegistry.json"
);

const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf-8"));

const outDir = path.join(__dirname, "../abi");
fs.mkdirSync(outDir, { recursive: true });

const output = {
  contractName: artifact.contractName,
  sourceName: artifact.sourceName,
  abi: artifact.abi,
};

fs.writeFileSync(
  path.join(outDir, "GiziChainRegistry.json"),
  JSON.stringify(output, null, 2)
);

console.log("ABI exported to abi/GiziChainRegistry.json");
