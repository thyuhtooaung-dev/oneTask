import { formatBytes } from "@/lib/utils/format";
import { Avatar } from "@/shared/ui/avatar/Avatar";
import { Badge } from "@/shared/ui/badge/Badge";
import { Button } from "@/shared/ui/button/Button";
import { ConfirmDialog } from "@/shared/ui/dialog/ConfirmDialog";
import {
	Download,
	FileArchive,
	FileAudio,
	FileIcon,
	FileText,
	FileVideo,
	Folder,
	Image as ImageIcon,
	Loader2,
	Trash2,
	UploadCloud,
} from "lucide-react";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import {
	type FileAttachment,
	useDeleteFile,
	useProjectFiles,
	useUploadFile,
} from "../hooks/useFilesData";

interface WorkspaceFilesProps {
	workspaceId: string;
	projectId: string;
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

export function WorkspaceFiles({
	workspaceId,
	projectId,
}: WorkspaceFilesProps) {
	const { data: files = [], isLoading } = useProjectFiles(
		workspaceId,
		projectId,
	);
	const uploadFile = useUploadFile(workspaceId, projectId);
	const deleteFile = useDeleteFile(workspaceId, projectId);

	const [folderInput, setFolderInput] = useState("/");
	const [fileToDelete, setFileToDelete] = useState<string | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);

	const onDrop = async (acceptedFiles: File[]) => {
		setIsUploading(true);
		for (let i = 0; i < acceptedFiles.length; i++) {
			await uploadFile.mutateAsync({
				file: acceptedFiles[i],
				folder: folderInput,
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
		maxSize: 50 * 1024 * 1024, // 50MB
	});

	if (isLoading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary-500" />
			</div>
		);
	}

	// Group files by folder
	const groupedFiles = files.reduce(
		(acc, file) => {
			const folder = file.folder || "/";
			if (!acc[folder]) acc[folder] = [];
			acc[folder].push(file);
			return acc;
		},
		{} as Record<string, FileAttachment[]>,
	);

	return (
		<div className="space-y-6">
			{/* Upload Section */}
			<div className="rounded-xl border border-surface-800/60 bg-surface-900/40 p-5 backdrop-blur-xl">
				<div className="mb-4">
					<label
						htmlFor="folder-input"
						className="text-xs font-semibold text-surface-400"
					>
						Upload to Folder
					</label>
					<div className="mt-1 flex items-center gap-2">
						<Folder className="h-4 w-4 text-primary-400" />
						<input
							id="folder-input"
							type="text"
							value={folderInput}
							onChange={(e) => setFolderInput(e.target.value)}
							className="ot-input w-full max-w-sm px-3 py-1.5 text-sm"
							placeholder="e.g. /designs, /invoices, /"
						/>
					</div>
				</div>

				<div
					{...getRootProps()}
					className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
						isDragActive
							? "border-primary-500 bg-primary-500/10"
							: "border-surface-800 bg-surface-950/50 hover:border-surface-700 hover:bg-surface-900/50"
					}`}
				>
					<input {...getInputProps()} />
					<UploadCloud
						className={`mb-3 h-10 w-10 ${isDragActive ? "text-primary-400" : "text-surface-600"}`}
					/>
					<p className="text-sm font-medium text-surface-200">
						{isDragActive
							? "Drop files here..."
							: "Click or drag files to upload"}
					</p>
					<p className="mt-1 text-xs text-surface-500">Max size 50MB</p>
					{isUploading && (
						<div className="w-full max-w-xs mt-4">
							<div className="flex justify-between text-xs text-surface-400 mb-1">
								<span>Uploading...</span>
								<span>{Math.round(uploadProgress)}%</span>
							</div>
							<div className="h-1.5 w-full bg-surface-800 rounded-full overflow-hidden">
								<div
									className="h-full bg-primary-500 transition-all duration-300"
									style={{ width: `${uploadProgress}%` }}
								/>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* File List */}
			{Object.keys(groupedFiles).length === 0 ? (
				<div className="rounded-xl border border-dashed border-surface-800 py-12 text-center">
					<p className="text-sm font-medium text-surface-500">
						No files uploaded yet.
					</p>
				</div>
			) : (
				Object.entries(groupedFiles).map(([folder, folderFiles]) => (
					<div key={folder} className="space-y-3">
						<h3 className="flex items-center gap-2 font-semibold text-surface-100">
							<Folder className="h-5 w-5 text-primary-400" />
							{folder}
							<Badge tone="neutral" className="ml-2">
								{folderFiles.length}
							</Badge>
						</h3>
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
							{folderFiles.map((file) => {
								const Icon = getFileIcon(file.mimetype);

								return (
									<div
										key={file.id}
										className="group flex flex-col justify-between rounded-lg border border-surface-800/80 bg-surface-950/60 p-4 transition-colors hover:border-surface-700"
									>
										<div className="flex items-start gap-3">
											<div className="rounded-lg bg-surface-900 p-2">
												<Icon className="h-6 w-6 text-primary-400" />
											</div>
											<div className="min-w-0 flex-1">
												<p
													className="truncate text-sm font-medium text-surface-200"
													title={file.originalName}
												>
													{file.originalName}
												</p>
												<p className="mt-0.5 text-xs text-surface-500">
													{formatBytes(Number(file.size))} •{" "}
													{new Date(file.createdAt).toLocaleDateString()}
												</p>
											</div>
										</div>
										<div className="mt-4 flex items-center justify-between">
											<div className="flex items-center gap-2">
												{file.uploader && (
													<Avatar
														name={file.uploader.name}
														email={file.uploader.email}
														size="sm"
													/>
												)}
												<span className="truncate text-xs text-surface-500">
													{file.uploader?.name || "Unknown"}
												</span>
											</div>
											<div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
												<Button
													variant="ghost"
													size="icon"
													className="h-7 w-7 text-surface-400 hover:text-primary-400"
													onClick={() => handleDownload(file)}
													title="Download"
												>
													<Download className="h-3.5 w-3.5" />
												</Button>
												<Button
													variant="ghost"
													size="icon"
													className="h-7 w-7 text-surface-400 hover:text-danger-400"
													onClick={() => setFileToDelete(file.id)}
													title="Delete"
												>
													<Trash2 className="h-3.5 w-3.5" />
												</Button>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</div>
				))
			)}

			<ConfirmDialog
				open={!!fileToDelete}
				title="Delete attachment"
				description="This attachment will be permanently removed from the workspace."
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
