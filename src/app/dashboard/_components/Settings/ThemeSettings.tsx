import { useState } from "react";

import { toast } from "react-toastify";
import { Button, isEqual, isValidThemeColor, Spinner, ThemePicker, ThemeSelect, useScreenType, useXTheme } from "xtreme-ui";

import { useAdmin } from "#components/context/useContext";

import "./themeSettings.scss";

const ThemeSettings = () => {
	const { profile, profileMutate } = useAdmin();
	const { themeColor, setThemeColor } = useXTheme();
	const { isMobile } = useScreenType({
		mobile: 779,
	});

	const [loading, setLoading] = useState(false);

	const onClear = () => {
		if (isValidThemeColor(profile?.themeColor)) setThemeColor(profile?.themeColor);
	};

	const onSave = async () => {
		setLoading(true);
		try {
			const req = await fetch("/api/admin/theme", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ themeColor }),
			});
			const res = await req.json().catch(() => null);
			if (!req.ok || res?.status !== 200) {
				toast.error(res?.message || "Unable to apply theme");
				return;
			}
			await profileMutate();
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Unable to apply theme");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="themeSettings">
			<div className="colorHeader">
				<h1 className="heading">
					Theme <span>Color</span>
				</h1>
				{!isEqual(profile?.themeColor, themeColor) && (
					<div className="action">
						<Button className="clear" disabled={loading} icon="f00d" iconType="solid" onClick={onClear} type="secondaryDanger" />
						<Button className="save" icon="f00c" iconType="solid" label="Apply" loading={loading} onClick={onSave} />
					</div>
				)}
			</div>
			<div className="colorPickerWrapper">
				{loading ? (
					<Spinner className="spinner" fullpage label="Applying theme" />
				) : isMobile ? (
					<ThemeSelect size="default" withScheme withSwatch />
				) : (
					<ThemePicker />
				)}
			</div>
		</div>
	);
};

export default ThemeSettings;
