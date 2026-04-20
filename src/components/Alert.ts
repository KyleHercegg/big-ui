import Fusion from "@rbxts/fusion-3.0";
import { Icon } from "./Icon";
import { IconButton } from "./IconButton";
import { Shape, paletteFor } from "../ui/theme";
import type { IconName } from "../ui/icons";

const { Children, New } = Fusion;

export type AlertSeverity = "info" | "success" | "warning" | "error";

export interface AlertProps {
	severity: AlertSeverity;
	title?: string;
	message: string;
	onClose?: () => void;
	layoutOrder?: number;
}

const ICONS: Record<AlertSeverity, IconName> = {
	info: "info",
	success: "check",
	warning: "warning",
	error: "close",
};

export function Alert(scope: Fusion.Scope<unknown>, props: AlertProps): Frame {
	const palette = paletteFor(props.severity);
	const icon = ICONS[props.severity];

	const items: Instance[] = [
		New(scope, "UICorner")({ CornerRadius: new UDim(0, Shape.radius) }),
		New(scope, "UIStroke")({
			Color: palette.main,
			Transparency: 0.5,
			Thickness: 1,
			ApplyStrokeMode: Enum.ApplyStrokeMode.Border,
		}),
		New(scope, "UIPadding")({
			PaddingTop: new UDim(0, 10),
			PaddingBottom: new UDim(0, 10),
			PaddingLeft: new UDim(0, 12),
			PaddingRight: new UDim(0, 12),
		}),
		New(scope, "UIListLayout")({
			FillDirection: Enum.FillDirection.Horizontal,
			SortOrder: Enum.SortOrder.LayoutOrder,
			VerticalAlignment: Enum.VerticalAlignment.Top,
			Padding: new UDim(0, 12),
		}),
	];

	// Severity icon in a small coloured circle.
	const badgeIcon = Icon(scope, {
		name: icon,
		size: 14,
		color: palette.contrast,
	});
	badgeIcon.AnchorPoint = new Vector2(0.5, 0.5);
	badgeIcon.Position = new UDim2(0.5, 0, 0.5, 0);

	items.push(
		New(scope, "Frame")({
			Name: "IconBadge",
			Size: new UDim2(0, 24, 0, 24),
			BackgroundColor3: palette.main,
			BorderSizePixel: 0,
			LayoutOrder: 1,
			[Children]: [
				New(scope, "UICorner")({ CornerRadius: new UDim(1, 0) }),
				badgeIcon,
			],
		}),
	);

	const contentChildren: Instance[] = [
		New(scope, "UIListLayout")({
			FillDirection: Enum.FillDirection.Vertical,
			SortOrder: Enum.SortOrder.LayoutOrder,
			Padding: new UDim(0, 2),
		}),
	];
	if (props.title !== undefined) {
		contentChildren.push(
			New(scope, "TextLabel")({
				Size: new UDim2(1, 0, 0, 20),
				BackgroundTransparency: 1,
				Text: props.title,
				TextColor3: palette.dark,
				TextSize: 14,
				Font: Enum.Font.GothamBold,
				TextXAlignment: Enum.TextXAlignment.Left,
				LayoutOrder: 1,
			}),
		);
	}
	contentChildren.push(
		New(scope, "TextLabel")({
			Size: new UDim2(1, 0, 0, 0),
			AutomaticSize: Enum.AutomaticSize.Y,
			BackgroundTransparency: 1,
			Text: props.message,
			TextColor3: palette.dark,
			TextSize: 14,
			Font: Enum.Font.Gotham,
			TextXAlignment: Enum.TextXAlignment.Left,
			TextYAlignment: Enum.TextYAlignment.Top,
			TextWrapped: true,
			LayoutOrder: 2,
		}),
	);

	items.push(
		New(scope, "Frame")({
			Name: "Content",
			Size: new UDim2(1, props.onClose !== undefined ? -88 : -52, 0, 0),
			AutomaticSize: Enum.AutomaticSize.Y,
			BackgroundTransparency: 1,
			LayoutOrder: 2,
			[Children]: contentChildren,
		}),
	);

	if (props.onClose !== undefined) {
		items.push(
			IconButton(scope, {
				icon: "close",
				size: "small",
				color: props.severity,
				onActivate: props.onClose,
				layoutOrder: 3,
			}),
		);
	}

	return New(scope, "Frame")({
		Name: "Alert",
		Size: new UDim2(1, 0, 0, 0),
		AutomaticSize: Enum.AutomaticSize.Y,
		BackgroundColor3: palette.light,
		BackgroundTransparency: 0.85,
		BorderSizePixel: 0,
		LayoutOrder: props.layoutOrder ?? 0,
		[Children]: items,
	});
}
