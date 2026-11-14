import { useSearchParams } from "next/navigation.js";
import type { UIEvent } from "react";

import MenuEditor from "./MenuEditor/MenuEditor";
import SettingsAccount from "./SettingsAccount";
import TableEditor from "./TableEditor";
import "./settings.scss";

const Settings = (props: TSettingsProps) => {
	const { onScroll } = props;
	const queryParams = useSearchParams();
	const subTab = queryParams.get("subTab") ?? "";

	return (
		<div className="settings" onScroll={onScroll}>
			{
				{
					account: <SettingsAccount />,

					menu: <MenuEditor />,

					tables: <TableEditor />,
				}[subTab]
			}
		</div>
	);
};

export default Settings;

export interface TSettingsProps {
	onScroll: (event: UIEvent<HTMLDivElement>) => void;
}
