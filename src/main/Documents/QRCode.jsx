import { useState, useEffect } from "react";
import { BarcodeScanner } from "@capacitor-mlkit/barcode-scanning";

export default function Scanner() {
    const [scanResult, setScanResult] = useState("");
    const [isScanning, setIsScanning] = useState(false);

    const startScan = async () => {
        // 1. Check/Request permissions
        const permission = await BarcodeScanner.requestPermissions();
        if (permission.camera !== 'granted') {
            alert("Camera permission required");
            return;
        }

        // 2. Make background transparent so camera shows through
        document.querySelector('body')?.classList.add('scanner-active');
        setIsScanning(true);

        // 3. Start scanning
        const listener = await BarcodeScanner.addListener(
            'barcodeScanned',
            (result) => {
                setScanResult(result.barcode.displayValue);
                stopScan();
            }
        );

        await BarcodeScanner.startScan();
    };

    const stopScan = async () => {
        document.querySelector('body')?.classList.remove('scanner-active');
        setIsScanning(false);
        await BarcodeScanner.stopScan();
        await BarcodeScanner.removeAllListeners();
    };

    return (
        <div id="Scanner" style={{ background: isScanning ? 'transparent' : 'white', minHeight: '100vh' }}>
            {!isScanning ? (
                <div className="ui-layer">
                    <h1>Scanner</h1>
                    <button onClick={startScan}>Start Scanning</button>
                    {scanResult && <p>Result: {scanResult}</p>}
                </div>
            ) : (
                <div className="overlay">
                    <div className="scan-box"></div>
                    <button onClick={stopScan} className="cancel-btn">Cancel</button>
                </div>
            )}
        </div>
    );
}