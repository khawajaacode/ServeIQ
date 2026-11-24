"use client";

import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import useSWR from "swr";
import { Button, Textfield } from "xtreme-ui";

import { useAdmin } from "#components/context/useContext";
import { fetcher } from "#utils/helper/common";

type Ingredient = { _id: string; name: string; unit: string; stock: number; lowStockThreshold: number };
type Recipe = { menuItemID: string; ingredientID: string; quantityRequired: number };

export default function InventoryEditor() {
	const { menus } = useAdmin();
	const { data, mutate } = useSWR<{ ingredients: Ingredient[]; recipes: Recipe[] }>("/api/admin/inventory", fetcher);
	const [values, setValues] = useState<Record<string, { stock: string; threshold: string }>>({});
	const [draft, setDraft] = useState({ name: "", stock: "0", threshold: "0", unit: "" });
	const [menuItemID, setMenuItemID] = useState("");
	const [ingredientID, setIngredientID] = useState("");
	const [quantityRequired, setQuantityRequired] = useState("1");
	const [alerts, setAlerts] = useState<string[]>([]);
	const ingredients = data?.ingredients ?? [];

	useEffect(() => {
		const events = new EventSource("/api/events");
		events.addEventListener("inventory.low", (event) => {
			const item = JSON.parse((event as MessageEvent).data) as { name?: string; stock?: number; unit?: string };
			setAlerts((current) => [...new Set([...current, `${item.name ?? "Ingredient"}: ${item.stock ?? 0} ${item.unit ?? ""}`])]);
		});
		return () => events.close();
	}, []);

	const save = async (ingredient: Ingredient) => {
		const value = values[ingredient._id] ?? { stock: String(ingredient.stock), threshold: String(ingredient.lowStockThreshold) };
		const response = await fetch("/api/admin/inventory", {
			body: JSON.stringify({
				id: ingredient._id,
				lowStockThreshold: Number(value.threshold),
				name: ingredient.name,
				stock: Number(value.stock),
				unit: ingredient.unit,
			}),
			headers: { "Content-Type": "application/json" },
			method: "POST",
		});
		const result = await response.json().catch(() => null);
		if (!response.ok) return toast.error(result?.message ?? "Unable to update stock");
		toast.success(`${ingredient.name} updated`);
		await mutate();
	};

	const createIngredient = async (event: FormEvent) => {
		event.preventDefault();
		if (!(draft.name.trim() && draft.unit.trim())) return toast.error("Name and unit are required");

		const response = await fetch("/api/admin/inventory", {
			body: JSON.stringify({
				lowStockThreshold: Number(draft.threshold),
				name: draft.name,
				stock: Number(draft.stock),
				unit: draft.unit,
			}),
			headers: { "Content-Type": "application/json" },
			method: "POST",
		});
		const result = await response.json().catch(() => null);
		if (!response.ok) return toast.error(result?.message ?? "Unable to add ingredient");

		toast.success(`${result?.name ?? draft.name} saved`);
		setDraft({ name: "", stock: "0", threshold: "0", unit: "" });
		await mutate();
	};

	return (
		<section style={{ padding: "2rem" }}>
			<h1>Inventory</h1>
			<p>Stock-aware menu ingredients and low-stock thresholds.</p>
			{alerts.length > 0 && <p role="alert">Low stock: {alerts.join(", ")}</p>}
			<form onSubmit={createIngredient} style={{ alignItems: "center", display: "flex", flexWrap: "wrap", gap: "1rem", margin: "1rem 0" }}>
				<Textfield
					aria-label="Ingredient name"
					onChange={(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
						setDraft((current) => ({ ...current, name: event.target.value }))
					}
					placeholder="Ingredient name"
					value={draft.name}
				/>
				<Textfield
					aria-label="Unit"
					onChange={(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
						setDraft((current) => ({ ...current, unit: event.target.value }))
					}
					placeholder="Unit (pcs)"
					value={draft.unit}
				/>
				<Textfield
					aria-label="Stock"
					onChange={(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
						setDraft((current) => ({ ...current, stock: event.target.value }))
					}
					placeholder="Stock"
					type="number"
					value={draft.stock}
				/>
				<Textfield
					aria-label="Low stock threshold"
					onChange={(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
						setDraft((current) => ({ ...current, threshold: event.target.value }))
					}
					placeholder="Low stock threshold"
					type="number"
					value={draft.threshold}
				/>
				<Button label="Add ingredient" />
			</form>
			{ingredients.map((ingredient) => {
				const value = values[ingredient._id] ?? { stock: String(ingredient.stock), threshold: String(ingredient.lowStockThreshold) };
				return (
					<div key={ingredient._id} style={{ alignItems: "center", display: "flex", gap: "1rem", margin: "1rem 0" }}>
						<strong style={{ minWidth: "10rem" }}>{ingredient.name}</strong>
						<span>{ingredient.unit}</span>
						<Textfield
							aria-label={`${ingredient.name} stock`}
							onChange={(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
								setValues((current) => ({ ...current, [ingredient._id]: { ...value, stock: event.target.value } }))
							}
							type="number"
							value={value.stock}
						/>
						<Textfield
							aria-label={`${ingredient.name} low stock threshold`}
							onChange={(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
								setValues((current) => ({ ...current, [ingredient._id]: { ...value, threshold: event.target.value } }))
							}
							type="number"
							value={value.threshold}
						/>
						<Button label="Save" onClick={() => save(ingredient)} />
					</div>
				);
			})}
			{!ingredients.length && <p>No ingredients yet. Add one above.</p>}
			<h2>Recipes</h2>
			<div style={{ alignItems: "center", display: "flex", gap: "1rem" }}>
				<select aria-label="Menu item" onChange={(event) => setMenuItemID(event.target.value)} value={menuItemID}>
					<option value="">Select menu item</option>
					{menus.map((menu) => <option key={String(menu._id)} value={String(menu._id)}>{menu.name}</option>)}
				</select>
				<select aria-label="Ingredient" onChange={(event) => setIngredientID(event.target.value)} value={ingredientID}>
					<option value="">Select ingredient</option>
					{ingredients.map((ingredient) => <option key={ingredient._id} value={ingredient._id}>{ingredient.name}</option>)}
				</select>
				<Textfield aria-label="Required quantity" onChange={(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setQuantityRequired(event.target.value)} type="number" value={quantityRequired} />
				<Button
					label="Save recipe"
					onClick={async () => {
						const response = await fetch("/api/admin/inventory", {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({ ingredientID, menuItemID, quantityRequired: Number(quantityRequired) }),
						});
						if (!response.ok) return toast.error((await response.json().catch(() => null))?.message ?? "Unable to save recipe");
						toast.success("Recipe saved");
						await mutate();
					}}
				/>
			</div>
		</section>
	);
}
