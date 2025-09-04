const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Storage", function () {
  let Storage, storage;

  beforeEach(async function () {
    Storage = await ethers.getContractFactory("Storage");
    storage = await Storage.deploy();
    await storage.waitForDeployment();
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

