"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import { toast } from "react-toastify";
import { Button, Icon, Spinner, Textfield } from "xtreme-ui";

import { useAdmin } from "#components/context/useContext";
import Modal from "#components/layout/Modal";
import NoContent from "#components/layout/NoContent";
import type { TTable } from "#utils/database/models/table";

import "./tableEditor.scss";

const TableEditor = () => {
	const { tables, profileMutate, profileLoading } = useAdmin();
	const [editing, setEditing] = useState<TTable>();
	const [editorOpen, setEditorOpen] = useState(false);
	const [deleting, setDeleting] = useState<TTable>();
	const [name, setName] = useState("");
	const [username, setUsername] = useState("");
	const [loading, setLoading] = useState(false);

	const openEditor = (table?: TTable) => {
		setEditorOpen(true);
		setEditing(table);
		setName(table?.name ?? "");
		setUsername(table?.username ?? "");
	};

	const closeEditor = () => {
		setEditorOpen(false);
		setEditing(undefined);
		setName("");
		setUsername("");
	};

	const save = async (event: FormEvent) => {
		event.preventDefault();
		if (!(name.trim() && username.trim())) return toast.warn("Table name and username are required");
		setLoading(true);
		try {
			const response = await fetch("/api/admin/table", {
				body: JSON.stringify({ id: editing?._id, name, username }),
				headers: { "Content-Type": "application/json" },
				method: editing ? "PATCH" : "POST",
			});
			const result = await response.json().catch(() => null);
			if (!response.ok) return toast.error(result?.message ?? "Unable to save table");
			toast.success(editing ? "Table updated" : "Table added");
			await profileMutate();
			closeEditor();
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Unable to save table");
		} finally {
			setLoading(false);
		}
	};

	const remove = async () => {
		if (!deleting?._id) return;
		setLoading(true);
		try {
			const response = await fetch(`/api/admin/table?id=${deleting._id}`, { method: "DELETE" });
			if (!response.ok) {
				const result = await response.json().catch(() => null);
				return toast.error(result?.message ?? "Unable to delete table");
			}
			toast.success("Table deleted");
			await profileMutate();
			setDeleting(undefined);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Unable to delete table");
		} finally {
			setLoading(false);
		}
	};

	const copyLink = async (table: TTable) => {
		const link = `${window.location.origin}/${table.restaurantID}?table=${table.username}`;
		try {
			await navigator.clipboard.writeText(link);
			toast.success("Share link copied");
		} catch {
			toast.error("Unable to copy share link");
		}
	};

	return (
		<section className="tableEditor">
			<header className="tableEditorHeader">
				<div>
					<p className="eyebrow">Dining setup</p>
					<h1>
						Tables <span>and links</span>
					</h1>
				</div>
				<Button icon="2b" iconType="solid" label="Add table" onClick={() => openEditor()} />
			</header>
			{profileLoading ? (
				<Spinner fullpage label="Loading tables..." />
			) : tables.length ? (
				<div className="tableGrid">
					{tables.map((table) => (
						<article className="tableCard" key={String(table._id)}>
							<div className="tableIcon">
								<Icon code="f2a0" type="solid" />
							</div>
							<div className="tableDetails">
								<h2>{table.name}</h2>
								<p>@{table.username}</p>
							</div>
							<div className="tableActions">
								<Button aria-label={`Copy link for ${table.name}`} icon="f0c5" iconType="solid" onClick={() => copyLink(table)} type="secondary" />
								<Button aria-label={`Edit ${table.name}`} icon="f044" iconType="solid" onClick={() => openEditor(table)} type="secondary" />
								<Button aria-label={`Delete ${table.name}`} icon="f2ed" iconType="solid" onClick={() => setDeleting(table)} type="secondaryDanger" />
							</div>
						</article>
					))}
				</div>
			) : (
				<NoContent animationName="GhostNoContent" label="No tables yet" />
			)}
			{editorOpen && (
				<Modal open setOpen={(open) => !open && closeEditor()}>
					<form className="tableEditorModal" onSubmit={save}>
						<h2>
							{editing?._id ? "Edit" : "Add"} <span>table</span>
						</h2>
						{loading ? (
							<Spinner fullpage label={editing?._id ? "Updating table..." : "Adding table..."} />
						) : (
							<>
								<Textfield
									className="tableField"
									onChange={(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setName(event.target.value)}
									placeholder="Table name"
									value={name}
								/>
								<Textfield
									className="tableField"
									onChange={(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setUsername(event.target.value)}
									placeholder="Table username"
									value={username}
								/>
								<div className="tableModalActions">
									<Button disabled={loading} icon="f00d" iconType="solid" onClick={closeEditor} type="secondaryDanger" />
									<Button disabled={loading} label="Save" loading={loading} type="submit" />
								</div>
							</>
						)}
					</form>
				</Modal>
			)}
			{deleting && (
				<Modal open setOpen={(open) => !open && setDeleting(undefined)}>
					<div className="tableEditorModal">
						<h2>
							Delete <span>table?</span>
						</h2>
						<p>Remove {deleting.name} and its share link?</p>
						<div className="tableModalActions">
							<Button disabled={loading} label="Cancel" onClick={() => setDeleting(undefined)} type="secondary" />
							<Button disabled={loading} label="Delete" loading={loading} onClick={remove} type="secondaryDanger" />
						</div>
					</div>
				</Modal>
			)}
		</section>
	);
};

export default TableEditor;
