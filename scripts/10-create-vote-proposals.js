//ethers is an amazing library that has a bunch of helpful functions to do blockchain things
import { ethers } from "ethers";
// we are importing the sdk that we previously set up in the "1-initialize-sdk.js" file
import sdk from "./1-initialize-sdk.js";

// we're going to create a new proposal to be voted on by the DAO members
// to do this we need to access the vote module again
const voteModule = sdk.getVoteModule(
  "0xeC9E737eBadCC9E4B9E9F9F4D396B1dd8f145868"
);

// we want the voting module to interact with our governance token, so we'll need to get the token module again
const tokenModule = sdk.getTokenModule(
  "0xE0a33150469AD506717bA6f32CA8ff7973654554"
);

// now that the vote module is all set up to act on the token module, we can create a new proposal to mint some new governance tokens
try {
  // how many additional tokens we want to mint if the proposal passes
  const amount = 50_000;

  await voteModule.propose(
    "Should the DAO mint an additional " +
      amount +
      " tokens into the treasury?",
    // this is an array, because a single proposal can do multiple things. we are not doing that in this case, but it is possible
    [
      {
        // the amount of a native token (in our case this is ETH on rinkeby) that may be sent if the propsal passes
        // in our case we're proposing to mint 50,000 additional governance tokens, there will not be any native token sent, so this should be 0
        nativeTokenValue: 0,

        // the transaction data that the proposal should execute if it passes
        // "mint" here is the function that we want to execute on the token module
        transactionData: tokenModule.contract.interface.encodeFunctionData(
          "mint",
          [
            // the first parameter is the recipient of the tokens, we want to mint them to the DAO treasury, so we'll pass the address of the token module
            voteModule.address,

            // the second parameter defines how many additional tokens will be minted
            // and our friendly neighborhood ethers utils are back to help us parse our amount to have 18 decimals
            ethers.utils.parseUnits(amount.toString(), 18),
          ]
        ),

        // if the proposal passes, which address do we want to call with the transaction data that we defined above
        // in our case we want to send it to the address of our token module
        toAddress: tokenModule.address,
      },
    ]
  );

  // just logging out a success message
  console.log("Successfully created proposal to mint tokens");
} catch (error) {
  console.error("failed to create first proposal", error);
  // we don't want to continue if this fails, so we'll exit the node process
  process.exit(1);
}

// and how about as a second proposal we are asking the DAO members if we can transfer some governance tokens to... ourselves :)
try {
  // how many tokens we want to transfer if the proposal passes, let's be modest
  const amount = 6_900;

  await voteModule.propose(
    "Should the DAO transfer " +
      amount +
      " tokens from the treasury to " +
      process.env.WALLET_ADDRESS +
      "?",
    // this is an array, because a single proposal can do multiple things. we are not doing that in this case, but it is possible
    [
      {
        // the amount of a native token (in our case this is ETH on rinkeby) that may be sent if the propsal passes
        // in our case we're proposing to transfer 6,900 governance tokens, there will not be any native token sent, so this should be 0 again
        nativeTokenValue: 0,

        // the transaction data that the proposal should execute if it passes
        // "mint" here is the function that we want to execute on the token module
        transactionData: tokenModule.contract.interface.encodeFunctionData(
          "transfer",
          [
            // the first parameter is the recipient of the tokens, we want to transfer them to ourselves, so we'll pass the public address of our wallet
            process.env.WALLET_ADDRESS,

            // the second parameter defines how many tokens will be transferred
            // 👏 please for the ethers utils as they are making their last appearance to help us parse the amount to have 18 decimals
            ethers.utils.parseUnits(amount.toString(), 18),
          ]
        ),

        // if the proposal passes, which address do we want to call with the transaction data that we defined above
        // in our case we want to send it to the address of our token module again
        toAddress: tokenModule.address,
      },
    ]
  );

  // just logging out a success message
  console.log(
    "Successfully created proposal to pay ourselves from the trasury, let's hope people vote for it!"
  );
} catch (error) {
  console.error("failed to create first proposal", error);
}