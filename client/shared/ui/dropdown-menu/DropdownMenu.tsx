"use client";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Check, ChevronRight } from "lucide-react";
import type React from "react";
import { cn } from "../cn";

const Root = DropdownMenuPrimitive.Root;
const Trigger = DropdownMenuPrimitive.Trigger;
const Group = DropdownMenuPrimitive.Group;
const Portal = DropdownMenuPrimitive.Portal;
const Sub = DropdownMenuPrimitive.Sub;
const RadioGroup = DropdownMenuPrimitive.RadioGroup;

function Content({
	className,
	sideOffset = 6,
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
	return (
		<Portal>
			<DropdownMenuPrimitive.Content
				sideOffset={sideOffset}
				className={cn(
					"z-50 max-h-[min(24rem,calc(100dvh-2rem))] min-w-48 overflow-y-auto rounded-xl border border-surface-800 bg-surface-950 p-1.5 text-surface-200 shadow-[var(--ot-shadow-panel)] animate-scale-in",
					className,
				)}
				{...props}
			/>
		</Portal>
	);
}

function Item({
	className,
	inset,
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
	inset?: boolean;
}) {
	return (
		<DropdownMenuPrimitive.Item
			className={cn(
				"relative flex min-h-10 cursor-pointer select-none items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none transition-colors focus:bg-surface-900 focus:text-surface-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
				inset && "pl-8",
				className,
			)}
			{...props}
		/>
	);
}

function CheckboxItem({
	className,
	children,
	checked,
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
	return (
		<DropdownMenuPrimitive.CheckboxItem
			className={cn(
				"relative flex min-h-10 cursor-pointer select-none items-center rounded-lg py-2 pl-8 pr-3 text-sm outline-none transition-colors focus:bg-surface-900 focus:text-surface-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
				className,
			)}
			checked={checked}
			{...props}
		>
			<span className="absolute left-2 flex h-4 w-4 items-center justify-center">
				<DropdownMenuPrimitive.ItemIndicator>
					<Check className="h-4 w-4" />
				</DropdownMenuPrimitive.ItemIndicator>
			</span>
			{children}
		</DropdownMenuPrimitive.CheckboxItem>
	);
}

function RadioItem({
	className,
	children,
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
	return (
		<DropdownMenuPrimitive.RadioItem
			className={cn(
				"relative flex min-h-10 cursor-pointer select-none items-center rounded-lg py-2 pl-8 pr-3 text-sm outline-none transition-colors focus:bg-surface-900 focus:text-surface-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
				className,
			)}
			{...props}
		>
			<span className="absolute left-2 flex h-4 w-4 items-center justify-center">
				<DropdownMenuPrimitive.ItemIndicator>
					<Check className="h-4 w-4" />
				</DropdownMenuPrimitive.ItemIndicator>
			</span>
			{children}
		</DropdownMenuPrimitive.RadioItem>
	);
}

function Label({
	className,
	inset,
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
	inset?: boolean;
}) {
	return (
		<DropdownMenuPrimitive.Label
			className={cn(
				"px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-surface-600",
				inset && "pl-8",
				className,
			)}
			{...props}
		/>
	);
}

function Separator({
	className,
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
	return (
		<DropdownMenuPrimitive.Separator
			className={cn("-mx-1 my-1 h-px bg-surface-900", className)}
			{...props}
		/>
	);
}

function Shortcut({ className, ...props }: React.ComponentProps<"span">) {
	return (
		<span
			className={cn(
				"ml-auto text-xs tracking-widest text-surface-600",
				className,
			)}
			{...props}
		/>
	);
}

function SubTrigger({
	className,
	inset,
	children,
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
	inset?: boolean;
}) {
	return (
		<DropdownMenuPrimitive.SubTrigger
			className={cn(
				"flex min-h-10 cursor-pointer select-none items-center rounded-lg px-3 py-2 text-sm outline-none focus:bg-surface-900 data-[state=open]:bg-surface-900",
				inset && "pl-8",
				className,
			)}
			{...props}
		>
			{children}
			<ChevronRight className="ml-auto h-4 w-4" />
		</DropdownMenuPrimitive.SubTrigger>
	);
}

function SubContent({
	className,
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
	return (
		<DropdownMenuPrimitive.SubContent
			className={cn(
				"z-50 min-w-48 overflow-hidden rounded-xl border border-surface-800 bg-surface-950 p-1.5 text-surface-200 shadow-[var(--ot-shadow-panel)] animate-scale-in",
				className,
			)}
			{...props}
		/>
	);
}

export const DropdownMenu = {
	Root,
	Trigger,
	Content,
	Item,
	CheckboxItem,
	RadioItem,
	Label,
	Separator,
	Shortcut,
	Group,
	Portal,
	Sub,
	SubTrigger,
	SubContent,
	RadioGroup,
};
