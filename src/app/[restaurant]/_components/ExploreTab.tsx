"use client";

import { Avatar, Spinner } from "xtreme-ui";
import Image from "next/image";

import NoContent from "#components/layout/NoContent";

import "./customerTabs.scss";

export default function ExploreTab({ profile, loading }: ExploreTabProps) {
	if (loading)
		return (
			<div className="customerTab customerTabLoading">
				<Spinner label="Loading restaurant..." />
			</div>
		);
	if (!profile)
		return (
			<div className="customerTab">
				<NoContent animationName="GhostNoContent" label="Restaurant information unavailable" />
			</div>
		);

	return (
		<section className="customerTab exploreTab">
			<div className="customerTabHeader">
				<p className="eyebrow">Welcome to</p>
				<h1>{profile.name}</h1>
			</div>
			<div className="identityCard">
				{profile.cover ? <Image alt="" className="identityCover" height={900} sizes="100vw" src={profile.cover} unoptimized width={1600} /> : null}
				<div className="identityBody">
					{profile.avatar ? <Avatar className="identityAvatar" src={profile.avatar} /> : null}
					<p>{profile.description || "Discover our menu and enjoy your visit."}</p>
				</div>
			</div>
			{profile.photos?.length ? (
				<div className="photoGallery">
					<h2>Inside the restaurant</h2>
					<div className="photoGrid">
						{profile.photos.map((photo) => (
							<div className="photoItem" key={photo}>
								<Image alt={`${profile.name} restaurant`} height={600} sizes="(max-width: 600px) 100vw, 33vw" src={photo} unoptimized width={800} />
							</div>
						))}
					</div>
				</div>
			) : null}
		</section>
	);
}

export interface CustomerProfile {
	address?: string;
	avatar?: string;
	cover?: string;
	description?: string;
	name?: string;
	photos?: string[];
}

interface ExploreTabProps {
	loading: boolean;
	profile?: CustomerProfile;
}
