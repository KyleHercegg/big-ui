import Fusion from "@rbxts/fusion-3.0";
import {
	Palette,
	Transparency,
	paletteFor,
	type PaletteColor,
} from "../ui/theme";

const { Children, Computed, New, OnEvent, peek } = Fusion;

export interface RadioOption {
	value: string;
	label: string;
	disabled?: boolean;
}

export interface RadioGroupProps {
	options: RadioOption[];
	value: Fusion.Value<string>;
	orientation?: "vertical" | "horizontal";
	color?: PaletteColor;
	onChange?: (next: string) => void;
	layoutOrder?: number;
}

function RadioItem(
	scope: Fusion.Scope<unknown>,
	params: {
		option: RadioOption;
		groupValue: Fusion.Value<string>;
		color: PaletteColor;
		onChange?: (next: string) => void;
		layoutOrder: number;
	},
): Frame {
	const palette = paletteFor(params.color);
	const disabled = params.option.disabled ?? false;
	const selected = Computed(scope, (use) => use(params.groupValue) === params.option.value);

	const ringColor = Computed(scope, (use) => {
		if (disabled) return Palette.common.black;
		return use(selected) ? palette.main : Palette.common.black;
	});
	const ringTransparency = Computed(scope, (use) => {
		if (disabled) return Transparency.divider;
		return use(selected) ? 0 : Transparency.textSecondary;
	});
	const dotTransparency = Computed(scope, (use) => {
		if (disabled) return Transparency.textDisabled;
		return use(selected) ? 0 : 1;
	});

	const click = () => {
		if (disabled) return;
		if (peek(params.groupValue) === params.option.value) return;
		params.groupValue.set(params.option.value);
		if (params.onChange !== undefined) params.onChange(params.option.value);
	};

	return New(scope, "Frame")({
		Name: `Radio_${params.option.value}`,
		Size: new UDim2(0, 0, 0, 24),
		AutomaticSize: Enum.AutomaticSize.X,
		BackgroundTransparency: 1,
		LayoutOrder: params.layoutOrder,
		[Children]: [
			New(scope, "UIListLayout")({
				FillDirection: Enum.FillDirection.Horizontal,
				VerticalAlignment: Enum.VerticalAlignment.Center,
				SortOrder: Enum.SortOrder.LayoutOrder,
				Padding: new UDim(0, 8),
			}),
			New(scope, "TextButton")({
				Name: "Ring",
				Size: new UDim2(0, 20, 0, 20),
				BackgroundTransparency: 1,
				Text: "",
				AutoButtonColor: false,
				Active: !disabled,
				LayoutOrder: 1,
				[OnEvent("Activated")]: click,
				[Children]: [
					New(scope, "UICorner")({ CornerRadius: new UDim(1, 0) }),
					New(scope, "UIStroke")({
						Color: ringColor,
						Transparency: ringTransparency,
						Thickness: 2,
					}),
					New(scope, "Frame")({
						Name: "Dot",
						AnchorPoint: new Vector2(0.5, 0.5),
						Position: new UDim2(0.5, 0, 0.5, 0),
						Size: new UDim2(0, 10, 0, 10),
						BackgroundColor3: disabled ? Palette.common.black : palette.main,
						BackgroundTransparency: dotTransparency,
						BorderSizePixel: 0,
						[Children]: New(scope, "UICorner")({ CornerRadius: new UDim(1, 0) }),
					}),
				],
			}),
			New(scope, "TextButton")({
				Name: "Label",
				Size: new UDim2(0, 0, 1, 0),
				AutomaticSize: Enum.AutomaticSize.X,
				BackgroundTransparency: 1,
				Text: params.option.label,
				TextColor3: Palette.common.black,
				TextTransparency: disabled ? Transparency.textDisabled : Transparency.textPrimary,
				TextSize: 14,
				Font: Enum.Font.Gotham,
				TextXAlignment: Enum.TextXAlignment.Left,
				AutoButtonColor: false,
				Active: !disabled,
				LayoutOrder: 2,
				[OnEvent("Activated")]: click,
			}),
		],
	});
}

export function RadioGroup(scope: Fusion.Scope<unknown>, props: RadioGroupProps): Frame {
	const orientation = props.orientation ?? "vertical";
	const color = props.color ?? "primary";

	const items: Instance[] = [
		New(scope, "UIListLayout")({
			FillDirection:
				orientation === "vertical"
					? Enum.FillDirection.Vertical
					: Enum.FillDirection.Horizontal,
			SortOrder: Enum.SortOrder.LayoutOrder,
			Padding: new UDim(0, orientation === "vertical" ? 6 : 16),
		}),
	];
	props.options.forEach((opt, i) => {
		items.push(
			RadioItem(scope, {
				option: opt,
				groupValue: props.value,
				color,
				onChange: props.onChange,
				layoutOrder: i + 1,
			}),
		);
	});

	return New(scope, "Frame")({
		Name: "RadioGroup",
		Size: new UDim2(1, 0, 0, 0),
		AutomaticSize: Enum.AutomaticSize.Y,
		BackgroundTransparency: 1,
		LayoutOrder: props.layoutOrder ?? 0,
		[Children]: items,
	});
}
