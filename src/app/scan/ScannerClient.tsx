"use client";

import { type IScannerError, Scanner } from "@yudiel/react-qr-scanner";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { Button, Icon } from "xtreme-ui";

import { SITE_NAME } from "#utils/seo/constants";

import "./scan.scss";

interface IDetectedBarcode {
	raw_value?: string;
	rawValue: string;
	[key: string]: unknown;
}

interface ExtendedMediaTrackCapabilities extends MediaTrackCapabilities {
	torch?: boolean;
	zoom?: boolean;
}

const ScannerClient = () => {
	const checkInterval = useRef<NodeJS.Timeout | null>(null);

	const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
	const [deviceId, setDeviceId] = useState<string | undefined>(undefined);
	const [torch, setTorch] = useState(false);
	const [zoom, setZoom] = useState(1);
	const [error, setError] = useState<string | null>(null);
	const [hasPermission, setHasPermission] = useState<boolean | null>(null);
	const [isScanning, setIsScanning] = useState(false);
	const [caps, setCaps] = useState({ torch: false, zoom: false });

	const enumerateDevices = useCallback(async () => {
		try {
			const devices = await navigator.mediaDevices.enumerateDevices();
			const videoDevices = devices.filter((device) => device.kind === "videoinput");
			setDevices(videoDevices);
		} catch (err) {
			console.error("Error enumerating devices:", err);
		}
	}, []);

	useEffect(() => {
		enumerateDevices();
		navigator.mediaDevices.addEventListener("devicechange", enumerateDevices);
		return () => {
			navigator.mediaDevices.removeEventListener("devicechange", enumerateDevices);
		};
	}, [enumerateDevices]);

	useEffect(() => {
		if (devices && devices.length > 0 && !deviceId) {
			const backCamera = devices.find((d) => d.label.toLowerCase().includes("back") || d.label.toLowerCase().includes("environment"));
			if (backCamera) {
				setDeviceId(backCamera.deviceId);
			} else if (devices.length > 0) {
				setDeviceId(devices.at(-1)?.deviceId);
			}
		}
	}, [devices, deviceId]);

	useEffect(() => {
		const checkCapabilities = () => {
			const video = document.querySelector("video");
			if (video?.srcObject) {
				const stream = video.srcObject as MediaStream;
				const track = stream.getVideoTracks()[0];
				if (track) {
					if (devices.some((d) => !d.label)) {
						enumerateDevices();
					}

					const capabilities = (track.getCapabilities ? track.getCapabilities() : {}) as ExtendedMediaTrackCapabilities;
					setCaps({
						torch: !!capabilities.torch,
						zoom: !!capabilities.zoom,
					});
					if (checkInterval.current) {
						clearInterval(checkInterval.current);
						checkInterval.current = null;
					}
				}
			}
		};

		if (checkInterval.current) clearInterval(checkInterval.current);
		checkInterval.current = setInterval(checkCapabilities, 500);

		return () => {
			if (checkInterval.current) clearInterval(checkInterval.current);
		};
	}, [devices, enumerateDevices]);

	const handleScan = (detectedCodes: unknown) => {
		const codes = detectedCodes as IDetectedBarcode[];
		if (codes && codes.length > 0 && !isScanning) {
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
		console.warn("Scanner error:", errorObj);
		switch (errorObj.kind) {
			case "permission-denied":
				setHasPermission(false);
				setError("Camera permission denied. Please allow access.");
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
				setError("The selected camera is unavailable. Try selecting another camera.");
				break;
			default:
				setError("Unable to start the camera. Please try again.");
		}
	};

	const cameraOptions = devices.map((d, index) => ({
		label: d?.label?.replace(/\s*\(.*?\)\s*/g, "") || `Camera ${index + 1}`,
		value: d.deviceId,
	}));

	return (
		<div className="scannerPage">
			<h4 className="scannerHeader">{SITE_NAME}</h4>
			<p className="scannerFooter">Scan QR to Order</p>
			{devices.length > 0 && (
				<div className="cameraSelectWrapper">
					<select
						className="cameraSelect"
						onChange={(e) => {
							setDeviceId(e.target.value);
							setError(null);
							setHasPermission(null);
						}}
						value={deviceId || ""}
					>
						{cameraOptions.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
					<Icon className="selectIcon" code="f0d7" type="solid" />
				</div>
			)}

			<div className="scannerContainer">
				{error ? (
					<div className="errorMessage">
						<Icon className="errorIcon" code="f071" type="solid" />
						<p>{error}</p>
						{hasPermission === false && <p className="hint">Check your browser settings.</p>}
					</div>
				) : (
					<Scanner
						components={{
							finder: false,
						}}
						constraints={{
							advanced: [{ torch, zoom } as unknown as MediaTrackConstraintSet],
							deviceId: deviceId ? { exact: deviceId } : undefined,
						}}
						key={`${deviceId}-${torch}`}
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

				{caps.torch && (
					<Button
						className="flashBtn"
						disabled={!!error}
						icon="f0e7"
						iconType="solid"
						onClick={() => setTorch(!torch)}
						type={torch ? "primary" : "secondary"}
					/>
				)}
			</div>

			<div className="scannerControls">
				{caps.zoom && (
					<div className="zoomControls">
						<Button className="zoomBtn" disabled={!!error} icon="f068" iconType="solid" onClick={() => setZoom(Math.max(1, zoom - 0.5))} type="secondary" />
						<span className="zoomVal">{zoom}x</span>
						<Button className="zoomBtn" disabled={!!error} icon="f067" iconType="solid" onClick={() => setZoom(Math.min(5, zoom + 0.5))} type="secondary" />
					</div>
				)}
			</div>
		</div>
	);
};

export default ScannerClient;
