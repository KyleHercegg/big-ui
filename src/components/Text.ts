import Fusion from "@rbxts/fusion-3.0";
import { Palette, Transparency, Typography, type TypographyVariant } from "../ui/theme";

const { New } = Fusion;

export type TextColor =
	| "primary"
	| "secondary"
	| "disabled"
	| "primaryMain"
	| "errorMain"
	| "warningMain"
	| "successMain"
	| "infoMain";

export interface TextProps {
	text: Fusion.UsedAs<string>;
	variant?: TypographyVariant;
	color?: TextColor;
	align?: Enum.TextXAlignment;
	size?: UDim2;
	wrap?: boolean;
	layoutOrder?: number;
}

function colorFor(color: TextColor): { color3: Color3; transparency: number } {
	switch (color) {
		case "secondary":
			return { color3: Palette.text.secondary, transparency: Transparency.textSecondary };
		case "disabled":
			return { color3: Palette.text.disabled, transparency: Transparency.textDisabled };
		case "primaryMain":
			return { color3: Palette.primary.main, transparency: 0 };
		case "errorMain":
			return { color3: Palette.error.main, transparency: 0 };
		case "warningMain":
			return { color3: Palette.warning.main, transparency: 0 };
		case "successMain":
			return { color3: Palette.success.main, transparency: 0 };
		case "infoMain":
			return { color3: Palette.info.main, transparency: 0 };
		case "primary":
		default:
			return { color3: Palette.text.primary, transparency: Transparency.textPrimary };
	}
}

export function Text(scope: Fusion.Scope<unknown>, props: TextProps): TextLabel {
	const variant = props.variant ?? "body1";
	const spec = Typography[variant];
	const { color3, transparency } = colorFor(props.color ?? "primary");
	return New(scope, "TextLabel")({
		Name: `Text_${variant}`,
		BackgroundTransparency: 1,
		Size: props.size ?? new UDim2(1, 0, 0, spec.lineHeight),
		AutomaticSize: props.size === undefined ? Enum.AutomaticSize.Y : Enum.AutomaticSize.None,
		TextColor3: color3,
		TextTransparency: transparency,
		Font: spec.font,
		TextSize: spec.size,
		TextXAlignment: props.align ?? Enum.TextXAlignment.Left,
		TextYAlignment: Enum.TextYAlignment.Top,
		TextWrapped: props.wrap ?? true,
		Text: props.text,
		LayoutOrder: props.layoutOrder ?? 0,
	});
}
