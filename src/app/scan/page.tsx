import Script from "next/script";
import { themeController } from "xtreme-ui";
import { DEFAULT_THEME_COLOR } from "#utils/constants/common";
import { getThemeColor } from "#utils/database/helper/getThemeColor";
import ScannerClient from "./ScannerClient";

export default async function ScanPage() {
	const color = (await getThemeColor()) ?? DEFAULT_THEME_COLOR;

	return (
		<>
			<Script dangerouslySetInnerHTML={{ __html: themeController({ color }) }} id="scan-theme" />
			<ScannerClient />
		</>
	);
}
