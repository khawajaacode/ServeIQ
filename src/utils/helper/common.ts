import type { ReadonlyURLSearchParams } from "next/navigation";
import { NextResponse } from "next/server";

export const fetcher = (url: string) => fetch(url).then((r) => r.json());
export const CatchNextResponse = ({ message = "Something went wrong", status = 500 }: NextResponseError) => NextResponse.json({ message, status }, { status });

export const scrollToSection = (section?: string) => {
	const element = document.getElementById(section ? section : "homepage") as HTMLDivElement;
	element.scrollIntoView({ behavior: "smooth" });
};

export const isEmailValid = (email?: string) => {
	const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailPattern.test(email ?? "");
};

export const createQueryString = (searchParams: ReadonlyURLSearchParams, query: Record<string, string>) => {
	const params = new URLSearchParams(searchParams);
	Object.entries(query).forEach(([key, value]) => params.set(key, value));
	return params.toString();
};

export const splitStringByFirstWord = (sentence: string) => {
	if (!sentence) {
		return;
	}

	sentence = sentence.trim();
	return [
		sentence.replace(/ .*/, ""), // Get first word from sentence
		sentence.replace(/\w+ /, ""), // Get remaining sentence except first word
	];
};
