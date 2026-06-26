"use client";

import { useUIStore } from "@/features/workspace/store/uiStore";
import { Badge } from "@/shared/ui/badge/Badge";
import { Button } from "@/shared/ui/button/Button";
import { cn } from "@/shared/ui/cn";
import {
	Activity,
	Clock3,
	Command,
	CornerDownLeft,
	FileText,
	Folder,
	Loader2,
	MessageSquare,
	Search,
	User,
	X,
} from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
	type WorkspaceCommand,
	useWorkspaceCommands,
} from "../hooks/useWorkspaceCommands";
import {
	type SearchEntityType,
	type SearchResultGroup,
	type SearchResultItem,
	useWorkspaceSearch,
} from "../hooks/useWorkspaceSearch";

const RECENT_SEARCH_KEY = "onetask:recent-searches";
const RECENT_SEARCH_LIMIT = 6;

const entityIcons: Record<SearchEntityType, React.ElementType> = {
	task: FileText,
	project: Folder,
	comment: MessageSquare,
	member: User,
	activity: Activity,
};

const entityTone: Record<
	SearchEntityType,
	"neutral" | "accent" | "success" | "warning" | "danger"
> = {
	task: "accent",
	project: "success",
	comment: "neutral",
	member: "warning",
	activity: "danger",
};

type PaletteItem =
	| { kind: "command"; command: WorkspaceCommand }
	| { kind: "result"; item: SearchResultItem };

function useDebouncedValue(value: string, delayMs: number) {
	const [debounced, setDebounced] = useState(value);

	useEffect(() => {
		const timeout = window.setTimeout(() => setDebounced(value), delayMs);
		return () => window.clearTimeout(timeout);
	}, [value, delayMs]);

	return debounced;
}

function loadRecentSearches() {
	if (typeof window === "undefined") return [];
	try {
		const stored = window.localStorage.getItem(RECENT_SEARCH_KEY);
		const parsed = stored ? JSON.parse(stored) : [];
		return Array.isArray(parsed)
			? parsed.filter((item) => typeof item === "string").slice(0, 6)
			: [];
	} catch {
		return [];
	}
}

function storeRecentSearches(searches: string[]) {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(RECENT_SEARCH_KEY, JSON.stringify(searches));
}

function CommandResultRow({
	command,
	active,
	onSelect,
}: {
	command: WorkspaceCommand;
	active: boolean;
	onSelect: (command: WorkspaceCommand) => void;
}) {
	const Icon = command.icon;

	return (
		<button
			type="button"
			onClick={() => onSelect(command)}
			disabled={command.disabled}
			className={cn(
				"grid w-full grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-3 rounded-lg px-2.5 py-2.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-45",
				active
					? "bg-surface-800/80 text-surface-100"
					: "text-surface-300 hover:bg-surface-900/70",
			)}
		>
			<span
				className={cn(
					"flex h-9 w-9 items-center justify-center rounded-lg border",
					active
						? "border-primary-500/30 bg-primary-500/10 text-primary-200"
						: "border-surface-800 bg-surface-950 text-surface-500",
				)}
			>
				<Icon className="h-4 w-4" />
			</span>
			<span className="min-w-0">
				<span className="block truncate text-sm font-semibold">
					{command.title}
				</span>
				<span className="mt-0.5 block truncate text-xs text-surface-500">
					{command.disabledReason || command.subtitle}
				</span>
			</span>
			<Badge tone="accent" className="shrink-0">
				command
			</Badge>
		</button>
	);
}

function SearchResultRow({
	item,
	active,
	onSelect,
}: {
	item: SearchResultItem;
	active: boolean;
	onSelect: (item: SearchResultItem) => void;
}) {
	const Icon = entityIcons[item.type];

	return (
		<button
			type="button"
			onClick={() => onSelect(item)}
			className={cn(
				"grid w-full grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-3 rounded-lg px-2.5 py-2.5 text-left transition-colors",
				active
					? "bg-surface-800/80 text-surface-100"
					: "text-surface-300 hover:bg-surface-900/70",
			)}
		>
			<span
				className={cn(
					"flex h-9 w-9 items-center justify-center rounded-lg border",
					active
						? "border-primary-500/30 bg-primary-500/10 text-primary-200"
						: "border-surface-800 bg-surface-950 text-surface-500",
				)}
			>
				<Icon className="h-4 w-4" />
			</span>
			<span className="min-w-0">
				<span className="block truncate text-sm font-semibold">
					{item.title}
				</span>
				<span className="mt-0.5 block truncate text-xs text-surface-500">
					{item.subtitle || item.description || item.type}
				</span>
			</span>
			<Badge tone={entityTone[item.type]} className="shrink-0">
				{item.type === "activity" ? "event" : item.type}
			</Badge>
		</button>
	);
}

