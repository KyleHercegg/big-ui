import Fusion from "@rbxts/fusion-3.0";
import { Palette, Shape, paletteFor, type PaletteColor } from "../ui/theme";

const { Children, New } = Fusion;

export type BadgeColor = PaletteColor | "default";
export type BadgeVariant = "filled" | "outlined";

export interface BadgeProps {
	label: string;
	color?: BadgeColor;
	variant?: BadgeVariant;
	layoutOrder?: number;
}

function resolveColors(
	color: BadgeColor,
	variant: BadgeVariant,
): { bg: Color3; fg: Color3; stroke: Color3; strokeTransparency: number; bgTransparency: number } {
	if (color === "default") {
		if (variant === "outlined") {
			return {
				bg: Palette.background.paper,
				fg: Palette.text.primary,
				stroke: Palette.common.black,
				strokeTransparency: 0.7,
				bgTransparency: 1,
			};
		}
		return {
			bg: Palette.background.default,
			fg: Palette.text.primary,
			stroke: Palette.common.black,
			strokeTransparency: 1,
			bgTransparency: 0,
		};
	}
	const pal = paletteFor(color);
	if (variant === "outlined") {
		return {
			bg: Palette.background.paper,
			fg: pal.main,
			stroke: pal.main,
			strokeTransparency: 0,
			bgTransparency: 1,
		};
	}
	// Filled coloured: solid colour bg with contrast (white) text — matches
	// MUI Chip colour variant, which has AA contrast against the `main` swatch.
	return {
		bg: pal.main,
		fg: pal.contrast,
		stroke: pal.main,
		strokeTransparency: 1,
		bgTransparency: 0,
	};
}

export function Badge(scope: Fusion.Scope<unknown>, props: BadgeProps): Frame {
	const variant = props.variant ?? "filled";
	const { bg, fg, stroke, strokeTransparency, bgTransparency } = resolveColors(
		props.color ?? "default",
		variant,
	);
	return New(scope, "Frame")({
		Name: "Badge",
		Size: new UDim2(0, 0, 0, 24),
		AutomaticSize: Enum.AutomaticSize.X,
		BackgroundColor3: bg,
		BackgroundTransparency: bgTransparency,
		BorderSizePixel: 0,
		LayoutOrder: props.layoutOrder ?? 0,
		[Children]: [
			New(scope, "UICorner")({ CornerRadius: new UDim(0, Shape.radiusPill) }),
			New(scope, "UIStroke")({
				Color: stroke,
				Transparency: strokeTransparency,
				Thickness: 1,
				ApplyStrokeMode: Enum.ApplyStrokeMode.Border,
			}),
			New(scope, "UIPadding")({
				PaddingLeft: new UDim(0, 10),
				PaddingRight: new UDim(0, 10),
			}),
			New(scope, "TextLabel")({
				Size: new UDim2(0, 0, 1, 0),
				AutomaticSize: Enum.AutomaticSize.X,
				BackgroundTransparency: 1,
				TextColor3: fg,
				TextSize: 12,
				Font: Enum.Font.GothamMedium,
				Text: props.label,
				TextXAlignment: Enum.TextXAlignment.Center,
				TextYAlignment: Enum.TextYAlignment.Center,
			}),
		],
	});
}
