"client-only";

import { fetchWithAuth } from "./fetch-with-auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type MediaCategory =
  | "avatar"
  | "lesson_image"
  | "lesson_audio"
  | "recording";

export interface RequestUploadUrlInput {
  category: MediaCategory;
  contentType: string;
  contentLength: number;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  objectKey: string;
  mediaId: number;
  expiresInSeconds: number;
}

export interface MediaObject {
  id: number;
  url: string;
  sizeBytes: number;
  width: number;
  height: number;
  durationMs: number;
  category: string;
  contentType: string;
}

type RawUploadUrl = {
  upload_url?: string;
  uploadUrl?: string;
  object_key?: string;
  objectKey?: string;
  media_id?: number | string;
  mediaId?: number | string;
  expires_in_seconds?: number | string;
  expiresInSeconds?: number | string;
};

type RawMediaObject = {
  id?: number | string;
  url?: string;
  size_bytes?: number;
  sizeBytes?: number;
  width?: number;
  height?: number;
  duration_ms?: number;
  durationMs?: number;
  category?: string;
  content_type?: string;
  contentType?: string;
};

function toNumber(value: number | string | undefined, fallback = 0): number {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value !== "") {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}

function normalizeUploadUrl(raw: RawUploadUrl): UploadUrlResponse {
  return {
    uploadUrl: raw.uploadUrl ?? raw.upload_url ?? "",
    objectKey: raw.objectKey ?? raw.object_key ?? "",
    mediaId: toNumber(raw.mediaId ?? raw.media_id),
    expiresInSeconds: toNumber(raw.expiresInSeconds ?? raw.expires_in_seconds),
  };
}

function normalizeMediaObject(raw: RawMediaObject): MediaObject {
  return {
    id: toNumber(raw.id),
    url: raw.url ?? "",
    sizeBytes: raw.sizeBytes ?? raw.size_bytes ?? 0,
    width: raw.width ?? 0,
    height: raw.height ?? 0,
    durationMs: raw.durationMs ?? raw.duration_ms ?? 0,
    category: raw.category ?? "",
    contentType: raw.contentType ?? raw.content_type ?? "",
  };
}

async function mediaRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  return fetchWithAuth<T>(`${API_URL}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
}

/** POST /v1/media/upload-url — presigned PUT + object key. */
export async function requestUploadUrl(
  input: RequestUploadUrlInput,
): Promise<UploadUrlResponse> {
  const raw = await mediaRequest<RawUploadUrl>("/v1/media/upload-url", {
    method: "POST",
    body: JSON.stringify({
      category: input.category,
      contentType: input.contentType,
      contentLength: input.contentLength,
    }),
  });
  return normalizeUploadUrl(raw);
}

/** PUT file directly to presigned URL (R2/S3). */
export async function uploadToPresignedUrl(
  uploadUrl: string,
  file: Blob,
  contentType: string,
): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: file,
  });
  if (!res.ok) {
    throw new Error(`Upload failed (${res.status})`);
  }
}

/** POST /v1/media/finalize — confirm object exists and return CDN metadata. */
export async function finalizeUpload(mediaId: number): Promise<MediaObject> {
  const raw = await mediaRequest<RawMediaObject>("/v1/media/finalize", {
    method: "POST",
    body: JSON.stringify({ mediaId }),
  });
  return normalizeMediaObject(raw);
}

export interface UploadedMedia {
  objectKey: string;
  media: MediaObject;
}

/**
 * Full media flow: upload-url → PUT file → finalize.
 * Returns object_key for profile avatar (and other category keys).
 */
export async function uploadMediaFile(
  file: File | Blob,
  category: MediaCategory,
  contentType = file instanceof File ? file.type : "application/octet-stream",
): Promise<UploadedMedia> {
  const contentLength = file.size;
  const { uploadUrl, objectKey, mediaId } = await requestUploadUrl({
    category,
    contentType,
    contentLength,
  });

  if (!uploadUrl || !objectKey) {
    throw new Error("Invalid upload-url response");
  }

  await uploadToPresignedUrl(uploadUrl, file, contentType);
  const media = await finalizeUpload(mediaId);
  return { objectKey, media };
}
