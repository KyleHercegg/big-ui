import Fusion from "@rbxts/fusion-3.0";
import { Players, UserInputService } from "@rbxts/services";
import {
	Palette,
	Shape,
	Transparency,
	Typography,
	ZIndex,
	paletteFor,
	type PaletteColor,
} from "../ui/theme";

const { Children, Computed, New, Observer, OnEvent, Value, peek } = Fusion;

export interface DropdownOption {
	value: string;
	label: string;
	disabled?: boolean;
}

export interface DropdownProps {
	value: Fusion.Value<string>;
	options: DropdownOption[];
	label?: string;
	placeholder?: string;
	disabled?: boolean;
	color?: PaletteColor;
	onChange?: (next: string) => void;
	layoutOrder?: number;
	maxMenuHeight?: number;
}

const TRIGGER_HEIGHT = 40;
const ITEM_HEIGHT = 36;
const MENU_GAP = 4;

function pointInFrame(frame: GuiObject, x: number, y: number): boolean {
	const p = frame.AbsolutePosition;
	const s = frame.AbsoluteSize;
	return x >= p.X && x <= p.X + s.X && y >= p.Y && y <= p.Y + s.Y;
}

export function Dropdown(scope: Fusion.Scope<unknown>, props: DropdownProps): Frame {
	const palette = paletteFor(props.color ?? "primary");
	const disabled = props.disabled ?? false;
	const open = Value(scope, false);
	const hovered = Value(scope, false);

	const selectedLabel = Computed(scope, (use) => {
		const v = use(props.value);
		for (const opt of props.options) if (opt.value === v) return opt.label;
		return props.placeholder ?? "Select…";
	});

	const isPlaceholder = Computed(scope, (use) => {
		const v = use(props.value);
		for (const opt of props.options) if (opt.value === v) return false;
		return true;
	});

	const strokeColor = Computed(scope, (use) => {
		if (disabled) return Palette.common.black;
		if (use(open)) return palette.main;
		return Palette.common.black;
	});
	const strokeTransparency = Computed(scope, (use) => {
		if (disabled) return Transparency.divider;
		if (use(open)) return 0;
		return use(hovered) ? 0.2 : Transparency.textSecondary;
	});
	const strokeThickness = Computed(scope, (use) => (use(open) ? 2 : 1));

	const chevron = Computed(scope, (use) => (use(open) ? "▴" : "▾"));

	const trigger = New(scope, "TextButton")({
		Name: "Trigger",
		Size: new UDim2(1, 0, 0, TRIGGER_HEIGHT),
		BackgroundColor3: Palette.background.paper,
		BorderSizePixel: 0,
		Text: "",
		AutoButtonColor: false,
		Active: !disabled,
		LayoutOrder: props.label !== undefined ? 2 : 1,
		[OnEvent("Activated")]: () => {
			if (disabled) return;
			open.set(!peek(open));
		},
		[OnEvent("MouseEnter")]: () => hovered.set(true),
		[OnEvent("MouseLeave")]: () => hovered.set(false),
		[Children]: [
			New(scope, "UICorner")({ CornerRadius: new UDim(0, Shape.radius) }),
			New(scope, "UIStroke")({
				Color: strokeColor,
				Transparency: strokeTransparency,
				Thickness: strokeThickness,
				ApplyStrokeMode: Enum.ApplyStrokeMode.Border,
			}),
			New(scope, "TextLabel")({
				Name: "Value",
				Size: new UDim2(1, -40, 1, 0),
				Position: new UDim2(0, 12, 0, 0),
				BackgroundTransparency: 1,
				Text: selectedLabel,
				TextColor3: Palette.common.black,
				TextTransparency: Computed(scope, (use) => {
					if (disabled) return Transparency.textDisabled;
					return use(isPlaceholder) ? Transparency.textSecondary : Transparency.textPrimary;
				}),
				TextSize: Typography.body1.size,
				Font: Typography.body1.font,
				TextXAlignment: Enum.TextXAlignment.Left,
				TextYAlignment: Enum.TextYAlignment.Center,
			}),
			New(scope, "TextLabel")({
				Name: "Chevron",
				AnchorPoint: new Vector2(1, 0.5),
				Size: new UDim2(0, 24, 1, 0),
				Position: new UDim2(1, -10, 0.5, 0),
				BackgroundTransparency: 1,
				Text: chevron,
				TextColor3: Palette.common.black,
				TextTransparency: disabled ? Transparency.textDisabled : Transparency.textSecondary,
				TextSize: 14,
				Font: Enum.Font.GothamBold,
				TextXAlignment: Enum.TextXAlignment.Center,
				TextYAlignment: Enum.TextYAlignment.Center,
			}),
		],
	});

	const wrapperChildren: Instance[] = [
		New(scope, "UIListLayout")({
			FillDirection: Enum.FillDirection.Vertical,
			SortOrder: Enum.SortOrder.LayoutOrder,
			Padding: new UDim(0, 4),
		}),
	];

	if (props.label !== undefined) {
		wrapperChildren.push(
			New(scope, "TextLabel")({
				Size: new UDim2(1, 0, 0, 16),
				BackgroundTransparency: 1,
				Text: props.label,
				TextColor3: Palette.common.black,
				TextTransparency: disabled ? Transparency.textDisabled : Transparency.textSecondary,
				TextSize: Typography.caption.size,
				Font: Typography.subtitle2.font,
				TextXAlignment: Enum.TextXAlignment.Left,
				LayoutOrder: 1,
			}),
		);
	}
	wrapperChildren.push(trigger);

	const wrapper = New(scope, "Frame")({
		Name: "Dropdown",
		Size: new UDim2(1, 0, 0, TRIGGER_HEIGHT + (props.label !== undefined ? 20 : 0)),
		BackgroundTransparency: 1,
		LayoutOrder: props.layoutOrder ?? 0,
		[Children]: wrapperChildren,
	});

	// Menu renders in an overlay ScreenGui so it escapes any parent clipping
	// (ScrollingFrame, Card, etc.) and draws above other UI layers.
	const menuItems: Instance[] = [
		New(scope, "UIListLayout")({
			FillDirection: Enum.FillDirection.Vertical,
			SortOrder: Enum.SortOrder.LayoutOrder,
		}),
		New(scope, "UICorner")({ CornerRadius: new UDim(0, Shape.radius) }),
		New(scope, "UIStroke")({
			Color: Palette.common.black,
			Transparency: Transparency.divider,
			Thickness: 1,
			ApplyStrokeMode: Enum.ApplyStrokeMode.Border,
		}),
	];

	props.options.forEach((opt, idx) => {
		const optionHovered = Value(scope, false);
		const optionSelected = Computed(scope, (use) => use(props.value) === opt.value);
		const optionDisabled = opt.disabled ?? false;

		menuItems.push(
			New(scope, "TextButton")({
				Name: `Option_${opt.value}`,
				Size: new UDim2(1, 0, 0, ITEM_HEIGHT),
				BackgroundColor3: Computed(scope, (use) =>
					use(optionSelected) ? Palette.primary.main : Palette.common.black,
				),
				BackgroundTransparency: Computed(scope, (use) => {
					if (optionDisabled) return 1;
					if (use(optionSelected)) return 0.88;
					return use(optionHovered) ? Transparency.hover : 1;
				}),
				BorderSizePixel: 0,
				Text: opt.label,
				TextColor3: Computed(scope, (use) =>
					use(optionSelected) ? Palette.primary.dark : Palette.common.black,
				),
				TextTransparency: Computed(scope, (use) => {
					if (optionDisabled) return Transparency.textDisabled;
					return use(optionSelected) ? 0 : Transparency.textPrimary;
				}),
				TextSize: Typography.body1.size,
				Font: Computed(scope, (use) =>
					use(optionSelected) ? Typography.subtitle1.font : Typography.body1.font,
				),
				TextXAlignment: Enum.TextXAlignment.Left,
				AutoButtonColor: false,
				Active: !optionDisabled,
				LayoutOrder: idx + 1,
				[OnEvent("MouseEnter")]: () => optionHovered.set(true),
				[OnEvent("MouseLeave")]: () => optionHovered.set(false),
				[OnEvent("Activated")]: () => {
					if (optionDisabled) return;
					props.value.set(opt.value);
					if (props.onChange !== undefined) props.onChange(opt.value);
					open.set(false);
				},
				[Children]: New(scope, "UIPadding")({
					PaddingLeft: new UDim(0, 12),
					PaddingRight: new UDim(0, 12),
				}),
			}),
		);
	});

	const menuPosition = Value(scope, new UDim2(0, 0, 0, 0));
	const menuSize = Value(scope, new UDim2(0, 0, 0, 0));

	const menu = New(scope, "Frame")({
		Name: "Menu",
		Position: menuPosition,
		Size: menuSize,
		BackgroundColor3: Palette.background.paper,
		BorderSizePixel: 0,
		ClipsDescendants: true,
		[Children]: menuItems,
	});

	const playerGui = Players.LocalPlayer.FindFirstChildOfClass("PlayerGui");
	if (playerGui === undefined) {
		// Running without a PlayerGui (e.g. plugin context). Fall back to
		// returning the trigger only — menu won't render.
		return wrapper;
	}

	const menuGui = New(scope, "ScreenGui")({
		Name: "DropdownMenuOverlay",
		ResetOnSpawn: false,
		IgnoreGuiInset: true,
		DisplayOrder: ZIndex.modal + 1,
		Enabled: open,
		[Children]: menu,
	});
	menuGui.Parent = playerGui;

	const maxMenuHeight = props.maxMenuHeight ?? ITEM_HEIGHT * 6;
	const targetMenuHeight = math.min(props.options.size() * ITEM_HEIGHT, maxMenuHeight);

	const reposition = () => {
		const triggerPos = trigger.AbsolutePosition;
		const triggerSize = trigger.AbsoluteSize;
		menuPosition.set(
			new UDim2(0, triggerPos.X, 0, triggerPos.Y + triggerSize.Y + MENU_GAP),
		);
		menuSize.set(new UDim2(0, triggerSize.X, 0, targetMenuHeight));
	};

	Observer(scope, open).onChange(() => {
		if (peek(open)) reposition();
	});
	trigger.GetPropertyChangedSignal("AbsolutePosition").Connect(reposition);
	trigger.GetPropertyChangedSignal("AbsoluteSize").Connect(reposition);
	task.defer(reposition);

	// Click-outside-to-close.
	const inputConn = UserInputService.InputBegan.Connect((input) => {
		if (!peek(open)) return;
		if (
			input.UserInputType !== Enum.UserInputType.MouseButton1 &&
			input.UserInputType !== Enum.UserInputType.Touch
		)
			return;
		const x = input.Position.X;
		const y = input.Position.Y;
		if (pointInFrame(menu, x, y)) return;
		if (pointInFrame(trigger, x, y)) return;
		open.set(false);
	});

	// Cleanup when the wrapper is removed from the tree.
	wrapper.AncestryChanged.Connect(() => {
		if (wrapper.IsDescendantOf(game)) return;
		inputConn.Disconnect();
		menuGui.Destroy();
	});

	return wrapper;
}
