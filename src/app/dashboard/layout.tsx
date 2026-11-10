/* eslint-disable react/no-danger */
import Script from "next/script";
import type { ReactNode } from "react";

import { themeController } from "xtreme-ui";

import { getThemeColor } from "#utils/database/helper/getThemeColor";

export const metadata = {
	title: "ServeIQ ⌘ Admin",
};
export default async function RootLayout({ children }: IRootProps) {
	const themeColor = await getThemeColor();
	return (
		<>
			<Script dangerouslySetInnerHTML={{ __html: themeController({ color: themeColor }) }} id="dashboard-theme" />
			{children}
		</>
	);
}

interface IRootProps {
	children?: ReactNode;
}