function CommandGroup({
	commands,
	activeIndex,
	onSelect,
}: {
	commands: WorkspaceCommand[];
	activeIndex: number;
	onSelect: (command: WorkspaceCommand) => void;
}) {
	if (commands.length === 0) return null;

	return (
		<section className="space-y-1.5">
			<div className="flex items-center justify-between px-1">
				<p className="ot-label">Commands</p>
				<span className="text-[11px] font-bold text-surface-600">
					{commands.length}
				</span>
			</div>
			<div className="space-y-1">
				{commands.map((command, index) => (
					<CommandResultRow
						key={command.id}
						command={command}
						active={activeIndex === index}
						onSelect={onSelect}
					/>
				))}
			</div>
		</section>
	);
}

function ResultGroups({
	groups,
	activeIndex,
	startIndex = 0,
	onSelect,
}: {
	groups: SearchResultGroup[];
	activeIndex: number;
	startIndex?: number;
	onSelect: (item: SearchResultItem) => void;
}) {
	const activeGroups = groups.filter((group) => group.items.length > 0);

	return (
		<div className="space-y-4">
			{activeGroups.map((group, groupIndex) => {
				const previousItemsCount = activeGroups
					.slice(0, groupIndex)
					.reduce((sum, g) => sum + g.items.length, 0);

				return (
					<section key={group.type} className="space-y-1.5">
						<div className="flex items-center justify-between px-1">
							<p className="ot-label">{group.label}</p>
							<span className="text-[11px] font-bold text-surface-600">
								{group.items.length}
							</span>
						</div>
						<div className="space-y-1">
							{group.items.map((item, itemIndex) => {
								const currentIndex =
									startIndex + previousItemsCount + itemIndex;

								return (
									<SearchResultRow
										key={`${item.type}-${item.id}`}
										item={item}
										active={activeIndex === currentIndex}
										onSelect={onSelect}
									/>
								);
							})}
						</div>
					</section>
				);
			})}
		</div>
	);
}

