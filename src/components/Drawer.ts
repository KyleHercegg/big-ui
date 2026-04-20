import Fusion from "@rbxts/fusion-3.0";
import { Palette, Spacing, Transparency, ZIndex } from "../ui/theme";

const { Children, Computed, New, OnEvent, Tween } = Fusion;

export type DrawerAnchor = "left" | "right" | "top" | "bottom";

export interface DrawerProps {
	open: Fusion.Value<boolean>;
	anchor?: DrawerAnchor;
	/** Width for left/right drawers, height for top/bottom drawers. */
	size?: number;
	children: Array<Instance | undefined>;
	closeOnBackdrop?: boolean;
	onClose?: () => void;
}

const SLIDE_INFO = new TweenInfo(0.24, Enum.EasingStyle.Quart, Enum.EasingDirection.Out);

interface AnchorSpec {
	panelSize: UDim2;
	anchorPoint: Vector2;
	openPos: UDim2;
	closedPos: UDim2;
}

function specFor(anchor: DrawerAnchor, size: number): AnchorSpec {
	switch (anchor) {
		case "right":
			return {
				panelSize: new UDim2(0, size, 1, 0),
				anchorPoint: new Vector2(1, 0),
				openPos: new UDim2(1, 0, 0, 0),
				closedPos: new UDim2(1, size, 0, 0),
			};
		case "top":
			return {
				panelSize: new UDim2(1, 0, 0, size),
				anchorPoint: new Vector2(0, 0),
				openPos: new UDim2(0, 0, 0, 0),
				closedPos: new UDim2(0, 0, 0, -size),
			};
		case "bottom":
			return {
				panelSize: new UDim2(1, 0, 0, size),
				anchorPoint: new Vector2(0, 1),
				openPos: new UDim2(0, 0, 1, 0),
				closedPos: new UDim2(0, 0, 1, size),
			};
		case "left":
		default:
			return {
				panelSize: new UDim2(0, size, 1, 0),
				anchorPoint: new Vector2(0, 0),
				openPos: new UDim2(0, 0, 0, 0),
				closedPos: new UDim2(0, -size, 0, 0),
			};
	}
}

export function Drawer(scope: Fusion.Scope<unknown>, props: DrawerProps): ScreenGui {
	const anchor = props.anchor ?? "left";
	const size = props.size ?? 280;
	const closeOnBackdrop = props.closeOnBackdrop ?? true;
	const spec = specFor(anchor, size);

	const close = () => {
		props.open.set(false);
		if (props.onClose !== undefined) props.onClose();
	};

	const targetPos = Computed(scope, (use) => (use(props.open) ? spec.openPos : spec.closedPos));
	const animatedPos = Tween(scope, targetPos, SLIDE_INFO);

	const backdropTransparency = Computed(scope, (use) =>
		use(props.open) ? Transparency.backdrop : 1,
	);
	const animatedBackdropTransparency = Tween(scope, backdropTransparency, SLIDE_INFO);

	const panelChildren: Instance[] = [
		New(scope, "UIListLayout")({
			FillDirection: Enum.FillDirection.Vertical,
			SortOrder: Enum.SortOrder.LayoutOrder,
			Padding: new UDim(0, Spacing(1)),
		}),
		New(scope, "UIPadding")({
			PaddingTop: new UDim(0, Spacing(2)),
			PaddingBottom: new UDim(0, Spacing(2)),
			PaddingLeft: new UDim(0, Spacing(2)),
			PaddingRight: new UDim(0, Spacing(2)),
		}),
	];
	for (const child of props.children) {
		if (child !== undefined) panelChildren.push(child);
	}

	return New(scope, "ScreenGui")({
		Name: "Drawer",
		ResetOnSpawn: false,
		IgnoreGuiInset: true,
		DisplayOrder: ZIndex.drawer,
		[Children]: [
			New(scope, "TextButton")({
				Name: "Backdrop",
				Size: new UDim2(1, 0, 1, 0),
				BackgroundColor3: Palette.common.black,
				BackgroundTransparency: animatedBackdropTransparency,
				BorderSizePixel: 0,
				Text: "",
				AutoButtonColor: false,
				Visible: props.open,
				[OnEvent("Activated")]: () => {
					if (closeOnBackdrop) close();
				},
			}),
			New(scope, "Frame")({
				Name: "Panel",
				AnchorPoint: spec.anchorPoint,
				Size: spec.panelSize,
				Position: animatedPos,
				BackgroundColor3: Palette.background.paper,
				BorderSizePixel: 0,
				ClipsDescendants: true,
				[Children]: panelChildren,
			}),
		],
	});
}
