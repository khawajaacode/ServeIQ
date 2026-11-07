import type { ChangeEvent } from "react";
import { useState } from "react";

import { toast } from "react-toastify";
import { Button, Select, Spinner, Textfield } from "xtreme-ui";

import Modal from "#components/layout/Modal";
import type { TMenu } from "#utils/database/models/menu";

import "./menuEditorModal.scss";

const foodTypeOptions = [
	{ label: "Spicy", value: "spicy" },
	{ label: "Extra Spicy", value: "extra-spicy" },
	{ label: "Sweet", value: "sweet" },
];

const vegOptions = [
	{ label: "Veg", value: "veg" },
	{ label: "Non-Veg", value: "non-veg" },
	{ label: "Contains Egg", value: "contains-egg" },
];

const MenuEditorModal = (props: TMenuEditorModalProps) => {
	const { categories, item, onClose, onSaved } = props;
	const isEdit = !!item;

	const [loading, setLoading] = useState(false);
	const [name, setName] = useState(item?.name ?? "");
	const [description, setDescription] = useState(item?.description ?? "");
	const [category, setCategory] = useState<string>(item?.category ?? "");
	const [price, setPrice] = useState(item?.price !== undefined ? String(item.price) : "");
	const [taxPercent, setTaxPercent] = useState(item?.taxPercent !== undefined ? String(item.taxPercent) : "");
	const [foodType, setFoodType] = useState<string>(item?.foodType ?? "");
	const [veg, setVeg] = useState<string>(item?.veg ?? "");
	const [image, setImage] = useState(item?.image ?? "");

	const onSave = async () => {
		if (!name.trim()) return toast.warn("Menu item name is required");
		if (!category) return toast.warn("Category is required");
		if (!price) return toast.warn("Price is required");
		if (!taxPercent) return toast.warn("Tax percent is required");
		if (!veg) return toast.warn("Food type (veg / non-veg) is required");

		setLoading(true);
		const req = await fetch("/api/admin/menu", {
			method: "POST",
			body: JSON.stringify({
				category,
				description,
				foodType: foodType || undefined,
				image,
				itemId: item?._id?.toString(),
				name: name.trim(),
				price: Number(price),
				taxPercent: Number(taxPercent),
				veg,
			}),
		});
		const res = await req.json();

		if (res?.status === 200) {
			toast.success(res?.message);
			await onSaved();
			onClose();
		} else {
			toast.error(res?.message);
		}
		setLoading(false);
	};

	return (
		<Modal open setOpen={(open) => !open && onClose()}>
			<div className="menuEditorModal">
				<h1 className="heading">
					{isEdit ? "Edit" : "Add"} <span>Menu Item</span>
				</h1>
				{loading ? (
					<Spinner fullpage label={isEdit ? "Updating menu item..." : "Adding menu item..."} />
				) : (
					<div className="fields">
						<Textfield className="field" onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setName(e.target.value)} placeholder="Item name" value={name} />
						<Textfield className="field" onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDescription(e.target.value)} placeholder="Description" textarea value={description} />
						<Select
							className="field"
							clearable
							onChange={(value?: string) => setCategory(value ?? "")}
							options={categories.map((cat: string) => ({ label: cat, value: cat }))}
							placeholder="Category"
							value={category}
						/>
						<div className="fieldRow">
							<Textfield className="field" onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setPrice(e.target.value)} placeholder="Price (PKR)" type="number" value={price} />
							<Textfield className="field" onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setTaxPercent(e.target.value)} placeholder="Tax %" type="number" value={taxPercent} />
						</div>
						<div className="fieldRow">
							<Select className="field" clearable onChange={(value?: string) => setVeg(value ?? "")} options={vegOptions} placeholder="Veg / Non-Veg" value={veg} />
							<Select className="field" clearable onChange={(value?: string) => setFoodType(value ?? "")} options={foodTypeOptions} placeholder="Food taste (optional)" value={foodType} />
						</div>
						<Textfield className="field" onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setImage(e.target.value)} placeholder="Image URL (optional)" value={image} />
						<div className="actions">
							<Button disabled={loading} icon="f00d" iconType="solid" onClick={onClose} type="secondaryDanger" />
							<Button icon="f00c" iconType="solid" label="Save" loading={loading} onClick={onSave} />
						</div>
					</div>
				)}
			</div>
		</Modal>
	);
};

export default MenuEditorModal;

export interface TMenuEditorModalProps {
	categories: string[];
	item?: Partial<TMenu>;
	onClose: () => void;
	onSaved: () => Promise<void>;
}
