import Fusion from "@rbxts/fusion-3.0";
import { Palette, Transparency, paletteFor, type PaletteColor } from "../ui/theme";
import { Icons, getIconSheetAssetId, type IconName } from "../ui/icons";

const { Children, Computed, New, OnEvent, Value } = Fusion;

export type IconButtonSize = "small" | "medium" | "large";

export interface IconButtonProps {
	/** Icon name from the sprite sheet (see `ui/icons.ts`). */
	icon: IconName;
	size?: IconButtonSize;
	color?: PaletteColor | "default";
	disabled?: boolean;
	onActivate?: () => void;
	layoutOrder?: number;
}

const SIZE_TABLE: Record<IconButtonSize, { frame: number; icon: number }> = {
	small: { frame: 28, icon: 16 },
	medium: { frame: 40, icon: 20 },
	large: { frame: 48, icon: 24 },
};

export function IconButton(scope: Fusion.Scope<unknown>, props: IconButtonProps): TextButton {
	const size = props.size ?? "medium";
	const color = props.color ?? "default";
	const disabled = props.disabled ?? false;
	const sizing = SIZE_TABLE[size];

	const hovered = Value(scope, false);

	const isDefault = color === "default";
	const iconColor = isDefault ? Palette.text.primary : paletteFor(color).main;
	const rect = Icons[props.icon];

	const bgTransparency = Computed(scope, (use) => {
		if (disabled) return 1;
		return use(hovered) ? Transparency.hover : 1;
	});

	const iconTransparency = Computed(scope, (_use) =>
		disabled
			? Transparency.textDisabled
			: isDefault
				? Transparency.textSecondary
				: 0,
	);

	return New(scope, "TextButton")({
		Name: "IconButton",
		Size: new UDim2(0, sizing.frame, 0, sizing.frame),
		BackgroundColor3: Palette.common.black,
		BackgroundTransparency: bgTransparency,
		BorderSizePixel: 0,
		Text: "",
		AutoButtonColor: false,
		Active: !disabled,
		LayoutOrder: props.layoutOrder ?? 0,
		[OnEvent("MouseEnter")]: () => hovered.set(true),
		[OnEvent("MouseLeave")]: () => hovered.set(false),
		[OnEvent("Activated")]: () => {
			if (!disabled && props.onActivate !== undefined) props.onActivate();
		},
		[Children]: [
			New(scope, "UICorner")({ CornerRadius: new UDim(1, 0) }),
			New(scope, "ImageLabel")({
				Name: "Icon",
				AnchorPoint: new Vector2(0.5, 0.5),
				Position: new UDim2(0.5, 0, 0.5, 0),
				Size: new UDim2(0, sizing.icon, 0, sizing.icon),
				BackgroundTransparency: 1,
				BorderSizePixel: 0,
				Image: getIconSheetAssetId(),
				ImageRectOffset: rect.offset,
				ImageRectSize: rect.size,
				ImageColor3: iconColor,
				ImageTransparency: iconTransparency,
				ScaleType: Enum.ScaleType.Fit,
			}),
		],
	});
}
