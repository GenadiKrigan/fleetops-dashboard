export type RobotStatus =
    | "idle"
    | "assigned"
    | "en_route"
    | "delivering"
    | "completed";

export interface Robot {
    id: string;
    status: RobotStatus;
    currentMissionId: string | null;
}