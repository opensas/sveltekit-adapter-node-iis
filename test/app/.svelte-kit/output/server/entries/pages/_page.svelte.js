import { i as escape_html } from "../../chunks/server2.js";
//#region src/routes/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		$$renderer.push(`<h1>${escape_html(data.message)}</h1>`);
	});
}
//#endregion
export { _page as default };

//# sourceMappingURL=_page.svelte.js.map