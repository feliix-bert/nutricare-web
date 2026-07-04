// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// OpenZeppelin Ownable: restricts admin-only functions to the contract deployer
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title GiziChainRegistry
 * @notice Combines transparent MATIC donations with immutable health-log hash anchoring
 *         for stunting-prevention programs (GiziChain hackathon project).
 */
contract GiziChainRegistry is Ownable {
    // ─────────────────────────────────────────────────────────────────────────
    // STRUCTS
    // ─────────────────────────────────────────────────────────────────────────

    /// @dev Represents a beneficiary family registered by the program admin
    struct Recipient {
        uint id;                        // Auto-incremented unique identifier
        address payable wallet;         // Wallet that receives donations directly
        string name;                    // Human-readable family / beneficiary name
        uint totalDonationsReceived;    // Running total of MATIC received (in wei)
        bool isRegistered;              // True once the recipient has been registered
    }

    /// @dev Immutable on-chain record of a single donation transaction
    struct DonationRecord {
        address donor;                  // Wallet address of the donor
        uint amount;                    // Donation amount in wei
        uint timestamp;                 // block.timestamp when the donation occurred
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STATE VARIABLES
    // ─────────────────────────────────────────────────────────────────────────

    /// @dev Total number of recipients ever registered (also acts as next ID)
    uint public recipientCount;

    /// @dev Maps recipient ID → Recipient struct
    mapping(uint => Recipient) public recipients;

    /// @dev Maps recipient ID → array of all DonationRecord entries
    mapping(uint => DonationRecord[]) public donationHistories;

    /// @dev Maps health assessment ID → SHA-256 hash string anchored on-chain
    mapping(uint => string) public anchoredHashes;

    // ─────────────────────────────────────────────────────────────────────────
    // EVENTS
    // ─────────────────────────────────────────────────────────────────────────

    /// @dev Emitted when a donor sends MATIC directly to a recipient wallet
    event DonationSent(
        address indexed donor,
        address indexed recipient,
        uint amount,
        uint timestamp
    );

    /// @dev Emitted when the admin registers a new beneficiary family
    event RecipientRegistered(uint id, address wallet, string name);

    /// @dev Emitted when a health assessment hash is permanently stored on-chain
    event RecordAnchored(
        uint indexed assessmentId,
        string dataHash,
        uint timestamp
    );

    // ─────────────────────────────────────────────────────────────────────────
    // CONSTRUCTOR
    // ─────────────────────────────────────────────────────────────────────────

    /// @dev Sets the deployer as the contract owner (admin)
    constructor() Ownable(msg.sender) {}

    // ─────────────────────────────────────────────────────────────────────────
    // ADMIN FUNCTIONS (onlyOwner)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @notice Register a new beneficiary family
     * @param _wallet Payable address that will receive direct MATIC donations
     * @param _name   Display name for the family (e.g. "Keluarga Ahmad")
     */
    function registerRecipient(
        address payable _wallet,
        string memory _name
    ) external onlyOwner {
        // Reject zero address and empty names
        require(_wallet != address(0), "Invalid wallet address");
        require(bytes(_name).length > 0, "Name cannot be empty");

        // Increment counter to assign the next available ID (starts at 1)
        recipientCount++;
        uint newId = recipientCount;

        // Populate the Recipient struct in storage
        recipients[newId] = Recipient({
            id: newId,
            wallet: _wallet,
            name: _name,
            totalDonationsReceived: 0,
            isRegistered: true
        });

        // Emit event so frontends / explorers can index the new family
        emit RecipientRegistered(newId, _wallet, _name);
    }

    /**
     * @notice Anchor a SHA-256 hash of off-chain health assessment data
     * @param _assessmentId Unique ID matching the off-chain database record
     * @param _hash         Hex-encoded SHA-256 hash string of the health log JSON
     */
    function anchorRecord(
        uint _assessmentId,
        string memory _hash
    ) external onlyOwner {
        require(bytes(_hash).length > 0, "Hash cannot be empty");

        // Overwrite or set the hash for this assessment ID
        anchoredHashes[_assessmentId] = _hash;

        emit RecordAnchored(_assessmentId, _hash, block.timestamp);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PUBLIC FUNCTIONS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @notice Send MATIC directly to a registered recipient's wallet
     * @param _recipientId ID of the target beneficiary family
     * @dev Uses low-level .call to forward funds instantly — contract never holds MATIC
     */
    function donate(uint _recipientId) external payable {
        // Ensure a positive donation amount was sent
        require(msg.value > 0, "Donation must be greater than zero");

        // Load recipient from storage and validate registration
        Recipient storage recipient = recipients[_recipientId];
        require(recipient.isRegistered, "Recipient not registered");

        // Forward MATIC directly to the recipient wallet via secure low-level call
        (bool success, ) = recipient.wallet.call{value: msg.value}("");
        require(success, "MATIC transfer to recipient failed");

        // Update running total for transparency
        recipient.totalDonationsReceived += msg.value;

        // Append an immutable donation record to the on-chain history
        donationHistories[_recipientId].push(
            DonationRecord({
                donor: msg.sender,
                amount: msg.value,
                timestamp: block.timestamp
            })
        );

        // Emit event for real-time donation tracking in the frontend
        emit DonationSent(
            msg.sender,
            recipient.wallet,
            msg.value,
            block.timestamp
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // VIEW FUNCTIONS
    // ─────────────────────────────────────────────────────────────────────────

    /// @notice Return a single Recipient struct by ID
    function getRecipient(uint _id) external view returns (Recipient memory) {
        require(recipients[_id].isRegistered, "Recipient not found");
        return recipients[_id];
    }

    /// @notice Return all registered recipients as an array (for frontend family list)
    function getRecipients() external view returns (Recipient[] memory) {
        // Pre-allocate array with exact size to save gas on reads
        Recipient[] memory allRecipients = new Recipient[](recipientCount);

        for (uint i = 1; i <= recipientCount; i++) {
            allRecipients[i - 1] = recipients[i];
        }

        return allRecipients;
    }

    /// @notice Return the full donation history for a given recipient
    function getDonationHistory(
        uint _recipientId
    ) external view returns (DonationRecord[] memory) {
        require(
            recipients[_recipientId].isRegistered,
            "Recipient not found"
        );
        return donationHistories[_recipientId];
    }

    /**
     * @notice Verify whether a provided hash matches the on-chain anchored hash
     * @param _assessmentId Health assessment ID to look up
     * @param _hash         SHA-256 hash computed client-side from the database record
     * @return True if the hashes match exactly (record is authentic & unaltered)
     */
    function verifyRecord(
        uint _assessmentId,
        string memory _hash
    ) external view returns (bool) {
        // keccak256 comparison is the gas-efficient way to compare strings in Solidity
        return
            keccak256(bytes(anchoredHashes[_assessmentId])) ==
            keccak256(bytes(_hash));
    }
}
