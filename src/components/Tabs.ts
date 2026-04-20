import Fusion from "@rbxts/fusion-3.0";
import {
	Palette,
	Transparency,
	Typography,
	paletteFor,
	type PaletteColor,
} from "../ui/theme";

const { Children, Computed, New, Observer, OnEvent, Tween, Value, peek } = Fusion;

export interface TabItem {
	label: string;
	disabled?: boolean;
}

export interface TabsProps {
	tabs: TabItem[];
	value: Fusion.Value<number>;
	color?: PaletteColor;
	onChange?: (next: number) => void;
	layoutOrder?: number;
}

const TAB_ROW_HEIGHT = 42;

export function Tabs(scope: Fusion.Scope<unknown>, props: TabsProps): Frame {
	const palette = paletteFor(props.color ?? "primary");

	const indicatorX = Value(scope, 0);
	const indicatorWidth = Value(scope, 0);

	const tabButtons: TextButton[] = [];
	props.tabs.forEach((tab, idx) => {
		const disabled = tab.disabled ?? false;
		const active = Computed(scope, (use) => use(props.value) === idx);
		const textColor = Computed(scope, (use) => {
			if (disabled) return Palette.common.black;
			return use(active) ? palette.main : Palette.common.black;
		});
		const textTransparency = Computed(scope, (use) => {
			if (disabled) return Transparency.textDisabled;
			return use(active) ? 0 : Transparency.textSecondary;
		});

		const button = New(scope, "TextButton")({
			Name: `Tab_${idx}`,
			Size: new UDim2(0, 0, 1, 0),
			AutomaticSize: Enum.AutomaticSize.X,
			BackgroundTransparency: 1,
			Text: string.upper(tab.label),
			TextColor3: textColor,
			TextTransparency: textTransparency,
			TextSize: Typography.button.size,
			Font: Typography.button.font,
			AutoButtonColor: false,
			Active: !disabled,
			LayoutOrder: idx + 1,
			[OnEvent("Activated")]: () => {
				if (disabled) return;
				props.value.set(idx);
				if (props.onChange !== undefined) props.onChange(idx);
			},
			[Children]: New(scope, "UIPadding")({
				PaddingLeft: new UDim(0, 16),
				PaddingRight: new UDim(0, 16),
			}),
		});
		tabButtons.push(button);
	});

	const tabRow = New(scope, "Frame")({
		Name: "TabRow",
		Size: new UDim2(1, 0, 0, TAB_ROW_HEIGHT - 2),
		BackgroundTransparency: 1,
		[Children]: [
			New(scope, "UIListLayout")({
				FillDirection: Enum.FillDirection.Horizontal,
				SortOrder: Enum.SortOrder.LayoutOrder,
				VerticalAlignment: Enum.VerticalAlignment.Center,
			}),
			...tabButtons,
		],
	});

	const updateIndicator = () => {
		const idx = peek(props.value);
		const btn = tabButtons[idx];
		if (btn === undefined) return;
		const rowAbsX = tabRow.AbsolutePosition.X;
		indicatorX.set(btn.AbsolutePosition.X - rowAbsX);
		indicatorWidth.set(btn.AbsoluteSize.X);
	};

	Observer(scope, props.value).onChange(updateIndicator);
	for (const btn of tabButtons) {
		btn.GetPropertyChangedSignal("AbsoluteSize").Connect(updateIndicator);
		btn.GetPropertyChangedSignal("AbsolutePosition").Connect(updateIndicator);
	}
	task.defer(updateIndicator);

	const indicator = New(scope, "Frame")({
		Name: "Indicator",
		AnchorPoint: new Vector2(0, 1),
		Size: Tween(
			scope,
			Computed(scope, (use) => new UDim2(0, use(indicatorWidth), 0, 2)),
			new TweenInfo(0.22, Enum.EasingStyle.Quart, Enum.EasingDirection.Out),
		),
		Position: Tween(
			scope,
			Computed(scope, (use) => new UDim2(0, use(indicatorX), 1, 0)),
			new TweenInfo(0.22, Enum.EasingStyle.Quart, Enum.EasingDirection.Out),
		),
		BackgroundColor3: palette.main,
		BorderSizePixel: 0,
	});

	return New(scope, "Frame")({
		Name: "Tabs",
		Size: new UDim2(1, 0, 0, TAB_ROW_HEIGHT),
		BackgroundTransparency: 1,
		LayoutOrder: props.layoutOrder ?? 0,
		[Children]: [
			New(scope, "Frame")({
				Name: "BottomDivider",
				AnchorPoint: new Vector2(0, 1),
				Position: new UDim2(0, 0, 1, 0),
				Size: new UDim2(1, 0, 0, 1),
				BackgroundColor3: Palette.common.black,
				BackgroundTransparency: Transparency.divider,
				BorderSizePixel: 0,
			}),
			tabRow,
			indicator,
		],
	});
}
