"use client";

import { DropdownMenu } from "@/shared/ui/dropdown-menu/DropdownMenu";
import { formatDistanceToNow } from "date-fns";
import { ChevronDown, Filter, Loader2, Search } from "lucide-react";
import { useState } from "react";
import { ActivityEventCard } from "../components/ActivityEventCard";
import { getActivityIcon } from "../components/ActivityTimeline";
import { useActivities } from "../hooks/useActivityData";
import { useWorkspaceDetail } from "../hooks/useWorkspaceData";

export function WorkspaceEventExplorer({
	workspaceId,
}: {
	workspaceId: string;
}) {
	const [typeFilter, setTypeFilter] = useState<string>("");
	const [actorFilter, setActorFilter] = useState<string>("");
	const [searchQuery, setSearchQuery] = useState("");

	const { data: workspace } = useWorkspaceDetail(workspaceId);
	const { data: activities = [], isLoading } = useActivities(workspaceId, {
		type: typeFilter || undefined,
		actorId: actorFilter || undefined,
		limit: 100,
	});

	const filteredActivities = activities.filter((event) => {
		if (!searchQuery) return true;
		const query = searchQuery.toLowerCase();
		const title =
			(event.metadata?.taskTitle as string) ||
			(event.metadata?.workspaceName as string) ||
			(event.metadata?.projectName as string) ||
			"";
		const actorName = event.actor?.name || event.actor?.email || "";
		return (
			title.toLowerCase().includes(query) ||
			actorName.toLowerCase().includes(query) ||
			event.type.toLowerCase().includes(query)
		);
	});

	return (
		<div className="space-y-6 animate-fade-in">
			<div className="flex flex-col gap-4 rounded-2xl border border-zinc-900 bg-zinc-950/45 p-4 md:p-5">
				<div>
					<p className="ot-label">Event OS</p>
					<h2 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-100">
						Event Explorer
					</h2>
					<p className="mt-1 text-sm leading-6 text-zinc-500">
						Explore all activities and mutations in this workspace.
					</p>
				</div>

				<div className="flex flex-col md:flex-row md:items-center gap-3 mt-4">
					<div className="relative w-full md:max-w-xs shrink-0">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
						<input
							type="text"
							placeholder="Search events..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="ot-input h-10 w-full pl-9 pr-3 text-sm"
						/>
					</div>

					<div className="flex flex-wrap items-center gap-2 w-auto xl:flex-nowrap">
						<div className="hidden sm:flex items-center gap-1.5 px-2 text-xs font-semibold text-zinc-500 shrink-0">
							<Filter className="h-3.5 w-3.5" />
							Filters:
						</div>

						<DropdownMenu.Root>
							<DropdownMenu.Trigger asChild>
								<button
									type="button"
									className="ot-input flex h-10 w-full sm:w-[140px] shrink-0 items-center justify-between gap-3 px-3 text-left text-sm font-medium"
								>
									<span className="truncate text-zinc-100">
										{typeFilter === ""
											? "All Types"
											: typeFilter.charAt(0).toUpperCase() +
												typeFilter.slice(1)}
									</span>
									<ChevronDown className="h-4 w-4 shrink-0 text-zinc-600" />
								</button>
							</DropdownMenu.Trigger>
							<DropdownMenu.Content
								align="start"
								className="w-(--radix-dropdown-menu-trigger-width) sm:w-[140px]"
							>
								<DropdownMenu.Label>Event Type</DropdownMenu.Label>
								<DropdownMenu.RadioGroup
									value={typeFilter}
									onValueChange={setTypeFilter}
								>
									<DropdownMenu.RadioItem value="">
										All Types
									</DropdownMenu.RadioItem>
									<DropdownMenu.RadioItem value="task">
										Tasks
									</DropdownMenu.RadioItem>
									<DropdownMenu.RadioItem value="comment">
										Comments
									</DropdownMenu.RadioItem>
									<DropdownMenu.RadioItem value="member">
										Members
									</DropdownMenu.RadioItem>
									<DropdownMenu.RadioItem value="project">
										Projects
									</DropdownMenu.RadioItem>
								</DropdownMenu.RadioGroup>
							</DropdownMenu.Content>
						</DropdownMenu.Root>

						<DropdownMenu.Root>
							<DropdownMenu.Trigger asChild>
								<button
									type="button"
									className="ot-input flex h-10 w-full sm:w-[160px] shrink-0 items-center justify-between gap-3 px-3 text-left text-sm font-medium"
								>
									<span className="truncate text-zinc-100">
										{actorFilter === ""
											? "All Members"
											: workspace?.members.find((m) => m.userId === actorFilter)
													?.user.name ||
												workspace?.members.find((m) => m.userId === actorFilter)
													?.user.email ||
												"Unknown"}
									</span>
									<ChevronDown className="h-4 w-4 shrink-0 text-zinc-600" />
								</button>
							</DropdownMenu.Trigger>
							<DropdownMenu.Content
								align="start"
								className="w-(--radix-dropdown-menu-trigger-width) sm:w-[160px] max-h-[300px]"
							>
								<DropdownMenu.Label>Member</DropdownMenu.Label>
								<DropdownMenu.RadioGroup
									value={actorFilter}
									onValueChange={setActorFilter}
								>
									<DropdownMenu.RadioItem value="">
										All Members
									</DropdownMenu.RadioItem>
									{workspace?.members.map((m) => (
										<DropdownMenu.RadioItem key={m.userId} value={m.userId}>
											<span className="truncate">
												{m.user.name || m.user.email}
											</span>
										</DropdownMenu.RadioItem>
									))}
								</DropdownMenu.RadioGroup>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					</div>
				</div>
			</div>

			<div className="rounded-2xl border border-zinc-900 bg-zinc-950/45 p-5 lg:p-6">
				{isLoading ? (
					<div className="flex items-center justify-center py-12 text-sm text-zinc-500 gap-2">
						<Loader2 className="h-4 w-4 animate-spin" />
						Loading events...
					</div>
				) : filteredActivities.length === 0 ? (
					<div className="text-center py-12">
						<p className="text-zinc-500 text-sm">
							No events found matching your filters.
						</p>
					</div>
				) : (
					<div className="pl-2 flex flex-col gap-4">
						{filteredActivities.map((event) => {
							const { icon, title, detail, tone } = getActivityIcon(event);

							let statusTransition: { from: string; to: string } | undefined;
							if (event.type === "task.updated" && event.metadata?.changes) {
								const changes = event.metadata.changes as {
									status?: { from: string; to: string };
								};
								if (changes.status) {
									statusTransition = {
										from: changes.status.from,
										to: changes.status.to,
									};
								}
							}

							return (
								<ActivityEventCard
									key={event.id}
									actorName={event.actor?.name}
									actorEmail={event.actor?.email}
									title={title}
									detail={detail}
									time={formatDistanceToNow(new Date(event.createdAt), {
										addSuffix: true,
									})}
									icon={icon}
									iconTone={tone}
									statusTransition={statusTransition}
								/>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}
