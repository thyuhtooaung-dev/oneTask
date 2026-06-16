import { formatBytes } from "@/lib/utils/format";
import { Avatar } from "@/shared/ui/avatar/Avatar";
import { Badge } from "@/shared/ui/badge/Badge";
import { Button } from "@/shared/ui/button/Button";
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

	const onDrop = async (acceptedFiles: File[]) => {
		for (const file of acceptedFiles) {
			await uploadFile.mutateAsync({ file, folder: folderInput });
		}
	};

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		maxSize: 50 * 1024 * 1024, // 50MB
	});

	if (isLoading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-violet-500" />
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
			<div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-5 backdrop-blur-xl">
				<div className="mb-4">
					<label
						htmlFor="folder-input"
						className="text-xs font-semibold text-zinc-400"
					>
						Upload to Folder
					</label>
					<div className="mt-1 flex items-center gap-2">
						<Folder className="h-4 w-4 text-violet-400" />
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
							? "border-violet-500 bg-violet-500/10"
							: "border-zinc-800 bg-zinc-950/50 hover:border-zinc-700 hover:bg-zinc-900/50"
					}`}
				>
					<input {...getInputProps()} />
					<UploadCloud
						className={`mb-3 h-10 w-10 ${isDragActive ? "text-violet-400" : "text-zinc-600"}`}
					/>
					<p className="text-sm font-medium text-zinc-200">
						{isDragActive
							? "Drop files here..."
							: "Click or drag files to upload"}
					</p>
					<p className="mt-1 text-xs text-zinc-500">Max size 50MB</p>
				</div>
			</div>

			{/* File List */}
			{Object.keys(groupedFiles).length === 0 ? (
				<div className="rounded-xl border border-dashed border-zinc-800 py-12 text-center">
					<p className="text-sm font-medium text-zinc-500">
						No files uploaded yet.
					</p>
				</div>
			) : (
				Object.entries(groupedFiles).map(([folder, folderFiles]) => (
					<div key={folder} className="space-y-3">
						<h3 className="flex items-center gap-2 font-semibold text-zinc-100">
							<Folder className="h-5 w-5 text-violet-400" />
							{folder}
							<Badge tone="neutral" className="ml-2">
								{folderFiles.length}
							</Badge>
						</h3>
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
							{folderFiles.map((file) => {
								const Icon = getFileIcon(file.mimetype);
								// Assuming the server is running on localhost:5000 in dev
								// A proper production setup would use a dynamic base URL
								const fileUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/uploads/${file.filename}`;

								return (
									<div
										key={file.id}
										className="group flex flex-col justify-between rounded-lg border border-zinc-800/80 bg-zinc-950/60 p-4 transition-colors hover:border-zinc-700"
									>
										<div className="flex items-start gap-3">
											<div className="rounded-lg bg-zinc-900 p-2">
												<Icon className="h-6 w-6 text-violet-400" />
											</div>
											<div className="min-w-0 flex-1">
												<p
													className="truncate text-sm font-medium text-zinc-200"
													title={file.originalName}
												>
													{file.originalName}
												</p>
												<p className="mt-0.5 text-xs text-zinc-500">
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
												<span className="truncate text-xs text-zinc-500">
													{file.uploader?.name || "Unknown"}
												</span>
											</div>
											<div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
												<Button
													variant="ghost"
													size="icon"
													className="h-7 w-7 text-zinc-400 hover:text-violet-400"
													onClick={() => window.open(fileUrl, "_blank")}
													title="Download"
												>
													<Download className="h-3.5 w-3.5" />
												</Button>
												<Button
													variant="ghost"
													size="icon"
													className="h-7 w-7 text-zinc-400 hover:text-red-400"
													onClick={() => {
														if (
															confirm(
																"Are you sure you want to delete this file?",
															)
														) {
															deleteFile.mutate(file.id);
														}
													}}
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
		</div>
	);
}
