"use client";

import { type IScannerError, Scanner } from "@yudiel/react-qr-scanner";
import { useState } from "react";
import { toast } from "react-toastify";
import { Icon } from "xtreme-ui";

import { SITE_NAME } from "#utils/seo/constants";

import "./scan.scss";

interface IDetectedBarcode {
	raw_value?: string;
	rawValue: string;
	[key: string]: unknown;
}

const ScannerClient = () => {
	const [error, setError] = useState<string | null>(null);
	const [isScanning, setIsScanning] = useState(false);

	const handleScan = (detectedCodes: unknown) => {
		const codes = detectedCodes as IDetectedBarcode[];
		if (codes.length > 0 && !isScanning) {
			const result = codes[0];
			const url = result.rawValue || result.raw_value;

			if (url) {
				try {
					const urlObj = new URL(url);
					const isSameSite = urlObj.hostname === window.location.hostname;
					const hasTable = urlObj.searchParams.has("table");

					if (isSameSite && hasTable) {
						setIsScanning(true);
						window.location.replace(urlObj.pathname + urlObj.search + urlObj.hash);
					} else {
						toast.error("Not a valid restaurant QR");
					}
				} catch {
					toast.error("Invalid QR Code");
				}
			}
		}
	};

	const handleError = (errorObj: IScannerError) => {
		switch (errorObj.kind) {
			case "permission-denied":
				setError("Camera permission denied. Please allow access and check your browser settings.");
				break;
			case "no-camera":
				setError("No camera found on this device.");
				break;
			case "in-use":
				setError("Camera is already in use by another application.");
				break;
			case "insecure-context":
				setError("Camera access requires a secure connection.");
				break;
			case "unsupported":
				setError("Camera scanning is not supported by this browser.");
				break;
			case "overconstrained":
				setError("The selected camera is unavailable.");
				break;
			default:
				setError("Unable to start the camera. Please try again.");
		}
	};

	return (
		<div className="scannerPage">
			<h4 className="scannerHeader">{SITE_NAME}</h4>
			<p className="scannerFooter">Scan QR to Order</p>

			<div className="scannerContainer">
				{error ? (
					<div className="errorMessage">
						<Icon className="errorIcon" code="f071" type="solid" />
						<p>{error}</p>
					</div>
				) : (
					<Scanner
						components={{
							finder: false,
						}}
						onError={handleError}
						onScan={handleScan}
						styles={{
							container: { borderRadius: "20px", height: "100%", width: "100%" },
							video: { borderRadius: "20px", objectFit: "cover" },
						}}
					/>
				)}

				<div className="scanOverlay">
					<div className="corners" />
				</div>
			</div>
		</div>
	);
};

export default ScannerClient;
