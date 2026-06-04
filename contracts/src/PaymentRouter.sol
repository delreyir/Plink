// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "openzeppelin-contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "openzeppelin-contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "openzeppelin-contracts/utils/ReentrancyGuard.sol";

/// @title PaymentRouter
/// @notice Optional on-chain router for Plink payment links on Arc.
/// @dev The default Plink flow is a plain USDC `transfer`, which needs no
///      contract. This router exists for merchants who want on-chain
///      reconciliation: every payment is tagged with a `linkId` and emits a
///      `PaymentReceived` event that can be indexed back to a specific link.
///      An optional app fee (in basis points) can be collected at settlement.
///
///      The router is non-custodial: USDC is pulled from the payer and pushed
///      to the recipient within the same transaction. No balances are held.
contract PaymentRouter is ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @notice The settlement token (USDC ERC-20 interface on Arc).
    IERC20 public immutable token;

    /// @notice Address that receives the optional app fee.
    address public immutable feeRecipient;

    /// @notice App fee in basis points (1 bp = 0.01%). Capped at 200 (2%).
    uint16 public immutable feeBps;

    uint16 public constant MAX_FEE_BPS = 200;
    uint16 public constant BPS_DENOMINATOR = 10_000;

    /// @notice Emitted on every successful payment routed through the contract.
    /// @param linkId Caller-supplied id identifying the payment link.
    /// @param payer The wallet that paid.
    /// @param recipient The wallet that received the net amount.
    /// @param amount The gross amount requested (before fee).
    /// @param fee The fee taken from the gross amount.
    event PaymentReceived(
        bytes32 indexed linkId,
        address indexed payer,
        address indexed recipient,
        uint256 amount,
        uint256 fee
    );

    error ZeroAmount();
    error ZeroRecipient();
    error FeeTooHigh();

    /// @param token_ USDC ERC-20 address on Arc.
    /// @param feeRecipient_ Address to receive fees (ignored when feeBps_ == 0).
    /// @param feeBps_ App fee in basis points; must be <= MAX_FEE_BPS.
    constructor(address token_, address feeRecipient_, uint16 feeBps_) {
        if (token_ == address(0)) revert ZeroRecipient();
        if (feeBps_ > MAX_FEE_BPS) revert FeeTooHigh();
        if (feeBps_ > 0 && feeRecipient_ == address(0)) revert ZeroRecipient();

        token = IERC20(token_);
        feeRecipient = feeRecipient_;
        feeBps = feeBps_;
    }

    /// @notice Pay a payment link. Pulls `amount` USDC from the caller, sends
    ///         the net to `to`, and forwards any fee to `feeRecipient`.
    /// @dev Caller must have approved this contract for at least `amount`.
    /// @param linkId Identifier of the payment link being paid.
    /// @param to Recipient of the payment.
    /// @param amount Gross amount of USDC to pay.
    function pay(bytes32 linkId, address to, uint256 amount)
        external
        nonReentrant
    {
        if (amount == 0) revert ZeroAmount();
        if (to == address(0)) revert ZeroRecipient();

        uint256 fee = (amount * feeBps) / BPS_DENOMINATOR;
        uint256 net = amount - fee;

        // Pull gross from payer.
        token.safeTransferFrom(msg.sender, address(this), amount);

        // Push net to recipient.
        token.safeTransfer(to, net);

        // Forward fee, if any.
        if (fee > 0) {
            token.safeTransfer(feeRecipient, fee);
        }

        emit PaymentReceived(linkId, msg.sender, to, amount, fee);
    }
}
