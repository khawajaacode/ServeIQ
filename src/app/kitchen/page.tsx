import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "#utils/helper/authHelper";

import KitchenDisplay from "./KitchenDisplay";

const Kitchen = async () => {
	const session = await getServerSession(authOptions);
	if (!session || (session.role !== "admin" && session.role !== "kitchen")) redirect("/");

	return <KitchenDisplay />;
};

export default Kitchen;