export function GlobalSearch({
	workspaceId,
	disabled = false,
}: {
	workspaceId: string | null;
	disabled?: boolean;
}) {
	const [isOpen, setIsOpen] = useState(false);
	const [query, setQuery] = useState("");
	const [activeIndex, setActiveIndex] = useState(0);
	const [recentSearches, setRecentSearches] = useState<string[]>(() =>
		loadRecentSearches(),
	);
	const inputRef = useRef<HTMLInputElement | null>(null);
	const debouncedQuery = useDebouncedValue(query, 180);
	const { data, isFetching } = useWorkspaceSearch(workspaceId, debouncedQuery);
	const commands = useWorkspaceCommands(workspaceId, query);
	const {
		openTaskModal,
		setActiveProjectId,
		setShowSettings,
		setShowActivityExplorer,
	} = useUIStore();

	const visibleGroups = useMemo(() => data?.groups || [], [data?.groups]);
	const flatResults = useMemo(
		() => visibleGroups.flatMap((group) => group.items),
		[visibleGroups],
	);
	const paletteItems = useMemo<PaletteItem[]>(
		() => [
			...commands.map((command) => ({ kind: "command" as const, command })),
			...flatResults.map((item) => ({ kind: "result" as const, item })),
		],
		[commands, flatResults],
	);
	const hasQuery = query.trim().length > 0;

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
				event.preventDefault();
				if (!disabled && workspaceId) setIsOpen(true);
			}
		};

		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [disabled, workspaceId]);

	useEffect(() => {
		if (!isOpen) return;
		const timeout = window.setTimeout(() => inputRef.current?.focus(), 20);
		return () => window.clearTimeout(timeout);
	}, [isOpen]);

	const rememberSearch = (value: string) => {
		const cleanValue = value.trim();
		if (!cleanValue) return;
		const next = [
			cleanValue,
			...recentSearches.filter(
				(item) => item.toLowerCase() !== cleanValue.toLowerCase(),
			),
		].slice(0, RECENT_SEARCH_LIMIT);
		setRecentSearches(next);
		storeRecentSearches(next);
	};

	const updateQuery = (value: string) => {
		setQuery(value);
		setActiveIndex(0);
	};

	const close = () => {
		setIsOpen(false);
		setQuery("");
		setActiveIndex(0);
	};

	const selectResult = (item: SearchResultItem) => {
		rememberSearch(query);

		if (item.type === "task") {
			openTaskModal(item.id);
		} else if (item.type === "project") {
			setActiveProjectId(item.id);
		} else if (item.type === "comment" && item.parentId) {
			openTaskModal(item.parentId);
		} else if (item.type === "member") {
			setShowSettings(true);
		} else if (item.type === "activity") {
			setShowActivityExplorer(true);
		}

		close();
	};

	const selectCommand = (command: WorkspaceCommand) => {
		if (command.disabled) return;
		rememberSearch(query);
		command.run();
		close();
	};

	const selectPaletteItem = (item: PaletteItem | undefined) => {
		if (!item) return;
		if (item.kind === "command") selectCommand(item.command);
		else selectResult(item.item);
	};

	const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === "Escape") {
			event.preventDefault();
			close();
			return;
		}

		if (event.key === "ArrowDown") {
			event.preventDefault();
			setActiveIndex((current) =>
				paletteItems.length === 0 ? 0 : (current + 1) % paletteItems.length,
			);
			return;
		}

		if (event.key === "ArrowUp") {
			event.preventDefault();
			setActiveIndex((current) =>
				paletteItems.length === 0
					? 0
					: (current - 1 + paletteItems.length) % paletteItems.length,
			);
			return;
		}

		if (event.key === "Enter") {
			if (paletteItems[activeIndex]) {
				event.preventDefault();
				selectPaletteItem(paletteItems[activeIndex]);
			} else {
				rememberSearch(query);
			}
		}
	};

	const dialog =
		isOpen && typeof document !== "undefined" && document.body
			? createPortal(
					<div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-3 py-[8dvh] sm:px-4">
						<div className="flex max-h-[84dvh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-surface-800 bg-surface-950 shadow-(--ot-shadow-panel) animate-scale-in">
							<div className="flex items-center gap-3 border-b border-surface-900 px-4 py-3">
								<Search className="h-4 w-4 shrink-0 text-primary-300" />
								<input
									ref={inputRef}
									value={query}
									onChange={(event) => updateQuery(event.target.value)}
									onKeyDown={handleKeyDown}
									placeholder="Search or run a command"
									className="min-h-11 min-w-0 flex-1 bg-transparent text-sm font-medium text-surface-100 outline-none placeholder:text-surface-600"
								/>
								{isFetching ? (
									<Loader2 className="h-4 w-4 animate-spin text-surface-500" />
								) : null}
								<Button
									variant="ghost"
									size="icon"
									onClick={close}
									title="Close search"
									className="h-9 w-9"
								>
									<X className="h-4 w-4" />
								</Button>
							</div>

							<div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
								{!hasQuery ? (
									<div className="space-y-4">
										<CommandGroup
											commands={commands}
											activeIndex={activeIndex}
											onSelect={selectCommand}
										/>

										{recentSearches.length > 0 && (
											<section className="space-y-2">
												<p className="ot-label px-1">Recent searches</p>
												<div className="space-y-1">
													{recentSearches.map((recent) => (
														<button
															key={recent}
															type="button"
															onClick={() => updateQuery(recent)}
															className="flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium text-surface-300 hover:bg-surface-900/70"
														>
															<Clock3 className="h-4 w-4 text-surface-600" />
															<span className="truncate">{recent}</span>
														</button>
													))}
												</div>
											</section>
										)}
									</div>
								) : isFetching && paletteItems.length === 0 ? (
									<div className="flex min-h-48 items-center justify-center gap-2 text-sm font-medium text-surface-500">
										<Loader2 className="h-4 w-4 animate-spin" />
										Searching workspace
									</div>
								) : paletteItems.length === 0 ? (
									<div className="rounded-xl border border-dashed border-surface-900 px-4 py-10 text-center">
										<Search className="mx-auto mb-3 h-5 w-5 text-surface-700" />
										<p className="text-sm font-semibold text-surface-300">
											No results found
										</p>
										<p className="mt-1 text-xs text-surface-600">
											Try a task title, project name, teammate, or event type.
										</p>
									</div>
								) : (
									<div className="space-y-4">
										<CommandGroup
											commands={commands}
											activeIndex={activeIndex}
											onSelect={selectCommand}
										/>
										<ResultGroups
											groups={visibleGroups}
											activeIndex={activeIndex}
											startIndex={commands.length}
											onSelect={selectResult}
										/>
									</div>
								)}
							</div>

							<div className="hidden items-center justify-between border-t border-surface-900 px-4 py-2 text-[11px] font-medium text-surface-600 sm:flex">
								<span>Arrow keys to move</span>
								<span className="inline-flex items-center gap-1">
									<CornerDownLeft className="h-3 w-3" />
									Open
								</span>
								<span>Esc to close</span>
							</div>
						</div>
					</div>,
					document.body,
				)
			: null;

	return (
		<>
			<Button
				variant="ghost"
				size="icon"
				onClick={() => setIsOpen(true)}
				disabled={disabled || !workspaceId}
				title="Command menu (Ctrl+K)"
				className="text-surface-400 transition-colors hover:bg-surface-900 hover:text-surface-100"
			>
				<Command className="h-4 w-4" />
			</Button>
			{dialog}
		</>
	);
}
