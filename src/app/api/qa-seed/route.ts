import { NextResponse } from "next/server";

import connectDB from "#utils/database/connect";
import { Accounts } from "#utils/database/models/account";
import { Kitchens } from "#utils/database/models/kitchen";
import { Menus } from "#utils/database/models/menu";
import { Profiles } from "#utils/database/models/profile";
import { Tables } from "#utils/database/models/table";
import { requireAdminSession } from "#utils/helper/authHelper";
import { CatchNextResponse } from "#utils/helper/common";

import empire from "../refreshDemoData/_data/empire/empire";
import starbucks from "../refreshDemoData/_data/starbucks/starbucks";

const deleteData = (ids: string[]) => {
	const models = [
		{ model: Menus, name: "Menus" },
		{ model: Kitchens, name: "Kitchens" },
		{ model: Profiles, name: "Profiles" },
		{ model: Tables, name: "Tables" },
		{ model: Accounts, name: "Accounts", field: "username" },
	];
	return Promise.all(models.map(async ({ model, name, field = "restaurantID" }) => ({ model: name, ...(await model.deleteMany({ [field]: { $in: ids } })) })));
};

const createData = async (props: TDocumentData) => {
	const { account, profile, menus, kitchens, tables } = props;
	const newAccount = await new Accounts(account).save();
	const newProfile = await new Profiles(profile).save();
	const [newMenus, newKitchen, newTables] = await Promise.all([
		Promise.all(menus.map((m) => new Menus(m).save())),
		Promise.all(kitchens.map((k) => new Kitchens(k).save())),
		Promise.all(tables.map((t) => new Tables(t).save())),
	]);
	return { account: newAccount._id, profile: newProfile._id, menus: newMenus.length, kitchens: newKitchen.length, tables: newTables.length };
};

export async function POST() {
	try {
		await requireAdminSession();
		await connectDB();
		const deleted = await deleteData(["empire", "starbucks"]);
		const empireResult = await createData(empire);
		const starbucksResult = await createData(starbucks);
		return NextResponse.json({ deleted, empireResult, starbucksResult });
	} catch (err) {
		console.log(err);
		return CatchNextResponse(err);
	}
}

interface TDocumentData {
	account: unknown;
	kitchens: unknown[];
	menus: unknown[];
	profile: unknown;
	tables: unknown[];
}

export const dynamic = "force-dynamic";
