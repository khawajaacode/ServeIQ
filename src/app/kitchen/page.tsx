import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "#utils/helper/authHelper";

import KitchenDisplay from "./KitchenDisplay";

const Kitchen = async () => {
	const session = await getServerSession(authOptions);
	// Kitchen-role accounts are future work; restaurant owners currently use admin.
	if (!session || session.role !== "admin") redirect("/");

	return <KitchenDisplay />;
};

export default Kitchen;
