import { type UIEvent, useRef, useState } from "react";

import { toast } from "react-toastify";
import { Button, Icon, Spinner } from "xtreme-ui";

import { useAdmin } from "#components/context/useContext";
import type { TMenu } from "#utils/database/models/menu";

import MenuEditorItem from "./MenuEditorItem";
import MenuEditorModal from "./MenuEditorModal";
import "./menuEditor.scss";

const MenuEditor = () => {
	const { profile, menus, profileLoading, profileMutate } = useAdmin();
	const [modal, setModal] = useState<"new" | "edit" | null>(null);
	const [editItem, setEditItem] = useState<TMenu>();
	const [hideSettingsLoading, setHideSettingsLoading] = useState<string[]>([]);
	const [category, setCategory] = useState(0);
	const selectedCategory = profile?.categories?.[category];

	const categories = useRef<HTMLDivElement>(null);

	const [leftCategoryScroll, setLeftCategoryScroll] = useState(false);
	const [rightCategoryScroll, setRightCategoryScroll] = useState(true);

	const onCategoryScroll = (event: UIEvent<HTMLDivElement>) => {
		const target = event.target as HTMLDivElement;
		if (target.scrollLeft > 50) setLeftCategoryScroll(true);
		else setLeftCategoryScroll(false);

		if (Math.round(target.scrollWidth - target.scrollLeft) - 50 > target.clientWidth) setRightCategoryScroll(true);
		else setRightCategoryScroll(false);
	};
	const categoryScrollLeft = () => {
		if (categories.current) categories.current.scrollLeft -= 400;
	};
	const categoryScrollRight = () => {
		if (categories.current) categories.current.scrollLeft += 400;
	};
	const onHide = async (itemId: string, hidden: boolean) => {
		setHideSettingsLoading((v) => [...v, itemId]);
		try {
			const req = await fetch("/api/admin/menu/hidden", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ itemId, hidden }),
			});
			const res = await req.json().catch(() => null);

			if (!req.ok) {
				toast.error(res?.message || "Unable to update menu visibility");
				return;
			}

			await profileMutate();
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Unable to update menu visibility");
		} finally {
			setHideSettingsLoading((v) => v.filter((item) => item !== itemId));
		}
	};
	const onEdit = (item: TMenu) => {
		setEditItem(item);
		setModal("edit");
	};

	if (profileLoading) return <Spinner fullpage label="Loading Menu..." />;

	return (
		<div className="menuEditor">
			{modal === "new" && (
				<MenuEditorModal categories={profile?.categories ?? []} item={undefined} onClose={() => setModal(null)} onSaved={profileMutate} />
			)}
			{modal === "edit" && (
				<MenuEditorModal categories={profile?.categories ?? []} item={editItem} onClose={() => setModal(null)} onSaved={profileMutate} />
			)}
			<div className="menuCategoryEditor">
				<div className="menuCategoryHeader">
					<h1 className="menuCategoryHeading">Menu Categories</h1>
				</div>
				<div className="menuCategoryContainer" onScroll={onCategoryScroll} ref={categories}>
					{profile?.categories?.map((item, i) => (
						<div className={`menuCategory ${category === i ? "active" : ""}`} key={i} onClick={() => setCategory(i)}>
							<span className="title">{item}</span>
						</div>
					))}
					<div className="space" />
				</div>
				<div className={`scrollLeft ${leftCategoryScroll ? "show" : ""}`} onClick={categoryScrollLeft}>
					<Icon code="f053" type="solid" />
				</div>
				<div className={`scrollRight ${rightCategoryScroll ? "show" : ""}`} onClick={categoryScrollRight}>
					<Icon code="f054" type="solid" />
				</div>
			</div>
			<div className="menuItemEditor">
				<div className="menuItemHeader">
					<h1 className="menuItemHeading">Menu Items</h1>
				</div>
				<div className="menuItemContainer">
					{menus
						.filter((item) => item.category === selectedCategory)
						.map((item, id) => (
							<MenuEditorItem
								hideSettingsLoading={hideSettingsLoading.includes(item._id.toString())}
								item={item}
								key={id}
								onEdit={onEdit}
								onHide={onHide}
							/>
						))}
				</div>
			</div>
			<Button className={`menuEditorAdd ${modal ? "active" : ""}`} icon="2b" iconType="solid" onClick={() => setModal("new")} />
		</div>
	);
};

export default MenuEditor;
