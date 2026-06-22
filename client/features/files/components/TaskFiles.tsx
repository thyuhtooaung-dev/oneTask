import { formatBytes } from "@/lib/utils/format";
import { Button } from "@/shared/ui/button/Button";
import { ConfirmDialog } from "@/shared/ui/dialog/ConfirmDialog";
import {
	Download,
	FileArchive,
	FileAudio,
	FileIcon,
	FileText,
	FileVideo,
	Image as ImageIcon,
	Loader2,
	Maximize2,
	Trash2,
	UploadCloud,
	X,
} from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";
import { useDropzone } from "react-dropzone";
import {
	type FileAttachment,
	useDeleteFile,
	useTaskFiles,
	useUploadFile,
} from "../hooks/useFilesData";

interface TaskFilesProps {
	workspaceId: string;
	projectId: string;
	taskId: string;
	canEdit?: boolean;
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

export function TaskFiles({
	workspaceId,
	projectId,
	taskId,
	canEdit = true,
}: TaskFilesProps) {
	const { data: files = [], isLoading } = useTaskFiles(
		workspaceId,
		projectId,
		taskId,
	);
	const uploadFile = useUploadFile(workspaceId, projectId);
	const deleteFile = useDeleteFile(workspaceId, projectId);
	const [selectedImage, setSelectedImage] = useState<string | null>(null);
	const [fileToDelete, setFileToDelete] = useState<string | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);

	const onDrop = async (acceptedFiles: File[]) => {
		setIsUploading(true);
		for (let i = 0; i < acceptedFiles.length; i++) {
			await uploadFile.mutateAsync({
				file: acceptedFiles[i],
				taskId,
				folder: "tasks",
				onProgress: (p) => {
					const fileProgress = p / acceptedFiles.length;
					const previousFilesProgress = (i / acceptedFiles.length) * 100;
					setUploadProgress(previousFilesProgress + fileProgress);
				},
			});
		}
		setIsUploading(false);
		setUploadProgress(0);
	};

	const handleDownload = async (file: FileAttachment) => {
		if (!file.fileUrl) return;
		try {
			const response = await fetch(file.fileUrl);
			const blob = await response.blob();
			const blobUrl = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = blobUrl;
			a.download = file.originalName;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(blobUrl);
		} catch {
			// Fallback: open directly
			window.open(file.fileUrl, "_blank");
		}
	};

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		maxSize: 50 * 1024 * 1024, // 50MB limit
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
				<div className="flex flex-wrap gap-3">
					{files.map((file) => {
						const Icon = getFileIcon(file.mimetype);
						const fileUrl = file.fileUrl || "";

						return (
							<div key={file.id} className="w-full sm:w-auto">
								{file.mimetype.startsWith("image/") ? (
									<div className="group relative overflow-hidden rounded-md border border-zinc-800/80 bg-zinc-950/60 w-24 h-24 shrink-0">
										<button
											type="button"
											onClick={() => setSelectedImage(fileUrl)}
											className="w-full h-full relative block cursor-zoom-in"
											title={file.originalName}
										>
											<img
												src={fileUrl}
												alt={file.originalName}
												className="w-full h-full object-cover bg-zinc-900"
											/>
											<div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20 flex items-center justify-center">
												<Maximize2 className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
											</div>
										</button>
										<div className="absolute -top-1 -right-1 opacity-0 transition-opacity group-hover:opacity-100 flex gap-1">
											<button
												type="button"
												className="bg-violet-500 rounded-full p-1 text-white shadow-md hover:bg-violet-600 transition-colors m-2"
												onClick={(e) => {
													e.stopPropagation();
													handleDownload(file);
												}}
												title="Download"
											>
												<Download className="h-3 w-3" />
											</button>
											{canEdit && (
												<button
													type="button"
													className="bg-red-500 rounded-full p-1 text-white shadow-md hover:bg-red-600 transition-colors m-2"
													onClick={(e) => {
														e.stopPropagation();
														setFileToDelete(file.id);
													}}
													title="Delete"
												>
													<Trash2 className="h-3 w-3" />
												</button>
											)}
										</div>
									</div>
								) : (
									<div className="group flex items-center justify-between rounded-md border border-zinc-800/80 bg-zinc-950/60 p-2 transition-colors hover:border-zinc-700 w-full">
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
												onClick={() => handleDownload(file)}
												title="Download"
											>
												<Download className="h-3 w-3" />
											</Button>
											{canEdit && (
												<Button
													variant="ghost"
													size="icon"
													className="h-6 w-6 text-zinc-400 hover:bg-red-500/10 hover:text-red-400"
													onClick={() => setFileToDelete(file.id)}
													title="Delete"
												>
													<Trash2 className="h-3 w-3" />
												</Button>
											)}
										</div>
									</div>
								)}
							</div>
						);
					})}
				</div>
			)}

			{canEdit && (
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
						{isDragActive ? "Drop file here" : "Attach file"}
					</p>
					{isUploading && (
						<div className="w-full max-w-xs mt-4">
							<div className="flex justify-between text-xs text-zinc-400 mb-1">
								<span>Uploading...</span>
								<span>{Math.round(uploadProgress)}%</span>
							</div>
							<div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
								<div
									className="h-full bg-violet-500 transition-all duration-300"
									style={{ width: `${uploadProgress}%` }}
								/>
							</div>
						</div>
					)}
				</div>
			)}

			{typeof document !== "undefined" &&
				selectedImage &&
				createPortal(
					<div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 outline-none animate-in zoom-in-95 duration-200">
						<div
							className="fixed inset-0 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
							onClick={() => setSelectedImage(null)}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") {
									setSelectedImage(null);
								}
							}}
						/>
						<div className="relative max-h-full max-w-full flex flex-col items-center justify-center pointer-events-none z-10">
							<img
								src={selectedImage}
								alt="Attachment preview"
								className="max-h-[85vh] max-w-[90vw] object-contain rounded-md shadow-2xl pointer-events-auto"
							/>
							<button
								type="button"
								onClick={() => setSelectedImage(null)}
								className="absolute -top-12 right-0 rounded-full bg-zinc-800/80 p-2 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors pointer-events-auto"
								aria-label="Close viewer"
							>
								<X className="h-5 w-5" />
							</button>
						</div>
					</div>,
					document.body,
				)}

			<ConfirmDialog
				open={!!fileToDelete}
				title="Delete attachment"
				description="This attachment will be permanently removed from the task."
				confirmLabel="Delete"
				isDanger
				isLoading={deleteFile.isPending}
				confirmIcon={<Trash2 className="h-4 w-4" />}
				onConfirm={() => {
					if (fileToDelete) {
						deleteFile.mutate(fileToDelete, {
							onSuccess: () => setFileToDelete(null),
						});
					}
				}}
				onClose={() => setFileToDelete(null)}
			/>
		</div>
	);
}
