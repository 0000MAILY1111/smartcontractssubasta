import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, ContractFactory } from "ethers";

describe("Storage", function () {
  let StorageFactory: ContractFactory;
  let storage: Contract;

  beforeEach(async function () {
    StorageFactory = await ethers.getContractFactory("Storage");
    storage = await StorageFactory.deploy();
    await storage.waitForDeployment();
    console.log("Storage deployed to:", await storage.getAddress());
  });

  it("should return the initial value as 0", async function () {
    const initialValue = await storage.retrieve();
    expect(Number(initialValue)).to.equal(0);
  });

  it("should update and retrieve the updated value", async function () {
    const setValueTx = await storage.store(42);
    await setValueTx.wait();
    const updatedValue = await storage.retrieve();
    expect(Number(updatedValue)).to.equal(42);
  });
});