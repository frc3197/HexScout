export interface RobotPhoto {
    id: string;
    teamNumber: number;
    mimeType: "image/jpeg";
    data: Uint8Array;
    createdAt: Date;
    uploaderUuid: string
}