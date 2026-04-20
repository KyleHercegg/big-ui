import Fusion from "@rbxts/fusion-3.0";
import { Button } from "./Button";
import { Palette, Shape, Spacing, Transparency, Typography, ZIndex } from "../ui/theme";

const { Children, New, OnEvent } = Fusion;

export interface ModalAction {
	label: string;
	variant?: "contained" | "outlined" | "text";
	color?: "primary" | "secondary" | "error" | "warning" | "info" | "success";
	onActivate?: () => void;
}

export interface ModalProps {
	open: Fusion.Value<boolean>;
	title?: string;
	children: Array<Instance | undefined>;
	actions?: ModalAction[];
	width?: number;
	closeOnBackdrop?: boolean;
	onClose?: () => void;
	layoutOrder?: number;
}

export function Modal(scope: Fusion.Scope<unknown>, props: ModalProps): ScreenGui {
	const width = props.width ?? 440;
	const closeOnBackdrop = props.closeOnBackdrop ?? true;

	const close = () => {
		props.open.set(false);
		if (props.onClose !== undefined) props.onClose();
	};

	const dialogChildren: Instance[] = [
		New(scope, "UICorner")({ CornerRadius: new UDim(0, Shape.radiusLarge) }),
		New(scope, "UIPadding")({
			PaddingTop: new UDim(0, Spacing(3)),
			PaddingBottom: new UDim(0, Spacing(3)),
			PaddingLeft: new UDim(0, Spacing(3)),
			PaddingRight: new UDim(0, Spacing(3)),
		}),
		New(scope, "UIListLayout")({
			FillDirection: Enum.FillDirection.Vertical,
			SortOrder: Enum.SortOrder.LayoutOrder,
			Padding: new UDim(0, Spacing(1.5)),
		}),
		New(scope, "UIStroke")({
			Color: Palette.common.black,
			Transparency: Transparency.divider,
			Thickness: 1,
		}),
	];

	if (props.title !== undefined) {
		dialogChildren.push(
			New(scope, "TextLabel")({
				Size: new UDim2(1, 0, 0, Typography.h6.lineHeight),
				BackgroundTransparency: 1,
				Text: props.title,
				Font: Typography.h6.font,
				TextSize: Typography.h6.size,
				TextColor3: Palette.text.primary,
				TextTransparency: Transparency.textPrimary,
				TextXAlignment: Enum.TextXAlignment.Left,
				LayoutOrder: 1,
			}),
		);
	}

	// User-provided content. We assign LayoutOrder in a 10..100 range so actions
	// (LayoutOrder 200) always render below.
	let contentOrder = 10;
	for (const child of props.children) {
		if (child === undefined) continue;
		if (child.IsA("GuiObject")) child.LayoutOrder = contentOrder++;
		dialogChildren.push(child);
	}

	if (props.actions !== undefined && props.actions.size() > 0) {
		const actionChildren: Instance[] = [
			New(scope, "UIListLayout")({
				FillDirection: Enum.FillDirection.Horizontal,
				SortOrder: Enum.SortOrder.LayoutOrder,
				HorizontalAlignment: Enum.HorizontalAlignment.Right,
				Padding: new UDim(0, Spacing(1)),
			}),
		];
		props.actions.forEach((action, i) => {
			const actionCopy = action;
			actionChildren.push(
				Button(scope, {
					label: actionCopy.label,
					variant: actionCopy.variant ?? "text",
					color: actionCopy.color ?? "primary",
					layoutOrder: i,
					onActivate: () => {
						if (actionCopy.onActivate !== undefined) actionCopy.onActivate();
						close();
					},
				}),
			);
		});
		dialogChildren.push(
			New(scope, "Frame")({
				Name: "Actions",
				Size: new UDim2(1, 0, 0, 36),
				BackgroundTransparency: 1,
				LayoutOrder: 200,
				[Children]: actionChildren,
			}),
		);
	}

	return New(scope, "ScreenGui")({
		Name: "Modal",
		ResetOnSpawn: false,
		IgnoreGuiInset: true,
		DisplayOrder: ZIndex.modal,
		Enabled: props.open,
		[Children]: [
			New(scope, "TextButton")({
				Name: "Backdrop",
				Size: new UDim2(1, 0, 1, 0),
				BackgroundColor3: Palette.common.black,
				BackgroundTransparency: Transparency.backdrop,
				BorderSizePixel: 0,
				Text: "",
				AutoButtonColor: false,
				[OnEvent("Activated")]: () => {
					if (closeOnBackdrop) close();
				},
			}),
			New(scope, "Frame")({
				Name: "Dialog",
				AnchorPoint: new Vector2(0.5, 0.5),
				Position: new UDim2(0.5, 0, 0.5, 0),
				Size: new UDim2(0, width, 0, 0),
				AutomaticSize: Enum.AutomaticSize.Y,
				BackgroundColor3: Palette.background.paper,
				BorderSizePixel: 0,
				LayoutOrder: props.layoutOrder ?? 0,
				[Children]: dialogChildren,
			}),
		],
	});
}
