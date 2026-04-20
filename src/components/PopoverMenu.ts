import Fusion from "@rbxts/fusion-3.0";
import { Players, UserInputService } from "@rbxts/services";
import { Palette, Shape, Transparency, Typography, ZIndex } from "../ui/theme";

const { Children, Computed, New, Observer, OnEvent, Value, peek } = Fusion;

export interface PopoverMenuItem {
	label: string;
	/** Short glyph / emoji rendered before the label. */
	leading?: string;
	disabled?: boolean;
	/** Renders this entry as a horizontal divider; `label` is ignored. */
	divider?: boolean;
	onActivate?: () => void;
}

export interface PopoverMenuProps {
	/**
	 * Undefined = closed. Set to a screen pixel position (typically
	 * `UserInputService:GetMouseLocation()`) to open. The menu self-closes on
	 * item click, outside click, or Escape, setting this value back to undefined.
	 */
	anchor: Fusion.Value<Vector2 | undefined>;
	items: PopoverMenuItem[];
	width?: number;
	onClose?: () => void;
}

const ITEM_HEIGHT = 36;
const DIVIDER_HEIGHT = 9;
const MENU_PADDING_Y = 6;
const EDGE_MARGIN = 8;

function measureHeight(items: PopoverMenuItem[]): number {
	let total = MENU_PADDING_Y * 2;
	for (const item of items) total += item.divider === true ? DIVIDER_HEIGHT : ITEM_HEIGHT;
	return total;
}

function pointInFrame(frame: GuiObject, x: number, y: number): boolean {
	const p = frame.AbsolutePosition;
	const s = frame.AbsoluteSize;
	return x >= p.X && x <= p.X + s.X && y >= p.Y && y <= p.Y + s.Y;
}

