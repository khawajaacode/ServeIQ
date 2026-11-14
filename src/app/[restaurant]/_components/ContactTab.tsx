"use client";

import { Spinner } from "xtreme-ui";

import NoContent from "#components/layout/NoContent";

import type { CustomerProfile } from "./ExploreTab";
import "./customerTabs.scss";

export default function ContactTab({ profile, loading }: ContactTabProps) {
	if (loading)
		return (
			<div className="customerTab customerTabLoading">
				<Spinner label="Loading contact details..." />
			</div>
		);
	if (!(profile?.name || profile?.address))
		return (
			<div className="customerTab">
				<NoContent animationName="GhostNoContent" label="Contact information unavailable" />
			</div>
		);

	return (
		<section className="customerTab contactTab">
			<div className="customerTabHeader">
				<p className="eyebrow">Find us</p>
				<h1>Contact</h1>
			</div>
			<div className="contactCard">
				<h2>{profile.name}</h2>
				<p>{profile.address || "Address unavailable"}</p>
			</div>
		</section>
	);
}

interface ContactTabProps {
	loading: boolean;
	profile?: CustomerProfile;
}
