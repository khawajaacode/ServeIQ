import { describe, expect, it } from "vitest";

import { serializeJsonLd } from "../../components/seo/JsonLd";
import { formatAssistantText } from "../ai/format-assistant-text";
import { isEmailValid, splitStringByFirstWord } from "./common";

describe("isEmailValid", () => {
	it("accepts valid email addresses with longer top-level domains", () => {
		expect(isEmailValid("user@example.technology")).toBe(true);
	});

	it("rejects malformed or whitespace-padded addresses", () => {
		expect(isEmailValid("user@example")).toBe(false);
		expect(isEmailValid("user @example.com")).toBe(false);
	});
});

describe("splitStringByFirstWord", () => {
	it("splits a sentence after its first word", () => {
		expect(splitStringByFirstWord("Hello world")).toEqual(["Hello", "world"]);
	});

	it("returns undefined for an empty sentence", () => {
		expect(splitStringByFirstWord("")).toBeUndefined();
	});
});

describe("formatAssistantText", () => {
	it("formats the supported assistant list markup without trusting arbitrary HTML", () => {
		expect(formatAssistantText("<ul><li>Soup</li><li><b>Hot soup</b><br>Today</li></ul>")).toBe("• Soup\n• Hot soup\nToday\n");
		expect(formatAssistantText('<img src=x onerror="alert(1)">')).toBe('<img src=x onerror="alert(1)">');
	});
});

describe("serializeJsonLd", () => {
	it("escapes script-closing characters in serialized structured data", () => {
		expect(serializeJsonLd({ description: "</script><script>" })).toBe('{"description":"\\u003c/script>\\u003cscript>"}');
	});
});
