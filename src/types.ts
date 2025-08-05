export interface GetUserProfilePhotosResponse {
    ok: true;
    result: {
        total_count: number;
        photos: PhotoSize[][];
    };
}

export interface PhotoSize {
    file_id: string;
    file_unique_id: string;
    width: number;
    height: number;
    file_size?: number;
}

export interface GetFileResponse {
    ok: true;
    result: FileObject;
}

export interface FileObject {
    file_id: string;
    file_unique_id: string;
    file_size?: number;
    file_path?: string;
}
