import { Plugin } from "obsidian";

const SCROLL_PADDING = 32;

const MARKDOWN_PREVIEW_VIEW = ".markdown-preview-view";

const isChildOfElement = (parent: Element, el: Element | null): boolean => {
	return (
		el !== null &&
		(el.parentElement === parent ||
			isChildOfElement(parent, el.parentElement))
	);
};

const queryChildSelectorAll = (selector: string, el: Element): Element[] =>
	Array.from(document.querySelectorAll(selector)).filter((parent) =>
		isChildOfElement(parent, el),
	);

export default class EinkPager extends Plugin {
	startX: number | null = null;
	startY: number | null = null;

	onload() {
		this.registerDomEvent(document, "mousedown", (evt) => {
			this.startX = evt.pageX;
			this.startY = evt.pageY;
		});

		this.registerDomEvent(document, "mouseup", (evt: MouseEvent) => {
			if (this.startX === null || this.startY === null) return;
			const deltaX = Math.abs(this.startX - evt.pageX);
			const deltaY = Math.abs(this.startY - evt.pageY);
			this.startX = null;
			this.startY = null;

			if (deltaX < 10 && deltaY < 10) {
				const { target, clientY } = evt;
				const parents = queryChildSelectorAll(
					MARKDOWN_PREVIEW_VIEW,
					target as Element,
				);
				for (const parent of parents) {
					const top =
						clientY > parent.clientHeight / 2
							? parent.scrollTop +
							  parent.clientHeight -
							  SCROLL_PADDING
							: parent.scrollTop -
							  parent.clientHeight +
							  SCROLL_PADDING;
					parent.scrollTo({ top });
				}
			}
		});
	}

	onunload() {}
}
