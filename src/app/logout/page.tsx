"use client";

import Script from "next/script";
import { signOut, useSession } from "next-auth/react";
import { useEffect } from "react";
import { Spinner, themeController } from "xtreme-ui";
import { DEFAULT_THEME_COLOR } from "#utils/constants/common";

export default function Logout() {
	const session = useSession();

	useEffect(() => {
		if (session.status !== "authenticated") return;

		const role = session.data?.role;
		const restaurant = session.data?.restaurant;
		const callbackUrl = role === "customer" && restaurant?.username ? `/${restaurant.username}?table=${restaurant.table}` : "/";
		signOut({ callbackUrl });
	}, [session]);

	return (
		<>
			<Script dangerouslySetInnerHTML={{ __html: themeController({ color: DEFAULT_THEME_COLOR }) }} id="logout-theme" />
			<Spinner fullpage label="Signing out..." />
		</>
	);
}
