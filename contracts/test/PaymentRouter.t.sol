// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {PaymentRouter} from "../src/PaymentRouter.sol";
import {IERC20} from "openzeppelin-contracts/token/ERC20/IERC20.sol";
import {ERC20} from "openzeppelin-contracts/token/ERC20/ERC20.sol";

/// @dev Minimal 6-decimal mock matching the USDC ERC-20 interface on Arc.
contract MockUSDC is ERC20 {
    constructor() ERC20("USD Coin", "USDC") {}

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract PaymentRouterTest is Test {
    MockUSDC internal usdc;
    PaymentRouter internal router;

    address internal payer = makeAddr("payer");
    address internal merchant = makeAddr("merchant");
    address internal treasury = makeAddr("treasury");

    bytes32 internal constant LINK = keccak256("link-0001");

    function setUp() public {
        usdc = new MockUSDC();
    }

    function _deploy(uint16 feeBps) internal {
        router = new PaymentRouter(address(usdc), treasury, feeBps);
    }

    function _fundAndApprove(uint256 amount) internal {
        usdc.mint(payer, amount);
        vm.prank(payer);
        usdc.approve(address(router), amount);
    }

    function test_PayWithoutFee_TransfersFullAmount() public {
        _deploy(0);
        uint256 amount = 49_000000; // 49 USDC (6 decimals)
        _fundAndApprove(amount);

        vm.prank(payer);
        router.pay(LINK, merchant, amount);

        assertEq(usdc.balanceOf(merchant), amount, "merchant got full amount");
        assertEq(usdc.balanceOf(payer), 0, "payer drained");
        assertEq(usdc.balanceOf(treasury), 0, "no fee taken");
        assertEq(usdc.balanceOf(address(router)), 0, "router holds nothing");
    }

    function test_PayWithFee_SplitsTwoWays() public {
        _deploy(100); // 1%
        uint256 amount = 100_000000; // 100 USDC
        _fundAndApprove(amount);

        vm.prank(payer);
        router.pay(LINK, merchant, amount);

        assertEq(usdc.balanceOf(merchant), 99_000000, "merchant net 99");
        assertEq(usdc.balanceOf(treasury), 1_000000, "treasury fee 1");
        assertEq(usdc.balanceOf(address(router)), 0, "router holds nothing");
    }

    function test_PayEmitsEvent() public {
        _deploy(50); // 0.5%
        uint256 amount = 200_000000;
        _fundAndApprove(amount);

        uint256 expectedFee = (amount * 50) / 10_000;

        vm.expectEmit(true, true, true, true);
        emit PaymentRouter.PaymentReceived(
            LINK, payer, merchant, amount, expectedFee
        );

        vm.prank(payer);
        router.pay(LINK, merchant, amount);
    }

    function test_RevertWhen_AmountZero() public {
        _deploy(0);
        vm.prank(payer);
        vm.expectRevert(PaymentRouter.ZeroAmount.selector);
        router.pay(LINK, merchant, 0);
    }

    function test_RevertWhen_RecipientZero() public {
        _deploy(0);
        _fundAndApprove(1_000000);
        vm.prank(payer);
        vm.expectRevert(PaymentRouter.ZeroRecipient.selector);
        router.pay(LINK, address(0), 1_000000);
    }

    function test_RevertWhen_FeeTooHigh() public {
        vm.expectRevert(PaymentRouter.FeeTooHigh.selector);
        new PaymentRouter(address(usdc), treasury, 201);
    }

    function testFuzz_NetPlusFeeEqualsAmount(uint96 rawAmount, uint16 bps)
        public
    {
        bps = uint16(bound(bps, 0, router_MAX_FEE()));
        uint256 amount = bound(rawAmount, 1, type(uint96).max);
        _deploy(bps);
        _fundAndApprove(amount);

        vm.prank(payer);
        router.pay(LINK, merchant, amount);

        uint256 fee = (amount * bps) / 10_000;
        assertEq(
            usdc.balanceOf(merchant) + usdc.balanceOf(treasury),
            amount,
            "net + fee == amount"
        );
        assertEq(usdc.balanceOf(treasury), fee, "fee matches");
    }

    function router_MAX_FEE() internal pure returns (uint16) {
        return 200;
    }
}
