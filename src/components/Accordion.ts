import Fusion from "@rbxts/fusion-3.0";
import { Palette, Shape, Spacing, Transparency, Typography } from "../ui/theme";

const { Children, Computed, New, OnEvent, Value, peek } = Fusion;

export interface AccordionProps {
	title: string;
	expanded?: Fusion.Value<boolean>;
	defaultExpanded?: boolean;
	children: Instance[];
	layoutOrder?: number;
}

const HEADER_HEIGHT = 48;

export function Accordion(scope: Fusion.Scope<unknown>, props: AccordionProps): Frame {
	const expanded = props.expanded ?? Value(scope, props.defaultExpanded ?? false);
	const chevron = Computed(scope, (use) => (use(expanded) ? "▾" : "▸"));

	const contentChildren: Instance[] = [
		New(scope, "UIListLayout")({
			FillDirection: Enum.FillDirection.Vertical,
			SortOrder: Enum.SortOrder.LayoutOrder,
			Padding: new UDim(0, Spacing(1)),
		}),
		New(scope, "UIPadding")({
			PaddingTop: new UDim(0, 2),
			PaddingBottom: new UDim(0, Spacing(2)),
			PaddingLeft: new UDim(0, Spacing(2)),
			PaddingRight: new UDim(0, Spacing(2)),
		}),
	];
	props.children.forEach((child, idx) => {
		if (child === undefined) return;
		if (child.IsA("GuiObject")) child.LayoutOrder = idx + 1;
		contentChildren.push(child);
	});

	const content = New(scope, "Frame")({
		Name: "Content",
		Size: new UDim2(1, 0, 0, 0),
		AutomaticSize: Enum.AutomaticSize.Y,
		BackgroundTransparency: 1,
		LayoutOrder: 2,
		Visible: expanded,
		[Children]: contentChildren,
	});

	const divider = New(scope, "Frame")({
		Name: "HeaderDivider",
		Size: new UDim2(1, 0, 0, 1),
		BackgroundColor3: Palette.common.black,
		BackgroundTransparency: Transparency.divider,
		BorderSizePixel: 0,
		LayoutOrder: 3,
		Visible: expanded,
	});

	const header = New(scope, "TextButton")({
		Name: "Header",
		Size: new UDim2(1, 0, 0, HEADER_HEIGHT),
		BackgroundTransparency: 1,
		Text: "",
		AutoButtonColor: false,
		LayoutOrder: 1,
		[OnEvent("Activated")]: () => expanded.set(!peek(expanded)),
		[Children]: [
			New(scope, "UIListLayout")({
				FillDirection: Enum.FillDirection.Horizontal,
				VerticalAlignment: Enum.VerticalAlignment.Center,
				SortOrder: Enum.SortOrder.LayoutOrder,
				Padding: new UDim(0, 8),
			}),
			New(scope, "UIPadding")({
				PaddingLeft: new UDim(0, Spacing(2)),
				PaddingRight: new UDim(0, Spacing(2)),
			}),
			New(scope, "TextLabel")({
				Name: "Title",
				Size: new UDim2(1, -32, 1, 0),
				BackgroundTransparency: 1,
				Text: props.title,
				TextColor3: Palette.common.black,
				TextTransparency: Transparency.textPrimary,
				TextSize: Typography.subtitle1.size,
				Font: Typography.subtitle1.font,
				TextXAlignment: Enum.TextXAlignment.Left,
				LayoutOrder: 1,
			}),
			New(scope, "TextLabel")({
				Name: "Chevron",
				Size: new UDim2(0, 24, 1, 0),
				BackgroundTransparency: 1,
				Text: chevron,
				TextColor3: Palette.common.black,
				TextTransparency: Transparency.textSecondary,
				TextSize: 16,
				Font: Enum.Font.GothamBold,
				TextXAlignment: Enum.TextXAlignment.Right,
				LayoutOrder: 2,
			}),
		],
	});

	return New(scope, "Frame")({
		Name: "Accordion",
		Size: new UDim2(1, 0, 0, 0),
		AutomaticSize: Enum.AutomaticSize.Y,
		BackgroundColor3: Palette.background.paper,
		BorderSizePixel: 0,
		LayoutOrder: props.layoutOrder ?? 0,
		[Children]: [
			New(scope, "UICorner")({ CornerRadius: new UDim(0, Shape.radius) }),
			New(scope, "UIStroke")({
				Color: Palette.common.black,
				Transparency: Transparency.divider,
				Thickness: 1,
				ApplyStrokeMode: Enum.ApplyStrokeMode.Border,
			}),
			New(scope, "UIListLayout")({
				FillDirection: Enum.FillDirection.Vertical,
				SortOrder: Enum.SortOrder.LayoutOrder,
			}),
			header,
			divider,
			content,
		],
	});
}