export function PopoverMenu(
	scope: Fusion.Scope<unknown>,
	props: PopoverMenuProps,
): ScreenGui {
	const width = props.width ?? 200;
	const height = measureHeight(props.items);

	const open = Computed(scope, (use) => use(props.anchor) !== undefined);

	const closeMenu = () => {
		if (peek(props.anchor) === undefined) return;
		props.anchor.set(undefined);
		if (props.onClose !== undefined) props.onClose();
	};

	const menuItems: Instance[] = [
		New(scope, "UICorner")({ CornerRadius: new UDim(0, Shape.radius) }),
		New(scope, "UIStroke")({
			Color: Palette.common.black,
			Transparency: Transparency.divider,
			Thickness: 1,
			ApplyStrokeMode: Enum.ApplyStrokeMode.Border,
		}),
		New(scope, "UIPadding")({
			PaddingTop: new UDim(0, MENU_PADDING_Y),
			PaddingBottom: new UDim(0, MENU_PADDING_Y),
			PaddingLeft: new UDim(0, 0),
			PaddingRight: new UDim(0, 0),
		}),
		New(scope, "UIListLayout")({
			FillDirection: Enum.FillDirection.Vertical,
			SortOrder: Enum.SortOrder.LayoutOrder,
		}),
	];

	props.items.forEach((item, idx) => {
		if (item.divider === true) {
			menuItems.push(
				New(scope, "Frame")({
					Name: "Divider",
					Size: new UDim2(1, 0, 0, DIVIDER_HEIGHT),
					BackgroundTransparency: 1,
					LayoutOrder: idx + 1,
					[Children]: New(scope, "Frame")({
						AnchorPoint: new Vector2(0, 0.5),
						Position: new UDim2(0, 8, 0.5, 0),
						Size: new UDim2(1, -16, 0, 1),
						BackgroundColor3: Palette.common.black,
						BackgroundTransparency: Transparency.divider,
						BorderSizePixel: 0,
					}),
				}),
			);
			return;
		}

		const itemHovered = Value(scope, false);
		const itemDisabled = item.disabled ?? false;

		const bgTransparency = Computed(scope, (use) => {
			if (itemDisabled) return 1;
			return use(itemHovered) ? Transparency.hover : 1;
		});

		menuItems.push(
			New(scope, "TextButton")({
				Name: `Item_${idx}`,
				Size: new UDim2(1, 0, 0, ITEM_HEIGHT),
				BackgroundColor3: Palette.common.black,
				BackgroundTransparency: bgTransparency,
				BorderSizePixel: 0,
				Text: "",
				AutoButtonColor: false,
				Active: !itemDisabled,
				LayoutOrder: idx + 1,
				[OnEvent("MouseEnter")]: () => itemHovered.set(true),
				[OnEvent("MouseLeave")]: () => itemHovered.set(false),
				[OnEvent("Activated")]: () => {
					if (itemDisabled) return;
					if (item.onActivate !== undefined) item.onActivate();
					closeMenu();
				},
				[Children]: [
					New(scope, "UIListLayout")({
						FillDirection: Enum.FillDirection.Horizontal,
						VerticalAlignment: Enum.VerticalAlignment.Center,
						SortOrder: Enum.SortOrder.LayoutOrder,
						Padding: new UDim(0, 10),
					}),
					New(scope, "UIPadding")({
						PaddingLeft: new UDim(0, 12),
						PaddingRight: new UDim(0, 12),
					}),
					item.leading !== undefined
						? New(scope, "TextLabel")({
							Name: "Leading",
							Size: new UDim2(0, 20, 1, 0),
							BackgroundTransparency: 1,
							Text: item.leading,
							TextColor3: Palette.common.black,
							TextTransparency: itemDisabled
								? Transparency.textDisabled
								: Transparency.textSecondary,
							TextSize: 16,
							Font: Enum.Font.GothamBold,
							TextXAlignment: Enum.TextXAlignment.Center,
							TextYAlignment: Enum.TextYAlignment.Center,
							LayoutOrder: 1,
						})
						: New(scope, "Frame")({
							Size: new UDim2(0, 0, 0, 0),
							BackgroundTransparency: 1,
							LayoutOrder: 1,
							Visible: false,
						}),
					New(scope, "TextLabel")({
						Name: "Label",
						Size: new UDim2(1, -40, 1, 0),
						AutomaticSize: Enum.AutomaticSize.None,
						BackgroundTransparency: 1,
						Text: item.label,
						TextColor3: Palette.common.black,
						TextTransparency: itemDisabled ? Transparency.textDisabled : Transparency.textPrimary,
						TextSize: Typography.body1.size,
						Font: Typography.body1.font,
						TextXAlignment: Enum.TextXAlignment.Left,
						TextYAlignment: Enum.TextYAlignment.Center,
						LayoutOrder: 2,
					}),
				],
			}),
		);
	});

	const menuPosition = Value(scope, new UDim2(0, 0, 0, 0));

	const menu = New(scope, "Frame")({
		Name: "Menu",
		Size: new UDim2(0, width, 0, height),
		Position: menuPosition,
		BackgroundColor3: Palette.background.paper,
		BorderSizePixel: 0,
		[Children]: menuItems,
	});

	// `IgnoreGuiInset = false` so the ScreenGui's coord frame matches
	// UserInputService.GetMouseLocation(), which is relative to the area below
	// the topbar. The caller passes GetMouseLocation() directly — no inset math.
	const screenGui = New(scope, "ScreenGui")({
		Name: "PopoverMenuOverlay",
		ResetOnSpawn: false,
		IgnoreGuiInset: false,
		DisplayOrder: ZIndex.modal + 2,
		Enabled: open,
		[Children]: menu,
	});

	const clampToViewport = (rawAnchor: Vector2): Vector2 => {
		const viewport = screenGui.AbsoluteSize;
		// Flip horizontally if the menu would fall off the right edge.
		let x = rawAnchor.X;
		if (x + width + EDGE_MARGIN > viewport.X) x = math.max(EDGE_MARGIN, x - width);
		x = math.clamp(x, EDGE_MARGIN, math.max(EDGE_MARGIN, viewport.X - width - EDGE_MARGIN));

		let y = rawAnchor.Y;
		if (y + height + EDGE_MARGIN > viewport.Y) y = math.max(EDGE_MARGIN, y - height);
		y = math.clamp(y, EDGE_MARGIN, math.max(EDGE_MARGIN, viewport.Y - height - EDGE_MARGIN));
		return new Vector2(x, y);
	};

	Observer(scope, props.anchor).onChange(() => {
		const a = peek(props.anchor);
		if (a === undefined) return;
		const p = clampToViewport(a);
		menuPosition.set(new UDim2(0, p.X, 0, p.Y));
	});

	const playerGui = Players.LocalPlayer.FindFirstChildOfClass("PlayerGui");
	if (playerGui !== undefined) screenGui.Parent = playerGui;

	const inputConn = UserInputService.InputBegan.Connect((input) => {
		if (peek(props.anchor) === undefined) return;

		if (input.KeyCode === Enum.KeyCode.Escape) {
			closeMenu();
			return;
		}

		if (
			input.UserInputType !== Enum.UserInputType.MouseButton1 &&
			input.UserInputType !== Enum.UserInputType.MouseButton2 &&
			input.UserInputType !== Enum.UserInputType.Touch
		)
			return;

		const x = input.Position.X;
		const y = input.Position.Y;
		if (pointInFrame(menu, x, y)) return;
		closeMenu();
	});

	screenGui.AncestryChanged.Connect(() => {
		if (screenGui.IsDescendantOf(game)) return;
		inputConn.Disconnect();
	});

	return screenGui;
}
