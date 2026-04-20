import Fusion from "@rbxts/fusion-3.0";
import { Palette, paletteFor, type PaletteColor } from "../ui/theme";
import { Icons, getIconSheetAssetId, type IconName } from "../ui/icons";

const { New } = Fusion;

export interface IconProps {
	/** Icon name from the built-in sprite sheet (see `ui/icons.ts`). */
	name: IconName;
	/** Pixel size of the rendered square. Defaults to 20. */
	size?: number;
	/**
	 * Tint colour. Either a palette name (resolved to `palette.main`), the
	 * literal `"default"` (theme text colour), or an explicit `Color3`.
	 */
	color?: PaletteColor | "default" | Color3;
	/** 0 = fully opaque, 1 = fully transparent. Defaults to 0. */
	transparency?: Fusion.UsedAs<number>;
	layoutOrder?: number;
}

function resolveTint(color: IconProps["color"]): Color3 {
	if (color === undefined || color === "default") return Palette.text.primary;
	if (typeIs(color, "Color3")) return color;
	return paletteFor(color).main;
}

/**
 * Display a single icon from the configured sprite sheet.
 *
 * The sheet's asset id must be registered at startup via `configureIcons`
 * — see `ui/icons.ts`.
 */
export function Icon(scope: Fusion.Scope<unknown>, props: IconProps): ImageLabel {
	const rect = Icons[props.name];
	const size = props.size ?? 20;

	return New(scope, "ImageLabel")({
		Name: "Icon",
		Size: new UDim2(0, size, 0, size),
		BackgroundTransparency: 1,
		BorderSizePixel: 0,
		Image: getIconSheetAssetId(),
		ImageRectOffset: rect.offset,
		ImageRectSize: rect.size,
		ImageColor3: resolveTint(props.color),
		ImageTransparency: props.transparency ?? 0,
		ScaleType: Enum.ScaleType.Fit,
		LayoutOrder: props.layoutOrder ?? 0,
	});
}
