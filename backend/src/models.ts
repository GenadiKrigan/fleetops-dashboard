export type RobotStatus =
    | "idle"
    | "assigned"
    | "en_route"
    | "delivering"
    | "completed";

export type MissionStatus =
    | "queued"
    | "assigned"
    | "en_route"
    | "delivering"
    | "completed"
    | "cancelled";

export interface Robot {
    id: string;
    status: RobotStatus;
    currentMissionId: string | null;
}

export interface Mission {
    id: string;
    status: MissionStatus;
    robotId: string | null;
}