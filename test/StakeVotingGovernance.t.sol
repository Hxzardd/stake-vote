// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../contracts/StakeVotingGovernance.sol";

contract StakeVotingGovernanceTest is Test {
    StakeVotingGovernance gov;
    
    address chairperson = address(0x1);
    address voter1 = address(0x2);
    address voter2 = address(0x3);
    
    function setUp() public {
        vm.prank(chairperson);
        gov = new StakeVotingGovernance(4000); // 40% quorum
    }
    
    function testConstructorRevertsOnInvalidQuorum() public {
        vm.expectRevert("Invalid quorum");
        new StakeVotingGovernance(0);
        
        vm.expectRevert("Invalid quorum");
        new StakeVotingGovernance(10001);
    }
    
    function testAssignStake() public {
        vm.startPrank(chairperson);
        gov.assignStake(voter1, 100);
        assertEq(gov.getUserVotingPower(voter1), 100);
        assertEq(gov.totalVotingPower(), 100);
        
        vm.expectRevert("Zero stake");
        gov.assignStake(voter2, 0);
        
        vm.expectRevert("Already assigned");
        gov.assignStake(voter1, 50);
        vm.stopPrank();
    }
    
    function testOnlyChairpersonCanAssignStake() public {
        vm.prank(voter1);
        vm.expectRevert("Only chairperson");
        gov.assignStake(voter2, 100);
    }
    
    function testVotingPhases() public {
        vm.startPrank(chairperson);
        gov.assignStake(voter1, 100);
        gov.setProposal("Test Proposal");
        
        vm.expectRevert("Invalid phase");
        gov.endVoting(); // Can't end before starting
        
        gov.startVoting();
        assertEq(uint(gov.getPhase()), uint(StakeVotingGovernance.Phase.Voting));
        
        vm.expectRevert("Invalid phase");
        gov.assignStake(voter2, 100); // Can't assign stake during voting
        
        gov.endVoting();
        assertEq(uint(gov.getPhase()), uint(StakeVotingGovernance.Phase.Ended));
        vm.stopPrank();
    }
    
    function testVote() public {
        vm.startPrank(chairperson);
        gov.assignStake(voter1, 100);
        gov.assignStake(voter2, 50);
        gov.setProposal("Test Proposal");
        gov.startVoting();
        vm.stopPrank();
        
        vm.prank(voter1);
        gov.vote(true);
        
        vm.prank(voter2);
        gov.vote(false);
        
        (uint256 yesVotes, uint256 noVotes) = gov.getVoteCounts();
        assertEq(yesVotes, 100);
        assertEq(noVotes, 50);
        
        vm.prank(voter1);
        vm.expectRevert("Already voted");
        gov.vote(true);
    }
    
    function testQuorumReached() public {
        vm.startPrank(chairperson);
        gov.assignStake(voter1, 100);
        gov.assignStake(voter2, 50); // Total 150. Quorum is 40% (60)
        gov.setProposal("Test");
        gov.startVoting();
        vm.stopPrank();
        
        vm.prank(voter2);
        gov.vote(true); // 50 votes cast. 50 < 60, quorum not reached.
        
        vm.prank(chairperson);
        gov.endVoting();
        
        assertEq(gov.result(), "FAILED_QUORUM");
    }
    
    function testResultApproved() public {
        vm.startPrank(chairperson);
        gov.assignStake(voter1, 100);
        gov.assignStake(voter2, 50);
        gov.setProposal("Test");
        gov.startVoting();
        vm.stopPrank();
        
        vm.prank(voter1);
        gov.vote(true); // 100 votes cast. Quorum is 60.
        
        vm.prank(chairperson);
        gov.endVoting();
        
        assertEq(gov.result(), "APPROVED");
    }
    
    function testResultRejected() public {
        vm.startPrank(chairperson);
        gov.assignStake(voter1, 100);
        gov.assignStake(voter2, 100);
        gov.setProposal("Test");
        gov.startVoting();
        vm.stopPrank();
        
        vm.prank(voter1);
        gov.vote(false); // 100 cast. Total 200. Quorum is 80.
        
        vm.prank(chairperson);
        gov.endVoting();
        
        assertEq(gov.result(), "REJECTED");
    }
}
