// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {PaymentRouter} from "../src/PaymentRouter.sol";

/// @notice Deploys PaymentRouter to Arc Testnet.
/// @dev Usage:
///   PRIVATE_KEY=0x... FEE_RECIPIENT=0x... FEE_BPS=0 \
///   forge script script/Deploy.s.sol --rpc-url arc_testnet --broadcast
contract Deploy is Script {
    // USDC ERC-20 interface on Arc Testnet.
    address constant USDC = 0x3600000000000000000000000000000000000000;

    function run() external returns (PaymentRouter router) {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address feeRecipient = vm.envOr("FEE_RECIPIENT", vm.addr(pk));
        uint16 feeBps = uint16(vm.envOr("FEE_BPS", uint256(0)));

        vm.startBroadcast(pk);
        router = new PaymentRouter(USDC, feeRecipient, feeBps);
        vm.stopBroadcast();

        console2.log("PaymentRouter deployed at:", address(router));
        console2.log("  token (USDC):", USDC);
        console2.log("  feeRecipient:", feeRecipient);
        console2.log("  feeBps:", feeBps);
    }
}
