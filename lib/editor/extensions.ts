// Custom TipTap extensions that register formatting attributes as global
// attributes. Commands are driven from the toolbar via `updateAttributes`
// or `setMark`, so these extensions stay minimal and type-safe.
import { Extension } from "@tiptap/core";

export const FontSize = Extension.create({
  name: "fontSize",
  addGlobalAttributes() {
    return [
      {
        types: ["textStyle"],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (el: HTMLElement) => el.style.fontSize || null,
            renderHTML: (attrs: Record<string, unknown>) =>
              attrs.fontSize ? { style: `font-size: ${attrs.fontSize}` } : {},
          },
        },
      },
    ];
  },
});

export const LineHeight = Extension.create({
  name: "lineHeight",
  addOptions() {
    return { types: ["paragraph", "heading"] as string[] };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: (el: HTMLElement) => el.style.lineHeight || null,
            renderHTML: (attrs: Record<string, unknown>) =>
              attrs.lineHeight ? { style: `line-height: ${attrs.lineHeight}` } : {},
          },
        },
      },
    ];
  },
});

export const ParagraphSpacing = Extension.create({
  name: "paragraphSpacing",
  addOptions() {
    return { types: ["paragraph", "heading"] as string[] };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          spacingBefore: {
            default: null,
            parseHTML: (el: HTMLElement) => el.style.marginTop || null,
            renderHTML: (attrs: Record<string, unknown>) =>
              attrs.spacingBefore ? { style: `margin-top: ${attrs.spacingBefore}` } : {},
          },
          spacingAfter: {
            default: null,
            parseHTML: (el: HTMLElement) => el.style.marginBottom || null,
            renderHTML: (attrs: Record<string, unknown>) =>
              attrs.spacingAfter ? { style: `margin-bottom: ${attrs.spacingAfter}` } : {},
          },
        },
      },
    ];
  },
});

export const Indent = Extension.create({
  name: "indent",
  addOptions() {
    return { types: ["paragraph", "heading"] as string[] };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          marginLeft: {
            default: null,
            parseHTML: (el: HTMLElement) => el.style.marginLeft || null,
            renderHTML: (attrs: Record<string, unknown>) =>
              attrs.marginLeft ? { style: `margin-left: ${attrs.marginLeft}` } : {},
          },
        },
      },
    ];
  },
});