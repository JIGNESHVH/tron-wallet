import "./App.css";
import { TronWeb } from "tronweb";
import { useState } from "react";
import * as bip39 from "bip39";
import { HDKey } from "@scure/bip32";

import { Buffer } from "buffer";

function App() {
  window.Buffer = Buffer;

  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const createWallet = async () => {
    console.log("Creating wallet...");
    try {
      setLoading(true);
      setError("");

      // Generate mnemonic and seed
      const mnemonic =
        "kite skirt chaos submit noodle coin wheat plug dust chaos almost hedgehog"; // Generate a mnemonic phrase
      const seed = await bip39.mnemonicToSeed(mnemonic); // Get seed from mnemonic

      // Initialize TronWeb
      const tronWeb = new TronWeb({
        fullHost: "https://api.trongrid.io",
      });

      // Derive private key from seed using @scure/bip32
      const root = HDKey.fromMasterSeed(seed);
      const derivedKey = root.derive("m/44'/195'/0'/0/0"); // Derive using TRON's BIP44 path

      if (!derivedKey.privateKey) {
        throw new Error("Private key not found in derived key.");
      }

      const privateKey = Buffer.from(derivedKey.privateKey).toString("hex"); // Convert to hex

      // Get address from private key
      const address = tronWeb.address.fromPrivateKey(privateKey);

      // Set wallet state to display in UI
      setWallet({ address, privateKey, mnemonic });
    } catch (err) {
      console.error("Error:", err);
      setError("Error generating wallet. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wallet-container">
      <h1 className="wallet-title">Create Your TRON Wallet</h1>
      <button className="wallet-btn" onClick={createWallet} disabled={loading}>
        {loading ? "Generating Wallet..." : "Generate Wallet"}
      </button>

      {error && <p className="error-message">{error}</p>}

      {wallet && (
        <div className="wallet-info">
          <p className="wallet-address">
            <strong>Address:</strong> {wallet.address}
          </p>
          <div className="private-key-section">
            <p>
              <strong>Private Key:</strong> {wallet.privateKey}
            </p>
          </div>
          <div className="mnemonic-section">
            <p>
              <strong>Seed Phrase:</strong> {wallet.mnemonic}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
