import Fusion from "@rbxts/fusion-3.0";
import { Palette, Shape, Transparency, Typography } from "../ui/theme";

const { Children, Computed, New, OnEvent, Value } = Fusion;

export interface ListProps {
	children: Instance[];
	layoutOrder?: number;
	background?: Color3;
	withSurface?: boolean;
}

export function List(scope: Fusion.Scope<unknown>, props: ListProps): Frame {
	const items: Instance[] = [
		New(scope, "UIListLayout")({
			FillDirection: Enum.FillDirection.Vertical,
			SortOrder: Enum.SortOrder.LayoutOrder,
		}),
	];

	if (props.withSurface ?? false) {
		items.push(New(scope, "UICorner")({ CornerRadius: new UDim(0, Shape.radius) }));
		items.push(
			New(scope, "UIStroke")({
				Color: Palette.common.black,
				Transparency: Transparency.divider,
				Thickness: 1,
				ApplyStrokeMode: Enum.ApplyStrokeMode.Border,
			}),
		);
	}

	props.children.forEach((child, idx) => {
		if (child === undefined) return;
		if (child.IsA("GuiObject")) child.LayoutOrder = idx + 1;
		items.push(child);
	});

	return New(scope, "Frame")({
		Name: "List",
		Size: new UDim2(1, 0, 0, 0),
		AutomaticSize: Enum.AutomaticSize.Y,
		BackgroundColor3:
			props.background ??
			(props.withSurface ?? false ? Palette.background.paper : Palette.common.black),
		BackgroundTransparency: props.withSurface ?? false ? 0 : 1,
		BorderSizePixel: 0,
		ClipsDescendants: props.withSurface ?? false,
		LayoutOrder: props.layoutOrder ?? 0,
		[Children]: items,
	});
}

export interface ListItemProps {
	primary: string;
	secondary?: string;
	leading?: Instance;
	trailing?: Instance;
	/** Plain boolean for static items, or a Fusion Value/Computed for reactive selection. */
	selected?: Fusion.UsedAs<boolean>;
	disabled?: boolean;
	onActivate?: () => void;
	layoutOrder?: number;
}

export function ListItem(scope: Fusion.Scope<unknown>, props: ListItemProps): TextButton {
	const disabled = props.disabled ?? false;
	const hovered = Value(scope, false);

	const isSelected = Computed(scope, (use) =>
		props.selected !== undefined ? use(props.selected) : false,
	);

	// MUI selected-list-item style: tint the surface with primary.main at a low
	// alpha (transparency 0.88 ≈ 12% over white) and use primary.dark text for
	// strong AA contrast against the tinted surface.
	const SELECTED_TINT = 0.88;

	const bgTransparency = Computed(scope, (use) => {
		if (disabled) return 1;
		if (use(isSelected)) return SELECTED_TINT;
		return use(hovered) ? Transparency.hover : 1;
	});
	const bgColor = Computed(scope, (use) =>
		use(isSelected) ? Palette.primary.main : Palette.common.black,
	);

	const contentChildren: Instance[] = [
		New(scope, "UIListLayout")({
			FillDirection: Enum.FillDirection.Horizontal,
			VerticalAlignment: Enum.VerticalAlignment.Center,
			SortOrder: Enum.SortOrder.LayoutOrder,
			Padding: new UDim(0, 12),
		}),
		New(scope, "UIPadding")({
			PaddingTop: new UDim(0, 10),
			PaddingBottom: new UDim(0, 10),
			PaddingLeft: new UDim(0, 16),
			PaddingRight: new UDim(0, 16),
		}),
	];

	if (props.leading !== undefined) {
		if (props.leading.IsA("GuiObject")) props.leading.LayoutOrder = 1;
		contentChildren.push(props.leading);
	}

	const textColumn: Instance[] = [
		New(scope, "UIListLayout")({
			FillDirection: Enum.FillDirection.Vertical,
			SortOrder: Enum.SortOrder.LayoutOrder,
		}),
		New(scope, "TextLabel")({
			Size: new UDim2(1, 0, 0, 20),
			BackgroundTransparency: 1,
			Text: props.primary,
			TextColor3: Computed(scope, (use) =>
				use(isSelected) ? Palette.primary.dark : Palette.common.black,
			),
			TextTransparency: Computed(scope, (use) => {
				if (disabled) return Transparency.textDisabled;
				return use(isSelected) ? 0 : Transparency.textPrimary;
			}),
			TextSize: Typography.body1.size,
			Font: Computed(scope, (use) =>
				use(isSelected) ? Typography.subtitle1.font : Typography.body1.font,
			),
			TextXAlignment: Enum.TextXAlignment.Left,
			LayoutOrder: 1,
		}),
	];
	if (props.secondary !== undefined) {
		textColumn.push(
			New(scope, "TextLabel")({
				Size: new UDim2(1, 0, 0, 18),
				BackgroundTransparency: 1,
				Text: props.secondary,
				TextColor3: Computed(scope, (use) =>
					use(isSelected) ? Palette.primary.main : Palette.common.black,
				),
				TextTransparency: Computed(scope, (use) =>
					use(isSelected) ? Transparency.textSecondary : Transparency.textSecondary,
				),
				TextSize: Typography.body2.size,
				Font: Typography.body2.font,
				TextXAlignment: Enum.TextXAlignment.Left,
				LayoutOrder: 2,
			}),
		);
	}

	contentChildren.push(
		New(scope, "Frame")({
			Name: "TextColumn",
			Size: new UDim2(1, 0, 0, 0),
			AutomaticSize: Enum.AutomaticSize.Y,
			BackgroundTransparency: 1,
			LayoutOrder: 2,
			[Children]: textColumn,
		}),
	);

	if (props.trailing !== undefined) {
		if (props.trailing.IsA("GuiObject")) props.trailing.LayoutOrder = 3;
		contentChildren.push(props.trailing);
	}

	return New(scope, "TextButton")({
		Name: "ListItem",
		Size: new UDim2(1, 0, 0, 0),
		AutomaticSize: Enum.AutomaticSize.Y,
		BackgroundColor3: bgColor,
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
		[Children]: contentChildren,
	});
}
