import Fusion from "@rbxts/fusion-3.0";
import { Palette, Shape, Transparency, Typography } from "../ui/theme";

const { Children, Computed, New, OnChange, OnEvent, Value, peek } = Fusion;

export interface TextFieldProps {
	value: Fusion.Value<string>;
	label?: string;
	placeholder?: string;
	helperText?: string;
	disabled?: boolean;
	onChange?: (next: string) => void;
	layoutOrder?: number;
	size?: UDim2;
}

export function TextField(scope: Fusion.Scope<unknown>, props: TextFieldProps): Frame {
	const disabled = props.disabled ?? false;
	const focused = Value(scope, false);

	const borderColor = Computed(scope, (use) => {
		if (disabled) return Palette.common.black;
		return use(focused) ? Palette.primary.main : Palette.common.black;
	});
	const borderTransparency = Computed(scope, (use) => {
		if (disabled) return Transparency.divider;
		return use(focused) ? 0 : Transparency.divider;
	});
	const borderThickness = Computed(scope, (use) => (use(focused) ? 2 : 1));

	const inputBox = New(scope, "Frame")({
		Name: "InputBox",
		Size: new UDim2(1, 0, 0, 40),
		BackgroundColor3: Palette.background.paper,
		BorderSizePixel: 0,
		LayoutOrder: 2,
		[Children]: [
			New(scope, "UICorner")({ CornerRadius: new UDim(0, Shape.radius) }),
			New(scope, "UIStroke")({
				Color: borderColor,
				Transparency: borderTransparency,
				Thickness: borderThickness,
				ApplyStrokeMode: Enum.ApplyStrokeMode.Border,
			}),
			New(scope, "TextBox")({
				Name: "Input",
				Size: new UDim2(1, -24, 1, 0),
				Position: new UDim2(0, 12, 0, 0),
				BackgroundTransparency: 1,
				Text: props.value,
				PlaceholderText: props.placeholder ?? "",
				TextColor3: Palette.text.primary,
				TextTransparency: disabled ? Transparency.textDisabled : Transparency.textPrimary,
				PlaceholderColor3: Palette.text.secondary,
				Font: Typography.body1.font,
				TextSize: Typography.body1.size,
				TextXAlignment: Enum.TextXAlignment.Left,
				TextYAlignment: Enum.TextYAlignment.Center,
				ClearTextOnFocus: false,
				TextEditable: !disabled,
				ClipsDescendants: true,
				[OnEvent("Focused")]: () => focused.set(true),
				[OnEvent("FocusLost")]: () => focused.set(false),
				[OnChange("Text")]: (newText: string) => {
					if (peek(props.value) === newText) return;
					props.value.set(newText);
					if (props.onChange !== undefined) props.onChange(newText);
				},
			}),
		],
	});

	const labelRow =
		props.label !== undefined
			? New(scope, "TextLabel")({
				Size: new UDim2(1, 0, 0, 16),
				BackgroundTransparency: 1,
				Text: props.label,
				TextColor3: Palette.text.secondary,
				TextTransparency: Transparency.textSecondary,
				TextSize: Typography.caption.size,
				Font: Typography.subtitle2.font,
				TextXAlignment: Enum.TextXAlignment.Left,
				LayoutOrder: 1,
			})
			: undefined;

	const helperRow =
		props.helperText !== undefined
			? New(scope, "TextLabel")({
				Size: new UDim2(1, 0, 0, 14),
				BackgroundTransparency: 1,
				Text: props.helperText,
				TextColor3: Palette.text.secondary,
				TextTransparency: Transparency.textSecondary,
				TextSize: Typography.caption.size,
				Font: Typography.caption.font,
				TextXAlignment: Enum.TextXAlignment.Left,
				LayoutOrder: 3,
			})
			: undefined;

	const totalHeight =
		40 + (props.label !== undefined ? 20 : 0) + (props.helperText !== undefined ? 18 : 0);

	return New(scope, "Frame")({
		Name: "TextField",
		Size: props.size ?? new UDim2(1, 0, 0, totalHeight),
		BackgroundTransparency: 1,
		LayoutOrder: props.layoutOrder ?? 0,
		[Children]: [
			New(scope, "UIListLayout")({
				FillDirection: Enum.FillDirection.Vertical,
				SortOrder: Enum.SortOrder.LayoutOrder,
				Padding: new UDim(0, 4),
			}),
			labelRow,
			inputBox,
			helperRow,
		],
	});
}
