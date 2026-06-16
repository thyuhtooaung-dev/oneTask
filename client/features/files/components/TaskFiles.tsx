import { formatBytes } from "@/lib/utils/format";
import { Button } from "@/shared/ui/button/Button";
import {
	Download,
	FileArchive,
	FileAudio,
	FileIcon,
	FileText,
	FileVideo,
	Image as ImageIcon,
	Loader2,
	Trash2,
	UploadCloud,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import {
	useDeleteFile,
	useTaskFiles,
	useUploadFile,
} from "../hooks/useFilesData";

interface TaskFilesProps {
	workspaceId: string;
	projectId: string;
	taskId: string;
}

const getFileIcon = (mimetype: string) => {
	if (mimetype.startsWith("image/")) return ImageIcon;
	if (mimetype.startsWith("video/")) return FileVideo;
	if (mimetype.startsWith("audio/")) return FileAudio;
	if (mimetype.includes("pdf") || mimetype.includes("document"))
		return FileText;
	if (
		mimetype.includes("zip") ||
		mimetype.includes("tar") ||
		mimetype.includes("rar")
	)
		return FileArchive;
	return FileIcon;
};

export function TaskFiles({ workspaceId, projectId, taskId }: TaskFilesProps) {
	const { data: files = [], isLoading } = useTaskFiles(
		workspaceId,
		projectId,
		taskId,
	);
	const uploadFile = useUploadFile(workspaceId, projectId);
	const deleteFile = useDeleteFile(workspaceId, projectId);

	const onDrop = async (acceptedFiles: File[]) => {
		for (const file of acceptedFiles) {
			await uploadFile.mutateAsync({ file, taskId, folder: "tasks" });
		}
	};

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		maxSize: 50 * 1024 * 1024, // 50MB
	});

	if (isLoading) {
		return (
			<div className="flex h-20 items-center justify-center">
				<Loader2 className="h-5 w-5 animate-spin text-violet-500" />
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<h4 className="text-sm font-semibold text-zinc-100">Attachments</h4>

			{files.length > 0 && (
				<div className="space-y-2">
					{files.map((file) => {
						const Icon = getFileIcon(file.mimetype);
						const fileUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/uploads/${file.filename}`;

						return (
							<div
								key={file.id}
								className="group flex items-center justify-between rounded-md border border-zinc-800/80 bg-zinc-950/60 p-2 transition-colors hover:border-zinc-700"
							>
								<div className="flex min-w-0 flex-1 items-center gap-3">
									<div className="rounded-md bg-zinc-900 p-1.5">
										<Icon className="h-4 w-4 text-violet-400" />
									</div>
									<div className="min-w-0 flex-1">
										<p
											className="truncate text-xs font-medium text-zinc-200"
											title={file.originalName}
										>
											{file.originalName}
										</p>
										<p className="text-[10px] text-zinc-500">
											{formatBytes(Number(file.size))}
										</p>
									</div>
								</div>
								<div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
									<Button
										variant="ghost"
										size="icon"
										className="h-6 w-6 text-zinc-400 hover:text-violet-400"
										onClick={() => window.open(fileUrl, "_blank")}
										title="Download"
									>
										<Download className="h-3 w-3" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										className="h-6 w-6 text-zinc-400 hover:text-red-400"
										onClick={() => {
											if (confirm("Delete this attachment?")) {
												deleteFile.mutate(file.id);
											}
										}}
										title="Delete"
									>
										<Trash2 className="h-3 w-3" />
									</Button>
								</div>
							</div>
						);
					})}
				</div>
			)}

			<div
				{...getRootProps()}
				className={`flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed p-4 transition-colors ${
					isDragActive
						? "border-violet-500 bg-violet-500/10"
						: "border-zinc-800 bg-zinc-950/50 hover:border-zinc-700 hover:bg-zinc-900/50"
				}`}
			>
				<input {...getInputProps()} />
				<UploadCloud
					className={`mb-2 h-5 w-5 ${isDragActive ? "text-violet-400" : "text-zinc-600"}`}
				/>
				<p className="text-xs font-medium text-zinc-300">
					{isDragActive ? "Drop here" : "Attach files"}
				</p>
			</div>
		</div>
	);
}
