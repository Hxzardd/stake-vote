// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "../contracts/StakeVotingGovernance.sol";

contract DeployScript is Script {
    function run() external {
        uint256 quorumBps = vm.envUint("QUORUM_BPS");
        
        vm.startBroadcast();
        StakeVotingGovernance gov = new StakeVotingGovernance(quorumBps);
        vm.stopBroadcast();
        
        console.log("Deployed StakeVotingGovernance at:", address(gov));
        console.log("With quorum BPS:", quorumBps);
    }
}
