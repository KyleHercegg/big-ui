import Fusion from "@rbxts/fusion-3.0";
import { CircularProgress } from "./CircularProgress";
import {
	Palette,
	Shape,
	Transparency,
	Typography,
	paletteFor,
	type PaletteColor,
} from "../ui/theme";

const { Children, Computed, New, OnEvent, Value, peek } = Fusion;

export type ButtonVariant = "contained" | "outlined" | "text";
export type ButtonSize = "small" | "medium" | "large";

export interface ButtonProps {
	label: string;
	variant?: ButtonVariant;
	color?: PaletteColor;
	size?: ButtonSize;
	disabled?: boolean;
	/** When true, the button shows a spinner, hides its label, and blocks activations. */
	loading?: Fusion.UsedAs<boolean>;
	fullWidth?: boolean;
	onActivate?: () => void;
	layoutOrder?: number;
}

interface SizeSpec {
	height: number;
	padX: number;
	textSize: number;
	spinner: number;
}

const SIZE_TABLE: Record<ButtonSize, SizeSpec> = {
	small: { height: 30, padX: 10, textSize: 13, spinner: 16 },
	medium: { height: 36, padX: 16, textSize: 14, spinner: 18 },
	large: { height: 42, padX: 22, textSize: 15, spinner: 22 },
};

export function Button(scope: Fusion.Scope<unknown>, props: ButtonProps): TextButton {
	const variant = props.variant ?? "contained";
	const color = props.color ?? "primary";
	const size = props.size ?? "medium";
	const disabled = props.disabled ?? false;
	const sizing = SIZE_TABLE[size];
	const palette = paletteFor(color);

	const hovered = Value(scope, false);
	const pressed = Value(scope, false);
	const loading = Computed(scope, (use) =>
		props.loading !== undefined ? use(props.loading) : false,
	);
	const interactable = Computed(scope, (use) => !disabled && !use(loading));

	const bgColor = Computed(scope, (use) => {
		if (disabled) {
			return variant === "contained" ? Palette.common.black : Palette.background.paper;
		}
		if (variant === "contained") {
			return use(pressed) || use(hovered) ? palette.dark : palette.main;
		}
		return use(hovered) ? palette.main : Palette.background.paper;
	});

	const bgTransparency = Computed(scope, (use) => {
		if (disabled) {
			return variant === "contained" ? Transparency.disabledBg : 1;
		}
		if (variant === "contained") return 0;
		return use(hovered) ? Transparency.hover : 1;
	});

	const textColor = Computed(scope, (_use) => {
		if (disabled) return Palette.common.black;
		return variant === "contained" ? palette.contrast : palette.main;
	});

	const textTransparency = Computed(scope, (use) => {
		if (use(loading)) return 1;
		return disabled ? Transparency.textDisabled : 0;
	});

	const strokeColor = Computed(scope, (_use) =>
		disabled ? Palette.common.black : palette.main,
	);
	const strokeTransparency = Computed(scope, (_use) =>
		disabled ? Transparency.disabledBg : 0,
	);

	const spinnerColor = variant === "contained" ? palette.contrast : palette.main;

	return New(scope, "TextButton")({
		Name: "Button",
		Size: props.fullWidth
			? new UDim2(1, 0, 0, sizing.height)
			: new UDim2(0, 0, 0, sizing.height),
		AutomaticSize: props.fullWidth ? Enum.AutomaticSize.None : Enum.AutomaticSize.X,
		BackgroundColor3: bgColor,
		BackgroundTransparency: bgTransparency,
		BorderSizePixel: 0,
		Text: string.upper(props.label),
		Font: Typography.button.font,
		TextSize: sizing.textSize,
		TextColor3: textColor,
		TextTransparency: textTransparency,
		AutoButtonColor: false,
		Active: interactable,
		LayoutOrder: props.layoutOrder ?? 0,
		[OnEvent("MouseEnter")]: () => hovered.set(true),
		[OnEvent("MouseLeave")]: () => {
			hovered.set(false);
			pressed.set(false);
		},
		[OnEvent("MouseButton1Down")]: () => {
			if (!disabled && !peek(loading)) pressed.set(true);
		},
		[OnEvent("MouseButton1Up")]: () => pressed.set(false),
		[OnEvent("Activated")]: () => {
			if (disabled || peek(loading)) return;
			if (props.onActivate !== undefined) props.onActivate();
		},
		[Children]: [
			New(scope, "UICorner")({ CornerRadius: new UDim(0, Shape.radius) }),
			New(scope, "UIPadding")({
				PaddingLeft: new UDim(0, sizing.padX),
				PaddingRight: new UDim(0, sizing.padX),
			}),
			variant === "outlined"
				? New(scope, "UIStroke")({
					Color: strokeColor,
					Transparency: strokeTransparency,
					Thickness: 1,
					ApplyStrokeMode: Enum.ApplyStrokeMode.Border,
				})
				: undefined,
			New(scope, "Frame")({
				Name: "SpinnerSlot",
				AnchorPoint: new Vector2(0.5, 0.5),
				Position: new UDim2(0.5, 0, 0.5, 0),
				Size: new UDim2(0, sizing.spinner, 0, sizing.spinner),
				BackgroundTransparency: 1,
				Visible: loading,
				[Children]: CircularProgress(scope, {
					size: sizing.spinner,
					thickness: 2,
					colorOverride: spinnerColor,
				}),
			}),
		],
	});
}
